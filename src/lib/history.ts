/**
 * Lightweight localStorage-backed history (no DB, no auth).
 * Survives page refresh; clears via Settings page.
 */

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  uploader?: string;
  durationSec?: number;
  thumbnail?: string | null;
  format: string;
  kind: "audio" | "video";
  audioQualityKbps?: number;
  videoMaxHeight?: number;
  filename: string;
  bytes?: number;
  completedAt: number;
}

const STORAGE_KEY = "music-mate:history:v1";
const MAX_ENTRIES = 200;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage may be full or disabled — silently ignore.
  }
}

export function addHistoryEntry(entry: HistoryEntry) {
  const entries = loadHistory();
  // Replace if same id exists (re-download updates it).
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries.splice(idx, 1);
  entries.unshift(entry);
  saveHistory(entries);
}

export function removeHistoryEntry(id: string) {
  const entries = loadHistory().filter((e) => e.id !== id);
  saveHistory(entries);
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
