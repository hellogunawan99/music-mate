"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2, Download, Clock, Loader2, AlertCircle } from "lucide-react";
import { loadHistory, removeHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";
import { downloadInBackground } from "@/lib/download";
import { cn, formatBytes, formatDuration } from "@/lib/utils";

export default function HistoryPage() {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleRedownload = async (entry: HistoryEntry) => {
    setBusy(entry.id);
    setError(null);
    try {
      await downloadInBackground({
        url: entry.url,
        kind: entry.kind,
        format: entry.format,
        audioQualityKbps: entry.audioQualityKbps,
        videoMaxHeight: entry.videoMaxHeight,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">History</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
              Recent downloads · stored only in your browser
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <div className="text-zinc-600 dark:text-zinc-400">No downloads yet</div>
            <Link
              href="/"
              className="inline-block mt-3 text-sm text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
            >
              Go download something
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="group flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {entry.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.thumbnail}
                    alt=""
                    className="w-16 h-12 object-cover rounded-md bg-zinc-100 dark:bg-zinc-900 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-md bg-zinc-100 dark:bg-zinc-900 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {entry.title}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span className="uppercase">{entry.format}</span>
                    {entry.audioQualityKbps && <span>· {entry.audioQualityKbps} kbps</span>}
                    {entry.videoMaxHeight && <span>· {entry.videoMaxHeight}p</span>}
                    {entry.durationSec ? <span>· {formatDuration(entry.durationSec)}</span> : null}
                    {entry.bytes && <span>· {formatBytes(entry.bytes)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRedownload(entry)}
                  disabled={busy === entry.id}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex-shrink-0",
                    "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  aria-label="Re-download"
                  title="Re-download"
                >
                  {busy === entry.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex-shrink-0"
                  aria-label="Remove from history"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
