"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import posthog from "posthog-js";
import { ArrowLeftRight } from "lucide-react";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { setStoredLanguage, useStoredLanguage } from "@/app/hooks/useStoredLanguage";

// Window.ElpinoTag is already declared globally in SiteWidgetTag.tsx (with
// both logout and identify) — redeclaring it here with a narrower shape
// would conflict, so this file just relies on that ambient declaration.

type ConnectSession = { email: string; name?: string; userId: string; image?: string };

// Same visual language as /onboarding (same header, typography, button and
// input styles) rather than the marketing site's bolder "sticker" look —
// this page only ever appears to someone already signed in, mid-flow with
// a real product task (linking a WordPress site), same as onboarding's own
// steps. See onboarding-client.tsx for the classes this mirrors.
const primaryButtonClass =
  "mt-8 flex h-14 w-fit min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#18191b] px-6 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d5d5d8] disabled:text-white";
const spinner = <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />;

type SiteTag = { id: string; name: string; domain: string; publicKey: string; allowedHosts?: string[]; allowLocalhost?: boolean };

function normalizeHost(value: string): string {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return value.replace(/^www\./, "").toLowerCase();
  }
}

function isLocalDevHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function appendWebsiteId(returnUrl: string, publicKey: string): string {
  const separator = returnUrl.includes("?") ? "&" : "?";
  return `${returnUrl}${separator}elpino_website_id=${encodeURIComponent(publicKey)}`;
}

function WordPressMark() {
  // A plain letter mark rather than the official WordPress logo artwork —
  // same fallback-icon convention as IntegrationsContent.tsx's Cashfree/
  // Paystack "C"/"P" circles, not a claim to reproduce the trademark.
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-black/10 bg-[#21759b] text-lg font-bold text-white">W</span>
  );
}

