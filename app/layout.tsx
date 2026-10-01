import type { Metadata } from "next";
import { Instrument_Serif, Geist_Mono, Rethink_Sans, Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AppShell } from "./components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "./components/Analytics";
import { SiteWidgetTag } from "./components/SiteWidgetTag";
import { NavigationLoader } from "./components/NavigationLoader";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
  display: "swap",
});

// The home hero heading's typeface: a grotesque with more character than Inter.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const neueHaas = Inter({
  variable: "--font-neue-haas",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elpino | AI Customer Support Platform",
    template: "%s | Elpino",
  },
  description:
    "Elpino answers customers instantly with AI trained on your knowledge base, and hands off to a human when it can't. Start with 100 free AI messages, then a monthly AI credit — not per-seat pricing.",
  keywords: [
    "AI customer support",
    "AI chatbot for support",
    "live chat widget",
    "customer support software",
    "help desk AI",
    "AI knowledge base",
    "support ticket automation",
    "AI live chat",
  ],
  authors: [{ name: "Elpino", url: SITE_URL }],
  creator: "Elpino",
  publisher: "Elpino",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Elpino",
    title: "Elpino | AI Customer Support Platform",
    description:
      "AI that answers customers instantly and hands off to a human when it can't. Live chat widget, knowledge base, and 100 free AI messages, then a monthly AI credit — not per-seat pricing.",
    // og:image comes from the app/opengraph-image.tsx file convention.
  },
  twitter: {
    card: "summary_large_image",
    title: "Elpino | AI Customer Support Platform",
    description:
      "AI that answers customers instantly and hands off to a human when it can't help.",
    creator: "@elpino",
  },
  // No root-level alternates.canonical: it cascades to child pages that don't
  // set their own, wrongly declaring the homepage as their canonical URL.
  // The homepage canonical lives in app/page.tsx.
  // Icons come from the app/ file conventions: favicon.ico, icon.png, apple-icon.png.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The signed-in state is resolved in the browser (see AppShell), so this
  // layout reads no cookies and marketing pages can be prerendered and cached.
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistMono.variable} ${rethinkSans.variable} ${bricolage.variable} ${neueHaas.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-text-primary">
        <AppShell>{children}</AppShell>
        <NavigationLoader />
        <Toaster position="top-center" />
        <Analytics />
        <SiteWidgetTag />
      </body>
    </html>
  );
}
