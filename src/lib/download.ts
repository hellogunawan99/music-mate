/**
 * Background download helper.
 * Hits POST /api/download with the requested options, streams the binary
 * back via a fetch() blob, and triggers a browser download.
 *
 * Returns metadata about the completed download so the caller can persist
 * it into history.
 */

export interface BackgroundDownloadOpts {
  url: string;
  kind: "audio" | "video";
  format: string;
  audioQualityKbps?: number;
  videoMaxHeight?: number;
  sponsorBlock?: boolean;
  playlist?: boolean;
}

export interface BackgroundDownloadResult {
  filename: string;
  bytes: number;
  blob: Blob;
}

export async function downloadInBackground(
  opts: BackgroundDownloadOpts,
): Promise<BackgroundDownloadResult> {
  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: opts.url,
      kind: opts.kind,
      format: opts.format,
      audioQualityKbps: opts.audioQualityKbps,
      videoMaxHeight: opts.videoMaxHeight,
      sponsorBlock: opts.sponsorBlock
        ? ["sponsor", "intro", "outro", "selfpromo"]
        : undefined,
      playlist: opts.playlist,
    }),
  });

  if (!res.ok) {
    let msg = `Server returned ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const filenameHeader = res.headers.get("X-Filename");
  const filename =
    (filenameHeader && decodeURIComponent(filenameHeader)) ||
    suggestFilename(opts.url, opts.format);

  const blob = await res.blob();

  // Trigger browser download
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke to give browser time to start the download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);

  return { filename, bytes: blob.size, blob };
}

function suggestFilename(url: string, format: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || "download";
    return `${last.replace(/[^a-zA-Z0-9._-]/g, "_")}.${format}`;
  } catch {
    return `download.${format}`;
  }
}
