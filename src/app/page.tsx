"use client";

import * as React from "react";
import { DownloaderCard, type DownloadPhase } from "@/components/downloader-card";
import { BrandMark } from "@/components/brand-mark";
import { useToast } from "@/components/ui/toast";
import { downloadInBackground } from "@/lib/download";
import { addHistoryEntry } from "@/lib/history";
import type { MetadataResult } from "@/lib/yt-dlp";

const PLATFORMS = [
  { name: "YouTube", color: "bg-rose-600" },
  { name: "Instagram", color: "bg-pink-600" },
  { name: "TikTok", color: "bg-zinc-900 dark:bg-zinc-100" },
  { name: "SoundCloud", color: "bg-orange-500" },
  { name: "X", color: "bg-zinc-900 dark:bg-zinc-100" },
  { name: "1,795 more", color: "bg-sunken border border-default text-fg" },
];

export default function HomePage() {
  const [url, setUrl] = React.useState("");
  const [kind, setKind] = React.useState<"audio" | "video">("audio");
  const [audioFormat, setAudioFormat] = React.useState<"mp3" | "m4a" | "opus">("mp3");
  const [videoFormat, setVideoFormat] = React.useState<"mp4" | "webm">("mp4");
  const [audioQuality, setAudioQuality] = React.useState<128 | 192 | 320>(192);
  const [videoMaxHeight, setVideoMaxHeight] = React.useState<720 | 1080 | 1440 | 2160>(1080);
  const [sponsorBlock, setSponsorBlock] = React.useState(false);
  const [phase, setPhase] = React.useState<DownloadPhase>({ kind: "idle" });
  const toast = useToast();

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
      toast.show({
        title: "Couldn't fetch metadata",
        description: err instanceof Error ? err.message : String(err),
        variant: "error",
        duration: 5000,
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
      toast.show({
        title: "Downloaded",
        description: result.filename,
        variant: "success",
        duration: 4000,
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
      toast.show({
        title: "Download failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "error",
        duration: 6000,
      });
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 fade-in-up">
        <div className="inline-flex items-center justify-center mb-5">
          <BrandMark size={56} withGlow />
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-fg leading-[1.1]">
          Download audio &amp; video
          <br className="hidden sm:block" /> from anywhere
        </h1>
        <p className="mt-4 text-base sm:text-lg text-fg-muted max-w-xl mx-auto leading-relaxed">
          Paste a link. Pick a format. Get the file.
          No accounts. No tracking. Runs on your machine.
        </p>

        {/* Platform strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {PLATFORMS.map((p) => (
            <span
              key={p.name}
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium ${p.color} text-white`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto fade-in-up" style={{ animationDelay: "60ms" }}>
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
          setVideoMaxHeight={setVideoMaxHeight}
          sponsorBlock={sponsorBlock}
          setSponsorBlock={setSponsorBlock}
          phase={phase}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onDownloadFile={handleDownloadFile}
        />
      </section>
    </main>
  );
}