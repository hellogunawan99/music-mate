"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2, Download, Clock, Loader2, AlertCircle, History as HistoryIcon } from "lucide-react";
import { loadHistory, removeHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";
import { useToast } from "@/components/ui/toast";
import { downloadInBackground } from "@/lib/download";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

export default function HistoryPage() {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleRedownload = async (entry: HistoryEntry) => {
    setBusy(entry.id);
    setError(null);
    try {
      const result = await downloadInBackground({
        url: entry.url,
        kind: entry.kind,
        format: entry.format,
        audioQualityKbps: entry.audioQualityKbps,
        videoMaxHeight: entry.videoMaxHeight,
      });
      toast.show({
        title: "Downloaded again",
        description: result.filename,
        variant: "success",
        duration: 3500,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.show({
        title: "Re-download failed",
        description: msg,
        variant: "error",
        duration: 5000,
      });
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = (id: string) => {
    removeHistoryEntry(id);
    setEntries(loadHistory());
  };

  const handleClear = () => {
    if (!confirm("Clear all download history? This cannot be undone.")) return;
    clearHistory();
    setEntries([]);
    toast.show({
      title: "History cleared",
      variant: "info",
      duration: 2000,
    });
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-6 sm:mb-8 fade-in-up">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">History</h1>
            <p className="text-sm text-fg-muted mt-2">
              Recent downloads · stored only in your browser
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg cursor-pointer",
                "text-fg-muted hover:text-fg hover:bg-sunken",
                "transition-colors duration-200",
                "flex items-center gap-1.5",
              )}
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2 fade-in-up">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {entries.length === 0 ? (
          <EmptyHistory />
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <HistoryRow
                key={entry.id}
                entry={entry}
                busy={busy === entry.id}
                onRedownload={() => handleRedownload(entry)}
                onRemove={() => handleRemove(entry.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function EmptyHistory() {
  return (
    <div className="glass rounded-2xl px-6 py-16 text-center fade-in-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sunken mb-4">
        <HistoryIcon className="w-7 h-7 text-fg-muted" />
      </div>
      <h3 className="font-semibold text-fg">No downloads yet</h3>
      <p className="text-sm text-fg-muted mt-1.5 max-w-sm mx-auto">
        Once you download something, it'll appear here so you can re-fetch it later.
      </p>
      <Link
        href="/"
        className={cn(
          "inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium",
          "gradient-bg text-white",
          "hover:brightness-110 active:scale-[0.98]",
          "transition-all duration-200",
        )}
      >
        Go download something
      </Link>
    </div>
  );
}

function HistoryRow({
  entry,
  busy,
  onRedownload,
  onRemove,
}: {
  entry: HistoryEntry;
  busy: boolean;
  onRedownload: () => void;
  onRemove: () => void;
}) {
  const date = new Date(entry.completedAt);
  const dateStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <li
      className={cn(
        "card-hover glass rounded-xl p-3 flex items-center gap-3",
        busy && "opacity-70",
      )}
    >
      {entry.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.thumbnail}
          alt=""
          className="w-24 aspect-video object-cover rounded-md bg-sunken flex-shrink-0"
        />
      ) : (
        <div className="w-24 aspect-video rounded-md bg-sunken flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-fg truncate">{entry.title}</div>
        <div className="text-xs text-fg-muted flex items-center gap-2 mt-0.5 tabular-nums">
          <span className="uppercase font-semibold">{entry.format}</span>
          {entry.audioQualityKbps && <span>· {entry.audioQualityKbps} kbps</span>}
          {entry.videoMaxHeight && <span>· {entry.videoMaxHeight}p</span>}
          {entry.durationSec ? <span>· {formatDuration(entry.durationSec)}</span> : null}
          {entry.bytes && <span>· {formatBytes(entry.bytes)}</span>}
        </div>
        <div className="text-[10px] text-fg-subtle mt-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {dateStr} · {timeStr}
        </div>
      </div>
      <button
        onClick={onRedownload}
        disabled={busy}
        className={cn(
          "p-2 rounded-lg cursor-pointer transition-colors",
          "text-fg-muted hover:bg-sunken hover:text-fg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        aria-label="Re-download"
        title="Re-download"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={onRemove}
        className="p-2 rounded-lg cursor-pointer text-fg-subtle hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        aria-label="Remove from history"
        title="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}