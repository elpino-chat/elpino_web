"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Bot, Check, Code2, Copy, Database, EyeOff, Lock, Plug, Plus, ShieldCheck } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";
import { IDENTITY_ERRORS, PAGE_SNIPPET, SERVER_SNIPPETS, SPA_SNIPPET } from "@/lib/identity-snippets";

// For Developers: the real integration surface, shown with the real code.
// The widget tag, the signed identity token (HS256, aud "elpino-widget",
// five minutes at most, works once), the server snippets and error codes
// come straight from the same source the dashboard and docs use, so this
// page can't drift from them. MCP limits are the ones in the product.
// Code, claim names/values, error codes and snippet labels stay in English
// everywhere — they're literal API surface, not prose.

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — t()'s traversal really does hand back the
 * raw JSON value (array or not) even though its declared return type is
 * `string`. Falls back to the English array wholesale when the locale
 * hasn't got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

const INK = "#11120f";
const BLUE = "#0078f4";
const YELLOW = "#ffd84d";
const PURPLE = "#7060bd";
const ORANGE = "#fc7b33";
const GREEN = "#1aa37a";
const PINK = "#d9508a";

const card = "rounded-[10px] border border-black/40";
const mono = "font-mono text-[11px] font-medium uppercase tracking-[0.08em]";

const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

const TAG = '<script async src="https://cdn.elpino.chat/tag.js" data-site-key="YOUR_SITE_KEY"></script>';

