"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieNotice } from "./CookieNotice";
import { useStoredLanguage } from "../hooks/useStoredLanguage";

type Session = { email: string; name?: string; userId: string };

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const isBareAuthPage =
    pathname === "/forgot-password" || pathname === "/reset-password";
  const isMinimalHeaderAuthPage = pathname === "/login" || pathname === "/signup";
  const isAppPage = pathname === "/onboarding" || pathname.startsWith("/dashboard");
  const isEmbeddedWidget = pathname.startsWith("/widget");
  const isDocsLandingPage = pathname === "/docs";
  const language = useStoredLanguage();

  // Keep the document language in sync with the site-wide picker. This helps
  // screen readers choose the right voice and makes locale-aware UI reliable.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!session) return;

    posthog.identify(session.userId, {
      email: session.email,
      name: session.name,
    });
  }, [session?.userId, session?.email, session?.name]);

  if (isEmbeddedWidget) {
    // The widget is a small fixed-size iframe box — nothing inside it
    // should ever grow past that and make the outer page itself scroll.
    // Whichever inner container needs to scroll (the message list, the
    // pre-chat form) does so on its own; this just guarantees it's the
    // only scrollbar.
    return <main className="h-dvh overflow-hidden">{children}</main>;
  }

  if (isAppPage || isBareAuthPage) {
    return <main className="flex flex-1 flex-col">{children}</main>;
  }

  if (isMinimalHeaderAuthPage) {
    return <main className="flex min-h-screen flex-col">{children}</main>;
  }

  if (isDocsLandingPage) {
    return (
      <>
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <CookieNotice />
      </>
    );
  }

  return (
    <>
      <Header session={session} variant="light" showOffer={['/features', '/faq', '/trust', '/contact'].includes(pathname)} />
      {/* Header is fixed (see Header.tsx) so it no longer reserves this
          space itself — pad it back in here, using the height Header measures
          into --elpino-header-h so this stays correct if the offer bar is
          dismissed or the header's own height otherwise changes. */}
      <main className="flex flex-1 flex-col" style={{ paddingTop: 'var(--elpino-header-h, 64px)' }}>{children}</main>
      <Footer editorial={pathname === '/pricing' || pathname === '/about'} />
      <CookieNotice />
    </>
  );
}
