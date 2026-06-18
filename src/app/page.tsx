"use client";

import * as React from "react";
import { DownloaderCard, type DownloadPhase } from "@/components/downloader-card";
import { downloadInBackground } from "@/lib/download";
import { addHistoryEntry } from "@/lib/history";
import type { MetadataResult } from "@/lib/yt-dlp";

export default function HomePage() {
  const [url, setUrl] = React.useState("");
  const [kind, setKind] = React.useState<"audio" | "video">("audio");
  const [audioFormat, setAudioFormat] = React.useState<"mp3" | "m4a" | "opus">("mp3");
  const [videoFormat, setVideoFormat] = React.useState<"mp4" | "webm">("mp4");
  const [audioQuality, setAudioQuality] = React.useState<128 | 192 | 320>(192);
  const [videoMaxHeight, setVideoMaxHeight] = React.useState<720 | 1080 | 1440 | 2160>(1080);
  const [sponsorBlock, setSponsorBlock] = React.useState(false);
  const [phase, setPhase] = React.useState<DownloadPhase>({ kind: "idle" });

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setPhase({ kind: "fetching-metadata" });
    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      setPhase({ kind: "ready", metadata: data.metadata });
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleReset = () => {
    setPhase({ kind: "idle" });
    setUrl("");
  };

  const handleDownloadFile = async (targetUrl: string) => {
    setPhase({ kind: "downloading" });
    try {
      const result = await downloadInBackground({
        url: targetUrl,
        kind,
        format: kind === "audio" ? audioFormat : videoFormat,
        audioQualityKbps: kind === "audio" ? audioQuality : undefined,
        videoMaxHeight: kind === "video" ? videoMaxHeight : undefined,
        sponsorBlock,
      });
      setPhase({
        kind: "complete",
        filename: result.filename,
        bytes: result.bytes,
      });

      // Persist to history
      const meta = phase.kind === "ready" ? phase.metadata : null;
      if (meta) {
        addHistoryEntry({
          id: `${meta.id}-${Date.now()}`,
          url: meta.webpage_url,
          title: meta.title,
          uploader: meta.uploader,
          durationSec: meta.durationSec,
          thumbnail: meta.thumbnail,
          format: kind === "audio" ? audioFormat : videoFormat,
          kind,
          audioQualityKbps: kind === "audio" ? audioQuality : undefined,
          videoMaxHeight: kind === "video" ? videoMaxHeight : undefined,
          filename: result.filename,
          bytes: result.bytes,
          completedAt: Date.now(),
        });
      }
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Download audio &amp; video from anywhere
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Paste a YouTube, Instagram, TikTok, SoundCloud, X, or 1,800+ other links.
          Choose your format. Get the file. No accounts, no tracking.
        </p>
      </div>

      <DownloaderCard
        url={url}
        setUrl={setUrl}
        kind={kind}
        setKind={setKind}
        audioFormat={audioFormat}
        setAudioFormat={setAudioFormat}
        videoFormat={videoFormat}
        setVideoFormat={setVideoFormat}
        audioQuality={audioQuality}
        setAudioQuality={setAudioQuality}
        videoMaxHeight={videoMaxHeight}
        setVideoMaxHeight={setVideoMaxHeight as any}
        sponsorBlock={sponsorBlock}
        setSponsorBlock={setSponsorBlock}
        phase={phase}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onDownloadFile={handleDownloadFile}
      />
    </main>
  );
}
