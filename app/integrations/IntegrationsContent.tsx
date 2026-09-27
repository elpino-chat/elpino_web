"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, ListTodo, Lock, Plug, Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { RazorpayIcon, StripeIcon, TrelloIcon } from "@/app/components/ConnectorIcons";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Integrations, as a patch board. Elpino sits in the middle; each real
// connector (Stripe, Razorpay, Cashfree, Paystack, Trello, Asana, and your own
// MCP servers) is a socket you can plug in, and the abilities it unlocks
// light up. Everything listed is in the dashboard's Connect page today.
// Nothing here is a "request it" logo the product can't connect.

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
type ConnMeta = { id: string; family: Family; color: string; icon: ReactNode };
type ConnText = { name: string; blurb: string; abilities: string[] };
type Conn = ConnMeta & ConnText;

const Mono = ({ l, c }: { l: string; c: string }) => <span className="grid size-full place-items-center rounded-lg text-lg font-black text-white" style={{ backgroundColor: c }}>{l}</span>;

const CONNS_META: ConnMeta[] = [
  { id: "stripe", family: "Payments", color: "#635bff", icon: <ConnectorLogo provider="stripe" alt="Stripe" className="size-full object-contain" fallback={<StripeIcon />} /> },
  { id: "razorpay", family: "Payments", color: "#2465dc", icon: <ConnectorLogo provider="razorpay" alt="Razorpay" className="size-full object-contain" fallback={<RazorpayIcon />} /> },
  { id: "cashfree", family: "Payments", color: "#0a8f5a", icon: <ConnectorLogo provider="cashfree" alt="Cashfree" className="size-full object-contain" fallback={<Mono l="C" c="#0a8f5a" />} /> },
  { id: "paystack", family: "Payments", color: "#0ba4db", icon: <ConnectorLogo provider="paystack" alt="Paystack" className="size-full object-contain" fallback={<Mono l="P" c="#0ba4db" />} /> },
  { id: "trello", family: "Tickets", color: "#0c66e4", icon: <ConnectorLogo provider="trello" alt="Trello" className="size-full object-contain" fallback={<TrelloIcon />} /> },
  { id: "asana", family: "Tickets", color: "#f06a6a", icon: <ConnectorLogo provider="asana" alt="Asana" className="size-full object-contain" fallback={<ListTodo size={26} color="#f06a6a" />} /> },
  { id: "mcp", family: "Your systems", color: ORANGE, icon: <Plug size={26} color={ORANGE} /> },
];

