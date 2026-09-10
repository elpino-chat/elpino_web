import { Suspense } from 'react';
import type { Metadata } from "next";
import { AuthFlow } from "../components/auth/AuthFlow";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Elpino customer support workspace.",
  alternates: { canonical: `${SITE_URL}/login` },
  openGraph: {
    title: "Log In",
    description: "Sign in to your Elpino customer support workspace.",
    url: `${SITE_URL}/login`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Log In",
    description: "Sign in to your Elpino customer support workspace.",
  },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-1 items-center justify-center bg-white p-6">
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
          Preparing your workspace…
        </div>
      </div>
    }>
      <AuthFlow initialMode="login" />
    </Suspense>
  );
}
