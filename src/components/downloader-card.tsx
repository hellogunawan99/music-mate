"use client";

import * as React from "react";
import {
  Music,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { cn, formatBytes, formatDuration, formatSpeed } from "@/lib/utils";

export type DownloadPhase =
  | { kind: "idle" }
  | { kind: "fetching-metadata" }
  | { kind: "ready"; metadata: import("@/lib/yt-dlp").MetadataResult }
  | {
      kind: "downloading";
      percent?: number;
      downloadedBytes?: number;
      totalBytes?: number;
      speedBps?: number;
      etaSec?: number;
      postprocessing?: boolean;
    }
  | { kind: "complete"; filename: string; bytes?: number }
  | { kind: "error"; message: string };

export interface DownloaderCardProps {
  url: string;
  setUrl: (v: string) => void;
  kind: "audio" | "video";
  setKind: (v: "audio" | "video") => void;
  audioFormat: "mp3" | "m4a" | "opus";
  setAudioFormat: (v: "mp3" | "m4a" | "opus") => void;
  videoFormat: "mp4" | "webm";
  setVideoFormat: (v: "mp4" | "webm") => void;
  audioQuality: 128 | 192 | 320;
  setAudioQuality: (v: 128 | 192 | 320) => void;
  videoMaxHeight: 720 | 1080 | 1440 | 2160;
  setVideoMaxHeight: (v: 720 | 1080 | 1080 | 1440 | 2160) => void;
  sponsorBlock: boolean;
  setSponsorBlock: (v: boolean) => void;
  phase: DownloadPhase;
  onSubmit: () => void;
  onReset: () => void;
  onDownloadFile: (url: string, format: string) => void;
  disabled?: boolean;
}

/* lucide-react doesn't ship brand glyphs (YT/IG/TT/X) due to trademark
   concerns, so we render a colored badge per-platform instead of an icon. */
const PLATFORM_META: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  youtube: { label: "YT", bg: "bg-rose-600", fg: "text-white" },
  instagram: { label: "IG", bg: "bg-pink-600", fg: "text-white" },
  tiktok: { label: "TT", bg: "bg-zinc-900 dark:bg-zinc-100", fg: "text-white dark:text-zinc-900" },
  soundcloud: { label: "SC", bg: "bg-orange-500", fg: "text-white" },
  twitter: { label: "X", bg: "bg-zinc-900 dark:bg-zinc-100", fg: "text-white dark:text-zinc-900" },
  generic: { label: "•", bg: "bg-zinc-200 dark:bg-zinc-800", fg: "text-zinc-600 dark:text-zinc-400" },
};

function guessPlatform(url: string): keyof typeof PLATFORM_META {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  return "generic";
}

