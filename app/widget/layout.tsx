import type { Metadata } from "next";

// page.tsx here is a client component ("use client"), so it can't export
// `metadata` itself — Next only reads that export from Server Components.
// This thin server layout is the only way to attach page-level robots
// control to it; the matching X-Robots-Tag header in next.config.ts and the
// disallow rule in app/robots.ts cover crawlers that skip rendered <head>.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
