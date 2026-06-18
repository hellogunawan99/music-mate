import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchMetadata } from "@/lib/yt-dlp";

const Body = z.object({
  url: z.string().url().or(z.string().min(1)),
});

export const runtime = "nodejs";
export const maxDuration = 60;

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

  try {
    const meta = await fetchMetadata(parsed.data.url);
    return NextResponse.json({ ok: true, metadata: meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
