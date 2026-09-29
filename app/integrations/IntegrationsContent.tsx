"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, ListTodo, Lock, Plug, Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { RazorpayIcon, StripeIcon, TrelloIcon } from "@/app/components/ConnectorIcons";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";
import { Rv } from "@/app/components/RevealOnScroll";

// Integrations, as a patch board. Elpino sits in the middle; each real
// connector (Stripe, Razorpay, Cashfree, Paystack, Trello, Asana, and your own
// MCP servers) is a socket you can plug in, and the abilities it unlocks
// light up. Everything listed is in the dashboard's Connect page today.
// Nothing here is a "request it" logo the product can't connect.

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
      <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-[#11120f]/65">{sub}</p></Rv>}
    </div>
  );
}

// --------------------------------------------------------------- connectors

type Family = "Payments" | "Tickets" | "Your systems";
type Conn = { id: string; name: string; family: Family; color: string; icon: ReactNode; blurb: string; abilities: string[] };

const Mono = ({ l, c }: { l: string; c: string }) => <span className="grid size-full place-items-center rounded-lg text-lg font-black text-white" style={{ backgroundColor: c }}>{l}</span>;

const CONNS: Conn[] = [
  { id: "stripe", name: "Stripe", family: "Payments", color: "#635bff", icon: <ConnectorLogo provider="stripe" alt="Stripe" className="size-full object-contain" fallback={<StripeIcon />} />, blurb: "The AI checks real payments and subscriptions.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { id: "razorpay", name: "Razorpay", family: "Payments", color: "#2465dc", icon: <ConnectorLogo provider="razorpay" alt="Razorpay" className="size-full object-contain" fallback={<RazorpayIcon />} />, blurb: "Same payment tools, for Razorpay accounts.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { id: "cashfree", name: "Cashfree", family: "Payments", color: "#0a8f5a", icon: <ConnectorLogo provider="cashfree" alt="Cashfree" className="size-full object-contain" fallback={<Mono l="C" c="#0a8f5a" />} />, blurb: "Payment and settlement history for your team.", abilities: ["Find an order or payment from a conversation", "See settlement and refund status"] },
  { id: "paystack", name: "Paystack", family: "Payments", color: "#0ba4db", icon: <ConnectorLogo provider="paystack" alt="Paystack" className="size-full object-contain" fallback={<Mono l="P" c="#0ba4db" />} />, blurb: "Transaction and refund status for your team.", abilities: ["Look up a transaction from a conversation", "Check payment and refund status"] },
  { id: "trello", name: "Trello", family: "Tickets", color: "#0c66e4", icon: <ConnectorLogo provider="trello" alt="Trello" className="size-full object-contain" fallback={<TrelloIcon />} />, blurb: "Tickets land as cards on your board.", abilities: ["Tickets become Trello cards", "The summary and a link to the chat come attached"] },
  { id: "asana", name: "Asana", family: "Tickets", color: "#f06a6a", icon: <ConnectorLogo provider="asana" alt="Asana" className="size-full object-contain" fallback={<ListTodo size={26} color="#f06a6a" />} />, blurb: "Tickets land as tasks in your project.", abilities: ["Tickets become Asana tasks", "The summary and a link to the chat come attached"] },
  { id: "mcp", name: "Your MCP servers", family: "Your systems", color: ORANGE, icon: <Plug size={26} color={ORANGE} />, blurb: "Anything that speaks MCP, with tools you approve.", abilities: ["Call tools on your own servers", "Up to 5 servers, 15 tools enabled each", "Only the tools you approve are visible", "Tools that change data need a verified customer"] },
];

const FAM_COLOR: Record<Family, string> = { Payments: BLUE, Tickets: GREEN, "Your systems": ORANGE };

function nodePos(i: number, n: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * 39, y: 50 + Math.sin(a) * 38 };
}

