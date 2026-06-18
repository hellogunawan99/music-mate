"use client";

import * as React from "react";
import { cn, formatBytes, formatDuration, formatSpeed } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100 */
  percent: number;
  downloadedBytes?: number;
  totalBytes?: number;
  speedBps?: number;
  etaSec?: number;
  /** Visual mode — "shimmer" adds a moving highlight while in progress. */
  state?: "downloading" | "postprocessing" | "complete" | "error";
  className?: string;
}

/**
 * Animated progress bar with optional shimmer effect.
 *
 * Renders the bar at the top and a metadata strip below it. Numbers
 * use tabular-nums so they don't shift width as digits change.
 */
export function ProgressBar({
  percent,
  downloadedBytes,
  totalBytes,
  speedBps,
  etaSec,
  state = "downloading",
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-sunken",
          state === "downloading" && "shimmer",
        )}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200",
            state === "complete" ? "bg-emerald-500" : "gradient-bg",
          )}
          style={{
            width: `${clamped}%`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-fg-muted tabular-nums">
        <span className="font-medium">
          {state === "postprocessing"
            ? "Converting & embedding metadata"
            : state === "complete"
              ? "Done"
              : `${clamped.toFixed(1)}%`}
        </span>
        <span className="flex items-center gap-2">
          {downloadedBytes !== undefined && totalBytes !== undefined && (
            <span>
              {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
            </span>
          )}
          {speedBps !== undefined && state === "downloading" && (
            <span>{formatSpeed(speedBps)}</span>
          )}
          {etaSec !== undefined && state === "downloading" && (
            <span>· ETA {formatDuration(etaSec)}</span>
          )}
        </span>
      </div>
    </div>
  );
}