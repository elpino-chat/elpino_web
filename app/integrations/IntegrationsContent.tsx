"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, ListTodo, Lock, MapPin, Package, Plug, Plus, ShieldCheck, Sparkles, Store, Target, Truck, UserCheck, X, Zap } from "lucide-react";
import { RazorpayIcon, StripeIcon, TrelloIcon } from "@/app/components/ConnectorIcons";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Integrations, as a patch board. Elpino sits in the middle; each real
// connector (Stripe, Razorpay, Cashfree, Paystack, Trello, Asana, Shopify,
// WooCommerce, HubSpot and your own MCP servers) is a socket you can plug in, and the abilities it unlocks
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
const BLUE = "#0078f4";
const YELLOW = "#ffd84d";
const PURPLE = "#7060bd";
const ORANGE = "#fc7b33";
const GREEN = "#1aa37a";
const PINK = "#d9508a";

const card = "rounded-[10px] border border-black/40";
const mono = "font-mono text-[11px] font-medium uppercase tracking-[0.08em]";
const onDark = (c: string) => (c === YELLOW ? INK : "#fff");
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

/** Fires once when the element has scrolled into view. */
function useSeen<E extends HTMLElement>(threshold = 0.3): [React.RefObject<E | null>, boolean] {
  const ref = useRef<E>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Stamp({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/25 bg-white px-3 py-1 text-[12.5px] font-medium normal-case tracking-normal text-black/70">
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

function Heading({ eyebrow, color, title, sub }: { eyebrow: string; color: string; title: ReactNode; sub?: string }) {
  return (
    <div className="max-w-3xl">
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-black/65">{sub}</p></Rv>}
    </div>
  );
}

// --------------------------------------------------------------- connectors

type Family = "Payments" | "Stores" | "CRM" | "Tickets" | "Your systems";
type ConnMeta = { id: string; family: Family; color: string; icon: ReactNode; isNew?: boolean };
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
  { id: "shopify", family: "Stores", color: "#5e8e3e", isNew: true, icon: <ConnectorLogo provider="shopify" alt="Shopify" className="size-full object-contain" fallback={<Mono l="S" c="#5e8e3e" />} /> },
  { id: "woocommerce", family: "Stores", color: "#7f54b3", isNew: true, icon: <ConnectorLogo provider="woocommerce" alt="WooCommerce" className="size-full object-contain" fallback={<Mono l="W" c="#7f54b3" />} /> },
  { id: "hubspot", family: "CRM", color: "#ff7a59", isNew: true, icon: <ConnectorLogo provider="hubspot" alt="HubSpot" className="size-full object-contain" fallback={<Mono l="H" c="#ff7a59" />} /> },
];

const CONNS_EN: ConnText[] = [
  { name: "Stripe", blurb: "The AI checks real payments and subscriptions.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { name: "Razorpay", blurb: "Same payment tools, for Razorpay accounts.", abilities: ["Look up payments and subscriptions", "Send receipts and payment links", "Cancel a subscription on request", "Refunds, only if you switch them on"] },
  { name: "Cashfree", blurb: "Payment and settlement history for your team.", abilities: ["Find an order or payment from a conversation", "See settlement and refund status"] },
  { name: "Paystack", blurb: "Transaction and refund status for your team.", abilities: ["Look up a transaction from a conversation", "Check payment and refund status"] },
  { name: "Trello", blurb: "Tickets land as cards on your board.", abilities: ["Tickets become Trello cards", "The summary and a link to the chat come attached"] },
  { name: "Asana", blurb: "Tickets land as tasks in your project.", abilities: ["Tickets become Asana tasks", "The summary and a link to the chat come attached"] },
  { name: "Your MCP servers", blurb: "Anything that speaks MCP, with tools you approve.", abilities: ["Call tools on your own servers", "Up to 5 servers, 15 tools enabled each", "Only the tools you approve are visible", "Tools that change data need a verified customer"] },
  { name: "Shopify", blurb: "The AI looks up orders and fixes the simple ones.", abilities: ["Find a customer's order from the conversation", "Show status and tracking", "Cancel an order that hasn't shipped", "Correct the shipping address before it ships"] },
  { name: "WooCommerce", blurb: "The same order help, for WooCommerce stores.", abilities: ["Find a customer's order from the conversation", "Show status and tracking", "Cancel an order that hasn't shipped", "Correct the shipping address before it ships"] },
  { name: "HubSpot", blurb: "Qualified sales chats land in your CRM.", abilities: ["Create or update the contact", "Attach a note with what they want", "Name, email and phone come from the customer record"] },
];

function NewTag({ t }: { t: T }) {
  return <span className="shrink-0 rounded-full bg-[#0078f4] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white">{t("integrations.new", "New")}</span>;
}

const FAM_COLOR: Record<Family, string> = { Payments: BLUE, Stores: PURPLE, CRM: PINK, Tickets: GREEN, "Your systems": ORANGE };
const FAM_KEY: Record<Family, string> = { Payments: "payments", Stores: "stores", CRM: "crm", Tickets: "tickets", "Your systems": "systems" };

function famLabel(t: T, f: Family): string {
  return t(`integrations.families.tabs.${FAM_KEY[f]}`, f);
}

function useConns(t: T): Conn[] {
  const text = tList<ConnText>(t, "integrations.conns", CONNS_EN);
  // New connectors sit at the end, so a locale that only has the original seven still lines up and the rest fall back to English.
  return CONNS_META.map((meta, i) => ({ ...meta, ...CONNS_EN[i], ...(text[i] ?? {}) }));
}

function nodePos(i: number, n: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * 39, y: 50 + Math.sin(a) * 38 };
}

function Board({ t }: { t: T }) {
  const CONNS = useConns(t);
  const reduced = useReduced();
  const [on, setOn] = useState<string[]>(reduced ? CONNS.map((c) => c.id) : ["stripe", "shopify", "trello"]);
  const toggle = (id: string) => setOn((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const abilities = CONNS.filter((c) => on.includes(c.id)).flatMap((c) => c.abilities.map((a) => ({ a, c })));
  const seen = new Set<string>();
  const uniq = abilities.filter(({ a }) => (seen.has(a) ? false : (seen.add(a), true)));
  const pluggedInCountLabel = t("integrations.board.pluggedInCount", "{on} / {total} plugged in").replace("{on}", String(on.length)).replace("{total}", String(CONNS.length));

  return (
    <div>
      <div className={`${card} relative overflow-hidden bg-[#f4f4f2] p-4 sm:p-6`}>

        {/* wide: the patch board */}
        <div className="relative hidden h-[680px] lg:block">
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {CONNS.map((c, i) => {
              const p = nodePos(i, CONNS.length);
              const live = on.includes(c.id);
              return (
                <g key={c.id}>
                  <path d={`M50 50 C ${50 + (p.x - 50) * 0.1} ${50 + (p.y - 50) * 0.9}, ${p.x - (p.x - 50) * 0.1} ${p.y - (p.y - 50) * 0.9}, ${p.x} ${p.y}`} fill="none" stroke={live ? c.color : "#11120f33"} strokeWidth={live ? 2 : 1.2} strokeDasharray={live ? "2 2.2" : "1.5 2"} vectorEffect="non-scaling-stroke" style={live ? { animation: "elpino-dashflow 1.2s linear infinite" } : undefined} />
                </g>
              );
            })}
          </svg>
          {/* hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative mx-auto grid size-32 place-items-center rounded-full border border-black/25 bg-white" style={{ boxShadow: `0 0 0 ${6 + on.length * 3}px rgba(0,120,244,0.10)`, transition: "box-shadow .5s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/community-sloths.png" alt="Elpino sloths connecting the tools" className="size-24 rounded-full object-cover object-center" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
            </div>
            <p className={`${mono} mt-3 rounded-full border border-black/25 bg-white px-3 py-1`}>{pluggedInCountLabel}</p>
          </div>
          {CONNS.map((c, i) => {
            const p = nodePos(i, CONNS.length);
            const live = on.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="absolute w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-black/25 bg-white p-3 text-left transition-all duration-300 hover:-translate-y-[55%]" style={{ left: `${p.x}%`, top: `${p.y}%`, borderColor: live ? c.color : undefined, boxShadow: live ? `0 0 0 4px ${c.color}22` : "none" }}>
                {c.isNew && <span className="absolute -top-2 right-3"><NewTag t={t} /></span>}
                <span className="flex items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f4f4f2] p-1.5">{c.icon}</span>
                  <span className="min-w-0"><span className="block truncate text-[14.5px] font-medium leading-tight">{c.name}</span><span className={`${mono} text-[8.5px] tracking-normal whitespace-nowrap`} style={{ color: live ? c.color : "#11120f88" }}>{live ? t("integrations.board.pluggedIn", "Plugged in") : t("integrations.board.tapToPlugIn", "Tap to plug in")}</span></span>
                </span>
              </button>
            );
          })}
        </div>

        {/* narrow: grid */}
        <div className="relative lg:hidden">
          <div className="mb-4 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/community-sloths.png" alt="" className="size-14 rounded-full border border-black/25 bg-white object-cover object-center" />
            <p className={`${mono} rounded-full border border-black/25 bg-white px-3 py-1`}>{pluggedInCountLabel}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CONNS.map((c) => {
              const live = on.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)} aria-pressed={live} className="flex items-center gap-2.5 rounded-xl border border-black/25 bg-white p-2.5 text-left" style={{ borderColor: live ? c.color : undefined }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f4f4f2] p-1">{c.icon}</span>
                  <span className="min-w-0"><span className="flex items-center gap-1.5 truncate text-[13px] font-semibold">{c.name}{c.isNew && <NewTag t={t} />}</span><span className={`${mono} text-[8px]`} style={{ color: live ? c.color : "#11120f88" }}>{live ? t("integrations.board.on", "On") : t("integrations.board.off", "Off")}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${card} mt-5 bg-white p-5 sm:p-6`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-medium"><Zap size={18} color={BLUE} />{t("integrations.board.whatCanDo", "What Elpino can do now")}</p>
          <span className="rounded-full bg-[#11120f] px-3 py-1 font-mono text-sm font-medium tabular-nums text-white">{uniq.length}</span>
        </div>
        <div className="mt-4 flex min-h-[58px] flex-wrap gap-2">
          {uniq.length === 0 && <p className="w-full py-3 text-center text-[#11120f]/45">{t("integrations.board.empty", "Nothing plugged in yet. Tap a socket above.")}</p>}
          {uniq.map(({ a, c }) => <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3.5 py-1.5 text-[13.5px] font-medium" style={{ backgroundColor: `${c.color}14`, animation: "elpino-rv-pop .35s both" }}><Check size={13} strokeWidth={3} color={c.color} />{a}</span>)}
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
          <p className="text-[14px] text-black/50">{t("integrations.hero.badge", "Integrations")}</p>
          <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">{t("integrations.hero.titlePrefix", "Plug in. ")}{t("integrations.hero.titleHl", "Level up.")}</h1>
          <p className="mx-auto mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("integrations.hero.subtitle", "Connect your payments, your ticket tracker and your own systems, and watch what Elpino can do grow. Tap the sockets to plug them in.")}</p>
        </div>
        <Rv variant="deal" delay={250} className="mt-12"><Board t={t} /></Rv>
      </div>
    </section>
  );
}


// -------------------------------------------------------------- just added

function JustAdded({ t }: { t: T }) {
  const CONNS = useConns(t).filter((c) => c.isNew);
  const lines: Record<string, { icon: typeof Package; head: string; body: string }> = {
    shopify: { icon: Package, head: t("integrations.added.shopify.head", "Orders, answered in the chat"), body: t("integrations.added.shopify.body", "“Where is my order?” no longer needs a person. Connect your store and the AI finds the order, shows its status and tracking, and can cancel or fix the address while it hasn't shipped.") },
    woocommerce: { icon: Store, head: t("integrations.added.woo.head", "The same for WooCommerce"), body: t("integrations.added.woo.body", "Paste your site address and a consumer key and secret. Elpino checks them first, then the AI can help with orders the same way.") },
    hubspot: { icon: Target, head: t("integrations.added.hubspot.head", "Sales chats into your CRM"), body: t("integrations.added.hubspot.body", "When a conversation turns into a real lead, Elpino creates or updates the HubSpot contact and attaches a note with what they asked for.") },
  };
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("integrations.added.eyebrow", "Newly added")} color={BLUE} title={t("integrations.added.title", "Three new plug-ins, live in Connect.")} sub={t("integrations.added.subtitle", "Stores and a CRM join payments and tickets. Each one is a normal connector: paste the details, Elpino verifies them, and the AI gains new abilities.")} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CONNS.map((c, i) => {
            const l = lines[c.id];
            if (!l) return null;
            return (
              <Rv key={c.id} variant="up" delay={i * 90}>
                <div className={`${card} group relative flex h-full flex-col bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-xl bg-[#f4f4f2] p-2.5">{c.icon}</span>
                    <NewTag t={t} />
                  </div>
                  <p className="mt-5 text-2xl font-medium tracking-[-0.025em]">{c.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-[14.5px] font-medium" style={{ color: c.color }}><l.icon size={15} />{l.head}</p>
                  <p className="mt-3 flex-1 text-[16px] leading-7 text-black/65">{l.body}</p>
                  <ul className="mt-5 space-y-2 border-t border-black/10 pt-4">{c.abilities.map((a) => <li key={a} className="flex items-start gap-2.5 text-[15px]"><Check size={15} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{a}</li>)}</ul>
                </div>
              </Rv>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ order demo

type OrderStep = { t: string; d: string };
const ORDER_STEPS_EN: OrderStep[] = [
  { t: "Customer asks", d: "“Can you cancel my order #4821? I ordered the wrong size.”" },
  { t: "Identity checked", d: "The customer is verified, and the order must belong to them." },
  { t: "Order looked up", d: "Elpino reads it from your store. It hasn't shipped yet." },
  { t: "Order cancelled", d: "The AI cancels it and tells the customer. Your team gets a note." },
];
const ORDER_META = [{ icon: UserCheck }, { icon: ShieldCheck }, { icon: Package }, { icon: Truck }];

function OrderDemo({ t }: { t: T }) {
  const steps = tList<OrderStep>(t, "integrations.orders.steps", ORDER_STEPS_EN);
  const reduced = useReduced();
  const [ref, seen] = useSeen<HTMLDivElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setN(steps.length); return; }
    const id = window.setInterval(() => setN((v) => (v >= steps.length + 1 ? 0 : v + 1)), 1300);
    return () => window.clearInterval(id);
  }, [seen, reduced, steps.length]);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Heading eyebrow={t("integrations.orders.eyebrow", "Shopify & WooCommerce")} color={PURPLE} title={t("integrations.orders.title", "“Where is my order?” answered without a person.")} sub={t("integrations.orders.subtitle", "With a store connected, the AI can look up a verified customer's orders. For orders that haven't shipped it can also cancel them or correct the shipping address, and nothing else.")} />
          <Rv delay={160}>
            <ul className="mt-8 space-y-3 text-[16px]">
              {tList<string>(t, "integrations.orders.bullets", ["Works only for a verified, signed-in customer", "Each action uses a short-lived reference, never the raw order", "The workspace owner switches order actions on", "Your team sees a note of everything the AI did"]).map((x) => (
                <li key={x} className="flex items-start gap-3"><Check size={18} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{x}</li>
              ))}
            </ul>
          </Rv>
        </div>
        <div ref={ref} className={`${card} bg-[#f4f4f2] p-5 sm:p-6`}>
          <div className="space-y-3">
            {steps.map((s, i) => {
              const on = i < n;
              const M = ORDER_META[i % ORDER_META.length];
              return (
                <div key={s.t} className="flex items-start gap-4 rounded-lg border bg-white p-4 transition-all duration-500" style={{ borderColor: on ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.1)", opacity: on ? 1 : 0.45, transform: on ? "none" : "translateY(6px)" }}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500" style={{ backgroundColor: on ? (i === steps.length - 1 ? GREEN : INK) : "#e4e4e0" }}>{on ? <Check size={18} strokeWidth={3} color="#fff" /> : <M.icon size={18} color="#00000066" />}</span>
                  <div><p className="text-[16px] font-medium">{s.t}</p><p className="mt-0.5 text-[14.5px] leading-6 text-black/60">{s.d}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- sales lead

function LeadDemo({ t }: { t: T }) {
  const reduced = useReduced();
  const [ref, seen] = useSeen<HTMLDivElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setN(3); return; }
    const id = window.setInterval(() => setN((v) => (v >= 4 ? 0 : v + 1)), 1400);
    return () => window.clearInterval(id);
  }, [seen, reduced]);
  const rows: [string, string][] = [
    [t("integrations.lead.name", "Name"), "Dana Reyes"],
    [t("integrations.lead.email", "Email"), "dana@northwind.example"],
    [t("integrations.lead.interest", "Interested in"), t("integrations.lead.interestValue", "Annual plan for a 12-person team")],
  ];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div ref={ref} className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className={`${card} bg-white p-5`}>
            <p className={`${mono} text-black/50`}>{t("integrations.lead.chat", "Sales chat")}</p>
            <div className="mt-3 space-y-2 text-[14px]">
              <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-[#f4f4f2] px-3.5 py-2">{t("integrations.lead.q1", "Do you have an annual plan for a team of 12?")}</p>
              {n >= 1 && <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-[#11120f] px-3.5 py-2 text-white" style={{ animation: "elpino-rv-pop .35s both" }}>{t("integrations.lead.a1", "Yes. Can I take your email so the team can follow up?")}</p>}
            </div>
          </div>
          <div aria-hidden="true" className="hidden items-center sm:flex"><ArrowRight size={26} className="transition-colors duration-500" style={{ color: n >= 2 ? "#ff7a59" : "#00000033" }} /></div>
          <div className={`${card} bg-[#f4f4f2] p-5 transition-opacity duration-500`} style={{ opacity: n >= 2 ? 1 : 0.5 }}>
            <p className="flex items-center gap-2 text-[14px] font-medium"><span className="grid size-6 place-items-center rounded-md" style={{ backgroundColor: "#ff7a59" }}><Target size={13} color="#fff" /></span>HubSpot</p>
            <div className="mt-3 space-y-1.5 text-[13.5px]">
              {rows.map(([k, v], i) => <p key={k} className="flex gap-2 transition-opacity duration-500" style={{ opacity: n >= 2 + (i > 1 ? 1 : 0) ? 1 : 0.15 }}><span className="w-24 shrink-0 text-black/50">{k}</span><span className="font-medium">{v}</span></p>)}
            </div>
            {n >= 3 && <span className={`${mono} mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e3f5ee] px-2.5 py-1 text-[9px] text-[#0f7a5a]`} style={{ animation: "elpino-rv-pop .35s both" }}><Check size={11} strokeWidth={3} />{t("integrations.lead.saved", "Contact saved with a note")}</span>}
          </div>
        </div>
        <div>
          <Heading eyebrow={t("integrations.lead.eyebrow", "HubSpot")} color={PINK} title={t("integrations.lead.title", "A good lead shouldn't sit in a chat log.")} sub={t("integrations.lead.subtitle", "When the AI qualifies a sales conversation, it saves the lead to HubSpot: the contact is created or updated, and a note records what they want.")} />
          <Rv delay={160}>
            <ul className="mt-8 space-y-3 text-[16px]">
              {tList<string>(t, "integrations.lead.bullets", ["Who they are comes from the customer record, not from the model", "Only the details the AI actually learned go in the note", "A typed email is enough, because a lead is what any contact form collects"]).map((x) => (
                <li key={x} className="flex items-start gap-3"><Check size={18} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{x}</li>
              ))}
            </ul>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------ what you paste

type Need = { tool: string; fields: string; check: string };
const NEEDS_EN: Need[] = [
  { tool: "Stripe", fields: "A restricted API key (read access)", check: "Tested with Stripe, stored encrypted" },
  { tool: "Razorpay", fields: "Key ID and key secret", check: "Tested with Razorpay, stored encrypted" },
  { tool: "Cashfree · Paystack", fields: "API keys from the dashboard", check: "Tested before saving" },
  { tool: "Shopify", fields: "Your store address (your-store.myshopify.com) and an access token", check: "Tested against your shop" },
  { tool: "WooCommerce", fields: "Site address, consumer key and consumer secret", check: "Tested against your REST API" },
  { tool: "HubSpot", fields: "A private-app access token with contact permissions", check: "Tested for the contacts scopes" },
  { tool: "Trello", fields: "API key and token, then pick a board", check: "Tested before saving" },
  { tool: "Asana", fields: "A normal sign-in and permission screen", check: "Standard OAuth, nothing to paste" },
];

function WhatYouPaste({ t }: { t: T }) {
  const needs = tList<Need>(t, "integrations.paste.rows", NEEDS_EN);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("integrations.paste.eyebrow", "Before you connect")} color={ORANGE} title={t("integrations.paste.title", "What each connector needs from you.")} sub={t("integrations.paste.subtitle", "No code for any of these. Elpino checks what you paste against the provider before it saves anything.")} />
        <div className="mt-12 overflow-hidden rounded-[10px] border border-black/40">
          <div className="hidden grid-cols-[0.8fr_1.4fr_1fr] bg-[#f4f4f2] text-[13px] font-medium text-black/55 md:grid">
            <p className="px-6 py-3">{t("integrations.paste.colTool", "Connector")}</p>
            <p className="px-6 py-3">{t("integrations.paste.colNeeds", "You provide")}</p>
            <p className="px-6 py-3">{t("integrations.paste.colCheck", "Then")}</p>
          </div>
          {needs.map((n, i) => (
            <Rv key={n.tool} variant="up" delay={(i % 4) * 50}>
              <div className="grid gap-1 border-t border-black/10 px-6 py-4 md:grid-cols-[0.8fr_1.4fr_1fr] md:gap-0 md:px-0 md:py-0">
                <p className="font-medium md:px-6 md:py-4">{n.tool}</p>
                <p className="text-black/65 md:px-6 md:py-4">{n.fields}</p>
                <p className="flex items-center gap-2 text-[14.5px] text-black/60 md:px-6 md:py-4"><Check size={14} strokeWidth={3} color={GREEN} className="shrink-0" />{n.check}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- what it unlocks

type Job = { job: string; with: string[] };
const JOBS_EN: Job[] = [
  { job: "“Where is my order?”", with: ["Shopify", "WooCommerce"] },
  { job: "“My payment failed”", with: ["Stripe", "Razorpay"] },
  { job: "“Cancel my subscription”", with: ["Stripe", "Razorpay"] },
  { job: "“Wrong shipping address”", with: ["Shopify", "WooCommerce"] },
  { job: "“I'd like a quote for my team”", with: ["HubSpot"] },
  { job: "A chat nobody could take", with: ["Trello", "Asana"] },
  { job: "Anything only your own system knows", with: ["MCP servers"] },
];

function Jobs({ t }: { t: T }) {
  const jobs = tList<Job>(t, "integrations.jobs.items", JOBS_EN);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Heading eyebrow={t("integrations.jobs.eyebrow", "Which one for what")} color={GREEN} title={t("integrations.jobs.title", "Start from the problem, not the tool.")} sub={t("integrations.jobs.subtitle", "Pick the connector that matches the question your customers ask most.")} />
        <div className="border-b border-black/20">
          {jobs.map((j, i) => (
            <Rv key={j.job} variant="up" delay={(i % 4) * 50}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/20 py-5">
                <p className="text-[clamp(1.1rem,1.5vw,1.3rem)] font-medium tracking-[-0.015em]">{j.job}</p>
                <div className="flex flex-wrap gap-2">{j.with.map((w) => <span key={w} className="rounded-full border border-black/25 px-3 py-1 text-[13.5px] font-medium">{w}</span>)}</div>
              </div>
            </Rv>
          ))}
        </div>
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
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("integrations.how.eyebrow", "Connecting")} color={GREEN} title={<>{t("integrations.how.titlePrefix", "A minute each. ")}{t("integrations.how.titleHl", "No engineers.")}</>} />
        <div className="relative mt-14">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[34px] hidden h-0.5 md:block" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.3) 50%, transparent 50%)`, backgroundSize: "12px 2px" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Rv key={s.t} variant="up" delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 grid size-[68px] place-items-center rounded-full border border-black/20 bg-white"><s.icon size={26} style={{ color: s.c }} /></span>
                  <div className={`${card} mt-4 w-full bg-white p-5`}><p className={`${mono} text-black/45`}>{t("integrations.how.stepLabel", "Step {n}").replace("{n}", String(i + 1))}</p><p className="mt-1 text-xl font-medium tracking-[-0.02em]">{s.t}</p><p className="mt-2 text-[15.5px] leading-7 text-black/65">{s.d}</p></div>
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
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("integrations.families.eyebrow", "The catalogue")} color={BLUE} title={<>{t("integrations.families.titlePrefix", "Three kinds of ")}{t("integrations.families.titleHl", "connection.")}</>} />
        <div className="mt-10 flex w-fit flex-wrap gap-1 rounded-full border border-black/25 bg-[#f4f4f2] p-1">
          {(Object.keys(FAM_COLOR) as Family[]).map((k) => <button key={k} type="button" onClick={() => setF(k)} aria-pressed={k === f} className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={k === f ? { backgroundColor: INK, color: "#fff" } : undefined}>{famLabel(t, k)}</button>)}
        </div>
        <div key={f} className="mt-10 grid gap-5 sm:grid-cols-2" style={{ animation: "elpino-rv-deal .5s both" }}>
          {list.map((c) => (
            <div key={c.id} className={`${card} group relative overflow-hidden bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
              <div className="flex items-center gap-4">
                <span className="grid size-14 place-items-center rounded-xl bg-[#f4f4f2] p-2.5">{c.icon}</span>
                <div><p className="flex items-center gap-2 text-2xl font-medium tracking-[-0.025em]">{c.name}{c.isNew && <NewTag t={t} />}</p><p className="text-[14.5px] text-black/60">{c.blurb}</p></div>
              </div>
              <ul className="mt-5 space-y-2">{c.abilities.map((a) => <li key={a} className="flex items-start gap-2.5 text-[15.5px]"><Check size={16} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{a}</li>)}</ul>
            </div>
          ))}
        </div>
        {f === "Stores" && <Rv delay={100}><p className="mt-6 text-sm text-black/55">{t("integrations.families.storesNote", "Order actions need the customer to be verified and signed in on your site, and the workspace owner has to switch them on.")}</p></Rv>}
        {f === "Payments" && <Rv delay={100}><p className="mt-6 text-sm text-black/55">{t("integrations.families.paymentsNote", "The AI's payment actions today work with Stripe and Razorpay. Cashfree and Paystack bring payment context to your team.")}</p></Rv>}
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
  { icon: Package, c: BLUE },
  { icon: UserCheck, c: GREEN },
  { icon: Lock, c: PURPLE },
  { icon: Check, c: ORANGE },
];
const SAFE_EN: SafeItem[] = [
  { t: "Keys stay encrypted", d: "Credentials are stored encrypted, and Elpino verifies them with the provider before saving." },
  { t: "Read access is enough for lookups", d: "For Stripe, use a restricted key with read access to customers and payments." },
  { t: "Money moves only if you allow it", d: "Refunds are off by default. The workspace owner decides whether the AI may issue them." },
  { t: "You approve every MCP tool", d: "The AI only sees the tools you switched on, and each call is re-checked on the server." },
  { t: "Order actions are narrow", d: "Only unshipped orders can be cancelled or have their address corrected, and only for a verified, signed-in customer." },
  { t: "Customers are never guessed", d: "Every order or payment is tied to a verified customer, and the email must match what the store holds." },
  { t: "The model never sees raw details", d: "It works with short-lived references, not emails, internal ids or amounts." },
  { t: "Everything leaves a trail", d: "Your team gets a note of what the AI looked up or did, in the conversation." },
];

function Safe({ t }: { t: T }) {
  const safeText = tList<SafeItem>(t, "integrations.safe.items", SAFE_EN);
  const safe = SAFE_META.map((meta, i) => ({ ...meta, ...SAFE_EN[i], ...(safeText[i] ?? {}) }));
  return (
    <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="max-w-3xl">
          <Rv variant="drop"><Stamp color={PINK}><ShieldCheck size={13} />{t("integrations.safe.badge", "Safe by default")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("integrations.safe.titlePrefix", "Connected, ")}<span style={{ color: "#6db3ff" }}>{t("integrations.safe.titleHl", "not exposed.")}</span></h2></Rv>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {safe.map((s, i) => (
            <Rv key={s.t} variant="up" delay={i * 80}>
              <div className={`h-full rounded-[10px] bg-white p-5 text-[#11120f]`}>
                <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${s.c}1a` }}><s.icon size={21} style={{ color: s.c }} /></span>
                <p className="mt-4 text-lg font-medium leading-snug tracking-[-0.02em]">{s.t}</p>
                <p className="mt-2 text-[14.5px] leading-6 text-black/65">{s.d}</p>
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
  ["Which tools can I connect?", "Stripe, Razorpay, Cashfree and Paystack for payments, Shopify and WooCommerce for orders, HubSpot for sales leads, Trello and Asana for tickets, and your own MCP servers for anything else."],
  ["What can the AI do with payments?", "With Stripe or Razorpay connected it can look up payments and subscriptions, send receipts and payment links, and cancel a subscription when asked. Refunds are off unless you enable them."],
  ["Do I need to be technical?", "Not for payments or tickets. You paste a key, or sign in to Asana. MCP servers need someone to have built one."],
  ["What can the AI do with my store?", "With Shopify or WooCommerce connected it can find a verified customer's order, show its status and tracking, and, for orders that haven't shipped, cancel them or correct the shipping address. The owner switches order actions on."],
  ["What does HubSpot get?", "When a sales conversation is qualified, the contact is created or updated and a note records what they want. Name, email and phone come from the customer record."],
  ["Is Slack or Zendesk supported?", "Not as one-click connectors today. If your system has an MCP server, you can connect it, and you can tell us what you'd like next."],
  ["Where do tickets go?", "To Trello or Asana if connected. Otherwise they live on your Issues page."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "integrations.faq.itemsV2", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("integrations.faq.titlePrefix", "Good to ")}{t("integrations.faq.titleHl", "know.")}</h2></Rv>
        <Rv delay={80}>
          <div className="border-b border-black/20">
            {faqs.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <div key={q} className="border-t border-black/20">
                  <h3>
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                      <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug tracking-[-0.015em]">{q}</span>
                      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#11120f] bg-[#11120f] text-white" : "border-black/25 text-[#11120f]"}`}><Plus size={18} /></span>
                    </button>
                  </h3>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><p className="max-w-2xl pb-7 text-[17px] leading-7 text-black/65">{a}</p></div>
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
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("integrations.closing.title", "Missing something you need?")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("integrations.closing.subtitle", "Tell us which tool you'd like next, or connect it yourself over MCP.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("integrations.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("integrations.closing.ctaRequest", "Request an integration")}</Link>
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
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <JustAdded t={t} />
      <How t={t} />
      <Families t={t} />
      <OrderDemo t={t} />
      <LeadDemo t={t} />
      <WhatYouPaste t={t} />
      <Jobs t={t} />
      <Safe t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
