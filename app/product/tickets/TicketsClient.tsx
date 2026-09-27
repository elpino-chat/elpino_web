"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BellRing, Bot, Check, CheckCheck, ClipboardCheck, ExternalLink, Headset, Inbox, Mail, Plug, Plus, Scissors,
  Ticket as TicketIcon, User, X,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// The Tickets page, as a claim-check: every handoff the AI can't finish, and
// every promise left open after a chat closes, becomes a stub with a short
// reference. Three sources (a teammate, the AI at handoff, the AI's review of
// a closed chat), three destinations (Trello, Asana, or the Issues page when
// no project tool is connected), a reference the customer can quote, and a
// tick-box to resolve it. All of that is real; the people are samples.

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

// -------------------------------------------------------------------- hero

const FIELDS_EN: [string, string][] = [
  ["Title", "Support escalation · Aisha Khan"],
  ["Reason", "Billing country change needs a person"],
  ["Summary", "Moved countries and wants the billing country on her account updated."],
  ["Customer", "Aisha Khan · aisha@example.com"],
  ["Conversation", "Linked, one tap to open"],
  ["Filed to", "Issues page"],
];

function PrintedTicket({ t }: { t: T }) {
  const fields = tList<[string, string]>(t, "tickets.printed.fields", FIELDS_EN);
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(fields.length + 1); return; }
    const wait = n === 0 ? 800 : n <= fields.length ? 650 : n === fields.length + 1 ? 2600 : 900;
    const id = window.setTimeout(() => setN((v) => (v >= fields.length + 2 ? 0 : v + 1)), wait);
    return () => window.clearTimeout(id);
  }, [n, reduced, fields.length]);
  const torn = n === fields.length + 2;
  const showRef = n >= fields.length;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col sm:flex-row" style={{ transform: "rotate(-2deg)" }}>
      <div className={`${card} relative flex-1 rounded-b-none bg-[#fffdf5] p-5 sm:rounded-b-[22px] sm:rounded-r-none`}>
        <div className="flex items-center justify-between">
          <Stamp color={ORANGE}><TicketIcon size={12} />{t("tickets.printed.ticketBadge", "Ticket")}</Stamp>
          <span className={`${mono} text-[#11120f]/45`}>{t("tickets.printed.filedAt", "Filed at AI handoff")}</span>
        </div>
        <div className="mt-4 min-h-[262px] space-y-2.5">
          {fields.slice(0, Math.min(n, fields.length)).map(([k, v]) => (
            <div key={k} className="border-b-2 border-dashed border-[#11120f]/15 pb-2" style={{ animation: "elpino-rv-up .4s both" }}>
              <p className={`${mono} text-[9px] text-[#11120f]/45`}>{k}</p>
              <p className="text-[14.5px] font-semibold leading-snug">{v}</p>
            </div>
          ))}
          {n === 0 && <p className="pt-24 text-center text-sm text-[#11120f]/40">{t("tickets.printed.printing", "Printing…")}</p>}
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <div aria-hidden="true" className="h-0 w-full border-t-2 border-dashed border-[#11120f] sm:h-full sm:w-0 sm:border-l-2 sm:border-t-0" />
        <Scissors size={16} aria-hidden="true" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-white sm:block" />
      </div>
      <div className={`${card} flex w-full flex-col items-center justify-center gap-2 rounded-t-none bg-[#ffd84d] p-5 transition-all duration-700 sm:w-[150px] sm:rounded-l-none sm:rounded-t-[22px]`} style={{ transform: torn ? "translate(26px, 22px) rotate(9deg)" : "none", opacity: showRef ? 1 : 0.4 }}>
        <p className={`${mono} text-[9px]`}>{t("tickets.printed.referenceLabel", "Reference")}</p>
        <p className="font-mono text-xl font-bold tracking-[0.08em]">7F3A9C21</p>
        <div aria-hidden="true" className="elpino-barcode h-10 w-full" />
        <p className="text-center text-[11px] leading-snug">{t("tickets.printed.referenceNote", "The customer can quote this")}</p>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-[124px] sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:pt-[140px]">
        <div>
          <Rv variant="drop"><Stamp color={YELLOW}><TicketIcon size={13} />{t("tickets.hero.badge", "Tickets")}</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.7rem,6.2vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              {t("tickets.hero.titlePrefix", "Every handoff leaves ")}<span className="hl">{t("tickets.hero.titleHl", "a stub.")}</span>
            </h1>
          </Rv>
          <Rv delay={170}><p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#11120f]/70">{t("tickets.hero.subtitle", "When the AI can't finish a job and nobody's free, Elpino doesn't shrug. It writes up a ticket with the reason and summary, sends it where your team works, and gives the customer a reference to quote.")}</p></Rv>
          <Rv delay={250}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>{t("tickets.hero.ctaStart", "Start free")} <ArrowRight size={17} /></Link>
              <Link href="/product/inbox" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{t("tickets.hero.ctaInbox", "See the inbox")}</Link>
            </div>
          </Rv>
        </div>
        <Rv variant="deal" delay={200}><PrintedTicket t={t} /></Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- three origins

