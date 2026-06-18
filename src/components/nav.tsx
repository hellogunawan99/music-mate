"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, History, ListMusic, Moon, Sun, Monitor } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Download", icon: Download },
  { href: "/queue", label: "Queue", icon: ListMusic },
  { href: "/history", label: "History", icon: History },
];

export function Nav() {
  const pathname = usePathname();
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("music-mate:theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const apply = (t: "light" | "dark") => {
      root.classList.remove("light", "dark");
      root.classList.add(t);
    };
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mql.matches ? "dark" : "light");
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      apply(theme);
    }
  }, [theme]);

  const cycle = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("music-mate:theme", next);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="Music Mate home"
        >
          <BrandMark size={28} className="transition-transform group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-fg tracking-tight">Music Mate</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 cursor-pointer",
                  "transition-colors duration-200",
                  active
                    ? "bg-sunken text-fg"
                    : "text-fg-muted hover:text-fg hover:bg-sunken",
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={cycle}
            className="ml-2 p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-sunken cursor-pointer transition-colors"
            aria-label={`Theme: ${theme}`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile nav toggle */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={cycle}
            className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-sunken cursor-pointer"
            aria-label="Toggle theme"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-sunken cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6"  x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-default">
          <div className="px-4 py-2 flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer",
                    active
                      ? "bg-sunken text-fg"
                      : "text-fg-muted hover:text-fg hover:bg-sunken",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}