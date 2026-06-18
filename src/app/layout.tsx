import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Mate — Download audio & video from anywhere",
  description:
    "Paste a link from YouTube, Instagram, TikTok, SoundCloud, X, or 1,800+ other sites. No accounts. No tracking. Runs on your machine.",
  applicationName: "Music Mate",
};

/**
 * Inline theme bootstrap. Runs *before* React hydrates to apply the user's
 * stored theme (or system preference) so we don't get a flash of light
 * mode when the user actually prefers dark.
 */
const themeBootstrap = `
(function() {
  try {
    var stored = localStorage.getItem("music-mate:theme");
    var theme = stored === "light" || stored === "dark" ? stored : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className="min-h-full flex flex-col bg-base text-fg"
        /* Browser extensions (Grammarly, etc.) inject `data-*` attributes
           into <body> at load time. `suppressHydrationWarning` is the
           documented Next.js workaround. */
        suppressHydrationWarning
      >
        <ToastProvider>
          <Nav />
          {children}
          <footer className="mt-auto border-t border-default py-6 text-center text-xs text-fg-subtle">
            Music Mate · self-hosted · powered by yt-dlp + ffmpeg
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}