"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieNotice } from "./CookieNotice";
import { useStoredLanguage } from "../hooks/useStoredLanguage";

type Session = { email: string; name?: string; userId: string };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Resolved in the browser so the root layout stays static (no cookies read
  // on the server) and public pages can be prerendered.
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { email?: string; name?: string } | null) => {
        if (!cancelled && d?.email) setSession({ email: d.email, name: d.name, userId: d.email.trim().toLowerCase() });
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [pathname]);
  const isBareAuthPage =
    pathname === "/forgot-password" || pathname === "/reset-password";
  const isMinimalHeaderAuthPage = pathname === "/login" || pathname === "/signup";
  const isAppPage = pathname === "/onboarding" || pathname.startsWith("/dashboard");
  const isEmbeddedWidget = pathname.startsWith("/widget");
  const isDocsPage = pathname === "/docs" || pathname.startsWith("/docs/");
  const language = useStoredLanguage();

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

  if (isDocsPage) {
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
          into --elpino-header-h. The home, pricing, privacy, terms, careers, contact, changelog, security-guide, brand-kit and about pages skip it: their hero artwork runs
          behind the header, and each hero pads its own content down instead. */}
      <main className="flex flex-1 flex-col" style={pathname === '/' || pathname === '/pricing' || pathname === '/privacy' || pathname === '/terms' || pathname === '/careers' || pathname === '/contact' || pathname === '/changelog' || pathname === '/security-guide' || pathname === '/brand-kit' || pathname === '/about' || pathname === '/product/knowledge-hub' || pathname === '/product/inbox' || pathname === '/product/ai-agent' || pathname === '/features' || pathname === '/product/tickets' || pathname === '/product/helpdesk' || pathname === '/solutions/founders' || pathname === '/solutions/busy-operators' || pathname === '/solutions/busy' || pathname === '/solutions/developers' || pathname === '/integrations' ? undefined : { paddingTop: 'var(--elpino-header-h, 64px)' }}>{children}</main>
      <Footer editorial={pathname === '/pricing' || pathname === '/about'} />
      <CookieNotice />
    </>
  );
}
