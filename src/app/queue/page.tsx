"use client";

import * as React from "react";
import { Plus, Trash2, Download, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn, formatBytes, formatDuration, formatSpeed } from "@/lib/utils";
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

  React.useEffect(() => {
    setItems(loadQueue());
  }, []);

  // Persist on change
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

    // Fetch metadata for all in parallel
    const newItems: QueueItem[] = [];
    for (const url of urls) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      newItems.push({
        id,
        url,
        kind,
        format,
        audioQualityKbps: kind === "audio" ? audioQuality : undefined,
        videoMaxHeight: kind === "video" ? 1080 : undefined,
        status: { kind: "queued" },
      });
    }
    setItems((prev) => [...newItems, ...prev]);
    setBulkUrl("");

    // Fetch metadata concurrently
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
      // Note: the simple download helper doesn't stream progress,
      // so for the queue we just show a spinner. To get progress we'd
      // need an SSE endpoint — out of scope for v1.
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
    // Sequential to avoid hammering yt-dlp / the server
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

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
            Batch-download multiple URLs · sequential to keep things stable
          </p>
        </div>

        {/* Bulk add */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 mb-6">
          <label className="block text-sm font-medium mb-2">
            Add URLs (one per line)
          </label>
          <textarea
            value={bulkUrl}
            onChange={(e) => setBulkUrl(e.target.value)}
            placeholder={"https://youtu.be/abc...\nhttps://youtu.be/def...\nhttps://..."}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono text-xs"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <button
                onClick={() => {
                  setKind("audio");
                  setFormat("mp3");
                }}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  kind === "audio"
                    ? "bg-white dark:bg-zinc-800 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400",
                )}
              >
                Audio
              </button>
              <button
                onClick={() => {
                  setKind("video");
                  setFormat("mp4");
                }}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  kind === "video"
                    ? "bg-white dark:bg-zinc-800 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400",
                )}
              >
                Video
              </button>
            </div>
            {kind === "audio" && (
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-900 border-0"
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A</option>
                <option value="opus">Opus</option>
              </select>
            )}
            {kind === "audio" && format === "mp3" && (
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(Number(e.target.value) as any)}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-900 border-0"
              >
                <option value={128}>128 kbps</option>
                <option value={192}>192 kbps</option>
                <option value={320}>320 kbps</option>
              </select>
            )}
            <button
              onClick={handleAdd}
              disabled={!bulkUrl.trim()}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add to queue
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startAll}
                disabled={items.every(
                  (it) =>
                    it.status.kind === "complete" || it.status.kind === "downloading",
                )}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Start all queued
              </button>
              <button
                onClick={clearCompleted}
                disabled={!items.some((it) => it.status.kind === "complete")}
                className="px-3 py-1.5 text-sm rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear completed
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        <ul className="space-y-2">
          {items.length === 0 ? (
            <li className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500">
              Queue is empty
            </li>
          ) : (
            items.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                onStart={() => startItem(item)}
                onRemove={() => removeItem(item.id)}
              />
            ))
          )}
        </ul>
      </div>
    </main>
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
    <li className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {item.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt=""
          className="w-16 h-12 object-cover rounded-md bg-zinc-100 dark:bg-zinc-900 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 flex-shrink-0 animate-pulse" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-100">
          {item.title ?? item.url}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-2 mt-0.5">
          <span className="uppercase">{item.format}</span>
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
        className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
        aria-label="Start download"
        title="Start"
      >
        {s.kind === "downloading" || s.kind === "postprocessing" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : s.kind === "complete" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={onRemove}
        className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
      return <span className="text-zinc-400">· queued</span>;
    case "downloading":
      return (
        <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
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
