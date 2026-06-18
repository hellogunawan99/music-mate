import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Width in pixels; height is auto-scaled to preserve aspect. */
  size?: number;
  /** Show a soft glow halo behind the mark. */
  withGlow?: boolean;
  className?: string;
}

/**
 * Music Mate brand mark — a stylized audio waveform with a download arrow
 * integrated into the tallest bar. Renders crisp at any size (no raster).
 *
 * The gradient stroke is the visual identity of the app; reusing it on
 * backgrounds, headings, and the progress bar keeps the brand coherent.
 */
export function BrandMark({ size = 32, withGlow = false, className }: BrandMarkProps) {
  const id = React.useId();
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {withGlow && (
        <span
          className="absolute inset-0 rounded-full blur-2xl opacity-50"
          style={{ background: "var(--gradient-brand)" }}
        />
      )}
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="relative"
        role="img"
        aria-label="Music Mate"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Four bars, ascending then descending (waveform silhouette).
            The middle bar is the "download arrow" — a triangle at the tip. */}
        <rect x="3"  y="13" width="3" height="6"  rx="1.5" fill={`url(#${id})`} />
        <rect x="9"  y="9"  width="3" height="14" rx="1.5" fill={`url(#${id})`} />
        <rect x="15" y="3"  width="3" height="20" rx="1.5" fill={`url(#${id})`} />
        {/* Download arrowhead (subtle pointer) */}
        <path d="M16.5 11 L13 14.5 L20 14.5 Z" fill={`url(#${id})`} opacity="0.95" />
        <rect x="21" y="9"  width="3" height="14" rx="1.5" fill={`url(#${id})`} />
        <rect x="27" y="13" width="3" height="6"  rx="1.5" fill={`url(#${id})`} />
      </svg>
    </span>
  );
}