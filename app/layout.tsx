import type { Metadata } from "next";
import { Outfit, Instrument_Serif, Geist_Mono, Rethink_Sans, Inter_Tight, Geist, Noto_Serif, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "./components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "./components/Analytics";
import { requireSession } from "./api/onboarding/_lib/require-user";

export const dynamic = 'force-dynamic';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

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

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jet-brains",
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
    "Elpino answers customers instantly with AI trained on your knowledge base, and hands off to a human when it can't. Pricing built around resolutions, not seats.",
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
  authors: [{ name: "Jagdeep Singh", url: SITE_URL }],
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
      "AI that answers customers instantly and hands off to a human when it can't. Live chat widget, knowledge base, and pricing built around resolutions, not seats.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved once here (not per-page) so every marketing page — home,
  // pricing, faq, etc. — can render the signed-in header state without each
  // one re-checking the session cookie itself. Null (not logged in) is the
  // common case for public pages and is cheap to compute either way.
  const session = await requireSession().catch(() => null);

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${instrumentSerif.variable} ${geistMono.variable} ${rethinkSans.variable} ${interTight.variable} ${geistSans.variable} ${notoSerif.variable} ${jetBrainsMono.variable} ${neueHaas.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-text-primary">
        <AppShell session={session}>{children}</AppShell>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
