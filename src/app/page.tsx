"use client";

import * as React from "react";
import Image from "next/image";
import {
  Link2,
  Sliders,
  Download,
  Headphones,
  Film,
  Server,
  Lock,
  Globe,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DownloaderCard, type DownloadPhase } from "@/components/downloader-card";
import { BrandMark } from "@/components/brand-mark";
import { HeroScene } from "@/components/hero-scene";
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

const STATS = [
  { value: "1,800+", label: "supported sites" },
  { value: "0", label: "accounts required" },
  { value: "0", label: "tracking pixels" },
  { value: "100%", label: "runs locally" },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Anywhere",
    description:
      "YouTube, Instagram, TikTok, SoundCloud, X — and 1,795 more. If it has a video or audio stream, Music Mate can grab it.",
    image: "/generated/feature-formats.png",
    tint: "from-violet-500/10",
  },
  {
    icon: Sliders,
    title: "Any format",
    description:
      "MP3, M4A, Opus for audio. MP4, WebM up to 4K for video. Pick a preset or fine-tune bitrate and resolution.",
    image: "/generated/feature-privacy.png",
    tint: "from-pink-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Yours only",
    description:
      "No accounts, no cloud, no telemetry. Downloads stream straight from the source to your machine — nothing in between.",
    image: "/generated/feature-multisource.png",
    tint: "from-amber-500/10",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Link2,
    title: "Paste the link",
    description:
      "Copy from YouTube, Instagram, TikTok, X, SoundCloud, or any of 1,800+ sites. Drop it in the box.",
  },
  {
    n: "02",
    icon: Sliders,
    title: "Pick your format",
    description:
      "Audio (MP3 128/192/320, M4A, Opus) or video (MP4/WebM up to 4K). Toggle SponsorBlock if you want.",
  },
  {
    n: "03",
    icon: Download,
    title: "Download",
    description:
      "Hit the button. File saves to your Downloads folder. Metadata and cover art embedded automatically.",
  },
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
    <main className="flex-1">
      {/* ============================================================
          Hero — full-bleed, Three.js background, downloader CTA
          ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Three.js canvas background */}
        <div className="absolute inset-0 -z-10">
          <HeroScene />
        </div>

        {/* Subtle gradient overlay for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-base/40 to-base"
        />

        <div className="px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 fade-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <BrandMark size={64} withGlow />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-5 text-xs text-fg-muted">
              <Sparkles className="w-3.5 h-3.5 text-fg-muted" />
              Powered by yt-dlp · 1,800+ sites
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tighter text-fg leading-[1.05]">
              Download audio &amp; video
              <br />
              <span className="gradient-text">from anywhere</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-fg-muted max-w-xl mx-auto leading-relaxed">
              Paste a link. Pick a format. Get the file.
              No accounts. No tracking. Runs on your machine.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {PLATFORMS.map((p) => (
                <span
                  key={p.name}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium ${p.color} text-white`}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto fade-in-up" style={{ animationDelay: "120ms" }}>
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
          </div>
        </div>
      </section>

      {/* ============================================================
          Stats bar — TopRank-style "by the numbers"
          ============================================================ */}
      <section className="border-y border-default">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="text-center fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl sm:text-5xl font-semibold tracking-tight gradient-text tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-fg-muted mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Features — 3-column grid with imagery
          ============================================================ */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-fg">
              Built for people who actually download stuff
            </h2>
            <p className="mt-4 text-fg-muted">
              No apps to install. No accounts to create. No "premium plans." Just a tool that works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  className="card-hover glass rounded-2xl overflow-hidden flex flex-col fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${f.tint} to-transparent overflow-hidden`}>
                    <Image
                      src={f.image}
                      alt=""
                      width={800}
                      height={600}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-elevated/90 backdrop-blur shadow-lg">
                      <Icon className="w-5 h-5 text-fg" />
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 flex-1">
                    <h3 className="text-lg font-semibold text-fg">{f.title}</h3>
                    <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          How it works — 3-step process
          ============================================================ */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-sunken/30">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4 text-xs text-fg-muted">
              <Zap className="w-3.5 h-3.5" />
              Three steps. That's it.
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-fg">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  key={s.n}
                  className="relative glass rounded-2xl p-6 sm:p-7 fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-5xl font-semibold gradient-text tabular-nums">
                      {s.n}
                    </span>
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-sunken border border-default">
                      <Icon className="w-5 h-5 text-fg-muted" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-fg">{s.title}</h3>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                    {s.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          Closing CTA — gradient callout
          ============================================================ */}
      <section className="px-4 sm:px-6 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-10 sm:p-16 text-center text-white fade-in-up">
            <div
              aria-hidden
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: "url('/generated/hero-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative">
              <BrandMark size={56} className="mx-auto mb-5" />
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
                Ready to download?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/90 max-w-md mx-auto">
                Scroll back up. Paste a link. You're done in under a minute.
              </p>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center mt-8 px-7 py-3.5 rounded-xl bg-white text-zinc-900 font-medium text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
              >
                Start downloading
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}