# ============================================================
# Music Mate — Dockerfile
# ============================================================
# Multi-stage build:
#   1. deps      — install npm dependencies (cached separately)
#   2. builder  — build the Next.js standalone output
#   3. runner   — slim runtime image with Node + yt-dlp + ffmpeg
#
# Image size target: < 400MB
# ============================================================

# ---------- 1. deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Copy lockfile + package.json first for layer caching
COPY package.json package-lock.json ./

# Use `npm ci` for reproducible, lockfile-driven installs
RUN npm ci --no-audit --no-fund

# ---------- 2. builder ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Pull in already-resolved node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the standalone output (configured in next.config.ts)
RUN npm run build

# ---------- 3. runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install yt-dlp + ffmpeg at runtime layer. We pin yt-dlp to the latest
# stable; the image will need a rebuild to pick up extractor fixes.
# ffmpeg is required by yt-dlp for the audio extraction + mp3 encode step.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        ffmpeg \
        ca-certificates \
    && pip3 install --no-cache-dir --break-system-packages "yt-dlp>=2024.10.7" \
    && apt-get purge -y python3-pip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* /root/.cache

# Create non-root user. yt-dlp writes nothing outside /tmp, and the
# download endpoint writes into Next.js's temp dir, so /app being
# non-writable by `app` user is fine.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home /app --shell /sbin/nologin nextjs

# Copy the standalone output from the builder. Next.js produces a
# self-contained server.js + minimal node_modules under .next/standalone.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public assets (generated feature images, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Health check — pings /api/health which returns yt-dlp + ffmpeg version.
# If either is missing, the container is broken even if HTTP is up.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]