// Same header as /onboarding (logo, language switcher, account menu) — see
// onboarding-client.tsx's own header markup, which this mirrors closely so
// the two feel like the same product rather than a bolted-on extra page.
function Header({ session }: { session: ConnectSession | null }) {
  const router = useRouter();
  const language = useStoredLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userInitials = session
    ? (session.name?.trim() || session.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")
    : "";

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      posthog.reset();
      window.ElpinoTag?.logout?.();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="relative z-30 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
        <Link href="/" aria-label="Elpino home" className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20">
          <Image src="/elpino.png" alt="Elpino" width={906} height={275} priority className="h-8 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher language={language} onChange={setStoredLanguage} light open={languageOpen} onOpenChange={(open) => { setLanguageOpen(open); if (open) setAvatarOpen(false); }} />
          {session && (
            <>
              <span aria-hidden="true" className="hidden h-7 w-px bg-black/10 sm:block" />
              <div className="relative">
                <button type="button" onClick={() => { setAvatarOpen((open) => !open); setLanguageOpen(false); }} aria-label="Open account menu" aria-expanded={avatarOpen} className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 outline-none ring-offset-2 transition hover:border-black/10 hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-black/20 sm:gap-3 sm:pr-3">
                  {session.image ? (
                    <Image src={session.image} alt={session.name || "User"} width={38} height={38} className="size-[38px] rounded-full object-cover ring-1 ring-black/10" />
                  ) : (
                    <span className="flex size-[38px] items-center justify-center rounded-full bg-[#202124] text-xs font-semibold text-white ring-1 ring-black/10">{userInitials}</span>
                  )}
                  <span className="hidden max-w-36 text-left sm:block"><span className="block truncate text-[13px] font-semibold leading-4 text-[#202124]">{session.name || session.email.split("@")[0]}</span><span className="block truncate text-[11px] leading-4 text-black/45">Account</span></span>
                  <svg className={`size-4 text-[#596273] transition-transform ${avatarOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {avatarOpen && (
                  <>
                    <button type="button" aria-label="Close account menu" onClick={() => setAvatarOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                    <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-[0_22px_60px_rgba(20,20,20,0.14)]">
                      <div className="border-b border-black/[0.07] px-3 py-3">
                        <p className="truncate text-sm font-normal text-[#20242d]">{session.name || session.email.split("@")[0]}</p>
                        <p className="mt-0.5 truncate text-xs text-black/50">{session.email}</p>
                      </div>
                      <button type="button" onClick={() => void logout()} disabled={signingOut} className="mt-1 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-normal text-[#333842] transition hover:bg-[#f4f6fa] disabled:opacity-50">
                        {signingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function WordpressConnectClient({ session }: { session: ConnectSession | null }) {
  const params = useSearchParams();
  const returnUrl = params.get("return_url")?.trim() ?? "";
  const siteUrl = params.get("site_url")?.trim() ?? "";

  // No onboarding-completion check here: proxy.ts already requires a signed-
  // in session for /connect, and every account gets a workspace lazily
  // auto-created on first use regardless of onboarding (see
  // ensureDefaultOrganization in auth-service's auth.service.ts) — the
  // /api/workspace/sites call in handleContinue() below just works, first
  // try, for a signup that skipped onboarding entirely (see
  // AuthFlow.tsx's skipsOnboarding()).
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (submitting || !returnUrl) return;
    setError(null);
    setSubmitting(true);
    try {
      const sitesResponse = await fetch("/api/workspace/sites", { cache: "no-store" });
      const sitesData = (await sitesResponse.json()) as { sites?: SiteTag[]; message?: string };
      if (!sitesResponse.ok) throw new Error(sitesData.message ?? "Could not load your sites.");
      const sites = sitesData.sites ?? [];

      if (!siteUrl) throw new Error("This connect link is missing the site's URL.");
      const hostname = normalizeHost(siteUrl);
      const matched = sites.find(site => normalizeHost(site.domain) === hostname || site.allowedHosts?.includes(hostname));
      let selected = matched;
      if (!selected && sites.length) {
        selected = sites.find(site => hostname.endsWith(`.${normalizeHost(site.domain)}`));
        if (!selected && isLocalDevHostname(hostname) && sites.length === 1) selected = sites[0];
        if (!selected) throw new Error("This workspace is connected to another domain. Select the workspace for this website.");
      }
      if (selected && (!matched || (isLocalDevHostname(hostname) && !selected.allowLocalhost))) {
        const response = await fetch(`/api/workspace/sites/${encodeURIComponent(selected.id)}`, {
          method: "PATCH", headers: { "content-type": "application/json" },
          body: JSON.stringify(isLocalDevHostname(hostname) ? { allowLocalhost: true } : { allowedHosts: [...new Set([...(selected.allowedHosts ?? []), hostname])] }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message ?? "Could not authorize this website.");
      }
      let publicKey = selected?.publicKey;

      if (!publicKey) {
        if (!siteUrl) throw new Error("This connect link is missing the site's URL.");
        const domain = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
        const createResponse = await fetch("/api/workspace/sites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: normalizeHost(siteUrl), domain, allowLocalhost: isLocalDevHostname(normalizeHost(siteUrl)), permissions: { support: true, visitors: true, analytics: true } }),
        });
        const createData = (await createResponse.json()) as { site?: SiteTag; message?: string };
        if (!createResponse.ok || !createData.site) throw new Error(createData.message ?? "Could not connect this site.");
        publicKey = createData.site.publicKey;
      }

      window.location.href = appendWebsiteId(returnUrl, publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  if (!returnUrl) {
    return (
      <main className="relative flex min-h-screen flex-col bg-[#fffefe] font-[family-name:var(--font-rethink-sans)] text-[#111214]">
        <Header session={session} />
        <div className="flex flex-1 flex-col items-center px-6 pb-28 pt-[clamp(2.5rem,8vh,6rem)]">
          <div className="w-full max-w-[560px] text-left">
            <h1 className="text-balance text-[clamp(1.6rem,3vw,2rem)] font-normal leading-[1.15] tracking-[-0.03em]">This link isn&apos;t working</h1>
            <p className="mt-3 text-[16px] text-black/55">This connect link is missing a return address. Open the Elpino Chat page in your WordPress admin again and tap &ldquo;Connect to Elpino.&rdquo;</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-[#fffefe] font-[family-name:var(--font-rethink-sans)] text-[#111214]">
      <Header session={session} />
      <div className="flex flex-1 flex-col items-center px-6 pb-28 pt-[clamp(2.5rem,8vh,6rem)]">
        <div className="w-full max-w-[560px] text-left">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-black/10 bg-white p-1.5">
              <Image src="/icon.png" alt="" width={40} height={40} className="size-full object-contain" />
            </span>
            <ArrowLeftRight size={16} className="text-black/25" />
            <WordPressMark />
          </div>

          <h1 className="text-balance text-[clamp(1.9rem,3.2vw,2.35rem)] font-normal leading-[1.12] tracking-[-0.03em]">Link Elpino with WordPress</h1>
          <p className="mt-3 text-[16px] text-black/55">Connect this WordPress website to your selected Elpino workspace.</p>

          {siteUrl && <p className="mt-3 text-sm text-black/55">Continuing authorizes <strong>{normalizeHost(siteUrl)}</strong> for this widget. An existing key is reused for this domain or an explicitly added subdomain. Local testing enables localhost access.</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button type="button" disabled={submitting} onClick={() => void handleContinue()} className={primaryButtonClass}>
            {submitting ? <>{spinner}Connecting…</> : "Continue"}
          </button>

          <Link href="/dashboard" className="mt-6 block text-sm text-black/45 underline-offset-2 hover:underline">Cancel and go to my dashboard</Link>
        </div>
      </div>
    </main>
  );
}
