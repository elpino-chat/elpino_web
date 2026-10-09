"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Bot, Check, Code2, Headset, Plus, Rocket, Search, ShieldCheck, Sparkles, Store,
  Users, Wrench, Zap,
} from "lucide-react";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Features, laid out like a periodic table: every real capability is a tile
// with a symbol, grouped by colour into six families. Tap a tile for what it
// does and where to read more. Everything here exists in the product today;
// omnichannel is shown as "coming in November", not as a feature.

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

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
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

// ------------------------------------------------------------ the table

type Family = "answer" | "team" | "know" | "act" | "trust" | "grow";
const FAMILY_COLOR: Record<Family, string> = { answer: BLUE, team: GREEN, know: YELLOW, act: ORANGE, trust: PURPLE, grow: PINK };
const FAMILY_ORDER: Family[] = ["answer", "team", "know", "act", "trust", "grow"];
const FAMILY_EN: Record<Family, string> = { answer: "Answer", team: "Team", know: "Knowledge", act: "Act", trust: "Trust", grow: "Grow" };

function familyLabel(t: T, f: Family): string {
  return t(`features.families.${f}`, FAMILY_EN[f]);
}

type FeatureMeta = { sym: string; fam: Family; href: string; moreKey: string };
type FeatureText = { name: string; body: string };
type Feature = FeatureMeta & FeatureText;

const MORE_EN: Record<string, string> = {
  integrations: "Integrations", aiAgent: "AI agent", inbox: "Inbox", demo: "Demo", pricing: "Pricing", knowledgeHub: "Knowledge Hub", securityGuide: "Security guide",
};

function moreLabel(t: T, key: string): string {
  return t(`features.pageNames.${key}`, MORE_EN[key] ?? key);
}

