import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` produces a minimal server.js + node_modules tree that
  // the Docker image can COPY --from=builder without dragging the entire
  // dev toolchain into the runtime layer. ~150MB savings on the final image.
  output: "standalone",

  // Allow images served from /public/generated/* (and any future
  // remote thumbnails we may want to optimize). The generated feature
  // visuals are static PNGs in /public, so this only matters if we ever
  // swap to remote <Image src="https://..."> — but set it now to keep
  // the option open.
  images: {
    unoptimized: true,
  },

  // Experimental flags — keep server actions etc. default
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;