type Origin = { tag: string; t: string; d: string; sample: [string, string] };
const ORIGINS_META = [
  { key: "manual", icon: User, c: BLUE, tilt: "-rotate-2" },
  { key: "escalation", icon: Headset, c: ORANGE, tilt: "rotate-1" },
  { key: "review", icon: ClipboardCheck, c: PURPLE, tilt: "-rotate-1" },
];
const ORIGINS_EN: Origin[] = [
  { tag: "Manual", t: "A teammate files it", d: "Spot something that needs follow-up? Turn the conversation into a ticket yourself.", sample: ["Invoice address change", "Meera asked us to update the billing address on her invoices."] },
  { tag: "Filed at AI handoff", t: "The AI files it at handoff", d: "When Elpino hands a chat over and nobody joins in time, it files a ticket with the reason and a summary.", sample: ["Support escalation · Aisha Khan", "Reason: billing country change needs a person."] },
  { tag: "Flagged by AI review", t: "The AI spots what's owed", d: "After a conversation closes, the AI reviews it. If your team still owes the customer something, it flags a ticket and says why.", sample: ["Follow up on refund request", "Reason: customer was told it would be checked; nothing was recorded."] },
];

function Origins({ t }: { t: T }) {
  const originsText = tList<Origin>(t, "tickets.origins.items", ORIGINS_EN);
  const origins = ORIGINS_META.map((meta, i) => ({ ...meta, ...originsText[i] }));
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("tickets.origins.eyebrow", "Where tickets come from")} color={ORANGE} title={<>{t("tickets.origins.titlePrefix", "Three ways a stub ")}<span className="hl">{t("tickets.origins.titleHl", "gets printed.")}</span></>} sub={t("tickets.origins.subtitle", "You never have to remember to write one down.")} />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {origins.map((o, i) => (
            <Rv key={o.key} variant="deal" delay={i * 110}>
              <div className={`${card} ${o.tilt} group relative h-full bg-white p-6 transition duration-300 hover:-translate-y-2 hover:rotate-0`}>
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: o.c }}><o.icon size={22} color="#fff" /></span>
                  <span className={`${mono} rounded-full border-2 border-[#11120f] px-2 py-1 text-[9px] text-white`} style={{ backgroundColor: o.c }}>{o.tag}</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold leading-snug tracking-tight">{o.t}</h3>
                <p className="mt-2 text-[15.5px] leading-7 text-[#11120f]/65">{o.d}</p>
                <div className="mt-5 rounded-xl border-2 border-dashed border-[#11120f]/40 bg-[#fffdf5] p-3">
                  <p className="text-[13.5px] font-semibold">{o.sample[0]}</p>
                  <p className="mt-0.5 text-[12.5px] text-[#11120f]/60">{o.sample[1]}</p>
                </div>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- anatomy

type Field = { k: string; v: string; why: string };
const ANATOMY_META = [BLUE, ORANGE, PURPLE, GREEN, PINK, YELLOW, BLUE, ORANGE];
const ANATOMY_EN: Field[] = [
  { k: "Title", v: "Support escalation · Aisha Khan", why: "Named after the customer, so you can spot it in a long list at a glance." },
  { k: "Reason", v: "Billing country change needs a person", why: "Why the AI handed over, or why its review flagged it. Nobody has to guess what went wrong." },
  { k: "Summary", v: "Moved countries, wants billing country updated.", why: "The AI writes a short summary of the chat so whoever picks it up starts informed." },
  { k: "Customer", v: "Aisha Khan · aisha@example.com", why: "Name and email if they gave one, so you know who to reply to." },
  { k: "Conversation", v: "Linked, opens the chat", why: "One tap to jump back to the full conversation, with every message." },
  { k: "Source", v: "Filed at AI handoff", why: "Shows whether a teammate, the AI at handoff, or the AI's review created it." },
  { k: "Filed to", v: "Trello, Asana or Issues page", why: "Where the ticket was sent. With no project tool connected, it lives on the Issues page." },
  { k: "Reference", v: "7F3A9C21", why: "A short code the customer can quote if they get in touch again." },
];

function Anatomy({ t }: { t: T }) {
  const fieldsText = tList<Field>(t, "tickets.anatomy.fields", ANATOMY_EN);
  const fields = ANATOMY_META.map((c, i) => ({ c, ...fieldsText[i] }));
  const reduced = useReduced();
  const [i, setI] = useState(1);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % fields.length), 3000);
    return () => window.clearTimeout(id);
  }, [i, paused, reduced, fields.length]);
  const a = fields[i];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("tickets.anatomy.eyebrow", "Anatomy of a ticket")} color={PURPLE} title={<>{t("tickets.anatomy.titlePrefix", "Everything your team needs, ")}<span className="hl">{t("tickets.anatomy.titleHl", "already written.")}</span></>} sub={t("tickets.anatomy.subtitle", "Tap a line to see why it's there.")} />
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className={`${card} bg-[#fffdf5] p-4 sm:p-5`} style={{ transform: "rotate(-1deg)" }}>
            {fields.map((f, k) => (
              <button key={f.k} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="flex w-full items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-all duration-300" style={{ borderColor: k === i ? INK : "transparent", backgroundColor: k === i ? f.c : "transparent", color: k === i ? onDark(f.c) : INK, transform: k === i ? "translateX(8px)" : "none" }}>
                <span className={`${mono} w-[100px] shrink-0 text-[9.5px] opacity-70`}>{f.k}</span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{f.v}</span>
              </button>
            ))}
          </div>
          <div key={a.k} className={`${card} p-6 lg:sticky lg:top-24`} style={{ backgroundColor: a.c, color: onDark(a.c), animation: "elpino-rv-deal .45s both" }}>
            <p className={`${mono} opacity-75`}>{t("tickets.anatomy.fieldLabel", "Field {n} of {total}").replace("{n}", String(i + 1)).replace("{total}", String(fields.length))}</p>
            <h3 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{a.k}</h3>
            <p className="mt-4 text-[17px] leading-8 opacity-95">{a.why}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 90s scrub

