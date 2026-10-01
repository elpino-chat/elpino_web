"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Mail, MessageCircle, ShieldCheck } from "lucide-react";

// The public demo: a work email, a code sent to it, then one website on that email's own domain. Elpino reads
// the site's pages, and the real widget is shown on a preview of it so the visitor can ask it questions.
// Everything lives in a throwaway workspace that the backend deletes after a day.

type Step = "email" | "code" | "domain" | "crawling" | "preview";
type CrawlState = "idle" | "crawling" | "ready" | "failed";
type Status = { state?: CrawlState; domain?: string; siteKey?: string; pagesRead?: number; pages?: { title: string; url: string | null }[]; emailDomain?: string; error?: string };

const TOKEN_KEY = "elpino-demo-token";
const EMAIL_KEY = "elpino-demo-email";
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

const STEPS: { id: Step[]; label: string }[] = [
  { id: ["email", "code"], label: "Verify email" },
  { id: ["domain"], label: "Your website" },
  { id: ["crawling"], label: "Learn" },
  { id: ["preview"], label: "Try it" },
];

function Stepper({ step }: { step: Step }) {
  const current = STEPS.findIndex((s) => s.id.includes(step));
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2" style={{ color: i <= current ? "#11120f" : "rgba(17,18,15,0.4)" }} aria-current={i === current ? "step" : undefined}>
          <span className={`grid size-5 place-items-center rounded-full border text-[11px] ${i < current ? "border-[#11120f] bg-[#11120f] text-white" : i === current ? "border-[#11120f]" : "border-black/25"}`}>
            {i < current ? <Check size={12} /> : i + 1}
          </span>
          {s.label}
          {i < STEPS.length - 1 && <span className="ml-1 h-px w-6 bg-black/20" />}
        </li>
      ))}
    </ol>
  );
}

const inputClass = "h-12 w-full rounded-md border border-black/25 bg-white px-4 text-[#11120f] outline-none transition placeholder:text-[#11120f]/40 focus:border-[#11120f]";
const buttonClass = "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-black px-6 text-white transition hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60";

