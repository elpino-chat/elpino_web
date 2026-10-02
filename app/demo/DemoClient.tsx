"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, MessageCircle } from "lucide-react";

// The public demo: one input for the visitor's website. Elpino reads the site's pages, and the real widget is
// shown on a preview of it so the visitor can ask it questions.
// Everything lives in a throwaway workspace that the backend deletes after a day.

type Step = "domain" | "crawling" | "preview";
type CrawlState = "idle" | "crawling" | "ready" | "failed";
type Status = { state?: CrawlState; domain?: string; siteKey?: string; pagesRead?: number; pages?: { title: string; url: string | null }[]; error?: string };

const TOKEN_KEY = "elpino-demo-token";
const TAG_SRC = process.env.NODE_ENV === "development" ? "/tag.js" : "https://cdn.elpino.chat/tag.js";

function store(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch { /* private window: the flow still works, it just can't resume after a refresh */ }
}
function load(key: string) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

async function post<T>(path: string, body: unknown): Promise<T & { error?: string }> {
  try {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok && !data.error) return { ...data, error: res.status === 429 ? "Too many attempts. Please wait a little and try again." : "Something went wrong. Please try again." };
    return data;
  } catch {
    return { error: "We couldn't reach the server. Check your connection and try again." } as T & { error?: string };
  }
}

const WHAT_YOU_GET = [
  "Answers come from your own pages, not guesses",
  "Hands off to your team when it is not sure",
  "Shared inbox with every AI answer visible",
  "Unlimited seats on every plan, Free too",
  "Orders and payments looked up live from Stripe and Shopify",
  "Handing a conversation to a human never costs extra",
];

const buttonClass = "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-black px-6 text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60";

