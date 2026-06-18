"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Accessible animated switch.
 *
 * Renders a real <button role="switch"> (so screen readers and keyboard
 * users get the right semantics) plus a label/description pair. The
 * knob slides with a spring-ish ease-out; in the "on" state the track
 * is filled with the brand gradient.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  id,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;
  return (
    <label
      htmlFor={switchId}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full",
          "transition-colors duration-200",
          checked ? "gradient-bg" : "bg-sunken border border-default",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm",
            "transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && <div className="text-sm font-medium text-fg">{label}</div>}
          {description && (
            <div className="text-xs text-fg-muted mt-0.5">{description}</div>
          )}
        </div>
      )}
    </label>
  );
}