import { NextResponse } from "next/server";
import { z } from "zod";
import { downloadMedia } from "@/lib/yt-dlp";

const Body = z.object({
  url: z.string().url().or(z.string().min(1)),
  kind: z.enum(["audio", "video"]).default("audio"),
  format: z
    .enum(["mp3", "m4a", "opus", "mp4", "webm"])
    .default("mp3"),
  audioQualityKbps: z.union([z.literal(128), z.literal(192), z.literal(320)]).optional(),
  videoMaxHeight: z
    .union([z.literal(720), z.literal(1080), z.literal(1440), z.literal(2160)])
    .optional(),
  sponsorBlock: z
    .array(z.enum(["sponsor", "intro", "outro", "selfpromo"]))
    .optional(),
  playlist: z.boolean().optional(),
  embedMetadata: z.boolean().optional(),
});

export const runtime = "nodejs";
// yt-dlp downloads can take several minutes for long videos; allow up to 5 min.
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const opts = parsed.data;
  try {
    const handle = await downloadMedia({
      url: opts.url,
      kind: opts.kind,
      format: opts.format,
      audioQualityKbps: opts.audioQualityKbps,
      videoMaxHeight: opts.videoMaxHeight,
      sponsorBlock: opts.sponsorBlock,
      playlist: opts.playlist,
      embedMetadata: opts.embedMetadata,
    });

    // Convert Node ReadableStream -> Web ReadableStream and attach headers.
    const headers = new Headers();
    headers.set("Content-Type", handle.contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(handle.filename)}`,
    );
    headers.set("X-Filename", encodeURIComponent(handle.filename));

    return new Response(handle.stream as any, { headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