export function DemoClient() {
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pick up where a refresh left off.
  useEffect(() => {
    const saved = load(TOKEN_KEY);
    if (!saved) return;
    fetch(`/api/demo/status?token=${encodeURIComponent(saved)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Status | null) => {
        if (!data || data.error) { store(TOKEN_KEY, null); return; }
        setToken(saved);
        setStatus(data);
        if (data.state === "ready") setStep("preview");
        else if (data.state === "crawling") setStep("crawling");
      })
      .catch(() => undefined);
  }, []);

  const expire = useCallback(() => {
    store(TOKEN_KEY, null);
    setToken(null);
    setStep("domain");
    setError("Your session expired. Enter your website again.");
  }, []);

  // While Elpino reads the site, ask how far it has got.
  useEffect(() => {
    if (step !== "crawling" || !token) return;
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/demo/status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (res.status === 401) { if (!stopped) expire(); return; }
        const data = (await res.json()) as Status;
        if (stopped) return;
        setStatus(data);
        if (data.state === "ready") setStep("preview");
        else if (data.state === "failed") { store(TOKEN_KEY, null); setToken(null); setStep("domain"); setError("We couldn't read any pages on that website. Check the address, or make sure the site is public and allows crawling."); }
      } catch { /* try again on the next tick */ }
    };
    void poll();
    const id = window.setInterval(poll, 2500);
    return () => { stopped = true; window.clearInterval(id); };
  }, [step, token, expire]);

  async function start(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    const result = await post<{ token?: string; siteKey?: string; domain?: string }>("/api/demo/start-open", { domain });
    setBusy(false);
    if (result.error || !result.token || !result.siteKey) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    store(TOKEN_KEY, result.token);
    setToken(result.token);
    setStatus({ state: "crawling", domain: result.domain, siteKey: result.siteKey, pages: [] });
    setStep("crawling");
  }

  function reset() {
    store(TOKEN_KEY, null);
    setToken(null); setStatus({}); setDomain(""); setError(null); setStep("domain");
  }

  return (
    <main className="bg-white text-[#11120f]">
      <section className="px-5 pb-16 pt-32 sm:px-8 lg:px-20 lg:pb-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.02em]">Live demo</p>
              <h1 className="mt-4 text-balance text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">See Elpino answer questions about your business.</h1>
              <p className="mt-8 max-w-xl text-lg leading-7 text-black/75">Enter your website. Elpino reads your public pages, then you chat with an AI agent that answers from them, just as your customers would.</p>
              <p className="mt-9 flex items-center gap-2 text-[16px]"><span className="flex size-[18px] items-center justify-center rounded-full bg-[#11120f] text-white"><Check size={11} strokeWidth={3.5} aria-hidden="true" /></span><span><b className="font-semibold">Free demo.</b> No credit card, no install.</span></p>

              {step === "domain" && (
                <form onSubmit={start} className="mt-5 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor="demo-domain">Website</label>
                  <input id="demo-domain" required autoFocus inputMode="url" autoCapitalize="none" spellCheck={false} value={domain} onChange={(e) => { setDomain(e.target.value); if (error) setError(null); }} placeholder="www.yourcompany.com" className="h-14 min-w-0 flex-1 rounded-[10px] border border-black/30 bg-white px-5 text-[16px] text-[#111214] outline-none transition placeholder:text-[#9a9da3] hover:border-black focus:border-black focus:ring-4 focus:ring-black/[0.06]" />
                  <button type="submit" disabled={busy || !domain.trim()} className="inline-flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#11120f] px-7 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d5d5d8]">{busy ? <Loader2 size={17} className="animate-spin" /> : null} Try it on my website <ArrowRight size={17} /></button>
                </form>
              )}

              {step === "crawling" && (
                <div className="mt-6 max-w-xl text-left" aria-live="polite">
                  <p className="flex items-center gap-3 text-lg"><Loader2 size={20} className="animate-spin" />Reading {status.domain ?? "your website"}…</p>
                  <p className="mt-2 text-[15px] text-black/55">Elpino is learning your pricing, FAQs and contact details. This usually takes under a minute.</p>
                  <ul className="mt-5 space-y-2 text-[15px]">
                    {(status.pages ?? []).map((p) => (
                      <li key={`${p.url}-${p.title}`} className="flex items-start gap-2"><Check size={16} className="mt-1 shrink-0 text-[#1aa37a]" /><span className="min-w-0 truncate">{p.title || p.url}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <p role="alert" className="mt-6 max-w-xl rounded-md border border-[#c0392b]/30 bg-[#c0392b]/5 px-4 py-3 text-[14px] text-[#a52a1d]">{error}</p>}
            </div>

            <HeroMock />
          </div>

          {step === "preview" && token && status.siteKey && <div className="mt-12"><Preview siteKey={status.siteKey} domain={status.domain ?? ""} pages={status.pages ?? []} onReset={reset} /></div>}
        </div>
      </section>

      {step === "domain" && (
        <>
          <section className="bg-white px-5 pb-20 sm:px-8 lg:px-20 lg:pb-24">
            <div className="mx-auto max-w-[1500px]">
              <h2 className="max-w-[18ch] text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Answers you can trust.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">Elpino answers from what your business has published, and brings in your team when it should.</p>
              <ul className="mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {WHAT_YOU_GET.map((item) => (
                  <li key={item} className="flex items-start gap-3 border-t border-black/15 pt-4 text-[15px] leading-6 text-black/80">
                    <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-md bg-[#1aa37a] text-white"><Check size={11} strokeWidth={3.5} aria-hidden="true" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      <section className="bg-white px-5 pb-24 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-[1500px] overflow-hidden rounded-[10px] border border-black/40 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <h2 className="max-w-xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Like what you see?</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-black/60">Start free with 100 AI messages, with unlimited seats on every plan. Add your own knowledge, connect your tools and put the widget on your site.</p>
            <p className="mt-10 max-w-xl text-[13px] leading-5 text-black/50">The demo uses a temporary workspace that is deleted after a day. We only read public pages of the website you enter. By continuing you agree to our <Link href="/terms" className="underline underline-offset-2">terms</Link> and <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.</p>
          </div>
          <div className="flex flex-col bg-[#11120f] p-8 text-white sm:p-10">
            <h3 className="text-3xl font-medium tracking-[-0.03em]">Start free</h3>
            <p className="mt-2 text-sm text-white/60">No credit card required</p>
            <Link href="/signup" className="group mt-7 inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#0078f4] px-5 text-[15px] font-medium text-white transition hover:bg-[#006bdb]">Create your workspace <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link href="/contact" className="mt-3 inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-5 text-[15px] font-medium text-white transition hover:border-white">Talk to us</Link>
            <Link href="/pricing" className="mt-auto pt-8 text-sm text-white/60 underline underline-offset-4 hover:text-white">See pricing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// A sketch of the agent at work, so the hero shows what the demo does before the visitor enters anything.
function HeroMock() {
  const steps = ["Search knowledge", "Read pricing page", "Check refund policy", "Draft a reply"];
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[560px] rounded-[32px] bg-[#d6d2fd] px-6 pb-0 pt-14 sm:px-10 lg:max-w-none">
      <div className="mx-auto max-w-[360px] overflow-hidden rounded-t-[16px] bg-white shadow-[0_20px_50px_-20px_rgba(17,18,15,0.35)]">
        <div className="bg-[#11120f] px-5 py-4 text-[14px] text-white">AI agent</div>
        <div className="space-y-3 bg-[#f1f1ef] px-4 py-5 text-[14px] leading-5">
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl bg-[#d6d2fd] px-4 py-2.5">Do you offer a free plan, and what does it include?</p>
          <p className="w-fit max-w-[85%] rounded-2xl bg-white px-4 py-2.5">Yes. Free includes 100 AI messages a month and unlimited seats. Want me to walk you through setup?</p>
          <p className="ml-auto w-fit max-w-[80%] rounded-2xl bg-[#d6d2fd] px-4 py-2.5">Yes please.</p>
        </div>
        <div className="border-t border-black/10 bg-white px-4 py-4 text-[13px] text-black/40">Ask anything…</div>
      </div>
      <div className="absolute right-4 top-6 w-[240px] rounded-2xl bg-white p-4 shadow-[0_16px_40px_-18px_rgba(17,18,15,0.4)] sm:right-8">
        <p className="text-[13px] font-semibold">AI agent chain of thought</p>
        <ul className="mt-3 space-y-2.5 text-[12.5px]">
          {steps.map((t) => <li key={t} className="flex items-center gap-2"><span className="flex size-4 items-center justify-center rounded-full bg-[#1aa37a] text-white"><Check size={10} strokeWidth={3.5} /></span>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

// The visitor's site, sketched, with the real widget loaded on top of it. The tag is the same one customers install;
// the backend lets a demo key run from this page.
function Preview({ siteKey, domain, pages, onReset }: { siteKey: string; domain: string; pages: { title: string; url: string | null }[]; onReset: () => void }) {
  const before = useRef<Set<Element> | null>(null);

  useEffect(() => {
    before.current = new Set(Array.from(document.body.children));
    const script = document.createElement("script");
    script.src = TAG_SRC;
    script.async = true;
    script.dataset.siteKey = siteKey;
    document.body.appendChild(script);
    return () => {
      // The tag has no uninstall, so take away what it added, or the chat bubble would follow the visitor to other pages.
      script.remove();
      Array.from(document.body.children).forEach((el) => {
        if (before.current?.has(el) || el === script) return;
        if (el.tagName === "IFRAME" || el.querySelector("iframe") || getComputedStyle(el).position === "fixed") el.remove();
      });
    };
  }, [siteKey]);

  const name = domain.replace(/^www\./, "");
  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-black/40 bg-[#f6f6f4]">
        <div className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-3">
          <span className="flex gap-1.5"><i className="size-2.5 rounded-full bg-[#ff5f57]" /><i className="size-2.5 rounded-full bg-[#febc2e]" /><i className="size-2.5 rounded-full bg-[#28c840]" /></span>
          <span className="min-w-0 flex-1 truncate rounded-md bg-[#f1f1ef] px-3 py-1 text-center text-[13px] text-[#11120f]/60">https://www.{name}</span>
        </div>
        <div className="min-h-[460px] px-6 pb-24 pt-8 sm:px-10">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://${name}/favicon.ico`} alt="" aria-hidden="true" className="size-7 rounded-md bg-white object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
            <span className="text-lg font-medium">{name}</span>
          </div>
          <h2 className="mt-12 max-w-[20ch] text-[clamp(1.8rem,3.4vw,2.8rem)] font-normal leading-[1.08] tracking-[-0.03em]">Ask anything about {name}</h2>
          <p className="mt-3 max-w-md text-[#11120f]/65">Elpino has read {pages.length > 0 ? `${pages.length} of your pages` : "your website"}. Open the chat in the corner and ask it a question a customer would ask.</p>
          {pages.length > 0 && (
            <ul className="mt-8 flex max-w-2xl flex-wrap gap-2 text-[13px]">
              {pages.slice(0, 8).map((p) => <li key={`${p.url}-${p.title}`} className="max-w-[16rem] truncate rounded-full border border-black/15 bg-white px-3 py-1.5">{p.title || p.url}</li>)}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="flex items-center gap-2 text-[15px]"><MessageCircle size={18} />Click the chat bubble at the bottom right and ask away.</p>
        <Link href="/signup" className={buttonClass}>Start free <ArrowRight size={17} /></Link>
        <button type="button" onClick={onReset} className="text-[15px] underline underline-offset-4 hover:opacity-75">Try another website</button>
      </div>
    </div>
  );
}
