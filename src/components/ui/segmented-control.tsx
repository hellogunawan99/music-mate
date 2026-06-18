"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode; description?: string }>;
  /** When set, render vertical stacked cards (used for the format selector). */
  layout?: "inline" | "stack";
  size?: "sm" | "md";
  className?: string;
  ariaLabel: string;
}

/**
 * A two-state segmented control with a sliding indicator.
 *
 * Inline layout: pill of buttons with an animated background indicator
 * that slides between options on value change.
 *
 * Stack layout: vertical cards that fill the available width — used for
 * format selection where each option needs more room.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  layout = "inline",
  size = "md",
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  if (layout === "stack") {
    return (
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn("grid gap-2", className)}
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "card-hover rounded-xl text-left p-3 sm:p-4 cursor-pointer",
                "border transition-all",
                active
                  ? "border-transparent bg-elevated ring-2"
                  : "bg-elevated border-default hover:border-strong",
              )}
              style={
                active
                  ? ({ "--tw-ring-color": "var(--accent-500)" } as React.CSSProperties)
                  : undefined
              }
            >
              <div
                className={cn(
                  "font-semibold text-sm",
                  active ? "gradient-text" : "text-fg",
                )}
              >
                {opt.label}
              </div>
              {opt.description && (
                <div className="text-xs text-fg-muted mt-0.5">{opt.description}</div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Inline pill layout with sliding indicator
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    const el = refs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    setIndicator({
      left: elRect.left - cRect.left,
      width: elRect.width,
    });
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex p-1 rounded-xl border border-default bg-sunken",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      {indicator && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-lg bg-elevated shadow-sm transition-all duration-200"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
      )}
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 px-3 sm:px-4 py-1.5 rounded-lg cursor-pointer font-medium",
              "transition-colors duration-200",
              active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}