"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BookOpen, Bot, Check, CreditCard, Database, Eye, EyeOff, Headset, History, KeyRound, Lock, MessageCircle,
  Plug, Plus, Search, ShieldCheck, Sparkles, Wrench, X, Zap,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// The AI agent page. Everything on it is something the agent really does:
// it reads the conversation and past ones, verifies identity with an email
// code or signed token, looks up payments (Stripe, Razorpay), calls tools on
// MCP servers an admin has approved (up to 5 servers, tools switched on one
// by one), routes to a sales/support/technical specialist, has its facts
// reviewed, and asks before handing off. Names and emails are replaced with
// reference codes before the model reads the conversation.

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

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

function Stamp({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3 py-1.5`} style={{ backgroundColor: color, color: onDark(color) }}>
      {children}
    </span>
  );
}

function Heading({ eyebrow, color, title, sub }: { eyebrow: string; color: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-[#11120f]/65">{sub}</p></Rv>}
    </div>
  );
}

// -------------------------------------------------------------------- hero

type Step = { kind: "route" | "tool" | "mcp" | "verify" | "review" | "done"; text: string; result?: string };
const TRACE: Step[] = [
  { kind: "route", text: "router → support specialist" },
  { kind: "tool", text: "recall_conversation(“order 4821”)", result: "2 earlier messages" },
  { kind: "tool", text: "get_past_conversations", result: "1 resolved chat last month" },
  { kind: "verify", text: "send_email_code → check_email_code", result: "identity verified" },
  { kind: "mcp", text: "mcp_shop__get_order(“4821”)", result: "shipped · arrives Thursday" },
  { kind: "review", text: "review", result: "facts match tool results" },
  { kind: "done", text: "reply sent · mark_resolved" },
];
const KIND_COLOR: Record<Step["kind"], string> = { route: BLUE, tool: PURPLE, mcp: ORANGE, verify: GREEN, review: PINK, done: YELLOW };

function LiveTrace() {
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(TRACE.length + 1); return; }
    const id = window.setTimeout(() => setN((v) => (v >= TRACE.length + 1 ? 0 : v + 1)), n === 0 ? 900 : n > TRACE.length ? 4200 : 1000);
    return () => window.clearTimeout(id);
  }, [n, reduced]);

  return (
    <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
      {/* customer chat */}
      <div className={`${card} flex min-h-[420px] flex-col bg-[#fffdf5]`}>
        <div className="flex items-center gap-2.5 border-b-2 border-[#11120f] px-4 py-3" style={{ backgroundColor: BLUE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/contact-support-sloth.png" alt="" className="size-9 rounded-full border-2 border-[#11120f] bg-white object-cover object-top" />
          <div className="text-white"><p className="text-sm font-semibold leading-tight">Elpino</p><p className="text-[11px] opacity-90">AI agent</p></div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2.5 p-4 text-[14px]">
          {n >= 0 && <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-3.5 py-2.5 text-white" style={{ backgroundColor: PURPLE }}>Hi, where is my order #4821?</div>}
          {n >= 1 && n <= TRACE.length && <span className="flex gap-1.5 px-1">{[0, 1, 2].map((d) => <span key={d} className="size-2.5 animate-bounce rounded-full" style={{ backgroundColor: BLUE, animationDelay: `${d * 0.12}s` }} />)}</span>}
          {n > TRACE.length && <div className="max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-white px-3.5 py-2.5" style={{ animation: "elpino-rv-pop .35s both" }}>Good news, Aisha&apos;s order shipped yesterday and arrives Thursday. I&apos;ve emailed you the tracking link too.</div>}
        </div>
      </div>

      {/* agent trace */}
      <div className={`${card} flex min-h-[420px] flex-col overflow-hidden bg-[#11120f] text-white`}>
        <div className="flex items-center justify-between border-b-2 border-white/15 px-4 py-3">
          <span className={`${mono} text-white/60`}>What the agent is doing</span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/60"><span className="size-2 rounded-full" style={{ backgroundColor: n > 0 && n <= TRACE.length ? "#7dffc5" : "#8a8676", animation: n > 0 && n <= TRACE.length ? "elpino-rv-pop .8s ease-in-out infinite alternate" : undefined }} />{n > TRACE.length ? "Resolved" : n > 0 ? "Working" : "Idle"}</span>
        </div>
        <div className="flex-1 space-y-2 p-4 font-mono text-[12.5px]">
          {TRACE.slice(0, Math.min(n, TRACE.length)).map((t, i) => (
            <div key={i} className="flex items-start gap-2.5" style={{ animation: "elpino-rv-up .4s both" }}>
              <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: KIND_COLOR[t.kind], color: onDark(KIND_COLOR[t.kind]) }}>{t.kind}</span>
              <span className="min-w-0"><span className="text-white/90">{t.text}</span>{t.result && <span className="block text-[#7dffc5]">↳ {t.result}</span>}</span>
            </div>
          ))}
          {n === 0 && <p className="pt-16 text-center text-white/35">Waiting for a customer message…</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------- the new hire

function Badge() {
  const skills = ["Answers from your docs", "Verifies identity", "Checks payments", "Uses your MCP tools", "Asks before handoff"];
  return (
    <div className="relative mx-auto w-[310px]" style={{ animation: "elpino-swing 3.6s ease-in-out infinite alternate", transformOrigin: "50% -60px" }}>
      <div aria-hidden="true" className="mx-auto h-16 w-5 border-x-2 border-[#11120f]" style={{ backgroundColor: BLUE }} />
      <div aria-hidden="true" className="mx-auto -mt-1 h-3 w-14 rounded-full border-2 border-[#11120f] bg-[#e7e2d6]" />
      <div className={`${card} -mt-1 overflow-hidden bg-[#fffdf5]`}>
        <div className="border-b-2 border-[#11120f] px-4 py-2.5 text-center" style={{ backgroundColor: BLUE }}><span className={`${mono} text-white`}>Elpino · Staff</span></div>
        <div className="px-5 pb-5 pt-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/founders-sloth-v2.png" alt="Elpino's AI support sloth" className="mx-auto size-28 rounded-full border-2 border-[#11120f] bg-[#ffd84d] object-cover object-top" />
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Elpino</p>
          <p className={`${mono} mt-1 text-[#11120f]/55`}>AI support agent</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {skills.map((s, i) => <span key={s} className="rounded-full border-2 border-[#11120f] px-2 py-0.5 text-[10.5px] font-semibold" style={{ backgroundColor: [YELLOW, "#d8f3e9", "#ffe6d6", "#e4dffa", "#fbdbe8"][i] }}>{s}</span>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px]">
            <div className="rounded-lg border-2 border-[#11120f] bg-white p-2"><span className={`${mono} block text-[8.5px] text-[#11120f]/45`}>Start date</span>Today</div>
            <div className="rounded-lg border-2 border-[#11120f] bg-white p-2"><span className={`${mono} block text-[8.5px] text-[#11120f]/45`}>Clearance</span>You decide</div>
          </div>
          <div aria-hidden="true" className="elpino-barcode mt-4 h-9 w-full" />
          <p className={`${mono} mt-1 text-[9px] text-[#11120f]/45`}>EL-0001 · Never clocks out</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-[124px] sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:pt-[140px]">
        <div>
          <Rv variant="drop"><Stamp color={YELLOW}><Bot size={13} />AI agent</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.7rem,6.2vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              Meet your newest <span className="hl">support hire.</span>
            </h1>
          </Rv>
          <Rv delay={170}><p className="mt-6 max-w-[54ch] text-lg leading-8 text-[#11120f]/70">Elpino starts on day one already knowing your business. It remembers every customer, checks who they are before it acts, works your payment and order systems through MCP, and asks before it ever hands a chat to your team.</p></Rv>
          <Rv delay={250}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>Hire Elpino, free <ArrowRight size={17} /></Link>
              <Link href="/features" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">See all features</Link>
            </div>
          </Rv>
        </div>
        <Rv variant="deal" delay={200}><Badge /></Rv>
      </div>
    </section>
  );
}

function WatchIt() {
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="First task" color={PURPLE} title={<>Watch it handle <span className="hl">a real request.</span></>} sub="A customer asks where their order is. On the right is everything the agent does before it replies." />
        <Rv variant="deal" delay={120} className="mt-14"><LiveTrace /></Rv>
        <Rv delay={100}><p className="mt-5 text-center text-sm text-[#11120f]/55">Sample conversation. The tool names shown are the ones the agent really calls.</p></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- onboarding

const ONBOARD = [
  { t: "Teach it your website and files", d: "Crawl pages, upload documents, write your own.", href: "/product/knowledge-hub" },
  { t: "Paste the widget snippet", d: "One line and the chat appears on your site." },
  { t: "Connect Stripe or Razorpay", d: "So it can check payments and subscriptions." },
  { t: "Plug in your MCP tools", d: "Switch on only the tools it may use." },
  { t: "Decide on refunds", d: "They're off until you turn them on." },
  { t: "Invite your team", d: "So humans are ready when it asks for them.", href: "/product/inbox" },
];

function Onboarding() {
  const [done, setDone] = useState<boolean[]>(ONBOARD.map((_, i) => i < 2));
  const count = done.filter(Boolean).length;
  const ready = count === ONBOARD.length;
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="Onboarding" color={GREEN} title={<>Six steps to <span className="hl">first day.</span></>} sub="Tick them off. There's no training period, and each one is a setting you control." />
        <div className={`${card} relative mt-14 bg-[#fffdf5] p-5 sm:p-7`}>
          <div className="mb-5 flex items-center gap-4">
            <div className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#11120f] bg-white"><div className="h-full transition-[width] duration-500" style={{ width: `${(count / ONBOARD.length) * 100}%`, backgroundColor: ready ? GREEN : ORANGE }} /></div>
            <span className={`${mono} tabular-nums`}>{count} / {ONBOARD.length}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ONBOARD.map((o, i) => (
              <button key={o.t} type="button" onClick={() => setDone(done.map((x, k) => (k === i ? !x : x)))} aria-pressed={done[i]} className={`${card} flex items-start gap-3 p-4 text-left transition hover:-translate-y-0.5`} style={{ backgroundColor: done[i] ? "#eafaf3" : "#fff" }}>
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 border-[#11120f]" style={{ backgroundColor: done[i] ? GREEN : "#fff" }}>{done[i] && <Check size={16} color="#fff" strokeWidth={3} />}</span>
                <span><span className={`block text-[16.5px] font-semibold ${done[i] ? "line-through decoration-2" : ""}`}>{o.t}</span><span className="block text-[14px] text-[#11120f]/60">{o.d}</span></span>
              </button>
            ))}
          </div>
          {ready && <span className={`${mono} absolute -right-2 -top-5 rotate-[8deg] rounded-xl border-2 border-[#11120f] px-4 py-2 text-[13px] text-white`} style={{ backgroundColor: GREEN, animation: "elpino-slam .4s both" }}>Ready to work!</span>}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------- customer file

const FILE = [
  { key: "conv", icon: MessageCircle, color: BLUE, title: "This conversation", how: "Remembers what was said and can look back for details it needs, even in a long chat.", rows: [["Asked about", "Order #4821"], ["Wants", "A delivery date"]] },
  { key: "hist", icon: History, color: PURPLE, title: "Past conversations", how: "Knows earlier chats with the same person, so they never repeat themselves.", rows: [["Last chat", "Login issue, resolved"], ["Times contacted", "2"]] },
  { key: "id", icon: KeyRound, color: GREEN, title: "Verified identity", how: "Confirms who they are with a one-time email code or a signed token from your app before touching anything personal.", rows: [["Identity", "Verified by email code"]] },
  { key: "pay", icon: CreditCard, color: ORANGE, title: "Payments", how: "Looks up real payments and subscriptions in Stripe or Razorpay, and can send receipts and payment links.", rows: [["Plan", "Growth · active"], ["Last payment", "Paid, receipt sent"]] },
  { key: "mcp", icon: Plug, color: PINK, title: "Your systems (MCP)", how: "Calls the tools you approve on your own MCP servers: orders, accounts, bookings, anything you expose.", rows: [["Order #4821", "Shipped · arrives Thursday"]] },
  { key: "kb", icon: BookOpen, color: YELLOW, title: "Your knowledge", how: "Searches everything you taught it and can read a current page on your site for fresh details.", rows: [["Delivery policy", "3–5 business days"]] },
] as const;

function CustomerFile() {
  const reduced = useReduced();
  const [n, setN] = useState(1);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setN((v) => (v >= FILE.length ? 1 : v + 1)), 2600);
    return () => window.clearTimeout(id);
  }, [n, paused, reduced]);
  const active = FILE[n - 1];

  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Knowing your customer" color={PURPLE} title={<>Its case file <span className="hl">on every customer.</span></>} sub="Before it answers, the agent builds a file on the person it's helping. Tap a source to see what it adds." />
        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="space-y-2.5">
            {FILE.map((f, i) => {
              const on = i < n;
              return (
                <button key={f.key} type="button" onClick={() => setN(i + 1)} aria-pressed={i === n - 1} className={`${card} flex w-full items-start gap-4 p-4 text-left transition hover:-translate-y-0.5 ${i === n - 1 ? "bg-white" : "bg-[#fff8ec]/60"}`} style={{ opacity: on ? 1 : 0.55 }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: f.color }}><f.icon size={20} color={onDark(f.color)} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">{f.title}{on && <Check size={16} color={GREEN} strokeWidth={3} />}</span>
                    {i === n - 1 && <span className="mt-1 block text-[15px] leading-7 text-[#11120f]/65" style={{ animation: "elpino-rv-up .4s both" }}>{f.how}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`${card} sticky top-24 h-fit bg-[#fffdf5] p-6`}>
            <div className="flex items-center gap-3 border-b-2 border-dashed border-[#11120f]/25 pb-4">
              <span className="grid size-14 place-items-center rounded-full border-2 border-[#11120f] text-lg font-bold text-white" style={{ backgroundColor: PURPLE }}>AK</span>
              <div><p className="text-xl font-semibold tracking-tight">Aisha Khan</p><p className={`${mono} text-[#11120f]/50`}>Customer file · {n} of {FILE.length} sources</p></div>
            </div>
            <div className="mt-4 space-y-3">
              {FILE.slice(0, n).map((f) => (
                <div key={f.key} className="rounded-xl border-2 border-[#11120f] bg-white p-3" style={{ animation: "elpino-rv-drop .45s both" }}>
                  <p className={`${mono} flex items-center gap-1.5 text-[10px]`} style={{ color: f.color === YELLOW ? "#a88a00" : f.color }}><f.icon size={12} />{f.title}</p>
                  {f.rows.map(([k, v]) => <p key={k} className="mt-1.5 flex justify-between gap-3 text-[14px]"><span className="text-[#11120f]/55">{k}</span><span className="text-right font-semibold">{v}</span></p>)}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#11120f]/50">Sample data. On the real thing, the AI sees reference codes instead of the customer&apos;s name and email.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------- mcp

type ToolDef = { name: string; desc: string; write: boolean; on: boolean; danger?: boolean };
const TOOLS0: ToolDef[] = [
  { name: "get_order", desc: "Look up an order and its status", write: false, on: true },
  { name: "track_shipment", desc: "Live tracking for a parcel", write: false, on: true },
  { name: "list_products", desc: "Catalogue and stock levels", write: false, on: true },
  { name: "update_address", desc: "Change a delivery address", write: true, on: true },
  { name: "cancel_order", desc: "Cancel an order that hasn't shipped", write: true, on: false },
  { name: "delete_customer", desc: "Erase a customer record", write: true, on: false, danger: true },
];

function Mcp() {
  const [tools, setTools] = useState(TOOLS0);
  const [access, setAccess] = useState<"verified" | "public">("verified");
  const usable = tools.filter((t) => t.on && (access === "verified" || !t.write));
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={ORANGE}><Plug size={13} />MCP plugins</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Access request: <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>your systems.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">Connect up to five MCP servers, whether that&apos;s your store, your CRM or your booking system. Elpino discovers their tools, and you switch on exactly the ones the agent may use. Try the control panel below.</p></Rv>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <Rv variant="up">
            <div className={`${card} bg-[#fffdf5] p-5 text-[#11120f]`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#11120f]/25 pb-4">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border-2 border-[#11120f]" style={{ backgroundColor: ORANGE }}><Database size={18} color="#fff" /></span><div><p className="font-semibold">Your shop MCP server</p><p className={`${mono} text-[#11120f]/50`}>{tools.length} tools discovered</p></div></div>
                <div className="flex rounded-full border-2 border-[#11120f] bg-white p-0.5 text-[12px] font-semibold">
                  {(["verified", "public"] as const).map((a) => <button key={a} type="button" onClick={() => setAccess(a)} aria-pressed={access === a} className="rounded-full px-3 py-1.5 transition" style={access === a ? { backgroundColor: GREEN, color: "#fff" } : undefined}>{a === "verified" ? "Verified customers" : "Any visitor"}</button>)}
                </div>
              </div>
              <div className="mt-3 divide-y-2 divide-[#11120f]/10">
                {tools.map((t, i) => {
                  const blocked = access === "public" && t.write;
                  return (
                    <div key={t.name} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2"><code className="font-mono text-[13.5px] font-semibold">{t.name}</code>
                          <span className={`${mono} rounded-full border-2 border-[#11120f] px-1.5 py-0.5 text-[8.5px]`} style={{ backgroundColor: t.danger ? PINK : t.write ? YELLOW : "#d8f3e9", color: t.danger ? "#fff" : INK }}>{t.danger ? "Destructive" : t.write ? "Changes data" : "Read-only"}</span>
                          {blocked && <span className={`${mono} inline-flex items-center gap-1 text-[8.5px] text-[#11120f]/55`}><Lock size={10} />Needs verified customer</span>}
                        </p>
                        <p className="text-[13px] text-[#11120f]/55">{t.desc}</p>
                      </div>
                      <button type="button" role="switch" aria-checked={t.on} aria-label={`Allow ${t.name}`} onClick={() => setTools(tools.map((x, k) => (k === i ? { ...x, on: !x.on } : x)))} className="relative h-7 w-12 shrink-0 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: t.on ? GREEN : "#e7e2d6" }}>
                        <span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: t.on ? "calc(100% - 22px)" : "2px" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Rv>

          <Rv variant="up" delay={120}>
            <div className={`${card} h-full p-6`} style={{ backgroundColor: PURPLE }}>
              <p className={`${mono} text-white/75`}>What the agent can see</p>
              <p className="mt-3 text-[3.5rem] font-semibold leading-none tracking-[-0.05em]">{usable.length}<span className="text-2xl text-white/60"> / {tools.length}</span></p>
              <p className="mt-2 text-white/80">tools available right now</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tools.map((t) => { const ok = usable.includes(t); return <code key={t.name} className="rounded-lg border-2 border-[#11120f] px-2 py-1 font-mono text-[11.5px] transition-all" style={{ backgroundColor: ok ? "#fff" : "transparent", color: ok ? INK : "#ffffff77", textDecoration: ok ? "none" : "line-through" }}>{t.name}</code>; })}
              </div>
              <ul className="mt-6 space-y-2.5 text-[14.5px] text-white/90">
                {["A tool that's switched off is invisible to the agent", "Every call is re-checked against your list on the server", "Tools that change data always need a verified customer", "Server credentials are stored encrypted"].map((x) => <li key={x} className="flex gap-2.5"><Check size={16} strokeWidth={3} className="mt-0.5 shrink-0" />{x}</li>)}
              </ul>
            </div>
          </Rv>
        </div>

        <Rv delay={100}>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[["Payments, built in", "Connect Stripe or Razorpay and the agent can look up payments and subscriptions, send receipts and payment links, and cancel a subscription.", CreditCard, BLUE], ["Bring any MCP server", "Anything that speaks MCP works, so you decide which tools the agent gets.", Plug, ORANGE], ["Elpino's own MCP server", "Your customers' own tools can read their Elpino plan, usage and payments over MCP.", Sparkles, GREEN]].map(([t, d, I, c]) => {
              const Ic = I as typeof Plug;
              return <div key={t as string} className="rounded-[22px] border-2 border-white/25 p-5"><span className="grid size-10 place-items-center rounded-xl border-2 border-[#11120f]" style={{ backgroundColor: c as string }}><Ic size={18} color="#fff" /></span><p className="mt-3 text-lg font-semibold">{t as string}</p><p className="mt-1 text-[14.5px] leading-6 text-white/60">{d as string}</p></div>;
            })}
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- org chart

const LANES = [
  { k: "Sales", c: ORANGE, d: "Plans, pricing, fit" },
  { k: "Support", c: BLUE, d: "Accounts, payments, how-to" },
  { k: "Technical", c: PURPLE, d: "Errors, setup, integration" },
];

function OrgChart() {
  const reduced = useReduced();
  const [i, setI] = useState(1);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % LANES.length), 2400);
    return () => window.clearInterval(id);
  }, [reduced]);
  const line = <div aria-hidden="true" className="mx-auto h-7 w-0.5 bg-[#11120f]" />;
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <Heading eyebrow="The team behind it" color={BLUE} title={<>One agent. <span className="hl">A whole org chart.</span></>} sub="Every message is routed to the right specialist, and nothing goes out before a reviewer checks the facts." />
        <div className="mt-14 flex flex-col items-stretch">
          <div className={`${card} mx-auto flex items-center gap-3 px-5 py-3 font-semibold`} style={{ backgroundColor: YELLOW }}><Zap size={18} />Router <span className="text-[13px] font-normal opacity-70">picks the specialist</span></div>
          {line}
          <div className="grid gap-3 md:grid-cols-3">
            {LANES.map((l, k) => (
              <div key={l.k} className={`${card} p-4 text-center transition-all duration-500`} style={{ backgroundColor: k === i ? l.c : "#fff", color: k === i ? "#fff" : INK, transform: k === i ? "translateY(-6px) scale(1.03)" : "none", opacity: k === i ? 1 : 0.6 }}>
                <Bot className="mx-auto" size={24} />
                <p className="mt-2 text-xl font-semibold">{l.k}</p>
                <p className="text-[13.5px] opacity-80">{l.d}</p>
              </div>
            ))}
          </div>
          {line}
          <div className={`${card} mx-auto flex items-center gap-3 px-5 py-3 font-semibold text-white`} style={{ backgroundColor: PINK }}><ShieldCheck size={18} />Reviewer <span className="text-[13px] font-normal opacity-80">fact-checks the draft against tool results</span></div>
          {line}
          <div className={`${card} mx-auto flex items-center gap-3 bg-[#d8f3e9] px-5 py-3 font-semibold`}><Sparkles size={18} />Polish <span className="text-[13px] font-normal opacity-70">then the customer sees it</span></div>
        </div>
        <Rv delay={100}><p className="mt-8 text-center text-[15px] text-[#11120f]/60">Hard turns are escalated to a stronger reasoning model, and a fallback model covers provider outages.</p></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------- shift

const SHIFT = [
  { time: "2:14 AM", c: BLUE, icon: BookOpen, t: "Answers a pricing question", d: "Your team is asleep. Elpino answers from your knowledge base." },
  { time: "9:05 AM", c: GREEN, icon: KeyRound, t: "Verifies a customer, fixes a payment", d: "Confirms them by email code, finds the failed payment, sends a fresh payment link." },
  { time: "11:20 AM", c: ORANGE, icon: Plug, t: "Checks an order in your shop", d: "Calls your MCP server, reads the status and shares the tracking." },
  { time: "1:30 PM", c: PINK, icon: Headset, t: "Hits something it can't do", d: "Says so, asks the customer first, then alerts the whole team." },
  { time: "3:42 PM", c: PURPLE, icon: Check, t: "Nobody's free? It doesn't drop it", d: "Tells the customer honestly and files a ticket with an email follow-up." },
];

function Shift() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow="A day on the job" color={ORANGE} title={<>One shift, <span className="hl">start to finish.</span></>} sub="A sample day, using only things the agent really does." />
        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute bottom-3 left-[27px] top-3 w-0.5" style={{ backgroundImage: `linear-gradient(${INK} 50%, transparent 50%)`, backgroundSize: "2px 12px" }} />
          <div className="space-y-7">
            {SHIFT.map((s, i) => (
              <Rv key={s.time} variant="up" delay={i * 60}>
                <div className="flex items-start gap-5">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: s.c }}><s.icon size={22} color="#fff" /></span>
                  <div className={`${card} flex-1 bg-[#fffdf5] p-5`}>
                    <p className={`${mono}`} style={{ color: s.c }}>{s.time}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">{s.t}</p>
                    <p className="mt-1 text-[15.5px] leading-7 text-[#11120f]/65">{s.d}</p>
                  </div>
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- review

const REVIEW = [
  { k: "Follows your policy", n: 5, note: "Answers only from what you approved." },
  { k: "Knows when to ask for help", n: 5, note: "Asks the customer first, then brings in your team." },
  { k: "Stays inside its permissions", n: 5, note: "Only the tools you switched on. Refunds off by default." },
  { k: "Knows what you never told it", n: 2, note: "It can't answer what isn't in your knowledge. Add more to raise this." },
];

function Review() {
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <Heading eyebrow="Performance review" color={PINK} title={<>An honest <span className="hl">scorecard.</span></>} sub="Illustrative ratings, with the weak spot included." />
        <Rv variant="deal" delay={100}>
          <div className={`${card} relative mt-14 bg-white p-6 sm:p-8`}>
            <span className={`${mono} absolute -top-4 right-6 rotate-[4deg] rounded-full border-2 border-[#11120f] px-3 py-1.5`} style={{ backgroundColor: YELLOW }}>Employee: Elpino</span>
            <div className="divide-y-2 divide-[#11120f]/10">
              {REVIEW.map((r) => (
                <div key={r.k} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                  <div className="min-w-[220px] flex-1"><p className="text-lg font-semibold tracking-tight">{r.k}</p><p className="text-[14.5px] text-[#11120f]/60">{r.note}</p></div>
                  <div className="flex gap-1.5" aria-label={`${r.n} out of 5`}>{[0, 1, 2, 3, 4].map((d) => <span key={d} className="size-6 rounded-full border-2 border-[#11120f]" style={{ backgroundColor: d < r.n ? (r.n === 5 ? GREEN : ORANGE) : "#fff" }} />)}</div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl border-2 border-dashed border-[#11120f]/40 bg-[#fffdf5] p-4 text-[16px] italic leading-7">&ldquo;Great with routine questions and never oversteps. Keep the knowledge base fresh and it&apos;ll keep getting better.&rdquo;</p>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- guardrails

const GUARDS = [
  { icon: EyeOff, c: PURPLE, t: "The model never sees names or emails", d: "Identities in a conversation are swapped for reference codes before the AI reads it, and secrets like keys and tokens are stripped out." },
  { icon: Lock, c: ORANGE, t: "Refunds are off until you say so", d: "Money-moving actions are opt-in and controlled by the workspace owner." },
  { icon: Eye, c: GREEN, t: "You approve every tool", d: "The agent only sees MCP tools you switched on, and tools that change data need a verified customer." },
  { icon: Headset, c: BLUE, t: "Ask first, then hand off", d: "When it has no tool for the job, it says so and asks before bringing your team in." },
  { icon: ShieldCheck, c: PINK, t: "Facts get reviewed", d: "A review pass checks the draft against tool results before it's sent." },
  { icon: KeyRound, c: YELLOW, t: "Identity before anything personal", d: "Email code or signed token first, so it never discusses an account with a stranger." },
];

function Guards() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Guardrails" color={PINK} title={<>The company <span className="hl">handbook.</span></>} sub="The rules Elpino works under. Every one is a control you own." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUARDS.map((g, i) => (
            <Rv key={g.t} variant="pop" delay={(i % 3) * 80}>
              <div className={`${card} group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5`} style={{ backgroundColor: g.c, color: onDark(g.c) }}>
                <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
                <span className="relative grid size-12 place-items-center rounded-2xl border-2 border-[#11120f] bg-white transition-transform duration-300 group-hover:-rotate-12"><g.icon size={22} color={INK} /></span>
                <h3 className="relative mt-5 text-xl font-semibold leading-snug tracking-tight">{g.t}</h3>
                <p className="relative mt-2 text-[15px] leading-7 opacity-90">{g.d}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ compare

const COMPARE: [string, string][] = [
  ["Searches articles and stops", "Searches, looks up records and takes action"],
  ["Treats everyone as a stranger", "Verifies identity, remembers past chats"],
  ["“Please contact support” when stuck", "Asks first, alerts the team, files a ticket if nobody's free"],
  ["Can't see your systems", "Calls the MCP tools you approve"],
  ["Answers can't be trusted", "Facts reviewed against tool results"],
];

function Compare() {
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="Not a chatbot" color={ORANGE} title={<>Chatbot vs. <span className="hl">Elpino agent.</span></>} />
        <div className="mt-14 space-y-3">
          <div className="hidden grid-cols-2 gap-4 md:grid"><p className={`${mono} px-2 text-[#11120f]/50`}>A typical chatbot</p><p className={`${mono} px-2 text-[#11120f]/50`}>Elpino AI agent</p></div>
          {COMPARE.map(([a, b], i) => (
            <Rv key={a} variant="up" delay={i * 60}>
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div className={`${card} flex items-center gap-3 bg-white p-4 text-[#11120f]/60`}><X size={18} color={PINK} strokeWidth={3} className="shrink-0" /><span className="line-through decoration-[#d9508a]/50 decoration-2">{a}</span></div>
                <div className={`${card} flex items-center gap-3 p-4 font-semibold text-white`} style={{ backgroundColor: [BLUE, PURPLE, GREEN, ORANGE, PINK][i] }}><Check size={18} strokeWidth={3} className="shrink-0" />{b}</div>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------- faq

const FAQS: [string, string][] = [
  ["What is MCP?", "The Model Context Protocol, a standard way for an AI to call tools on another system. Connect an MCP server and Elpino discovers its tools. You then choose which ones the agent may use."],
  ["How many MCP servers can I connect?", "Up to five, with up to 15 tools enabled per server."],
  ["Can the agent change things in my systems?", "Only through tools you've switched on, and tools that change data always require a customer whose email has been verified."],
  ["How does it know who the customer is?", "From the conversation, earlier chats with them, and a verification step: a one-time email code or a signed token from your app."],
  ["Can it issue refunds?", "Only if the workspace owner turns refunds on. They're off by default."],
  ["What happens when it can't solve something?", "It says so and asks the customer whether to connect them with your team. Everyone on the team gets a Join alert for 90 seconds, and if nobody joins a ticket is created automatically."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
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
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-white px-5 pb-24 pt-8 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: PURPLE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
          <Bot size={40} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Your newest hire is ready to start.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/85">Teach it your business, plug in your tools, and set the limits.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/product/knowledge-hub" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5"><Search size={16} className="mr-2" />See the Knowledge Hub</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function AiAgentClient() {
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero />
      <WatchIt />
      <Onboarding />
      <CustomerFile />
      <Mcp />
      <OrgChart />
      <Shift />
      <Review />
      <Guards />
      <Compare />
      <Faq />
      <Closing />
    </main>
  );
}
