"use client";

import * as React from "react";
import {
  Music,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Headphones,
  Film,
  Sparkles,
  Link2,
} from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn, formatDuration } from "@/lib/utils";

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
  setVideoMaxHeight: (v: 720 | 1080 | 1440 | 2160) => void;
  sponsorBlock: boolean;
  setSponsorBlock: (v: boolean) => void;
  phase: DownloadPhase;
  onSubmit: () => void;
  onReset: () => void;
  onDownloadFile: (url: string) => void;
}

const PLATFORM_META: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  youtube:   { label: "YouTube",   bg: "bg-rose-600",         fg: "text-white" },
  instagram: { label: "Instagram", bg: "bg-pink-600",         fg: "text-white" },
  tiktok:    { label: "TikTok",    bg: "bg-zinc-900 dark:bg-zinc-100", fg: "text-white dark:text-zinc-900" },
  soundcloud:{ label: "SoundCloud",bg: "bg-orange-500",       fg: "text-white" },
  twitter:   { label: "X / Twitter", bg: "bg-zinc-900 dark:bg-zinc-100", fg: "text-white dark:text-zinc-900" },
  generic:   { label: "1800+ sites", bg: "bg-sunken border border-default", fg: "text-fg-muted" },
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
    <div className="glass rounded-2xl overflow-hidden">
      {/* URL input */}
      <div className="p-5 sm:p-7">
        <label className="flex items-center gap-2 text-sm font-medium text-fg-muted mb-3">
          <Link2 className="w-4 h-4" />
          <span>Paste a link from</span>
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide",
              plat.bg,
              plat.fg,
            )}
          >
            {plat.label}
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={props.url}
            onChange={(e) => props.setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={cn(
              "flex-1 px-4 py-3.5 rounded-xl text-[15px]",
              "bg-elevated border border-default",
              "focus:border-strong focus:outline-none focus-visible:outline-none",
              "text-fg placeholder:text-fg-subtle",
              "transition-colors",
            )}
            spellCheck={false}
            autoComplete="off"
            disabled={
              props.phase.kind === "downloading" ||
              props.phase.kind === "fetching-metadata"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && props.url.trim()) props.onSubmit();
            }}
          />
          <button
            onClick={props.onSubmit}
            disabled={
              !props.url.trim() ||
              props.phase.kind === "downloading" ||
              props.phase.kind === "fetching-metadata"
            }
            className={cn(
              "px-5 sm:px-6 py-3.5 rounded-xl font-medium text-sm cursor-pointer",
              "gradient-bg text-white",
              "shadow-lg shadow-accent-500/20",
              "hover:shadow-xl hover:shadow-accent-500/30 hover:brightness-110",
              "active:scale-[0.98]",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              "flex items-center gap-2",
            )}
          >
            {props.phase.kind === "fetching-metadata" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching
              </>
            ) : (
              "Fetch"
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-default" />

      {/* Format & quality */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Type toggle */}
        <div className="space-y-2">
          <Label icon={<Sparkles className="w-3.5 h-3.5" />}>Output type</Label>
          <SegmentedControl
            ariaLabel="Output type"
            value={props.kind}
            onChange={props.setKind}
            options={[
              {
                value: "audio",
                label: (
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    Audio
                  </span>
                ),
              },
              {
                value: "video",
                label: (
                  <span className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    Video
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label icon={<Music className="w-3.5 h-3.5" />}>Format</Label>
          {props.kind === "audio" ? (
            <SegmentedControl
              ariaLabel="Audio format"
              layout="stack"
              value={props.audioFormat}
              onChange={props.setAudioFormat}
              options={[
                { value: "mp3",  label: "MP3",  description: "Universal" },
                { value: "m4a",  label: "M4A",  description: "Apple-friendly" },
                { value: "opus", label: "Opus", description: "Best size" },
              ]}
            />
          ) : (
            <SegmentedControl
              ariaLabel="Video format"
              layout="stack"
              value={props.videoFormat}
              onChange={props.setVideoFormat}
              options={[
                { value: "mp4",  label: "MP4",  description: "H.264 · most compatible" },
                { value: "webm", label: "WebM", description: "VP9 · smaller files" },
              ]}
            />
          )}
        </div>

        {/* Quality / resolution */}
        {props.kind === "audio" && props.audioFormat === "mp3" && (
          <div className="space-y-2 fade-in-up">
            <Label icon={<Headphones className="w-3.5 h-3.5" />}>Bitrate</Label>
            <SegmentedControl
              ariaLabel="Audio bitrate"
              value={String(props.audioQuality)}
              onChange={(v) => props.setAudioQuality(Number(v) as 128 | 192 | 320)}
              options={[
                { value: "128", label: "128 kbps" },
                { value: "192", label: "192 kbps" },
                { value: "320", label: "320 kbps" },
              ]}
            />
          </div>
        )}

        {props.kind === "video" && (
          <div className="space-y-2 fade-in-up">
            <Label icon={<Film className="w-3.5 h-3.5" />}>Max resolution</Label>
            <SegmentedControl
              ariaLabel="Max resolution"
              value={String(props.videoMaxHeight)}
              onChange={(v) => props.setVideoMaxHeight(Number(v) as 720 | 1080 | 1440 | 2160)}
              options={[
                { value: "720",  label: "720p" },
                { value: "1080", label: "1080p" },
                { value: "1440", label: "1440p" },
                { value: "2160", label: "4K" },
              ]}
            />
          </div>
        )}

        {/* SponsorBlock */}
        <div className="pt-4 border-t border-default">
          <Switch
            checked={props.sponsorBlock}
            onChange={props.setSponsorBlock}
            label={
              <span className="flex items-center gap-2">
                Skip sponsors, intros &amp; outros
                {props.sponsorBlock && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sunken text-fg-muted uppercase tracking-wider">
                    On
                  </span>
                )}
              </span>
            }
            description="YouTube only · powered by SponsorBlock API"
          />
        </div>
      </div>

      {/* Status / Progress */}
      <div className="border-t border-default">
        <PhaseView
          phase={props.phase}
          onReset={props.onReset}
          onDownloadFile={props.onDownloadFile}
          kind={props.kind}
          audioFormat={props.audioFormat}
          videoFormat={props.videoFormat}
          audioQuality={props.audioQuality}
          videoMaxHeight={props.videoMaxHeight}
          sponsorBlock={props.sponsorBlock}
        />
      </div>
    </div>
  );
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
      {icon}
      {children}
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
  onDownloadFile: (url: string) => void;
  kind: "audio" | "video";
  audioFormat: "mp3" | "m4a" | "opus";
  videoFormat: "mp4" | "webm";
  audioQuality: number;
  videoMaxHeight: number;
  sponsorBlock: boolean;
}) {
  if (phase.kind === "idle") {
    return (
      <div className="px-7 py-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sunken mb-3">
          <Link2 className="w-5 h-5 text-fg-muted" />
        </div>
        <div className="text-sm text-fg-muted">
          Paste a link above and hit <span className="text-fg font-medium">Fetch</span> to get started.
        </div>
      </div>
    );
  }

  if (phase.kind === "fetching-metadata") {
    return (
      <div className="px-7 py-10 flex items-center justify-center gap-3 text-sm text-fg-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        Fetching metadata…
      </div>
    );
  }

  if (phase.kind === "ready") {
    const m = phase.metadata;
    return (
      <div className="p-5 sm:p-7 space-y-4 fade-in-up">
        <div className="flex gap-4">
          {m.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.thumbnail}
              alt=""
              className="w-32 sm:w-40 aspect-video object-cover rounded-lg bg-sunken flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-fg line-clamp-2 leading-snug">
              {m.title}
            </div>
            <div className="text-sm text-fg-muted mt-1 truncate">{m.uploader}</div>
            {m.durationSec > 0 && (
              <div className="text-xs text-fg-subtle mt-0.5 tabular-nums">
                {formatDuration(m.durationSec)}
              </div>
            )}
          </div>
        </div>

        {m.isPlaylist && m.entries && (
          <div className="text-xs px-3 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <strong>Playlist detected:</strong> {m.entries.length} items. They will be downloaded as a zip archive.
          </div>
        )}

        <button
          onClick={() => onDownloadFile(m.webpage_url || m.id)}
          className={cn(
            "w-full py-3.5 rounded-xl font-medium text-sm cursor-pointer",
            "gradient-bg text-white",
            "shadow-lg shadow-accent-500/20",
            "hover:shadow-xl hover:shadow-accent-500/30 hover:brightness-110",
            "active:scale-[0.99]",
            "transition-all duration-200",
            "flex items-center justify-center gap-2",
          )}
        >
          <Headphones className="w-4 h-4" />
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
      <div className="p-5 sm:p-7 space-y-3 fade-in-up">
        <div className="flex items-center gap-3 text-sm font-medium text-fg">
          <Loader2 className="w-4 h-4 animate-spin text-fg-muted" />
          {phase.postprocessing
            ? "Converting & embedding metadata…"
            : "Downloading…"}
        </div>
        <ProgressBar
          percent={pct}
          downloadedBytes={phase.downloadedBytes}
          totalBytes={phase.totalBytes}
          speedBps={phase.speedBps}
          etaSec={phase.etaSec}
          state={phase.postprocessing ? "postprocessing" : "downloading"}
        />
      </div>
    );
  }

  if (phase.kind === "complete") {
    return (
      <div className="p-5 sm:p-7 space-y-3 fade-in-up">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/15 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-fg">Downloaded</div>
            <div className="text-xs text-fg-muted mt-0.5 break-all">
              {phase.filename}
              {phase.bytes !== undefined && ` · ${(phase.bytes / 1024).toFixed(0)} KB`}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className={cn(
            "w-full py-3 rounded-xl font-medium text-sm cursor-pointer",
            "bg-sunken text-fg hover:bg-elevated",
            "transition-colors duration-200",
          )}
        >
          Download another
        </button>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="p-5 sm:p-7 space-y-3 fade-in-up">
        <div className="flex items-start gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-500/15 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-fg">Download failed</div>
            <div className="text-xs text-fg-muted mt-1 break-words">
              {phase.message}
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className={cn(
            "w-full py-3 rounded-xl font-medium text-sm cursor-pointer",
            "bg-sunken text-fg hover:bg-elevated",
            "transition-colors duration-200",
          )}
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}