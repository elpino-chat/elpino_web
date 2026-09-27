"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BellRing, BookOpen, Check, CreditCard, Globe2, Headset, Lock, Plus, Rocket, Ticket, UserPlus, Users, Zap } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Founders, in the site's sticker language but built around one idea:
// your time. A live stream of customer questions shows what Elpino takes
// and what really needs you; a calculator (your numbers, your guess for how
// much the AI resolves, no promises) turns that into hours back; the rest
// covers setup, what reaches you, payments, and how it grows with a team.
// Only real product behaviour is shown; omnichannel is "coming in November".

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

function Heading({ eyebrow, color, title, sub, left = false }: { eyebrow: string; color: string; title: ReactNode; sub?: string; left?: boolean }) {
  return (
    <div className={left ? "max-w-3xl" : "mx-auto max-w-3xl text-center"}>
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-[#11120f]/65">{sub}</p></Rv>}
    </div>
  );
}

// -------------------------------------------------------------------- hero

type StreamMeta = { who: string; you?: boolean };
type StreamText = { q: string; why?: string };
type StreamItem = StreamMeta & StreamText;

const STREAM_META: StreamMeta[] = [
  { who: "Maya" },
  { who: "Jordan" },
  { who: "Sam" },
  { who: "Riya · large account", you: true },
  { who: "Leo" },
  { who: "Ana" },
  { who: "Tom", you: true },
  { who: "Ivy" },
];

const STREAM_EN: StreamText[] = [
  { q: "How do I export my data?" },
  { q: "Why did my card fail?" },
  { q: "Do you offer a startup discount?" },
  { q: "Can we get a custom contract?", why: "Asked for a person" },
  { q: "Where's my invoice for March?" },
  { q: "How do I reset my password?" },
  { q: "Can I talk to the founder?", why: "Asked for a person" },
  { q: "Does it work with Shopify?" },
];

function useStream(t: T): StreamItem[] {
  const text = tList<StreamText>(t, "founders.stream.items", STREAM_EN);
  return STREAM_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Stream({ t }: { t: T }) {
  const STREAM = useStream(t);
  const reduced = useReduced();
  const [n, setN] = useState(reduced ? STREAM.length : 3);
  useEffect(() => {
    if (reduced) { setN(STREAM.length); return; }
    const id = window.setTimeout(() => setN((v) => (v >= STREAM.length + 2 ? 1 : v + 1)), n >= STREAM.length ? 2600 : 1500);
    return () => window.clearTimeout(id);
  }, [n, reduced, STREAM.length]);

  const shown = STREAM.slice(0, Math.min(n, STREAM.length));
  const visible = shown.slice(-4);
  const handled = shown.filter((s) => !s.you).length;
  const needs = shown.filter((s) => s.you).length;

  return (
    <div className={`${card} relative overflow-hidden bg-[#fffdf5]`}>
      <div className="flex items-center justify-between border-b-2 border-[#11120f] bg-white px-4 py-3">
        <span className={`${mono} text-[#11120f]/55`}>{t("founders.stream.incomingLive", "Incoming, live")}</span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium"><span className="size-2 animate-pulse rounded-full" style={{ backgroundColor: GREEN }} />{t("founders.stream.onDuty", "Elpino on duty")}</span>
      </div>
      <div className="min-h-[286px] space-y-2.5 p-4">
        {visible.map((s, i) => (
          <div key={i} className="rounded-2xl border-2 border-[#11120f] bg-white p-3.5" style={{ animation: "elpino-rv-drop .45s both" }}>
            <div className="flex items-center justify-between gap-3">
              <span className={`${mono} text-[10px] text-[#11120f]/50`}>{s.who}</span>
              {s.you
                ? <span className={`${mono} inline-flex items-center gap-1 rounded-full border-2 border-[#11120f] px-2 py-0.5 text-[9px]`} style={{ backgroundColor: YELLOW, animation: "elpino-ring 1.4s ease-out infinite" }}><BellRing size={10} />{t("founders.stream.needsYou", "Needs you")}</span>
                : <span className={`${mono} inline-flex items-center gap-1 rounded-full border-2 border-[#11120f] px-2 py-0.5 text-[9px] text-white`} style={{ backgroundColor: GREEN }}><Check size={10} strokeWidth={3} />{t("founders.stream.handled", "Handled")}</span>}
            </div>
            <p className="mt-1.5 text-[15px] font-semibold leading-snug">{s.q}</p>
            {s.you && <p className="mt-1 text-[12.5px] text-[#11120f]/55">{t("founders.stream.askedFirst", "{why}. Elpino asked first, then alerted you.").replace("{why}", s.why ?? "")}</p>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 border-t-2 border-[#11120f]">
        <div className="border-r-2 border-[#11120f] p-4 text-white" style={{ backgroundColor: GREEN }}><p className="text-4xl font-semibold tabular-nums tracking-[-0.04em]">{handled}</p><p className={`${mono} text-white/80`}>{t("founders.stream.handledWithoutYou", "Handled without you")}</p></div>
        <div className="p-4" style={{ backgroundColor: YELLOW }}><p className="text-4xl font-semibold tabular-nums tracking-[-0.04em]">{needs}</p><p className={`${mono} text-[#11120f]/70`}>{t("founders.stream.actuallyNeededYou", "Actually needed you")}</p></div>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-[124px] sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pt-[140px]">
        <div>
          <Rv variant="drop"><Stamp color={YELLOW}><Rocket size={13} />{t("founders.hero.badge", "For founders")}</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.9rem,6.8vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.058em]">{t("founders.hero.titlePrefix", "Ship product. ")}<span className="hl">{t("founders.hero.titleHl", "Not support replies.")}</span></h1>
          </Rv>
          <Rv delay={170}><p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#11120f]/70">{t("founders.hero.subtitle", "You started a company to build something, not to answer “how do I reset my password?” forty times a week. Elpino takes the repeat questions and only taps you for the ones that truly need a founder.")}</p></Rv>
          <Rv delay={250}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>{t("founders.hero.ctaStart", "Start free")} <ArrowRight size={17} /></Link>
              <Link href="/pricing" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{t("founders.hero.ctaPricing", "See pricing")}</Link>
            </div>
            <p className="mt-4 text-sm text-[#11120f]/55">{t("founders.hero.freeNote", "Free plan: 100 AI messages a month. No card.")}</p>
          </Rv>
        </div>
        <Rv variant="deal" delay={200}><Stream t={t} /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- calculator

function Slider({ label, value, min, max, unit, onChange, color }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; color: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between"><span className="text-[15px] font-semibold">{label}</span><span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>{value}<span className="text-sm font-medium text-[#11120f]/50"> {unit}</span></span></span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" style={{ accentColor: color }} />
    </label>
  );
}

function Calculator({ t }: { t: T }) {
  const [q, setQ] = useState(30);
  const [m, setM] = useState(4);
  const [pct, setPct] = useState(60);
  const perDay = (q * m) / 60;
  const now = Math.min(8, perDay);
  const after = Math.min(8, perDay * (1 - pct / 100));
  const backWeek = ((perDay - perDay * (1 - pct / 100)) * 5);
  const bar = (support: number) => (
    <div className="flex h-12 overflow-hidden rounded-xl border-2 border-[#11120f]">
      <div className="grid place-items-center text-[12px] font-semibold text-white transition-[width] duration-500" style={{ width: `${(support / 8) * 100}%`, backgroundColor: ORANGE }}>{support >= 0.6 ? t("founders.calculator.supportLabel", "{h}h support").replace("{h}", support.toFixed(1)) : ""}</div>
      <div className="grid flex-1 place-items-center text-[12px] font-semibold text-white" style={{ backgroundColor: GREEN }}>{(8 - support) >= 1 ? t("founders.calculator.buildingLabel", "{h}h building").replace("{h}", (8 - support).toFixed(1)) : ""}</div>
    </div>
  );
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("founders.calculator.eyebrow", "Do the maths")} color={GREEN} title={<>{t("founders.calculator.titlePrefix", "Get your afternoons ")}<span className="hl">{t("founders.calculator.titleHl", "back.")}</span></>} sub={t("founders.calculator.subtitle", "Plug in your own numbers. The AI share is your guess, not a promise, and it depends on what's in your knowledge base.")} />
        <div className="mt-14 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Rv variant="up">
            <div className={`${card} space-y-7 bg-white p-6 sm:p-8`}>
              <Slider label={t("founders.calculator.sliderQuestions", "Customer questions a day")} value={q} min={5} max={200} unit="/day" onChange={setQ} color={BLUE} />
              <Slider label={t("founders.calculator.sliderMinutes", "Minutes to answer each")} value={m} min={1} max={15} unit={t("founders.calculator.unitMin", "min")} onChange={setM} color={PURPLE} />
              <Slider label={t("founders.calculator.sliderShare", "Share you guess the AI resolves")} value={pct} min={0} max={100} unit="%" onChange={setPct} color={GREEN} />
            </div>
          </Rv>
          <Rv variant="up" delay={120}>
            <div className={`${card} relative h-full overflow-hidden bg-[#fffdf5] p-6 sm:p-8`}>
              <p className={`${mono} text-[#11120f]/55`}>{t("founders.calculator.yourDay", "Your 8-hour day")}</p>
              <p className="mt-3 text-[13px] font-semibold text-[#11120f]/70">{t("founders.calculator.today", "Today")}</p>{bar(now)}
              <p className="mt-4 text-[13px] font-semibold text-[#11120f]/70">{t("founders.calculator.withElpinoAt", "With Elpino at {pct}%").replace("{pct}", String(pct))}</p>{bar(after)}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className={`${card} p-4 text-white`} style={{ backgroundColor: PURPLE }}><p className="text-4xl font-semibold tabular-nums tracking-[-0.04em]">{backWeek.toFixed(1)}h</p><p className={`${mono} text-white/80`}>{t("founders.calculator.backEachWeek", "Back each week")}</p></div>
                <div className={`${card} p-4`} style={{ backgroundColor: YELLOW }}><p className="text-4xl font-semibold tabular-nums tracking-[-0.04em]">{Math.round(q * (pct / 100))}</p><p className={`${mono} text-[#11120f]/70`}>{t("founders.calculator.chatsUntouched", "Chats a day, untouched")}</p></div>
              </div>
              {perDay > 8 && <p className="mt-4 text-[13px] text-[#11120f]/55">{t("founders.calculator.volumeNote", "At this volume, support alone is more than a full day.")}</p>}
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- setup

type SetupMeta = { icon: typeof Globe2; c: string };
type SetupText = { t: string; d: string; meter: string };

const SETUP_META: SetupMeta[] = [
  { icon: Globe2, c: BLUE },
  { icon: BookOpen, c: YELLOW },
  { icon: Zap, c: PURPLE },
  { icon: CreditCard, c: PINK },
];

const SETUP_EN: SetupText[] = [
  { t: "Paste your site", d: "Elpino crawls your pages, including JavaScript-built ones, and learns your product.", meter: "Reading your site" },
  { t: "Add the rest", d: "Upload docs, or write the policies that live only in your head.", meter: "Adding knowledge" },
  { t: "Drop in the widget", d: "One snippet and the chat is live on your site.", meter: "Installing widget" },
  { t: "Connect payments (optional)", d: "Stripe or Razorpay, so it can look up billing for you.", meter: "Connecting" },
];

function useSetup(t: T) {
  const text = tList<SetupText>(t, "founders.setup.steps", SETUP_EN);
  return SETUP_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Setup({ t }: { t: T }) {
  const SETUP = useSetup(t);
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % SETUP.length), 2600);
    return () => window.clearInterval(id);
  }, [reduced, SETUP.length]);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("founders.setup.eyebrow", "Setup")} color={BLUE} title={<>{t("founders.setup.titlePrefix", "Live before your ")}<span className="hl">{t("founders.setup.titleHl", "coffee cools.")}</span></>} sub={t("founders.setup.subtitle", "No engineers, no training period. Four steps, and the last is optional.")} />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {SETUP.map((s, k) => {
            const on = k === i;
            return (
              <button key={k} type="button" onClick={() => setI(k)} aria-pressed={on} className={`${card} p-5 text-left transition-all duration-500`} style={{ backgroundColor: on ? s.c : "#fff", color: on ? onDark(s.c) : INK, transform: on ? "translateY(-8px)" : "none" }}>
                <span className="grid size-12 place-items-center rounded-full border-2 border-[#11120f] bg-white"><s.icon size={22} color={INK} /></span>
                <p className={`${mono} mt-4 text-[10px] opacity-70`}>{t("founders.setup.stepLabel", "Step {n}").replace("{n}", String(k + 1))}</p>
                <p className="mt-1 text-xl font-semibold leading-snug tracking-tight">{s.t}</p>
                <p className="mt-2 text-[14.5px] leading-6 opacity-85">{s.d}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full border-2 border-[#11120f] bg-white/70">
                  <div key={on ? `on${i}` : "off"} className="h-full w-full" style={on ? { backgroundImage: `linear-gradient(${INK}, ${INK})`, backgroundRepeat: "no-repeat", animation: "elpino-hl 2.4s ease-out both" } : { backgroundColor: k < i ? INK : "transparent" }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- what reaches you

type ReachMeta = { c: string; icon: typeof Check };
type ReachText = { t: string; d: string };

const REACHES_META: ReachMeta[] = [
  { c: GREEN, icon: Check },
  { c: BLUE, icon: CreditCard },
  { c: YELLOW, icon: Headset },
  { c: ORANGE, icon: Ticket },
];

const REACHES_EN: ReachText[] = [
  { t: "Answers from your docs", d: "Handled. You never see it." },
  { t: "Payment and account lookups", d: "Handled with the tools you switched on." },
  { t: "\"Can I talk to someone?\"", d: "Asks the customer first, then alerts you and your team." },
  { t: "You're heads-down?", d: "After 90 seconds, a ticket is filed and the customer is told." },
];

function useReaches(t: T) {
  const text = tList<ReachText>(t, "founders.reaches.rules", REACHES_EN);
  return REACHES_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Reaches({ t }: { t: T }) {
  const rules = useReaches(t);
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Rv variant="drop"><Stamp color={ORANGE}><BellRing size={13} />{t("founders.reaches.badge", "The filter")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{t("founders.reaches.titlePrefix", "Only the ")}<span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>{t("founders.reaches.titleHl", "important stuff")}</span>{t("founders.reaches.titleSuffix", " reaches you.")}</h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[48ch] text-lg leading-8 text-white/65">{t("founders.reaches.subtitle", "You decide what the AI may do. Everything else is a clear rule: ask first, alert together, and never leave the customer hanging.")}</p></Rv>
        </div>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <Rv key={i} variant="up" delay={i * 90}>
              <div className={`${card} flex items-center gap-4 bg-[#fffdf5] p-4 text-[#11120f] transition duration-300 hover:translate-x-2`}>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: r.c }}><r.icon size={20} color={onDark(r.c)} /></span>
                <div><p className="text-[17px] font-semibold leading-snug">{r.t}</p><p className="text-[14.5px] text-[#11120f]/60">{r.d}</p></div>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- money

function Money({ t }: { t: T }) {
  const [refunds, setRefunds] = useState(false);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Heading left eyebrow={t("founders.money.eyebrow", "Billing questions")} color={PINK} title={<>{t("founders.money.titlePrefix", "It checks the real payment. ")}<span className="hl">{t("founders.money.titleHl", "You keep the keys.")}</span></>} sub={t("founders.money.subtitle", "Connect Stripe or Razorpay and the AI can look up payments and subscriptions, send receipts and payment links, and cancel a subscription when asked. Refunds stay off until you flip the switch.")} />
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} bg-[#fffdf5] p-5`}>
            <div className="space-y-2.5 text-[14.5px]">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-4 py-2.5 text-white" style={{ backgroundColor: PURPLE }}>{t("founders.money.chatAsk", "Can I get my last payment refunded?")}</div>
              <div key={String(refunds)} className="max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-white px-4 py-2.5" style={{ animation: "elpino-rv-pop .35s both" }}>{refunds ? t("founders.money.chatYes", "I've found your payment and started the refund. It usually reaches your account in 5 to 7 working days.") : t("founders.money.chatNo", "I can see the payment, but I can't refund it myself. Would you like me to connect you with our team?")}</div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-[#11120f] bg-white px-4 py-3.5">
              <span className="flex items-center gap-2.5 font-semibold"><Lock size={17} />{t("founders.money.toggleLabel", "Let the AI issue refunds")}</span>
              <button type="button" role="switch" aria-checked={refunds} aria-label={t("founders.money.toggleLabel", "Let the AI issue refunds")} onClick={() => setRefunds(!refunds)} className="relative h-7 w-12 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: refunds ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: refunds ? "calc(100% - 22px)" : "2px" }} /></button>
            </div>
            <p className="mt-3 text-center text-xs text-[#11120f]/50">{t("founders.money.toggleNote", "Off by default. Try the switch.")}</p>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- grows

type StageMeta = { icon: typeof Rocket; c: string };
type StageText = { t: string; d: string };

const STAGES_META: StageMeta[] = [
  { icon: Rocket, c: BLUE },
  { icon: UserPlus, c: GREEN },
  { icon: Users, c: ORANGE },
  { icon: Zap, c: PURPLE },
];

const STAGES_EN: StageText[] = [
  { t: "Just you", d: "Free plan, 100 AI messages a month, one inbox you rarely open." },
  { t: "First hire", d: "Invite them by email. They get Join alerts and take chats over from the AI." },
  { t: "A small team", d: "Assign conversations, share the inbox, add seats when you need them." },
  { t: "Scaling up", d: "Paid plans with a monthly AI credit, MCP tools for your own systems." },
];

function useStages(t: T) {
  const text = tList<StageText>(t, "founders.grows.stages", STAGES_EN);
  return STAGES_META.map((meta, i) => ({ ...meta, ...text[i] }));
}

function Grows({ t }: { t: T }) {
  const STAGES = useStages(t);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("founders.grows.eyebrow", "Room to grow")} color={PURPLE} title={<>{t("founders.grows.titlePrefix", "Starts with you. ")}<span className="hl">{t("founders.grows.titleHl", "Scales with your team.")}</span></>} />
        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-[38px] hidden h-0.5 md:block" style={{ backgroundImage: `linear-gradient(90deg, ${INK} 50%, transparent 50%)`, backgroundSize: "12px 2px" }} />
          <div className="grid gap-5 md:grid-cols-4">
            {STAGES.map((s, i) => (
              <Rv key={i} variant="up" delay={i * 100}>
                <div className="group flex flex-col items-center text-center">
                  <span className="relative z-10 grid size-[76px] place-items-center rounded-full border-2 border-[#11120f] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" style={{ backgroundColor: s.c }}><s.icon size={28} color="#fff" /></span>
                  <div className={`${card} mt-4 w-full bg-white p-4`} style={{ marginTop: 16 + i * 6 }}>
                    <p className={`${mono} text-[10px] text-[#11120f]/45`}>{t("founders.grows.stageLabel", "Stage {n}").replace("{n}", String(i + 1))}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">{s.t}</p>
                    <p className="mt-1.5 text-[14.5px] leading-6 text-[#11120f]/60">{s.d}</p>
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

// ------------------------------------------------------------------- faq

type Faq = { q: string; a: string };

const FAQS_EN: Faq[] = [
  { q: "How is this different from a generic chatbot widget?", a: "Elpino answers only from the knowledge you gave it, can look up real payments and use your own tools, verifies identity before touching anything personal, and hands over to a person with the full conversation when it can't help." },
  { q: "How fast can I set it up on my own?", a: "Most founders are live the same day: add your site or files, paste the widget snippet, and optionally connect Stripe or Razorpay." },
  { q: "How does it decide between answering and alerting me?", a: "If it can answer from your knowledge or a tool, it does. If it can't, it says so and asks the customer whether to connect them with your team. Only then are you and your team alerted." },
  { q: "Will it make things up?", a: "It answers from what you've approved, and a review pass checks drafts against tool results. When it doesn't know, it says so." },
  { q: "Is my Stripe or Razorpay account safe?", a: "Credentials are stored encrypted, and money-moving actions such as refunds are off unless you turn them on." },
  { q: "What happens when I hire a support person?", a: "Invite them and they'll get Join alerts, can take over chats from the AI, and can hand them back." },
];

function Faq({ t }: { t: T }) {
  const FAQS = tList<Faq>(t, "founders.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow={t("founders.faq.eyebrow", "Founder questions")} color={YELLOW} title={<>{t("founders.faq.titlePrefix", "Straight ")}<span className="hl">{t("founders.faq.titleHl", "answers.")}</span></>} />
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
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: ORANGE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Rocket size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-3xl text-[clamp(2.3rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.05em]">{t("founders.closing.title", "Go back to building.")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">{t("founders.closing.subtitle", "Start free, teach Elpino your product, and let it take the repeat questions.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>{t("founders.closing.ctaStart", "Start free")} <ArrowRight size={16} /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">{t("founders.closing.ctaMeetAgent", "Meet the AI agent")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function FoundersClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero t={t} />
      <Calculator t={t} />
      <Setup t={t} />
      <Reaches t={t} />
      <Money t={t} />
      <Grows t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
