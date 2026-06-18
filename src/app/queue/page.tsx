"use client";

import * as React from "react";
import { Plus, Trash2, Download, Loader2, CheckCircle2, AlertCircle, X, ListMusic } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { cn, formatBytes, formatDuration } from "@/lib/utils";
import { downloadInBackground } from "@/lib/download";

type ItemStatus =
  | { kind: "queued" }
  | { kind: "downloading"; percent?: number; speedBps?: number; downloadedBytes?: number; totalBytes?: number }
  | { kind: "postprocessing" }
  | { kind: "complete"; filename: string; bytes: number }
  | { kind: "error"; message: string };

interface QueueItem {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string | null;
  durationSec?: number;
  kind: "audio" | "video";
  format: string;
  audioQualityKbps?: number;
  videoMaxHeight?: number;
  status: ItemStatus;
}

const STORAGE_KEY = "music-mate:queue:v1";

function loadQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQueue(items: QueueItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function QueuePage() {
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [bulkUrl, setBulkUrl] = React.useState("");
  const [kind, setKind] = React.useState<"audio" | "video">("audio");
  const [format, setFormat] = React.useState<"mp3" | "m4a" | "opus" | "mp4" | "webm">("mp3");
  const [audioQuality, setAudioQuality] = React.useState<128 | 192 | 320>(192);
  const toast = useToast();

  React.useEffect(() => {
    setItems(loadQueue());
  }, []);

  React.useEffect(() => {
    saveQueue(items);
  }, [items]);

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const updateStatus = (id: string, status: ItemStatus) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  const handleAdd = async () => {
    const urls = bulkUrl
      .split(/[\s\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;

    const newItems: QueueItem[] = urls.map((url) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${urls.indexOf(url)}`,
      url,
      kind,
      format,
      audioQualityKbps: kind === "audio" ? audioQuality : undefined,
      videoMaxHeight: kind === "video" ? 1080 : undefined,
      status: { kind: "queued" },
    }));
    setItems((prev) => [...newItems, ...prev]);
    setBulkUrl("");
    toast.show({
      title: `Added ${newItems.length} item${newItems.length === 1 ? "" : "s"} to queue`,
      variant: "info",
      duration: 2500,
    });

    await Promise.all(
      newItems.map(async (item) => {
        try {
          const res = await fetch("/api/info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: item.url }),
          });
          const data = await res.json();
          if (data.ok) {
            updateItem(item.id, {
              title: data.metadata.title,
              thumbnail: data.metadata.thumbnail,
              durationSec: data.metadata.durationSec,
            });
          }
        } catch {
          // skip — we'll still try to download without metadata
        }
      }),
    );
  };

  const startItem = async (item: QueueItem) => {
    updateStatus(item.id, { kind: "downloading" });
    try {
      const result = await downloadInBackground({
        url: item.url,
        kind: item.kind,
        format: item.format,
        audioQualityKbps: item.audioQualityKbps,
        videoMaxHeight: item.videoMaxHeight,
      });
      updateStatus(item.id, {
        kind: "complete",
        filename: result.filename,
        bytes: result.bytes,
      });
    } catch (err) {
      updateStatus(item.id, {
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const startAll = async () => {
    for (const item of items) {
      if (item.status.kind === "queued" || item.status.kind === "error") {
        await startItem(item);
      }
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCompleted = () => {
    setItems((prev) => prev.filter((it) => it.status.kind !== "complete"));
  };

  const queuedCount = items.filter((it) => it.status.kind === "queued").length;
  const completedCount = items.filter((it) => it.status.kind === "complete").length;
  const errorCount = items.filter((it) => it.status.kind === "error").length;

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8 fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">Queue</h1>
          <p className="text-sm text-fg-muted mt-2">
            Batch-download multiple URLs · sequential to keep things stable
          </p>
        </div>

        {/* Bulk add */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-6 fade-in-up" style={{ animationDelay: "60ms" }}>
          <label className="block text-sm font-semibold text-fg mb-2">
            Add URLs
          </label>
          <textarea
            value={bulkUrl}
            onChange={(e) => setBulkUrl(e.target.value)}
            placeholder={"https://youtu.be/abc...\nhttps://youtu.be/def...\nhttps://..."}
            rows={3}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg text-[13px] font-mono",
              "bg-sunken border border-default",
              "focus:border-strong focus:outline-none",
              "text-fg placeholder:text-fg-subtle",
              "transition-colors",
              "resize-y",
            )}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SegmentedControl
              ariaLabel="Type"
              size="sm"
              value={kind}
              onChange={(v) => {
                setKind(v);
                setFormat(v === "audio" ? "mp3" : "mp4");
              }}
              options={[
                { value: "audio", label: "Audio" },
                { value: "video", label: "Video" },
              ]}
            />
            {kind === "audio" && (
              <SegmentedControl
                ariaLabel="Audio format"
                size="sm"
                value={format}
                onChange={(v) => setFormat(v as any)}
                options={[
                  { value: "mp3", label: "MP3" },
                  { value: "m4a", label: "M4A" },
                  { value: "opus", label: "Opus" },
                ]}
              />
            )}
            {kind === "audio" && format === "mp3" && (
              <SegmentedControl
                ariaLabel="Quality"
                size="sm"
                value={String(audioQuality)}
                onChange={(v) => setAudioQuality(Number(v) as 128 | 192 | 320)}
                options={[
                  { value: "128", label: "128" },
                  { value: "192", label: "192" },
                  { value: "320", label: "320" },
                ]}
              />
            )}
            <button
              onClick={handleAdd}
              disabled={!bulkUrl.trim()}
              className={cn(
                "ml-auto px-4 py-2 rounded-lg text-sm font-medium cursor-pointer",
                "gradient-bg text-white",
                "shadow-md shadow-accent-500/20",
                "hover:shadow-lg hover:shadow-accent-500/30 hover:brightness-110",
                "active:scale-[0.98]",
                "transition-all duration-200",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                "flex items-center gap-1.5",
              )}
            >
              <Plus className="w-4 h-4" />
              Add to queue
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3 text-xs text-fg-muted">
              <span>
                <span className="font-semibold text-fg tabular-nums">{items.length}</span> total
              </span>
              {queuedCount > 0 && (
                <span>
                  <span className="font-semibold text-fg tabular-nums">{queuedCount}</span> queued
                </span>
              )}
              {completedCount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold tabular-nums">{completedCount}</span> done
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400">
                  <span className="font-semibold tabular-nums">{errorCount}</span> failed
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startAll}
                disabled={queuedCount === 0 && errorCount === 0}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg cursor-pointer",
                  "bg-elevated border border-default",
                  "hover:border-strong",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "transition-colors duration-200",
                  "flex items-center gap-1.5",
                )}
              >
                <Download className="w-4 h-4" />
                Start all queued
              </button>
              <button
                onClick={clearCompleted}
                disabled={completedCount === 0}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg cursor-pointer",
                  "text-fg-muted hover:text-fg hover:bg-sunken",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "transition-colors duration-200",
                )}
              >
                Clear completed
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <EmptyQueue />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                onStart={() => startItem(item)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function EmptyQueue() {
  return (
    <div className="glass rounded-2xl px-6 py-16 text-center fade-in-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sunken mb-4">
        <ListMusic className="w-7 h-7 text-fg-muted" />
      </div>
      <h3 className="font-semibold text-fg">Queue is empty</h3>
      <p className="text-sm text-fg-muted mt-1.5 max-w-sm mx-auto">
        Paste a list of URLs above and they'll download one after another.
      </p>
    </div>
  );
}

function QueueRow({
  item,
  onStart,
  onRemove,
}: {
  item: QueueItem;
  onStart: () => void;
  onRemove: () => void;
}) {
  const s = item.status;
  return (
    <li
      className={cn(
        "card-hover glass rounded-xl p-3 flex items-center gap-3",
        s.kind === "complete" && "opacity-70",
      )}
    >
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt=""
          className="w-20 aspect-video object-cover rounded-md bg-sunken flex-shrink-0"
        />
      ) : (
        <div className="w-20 aspect-video rounded-md bg-sunken flex-shrink-0 animate-pulse" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate text-fg">
          {item.title ?? item.url}
        </div>
        <div className="text-xs text-fg-muted flex items-center gap-2 mt-0.5 tabular-nums">
          <span className="uppercase font-semibold">{item.format}</span>
          {item.audioQualityKbps && <span>· {item.audioQualityKbps} kbps</span>}
          {item.durationSec ? <span>· {formatDuration(item.durationSec)}</span> : null}
          <StatusBadge status={s} />
        </div>
      </div>
      <button
        onClick={onStart}
        disabled={
          s.kind === "downloading" || s.kind === "postprocessing" || s.kind === "complete"
        }
        className={cn(
          "p-2 rounded-lg cursor-pointer transition-colors",
          "text-fg-muted hover:bg-sunken hover:text-fg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        aria-label="Start download"
        title="Start"
      >
        {s.kind === "downloading" || s.kind === "postprocessing" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : s.kind === "complete" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={onRemove}
        className="p-2 rounded-lg cursor-pointer text-fg-subtle hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        aria-label="Remove"
        title="Remove"
      >
        <X className="w-4 h-4" />
      </button>
    </li>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  switch (status.kind) {
    case "queued":
      return <span className="text-fg-subtle">· queued</span>;
    case "downloading":
      return (
        <span className="text-fg flex items-center gap-1">
          · <Loader2 className="w-3 h-3 animate-spin" /> downloading
          {status.percent !== undefined && ` ${status.percent.toFixed(0)}%`}
        </span>
      );
    case "postprocessing":
      return <span>· converting…</span>;
    case "complete":
      return (
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          · <CheckCircle2 className="w-3 h-3" /> done
          {status.bytes ? ` · ${formatBytes(status.bytes)}` : ""}
        </span>
      );
    case "error":
      return (
        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
          · <AlertCircle className="w-3 h-3" /> failed
        </span>
      );
  }
}