export function DownloaderCard(props: DownloaderCardProps) {
  const platform = guessPlatform(props.url);
  const plat = PLATFORM_META[platform];

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      {/* URL input */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-900">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          <span
            className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold",
              plat.bg,
              plat.fg,
            )}
            aria-hidden
          >
            {plat.label}
          </span>
          Paste a link from YouTube, Instagram, TikTok, SoundCloud, X, etc.
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={props.url}
            onChange={(e) => props.setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
            spellCheck={false}
            autoComplete="off"
            disabled={props.phase.kind === "downloading" || props.phase.kind === "fetching-metadata"}
          />
          <button
            onClick={props.onSubmit}
            disabled={
              !props.url.trim() ||
              props.phase.kind === "downloading" ||
              props.phase.kind === "fetching-metadata"
            }
            className={cn(
              "px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {props.phase.kind === "fetching-metadata" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching…
              </>
            ) : (
              <>Fetch</>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Powered by yt-dlp · 1,800+ sites supported · nothing leaves your machine except the public fetch to the source.
        </p>
      </div>

      {/* Format & quality */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
            Type
          </div>
          <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => props.setKind("audio")}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition-colors",
                props.kind === "audio"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              Audio
            </button>
            <button
              onClick={() => props.setKind("video")}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition-colors",
                props.kind === "video"
                  ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              Video
            </button>
          </div>
        </div>

        {props.kind === "audio" ? (
          <>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
                Format
              </div>
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
                {(["mp3", "m4a", "opus"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => props.setAudioFormat(f)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors uppercase",
                      props.audioFormat === f
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {props.audioFormat === "mp3" && (
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
                  Quality
                </div>
                <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
                  {[128, 192, 320].map((q) => (
                    <button
                      key={q}
                      onClick={() => props.setAudioQuality(q as 128 | 192 | 320)}
                      className={cn(
                        "px-4 py-1.5 text-sm rounded-md transition-colors",
                        props.audioQuality === q
                          ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                      )}
                    >
                      {q} kbps
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
                Format
              </div>
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
                {(["mp4", "webm"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => props.setVideoFormat(f)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors uppercase",
                      props.videoFormat === f
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">
                Max resolution
              </div>
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
                {[720, 1080, 1440, 2160].map((h) => (
                  <button
                    key={h}
                    onClick={() => props.setVideoMaxHeight(h as any)}
                    className={cn(
                      "px-4 py-1.5 text-sm rounded-md transition-colors",
                      props.videoMaxHeight === h
                        ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
                    )}
                  >
                    {h}p
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SponsorBlock toggle (YouTube only — silently ignored elsewhere) */}
        <div className="sm:col-span-2 flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => props.setSponsorBlock(!props.sponsorBlock)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              props.sponsorBlock
                ? "bg-zinc-900 dark:bg-zinc-100"
                : "bg-zinc-300 dark:bg-zinc-700",
            )}
            aria-label="Toggle SponsorBlock"
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform",
                props.sponsorBlock ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Skip sponsors, intros &amp; outros
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              YouTube only · uses SponsorBlock API
            </div>
          </div>
        </div>
      </div>

      {/* Status / Progress */}
      <PhaseView phase={props.phase} onReset={props.onReset} onDownloadFile={props.onDownloadFile} kind={props.kind} audioFormat={props.audioFormat} videoFormat={props.videoFormat} audioQuality={props.audioQuality} videoMaxHeight={props.videoMaxHeight} sponsorBlock={props.sponsorBlock} />
    </div>
  );
}

function PhaseView({
  phase,
  onReset,
  onDownloadFile,
  kind,
  audioFormat,
  videoFormat,
  audioQuality,
  videoMaxHeight,
  sponsorBlock,
}: {
  phase: DownloadPhase;
  onReset: () => void;
  onDownloadFile: (url: string, format: string) => void;
  kind: "audio" | "video";
  audioFormat: "mp3" | "m4a" | "opus";
  videoFormat: "mp4" | "webm";
  audioQuality: number;
  videoMaxHeight: number;
  sponsorBlock: boolean;
}) {
  if (phase.kind === "idle") {
    return (
      <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        Paste a link above and hit <strong>Fetch</strong> to get started.
      </div>
    );
  }

  if (phase.kind === "fetching-metadata") {
    return (
      <div className="p-6 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Fetching metadata…
      </div>
    );
  }

  if (phase.kind === "ready") {
    const m = phase.metadata;
    return (
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex gap-4">
          {m.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.thumbnail}
              alt=""
              className="w-32 h-20 sm:w-40 sm:h-24 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-900 flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
              {m.title}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 truncate">
              {m.uploader}
            </div>
            {m.durationSec > 0 && (
              <div className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                {formatDuration(m.durationSec)}
              </div>
            )}
          </div>
        </div>

        {m.isPlaylist && m.entries && (
          <div className="text-xs px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            Playlist detected: {m.entries.length} items. Downloading the whole playlist as a single archive (zip).
          </div>
        )}

        <button
          onClick={() =>
            onDownloadFile(
              m.webpage_url || m.id,
              kind === "audio" ? audioFormat : videoFormat,
            )
          }
          className="w-full py-3 rounded-xl font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Download {kind === "audio" ? audioFormat.toUpperCase() : videoFormat.toUpperCase()}
          {kind === "audio" && audioFormat === "mp3" && ` · ${audioQuality} kbps`}
          {kind === "video" && ` · up to ${videoMaxHeight}p`}
          {sponsorBlock && " · SponsorBlock"}
        </button>
      </div>
    );
  }

  if (phase.kind === "downloading") {
    const pct = phase.percent ?? 0;
    return (
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-700 dark:text-zinc-300" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {phase.postprocessing ? "Converting & embedding metadata…" : "Downloading…"}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500 tabular-nums">
          <span>{pct.toFixed(1)}%</span>
          <span>
            {formatBytes(phase.downloadedBytes)} / {formatBytes(phase.totalBytes)}
            {phase.speedBps && ` · ${formatSpeed(phase.speedBps)}`}
            {phase.etaSec !== undefined && ` · ETA ${formatDuration(phase.etaSec)}`}
          </span>
        </div>
      </div>
    );
  }

  if (phase.kind === "complete") {
    return (
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            Downloaded: {phase.filename}
          </span>
        </div>
        {phase.bytes !== undefined && (
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            {formatBytes(phase.bytes)}
          </div>
        )}
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
        >
          Download another
        </button>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Download failed</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 break-words">
              {phase.message}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
