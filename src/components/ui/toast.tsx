"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  /** ms */
  duration: number;
}

interface ToastContextValue {
  show: (t: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback<ToastContextValue["show"]>(
    (t) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((prev) => [...prev, { ...t, id }]);
      if (t.duration > 0) {
        setTimeout(() => dismiss(id), t.duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      >
        {items.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "text-emerald-500",
  error: "text-rose-500",
  info: "text-sky-500",
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const Icon = ICONS[toast.variant];
  return (
    <div
      role="status"
      className={cn(
        "fade-in-up pointer-events-auto glass rounded-xl p-3 pr-2",
        "flex items-start gap-3 shadow-lg",
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", COLORS[toast.variant])} />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-fg">{toast.title}</div>
        {toast.description && (
          <div className="text-xs text-fg-muted mt-0.5 break-words">{toast.description}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded-md text-fg-muted hover:text-fg hover:bg-sunken cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}