type ClockStep = { t: string; d: string };
const CLOCK_META = [
  { at: 0, icon: Headset, c: BLUE },
  { at: 1, icon: BellRing, c: ORANGE },
  { at: 90, icon: TicketIcon, c: PURPLE },
  { at: 91, icon: Mail, c: GREEN },
];
const CLOCK_EN: ClockStep[] = [
  { t: "Customer says yes to a person", d: "Elpino asks first, and only continues on a yes." },
  { t: "Every teammate gets a Join alert", d: "The whole team is asked at the same moment." },
  { t: "Nobody joined: ticket filed", d: "Title, reason, summary and a link to the chat." },
  { t: "Customer emailed, team notified", d: "The customer gets their reference by email." },
];

function Scrubber({ t }: { t: T }) {
  const clockText = tList<ClockStep>(t, "tickets.scrubber.clock", CLOCK_EN);
  const clock = CLOCK_META.map((meta, i) => ({ ...meta, ...clockText[i] }));
  const [tm, setTm] = useState(0);
  const R = 70;
  const C = 2 * Math.PI * R;
  const shown = Math.min(tm, 90);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow={t("tickets.scrubber.eyebrow", "The 90-second clock")} color={ORANGE} title={<>{t("tickets.scrubber.titlePrefix", "Drag time. ")}<span className="hl">{t("tickets.scrubber.titleHl", "Watch what happens.")}</span></>} sub={t("tickets.scrubber.subtitle", "If someone joins at any point, no ticket is needed. If the clock runs out, this is the chain.")} />
        <div className={`${card} mt-14 grid gap-8 bg-white p-6 sm:p-8 md:grid-cols-[220px_1fr]`}>
          <div className="flex flex-col items-center">
            <div className="relative size-[190px]">
              <svg viewBox="0 0 180 180" className="size-full -rotate-90" aria-hidden="true">
                <circle cx="90" cy="90" r={R} fill="none" stroke="#e7e2d6" strokeWidth="16" />
                <circle cx="90" cy="90" r={R} fill="none" stroke={tm >= 90 ? PURPLE : ORANGE} strokeWidth="16" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - shown / 90)} style={{ transition: "stroke-dashoffset .15s" }} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-5xl font-semibold tabular-nums tracking-[-0.05em]">{shown}</p><p className={`${mono} text-[#11120f]/45`}>{t("tickets.scrubber.seconds", "seconds")}</p></div></div>
            </div>
            <label className="mt-6 w-full text-center"><span className={`${mono} text-[#11120f]/55`}>{t("tickets.scrubber.dragMe", "Drag me")}</span>
              <input type="range" min={0} max={91} value={tm} onChange={(e) => setTm(Number(e.target.value))} aria-label={t("tickets.scrubber.secondsAriaLabel", "Seconds since the alert")} className="mt-2 w-full accent-[#fc7b33]" />
            </label>
          </div>
          <ol className="space-y-3">
            {clock.map((c) => {
              const on = tm >= c.at;
              return (
                <li key={c.t} className="flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-300" style={{ borderColor: on ? INK : "#11120f22", backgroundColor: on ? c.c : "#fff", color: on ? "#fff" : "#11120f66", transform: on ? "translateX(6px)" : "none" }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[#11120f] bg-white"><c.icon size={20} color={on ? INK : "#11120f55"} /></span>
                  <span><span className="block text-[17px] font-semibold leading-snug">{c.t}</span><span className="block text-[14px] opacity-85">{c.d}</span></span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- connect

type Step = { t: string; d: string };
const CONNECT_META = [
  { icon: Plug, c: BLUE },
  { icon: TicketIcon, c: ORANGE },
  { icon: CheckCheck, c: GREEN },
];
const CONNECT_EN: Step[] = [
  { t: "Connect Trello or Asana", d: "Add your project tool from your workspace settings." },
  { t: "Tickets go there", d: "Each new ticket becomes a card or task, already written." },
  { t: "Still tracked in Elpino", d: "The Issues page keeps the list and lets you tick things off." },
];

function Connect({ t }: { t: T }) {
  const stepsText = tList<Step>(t, "tickets.connect.steps", CONNECT_EN);
  const steps = CONNECT_META.map((meta, i) => ({ ...meta, ...stepsText[i] }));
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("tickets.connect.eyebrow", "Set up in a minute")} color={GREEN} title={<>{t("tickets.connect.titlePrefix", "Plug it into ")}<span className="hl">{t("tickets.connect.titleHl", "where you work.")}</span></>} sub={t("tickets.connect.subtitle", "Optional. Skip it and tickets simply live on the Issues page.")} />
        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map((s, i) => (
            <div key={s.t} className="contents">
              <Rv variant="up" delay={i * 110}>
                <div className={`${card} h-full bg-white p-6 transition duration-300 hover:-translate-y-1.5`}>
                  <span className="grid size-12 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: s.c }}><s.icon size={22} color="#fff" /></span>
                  <p className={`${mono} mt-4 text-[#11120f]/45`}>{t("tickets.connect.stepLabel", "Step {n}").replace("{n}", String(i + 1))}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight">{s.t}</p>
                  <p className="mt-2 text-[15.5px] leading-7 text-[#11120f]/65">{s.d}</p>
                </div>
              </Rv>
              {i < 2 && <div aria-hidden="true" className="hidden items-center md:flex"><ArrowRight size={26} /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- review scan

type ChatLine = [string, string];
const CHAT_EN: ChatLine[] = [
  ["cust", "Hi, my order arrived damaged."],
  ["agent", "So sorry about that! I'll check on the refund and get back to you."],
  ["cust", "Great, thanks."],
  ["agent", "Anything else I can help with?"],
  ["cust", "No, that's all."],
];

function ReviewScan({ t }: { t: T }) {
  const chat = tList<ChatLine>(t, "tickets.reviewScan.chat", CHAT_EN);
  const bullets = tList<string>(t, "tickets.reviewScan.bullets", [
    "Catches “I'll check and get back to you”",
    "Says why it flagged it, so you can judge quickly",
    "Marked as flagged by AI review on the Issues page",
  ]);
  const reduced = useReduced();
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) { setP(chat.length + 1); return; }
    const id = window.setTimeout(() => setP((v) => (v >= chat.length + 2 ? 0 : v + 1)), p === 0 ? 1200 : p <= chat.length ? 750 : p === chat.length + 1 ? 4200 : 1200);
    return () => window.clearTimeout(id);
  }, [p, reduced, chat.length]);
  const scanning = p >= 1 && p <= chat.length;
  const flagged = p > chat.length;
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Rv variant="drop"><Stamp color={PURPLE}><ClipboardCheck size={13} />{t("tickets.reviewScan.badge", "AI review")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("tickets.reviewScan.titlePrefix", "After the chat closes, ")}<span className="hl">{t("tickets.reviewScan.titleHl", "Elpino re-reads it.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[46ch] text-lg leading-8 text-[#11120f]/65">{t("tickets.reviewScan.subtitle", "Chats end politely while promises stay open. When a conversation closes, the AI reviews it, and if your team still owes the customer something, it flags a ticket and tells you why.")}</p></Rv>
          <Rv delay={220}>
            <ul className="mt-7 space-y-3 text-[16px]">
              {bullets.map((x) => <li key={x} className="flex items-start gap-3"><Check size={18} color={GREEN} strokeWidth={3} className="mt-1 shrink-0" />{x}</li>)}
            </ul>
          </Rv>
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} relative overflow-hidden bg-[#fffdf5] p-5`}>
            <div className="flex items-center justify-between"><span className={`${mono} text-[#11120f]/55`}>{t("tickets.reviewScan.closedConvo", "Closed conversation")}</span><span className={`${mono} rounded-full border-2 border-[#11120f] px-2 py-0.5 text-[9px] text-white`} style={{ backgroundColor: flagged ? ORANGE : scanning ? PURPLE : "#8a8676" }}>{flagged ? t("tickets.reviewScan.statusFlagged", "Flagged") : scanning ? t("tickets.reviewScan.statusReviewing", "Reviewing…") : t("tickets.reviewScan.statusResolved", "Resolved")}</span></div>
            <div className="mt-4 space-y-2.5 text-[14px]">
              {chat.map(([who, text], k) => {
                const isPromise = k === 1;
                const lit = scanning && p - 1 === k;
                return (
                  <div key={k} className={`max-w-[88%] rounded-2xl border-2 border-[#11120f] px-3.5 py-2.5 transition-all duration-300 ${who === "cust" ? "rounded-bl-sm bg-white" : "ml-auto rounded-br-sm"}`} style={{ backgroundColor: flagged && isPromise ? YELLOW : lit ? "#e4dffa" : who === "cust" ? "#fff" : "#f1f1ee", transform: lit || (flagged && isPromise) ? "scale(1.03)" : "none" }}>{text}</div>
                );
              })}
            </div>
            {flagged && (
              <div className="mt-4 rounded-xl border-2 border-[#11120f] p-3.5 text-white" style={{ backgroundColor: PURPLE, animation: "elpino-rv-pop .4s both" }}>
                <p className={`${mono} flex items-center gap-1.5 text-[10px] text-white/80`}><TicketIcon size={12} />{t("tickets.reviewScan.flaggedTicketLabel", "Ticket · Flagged by AI review")}</p>
                <p className="mt-1.5 text-[14.5px] font-semibold">{t("tickets.reviewScan.flaggedTitle", "Follow up on refund request · Tom Becker")}</p>
                <p className="mt-1 text-[13px] text-white/85">{t("tickets.reviewScan.flaggedDesc", "Customer was told a refund would be checked; nothing was recorded afterwards.")}</p>
              </div>
            )}
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- destinations

type Dest = { key: string; label: string; note: string; cols: [string, string, string] };
const DESTS_META = [
  { key: "trello", c: BLUE },
  { key: "asana", c: PINK },
  { key: "issues", c: GREEN },
];
const DESTS_EN: Dest[] = [
  { key: "trello", label: "Trello", note: "Becomes a card in your Trello board.", cols: ["To do", "Doing", "Done"] },
  { key: "asana", label: "Asana", note: "Becomes a task in your Asana project.", cols: ["Not started", "In progress", "Complete"] },
  { key: "issues", label: "Issues page", note: "No project tool connected? It lives on your Issues page, no setup needed.", cols: ["Open", "", "Resolved"] },
];

function Destinations({ t }: { t: T }) {
  const destsText = tList<Dest>(t, "tickets.destinations.items", DESTS_EN);
  const dests = DESTS_META.map((meta, i) => ({ ...meta, ...destsText[i] }));
  const [i, setI] = useState(0);
  const d = dests[i];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("tickets.destinations.eyebrow", "Where it lands")} color={BLUE} title={<>{t("tickets.destinations.titlePrefix", "Sent to the tool ")}<span className="hl">{t("tickets.destinations.titleHl", "your team already uses.")}</span></>} sub={t("tickets.destinations.subtitle", "Connect Trello or Asana and tickets go straight there. Connect nothing and they're still safe on the Issues page.")} />
        <div className="mx-auto mt-12 flex w-fit rounded-full border-2 border-[#11120f] bg-[#fff8ec] p-1">
          {dests.map((x, k) => <button key={x.key} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={k === i ? { backgroundColor: x.c, color: "#fff" } : undefined}>{x.label}</button>)}
        </div>
        <div key={d.key} className={`${card} mt-8 overflow-hidden bg-[#fffdf5]`} style={{ animation: "elpino-rv-deal .5s both" }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#11120f] px-5 py-3 text-white" style={{ backgroundColor: d.c }}>
            <span className="font-semibold">{d.label}</span><span className="text-[13.5px] opacity-90">{d.note}</span>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            {d.cols.map((c, k) => (
              <div key={k} className="min-h-[150px] rounded-xl border-2 border-dashed border-[#11120f]/30 p-3" style={{ opacity: c ? 1 : 0.4 }}>
                <p className={`${mono} text-[10px] text-[#11120f]/50`}>{c || "·"}</p>
                {k === 0 && (
                  <div className="mt-3 rounded-lg border-2 border-[#11120f] bg-white p-3" style={{ animation: "elpino-rv-drop .6s .2s both" }}>
                    <p className="text-[13.5px] font-semibold leading-snug">{t("tickets.destinations.cardTitle", "Support escalation · Aisha Khan")}</p>
                    <p className="mt-1 text-[12px] text-[#11120f]/55">{t("tickets.destinations.cardReason", "Reason: billing country change needs a person")}</p>
                    <span className={`${mono} mt-2 inline-block rounded-full border-2 border-[#11120f] bg-[#ffe6d6] px-2 py-0.5 text-[8.5px]`}>{t("tickets.destinations.fromElpino", "From Elpino")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- customer side

function CustomerSide({ t }: { t: T }) {
  const bullets = tList<string>(t, "tickets.customerSide.bullets", [
    "The customer is told what happens next",
    "They get an email with their reference",
    "Every teammate is notified of the ticket",
  ]);
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Rv variant="drop"><Stamp color={GREEN}><Mail size={13} />{t("tickets.customerSide.badge", "The claim check")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("tickets.customerSide.titlePrefix", "Customers know ")}<span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>{t("tickets.customerSide.titleHl", "they weren't forgotten.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[48ch] text-lg leading-8 text-white/65">{t("tickets.customerSide.subtitle", "If nobody could join in time, Elpino tells the customer honestly, emails them so it isn't lost, and gives them a short reference to quote. Your whole team is notified of the new ticket too.")}</p></Rv>
          <Rv delay={220}>
            <ul className="mt-7 space-y-3 text-[16px]">
              {bullets.map((x) => <li key={x} className="flex items-start gap-3"><Check size={18} color={YELLOW} strokeWidth={3} className="mt-1 shrink-0" />{x}</li>)}
            </ul>
          </Rv>
        </div>
        <Rv variant="deal" delay={100}>
          <div className="space-y-4">
            <div className={`${card} bg-[#fffdf5] p-5 text-[#11120f]`}>
              <div className="flex items-center gap-2.5"><Bot size={18} /><span className={`${mono} text-[#11120f]/55`}>{t("tickets.customerSide.inChat", "In the chat")}</span></div>
              <div className="mt-3 rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-white px-4 py-3 text-[14.5px] leading-6">{t("tickets.customerSide.chatMsgPrefix", "Our team is tied up right now, so I've opened a ticket. Your reference is ")}<b className="font-mono">7F3A9C21</b>{t("tickets.customerSide.chatMsgSuffix", ". You'll hear back by email within 24 hours.")}</div>
            </div>
            <div className={`${card} bg-white p-5 text-[#11120f]`}>
              <div className="flex items-center gap-2.5"><Mail size={18} /><span className={`${mono} text-[#11120f]/55`}>{t("tickets.customerSide.inInbox", "In their inbox")}</span></div>
              <p className="mt-3 text-[15px] font-semibold">{t("tickets.customerSide.emailSubject", "We've got your request")}</p>
              <p className="mt-1 text-[14px] leading-6 text-[#11120f]/65">{t("tickets.customerSide.emailBodyPrefix", "Ticket ")}<b className="font-mono">7F3A9C21</b>{t("tickets.customerSide.emailBodySuffix", " is with our team. Reply to this email if you have anything to add.")}</p>
            </div>
            <div className={`${card} flex items-center gap-3 p-4 text-white`} style={{ backgroundColor: ORANGE }}><BellRing size={20} /><p className="text-[14.5px] font-semibold">{t("tickets.customerSide.teamNotified", "Team notified: new ticket from Aisha Khan")}</p></div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- issues board

type Row = { t: string; where: string; who?: string; reason?: string; done: boolean };
const ROWS_EN: Row[] = [
  { t: "Support escalation · Aisha Khan", who: "Filed at AI handoff", where: "Not sent to a project tool", done: false },
  { t: "Follow up on refund request · Tom Becker", who: "Flagged by AI review", where: "Trello ticket", reason: "Customer was told a refund would be checked; nothing was recorded afterwards.", done: false },
  { t: "Invoice address change · Meera Iyer", where: "Asana ticket", done: false },
  { t: "Support escalation · Ravi Menon", who: "Filed at AI handoff", where: "Not sent to a project tool", done: true },
];

function IssuesBoard({ t }: { t: T }) {
  const rowsText = tList<Row>(t, "tickets.issuesBoard.rows", ROWS_EN);
  const [rows, setRows] = useState(rowsText);
  useEffect(() => setRows(rowsText), [rowsText]);
  const open = rows.filter((r) => !r.done).length;
  const openWord = t("tickets.issuesBoard.openWord", "open");
  const resolvedWord = t("tickets.issuesBoard.resolvedWord", "resolved");
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <Rv variant="drop"><Stamp color={YELLOW}><CheckCheck size={13} />{t("tickets.issuesBoard.badge", "The Issues page")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("tickets.issuesBoard.titlePrefix", "One list. ")}<span className="hl">{t("tickets.issuesBoard.titleHl", "Tick it off.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[44ch] text-lg leading-8 text-[#11120f]/65">{t("tickets.issuesBoard.subtitle", "Every ticket shows where it came from and where it was sent. The AI's review even tells you why it flagged one. Click a box to mark it resolved.")}</p></Rv>
          <Rv delay={220}><p className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#fff8ec] px-4 py-2 text-[14px] font-semibold"><span className="tabular-nums">{open}</span> {openWord} · <span className="tabular-nums">{rows.length - open}</span> {resolvedWord}</p></Rv>
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} overflow-hidden bg-[#262626] text-white`}>
            <div className="border-b border-white/10 px-5 py-4"><p className="text-2xl">{t("tickets.issuesBoard.panelTitle", "Issues")}</p><p className="text-[12.5px] text-white/45">{t("tickets.issuesBoard.panelSubtitle", "Tickets created from support conversations.")}</p></div>
            {rows.map((r, i) => (
              <div key={r.t} className="flex items-start gap-3 border-b border-white/[0.07] p-4 last:border-0">
                <button type="button" onClick={() => setRows(rows.map((x, k) => (k === i ? { ...x, done: !x.done } : x)))} aria-pressed={r.done} aria-label={r.done ? t("tickets.issuesBoard.markUnresolved", "Mark as unresolved") : t("tickets.issuesBoard.markResolved", "Mark as resolved")} className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors" style={r.done ? { backgroundColor: "#35b92c", borderColor: "#35b92c" } : { borderColor: "#ffffff55" }}>
                  {r.done && <Check size={13} color="#000" strokeWidth={3} />}
                </button>
                <TicketIcon size={18} className="mt-0.5 shrink-0 text-white/40" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[14px] ${r.done ? "text-white/45 line-through" : "text-white/90"}`}>{r.t}</p>
                  <p className="mt-1 text-[12px] text-white/40">{[r.who, r.where, r.done ? resolvedWord : null].filter(Boolean).join(" · ")}</p>
                  {r.reason && <p className="mt-1 text-[12px] text-white/60">{r.reason}</p>}
                </div>
                <ExternalLink size={14} className="mt-1 shrink-0 text-white/30" aria-hidden="true" />
              </div>
            ))}
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- lifecycle

type LifeStep = { t: string; d: string };
const LIFE_META = [
  { icon: Inbox, c: BLUE },
  { icon: BellRing, c: ORANGE },
  { icon: TicketIcon, c: PURPLE },
  { icon: Mail, c: GREEN },
  { icon: Check, c: PINK },
];
const LIFE_EN: LifeStep[] = [
  { t: "Customer asks for a person", d: "The AI asks first, then alerts the team." },
  { t: "90 seconds, nobody joins", d: "Everyone had a chance to take the chat." },
  { t: "Ticket filed", d: "Title, reason, summary and a link back to the chat." },
  { t: "Customer emailed", d: "With their reference, so nothing feels lost." },
  { t: "Worked and resolved", d: "Your team ticks it off when it's done." },
];

function Lifecycle({ t }: { t: T }) {
  const lifeText = tList<LifeStep>(t, "tickets.lifecycle.items", LIFE_EN);
  const life = LIFE_META.map((meta, i) => ({ ...meta, ...lifeText[i] }));
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % life.length), 2000);
    return () => window.clearInterval(id);
  }, [reduced, life.length]);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("tickets.lifecycle.eyebrow", "Life of a ticket")} color={PURPLE} title={<>{t("tickets.lifecycle.titlePrefix", "From “can I talk to someone?” ")}<span className="hl">{t("tickets.lifecycle.titleHl", "to done.")}</span></>} />
        <div className="mt-16 grid gap-4 md:grid-cols-5">
          {life.map((l, k) => {
            const on = k <= i;
            return (
              <div key={l.t} className="relative">
                <div className={`${card} h-full p-5 text-center transition-all duration-500`} style={{ backgroundColor: k === i ? l.c : "#fff", color: k === i ? "#fff" : INK, transform: k === i ? "translateY(-8px)" : "none", opacity: on ? 1 : 0.5 }}>
                  <span className="mx-auto grid size-12 place-items-center rounded-full border-2 border-[#11120f] bg-white"><l.icon size={22} color={INK} /></span>
                  <p className={`${mono} mt-3 text-[10px] opacity-70`}>{t("tickets.lifecycle.stepLabel", "Step {n}").replace("{n}", String(k + 1))}</p>
                  <p className="mt-1 text-lg font-semibold leading-snug tracking-tight">{l.t}</p>
                  <p className="mt-2 text-[14px] leading-6 opacity-80">{l.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ compare

const COMPARE_EN: [string, string][] = [
  ["“Someone will get back to you”, and then silence", "A ticket with a reference the customer can quote"],
  ["The team copies details into another tool by hand", "Reason, summary and chat link arrive already written"],
  ["Promises made in chat get forgotten", "An AI review flags what your team still owes after a chat closes"],
  ["No idea whether anyone's on it", "Tick-box resolved state and where it was sent, in one list"],
];

function Compare({ t }: { t: T }) {
  const rows = tList<[string, string]>(t, "tickets.compare.rows", COMPARE_EN);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow={t("tickets.compare.eyebrow", "Before & after")} color={ORANGE} title={<>{t("tickets.compare.titlePrefix", "No more ")}<span className="hl">{t("tickets.compare.titleHl", "dropped promises.")}</span></>} />
        <div className="mt-14 space-y-3">
          <div className="hidden grid-cols-2 gap-4 md:grid"><p className={`${mono} px-2 text-[#11120f]/50`}>{t("tickets.compare.headerA", "Without tickets")}</p><p className={`${mono} px-2 text-[#11120f]/50`}>{t("tickets.compare.headerB", "With Elpino")}</p></div>
          {rows.map(([a, b], i) => (
            <Rv key={a} variant="up" delay={i * 60}>
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div className={`${card} flex items-center gap-3 bg-[#fff8ec] p-4 text-[#11120f]/60`}><X size={18} color={PINK} strokeWidth={3} className="shrink-0" /><span className="line-through decoration-[#d9508a]/50 decoration-2">{a}</span></div>
                <div className={`${card} flex items-center gap-3 p-4 font-semibold text-white`} style={{ backgroundColor: [BLUE, PURPLE, GREEN, ORANGE][i] }}><Check size={18} strokeWidth={3} className="shrink-0" />{b}</div>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------- faq

const FAQS_EN: [string, string][] = [
  ["When does Elpino create a ticket?", "When it hands a conversation over and nobody joins within 90 seconds, and when its review of a closed conversation finds something your team still owes. Teammates can also file one manually."],
  ["Where do tickets go?", "To Trello or Asana if you've connected one. If not, they live on your Issues page, so nothing is lost."],
  ["What's in a ticket?", "A title, the reason, a short summary, the customer's details, and a link back to the conversation."],
  ["Does the customer find out?", "Yes. They're told in the chat, get an email, and are given a short reference they can quote."],
  ["Can I mark a ticket resolved?", "Yes, tick it off from the Issues page."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "tickets.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow={t("tickets.faq.eyebrow", "Questions")} color={YELLOW} title={<>{t("tickets.faq.titlePrefix", "Good to ")}<span className="hl">{t("tickets.faq.titleHl", "know.")}</span></>} />
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
    <section className="bg-white px-5 pb-24 pt-8 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: ORANGE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
          <TicketIcon size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">{t("tickets.closing.title", "Let nothing slip through.")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">{t("tickets.closing.subtitle", "Start free and Elpino will write the tickets for you.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>{t("tickets.closing.ctaStart", "Start free")} <ArrowRight size={16} /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">{t("tickets.closing.ctaMeetAgent", "Meet the AI agent")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function TicketsClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero t={t} />
      <Origins t={t} />
      <Anatomy t={t} />
      <Scrubber t={t} />
      <Destinations t={t} />
      <Connect t={t} />
      <ReviewScan t={t} />
      <CustomerSide t={t} />
      <IssuesBoard t={t} />
      <Lifecycle t={t} />
      <Compare t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
