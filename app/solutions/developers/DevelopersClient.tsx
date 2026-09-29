"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Bot, Check, Code2, Copy, Database, EyeOff, Lock, Plug, Plus, ShieldCheck } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { IDENTITY_ERRORS, PAGE_SNIPPET, SERVER_SNIPPETS, SPA_SNIPPET } from "@/lib/identity-snippets";

// For Developers: the real integration surface, shown with the real code.
// The widget tag, the signed identity token (HS256, aud "elpino-widget",
// five minutes at most, works once), the server snippets and error codes
// come straight from the same source the dashboard and docs use, so this
// page can't drift from them. MCP limits are the ones in the product.

const INK = "#11120f";
const BLUE = "#3784ff";
const YELLOW = "#ffd84d";
const PURPLE = "#7060bd";
const ORANGE = "#fc7b33";
const GREEN = "#1aa37a";
const PINK = "#d9508a";

const card = "rounded-[22px] border-2 border-[#11120f]";
const mono = "font-mono text-[11px] font-semibold uppercase tracking-[0.14em]";
const onDark = (c: string) => (c === YELLOW ? INK : "#fff");
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

const TAG = '<script async src="https://cdn.elpino.chat/tag.js" data-site-key="YOUR_SITE_KEY"></script>';

function Stamp({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3 py-1.5`} style={{ backgroundColor: color, color: onDark(color) }}>
      {children}
    </span>
  );
}

function Heading({ eyebrow, color, title, sub, left = false }: { eyebrow: string; color: string; title: ReactNode; sub?: string; left?: boolean }) {
  return (
    <div className={left ? "max-w-3xl" : "mx-auto max-w-3xl text-center"}>
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-[#11120f]/65">{sub}</p></Rv>}
    </div>
  );
}

function Code({ title, code, className = "" }: { title: string; code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { void navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ }
  };
  return (
    <div className={`${card} overflow-hidden bg-[#11120f] text-white ${className}`}>
      <div className="flex items-center justify-between border-b-2 border-white/15 px-4 py-2.5">
        <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#ff6b6b]" /><span className="size-2.5 rounded-full" style={{ backgroundColor: YELLOW }} /><span className="size-2.5 rounded-full" style={{ backgroundColor: GREEN }} /><span className={`${mono} ml-2 text-white/50`}>{title}</span></div>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-[11.5px] font-medium text-white/80 transition hover:bg-white/10">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy"}</button>
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

const FILE: { t: string; step: number }[] = [
  { t: "<!-- 1. Paste the tag -->", step: 0 },
  { t: TAG, step: 0 },
  { t: "", step: 0 },
  { t: "<!-- 2. Tell Elpino who's logged in -->", step: 1 },
  { t: "<script>", step: 1 },
  { t: "  window.$elpino = window.$elpino || [];", step: 1 },
  { t: "  // elpinoToken: signed by your backend", step: 1 },
  { t: '  $elpino.push(["identify", { token: elpinoToken }]);', step: 1 },
  { t: "</script>", step: 1 },
];

const STEP_LABELS = ["Embed", "Identify", "Resolve"];

function Ide() {
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
        {STEP_LABELS.map((l, i) => <button key={l} type="button" onClick={() => setStep(i)} aria-pressed={i === step} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={i === step ? { backgroundColor: YELLOW } : { backgroundColor: "#fff" }}>{i + 1} · {l}</button>)}
      </div>
      <div className={`${card} grid overflow-hidden bg-[#11120f] lg:grid-cols-[1.05fr_.95fr]`}>
        {/* editor */}
        <div className="border-b-2 border-[#11120f] lg:border-b-0 lg:border-r-2">
          <div className="flex items-center gap-1 border-b-2 border-white/15 bg-[#1a1b18] px-3 pt-2 text-[12px]">
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
            {step === 2 && <div className="mt-3 rounded-lg border border-dashed border-white/25 px-3 py-2.5 text-[12px] leading-5 text-[#ffd84d]" style={{ animation: "elpino-rv-up .4s both" }}>{"// In your dashboard: connect an MCP server and enable get_order."}</div>}
          </div>
        </div>

        {/* preview */}
        <div className="bg-[#fffdf5]">
          <div className="flex items-center gap-2 border-b-2 border-[#11120f] bg-white px-3 py-2.5">
            <span className="size-2.5 rounded-full border border-[#11120f] bg-[#ff6b6b]" /><span className="size-2.5 rounded-full border border-[#11120f]" style={{ backgroundColor: YELLOW }} /><span className="size-2.5 rounded-full border border-[#11120f]" style={{ backgroundColor: GREEN }} />
            <span className="ml-2 flex-1 truncate rounded-full border-2 border-[#11120f]/20 bg-[#fffdf5] px-3 py-0.5 font-mono text-[11px] text-[#11120f]/55">your-site.com</span>
          </div>
          <div className="relative min-h-[300px] p-4">
            <div className="space-y-2.5" aria-hidden="true"><div className="h-5 w-2/5 rounded bg-[#11120f]/10" /><div className="h-3 w-4/5 rounded bg-[#11120f]/[0.06]" /><div className="h-3 w-3/5 rounded bg-[#11120f]/[0.06]" /><div className="mt-4 h-20 w-full rounded-xl bg-[#11120f]/[0.05]" /></div>
            {/* launcher */}
            <div className="absolute bottom-4 right-4 transition-all duration-500" style={{ opacity: step === 0 ? 1 : 0, transform: step === 0 ? "scale(1)" : "scale(0.6)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/founders-sloth-v2.png" alt="" className="size-14 rounded-full border-2 border-[#11120f] bg-white object-cover object-top" style={{ animation: step === 0 ? "elpino-rv-pop .5s both" : undefined }} />
            </div>
            {/* chat */}
            <div className={`${card} absolute bottom-4 right-4 w-[250px] overflow-hidden bg-white transition-all duration-500`} style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "none" : "translateY(20px) scale(.95)", pointerEvents: "none" }}>
              <div className="flex items-center gap-2 border-b-2 border-[#11120f] px-3 py-2 text-white" style={{ backgroundColor: BLUE }}>
                <span className="text-[13px] font-semibold">Support</span>
                <span className={`${mono} ml-auto inline-flex items-center gap-1 rounded-full border-2 border-[#11120f] bg-[#eafaf3] px-1.5 py-0.5 text-[8.5px] text-[#11120f] transition-opacity duration-500`} style={{ opacity: step >= 1 ? 1 : 0 }}><ShieldCheck size={9} />Verified</span>
              </div>
              <div className="min-h-[130px] space-y-2 p-3 text-[12px]">
                {step === 1 && <div className="max-w-[90%] rounded-xl rounded-bl-sm border-2 border-[#11120f] bg-white px-2.5 py-1.5">Hi Aisha, how can I help?</div>}
                {step === 2 && (<>
                  <div className="ml-auto max-w-[90%] rounded-xl rounded-br-sm border-2 border-[#11120f] px-2.5 py-1.5 text-white" style={{ backgroundColor: PURPLE }}>Where&apos;s my order?</div>
                  <div className="flex w-fit items-center gap-1.5 rounded-full border-2 border-dashed border-[#7060bd] bg-[#f1eefb] px-2.5 py-1 font-mono text-[10px] text-[#4a3d94]" style={{ animation: "elpino-rv-pop .35s .2s both" }}><Plug size={10} />mcp_shop__get_order</div>
                  <div className="max-w-[92%] rounded-xl rounded-bl-sm border-2 border-[#11120f] bg-white px-2.5 py-1.5" style={{ animation: "elpino-rv-pop .35s .7s both" }}>It shipped yesterday and arrives Thursday.</div>
                </>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={PURPLE}><Code2 size={13} />For developers</Stamp></Rv>
          <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.058em]">From <span className="font-mono tracking-[-0.06em]">&lt;script&gt;</span> to <span className="hl">resolved.</span></h1></Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[56ch] text-lg leading-8 text-[#11120f]/70">One tag for the widget, one signed token so Elpino knows who&apos;s logged in, one MCP server so the AI can read your data. Watch the three steps land in a page.</p></Rv>
          <Rv delay={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>Start free <ArrowRight size={17} /></Link>
              <Link href="/docs/identity-verification" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">Read the docs</Link>
            </div>
          </Rv>
        </div>
        <Rv variant="deal" delay={300} className="mt-14"><Ide /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- ticker

const TICKS = ["HS256", "aud = elpino-widget", "exp ≤ 5 min", "one-time jti", "$elpino.push", "MCP · 5 servers", "15 tools each", "read-only vs writes", "Verified badge", "ref_name_9f2c"];

function Ticker() {
  const row = [...TICKS, ...TICKS];
  return (
    <div className="overflow-hidden border-y-2 border-[#11120f] bg-[#11120f] py-4" aria-hidden="true">
      <div className="flex w-max gap-4" style={{ animation: "elpino-marquee 36s linear infinite" }}>
        {row.map((t, i) => <span key={i} className="whitespace-nowrap rounded-lg border border-white/25 px-4 py-1.5 font-mono text-[14px]" style={{ color: [ "#c9f5e2", "#ffd84d", "#9cc4ff", "#ffb3d1"][i % 4] }}>{t}</span>)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- sequence

const ACTORS = [["Browser", BLUE], ["Your server", GREEN], ["Elpino", PURPLE], ["Your MCP server", ORANGE]] as const;
const SEQ: { from: number; to: number; label: string; note?: string }[] = [
  { from: 0, to: 1, label: "Customer logs in" },
  { from: 1, to: 0, label: "Signed JWT", note: "≤ 5 min · works once" },
  { from: 0, to: 2, label: "$elpino identify(token)" },
  { from: 2, to: 2, label: "Verify signature + claims ✓" },
  { from: 0, to: 2, label: "“Where's my order?”" },
  { from: 2, to: 3, label: "get_order", note: "verified customers only" },
  { from: 3, to: 2, label: "Order status" },
  { from: 2, to: 0, label: "Reply to the customer" },
];

function Sequence() {
  const reduced = useReduced();
  const [n, setN] = useState(reduced ? SEQ.length : 1);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (reduced) { setN(SEQ.length); return; }
    if (!playing) return;
    const id = window.setTimeout(() => setN((v) => (v >= SEQ.length + 2 ? 1 : v + 1)), n >= SEQ.length ? 2600 : 1000);
    return () => window.clearTimeout(id);
  }, [n, playing, reduced]);

  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28" style={{ backgroundColor: "#fff8ec", backgroundImage: "linear-gradient(#11120f0d 1px, transparent 1px), linear-gradient(90deg, #11120f0d 1px, transparent 1px)", backgroundSize: "44px 44px" }}>
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="Request flow" color={GREEN} title={<>One question, <span className="hl">four systems.</span></>} sub="Who talks to whom when a logged-in customer asks about their order. Step through it, or let it play." />
        <Rv variant="deal" delay={100}>
          <div className={`${card} mt-12 bg-[#fffdf5] p-4 sm:p-6`}>
            <div className="grid grid-cols-4 gap-2">
              {ACTORS.map(([a, c]) => <div key={a} className="rounded-xl border-2 border-[#11120f] px-2 py-2.5 text-center text-[12px] font-semibold sm:text-[14px]" style={{ backgroundColor: c, color: "#fff" }}>{a}</div>)}
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
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#11120f] px-3 py-1 text-[11.5px] font-semibold text-white sm:text-[13px]" style={{ backgroundColor: GREEN }}><Check size={12} strokeWidth={3} />{m.label}</span>
                        </div>
                      ) : (
                        <div className="absolute top-2" style={{ left: `${lo * 25 + 12.5}%`, width: `${(hi - lo) * 25}%` }}>
                          <div className="text-center"><span className="inline-block max-w-full truncate rounded-md border-2 border-[#11120f] bg-white px-2 py-0.5 font-mono text-[10.5px] font-semibold sm:text-[12px]">{m.label}</span></div>
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
              <span className={`${mono} text-[#11120f]/50`}>Step {Math.min(n, SEQ.length)} / {SEQ.length}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setPlaying(false); setN(Math.min(SEQ.length, n + 1)); }} className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-[13px] font-semibold transition hover:bg-[#ffd84d]">Next step</button>
                <button type="button" onClick={() => { setN(1); setPlaying(true); }} className="rounded-full border-2 border-[#11120f] px-4 py-1.5 text-[13px] font-semibold text-white" style={{ backgroundColor: BLUE }}>Replay</button>
              </div>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- token explorer

const CLAIMS: { k: string; v: string; req: boolean; d: string }[] = [
  { k: "sub", v: '"user_8421"', req: true, d: "Your stable account ID for this user." },
  { k: "aud", v: '"elpino-widget"', req: true, d: 'Exactly "elpino-widget".' },
  { k: "jti", v: '"5b1e…c9f2"', req: true, d: "A fresh random ID per token, 16 to 128 URL-safe characters. A UUID works." },
  { k: "iat", v: "1758726000", req: true, d: "Issued-at time in whole seconds (not milliseconds)." },
  { k: "exp", v: "1758726300", req: true, d: "Expiry in whole seconds, at most 5 minutes after iat." },
  { k: "email", v: '"aisha@example.com"', req: false, d: "Omit it when there is none. null is rejected." },
  { k: "email_verified", v: "true", req: false, d: "true only if your login system confirmed ownership." },
  { k: "name", v: '"Aisha Khan"', req: false, d: "Display name shown to your team." },
];

function TokenExplorer() {
  const [sel, setSel] = useState(0);
  const [err, setErr] = useState(0);
  const errs = IDENTITY_ERRORS.slice(0, 8);
  const c = CLAIMS[sel];
  const e = errs[err];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="The identity token" color={PURPLE} title={<>Anatomy of a token, <span className="hl">and how it breaks.</span></>} sub="HS256, signed with your workspace secret. Tap a claim for its rule, then break the token to see what the widget tells you." />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Rv variant="up">
            <div className={`${card} overflow-hidden bg-[#11120f] text-white`}>
              <div className={`${mono} border-b-2 border-white/15 px-4 py-2.5 text-white/50`}>Payload</div>
              <div className="p-4 font-mono text-[13px] leading-8">
                <span className="text-white/50">{"{"}</span>
                {CLAIMS.map((x, i) => (
                  <button key={x.k} type="button" onClick={() => setSel(i)} aria-pressed={i === sel} className="block w-full rounded-lg px-3 text-left transition" style={{ backgroundColor: i === sel ? "#ffffff1a" : "transparent" }}>
                    <span style={{ color: "#8ec7ff" }}>&quot;{x.k}&quot;</span><span className="text-white/50">: </span><span style={{ color: "#ffd84d" }}>{x.v}</span><span className="text-white/40">,</span>
                    {!x.req && <span className="ml-3 text-[10px] text-white/35">optional</span>}
                  </button>
                ))}
                <span className="text-white/50">{"}"}</span>
              </div>
            </div>
          </Rv>
          <Rv variant="up" delay={100}>
            <div className="space-y-4">
              <div key={c.k} className={`${card} bg-[#fffdf5] p-5`} style={{ animation: "elpino-rv-deal .4s both" }}>
                <div className="flex items-center justify-between"><code className="font-mono text-2xl font-bold">{c.k}</code><Stamp color={c.req ? PINK : GREEN}>{c.req ? "Required" : "Optional"}</Stamp></div>
                <p className="mt-3 text-[16.5px] leading-7 text-[#11120f]/75">{c.d}</p>
              </div>
              <div className={`${card} bg-white p-5`}>
                <p className={`${mono} text-[#11120f]/50`}>Break it</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {errs.map((x, i) => <button key={x.code} type="button" onClick={() => setErr(i)} aria-pressed={i === err} className="rounded-full border-2 border-[#11120f] px-3 py-1 font-mono text-[11.5px] font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: i === err ? ORANGE : "#fff", color: i === err ? "#fff" : INK }}>{x.code}</button>)}
                </div>
                <div key={e.code} className="mt-4 rounded-xl border-2 border-[#11120f] bg-[#11120f] p-3.5 font-mono text-[12px] leading-6 text-[#ffb3b3]" style={{ animation: "elpino-rv-up .3s both" }}>[Elpino] Identity token was not accepted: {e.code}</div>
                <p className="mt-3 text-[14.5px] leading-6 text-[#11120f]/70"><b>Fix:</b> {e.fix}</p>
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- server snippets

function Server() {
  const list = SERVER_SNIPPETS.slice(0, 4);
  const [i, setI] = useState(0);
  const s = list[i];
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="Your backend" color={GREEN} title={<>Copy, paste, <span className="hl">ship.</span></>} sub="The same snippets your dashboard shows, in the language you already run." />
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {list.map((x, k) => <button key={x.id} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5" style={k === i ? { backgroundColor: GREEN, color: "#fff" } : { backgroundColor: "#fff" }}>{x.label}</button>)}
        </div>
        <Rv variant="deal" delay={100}>
          <div className="mt-6">
            <p className="mb-2 font-mono text-[13px] text-[#11120f]/60">$ {s.install}</p>
            <Code key={s.id} title={`${s.label.toLowerCase()} · identity token`} code={s.code} />
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- MCP

type Tool = { name: string; d: string; write: boolean; on: boolean };
const TOOLS0: Tool[] = [
  { name: "get_order", d: "Look up an order and its status", write: false, on: true },
  { name: "track_shipment", d: "Live tracking for a parcel", write: false, on: true },
  { name: "update_address", d: "Change a delivery address", write: true, on: true },
  { name: "cancel_order", d: "Cancel an order that hasn't shipped", write: true, on: false },
];

function Mcp() {
  const [tools, setTools] = useState(TOOLS0);
  const [pub, setPub] = useState(false);
  const usable = tools.filter((t) => t.on && (!pub || !t.write));
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={ORANGE}><Plug size={13} />MCP servers</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Give the AI tools. <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>Keep the keys.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">Connect up to five MCP servers, enable up to 15 tools on each, and choose who they&apos;re open to. Flip the switches to see what the agent can use.</p></Rv>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Rv variant="up">
            <div className={`${card} bg-[#fffdf5] p-5 text-[#11120f]`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#11120f]/25 pb-4">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border-2 border-[#11120f]" style={{ backgroundColor: ORANGE }}><Database size={18} color="#fff" /></span><div><p className="font-semibold">Your shop MCP server</p><p className={`${mono} text-[#11120f]/50`}>{tools.length} tools discovered</p></div></div>
                <button type="button" role="switch" aria-checked={pub} onClick={() => setPub(!pub)} className="flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-3 py-1.5 text-[12.5px] font-semibold">Open read-only tools to any visitor<span className="relative h-5 w-9 rounded-full border-2 border-[#11120f]" style={{ backgroundColor: pub ? GREEN : "#e7e2d6" }}><span className="absolute top-px size-3.5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: pub ? "16px" : "1px" }} /></span></button>
              </div>
              <div className="divide-y-2 divide-[#11120f]/10">
                {tools.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2"><code className="font-mono text-[13.5px] font-semibold">{t.name}</code><span className={`${mono} rounded-full border-2 border-[#11120f] px-1.5 py-0.5 text-[8.5px]`} style={{ backgroundColor: t.write ? YELLOW : "#d8f3e9" }}>{t.write ? "Changes data" : "Read-only"}</span>{pub && t.write && <span className={`${mono} inline-flex items-center gap-1 text-[8.5px] text-[#11120f]/55`}><Lock size={10} />Needs verified customer</span>}</p>
                      <p className="text-[13px] text-[#11120f]/55">{t.d}</p>
                    </div>
                    <button type="button" role="switch" aria-checked={t.on} aria-label={`Allow ${t.name}`} onClick={() => setTools(tools.map((x, k) => (k === i ? { ...x, on: !x.on } : x)))} className="relative h-7 w-12 shrink-0 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: t.on ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: t.on ? "calc(100% - 22px)" : "2px" }} /></button>
                  </div>
                ))}
              </div>
            </div>
          </Rv>
          <Rv variant="up" delay={120}>
            <div className={`${card} h-full p-6`} style={{ backgroundColor: PURPLE }}>
              <p className={`${mono} text-white/75`}>Agent can call</p>
              <p className="mt-2 text-6xl font-semibold tracking-[-0.05em]">{usable.length}<span className="text-2xl text-white/60"> / {tools.length}</span></p>
              <div className="mt-4 flex flex-wrap gap-2">{tools.map((t) => { const ok = usable.includes(t); return <code key={t.name} className="rounded-lg border-2 border-[#11120f] px-2 py-1 font-mono text-[11.5px]" style={{ backgroundColor: ok ? "#fff" : "transparent", color: ok ? INK : "#ffffff77", textDecoration: ok ? "none" : "line-through" }}>{t.name}</code>; })}</div>
              <ul className="mt-6 space-y-2.5 text-[14.5px]">{["Every call is re-checked against your list on the server", "Tools that change data always need a verified customer", "Credentials are stored encrypted"].map((x) => <li key={x} className="flex gap-2.5"><Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- what the AI sees

function Sees() {
  const [raw, setRaw] = useState(true);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Heading left eyebrow="Privacy by default" color={PINK} title={<>The model <span className="hl">never sees</span> who they are.</>} sub="Before the AI reads a conversation, names, emails and IDs are swapped for reference codes, and secrets like tokens and keys are stripped out. Tools still get the real values on your side." />
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} bg-[#fffdf5] p-5`}>
            <div className="mb-4 flex w-fit rounded-full border-2 border-[#11120f] bg-white p-1">
              {[[true, "What your team sees"], [false, "What the AI model sees"]].map(([v, l]) => <button key={String(v)} type="button" onClick={() => setRaw(v as boolean)} aria-pressed={raw === v} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold transition" style={raw === v ? { backgroundColor: v ? BLUE : PURPLE, color: "#fff" } : undefined}>{!v && <EyeOff size={14} />}{l as string}</button>)}
            </div>
            <div key={String(raw)} className="space-y-2.5 text-[14px]" style={{ animation: "elpino-rv-up .35s both" }}>
              <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-4 py-2.5 text-white" style={{ backgroundColor: PURPLE }}>{raw ? "Hi, I'm Aisha Khan (aisha@example.com). Where's my order?" : "Hi, I'm ref_name_9f2c (ref_email_41ab). Where's my order?"}</div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-white px-4 py-2.5">{raw ? "Hi Aisha, your order shipped yesterday." : "Hi, your order shipped yesterday."}</div>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- faq

const FAQS: [string, string][] = [
  ["Do I have to use identity verification?", "No, but it's what lets the AI safely show private data. Anyone can type any email into a chat, so a signed token from your own login system is how a customer becomes Verified."],
  ["How long does a token last?", "At most five minutes, and it works once. The chat session itself lasts up to 8 hours, with a 30-minute idle limit."],
  ["Which signing algorithm?", "HS256. Other algorithms, including none and RS256, are refused."],
  ["Which languages have snippets?", "Node.js, Python, PHP and Ruby, in your dashboard's identity settings and the docs."],
  ["What is an MCP server?", "A service that exposes tools over the Model Context Protocol. Elpino discovers its tools, and you enable the ones the AI may use."],
  ["Can the AI change data in my systems?", "Only through tools you've enabled, and tools that change data always need a verified customer."],
  ["Is there an API?", "The widget SDK, identity tokens and MCP are the integration surface today."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow="Questions" color={YELLOW} title={<>Good to <span className="hl">know.</span></>} />
        <div className="mt-12 space-y-3">
          {FAQS.map(([q, a], i) => (
            <Rv key={q} variant="up" delay={i * 50}>
              <div className={`${card} overflow-hidden ${open === i ? "bg-[#fffdf5]" : "bg-white"}`}>
                <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold">
                  {q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-[#11120f] transition-transform duration-300" style={{ backgroundColor: open === i ? YELLOW : "#fff", transform: open === i ? "rotate(45deg)" : "none" }}><Plus size={16} /></span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-[16px] leading-7 text-[#11120f]/70">{a}</p></div>
                </div>
              </div>
            </Rv>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {[["Identity docs", "/docs/identity-verification"], ["Widget docs", "/docs/chat-widget"], ["AI agent", "/product/ai-agent"], ["Security guide", "/security-guide"]].map(([l, h]) => <Link key={h} href={h} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{l}<ArrowRight size={13} /></Link>)}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-[#fff8ec] px-5 pb-24 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: PURPLE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Bot size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5.2vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">Ship it in an afternoon.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">Start free, paste the tag, and wire up identity when you&apos;re ready.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/docs" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">Open the docs</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function DevelopersClient() {
  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero />
      <Ticker />
      <Sequence />
      <TokenExplorer />
      <Server />
      <Mcp />
      <Sees />
      <Faq />
      <Closing />
    </main>
  );
}