function Board() {
  const reduced = useReduced();
  const [on, setOn] = useState<string[]>(reduced ? CONNS.map((c) => c.id) : ["stripe", "trello"]);
  const toggle = (id: string) => setOn((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const abilities = CONNS.filter((c) => on.includes(c.id)).flatMap((c) => c.abilities.map((a) => ({ a, c })));
  const seen = new Set<string>();
  const uniq = abilities.filter(({ a }) => (seen.has(a) ? false : (seen.add(a), true)));

  return (
    <div>
      <div className={`${card} relative overflow-hidden bg-[#fff1d6] p-4 sm:p-6`}>
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />

        {/* wide: the patch board */}
        <div className="relative hidden h-[520px] lg:block">
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {CONNS.map((c, i) => {
              const p = nodePos(i, CONNS.length);
              const live = on.includes(c.id);
              return (
                <g key={c.id}>
                  <path d={`M50 50 C ${50 + (p.x - 50) * 0.1} ${50 + (p.y - 50) * 0.9}, ${p.x - (p.x - 50) * 0.1} ${p.y - (p.y - 50) * 0.9}, ${p.x} ${p.y}`} fill="none" stroke={live ? c.color : "#11120f33"} strokeWidth={live ? 3 : 1.5} strokeDasharray={live ? "2 2.2" : "1.5 2"} vectorEffect="non-scaling-stroke" style={live ? { animation: "elpino-dashflow 1.2s linear infinite" } : undefined} />
                </g>
              );
            })}
          </svg>
          {/* hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative mx-auto grid size-32 place-items-center rounded-full border-2 border-[#11120f] bg-white" style={{ boxShadow: `0 0 0 ${6 + on.length * 3}px ${YELLOW}88`, transition: "box-shadow .5s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/community-sloths.png" alt="Elpino sloths connecting the tools" className="size-24 rounded-full object-cover object-center" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
            </div>
            <p className={`${mono} mt-3 rounded-full border-2 border-[#11120f] bg-white px-3 py-1`}>{on.length} / {CONNS.length} plugged in</p>
          </div>
          {CONNS.map((c, i) => {
            const p = nodePos(i, CONNS.length);
            const live = on.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="absolute w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-[#11120f] bg-white p-3 text-left transition-all duration-300 hover:-translate-y-[55%]" style={{ left: `${p.x}%`, top: `${p.y}%`, boxShadow: live ? `0 0 0 4px ${c.color}55` : "none" }}>
                <span className="flex items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[#11120f] bg-white p-1.5">{c.icon}</span>
                  <span className="min-w-0"><span className="block truncate text-[14.5px] font-semibold leading-tight">{c.name}</span><span className={`${mono} text-[8.5px]`} style={{ color: live ? c.color : "#11120f88" }}>{live ? "Plugged in" : "Tap to plug in"}</span></span>
                </span>
              </button>
            );
          })}
        </div>

        {/* narrow: grid */}
        <div className="relative lg:hidden">
          <div className="mb-4 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/community-sloths.png" alt="" className="size-14 rounded-full border-2 border-[#11120f] bg-white object-cover object-center" />
            <p className={`${mono} rounded-full border-2 border-[#11120f] bg-white px-3 py-1`}>{on.length} / {CONNS.length} plugged in</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CONNS.map((c) => {
              const live = on.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="flex items-center gap-2.5 rounded-2xl border-2 border-[#11120f] bg-white p-2.5 text-left" style={{ boxShadow: live ? `0 0 0 3px ${c.color}66` : "none" }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-[#11120f] bg-white p-1">{c.icon}</span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{c.name}</span><span className={`${mono} text-[8px]`} style={{ color: live ? c.color : "#11120f88" }}>{live ? "On" : "Off"}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${card} mt-5 bg-white p-5 sm:p-6`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-semibold"><Zap size={18} color={ORANGE} />What Elpino can do now</p>
          <span className="rounded-full border-2 border-[#11120f] px-3 py-1 font-mono text-sm font-bold tabular-nums" style={{ backgroundColor: YELLOW }}>{uniq.length}</span>
        </div>
        <div className="mt-4 flex min-h-[58px] flex-wrap gap-2">
          {uniq.length === 0 && <p className="w-full py-3 text-center text-[#11120f]/45">Nothing plugged in yet. Tap a socket above.</p>}
          {uniq.map(({ a, c }) => <span key={a} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-medium" style={{ backgroundColor: `${c.color}1f`, animation: "elpino-rv-pop .35s both" }}><Check size={13} strokeWidth={3} color={c.color} />{a}</span>)}
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
          <Rv variant="drop"><Stamp color={YELLOW}><Plug size={13} />Integrations</Stamp></Rv>
          <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.058em]">Plug in. <span className="hl">Level up.</span></h1></Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[56ch] text-lg leading-8 text-[#11120f]/70">Connect your payments, your ticket tracker and your own systems, and watch what Elpino can do grow. Tap the sockets to plug them in.</p></Rv>
        </div>
        <Rv variant="deal" delay={250} className="mt-12"><Board /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- how

const STEPS = [
  { icon: Plug, c: BLUE, t: "Pick a tool", d: "Open Connect in your dashboard and choose the connector you want." },
  { icon: Lock, c: PURPLE, t: "Paste a key or authorise", d: "API-key tools take your keys. Asana uses a normal sign-in and permission screen." },
  { icon: ShieldCheck, c: GREEN, t: "We check it first", d: "Elpino tests your keys against the provider before saving them, and stores them encrypted." },
];

function How() {
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Connecting" color={GREEN} title={<>A minute each. <span className="hl">No engineers.</span></>} />
        <div className="relative mt-14">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[34px] hidden h-0.5 md:block" style={{ backgroundImage: `linear-gradient(90deg, ${INK} 50%, transparent 50%)`, backgroundSize: "12px 2px" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Rv key={s.t} variant="up" delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 grid size-[68px] place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: s.c }}><s.icon size={26} color="#fff" /></span>
                  <div className={`${card} mt-4 w-full bg-white p-5`}><p className={`${mono} text-[#11120f]/45`}>Step {i + 1}</p><p className="mt-1 text-xl font-semibold tracking-tight">{s.t}</p><p className="mt-2 text-[15.5px] leading-7 text-[#11120f]/65">{s.d}</p></div>
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- families

function Families() {
  const [f, setF] = useState<Family>("Payments");
  const list = CONNS.filter((c) => c.family === f);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="The catalogue" color={BLUE} title={<>Three kinds of <span className="hl">connection.</span></>} />
        <div className="mx-auto mt-10 flex w-fit flex-wrap justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#fff8ec] p-1">
          {(Object.keys(FAM_COLOR) as Family[]).map((k) => <button key={k} type="button" onClick={() => setF(k)} aria-pressed={k === f} className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={k === f ? { backgroundColor: FAM_COLOR[k], color: "#fff" } : undefined}>{k}</button>)}
        </div>
        <div key={f} className="mt-10 grid gap-5 sm:grid-cols-2" style={{ animation: "elpino-rv-deal .5s both" }}>
          {list.map((c) => (
            <div key={c.id} className={`${card} group relative overflow-hidden bg-[#fffdf5] p-6 transition duration-300 hover:-translate-y-1.5`}>
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-2xl border-2 border-[#11120f] bg-white p-2.5 transition-transform duration-300 group-hover:rotate-6">{c.icon}</span>
                <div><p className="text-2xl font-semibold tracking-tight">{c.name}</p><p className="text-[14.5px] text-[#11120f]/60">{c.blurb}</p></div>
              </div>
              <ul className="mt-5 space-y-2">{c.abilities.map((a) => <li key={a} className="flex items-start gap-2.5 text-[15.5px]"><Check size={16} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{a}</li>)}</ul>
            </div>
          ))}
        </div>
        {f === "Payments" && <Rv delay={100}><p className="mt-6 text-center text-sm text-[#11120f]/55">The AI&apos;s payment actions today work with Stripe and Razorpay. Cashfree and Paystack bring payment context to your team.</p></Rv>}
      </div>
    </section>
  );
}

// -------------------------------------------------------------- safe

const SAFE = [
  { icon: Lock, c: PURPLE, t: "Keys stay encrypted", d: "Credentials are stored encrypted, and Elpino verifies them with the provider before saving." },
  { icon: ShieldCheck, c: GREEN, t: "Read access is enough for lookups", d: "For Stripe, use a restricted key with read access to customers and payments." },
  { icon: Zap, c: ORANGE, t: "Money moves only if you allow it", d: "Refunds are off by default. The workspace owner decides whether the AI may issue them." },
  { icon: Plug, c: PINK, t: "You approve every MCP tool", d: "The AI only sees the tools you switched on, and each call is re-checked on the server." },
];

function Safe() {
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={PINK}><ShieldCheck size={13} />Safe by default</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Connected, <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>not exposed.</span></h2></Rv>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SAFE.map((s, i) => (
            <Rv key={s.t} variant="up" delay={i * 80}>
              <div className={`${card} h-full bg-[#fffdf5] p-5 text-[#11120f] transition duration-300 hover:-translate-y-2`}>
                <span className="grid size-12 place-items-center rounded-2xl border-2 border-[#11120f]" style={{ backgroundColor: s.c }}><s.icon size={22} color="#fff" /></span>
                <p className="mt-4 text-lg font-semibold leading-snug tracking-tight">{s.t}</p>
                <p className="mt-2 text-[14.5px] leading-6 text-[#11120f]/65">{s.d}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- faq

const FAQS: [string, string][] = [
  ["Which tools can I connect?", "Stripe, Razorpay, Cashfree and Paystack for payments, Trello and Asana for tickets, and your own MCP servers for anything else."],
  ["What can the AI do with payments?", "With Stripe or Razorpay connected it can look up payments and subscriptions, send receipts and payment links, and cancel a subscription when asked. Refunds are off unless you enable them."],
  ["Do I need to be technical?", "Not for payments or tickets. You paste a key, or sign in to Asana. MCP servers need someone to have built one."],
  ["Is Shopify, Slack or HubSpot supported?", "Not as one-click connectors today. If your system has an MCP server, you can connect it, and you can tell us what you'd like next."],
  ["Where do tickets go?", "To Trello or Asana if connected. Otherwise they live on your Issues page."],
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
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-[#fff8ec] px-5 pb-24 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Sparkles size={36} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5.2vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">Missing something you need?</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">Tell us which tool you&apos;d like next, or connect it yourself over MCP.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/contact" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">Request an integration</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function IntegrationsContent() {
  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero />
      <How />
      <Families />
      <Safe />
      <Faq />
      <Closing />
    </main>
  );
}