const CONNS_EN: ConnText[] = [
  { name: "Stripe", blurb: "The AI checks real payments and subscriptions.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { name: "Razorpay", blurb: "Same payment tools, for Razorpay accounts.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { name: "Cashfree", blurb: "Payment and settlement history for your team.", abilities: ["Find an order or payment from a conversation", "See settlement and refund status"] },
  { name: "Paystack", blurb: "Transaction and refund status for your team.", abilities: ["Look up a transaction from a conversation", "Check payment and refund status"] },
  { name: "Trello", blurb: "Tickets land as cards on your board.", abilities: ["Tickets become Trello cards", "The summary and a link to the chat come attached"] },
  { name: "Asana", blurb: "Tickets land as tasks in your project.", abilities: ["Tickets become Asana tasks", "The summary and a link to the chat come attached"] },
  { name: "Your MCP servers", blurb: "Anything that speaks MCP, with tools you approve.", abilities: ["Call tools on your own servers", "Up to 5 servers, 15 tools enabled each", "Only the tools you approve are visible", "Tools that change data need a verified customer"] },
];

const FAM_COLOR: Record<Family, string> = { Payments: BLUE, Tickets: GREEN, "Your systems": ORANGE };
const FAM_KEY: Record<Family, string> = { Payments: "payments", Tickets: "tickets", "Your systems": "systems" };

function famLabel(t: T, f: Family): string {
  return t(`integrations.families.tabs.${FAM_KEY[f]}`, f);
}

function useConns(t: T): Conn[] {
  const text = tList<ConnText>(t, "integrations.conns", CONNS_EN);
  return CONNS_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function nodePos(i: number, n: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * 39, y: 50 + Math.sin(a) * 38 };
}

function Board({ t }: { t: T }) {
  const CONNS = useConns(t);
  const reduced = useReduced();
  const [on, setOn] = useState<string[]>(reduced ? CONNS.map((c) => c.id) : ["stripe", "trello"]);
  const toggle = (id: string) => setOn((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const abilities = CONNS.filter((c) => on.includes(c.id)).flatMap((c) => c.abilities.map((a) => ({ a, c })));
  const seen = new Set<string>();
  const uniq = abilities.filter(({ a }) => (seen.has(a) ? false : (seen.add(a), true)));
  const pluggedInCountLabel = t("integrations.board.pluggedInCount", "{on} / {total} plugged in").replace("{on}", String(on.length)).replace("{total}", String(CONNS.length));

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
              <img src="/icon.png" alt="" className="size-24 object-contain" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
            </div>
            <p className={`${mono} mt-3 rounded-full border-2 border-[#11120f] bg-white px-3 py-1`}>{pluggedInCountLabel}</p>
          </div>
          {CONNS.map((c, i) => {
            const p = nodePos(i, CONNS.length);
            const live = on.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="absolute w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-[#11120f] bg-white p-3 text-left transition-all duration-300 hover:-translate-y-[55%]" style={{ left: `${p.x}%`, top: `${p.y}%`, boxShadow: live ? `0 0 0 4px ${c.color}55` : "none" }}>
                <span className="flex items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[#11120f] bg-white p-1.5">{c.icon}</span>
                  <span className="min-w-0"><span className="block truncate text-[14.5px] font-semibold leading-tight">{c.name}</span><span className={`${mono} text-[8.5px]`} style={{ color: live ? c.color : "#11120f88" }}>{live ? t("integrations.board.pluggedIn", "Plugged in") : t("integrations.board.tapToPlugIn", "Tap to plug in")}</span></span>
                </span>
              </button>
            );
          })}
        </div>

        {/* narrow: grid */}
        <div className="relative lg:hidden">
          <div className="mb-4 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="size-14 rounded-full border-2 border-[#11120f] bg-white object-contain p-1" />
            <p className={`${mono} rounded-full border-2 border-[#11120f] bg-white px-3 py-1`}>{pluggedInCountLabel}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CONNS.map((c) => {
              const live = on.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="flex items-center gap-2.5 rounded-2xl border-2 border-[#11120f] bg-white p-2.5 text-left" style={{ boxShadow: live ? `0 0 0 3px ${c.color}66` : "none" }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-[#11120f] bg-white p-1">{c.icon}</span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{c.name}</span><span className={`${mono} text-[8px]`} style={{ color: live ? c.color : "#11120f88" }}>{live ? t("integrations.board.on", "On") : t("integrations.board.off", "Off")}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${card} mt-5 bg-white p-5 sm:p-6`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-semibold"><Zap size={18} color={ORANGE} />{t("integrations.board.whatCanDo", "What Elpino can do now")}</p>
          <span className="rounded-full border-2 border-[#11120f] px-3 py-1 font-mono text-sm font-bold tabular-nums" style={{ backgroundColor: YELLOW }}>{uniq.length}</span>
        </div>
        <div className="mt-4 flex min-h-[58px] flex-wrap gap-2">
          {uniq.length === 0 && <p className="w-full py-3 text-center text-[#11120f]/45">{t("integrations.board.empty", "Nothing plugged in yet. Tap a socket above.")}</p>}
          {uniq.map(({ a, c }) => <span key={a} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-medium" style={{ backgroundColor: `${c.color}1f`, animation: "elpino-rv-pop .35s both" }}><Check size={13} strokeWidth={3} color={c.color} />{a}</span>)}
        </div>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Plug size={13} />{t("integrations.hero.badge", "Integrations")}</Stamp></Rv>
          <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.058em]">{t("integrations.hero.titlePrefix", "Plug in. ")}<span className="hl">{t("integrations.hero.titleHl", "Level up.")}</span></h1></Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[56ch] text-lg leading-8 text-[#11120f]/70">{t("integrations.hero.subtitle", "Connect your payments, your ticket tracker and your own systems, and watch what Elpino can do grow. Tap the sockets to plug them in.")}</p></Rv>
        </div>
        <Rv variant="deal" delay={250} className="mt-12"><Board t={t} /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- how

type Step = { t: string; d: string };
const STEPS_META = [
  { icon: Plug, c: BLUE },
  { icon: Lock, c: PURPLE },
  { icon: ShieldCheck, c: GREEN },
];
const STEPS_EN: Step[] = [
  { t: "Pick a tool", d: "Open Connect in your dashboard and choose the connector you want." },
  { t: "Paste a key or authorise", d: "API-key tools take your keys. Asana uses a normal sign-in and permission screen." },
  { t: "We check it first", d: "Elpino tests your keys against the provider before saving them, and stores them encrypted." },
];

function How({ t }: { t: T }) {
  const stepsText = tList<Step>(t, "integrations.how.steps", STEPS_EN);
  const steps = STEPS_META.map((meta, i) => ({ ...meta, ...stepsText[i] }));
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("integrations.how.eyebrow", "Connecting")} color={GREEN} title={<>{t("integrations.how.titlePrefix", "A minute each. ")}<span className="hl">{t("integrations.how.titleHl", "No engineers.")}</span></>} />
        <div className="relative mt-14">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[34px] hidden h-0.5 md:block" style={{ backgroundImage: `linear-gradient(90deg, ${INK} 50%, transparent 50%)`, backgroundSize: "12px 2px" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Rv key={s.t} variant="up" delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 grid size-[68px] place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: s.c }}><s.icon size={26} color="#fff" /></span>
                  <div className={`${card} mt-4 w-full bg-white p-5`}><p className={`${mono} text-[#11120f]/45`}>{t("integrations.how.stepLabel", "Step {n}").replace("{n}", String(i + 1))}</p><p className="mt-1 text-xl font-semibold tracking-tight">{s.t}</p><p className="mt-2 text-[15.5px] leading-7 text-[#11120f]/65">{s.d}</p></div>
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

function Families({ t }: { t: T }) {
  const CONNS = useConns(t);
  const [f, setF] = useState<Family>("Payments");
  const list = CONNS.filter((c) => c.family === f);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("integrations.families.eyebrow", "The catalogue")} color={BLUE} title={<>{t("integrations.families.titlePrefix", "Three kinds of ")}<span className="hl">{t("integrations.families.titleHl", "connection.")}</span></>} />
        <div className="mx-auto mt-10 flex w-fit flex-wrap justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#fff8ec] p-1">
          {(Object.keys(FAM_COLOR) as Family[]).map((k) => <button key={k} type="button" onClick={() => setF(k)} aria-pressed={k === f} className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={k === f ? { backgroundColor: FAM_COLOR[k], color: "#fff" } : undefined}>{famLabel(t, k)}</button>)}
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
        {f === "Payments" && <Rv delay={100}><p className="mt-6 text-center text-sm text-[#11120f]/55">{t("integrations.families.paymentsNote", "The AI's payment actions today work with Stripe and Razorpay. Cashfree and Paystack bring payment context to your team.")}</p></Rv>}
      </div>
    </section>
  );
}

// -------------------------------------------------------------- safe

type SafeItem = { t: string; d: string };
const SAFE_META = [
  { icon: Lock, c: PURPLE },
  { icon: ShieldCheck, c: GREEN },
  { icon: Zap, c: ORANGE },
  { icon: Plug, c: PINK },
];
const SAFE_EN: SafeItem[] = [
  { t: "Keys stay encrypted", d: "Credentials are stored encrypted, and Elpino verifies them with the provider before saving." },
  { t: "Read access is enough for lookups", d: "For Stripe, use a restricted key with read access to customers and payments." },
  { t: "Money moves only if you allow it", d: "Refunds are off by default. The workspace owner decides whether the AI may issue them." },
  { t: "You approve every MCP tool", d: "The AI only sees the tools you switched on, and each call is re-checked on the server." },
];

function Safe({ t }: { t: T }) {
  const safeText = tList<SafeItem>(t, "integrations.safe.items", SAFE_EN);
  const safe = SAFE_META.map((meta, i) => ({ ...meta, ...safeText[i] }));
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={PINK}><ShieldCheck size={13} />{t("integrations.safe.badge", "Safe by default")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.8vw,3.7rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("integrations.safe.titlePrefix", "Connected, ")}<span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>{t("integrations.safe.titleHl", "not exposed.")}</span></h2></Rv>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {safe.map((s, i) => (
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

const FAQS_EN: [string, string][] = [
  ["Which tools can I connect?", "Stripe, Razorpay, Cashfree and Paystack for payments, Trello and Asana for tickets, and your own MCP servers for anything else."],
  ["What can the AI do with payments?", "With Stripe or Razorpay connected it can look up payments and subscriptions, send receipts and payment links, and cancel a subscription when asked. Refunds are off unless you enable them."],
  ["Do I need to be technical?", "Not for payments or tickets. You paste a key, or sign in to Asana. MCP servers need someone to have built one."],
  ["Is Shopify, Slack or HubSpot supported?", "Not as one-click connectors today. If your system has an MCP server, you can connect it, and you can tell us what you'd like next."],
  ["Where do tickets go?", "To Trello or Asana if connected. Otherwise they live on your Issues page."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "integrations.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow={t("integrations.faq.eyebrow", "Questions")} color={YELLOW} title={<>{t("integrations.faq.titlePrefix", "Good to ")}<span className="hl">{t("integrations.faq.titleHl", "know.")}</span></>} />
        <div className="mt-12 space-y-3">
          {faqs.map(([q, a], i) => (
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

function Closing({ t }: { t: T }) {
  return (
    <section className="bg-[#fff8ec] px-5 pb-24 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Sparkles size={36} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5.2vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">{t("integrations.closing.title", "Missing something you need?")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">{t("integrations.closing.subtitle", "Tell us which tool you'd like next, or connect it yourself over MCP.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>{t("integrations.closing.ctaStart", "Start free")} <ArrowRight size={16} /></Link>
            <Link href="/contact" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">{t("integrations.closing.ctaRequest", "Request an integration")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function IntegrationsContent() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <How t={t} />
      <Families t={t} />
      <Safe t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