export function DemoClient() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [domain, setDomain] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  // Pick up where a refresh left off.
  useEffect(() => {
    const saved = load(TOKEN_KEY);
    if (!saved) return;
    setEmail(load(EMAIL_KEY) ?? "");
    fetch(`/api/demo/status?token=${encodeURIComponent(saved)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Status | null) => {
        if (!data || data.error) { store(TOKEN_KEY, null); return; }
        setToken(saved);
        setStatus(data);
        setEmailDomain(data.emailDomain ?? data.domain ?? "");
        if (data.state === "ready") setStep("preview");
        else if (data.state === "crawling") setStep("crawling");
        else { setDomain(data.emailDomain ? `www.${data.emailDomain}` : ""); setStep("domain"); }
      })
      .catch(() => undefined);
  }, []);

  const expire = useCallback(() => {
    store(TOKEN_KEY, null);
    setToken(null);
    setStep("email");
    setError("Your session expired. Verify your email again.");
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
        else if (data.state === "failed") { setStep("domain"); setError("We couldn't read any pages on that website. Check the address, or make sure the site is public and allows crawling."); }
      } catch { /* try again on the next tick */ }
    };
    void poll();
    const id = window.setInterval(poll, 2500);
    return () => { stopped = true; window.clearInterval(id); };
  }, [step, token, expire]);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    const result = await post<{ ok?: boolean }>("/api/demo/send-code", { email });
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    store(EMAIL_KEY, email.trim().toLowerCase());
    setCode(""); setStep("code");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    const result = await post<{ token?: string; domainHint?: string }>("/api/demo/verify", { email, code });
    setBusy(false);
    if (result.error || !result.token) { setError(result.error ?? "That code is not right."); return; }
    store(TOKEN_KEY, result.token);
    setToken(result.token);
    setEmailDomain(result.domainHint ?? "");
    setDomain(result.domainHint ? `www.${result.domainHint}` : "");
    setStep("domain");
  }

  async function start(e: FormEvent) {
    e.preventDefault();
    if (busy || !token) return;
    setBusy(true); setError(null);
    const result = await post<{ siteKey?: string; domain?: string }>("/api/demo/start", { token, domain });
    setBusy(false);
    if (result.error || !result.siteKey) {
      if (/expired/i.test(result.error ?? "")) { expire(); return; }
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setStatus({ state: "crawling", domain: result.domain, siteKey: result.siteKey, pages: [] });
    setStep("crawling");
  }

  function reset() {
    store(TOKEN_KEY, null);
    setToken(null); setStatus({}); setCode(""); setError(null); setStep("email");
  }

  return (
    <main className="bg-white px-5 pb-24 pt-32 text-[#11120f] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[15px] text-[#11120f]/55">Demo</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,4.6vw,3.8rem)] font-normal leading-[1.05] tracking-[-0.035em]">See Elpino answer questions about your business</h1>
        <p className="mt-4 max-w-xl text-lg leading-7 text-[#11120f]/70">Verify your work email, add your website, and chat with an AI agent that has read your own pages. It takes about a minute.</p>
        <div className="mt-8"><Stepper step={step} /></div>

        <div className="mt-10">
          {step === "email" && (
            <form onSubmit={sendCode} className="max-w-md space-y-4">
              <label className="block text-sm font-medium" htmlFor="demo-email">Work email</label>
              <input id="demo-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
              <p className="flex items-start gap-2 text-[13px] leading-5 text-[#11120f]/60"><ShieldCheck size={16} className="mt-0.5 shrink-0" />Use your company address, not a personal one like Gmail. Its domain is how we know the website is yours.</p>
              <button type="submit" disabled={busy || !email.trim()} className={buttonClass}>{busy ? <Loader2 size={17} className="animate-spin" /> : <Mail size={17} />} Send code</button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={verify} className="max-w-md space-y-4">
              <label className="block text-sm font-medium" htmlFor="demo-code">Enter the 6-digit code we sent to {email}</label>
              <input id="demo-code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className={`${inputClass} font-mono text-xl tracking-[0.4em]`} />
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>{busy ? <Loader2 size={17} className="animate-spin" /> : null} Verify <ArrowRight size={17} /></button>
                <button type="button" disabled={busy} onClick={() => { void sendCode().then(() => setResent(true)); }} className="text-[15px] underline underline-offset-4 hover:opacity-75">Send a new code</button>
                <button type="button" onClick={() => { setError(null); setStep("email"); }} className="text-[15px] underline underline-offset-4 hover:opacity-75">Use a different email</button>
              </div>
              {resent && !error && <p className="text-[13px] text-[#11120f]/60">A new code is on its way. The code expires in 10 minutes.</p>}
            </form>
          )}

          {step === "domain" && (
            <form onSubmit={start} className="max-w-md space-y-4">
              <label className="block text-sm font-medium" htmlFor="demo-domain">Your website</label>
              <input id="demo-domain" required autoFocus inputMode="url" autoCapitalize="none" spellCheck={false} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={`www.${emailDomain || "company.com"}`} className={inputClass} />
              <p className="text-[13px] leading-5 text-[#11120f]/60">It must be on <strong className="font-medium text-[#11120f]">{emailDomain || "your email's domain"}</strong>, the same as your email, for example www.{emailDomain || "company.com"}.</p>
              <button type="submit" disabled={busy || !domain.trim()} className={buttonClass}>{busy ? <Loader2 size={17} className="animate-spin" /> : null} Read my website <ArrowRight size={17} /></button>
            </form>
          )}

          {step === "crawling" && (
            <div className="max-w-xl" aria-live="polite">
              <p className="flex items-center gap-3 text-lg"><Loader2 size={20} className="animate-spin" />Reading {status.domain ?? "your website"}…</p>
              <p className="mt-2 text-[15px] text-[#11120f]/60">Elpino is learning your pricing, FAQs and contact details. This usually takes under a minute.</p>
              <ul className="mt-6 space-y-2 text-[15px]">
                {(status.pages ?? []).map((p) => (
                  <li key={`${p.url}-${p.title}`} className="flex items-start gap-2"><Check size={16} className="mt-1 shrink-0 text-[#1aa37a]" /><span className="min-w-0 truncate">{p.title || p.url}</span></li>
                ))}
              </ul>
            </div>
          )}

          {step === "preview" && token && status.siteKey && <Preview siteKey={status.siteKey} domain={status.domain ?? ""} pages={status.pages ?? []} onReset={reset} />}
        </div>

        {error && <p role="alert" className="mt-6 max-w-md rounded-md border border-[#c0392b]/30 bg-[#c0392b]/5 px-4 py-3 text-[14px] text-[#a52a1d]">{error}</p>}
        <p className="mt-16 max-w-xl text-[13px] leading-5 text-[#11120f]/50">The demo uses a temporary workspace that is deleted after a day. We only read public pages on your own website. By continuing you agree to our <Link href="/terms" className="underline underline-offset-2">terms</Link> and <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.</p>
      </div>
    </main>
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
      <div className="overflow-hidden rounded-2xl border border-black/15 bg-[#f6f6f4] shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
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
