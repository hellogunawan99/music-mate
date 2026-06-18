/**
 * Music Mate — yt-dlp backend helper
 *
 * Spawns the system-installed yt-dlp binary as a subprocess, streams progress
 * via callback, and returns the downloaded file as a Node Readable.
 *
 * Lives in src/lib so it can be imported from any API route.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

export type AudioFormat = "mp3" | "m4a" | "opus";
export type VideoFormat = "mp4" | "webm";
export type MediaKind = "audio" | "video";

export interface DownloadOptions {
  url: string;
  kind: MediaKind;
  format: AudioFormat | VideoFormat;
  /** Audio bitrate in kbps; ignored for video. */
  audioQualityKbps?: 128 | 192 | 320;
  /** Video max height (e.g. 720, 1080). Ignored for audio. */
  videoMaxHeight?: 720 | 1080 | 1440 | 2160;
  /** SponsorBlock segments to remove (YouTube only). */
  sponsorBlock?: Array<"sponsor" | "intro" | "outro" | "selfpromo">;
  /** Embed metadata + thumbnail into the output file. */
  embedMetadata?: boolean;
  /** Fetch all entries if URL is a playlist. */
  playlist?: boolean;
  onProgress?: (p: ProgressEvent) => void;
}

export interface ProgressEvent {
  /** Raw yt-dlp status line for debugging. */
  raw: string;
  /** Bytes downloaded so far (if known). */
  downloadedBytes?: number;
  /** Total bytes to download (if known). */
  totalBytes?: number;
  /** Speed in B/s (if known). */
  speedBps?: number;
  /** ETA in seconds (if known). */
  etaSec?: number;
  /** Percentage 0-100, only set once determinable. */
  percent?: number;
  /** When the postprocessor (ffmpeg) is running. */
  postprocessing?: boolean;
  /** Set when finished. */
  finished?: boolean;
  /** Filename of the produced file, when postprocessing finishes. */
  outputPath?: string;
}

export interface MetadataResult {
  id: string;
  title: string;
  uploader: string;
  durationSec: number;
  thumbnail: string | null;
  webpage_url: string;
  extractor: string;
  isPlaylist: boolean;
  entries?: MetadataResult[];
}

const YT_DLP_BIN = process.env.YT_DLP_BIN || "yt-dlp";

/* ------------------------------------------------------------------ */
/*  Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function fetchMetadata(url: string): Promise<MetadataResult> {
  const args = [
    "--dump-single-json",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    url,
  ];
  const { stdout, stderr } = await runYtdlp(args, { timeoutMs: 60_000 });
  if (!stdout.trim()) {
    throw new Error(`yt-dlp returned no output: ${stderr}`);
  }
  const json = JSON.parse(stdout);
  return normalizeMetadata(json);
}

function normalizeMetadata(raw: any): MetadataResult {
  if (raw._type === "playlist" || Array.isArray(raw.entries)) {
    return {
      id: raw.id ?? "",
      title: raw.title ?? "Playlist",
      uploader: raw.uploader ?? raw.channel ?? "",
      durationSec: 0,
      thumbnail: raw.thumbnails?.[0]?.url ?? null,
      webpage_url: raw.webpage_url ?? "",
      extractor: raw.extractor ?? "",
      isPlaylist: true,
      entries: (raw.entries ?? [])
        .filter((e: any) => e)
        .map((e: any) => normalizeMetadata({ ...e, _type: "video" })),
    };
  }
  return {
    id: raw.id ?? "",
    title: raw.title ?? "Untitled",
    uploader: raw.uploader ?? raw.channel ?? raw.creator ?? "",
    durationSec: Math.round(raw.duration ?? 0),
    thumbnail: pickBestThumb(raw.thumbnails),
    webpage_url: raw.webpage_url ?? raw.original_url ?? "",
    extractor: raw.extractor ?? "",
    isPlaylist: false,
  };
}

function pickBestThumb(thumbs: any[] | undefined): string | null {
  if (!Array.isArray(thumbs) || thumbs.length === 0) return null;
  const sorted = [...thumbs].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0) || (b.height ?? 0) - (a.height ?? 0),
  );
  return sorted[0]?.url ?? null;
}

/* ------------------------------------------------------------------ */
/*  Download                                                            */
/* ------------------------------------------------------------------ */

