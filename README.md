# Music Mate

A self-hosted, no-account, no-tracking music & video downloader.

Paste a YouTube, Instagram, TikTok, SoundCloud, X, or 1,800+ other link. Choose your format. Get the file. Nothing leaves your machine except the fetch to the source platform.

## Features

- **Audio**: MP3 (128 / 192 / 320 kbps), M4A, Opus
- **Video**: MP4, WebM up to 4K
- **SponsorBlock**: auto-skip sponsors, intros, outros, self-promos on YouTube
- **Playlists**: queue multiple URLs and download sequentially
- **History**: local-only (localStorage, no server)
- **Dark / light / system theme**
- **No auth, no telemetry, no cloud**

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) (CLI)
- [`ffmpeg`](https://ffmpeg.org/) (post-processing)

## Requirements

- Node.js 18+
- `yt-dlp` in PATH (`brew install yt-dlp` / `pip install yt-dlp` / etc.)
- `ffmpeg` in PATH (`brew install ffmpeg`)

## Quick start

```bash
git clone https://github.com/gunawan/music-mate.git
cd music-mate
npm install
npm run dev
```

Open <http://localhost:3000>. Override the port with `npm run dev -- -p 3847`.

## Architecture

```
Browser  ──HTTP──▶  Next.js API route  ──subprocess──▶  yt-dlp  ──▶  ffmpeg
                                                               └────▶  tmp file
                                                                            │
Browser  ◀──ReadableStream─────────────────────────────────────────────────┘
```

- `src/lib/yt-dlp.ts` — subprocess spawner, progress parser, metadata fetcher
- `src/app/api/info` — `POST { url }` → JSON metadata
- `src/app/api/download` — `POST { url, kind, format, … }` → binary stream
- `src/app/api/health` — `GET` → version + reachability check
- `src/app/page.tsx` — single-URL download flow
- `src/app/queue/page.tsx` — batch URL queue
- `src/app/history/page.tsx` — local-only history (localStorage)

## Why Next.js, not Flutter / native?

Originally considered a native Android app (Flutter + bundled yt-dlp). It turned out `yt-dlp` is pure Python — bundling a Python runtime in an APK costs ~150MB and rebuilds per `yt-dlp` update. A self-hosted web app keeps the client tiny (~1MB) and updates instantly.

## License

MIT