function Stamp({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/25 bg-white px-3 py-1 text-[12.5px] font-medium normal-case tracking-normal text-black/70">
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

function Heading({ eyebrow, color, title, sub }: { eyebrow: string; color: string; title: ReactNode; sub?: string; left?: boolean }) {
  return (
    <div className="max-w-3xl">
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-black/65">{sub}</p></Rv>}
    </div>
  );
}

function Code({ title, code, className = "", t }: { title: string; code: string; className?: string; t: T }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { void navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };
  return (
    <div className={`${card} overflow-hidden bg-[#11120f] text-white ${className}`}>
      <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className="size-2.5 rounded-full bg-white/25" /><span className={`${mono} ml-2 text-white/50`}>{title}</span></div>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-[11.5px] font-medium text-white/80 transition hover:bg-white/10">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? t("developers.server.copied", "Copied") : t("developers.server.copy", "Copy")}</button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-[#c9f5e2] [scrollbar-width:thin]"><code>{code}</code></pre>
    </div>
  );
}

// -------------------------------------------------------------------- hero

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

function useFile(t: T): { t: string; step: number }[] {
  return [
    { t: t("developers.ide.comment1", "<!-- 1. Paste the tag -->"), step: 0 },
    { t: TAG, step: 0 },
    { t: "", step: 0 },
    { t: t("developers.ide.comment2", "<!-- 2. Tell Elpino who's logged in -->"), step: 1 },
    { t: "<script>", step: 1 },
    { t: "  window.$elpino = window.$elpino || [];", step: 1 },
    { t: t("developers.ide.comment3", "  // elpinoToken: signed by your backend"), step: 1 },
    { t: '  $elpino.push(["identify", { token: elpinoToken }]);', step: 1 },
    { t: "</script>", step: 1 },
  ];
}

function Ide({ t }: { t: T }) {
  const FILE = useFile(t);
  const STEP_LABELS = [t("developers.ide.stepEmbed", "Embed"), t("developers.ide.stepIdentify", "Identify"), t("developers.ide.stepResolve", "Resolve")];
  const reduced = useReduced();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setStep((v) => (v + 1) % 3), 4200);
    return () => window.clearTimeout(id);
  }, [step, paused, reduced]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {STEP_LABELS.map((l, i) => <button key={l} type="button" onClick={() => setStep(i)} aria-pressed={i === step} className="rounded-full border border-black/25 px-4 py-2 text-[13.5px] font-medium transition hover:border-black/60" style={i === step ? { backgroundColor: INK, color: "#fff", borderColor: INK } : { backgroundColor: "#fff" }}>{i + 1} · {l}</button>)}
      </div>
      <div className={`${card} grid overflow-hidden bg-[#11120f] lg:grid-cols-[1.05fr_.95fr]`}>
        {/* editor */}
        <div className="border-b border-black/15 lg:border-b-0 lg:border-r-2">
          <div className="flex items-center gap-1 border-b border-white/15 bg-[#1a1b18] px-3 pt-2 text-[12px]">
            <span className="rounded-t-lg bg-[#11120f] px-3.5 py-2 font-mono text-white">index.html</span>
            <span className="px-3.5 py-2 font-mono text-white/35">server.js</span>
            <span className="px-3.5 py-2 font-mono text-white/35">.env</span>
          </div>
          <div className="min-h-[300px] p-3 font-mono text-[12.5px] leading-7">
            {FILE.map((l, i) => {
              const shown = l.step <= step || step === 2;
              const active = step !== 2 && l.step === step;
              return (
                <div key={i} className="flex gap-3 rounded px-2 transition-all duration-500" style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateX(-8px)", backgroundColor: active ? "#3784ff26" : "transparent", boxShadow: active ? `inset 3px 0 0 ${BLUE}` : "none" }}>
                  <span className="w-5 shrink-0 select-none text-right text-white/25">{i + 1}</span>
                  <span className={`whitespace-pre-wrap break-all ${l.t.startsWith("<!--") || l.t.trim().startsWith("//") ? "text-white/40" : "text-[#c9f5e2]"}`}>{l.t}</span>
                </div>
              );
            })}
            {step === 2 && <div className="mt-3 rounded-lg border border-dashed border-white/25 px-3 py-2.5 text-[12px] leading-5 text-[#ffd84d]" style={{ animation: "elpino-rv-up .4s both" }}>{t("developers.ide.mcpComment", "// In your dashboard: connect an MCP server and enable get_order.")}</div>}
          </div>
        </div>

        {/* preview */}
        <div className="bg-white">
          <div className="flex items-center gap-2 border-b border-black/15 bg-white px-3 py-2.5">
            <span className="size-2.5 rounded-full bg-black/15" /><span className="size-2.5 rounded-full bg-black/15" /><span className="size-2.5 rounded-full bg-black/15" />
            <span className="ml-2 flex-1 truncate rounded-full border border-black/15 bg-white px-3 py-0.5 font-mono text-[11px] text-[#11120f]/55">your-site.com</span>
          </div>
          <div className="relative min-h-[300px] p-4">
            <div className="space-y-2.5" aria-hidden="true"><div className="h-5 w-2/5 rounded bg-[#11120f]/10" /><div className="h-3 w-4/5 rounded bg-[#11120f]/[0.06]" /><div className="h-3 w-3/5 rounded bg-[#11120f]/[0.06]" /><div className="mt-4 h-20 w-full rounded-xl bg-[#11120f]/[0.05]" /></div>
            {/* launcher */}
            <div className="absolute bottom-4 right-4 transition-all duration-500" style={{ opacity: step === 0 ? 1 : 0, transform: step === 0 ? "scale(1)" : "scale(0.6)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founders-sloth-v2.png" alt="" className="size-14 rounded-full border border-black/25 bg-white object-cover object-top" style={{ animation: step === 0 ? "elpino-rv-pop .5s both" : undefined }} />
            </div>
            {/* chat */}
            <div className={`${card} absolute bottom-4 right-4 w-[250px] overflow-hidden bg-white transition-all duration-500`} style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "none" : "translateY(20px) scale(.95)", pointerEvents: "none" }}>
              <div className="flex items-center gap-2 border-b border-black/15 px-3 py-2 text-white" style={{ backgroundColor: BLUE }}>
                <span className="text-[13px] font-semibold">{t("developers.ide.previewSupport", "Support")}</span>
                <span className={`${mono} ml-auto inline-flex items-center gap-1 rounded-full border border-black/25 bg-[#eafaf3] px-1.5 py-0.5 text-[8.5px] text-[#11120f] transition-opacity duration-500`} style={{ opacity: step >= 1 ? 1 : 0 }}><ShieldCheck size={9} />{t("developers.ide.previewVerified", "Verified")}</span>
              </div>
              <div className="min-h-[130px] space-y-2 p-3 text-[12px]">
                {step === 1 && <div className="max-w-[90%] rounded-xl rounded-bl-sm border border-black/25 bg-white px-2.5 py-1.5">{t("developers.ide.previewGreeting", "Hi Aisha, how can I help?")}</div>}
                {step === 2 && (<>
                  <div className="ml-auto max-w-[90%] rounded-xl rounded-br-sm border border-black/25 px-2.5 py-1.5 text-white" style={{ backgroundColor: INK }}>{t("developers.ide.previewQuestion", "Where's my order?")}</div>
                  <div className="flex w-fit items-center gap-1.5 rounded-full border-2 border-dashed border-[#7060bd] bg-[#f1eefb] px-2.5 py-1 font-mono text-[10px] text-[#4a3d94]" style={{ animation: "elpino-rv-pop .35s .2s both" }}><Plug size={10} />mcp_shop__get_order</div>
                  <div className="max-w-[92%] rounded-xl rounded-bl-sm border border-black/25 bg-white px-2.5 py-1.5" style={{ animation: "elpino-rv-pop .35s .7s both" }}>{t("developers.ide.previewAnswer", "It shipped yesterday and arrives Thursday.")}</div>
                </>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 pb-16 pt-16 text-[#11120f] sm:px-8 lg:px-20 lg:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[14px] text-black/50">{t("developers.hero.badge", "For developers")}</p>
          <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">{t("developers.hero.titlePrefix", "From ")}<span className="font-mono tracking-[-0.06em]">&lt;script&gt;</span>{t("developers.hero.titleMiddle", " to ")}{t("developers.hero.titleHl", "resolved.")}</h1>
          <p className="mx-auto mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("developers.hero.subtitle", "One tag for the widget, one signed token so Elpino knows who's logged in, one MCP server so the AI can read your data. Watch the three steps land in a page.")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">{t("developers.hero.ctaStart", "Start free")} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/docs/identity-verification" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">{t("developers.hero.ctaDocs", "Read the docs")}</Link>
          </div>
        </div>
        <Rv variant="deal" delay={300} className="mt-14"><Ide t={t} /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- ticker

// Technical constants (algorithm names, claim shapes, protocol terms) — not prose, kept as-is in every locale.
const TICKS = ["HS256", "aud = elpino-widget", "exp ≤ 5 min", "one-time jti", "$elpino.push", "MCP · 5 servers", "15 tools each", "read-only vs writes", "Verified badge", "ref_name_9f2c"];

function Ticker() {
  const row = [...TICKS, ...TICKS];
  return (
    <div className="overflow-hidden bg-[#11120f] py-4" aria-hidden="true">
      <div className="flex w-max gap-4" style={{ animation: "elpino-marquee 36s linear infinite" }}>
        {row.map((t, i) => <span key={i} className="whitespace-nowrap rounded-lg border border-white/25 px-4 py-1.5 font-mono text-[14px]" style={{ color: ["#c9f5e2", "#9cc4ff", "#c9f5e2", "#9cc4ff"][i % 4] }}>{t}</span>)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- sequence

type ActorMeta = { color: string };
const ACTORS_META: ActorMeta[] = [{ color: BLUE }, { color: GREEN }, { color: PURPLE }, { color: ORANGE }];
const ACTORS_EN = ["Browser", "Your server", "Elpino", "Your MCP server"];

type SeqMeta = { from: number; to: number };
type SeqText = { label: string; note?: string };
const SEQ_META: SeqMeta[] = [
  { from: 0, to: 1 },
  { from: 1, to: 0 },
  { from: 0, to: 2 },
  { from: 2, to: 2 },
  { from: 0, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 2 },
  { from: 2, to: 0 },
];
const SEQ_EN: SeqText[] = [
  { label: "Customer logs in" },
  { label: "Signed JWT", note: "≤ 5 min · works once" },
  { label: "$elpino identify(token)" },
  { label: "Verify signature + claims ✓" },
  { label: "“Where's my order?”" },
  { label: "get_order", note: "verified customers only" },
  { label: "Order status" },
  { label: "Reply to the customer" },
];

function useActors(t: T) {
  const text = tList<string>(t, "developers.sequence.actors", ACTORS_EN);
  return ACTORS_META.map((meta, i) => ({ ...meta, label: text[i] }));
}

function useSeq(t: T) {
  const text = tList<SeqText>(t, "developers.sequence.steps", SEQ_EN);
  return SEQ_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Sequence({ t }: { t: T }) {
  const ACTORS = useActors(t);
  const SEQ = useSeq(t);
  const reduced = useReduced();
  const [n, setN] = useState(reduced ? SEQ.length : 1);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (reduced) { setN(SEQ.length); return; }
    if (!playing) return;
    const id = window.setTimeout(() => setN((v) => (v >= SEQ.length + 2 ? 1 : v + 1)), n >= SEQ.length ? 2600 : 1000);
    return () => window.clearTimeout(id);
  }, [n, playing, reduced, SEQ.length]);

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("developers.sequence.eyebrow", "Request flow")} color={GREEN} title={<>{t("developers.sequence.titlePrefix", "One question, ")}{t("developers.sequence.titleHl", "four systems.")}</>} sub={t("developers.sequence.subtitle", "Who talks to whom when a logged-in customer asks about their order. Step through it, or let it play.")} />
        <Rv variant="deal" delay={100}>
          <div className={`${card} mt-12 bg-white p-4 sm:p-6`}>
            <div className="grid grid-cols-4 gap-2">
              {ACTORS.map((a, i) => <div key={i} className="rounded-xl border border-black/25 px-2 py-2.5 text-center text-[12px] font-semibold sm:text-[14px]" style={{ backgroundColor: "#f4f4f2", color: INK }}>{a.label}</div>)}
            </div>
            <div className="relative mt-2">
              {[0, 1, 2, 3].map((k) => <div key={k} aria-hidden="true" className="absolute inset-y-0 w-0.5" style={{ left: `calc(${k * 25 + 12.5}% - 1px)`, backgroundImage: `linear-gradient(${INK}55 50%, transparent 50%)`, backgroundSize: "2px 10px" }} />)}
              <div className="relative">
                {SEQ.map((m, i) => {
                  const on = i < n;
                  const lo = Math.min(m.from, m.to);
                  const hi = Math.max(m.from, m.to);
                  const self = m.from === m.to;
                  const right = m.to > m.from;
                  return (
                    <div key={i} className="relative h-[68px] transition-all duration-500" style={{ opacity: on ? 1 : 0.08, transform: on ? "none" : "translateY(6px)" }}>
                      {self ? (
                        <div className="absolute top-3 -translate-x-1/2" style={{ left: `${lo * 25 + 12.5}%` }}>
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/25 px-3 py-1 text-[11.5px] font-semibold text-white sm:text-[13px]" style={{ backgroundColor: GREEN }}><Check size={12} strokeWidth={3} />{m.label}</span>
                        </div>
                      ) : (
                        <div className="absolute top-2" style={{ left: `${lo * 25 + 12.5}%`, width: `${(hi - lo) * 25}%` }}>
                          <div className="text-center"><span className="inline-block max-w-full truncate rounded-md border border-black/25 bg-white px-2 py-0.5 font-mono text-[10.5px] font-semibold sm:text-[12px]">{m.label}</span></div>
                          <div className="relative mt-2 h-0.5 w-full bg-[#11120f]">
                            <span aria-hidden="true" className="absolute top-1/2 size-3 -translate-y-1/2 rotate-45 border-[#11120f]" style={right ? { right: 0, borderTop: "2px solid", borderRight: "2px solid" } : { left: 0, borderBottom: "2px solid", borderLeft: "2px solid" }} />
                          </div>
                          {m.note && <p className="mt-1 text-center text-[10.5px] text-[#11120f]/55 sm:text-[11.5px]">{m.note}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-[#11120f]/25 pt-4">
              <span className={`${mono} text-[#11120f]/50`}>{t("developers.sequence.stepCounter", "Step {n} / {total}").replace("{n}", String(Math.min(n, SEQ.length))).replace("{total}", String(SEQ.length))}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setPlaying(false); setN(Math.min(SEQ.length, n + 1)); }} className="rounded-full border border-black/25 bg-white px-4 py-1.5 text-[13px] font-semibold transition hover:border-black/60">{t("developers.sequence.nextStep", "Next step")}</button>
                <button type="button" onClick={() => { setN(1); setPlaying(true); }} className="rounded-full border border-black/25 px-4 py-1.5 text-[13px] font-semibold text-white" style={{ backgroundColor: BLUE }}>{t("developers.sequence.replay", "Replay")}</button>
              </div>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- token explorer

// Claim names, example values and the required flag are literal token shape — not translated. Only the description (d) is.
const CLAIMS_META: { k: string; v: string; req: boolean }[] = [
  { k: "sub", v: '"user_8421"', req: true },
  { k: "aud", v: '"elpino-widget"', req: true },
  { k: "jti", v: '"5b1e…c9f2"', req: true },
  { k: "iat", v: "1758726000", req: true },
  { k: "exp", v: "1758726300", req: true },
  { k: "email", v: '"aisha@example.com"', req: false },
  { k: "email_verified", v: "true", req: false },
  { k: "name", v: '"Aisha Khan"', req: false },
];
const CLAIMS_D_EN: string[] = [
  "Your stable account ID for this user.",
  'Exactly "elpino-widget".',
  "A fresh random ID per token, 16 to 128 URL-safe characters. A UUID works.",
  "Issued-at time in whole seconds (not milliseconds).",
  "Expiry in whole seconds, at most 5 minutes after iat.",
  "Omit it when there is none. null is rejected.",
  "true only if your login system confirmed ownership.",
  "Display name shown to your team.",
];

function useClaims(t: T) {
  const d = tList<string>(t, "developers.tokenExplorer.claimDescriptions", CLAIMS_D_EN);
  return CLAIMS_META.map((meta, i) => ({ ...meta, d: d[i] }));
}

function TokenExplorer({ t }: { t: T }) {
  const CLAIMS = useClaims(t);
  const [sel, setSel] = useState(0);
  const [err, setErr] = useState(0);
  const errs = IDENTITY_ERRORS.slice(0, 8);
  const c = CLAIMS[sel];
  const e = errs[err];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("developers.tokenExplorer.eyebrow", "The identity token")} color={PURPLE} title={<>{t("developers.tokenExplorer.titlePrefix", "Anatomy of a token, ")}{t("developers.tokenExplorer.titleHl", "and how it breaks.")}</>} sub={t("developers.tokenExplorer.subtitle", "HS256, signed with your workspace secret. Tap a claim for its rule, then break the token to see what the widget tells you.")} />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Rv variant="up">
            <div className={`${card} overflow-hidden bg-[#11120f] text-white`}>
              <div className={`${mono} border-b border-white/15 px-4 py-2.5 text-white/50`}>{t("developers.tokenExplorer.payload", "Payload")}</div>
              <div className="p-4 font-mono text-[13px] leading-8">
                <span className="text-white/50">{"{"}</span>
                {CLAIMS.map((x, i) => (
                  <button key={x.k} type="button" onClick={() => setSel(i)} aria-pressed={i === sel} className="block w-full rounded-lg px-3 text-left transition" style={{ backgroundColor: i === sel ? "#ffffff1a" : "transparent" }}>
                    <span style={{ color: "#8ec7ff" }}>&quot;{x.k}&quot;</span><span className="text-white/50">: </span><span style={{ color: "#ffd84d" }}>{x.v}</span><span className="text-white/40">,</span>
                    {!x.req && <span className="ml-3 text-[10px] text-white/35">{t("developers.tokenExplorer.optional", "optional")}</span>}
                  </button>
                ))}
                <span className="text-white/50">{"}"}</span>
              </div>
            </div>
          </Rv>
          <Rv variant="up" delay={100}>
            <div className="space-y-4">
              <div key={c.k} className={`${card} bg-white p-5`} style={{ animation: "elpino-rv-deal .4s both" }}>
                <div className="flex items-center justify-between"><code className="font-mono text-2xl font-bold">{c.k}</code><Stamp color={c.req ? PINK : GREEN}>{c.req ? t("developers.tokenExplorer.required", "Required") : t("developers.tokenExplorer.optionalCap", "Optional")}</Stamp></div>
                <p className="mt-3 text-[16.5px] leading-7 text-[#11120f]/75">{c.d}</p>
              </div>
              <div className={`${card} bg-white p-5`}>
                <p className={`${mono} text-[#11120f]/50`}>{t("developers.tokenExplorer.breakIt", "Break it")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {errs.map((x, i) => <button key={x.code} type="button" onClick={() => setErr(i)} aria-pressed={i === err} className="rounded-full border border-black/25 px-3 py-1 font-mono text-[11.5px] font-semibold transition" style={{ backgroundColor: i === err ? ORANGE : "#fff", color: i === err ? "#fff" : INK }}>{x.code}</button>)}
                </div>
                <div key={e.code} className="mt-4 rounded-xl border border-black/25 bg-[#11120f] p-3.5 font-mono text-[12px] leading-6 text-[#ffb3b3]" style={{ animation: "elpino-rv-up .3s both" }}>{t("developers.tokenExplorer.notAccepted", "[Elpino] Identity token was not accepted: {code}").replace("{code}", e.code)}</div>
                <p className="mt-3 text-[14.5px] leading-6 text-black/65"><b>{t("developers.tokenExplorer.fix", "Fix:")}</b> {e.fix}</p>
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- server snippets

function Server({ t }: { t: T }) {
  const list = SERVER_SNIPPETS.slice(0, 4);
  const [i, setI] = useState(0);
  const s = list[i];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("developers.server.eyebrow", "Your backend")} color={GREEN} title={<>{t("developers.server.titlePrefix", "Copy, paste, ")}{t("developers.server.titleHl", "ship.")}</>} sub={t("developers.server.subtitle", "The same snippets your dashboard shows, in the language you already run.")} />
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {list.map((x, k) => <button key={x.id} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="rounded-full border border-black/25 px-4 py-2 text-[14px] font-semibold transition" style={k === i ? { backgroundColor: GREEN, color: "#fff" } : { backgroundColor: "#fff" }}>{x.label}</button>)}
        </div>
        <Rv variant="deal" delay={100}>
          <div className="mt-6">
            <p className="mb-2 font-mono text-[13px] text-[#11120f]/60">$ {s.install}</p>
            <Code key={s.id} title={`${s.label.toLowerCase()} · ${t("developers.server.codeTitle", "identity token")}`} code={s.code} t={t} />
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- MCP

type ToolMeta = { name: string; write: boolean; on: boolean };
const TOOLS_META: ToolMeta[] = [
  { name: "get_order", write: false, on: true },
  { name: "track_shipment", write: false, on: true },
  { name: "update_address", write: true, on: true },
  { name: "cancel_order", write: true, on: false },
];
const TOOLS_D_EN: string[] = [
  "Look up an order and its status",
  "Live tracking for a parcel",
  "Change a delivery address",
  "Cancel an order that hasn't shipped",
];

function Mcp({ t }: { t: T }) {
  const [onFlags, setOnFlags] = useState(TOOLS_META.map((x) => x.on));
  const [pub, setPub] = useState(false);
  const d = tList<string>(t, "developers.mcp.toolDescriptions", TOOLS_D_EN);
  const tools = TOOLS_META.map((meta, i) => ({ ...meta, on: onFlags[i], d: d[i] }));
  const usable = tools.filter((x) => x.on && (!pub || !x.write));
  const bullets = tList<string>(t, "developers.mcp.bullets", [
    "Every call is re-checked against your list on the server",
    "Tools that change data always need a verified customer",
    "Credentials are stored encrypted",
  ]);
  return (
    <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="max-w-3xl">
          <Rv variant="drop"><Stamp color={ORANGE}><Plug size={13} />{t("developers.mcp.badge", "MCP servers")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("developers.mcp.titlePrefix", "Give the AI tools. ")}<span style={{ color: "#6db3ff" }}>{t("developers.mcp.titleHl", "Keep the keys.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">{t("developers.mcp.subtitle", "Connect up to five MCP servers, enable up to 15 tools on each, and choose who they're open to. Flip the switches to see what the agent can use.")}</p></Rv>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Rv variant="up">
            <div className={`${card} bg-white p-5 text-[#11120f]`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#11120f]/25 pb-4">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-black/25" style={{ backgroundColor: ORANGE }}><Database size={18} color="#fff" /></span><div><p className="font-semibold">{t("developers.mcp.shopServerName", "Your shop MCP server")}</p><p className={`${mono} text-[#11120f]/50`}>{t("developers.mcp.toolsDiscovered", "{n} tools discovered").replace("{n}", String(tools.length))}</p></div></div>
                <button type="button" role="switch" aria-checked={pub} onClick={() => setPub(!pub)} className="flex items-center gap-2 rounded-full border border-black/25 bg-white px-3 py-1.5 text-[12.5px] font-semibold">{t("developers.mcp.toggleLabel", "Open read-only tools to any visitor")}<span className="relative h-5 w-9 rounded-full border border-black/25" style={{ backgroundColor: pub ? GREEN : "#e7e2d6" }}><span className="absolute top-px size-3.5 rounded-full border border-black/25 bg-white transition-all" style={{ left: pub ? "16px" : "1px" }} /></span></button>
              </div>
              <div className="divide-y-2 divide-[#11120f]/10">
                {tools.map((x, i) => (
                  <div key={x.name} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2"><code className="font-mono text-[13.5px] font-semibold">{x.name}</code><span className={`${mono} rounded-full border border-black/25 px-1.5 py-0.5 text-[8.5px]`} style={{ backgroundColor: x.write ? "#ffe9d6" : "#e3f5ee" }}>{x.write ? t("developers.mcp.changesData", "Changes data") : t("developers.mcp.readOnly", "Read-only")}</span>{pub && x.write && <span className={`${mono} inline-flex items-center gap-1 text-[8.5px] text-[#11120f]/55`}><Lock size={10} />{t("developers.mcp.needsVerified", "Needs verified customer")}</span>}</p>
                      <p className="text-[13px] text-[#11120f]/55">{x.d}</p>
                    </div>
                    <button type="button" role="switch" aria-checked={x.on} aria-label={`Allow ${x.name}`} onClick={() => setOnFlags(onFlags.map((v, k) => (k === i ? !v : v)))} className="relative h-7 w-12 shrink-0 rounded-full border border-black/25 transition-colors" style={{ backgroundColor: x.on ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border border-black/25 bg-white transition-all" style={{ left: x.on ? "calc(100% - 22px)" : "2px" }} /></button>
                  </div>
                ))}
              </div>
            </div>
          </Rv>
          <Rv variant="up" delay={120}>
            <div className="h-full rounded-[10px] border border-white/20 bg-[#1b1c19] p-6">
              <p className={`${mono} text-white/75`}>{t("developers.mcp.agentCanCall", "Agent can call")}</p>
              <p className="mt-2 text-6xl font-semibold tracking-[-0.05em]">{usable.length}<span className="text-2xl text-white/60"> / {tools.length}</span></p>
              <div className="mt-4 flex flex-wrap gap-2">{tools.map((x) => { const ok = usable.includes(x); return <code key={x.name} className="rounded-lg border border-black/25 px-2 py-1 font-mono text-[11.5px]" style={{ backgroundColor: ok ? "#fff" : "transparent", color: ok ? INK : "#ffffff77", textDecoration: ok ? "none" : "line-through" }}>{x.name}</code>; })}</div>
              <ul className="mt-6 space-y-2.5 text-[14.5px]">{bullets.map((x) => <li key={x} className="flex gap-2.5"><Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- what the AI sees

function Sees({ t }: { t: T }) {
  const [raw, setRaw] = useState(true);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-2">
        <div>
          <Heading left eyebrow={t("developers.sees.eyebrow", "Privacy by default")} color={PINK} title={<>{t("developers.sees.titlePrefix", "The model ")}{t("developers.sees.titleHl", "never sees")}{t("developers.sees.titleSuffix", " who they are.")}</>} sub={t("developers.sees.subtitle", "Before the AI reads a conversation, names, emails and IDs are swapped for reference codes, and secrets like tokens and keys are stripped out. Tools still get the real values on your side.")} />
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} bg-white p-5`}>
            <div className="mb-4 flex w-fit rounded-full border border-black/25 bg-white p-1">
              {[[true, t("developers.sees.toggleTeam", "What your team sees")], [false, t("developers.sees.toggleModel", "What the AI model sees")]].map(([v, l]) => <button key={String(v)} type="button" onClick={() => setRaw(v as boolean)} aria-pressed={raw === v} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold transition" style={raw === v ? { backgroundColor: v ? BLUE : PURPLE, color: "#fff" } : undefined}>{!v && <EyeOff size={14} />}{l as string}</button>)}
            </div>
            <div key={String(raw)} className="space-y-2.5 text-[14px]" style={{ animation: "elpino-rv-up .35s both" }}>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm border border-black/25 px-4 py-2.5 text-white" style={{ backgroundColor: INK }}>{raw ? t("developers.sees.chatRaw1", "Hi, I'm Aisha Khan (aisha@example.com). Where's my order?") : t("developers.sees.chatMasked1", "Hi, I'm ref_name_9f2c (ref_email_41ab). Where's my order?")}</div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-black/25 bg-white px-4 py-2.5">{raw ? t("developers.sees.chatRaw2", "Hi Aisha, your order shipped yesterday.") : t("developers.sees.chatMasked2", "Hi, your order shipped yesterday.")}</div>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- faq

type Faq = { q: string; a: string };

const FAQS_EN: Faq[] = [
  { q: "Do I have to use identity verification?", a: "No, but it's what lets the AI safely show private data. Anyone can type any email into a chat, so a signed token from your own login system is how a customer becomes Verified." },
  { q: "How long does a token last?", a: "At most five minutes, and it works once. The chat session itself lasts up to 8 hours, with a 30-minute idle limit." },
  { q: "Which signing algorithm?", a: "HS256. Other algorithms, including none and RS256, are refused." },
  { q: "Which languages have snippets?", a: "Node.js, Python, PHP and Ruby, in your dashboard's identity settings and the docs." },
  { q: "What is an MCP server?", a: "A service that exposes tools over the Model Context Protocol. Elpino discovers its tools, and you enable the ones the AI may use." },
  { q: "Can the AI change data in my systems?", a: "Only through tools you've enabled, and tools that change data always need a verified customer." },
  { q: "Is there an API?", a: "The widget SDK, identity tokens and MCP are the integration surface today." },
];

function Faq({ t }: { t: T }) {
  const FAQS = tList<Faq>(t, "developers.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  const links = tList<string>(t, "developers.faq.linkLabels", ["Identity docs", "Widget docs", "AI agent", "Security guide"]);
  const hrefs = ["/docs/identity-verification", "/docs/chat-widget", "/product/ai-agent", "/security-guide"];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("developers.faq.titlePrefix", "Good to ")}{t("developers.faq.titleHl", "know.")}</h2></Rv>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {links.map((l, i) => <Link key={hrefs[i]} href={hrefs[i]} className="inline-flex items-center gap-1.5 rounded-full border border-black/25 bg-white px-4 py-2 text-[14px] font-medium transition hover:border-black/60">{l}<ArrowRight size={13} /></Link>)}
          </div>
        </div>
        <Rv delay={80}>
          <div className="border-b border-black/20">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="border-t border-black/20">
                  <h3>
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                      <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug tracking-[-0.015em]">{item.q}</span>
                      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#11120f] bg-[#11120f] text-white" : "border-black/25 text-[#11120f]"}`}><Plus size={18} /></span>
                    </button>
                  </h3>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><p className="max-w-2xl pb-7 text-[17px] leading-7 text-black/65">{item.a}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Rv>
      </div>
    </section>
  );
}

function Closing({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 pb-24 pt-4 sm:px-8 lg:px-20">
      <Rv className="mx-auto max-w-[1500px]">
        <div className="rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("developers.closing.title", "Ship it in an afternoon.")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("developers.closing.subtitle", "Start free, paste the tag, and wire up identity when you're ready.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("developers.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/docs" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("developers.closing.ctaDocs", "Open the docs")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function DevelopersClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <Ticker />
      <Sequence t={t} />
      <TokenExplorer t={t} />
      <Server t={t} />
      <Mcp t={t} />
      <Sees t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