/**
 * Build the yt-dlp argument list for a download request.
 */
function buildArgs(opts: DownloadOptions, outTemplate: string): string[] {
  const args: string[] = [
    "--no-warnings",
    "--no-progress", // we parse "[download]" ourselves instead
    "--newline",
    "--no-colors",
    "-o",
    outTemplate,
    "--print",
    "after_move:FINAL_PATH=%(filepath)s",
  ];

  if (opts.playlist) {
    args.push("--yes-playlist");
  } else {
    args.push("--no-playlist");
  }

  if (opts.kind === "audio") {
    args.push(
      "-x", // extract audio
      "--audio-format",
      opts.format as string,
      "--audio-quality",
      `${opts.audioQualityKbps ?? 192}K`,
    );
    if (opts.format === "mp3") {
      args.push("--postprocessor-args", "ffmpeg:-id3v2_version 3");
    }
  } else {
    // Video
    const height = opts.videoMaxHeight ?? 1080;
    args.push(
      "-f",
      `bv*[height<=${height}]+ba[height<=${height}]/b[height<=${height}]`,
      "--merge-output-format",
      opts.format as string,
    );
  }

  if (opts.embedMetadata !== false) {
    args.push("--embed-metadata", "--embed-thumbnail");
  }

  if (opts.sponsorBlock && opts.sponsorBlock.length > 0) {
    args.push("--sponsorblock-remove", opts.sponsorBlock.join(","));
  }

  args.push(opts.url);
  return args;
}

/**
 * Parse one line of yt-dlp's stderr/stdout output into a ProgressEvent.
 * Examples:
 *   [download]  45.2% of   3.50MiB at    1.20MiB/s ETA 00:03
 *   [download] 100% of   3.50MiB in 00:02
 *   [ExtractAudio] Destination: /tmp/foo.mp3
 *   FINAL_PATH=/tmp/foo.mp3
 */
function parseProgressLine(line: string): ProgressEvent | null {
  if (line.startsWith("FINAL_PATH=")) {
    return { raw: line, finished: true, outputPath: line.slice("FINAL_PATH=".length) };
  }

  // Generic postprocessor (audio extraction, thumbnail embedding)
  if (
    line.startsWith("[ExtractAudio]") ||
    line.startsWith("[EmbedThumbnail]") ||
    line.startsWith("[Metadata]") ||
    line.startsWith("[Merger]")
  ) {
    return { raw: line, postprocessing: true };
  }

  if (!line.startsWith("[download]")) return null;

  // 100% done
  const doneMatch = /\[download\]\s+100%\s+of\s+~?\s*([0-9.]+)\s*(\S+)\s+in\s+(\S+)/.exec(line);
  if (doneMatch) {
    const total = parseSize(doneMatch[1], doneMatch[2]);
    return { raw: line, percent: 100, totalBytes: total, downloadedBytes: total };
  }

  // Active download
  const pctMatch = /\[download\]\s+([0-9.]+)%\s+of\s+~?\s*([0-9.]+)\s*(\S+)\s+at\s+([0-9.]+)?(\S*)\s*(?:ETA\s+(\S+))?/.exec(
    line,
  );
  if (pctMatch) {
    const percent = parseFloat(pctMatch[1]);
    const total = parseSize(pctMatch[2], pctMatch[3]);
    const speed = pctMatch[4] ? parseSize(pctMatch[4], pctMatch[5] || "B") : undefined;
    const eta = pctMatch[6] ? parseDuration(pctMatch[6]) : undefined;
    const downloaded = total !== undefined ? (total * percent) / 100 : undefined;
    return {
      raw: line,
      percent,
      totalBytes: total,
      downloadedBytes: downloaded,
      speedBps: speed,
      etaSec: eta,
    };
  }

  return { raw: line };
}