const FEATURES_META: FeatureMeta[] = [
  { sym: "Ga", fam: "answer", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Rl", fam: "answer", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Pa", fam: "answer", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Wb", fam: "answer", href: "/demo", moreKey: "demo" },
  { sym: "Ty", fam: "answer", href: "/product/inbox", moreKey: "inbox" },
  { sym: "At", fam: "answer", href: "/product/inbox", moreKey: "inbox" },

  { sym: "Si", fam: "team", href: "/product/inbox", moreKey: "inbox" },
  { sym: "Ja", fam: "team", href: "/product/inbox", moreKey: "inbox" },
  { sym: "Th", fam: "team", href: "/product/inbox", moreKey: "inbox" },
  { sym: "As", fam: "team", href: "/product/inbox", moreKey: "inbox" },
  { sym: "Ti", fam: "team", href: "/pricing", moreKey: "pricing" },
  { sym: "Tk", fam: "team", href: "/product/inbox", moreKey: "inbox" },

  { sym: "Wc", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },
  { sym: "Sm", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },
  { sym: "Di", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },
  { sym: "Fu", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },
  { sym: "Wp", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },
  { sym: "Pp", fam: "know", href: "/product/knowledge-hub", moreKey: "knowledgeHub" },

  { sym: "Pl", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Pk", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Su", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Rf", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Rc", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },
  { sym: "Mc", fam: "act", href: "/product/ai-agent", moreKey: "aiAgent" },

  { sym: "Iv", fam: "trust", href: "/security-guide", moreKey: "securityGuide" },
  { sym: "Pd", fam: "trust", href: "/security-guide", moreKey: "securityGuide" },
  { sym: "Sr", fam: "trust", href: "/security-guide", moreKey: "securityGuide" },
  { sym: "Ec", fam: "trust", href: "/security-guide", moreKey: "securityGuide" },
  { sym: "Bg", fam: "trust", href: "/pricing", moreKey: "pricing" },
  { sym: "Fr", fam: "trust", href: "/product/ai-agent", moreKey: "aiAgent" },

  { sym: "Vc", fam: "grow", href: "/product/inbox", moreKey: "inbox" },
  { sym: "An", fam: "grow", href: "/pricing", moreKey: "pricing" },
  { sym: "Hi", fam: "grow", href: "/product/inbox", moreKey: "inbox" },
  { sym: "Fp", fam: "grow", href: "/pricing", moreKey: "pricing" },
  { sym: "Cr", fam: "grow", href: "/pricing", moreKey: "pricing" },
  { sym: "Em", fam: "grow", href: "/product/inbox", moreKey: "inbox" },

  { sym: "Or", fam: "act", href: "/integrations", moreKey: "integrations" },
  { sym: "Oa", fam: "act", href: "/integrations", moreKey: "integrations" },
  { sym: "Hs", fam: "grow", href: "/integrations", moreKey: "integrations" },
];

const FEATURES_EN: FeatureText[] = [
  { name: "Grounded answers", body: "Replies come from the knowledge you approved. If it isn't there, the AI says so instead of guessing." },
  { name: "Reply language", body: "Choose the language the chatbot replies in for your customers." },
  { name: "Page awareness", body: "Decide whether the AI can see the page URL a visitor is on, and use it to answer in context." },
  { name: "Branded widget", body: "Your logo and colours on a chat widget you embed with one snippet." },
  { name: "Live typing", body: "Customers see when a teammate is replying, and you see when they are." },
  { name: "Attachments", body: "Customers and your team can send files right inside the conversation." },

  { name: "Shared inbox", body: "Every conversation and reply in one place, with a badge showing whether the AI, a teammate or nobody has it." },
  { name: "Join alerts", body: "When a customer asks for a person, every teammate gets a Join alert. The first to join takes it and the alert clears for everyone." },
  { name: "Take over & hand back", body: "Take a chat from the AI or a colleague, and hand it back to the AI in one tap." },
  { name: "Assignments", body: "Conversations can be assigned to a teammate, who gets notified." },
  { name: "Team invites", body: "Invite as many teammates by email as you like: seats are unlimited." },
  { name: "Auto tickets", body: "If nobody joins within 90 seconds, the customer is told and a ticket is created automatically, with an email follow-up." },

  { name: "Website crawl", body: "Point Elpino at a page. JavaScript-built pages are rendered in a real browser first." },
  { name: "Sitemap import", body: "Pull in up to 20 pages from your sitemap in one go." },
  { name: "Discover", body: "Start at one link and Elpino follows it through up to 50 pages, help and policy pages first." },
  { name: "File upload", body: "Upload PDF, Word, text and Markdown files and the text is extracted for you." },
  { name: "Written pages", body: "Write your own pages in the editor for things that live nowhere else." },
  { name: "Public / private", body: "Each source has a visibility switch, so internal notes stay internal." },

  { name: "Payment lookup", body: "Checks real payments in Stripe or Razorpay so answers are facts, not guesses." },
  { name: "Payment links", body: "Creates a fresh, secure payment link when a payment needs another try." },
  { name: "Subscriptions", body: "Checks subscription status and can cancel one when the customer asks." },
  { name: "Refunds (opt-in)", body: "Off by default. The workspace owner decides whether the AI may refund at all." },
  { name: "Receipts", body: "Finds and sends the receipt for a specific payment." },
  { name: "MCP tools", body: "Connect up to five MCP servers and switch on exactly the tools the agent may use." },

  { name: "Identity check", body: "A one-time email code or a signed token from your app confirms who the customer is." },
  { name: "Private-data filter", body: "Names and emails are swapped for reference codes before the AI reads a conversation, and secrets are stripped out." },
  { name: "Secure requests", body: "Ask for sensitive details through a one-time private form instead of the chat." },
  { name: "Encrypted keys", body: "Connected credentials are stored encrypted." },
  { name: "Budget guardrails", body: "A monthly AI credit on paid plans keeps AI spend predictable." },
  { name: "Fact review", body: "Drafts are checked against tool results before the customer sees them." },

  { name: "Visitor context", body: "Location, device and the page they were on, attached to every conversation." },
  { name: "Analytics", body: "See how conversations are going across your workspace." },
  { name: "History", body: "Earlier conversations with the same customer, right next to the thread." },
  { name: "Free plan", body: "Start with 100 AI messages a month, no card required." },
  { name: "Credit-based plans", body: "Paid plans include a monthly AI credit, and seats are unlimited." },
  { name: "Email replies", body: "Verified visitors who left the chat can still get your reply by email." },

  { name: "Order lookups", body: "Connect Shopify or WooCommerce and the AI finds a verified customer's order, with its status and tracking." },
  { name: "Order actions", body: "For orders that haven't shipped, the AI can cancel them or correct the shipping address. The owner switches this on." },
  { name: "HubSpot leads", body: "A qualified sales chat becomes a HubSpot contact with a note on what they want." },
];

function useFeatures(t: T): Feature[] {
  const text = tList<FeatureText>(t, "features.tiles", FEATURES_EN);
  // The newest tiles sit at the end, so a locale that only has the first 36 lines up and the rest fall back to English.
  return FEATURES_META.map((meta, i) => ({ ...meta, ...FEATURES_EN[i], ...(text[i] ?? {}) }));
}

// Elpino at the centre, the six families around it. Pick a family and its features fan out in an
// arc; pick a feature for the detail. It drifts through the families on its own until you touch it.
function Table({ t }: { t: T }) {
  const FEATURES = useFeatures(t);
  const reduced = useReduced();
  const [famI, setFamI] = useState(0);
  const [selI, setSelI] = useState<number>(() => FEATURES.findIndex((x) => x.fam === FAMILY_ORDER[0]));
  const [touched, setTouched] = useState(false);
  const fam = FAMILY_ORDER[famI];
  const inFam = FEATURES.map((x, i) => ({ x, i })).filter(({ x }) => x.fam === fam);
  const f = FEATURES[selI] ?? inFam[0].x;
  const fc = FAMILY_COLOR[f.fam];

  const pickFamily = (k: number, user = true) => {
    if (user) setTouched(true);
    setFamI(k);
    setSelI(FEATURES.findIndex((x) => x.fam === FAMILY_ORDER[k]));
  };
  useEffect(() => {
    if (touched || reduced) return;
    const id = window.setTimeout(() => pickFamily((famI + 1) % FAMILY_ORDER.length, false), 5200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [famI, touched, reduced]);

  const R_FAM = 30; // % of the box
  const R_FEAT = 44;
  const angleOf = (k: number) => (k / FAMILY_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  const at = (a: number, r: number) => ({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r });

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
      {/* mobile / tablet: family chips and a plain list */}
      <div className="lg:hidden">
        <div className="mb-4 flex flex-wrap gap-2">
          {FAMILY_ORDER.map((k, i) => (
            <button key={k} type="button" onClick={() => pickFamily(i)} aria-pressed={famI === i} className="inline-flex items-center gap-2 rounded-full border border-black/25 px-4 py-2 text-[13.5px] font-medium" style={famI === i ? { backgroundColor: INK, color: "#fff", borderColor: INK } : { backgroundColor: "#fff" }}>
              <span className="size-2.5 rounded-full" style={{ backgroundColor: FAMILY_COLOR[k] }} />{familyLabel(t, k)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {inFam.map(({ x, i }) => (
            <button key={x.sym} type="button" onClick={() => setSelI(i)} aria-pressed={i === selI} className="rounded-[10px] border p-3 text-left transition" style={{ borderColor: i === selI ? INK : "rgba(0,0,0,0.25)", backgroundColor: i === selI ? "#f4f4f2" : "#fff" }}>
              <span className="block text-2xl tracking-[-0.04em]">{x.sym}</span>
              <span className="mt-1 block text-[13px] font-medium text-black/65">{x.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* desktop: the orbit */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[720px] lg:block" onPointerDown={() => setTouched(true)}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r={R_FAM} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.25" strokeDasharray="1 1.4" />
          <circle cx="50" cy="50" r={R_FEAT} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="0.25" />
          {FAMILY_ORDER.map((k, i) => {
            const p = at(angleOf(i), R_FAM);
            const on = i === famI;
            return <line key={k} x1="50" y1="50" x2={p.x} y2={p.y} stroke={on ? FAMILY_COLOR[k] : "rgba(0,0,0,0.12)"} strokeWidth={on ? 0.5 : 0.25} strokeDasharray={on ? "1.2 1.2" : undefined} style={on ? { animation: "elpino-dashflow 1.2s linear infinite" } : undefined} />;
          })}
          {inFam.map(({ x }, n) => {
            const base = angleOf(famI);
            const fan = inFam.length > 6 ? 2.2 : 1.9;
            const a = base + (n - (inFam.length - 1) / 2) * (fan / Math.max(1, inFam.length - 1));
            const p1 = at(base, R_FAM);
            const p2 = at(a, R_FEAT);
            return <line key={x.sym} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={FAMILY_COLOR[fam]} strokeOpacity="0.35" strokeWidth="0.25" />;
          })}
        </svg>

        {/* centre */}
        <div className="absolute left-1/2 top-1/2 w-[17%] -translate-x-1/2 -translate-y-1/2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/help-center-sloth.png" alt="A sloth organizing support knowledge" className="mx-auto size-[62%] rounded-full border border-black/15 bg-white object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
          <p className="mt-2 text-[clamp(1.4rem,3vw,2.2rem)] font-normal leading-none tracking-[-0.05em]">{FEATURES.length}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-black/45">{t("features.table.capabilities", "capabilities")}</p>
        </div>

        {/* families */}
        {FAMILY_ORDER.map((k, i) => {
          const p = at(angleOf(i), R_FAM);
          const on = i === famI;
          const count = FEATURES.filter((x) => x.fam === k).length;
          return (
            <button key={k} type="button" onClick={() => pickFamily(i)} aria-pressed={on} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white px-4 py-2.5 text-center transition-all duration-500 hover:border-black/60" style={{ left: `${p.x}%`, top: `${p.y}%`, borderColor: on ? FAMILY_COLOR[k] : "rgba(0,0,0,0.25)", boxShadow: on ? `0 0 0 6px ${FAMILY_COLOR[k]}1f` : "none", transform: `translate(-50%,-50%) scale(${on ? 1.12 : 0.94})`, opacity: on ? 1 : 0.8 }}>
              <span className="flex items-center gap-2 text-[14px] font-medium"><span className="size-2.5 rounded-full" style={{ backgroundColor: FAMILY_COLOR[k] }} />{familyLabel(t, k)}<span className="font-mono text-[11px] text-black/40">{count}</span></span>
            </button>
          );
        })}

        {/* the active family's features */}
        {inFam.map(({ x, i }, n) => {
          const base = angleOf(famI);
          const fan = inFam.length > 6 ? 2.2 : 1.9;
          const a = base + (n - (inFam.length - 1) / 2) * (fan / Math.max(1, inFam.length - 1));
          const p = at(a, R_FEAT);
          const on = i === selI;
          return (
            <button key={`${fam}-${x.sym}`} type="button" onClick={() => { setTouched(true); setSelI(i); }} aria-pressed={on} aria-label={x.name} className="group absolute grid size-[58px] place-items-center rounded-full border bg-white text-[17px] tracking-[-0.03em] transition-colors hover:border-black/60" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", borderColor: on ? INK : "rgba(0,0,0,0.25)", backgroundColor: on ? INK : "#fff", color: on ? "#fff" : INK, animation: `elpino-rv-pop .5s ${n * 60}ms both` }}>
              {x.sym}
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[11.5px] font-medium text-black/70 shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition-opacity" style={{ opacity: on ? 1 : 0 }}>{x.name}</span>
            </button>
          );
        })}
      </div>

      {/* detail */}
      <div className="lg:self-center">
        <div key={f.sym} className={`${card} bg-white p-6`} style={{ animation: "elpino-rv-deal .45s both" }}>
          <div className="flex items-start justify-between">
            <span className="grid size-24 place-items-center rounded-[10px] bg-[#f4f4f2] text-[2.8rem] font-normal leading-none tracking-[-0.05em]">{f.sym}</span>
            <Stamp color={fc}>{familyLabel(t, f.fam)}</Stamp>
          </div>
          <h3 className="mt-5 text-2xl font-medium tracking-[-0.025em]">{f.name}</h3>
          <p className="mt-2 text-[16px] leading-7 text-black/65">{f.body}</p>
          <Link href={f.href} className="mt-5 inline-flex items-center gap-2 text-[14.5px] font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("features.table.readMoreIn", "Read more in {more}").replace("{more}", moreLabel(t, f.moreKey))} <ArrowRight size={14} /></Link>
        </div>
        <p className="mt-3 text-xs text-black/50">{t("features.table.hintOrbit", "Pick a family, then a feature. Every one of them is live today.")}</p>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const count = FEATURES_META.length;
  return (
    <section className="bg-white px-5 pb-16 pt-16 text-[#11120f] sm:px-8 lg:px-20 lg:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[14px] text-black/50">{t("features.hero.badge", "Features")}</p>
          <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">
            {t("features.hero.titlePrefix", "The elements of ")}{t("features.hero.titleHl", "great support.")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("features.hero.subtitle", "{count} capabilities, one workspace. Filter by family, tap a tile, and see exactly what Elpino does.").replace("{count}", String(count))}</p>
        </div>
        <Rv variant="deal" delay={200} className="mt-12"><Table t={t} /></Rv>
      </div>
    </section>
  );
}


// ------------------------------------------------------------- shared bits

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

function CountUp({ to }: { to: number }) {
  const reduced = useReduced();
  const [ref, seen] = useSeen<HTMLSpanElement>(0.6);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setV(to); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 1400);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, reduced]);
  return <span ref={ref} className="tabular-nums">{v}</span>;
}

// ------------------------------------------------------------------ numbers

type Stat = { to: number; label: string };
const STATS_EN: Stat[] = [
  { to: 39, label: "capabilities in one workspace" },
  { to: 90, label: "seconds for a teammate to join before a ticket is filed" },
  { to: 50, label: "pages crawled from a single link" },
  { to: 5, label: "MCP servers the agent can use, tool by tool" },
];

function Numbers({ t }: { t: T }) {
  const stats = tList<Stat>(t, "features.numbers.items", STATS_EN);
  return (
    <section className="bg-white px-5 pb-8 sm:px-8 lg:px-20">
      <div className="mx-auto grid max-w-[1500px] gap-px overflow-hidden rounded-[10px] border border-black/40 bg-black/15 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((x, i) => (
          <Rv key={x.label} variant="up" delay={i * 80} className="bg-white">
            <div className="h-full p-7">
              <p className="text-[clamp(3rem,5vw,4.4rem)] font-normal leading-none tracking-[-0.05em]"><CountUp to={x.to} /></p>
              <p className="mt-3 max-w-[24ch] text-[15.5px] leading-6 text-black/60">{x.label}</p>
            </div>
          </Rv>
        ))}
      </div>
    </section>
  );
}

// ----------------------------------------------------------- family by family

function Families({ t }: { t: T }) {
  const FEATURES = useFeatures(t);
  const blurbs = tList<string>(t, "features.families.blurbs", [
    "Replies that come from what you approved, in your customer's language, from a widget that looks like yours.",
    "One inbox for the whole team, with alerts that reach everyone and a clear owner for every conversation.",
    "Teach Elpino from a link, a sitemap, files or pages you write, and decide who may see each source.",
    "The AI looks things up and does the simple jobs: payments, orders, subscriptions and your own tools.",
    "Identity checks, private-data filtering and guardrails, so the AI works inside limits.",
    "Context, history and analytics, so every conversation leaves your support a little better.",
  ]);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("features.byFamily.eyebrow", "Family by family")} color={GREEN} title={t("features.byFamily.title", "Everything, in the order you'd need it.")} sub={t("features.byFamily.subtitle", "The same 39 capabilities, grouped by the job they do.")} />
        <div className="mt-14 space-y-16 lg:space-y-24">
          {FAMILY_ORDER.map((k, n) => {
            const items = FEATURES.filter((x) => x.fam === k);
            return (
              <div key={k} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <Rv className="lg:sticky lg:top-28 lg:self-start">
                  <p className="flex items-center gap-2.5 text-[14px] font-medium text-black/50"><span className="size-2.5 rounded-full" style={{ backgroundColor: FAMILY_COLOR[k] }} />{String(n + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.05] tracking-[-0.04em]">{familyLabel(t, k)}</h3>
                  <p className="mt-4 max-w-md text-[17px] leading-8 text-black/65">{blurbs[n]}</p>
                  <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.08em] text-black/40">{items.length} {t("features.byFamily.features", "features")}</p>
                </Rv>
                <div className="border-b border-black/15">
                  {items.map((x, i) => (
                    <Rv key={x.sym} variant="up" delay={(i % 3) * 50}>
                      <Link href={x.href} className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 border-t border-black/15 py-5 transition-colors hover:bg-[#fafaf9] sm:grid-cols-[3.5rem_1fr_auto]">
                        <span className="font-mono text-[13px] text-black/40">{x.sym}</span>
                        <span>
                          <span className="block text-[19px] font-medium tracking-[-0.02em]">{x.name}</span>
                          <span className="mt-1 block max-w-xl text-[15.5px] leading-7 text-black/60">{x.body}</span>
                        </span>
                        <ArrowRight size={18} className="mt-1 text-black/30 transition-all group-hover:translate-x-1 group-hover:text-black" aria-hidden="true" />
                      </Link>
                    </Rv>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- a day

type Moment = { time: string; t: string; d: string; tag: string };
const DAY_EN: Moment[] = [
  { time: "09:02", t: "A visitor writes in", d: "From the widget on your site, with their location, device and the page they're on already attached.", tag: "Visitor context" },
  { time: "09:02", t: "The AI answers from your knowledge", d: "It finds the closest passages in what you taught it and replies in the customer's language.", tag: "Grounded answers" },
  { time: "09:05", t: "It checks who's asking", d: "Before anything personal, a one-time email code or a signed token confirms the customer.", tag: "Identity check" },
  { time: "09:06", t: "It looks up the payment", d: "A real lookup in Stripe or Razorpay, so the answer is a fact. The names it reads are reference codes.", tag: "Payment lookup" },
  { time: "09:08", t: "A change needs a person", d: "It can't do this one, so it asks the customer before bringing your team in.", tag: "Hand-off" },
  { time: "09:08", t: "Everyone gets a Join alert", d: "The first teammate to tap Join takes the chat, and the alert clears for everyone else.", tag: "Join alerts" },
  { time: "09:20", t: "The chat closes, the AI reviews it", d: "If your team still owes the customer something, it flags a ticket and says why.", tag: "Auto tickets" },
  { time: "09:21", t: "Your knowledge gets better", d: "You add what was missing. The next customer gets the answer straight away.", tag: "Written pages" },
];

function Day({ t }: { t: T }) {
  const moments = tList<Moment>(t, "features.day.items", DAY_EN);
  const ref = useRef<HTMLOListElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height)));
    };
    if (window.matchMedia("(max-width: 767.98px)").matches) { setP(1); return; }
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv className="lg:sticky lg:top-28 lg:self-start">
          <Heading eyebrow={t("features.day.eyebrow", "One conversation")} color={BLUE} title={t("features.day.title", "A morning on the desk.")} sub={t("features.day.subtitle", "Follow a single customer through the features above. Scroll, and the line fills as the conversation moves on.")} />
        </Rv>
        <ol ref={ref} className="relative">
          <span aria-hidden="true" className="absolute bottom-3 left-[27px] top-3 w-px bg-black/15" />
          <span aria-hidden="true" className="absolute left-[27px] top-3 w-px bg-[#0078f4]" style={{ height: `calc((100% - 1.5rem) * ${p})` }} />
          {moments.map((m, i) => {
            const on = p >= (i + 0.4) / moments.length;
            return (
              <li key={m.t} className="relative grid grid-cols-[56px_1fr] gap-5 py-5">
                <span className="relative z-10 grid size-14 place-items-center rounded-full border bg-white font-mono text-[12px] transition-all duration-500" style={{ borderColor: on ? "#0078f4" : "rgba(0,0,0,0.2)", color: on ? "#0078f4" : "#00000066", boxShadow: on ? "0 0 0 6px rgba(0,120,244,0.1)" : "none" }}>{m.time}</span>
                <div className="rounded-[10px] border bg-white p-5 transition-all duration-500" style={{ borderColor: on ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)", opacity: on ? 1 : 0.45 }}>
                  <p className="text-[20px] font-medium tracking-[-0.02em]">{m.t}</p>
                  <p className="mt-1.5 text-[15.5px] leading-7 text-black/60">{m.d}</p>
                  <span className="mt-3 inline-flex rounded-full border border-black/20 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-black/55">{m.tag}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- connectors

const CONNECTOR_STRIP: { id: string; name: string }[] = [
  { id: "stripe", name: "Stripe" }, { id: "razorpay", name: "Razorpay" }, { id: "cashfree", name: "Cashfree" }, { id: "paystack", name: "Paystack" },
  { id: "shopify", name: "Shopify" }, { id: "woocommerce", name: "WooCommerce" }, { id: "hubspot", name: "HubSpot" }, { id: "trello", name: "Trello" }, { id: "asana", name: "Asana" },
];

function Connectors({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow={t("features.connectors.eyebrow", "Plugs in")} color={ORANGE} title={t("features.connectors.title", "Works with the tools you already run.")} sub={t("features.connectors.subtitle", "Payments, stores, a CRM and ticket trackers, plus any system with an MCP server.")} />
          <Link href="/integrations" className="inline-flex items-center gap-2 text-[15px] font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("features.connectors.cta", "See all integrations")} <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-black/40 bg-black/15 sm:grid-cols-3 lg:grid-cols-5">
          {CONNECTOR_STRIP.map((c, i) => (
            <Rv key={c.id} variant="up" delay={(i % 5) * 60} className="bg-white">
              <div className="flex h-full items-center gap-3 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#f4f4f2] p-2"><ConnectorLogo provider={c.id} alt={c.name} className="size-full object-contain" fallback={<span className="text-lg font-semibold">{c.name[0]}</span>} /></span>
                <span className="text-[16px] font-medium">{c.name}</span>
              </div>
            </Rv>
          ))}
          <Rv variant="up" delay={300} className="bg-white">
            <div className="flex h-full items-center gap-3 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#f4f4f2]"><Wrench size={20} /></span><span className="text-[16px] font-medium">{t("features.connectors.mcp", "Your MCP servers")}</span></div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- the loop

type LoopMeta = { icon: typeof BookOpen; c: string; link: string };
type LoopText = { t: string; d: string };

const LOOP_META: LoopMeta[] = [
  { icon: BookOpen, c: YELLOW, link: "/product/knowledge-hub" },
  { icon: Bot, c: BLUE, link: "/product/ai-agent" },
  { icon: Wrench, c: ORANGE, link: "/product/ai-agent" },
  { icon: Headset, c: GREEN, link: "/product/inbox" },
  { icon: BarChart3, c: PINK, link: "/product/knowledge-hub" },
];

const LOOP_EN: LoopText[] = [
  { t: "Teach", d: "Crawl your site, upload files, write pages." },
  { t: "Answer", d: "The AI replies from your knowledge, in your language." },
  { t: "Act", d: "Payments, subscriptions and your MCP tools." },
  { t: "Hand off", d: "Ask first, alert the team, join or ticket." },
  { t: "Learn", d: "Review conversations and improve your knowledge." },
];

function useLoop(t: T) {
  const text = tList<LoopText>(t, "features.loop.steps", LOOP_EN);
  return LOOP_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Loop({ t }: { t: T }) {
  const LOOP = useLoop(t);
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % LOOP.length), 2200);
    return () => window.clearInterval(id);
  }, [reduced, LOOP.length]);
  const cur = LOOP[i];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("features.loop.eyebrow", "How they fit")} color={BLUE} title={<>{t("features.loop.titlePrefix", "It's a loop, ")}{t("features.loop.titleHl", "not a list.")}</>} sub={t("features.loop.subtitle", "Each feature feeds the next, so support gets better the more you use it.")} />
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeDasharray="4 10" strokeLinecap="round" style={{ animation: "elpino-dashflow 4s linear infinite", transformOrigin: "200px 200px" }} />
            </svg>
            {LOOP.map((l, k) => {
              const a = (k / LOOP.length) * Math.PI * 2 - Math.PI / 2;
              const on = k === i;
              return (
                <button key={k} type="button" onClick={() => setI(k)} aria-label={l.t} className="absolute grid size-[76px] place-items-center rounded-full border bg-white transition-all duration-500" style={{ left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 37.5}%`, transform: `translate(-50%,-50%) scale(${on ? 1.15 : 1})`, borderColor: on ? l.c : "rgba(0,0,0,0.2)", boxShadow: on ? `0 0 0 6px ${l.c}1f` : "none" }}>
                  <l.icon size={26} style={{ color: l.c }} />
                </button>
              );
            })}
            <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/help-center-sloth.png" alt="A sloth organizing support knowledge" className="mx-auto size-16 rounded-full border border-black/15 bg-white object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className={`${mono} mt-2 text-[#11120f]/50`}>Elpino</p>
            </div>
          </div>
          <div key={i} className={`${card} bg-[#f4f4f2] p-7`} style={{ animation: "elpino-rv-deal .45s both" }}>
            <span className="grid size-14 place-items-center rounded-full bg-white"><cur.icon size={26} style={{ color: cur.c }} /></span>
            <p className={`${mono} mt-5 text-[#11120f]/45`}>{t("features.loop.stepOf", "Step {n} of {total}").replace("{n}", String(i + 1)).replace("{total}", String(LOOP.length))}</p>
            <h3 className="mt-1 text-4xl font-normal tracking-[-0.04em]">{cur.t}</h3>
            <p className="mt-3 text-[17px] leading-8 text-black/65">{cur.d}</p>
            <Link href={cur.link} className="mt-6 inline-flex items-center gap-2 font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("features.loop.explore", "Explore this step")} <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- personas

type PersonaMeta = { key: string; icon: typeof Rocket; c: string };
type PersonaText = { label: string; line: string; picks: string[] };

const PERSONAS_META: PersonaMeta[] = [
  { key: "founder", icon: Rocket, c: ORANGE },
  { key: "lead", icon: Users, c: GREEN },
  { key: "dev", icon: Code2, c: PURPLE },
  { key: "owner", icon: Store, c: PINK },
];

const PERSONAS_EN: PersonaText[] = [
  { label: "Founder", line: "You're the whole support team and want your evenings back.", picks: ["Free plan, no card", "Answers from your site in minutes", "AI handles payments and receipts", "Only pings you when it truly needs you"] },
  { label: "Support lead", line: "You run a team and need clean ownership and no dropped chats.", picks: ["Shared inbox with clear badges", "Team-wide Join alerts", "Auto tickets when everyone's busy", "Visitor context on every thread"] },
  { label: "Developer", line: "You want it wired into your own product and data.", picks: ["Signed-token identity from your app", "MCP servers with per-tool approval", "Stripe and Razorpay lookups", "One embeddable widget snippet"] },
  { label: "Store owner", line: "Customers ask about orders and payments all day.", picks: ["Order lookups in Shopify and WooCommerce", "Payment links and receipts", "Refunds only if you switch them on", "Replies in your customer's language"] },
];

function usePersonas(t: T) {
  const text = tList<PersonaText>(t, "features.personas.itemsV2", PERSONAS_EN);
  return PERSONAS_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Personas({ t }: { t: T }) {
  const PERSONAS = usePersonas(t);
  const [i, setI] = useState(0);
  const p = PERSONAS[i];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("features.personas.eyebrow", "Who it's for")} color={GREEN} title={<>{t("features.personas.titlePrefix", "Pick your seat. ")}{t("features.personas.titleHl", "See your features.")}</>} />
        <div className="mt-12 flex flex-wrap gap-2">
          {PERSONAS.map((x, k) => (
            <button key={x.key} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="inline-flex items-center gap-2 rounded-full border border-black/25 px-4 py-2.5 text-[14.5px] font-medium transition hover:border-black/60" style={k === i ? { backgroundColor: INK, color: "#fff", borderColor: INK } : undefined}><x.icon size={16} />{x.label}</button>
          ))}
        </div>
        <div key={p.key} className={`${card} mt-8 grid overflow-hidden lg:grid-cols-[.9fr_1.1fr]`} style={{ animation: "elpino-rv-deal .45s both" }}>
          <div className="bg-[#f4f4f2] p-8">
            <p.icon size={32} style={{ color: p.c }} />
            <p className="mt-5 text-3xl font-normal leading-tight tracking-[-0.03em]">{p.line}</p>
          </div>
          <ul className="divide-y divide-black/10 bg-white p-3">
            {p.picks.map((x, idx) => <li key={idx} className="flex items-center gap-3 px-4 py-4 text-[17px] font-medium"><span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${p.c}1a` }}><Check size={14} color={p.c} strokeWidth={3} /></span>{x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- replace the stack

const STACK_EN = ["Chat widget", "Helpdesk inbox", "Knowledge base", "Chatbot builder", "Payment look-ups", "Handoff rules"];

function Stack({ t }: { t: T }) {
  const STACK = tList<string>(t, "features.stack.items", STACK_EN);
  return (
    <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="max-w-3xl">
          <Rv variant="drop"><Stamp color={YELLOW}><Zap size={13} />{t("features.stack.badge", "One tool")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("features.stack.titlePrefix", "Six tools in. ")}<span style={{ color: "#6db3ff" }}>{t("features.stack.titleHl", "One workspace out.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">{t("features.stack.subtitle", "Most teams stitch a widget, a helpdesk, a knowledge base and a bot together. Elpino is all of it in one place, with one memory of every customer.")}</p></Rv>
        </div>
        <div className="mt-14 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap justify-center gap-2.5">
            {STACK.map((s, i) => <Rv key={i} variant="pop" delay={i * 70}><span className="inline-block rounded-full border border-white/25 px-4 py-2 text-[15px] text-white/55 line-through decoration-[#d9508a] decoration-1">{s}</span></Rv>)}
          </div>
          <ArrowRight size={34} className="mx-auto rotate-90 md:rotate-0" style={{ color: "#6db3ff" }} aria-hidden="true" />
          <Rv variant="deal" delay={300}>
            <div className="rounded-[10px] bg-white p-7 text-center text-[#11120f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/contact-support-sloth.png" alt="A sloth handling customer support" className="mx-auto size-16 rounded-full border border-black/15 bg-white object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className="mt-3 text-3xl font-normal tracking-[-0.04em]">Elpino</p>
              <p className="mt-1 text-[15px] text-[#11120f]/60">{t("features.stack.cardSubtitle", "Widget · Inbox · Knowledge · AI agent · Tools · Handoff")}</p>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- coming soon

function Soon({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 py-8 sm:px-8 lg:px-20">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-[1500px] overflow-hidden border-dashed bg-[#f4f4f2] p-8 sm:p-12`}>
          <div className="relative">
            <Stamp color={PINK}><Search size={12} />{t("features.soon.badge", "Coming in November")}</Stamp>
            <h3 className="mt-5 text-3xl font-normal tracking-[-0.035em]">{t("features.soon.title", "Omnichannel is next.")}</h3>
            <p className="mt-3 max-w-[54ch] text-[17px] leading-8 text-black/65">{t("features.soon.body", "Website chat is live today. Bringing more channels into the same inbox is what we're shipping next, and we'll announce it on the changelog.")}</p>
            <Link href="/changelog" className="mt-5 inline-flex items-center gap-2 font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("features.soon.cta", "See the changelog")} <ArrowRight size={15} /></Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

// --------------------------------------------------------------------- faq

type Faq = { q: string; a: string };

const FAQS_EN: Faq[] = [
  { q: "Is everything on this page live?", a: "Yes. Every tile describes something Elpino does today. Omnichannel is the one thing we're still building, and it's marked as coming in November." },
  { q: "Do I need all of it?", a: "No. Start with a knowledge base and the widget on the free plan, then turn on tools, MCP and teammates as you need them." },
  { q: "What's included on the free plan?", a: "100 AI messages a month with no card required." },
  { q: "How do paid plans work?", a: "Paid plans include a monthly AI credit, and seats are unlimited. See the pricing page for details." },
];

function Faq({ t }: { t: T }) {
  const FAQS = tList<Faq>(t, "features.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("features.faq.titlePrefix", "Good to ")}{t("features.faq.titleHl", "know.")}</h2></Rv>
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
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("features.closing.title", "Every element, ready to use.")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("features.closing.subtitle", "Start on the free plan and switch things on as you grow.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("features.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/pricing" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("features.closing.ctaPricing", "See pricing")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function FeaturesContent() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <Numbers t={t} />
      <Loop t={t} />
      <Families t={t} />
      <Day t={t} />
      <Personas t={t} />
      <Connectors t={t} />
      <Stack t={t} />
      <Soon t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
