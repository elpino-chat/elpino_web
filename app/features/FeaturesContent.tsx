"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Bot, Check, Code2, Headset, Plus, Rocket, Search, ShieldCheck, Sparkles, Store,
  Users, Wrench, Zap,
} from "lucide-react";
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
  aiAgent: "AI agent", inbox: "Inbox", demo: "Demo", pricing: "Pricing", knowledgeHub: "Knowledge Hub", securityGuide: "Security guide",
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
  { name: "Team invites", body: "Invite teammates by email and add seats as your team grows." },
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
  { name: "Credit-based plans", body: "Paid plans include a monthly AI credit, and extra seats are simple add-ons." },
  { name: "Email replies", body: "Verified visitors who left the chat can still get your reply by email." },
];

function useFeatures(t: T): Feature[] {
  const text = tList<FeatureText>(t, "features.tiles", FEATURES_EN);
  return FEATURES_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Table({ t }: { t: T }) {
  const FEATURES = useFeatures(t);
  const [fam, setFam] = useState<Family | "all">("all");
  const [sel, setSel] = useState(0);
  const f = FEATURES[sel];
  const fc = FAMILY_COLOR[f.fam];
  const allLabel = t("features.table.all", "All").concat(" · ", String(FEATURES.length));

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setFam("all")} aria-pressed={fam === "all"} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={fam === "all" ? { backgroundColor: INK, color: "#fff" } : { backgroundColor: "#fff" }}>{allLabel}</button>
        {FAMILY_ORDER.map((k) => (
          <button key={k} type="button" onClick={() => setFam(fam === k ? "all" : k)} aria-pressed={fam === k} className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2 text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={fam === k ? { backgroundColor: FAMILY_COLOR[k], color: onDark(FAMILY_COLOR[k]) } : { backgroundColor: "#fff" }}>
            <span className="size-3 rounded-full border-2 border-[#11120f]" style={{ backgroundColor: FAMILY_COLOR[k] }} />{familyLabel(t, k)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {FEATURES.map((x, i) => {
            const c = FAMILY_COLOR[x.fam];
            const dim = fam !== "all" && fam !== x.fam;
            const on = i === sel;
            return (
              <button key={x.sym} type="button" onClick={() => setSel(i)} aria-pressed={on} aria-label={x.name} className="group relative aspect-square rounded-2xl border-2 border-[#11120f] p-2 text-left transition-all duration-300 hover:-translate-y-1 hover:rotate-[-2deg]" style={{ backgroundColor: c, color: onDark(c), opacity: dim ? 0.22 : 1, transform: on ? "scale(1.06) rotate(-3deg)" : undefined, boxShadow: on ? `0 0 0 4px #fff, 0 0 0 6px ${INK}` : "none", zIndex: on ? 2 : 1 }}>
                <span className="font-mono text-[9px] font-bold opacity-70">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute inset-x-0 top-[26%] text-center text-[clamp(1.4rem,3.2vw,2.1rem)] font-semibold leading-none tracking-[-0.04em]">{x.sym}</span>
                <span className="absolute inset-x-1.5 bottom-1.5 truncate text-center text-[9.5px] font-semibold leading-tight sm:text-[10.5px]">{x.name}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div key={f.sym} className={`${card} bg-white p-5`} style={{ animation: "elpino-rv-deal .45s both" }}>
            <div className="flex items-start justify-between">
              <span className="grid size-24 place-items-center rounded-2xl border-2 border-[#11120f] text-[2.8rem] font-semibold leading-none tracking-[-0.05em]" style={{ backgroundColor: fc, color: onDark(fc) }}>{f.sym}</span>
              <Stamp color={fc}>{familyLabel(t, f.fam)}</Stamp>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">{f.name}</h3>
            <p className="mt-2 text-[16px] leading-7 text-[#11120f]/70">{f.body}</p>
            <Link href={f.href} className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5">{t("features.table.readMoreIn", "Read more in {more}").replace("{more}", moreLabel(t, f.moreKey))} <ArrowRight size={14} /></Link>
          </div>
          <p className="mt-3 text-center text-xs text-[#11120f]/50">{t("features.table.hint", "Tap any tile. Every feature here is live today.")}</p>
        </div>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const count = FEATURES_META.length;
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 45%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent)" }} />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Sparkles size={13} />{t("features.hero.badge", "Features")}</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.7rem,6.4vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              {t("features.hero.titlePrefix", "The elements of ")}<span className="hl">{t("features.hero.titleHl", "great support.")}</span>
            </h1>
          </Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[58ch] text-lg leading-8 text-[#11120f]/70">{t("features.hero.subtitle", "{count} capabilities, one workspace. Filter by family, tap a tile, and see exactly what Elpino does.").replace("{count}", String(count))}</p></Rv>
        </div>
        <Rv variant="deal" delay={200} className="mt-12"><Table t={t} /></Rv>
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
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("features.loop.eyebrow", "How they fit")} color={BLUE} title={<>{t("features.loop.titlePrefix", "It's a loop, ")}<span className="hl">{t("features.loop.titleHl", "not a list.")}</span></>} sub={t("features.loop.subtitle", "Each feature feeds the next, so support gets better the more you use it.")} />
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="200" cy="200" r="150" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="4 10" strokeLinecap="round" style={{ animation: "elpino-dashflow 4s linear infinite", transformOrigin: "200px 200px" }} />
            </svg>
            {LOOP.map((l, k) => {
              const a = (k / LOOP.length) * Math.PI * 2 - Math.PI / 2;
              const on = k === i;
              return (
                <button key={k} type="button" onClick={() => setI(k)} aria-label={l.t} className="absolute grid size-[76px] place-items-center rounded-full border-2 border-[#11120f] transition-all duration-500" style={{ left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 37.5}%`, transform: `translate(-50%,-50%) scale(${on ? 1.2 : 1})`, backgroundColor: l.c, boxShadow: on ? `0 0 0 6px ${l.c}55` : "none" }}>
                  <l.icon size={26} color={onDark(l.c)} />
                </button>
              );
            })}
            <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="mx-auto size-16 rounded-full border-2 border-[#11120f] bg-white object-contain p-1" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className={`${mono} mt-2 text-[#11120f]/50`}>Elpino</p>
            </div>
          </div>
          <div key={i} className={`${card} bg-white p-7`} style={{ animation: "elpino-rv-deal .45s both" }}>
            <span className="grid size-14 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: cur.c }}><cur.icon size={26} color={onDark(cur.c)} /></span>
            <p className={`${mono} mt-5 text-[#11120f]/45`}>{t("features.loop.stepOf", "Step {n} of {total}").replace("{n}", String(i + 1)).replace("{total}", String(LOOP.length))}</p>
            <h3 className="mt-1 text-4xl font-semibold tracking-[-0.04em]">{cur.t}</h3>
            <p className="mt-3 text-[17px] leading-8 text-[#11120f]/65">{cur.d}</p>
            <Link href={cur.link} className="mt-6 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4">{t("features.loop.explore", "Explore this step")} <ArrowRight size={15} /></Link>
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
  { label: "Store owner", line: "Customers ask about orders and payments all day.", picks: ["Order lookups through your MCP tools", "Payment links and receipts", "Refunds only if you switch them on", "Replies in your customer's language"] },
];

function usePersonas(t: T) {
  const text = tList<PersonaText>(t, "features.personas.items", PERSONAS_EN);
  return PERSONAS_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Personas({ t }: { t: T }) {
  const PERSONAS = usePersonas(t);
  const [i, setI] = useState(0);
  const p = PERSONAS[i];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow={t("features.personas.eyebrow", "Who it's for")} color={GREEN} title={<>{t("features.personas.titlePrefix", "Pick your seat. ")}<span className="hl">{t("features.personas.titleHl", "See your features.")}</span></>} />
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {PERSONAS.map((x, k) => (
            <button key={x.key} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2.5 text-[14.5px] font-semibold transition hover:-translate-y-0.5" style={k === i ? { backgroundColor: x.c, color: "#fff" } : undefined}><x.icon size={16} />{x.label}</button>
          ))}
        </div>
        <div key={p.key} className={`${card} mt-8 grid overflow-hidden lg:grid-cols-[.9fr_1.1fr]`} style={{ animation: "elpino-rv-deal .45s both" }}>
          <div className="p-8 text-white" style={{ backgroundColor: p.c }}>
            <p.icon size={34} />
            <p className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.03em]">{p.line}</p>
          </div>
          <ul className="divide-y-2 divide-[#11120f]/10 bg-[#fffdf5] p-3">
            {p.picks.map((x, idx) => <li key={idx} className="flex items-center gap-3 px-4 py-4 text-[17px] font-medium"><span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: p.c }}><Check size={14} color="#fff" strokeWidth={3} /></span>{x}</li>)}
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
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Zap size={13} />{t("features.stack.badge", "One tool")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("features.stack.titlePrefix", "Six tools in. ")}<span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>{t("features.stack.titleHl", "One workspace out.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">{t("features.stack.subtitle", "Most teams stitch a widget, a helpdesk, a knowledge base and a bot together. Elpino is all of it in one place, with one memory of every customer.")}</p></Rv>
        </div>
        <div className="mt-14 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap justify-center gap-2.5">
            {STACK.map((s, i) => <Rv key={i} variant="pop" delay={i * 70}><span className="inline-block rounded-full border-2 border-white/30 px-4 py-2 text-[15px] text-white/60 line-through decoration-[#d9508a] decoration-2" style={{ transform: `rotate(${(i % 3 - 1) * 3}deg)` }}>{s}</span></Rv>)}
          </div>
          <ArrowRight size={34} className="mx-auto rotate-90 md:rotate-0" style={{ color: YELLOW }} aria-hidden="true" />
          <Rv variant="deal" delay={300}>
            <div className={`${card} bg-[#fffdf5] p-7 text-center text-[#11120f]`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="mx-auto size-16 rounded-full border-2 border-[#11120f] bg-white object-contain p-1" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Elpino</p>
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
    <section className="bg-[#fff8ec] px-5 py-20 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-4xl overflow-hidden bg-white p-8 text-center`}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
          <div className="relative">
            <Stamp color={PINK}><Search size={12} />{t("features.soon.badge", "Coming in November")}</Stamp>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">{t("features.soon.title", "Omnichannel is next.")}</h3>
            <p className="mx-auto mt-3 max-w-[54ch] text-[17px] leading-8 text-[#11120f]/65">{t("features.soon.body", "Website chat is live today. Bringing more channels into the same inbox is what we're shipping next, and we'll announce it on the changelog.")}</p>
            <Link href="/changelog" className="mt-5 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4">{t("features.soon.cta", "See the changelog")} <ArrowRight size={15} /></Link>
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
  { q: "How do paid plans work?", a: "Paid plans include a monthly AI credit, and extra seats are simple add-ons. See the pricing page for details." },
];

function Faq({ t }: { t: T }) {
  const FAQS = tList<Faq>(t, "features.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow={t("features.faq.eyebrow", "Questions")} color={YELLOW} title={<>{t("features.faq.titlePrefix", "Good to ")}<span className="hl">{t("features.faq.titleHl", "know.")}</span></>} />
        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => (
            <Rv key={i} variant="up" delay={i * 50}>
              <div className={`${card} overflow-hidden ${open === i ? "bg-[#fffdf5]" : "bg-white"}`}>
                <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold">
                  {item.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-[#11120f] transition-transform duration-300" style={{ backgroundColor: open === i ? YELLOW : "#fff", transform: open === i ? "rotate(45deg)" : "none" }}><Plus size={16} /></span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-[16px] leading-7 text-[#11120f]/70">{item.a}</p></div>
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
    <section className="bg-white px-5 pb-24 pt-4 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
          <ShieldCheck size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("features.closing.title", "Every element, ready to use.")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/85">{t("features.closing.subtitle", "Start on the free plan and switch things on as you grow.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>{t("features.closing.ctaStart", "Start free")} <ArrowRight size={16} /></Link>
            <Link href="/pricing" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">{t("features.closing.ctaPricing", "See pricing")}</Link>
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
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero t={t} />
      <Loop t={t} />
      <Personas t={t} />
      <Stack t={t} />
      <Soon t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
