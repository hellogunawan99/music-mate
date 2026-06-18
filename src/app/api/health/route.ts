import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const YT_DLP_BIN = process.env.YT_DLP_BIN || "yt-dlp";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { stdout } = await execFileAsync(YT_DLP_BIN, ["--version"], {
      timeout: 5000,
    });
    const ffmpegCheck = await execFileAsync("ffmpeg", ["-version"], {
      timeout: 5000,
    }).then(
      () => true,
      () => false,
    );
    return NextResponse.json({
      ok: true,
      ytDlp: stdout.trim(),
      ffmpeg: ffmpegCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message, hint: "yt-dlp not found in PATH" },
      { status: 503 },
    );
  }
}