function parseSize(value: string, unit: string): number | undefined {
  const n = parseFloat(value);
  if (isNaN(n)) return undefined;
  const u = unit.toUpperCase();
  if (u.startsWith("KIB") || u === "K") return n * 1024;
  if (u.startsWith("MIB") || u === "M") return n * 1024 * 1024;
  if (u.startsWith("GIB") || u === "G") return n * 1024 * 1024 * 1024;
  if (u.startsWith("KB")) return n * 1000;
  if (u.startsWith("MB")) return n * 1000 * 1000;
  if (u.startsWith("GB")) return n * 1000 * 1000 * 1000;
  return n;
}

function parseDuration(s: string): number | undefined {
  // "00:03" or "01:23:45"
  const parts = s.split(":").map(Number);
  if (parts.some(isNaN)) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return undefined;
}

interface YtdlpRunOpts {
  timeoutMs?: number;
  onProgress?: (p: ProgressEvent) => void;
}

interface YtdlpRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run yt-dlp and capture stdout/stderr. Used for metadata fetches where we don't
 * need the file itself — just JSON output.
 */
function runYtdlp(args: string[], opts: YtdlpRunOpts = {}): Promise<YtdlpRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(YT_DLP_BIN, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = opts.timeoutMs
      ? setTimeout(() => {
          killed = true;
          child.kill("SIGKILL");
          reject(new Error(`yt-dlp timed out after ${opts.timeoutMs}ms`));
        }, opts.timeoutMs)
      : null;

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      stderr += text;
      if (opts.onProgress) {
        for (const line of text.split(/\r|\n/)) {
          if (!line.trim()) continue;
          const event = parseProgressLine(line);
          if (event) opts.onProgress(event);
        }
      }
    });
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      if (!killed) reject(err);
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (killed) return;
      resolve({ stdout, stderr, exitCode: code ?? -1 });
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Public download API                                                  */
/* ------------------------------------------------------------------ */

export interface DownloadHandle {
  /** Stream of the produced file (mp3/mp4/etc). */
  stream: ReadableStream<Uint8Array>;
  /** Suggested filename for Content-Disposition. */
  filename: string;
  /** MIME type. */
  contentType: string;
  /** Resolved final path on disk (after postprocessing). */
  finalPath: string;
}

/**
 * Run a full download + postprocess cycle and return a stream over the output file.
 * Uses a temp directory which is cleaned up after the stream ends.
 */
export async function downloadMedia(opts: DownloadOptions): Promise<DownloadHandle> {
  const tmpDir = await mkdtemp(join(tmpdir(), "music-mate-"));
  const ext = opts.format;
  const outTemplate = join(tmpDir, `%(title).200B.%(ext)s`);

  const args = buildArgs(opts, outTemplate);
  let finalPath: string | undefined;
  let lastError: string | undefined;

  await new Promise<void>((resolve, reject) => {
    const child = spawn(YT_DLP_BIN, args, { stdio: ["ignore", "pipe", "pipe"] });
    const handleLine = (line: string) => {
      const event = parseProgressLine(line);
      if (!event) return;
      if (event.finished && event.outputPath) finalPath = event.outputPath;
      if (opts.onProgress) opts.onProgress(event);
    };
    const consume = (chunk: Buffer, isStderr: boolean) => {
      const text = chunk.toString("utf8");
      if (isStderr) {
        // keep last 2KB for error reporting
        lastError = (lastError + text).slice(-2000);
      }
      for (const line of text.split(/\r|\n/)) {
        if (line.trim()) handleLine(line);
      }
    };
    child.stderr.on("data", (c) => consume(c, true));
    child.stdout.on("data", (c) => consume(c, false));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0 && finalPath) resolve();
      else
        reject(
          new Error(
            lastError ||
              `yt-dlp exited with code ${code}; check URL or network.`,
          ),
        );
    });
  });

  if (!finalPath) {
    throw new Error("Download finished but final path was not resolved.");
  }

  const filename = finalPath.split("/").pop() || `download.${ext}`;
  const contentType = mimeFor(opts.format);

  // Node Readable -> Web ReadableStream
  const nodeStream = createReadStream(finalPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  // Best-effort cleanup once the stream is drained.
  nodeStream.on("close", () => {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  return { stream: webStream, filename, contentType, finalPath };
}

function mimeFor(fmt: string): string {
  switch (fmt) {
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "opus":
      return "audio/ogg";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}
