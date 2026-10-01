"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart2, BellRing, Bot, Check, CheckCheck, Clock3, FileText, Filter, Globe2, Headset, Inbox, KeyRound,
  LayoutGrid, LockKeyhole, Mail, MapPin, MessageCircle, Monitor, Plus, Search, Settings, ShieldCheck, Ticket, Undo2, UserCheck, Users, X,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// The Inbox page, told as one conversation's journey through the desk:
// AI answers → the customer asks for a person → the whole team is alerted →
// someone joins → it can be handed back → resolved. Everything shown is in
// the product (Join / Take over, hand back to the AI, resolve and reopen,
// visitor location, device and verified badge, secure requests, email replies
// to visitors who left). No screenshots: the desk is drawn in code.

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — same convention as the other product
 * pages: t()'s traversal really does hand back the raw JSON value (array
 * or not) even though its declared return type is `string`. Falls back to
 * the English array wholesale when the locale hasn't got this key yet.
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

// -------------------------------------------------------------------- desk

type Stage = { key: string; label: string; badge: string; banner: string };
const STAGES_META = [
  { color: PURPLE, icon: Bot },
  { color: ORANGE, icon: BellRing },
  { color: GREEN, icon: UserCheck },
  { color: BLUE, icon: Undo2 },
  { color: PINK, icon: Check },
];
const STAGES_EN: Stage[] = [
  { key: "ai", label: "AI answers", badge: "AI", banner: "Elpino is handling this conversation" },
  { key: "ask", label: "Needs a person", badge: "Needs human", banner: "Every teammate got a Join alert. 90 seconds to jump in" },
  { key: "join", label: "Teammate joins", badge: "Priya", banner: "Priya joined. The alert cleared for everyone" },
  { key: "back", label: "Hand back", badge: "AI", banner: "Priya handed the chat back to Elpino" },
  { key: "done", label: "Resolved", badge: "Resolved", banner: "Resolved. Reopen any time if they write back" },
];

type Line = { at: number; from: "you" | "ai" | "team" | "sys"; text: string };
const LINES_EN: Line[] = [
  { at: 0, from: "you", text: "Hi, I moved countries. Can you update the billing country on my account?" },
  { at: 1, from: "ai", text: "I can't change billing details myself. Would you like me to connect you with our team?" },
  { at: 1, from: "you", text: "Yes please" },
  { at: 2, from: "sys", text: "Priya joined the chat" },
  { at: 2, from: "team", text: "Hi! I've got this. I've updated your billing country." },
  { at: 3, from: "sys", text: "Priya handed the chat back to Elpino" },
  { at: 3, from: "ai", text: "All set. Anything else I can help with?" },
  { at: 4, from: "you", text: "That's all, thanks!" },
  { at: 4, from: "sys", text: "Conversation resolved" },
];

const RAIL_META = [LayoutGrid, Inbox, BarChart2, Users, FileText, Settings];
const RAIL_EN = ["Space", "Inbox", "Analytics", "Contacts", "Knowledge", "Settings"];

type ListItem = { name: string; date: string; prev: string; color: string; live?: boolean };
const LIST_EN: ListItem[] = [
  { name: "Harnoor Singh", date: "21 Sept", prev: "I can't share anyone's IP address", color: "#3f7fd0" },
  { name: "Aisha Khan", date: "Today", prev: "", color: "#b8763a", live: true },
  { name: "Tom Becker", date: "19 Sept", prev: "Widget not loading on checkout", color: "#3f9c7a" },
  { name: "Meera Iyer", date: "18 Sept", prev: "Move the team to annual?", color: "#5a62b8" },
];

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase();
}

function Desk({ t }: { t: T }) {
  const stagesText = tList<Stage>(t, "inbox.desk.stages", STAGES_EN);
  const stages = STAGES_META.map((meta, i) => ({ ...meta, ...stagesText[i] }));
  const lines = tList<Line>(t, "inbox.desk.lines", LINES_EN);
  const rail = tList<string>(t, "inbox.desk.rail", RAIL_EN);
  const list = tList<ListItem>(t, "inbox.desk.list", LIST_EN);

  const reduced = useReduced();
  const [s, setS] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setS((v) => (v + 1) % stages.length), 3800);
    return () => window.clearTimeout(id);
  }, [s, paused, reduced, stages.length]);
  const st = stages[s];
  const visibleLines = lines.filter((l) => l.at <= s);
  const preview = [...visibleLines].reverse().find((l) => l.from !== "sys")?.text ?? "";
  const subtitle = s === 2 ? t("inbox.desk.priyaReplying", "Priya is replying") : s === 4 ? t("inbox.desk.resolvedLabel", "Resolved") : t("inbox.desk.aiReplying", "Elpino is replying, you're just viewing");
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [s]);
  const composer = s === 2 ? "reply" : s === 4 ? "done" : "locked";

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {stages.map((x, i) => (
          <button key={x.key} type="button" onClick={() => setS(i)} aria-pressed={i === s} className="inline-flex items-center gap-1.5 rounded-full border border-black/25 px-3.5 py-2 text-[13px] font-medium transition hover:border-black/60" style={i === s ? { backgroundColor: INK, color: "#fff", borderColor: INK } : undefined}>
            <x.icon size={14} />{i + 1}. {x.label}
          </button>
        ))}
      </div>

      <div className={`${card} overflow-hidden bg-[#262626] text-white`}>
        <div className="grid h-[540px] md:grid-cols-[72px_290px_1fr] lg:grid-cols-[72px_290px_1fr_250px]">
          {/* rail */}
          <div className="hidden flex-col items-center gap-5 border-r border-[#3a3a3a] py-5 md:flex">
            {rail.map((label, i) => {
              const Icon = RAIL_META[i] ?? LayoutGrid;
              const active = i === 1;
              return (
                <div key={label} className={`relative flex flex-col items-center gap-1 text-[10px] ${active ? "text-white" : "text-white/55"}`}>
                  <Icon size={19} />
                  {i === 1 && <span className="absolute -right-2 -top-1.5 grid size-4 place-items-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: GREEN }}>5</span>}
                  {label}
                </div>
              );
            })}
            <span className="mt-auto grid size-9 place-items-center rounded-full text-[11px] font-bold text-[#11120f]" style={{ backgroundColor: "#a9b8ff" }}>JA</span>
          </div>

          {/* list */}
          <div className="hidden min-h-0 flex-col border-r border-[#3a3a3a] md:flex">
            <div className="flex gap-5 px-4 pt-4 text-[13px]"><span className="text-white/55">{t("inbox.desk.teamInbox", "Team Inbox")}</span><span className="border-b-2 border-white pb-1.5 font-medium">{t("inbox.desk.aiAssist", "AI Assist")} <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: GREEN }}>5</span></span></div>
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-[#4a4a4a] px-3 py-2 text-[12px] text-white/50"><Search size={13} />{t("inbox.desk.searchPlaceholder", "Search conversations")}<Filter size={13} className="ml-auto" /></div>
            <div className="mx-4 mt-3 flex gap-4 border-b border-[#3a3a3a] pb-2.5 text-[12px] text-white/50">
              {tList<string>(t, "inbox.filters", ["All", "Unread", "Read", "Resolved"]).map((f, i) => <span key={f} className={i === 0 ? "font-semibold text-white" : ""}>{f}</span>)}
            </div>
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2 [scrollbar-width:thin]">
              {list.map((c) => (
                <div key={c.name} className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-500 ${c.live ? "bg-[#3a3a3a]" : ""}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: c.color }}>{initials(c.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className="truncate text-[13.5px] font-semibold">{c.name}</span><span className="shrink-0 text-[10px] text-white/45">{c.date}</span></span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-white/55">
                      {c.live ? <span key={st.badge + s} className={`${mono} shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px]`} style={{ backgroundColor: st.color, color: onDark(st.color), animation: "elpino-slam .4s both" }}>{st.badge}</span> : <CheckCheck size={12} className="shrink-0" />}
                      <span className="truncate">{c.live ? preview : c.prev}</span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* thread */}
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="flex items-center gap-3 border-b border-[#3a3a3a] px-4 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: "#b8763a" }}>AK</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[15px] font-semibold">Aisha Khan <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "#1aa37a33", color: "#5fe0b4" }}><ShieldCheck size={10} />{t("inbox.desk.verified", "Verified")}</span></p>
                <p className="truncate text-[11.5px] text-white/55">{subtitle}</p>
              </div>
              {s === 2 ? <span className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold" style={{ backgroundColor: "#1aa37a33", color: "#5fe0b4", animation: "elpino-slam .4s both" }}><Check size={14} />{t("inbox.desk.joined", "Joined")}</span>
                : <span className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold" style={s === 1 ? { backgroundColor: YELLOW, color: INK, animation: "elpino-ring 1.4s ease-out infinite" } : { backgroundColor: "#3a3a3a" }}><MessageCircle size={14} />{t("inbox.desk.join", "Join")}</span>}
            </div>
            <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 text-[13.5px] [scrollbar-width:thin]"><div className="mt-auto flex flex-col gap-3">
              {visibleLines.map((l, i) => l.from === "sys" ? (
                <div key={`s${i}`} className="flex items-center gap-3 text-[11.5px] text-white/55" style={{ animation: "elpino-rv-pop .35s both" }}><span className="h-px flex-1 bg-[#3f3f3f]" />{l.text}<span className="h-px flex-1 bg-[#3f3f3f]" /></div>
              ) : l.from === "you" ? (
                <div key={i} className="flex items-end gap-2" style={{ animation: "elpino-rv-pop .35s both" }}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-bold" style={{ backgroundColor: "#b8763a" }}>AK</span>
                  <div className="max-w-[80%] rounded-2xl bg-[#363636] px-3.5 py-2.5 leading-[1.5]">{l.text}</div>
                </div>
              ) : (
                <div key={i} className="flex flex-row-reverse items-end gap-2" style={{ animation: "elpino-rv-pop .35s both" }}>
                  {l.from === "ai"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src="/images/contact-support-sloth.png" alt="" className="size-7 shrink-0 rounded-full bg-white object-cover object-top" />
                    : <span className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ backgroundColor: GREEN }}>P</span>}
                  <div className="max-w-[80%] rounded-2xl bg-[#363636] px-3.5 py-2.5 leading-[1.5]"><span className="mb-0.5 block text-[10px] font-medium text-white/45">{l.from === "ai" ? t("inbox.desk.elpinoAi", "Elpino AI") : t("inbox.desk.priyaTeam", "Priya · team")}</span>{l.text}</div>
                </div>
              ))}
              </div>
            </div>
            <div className="border-t border-[#3a3a3a] p-3">
              {composer === "reply" ? (
                <div className="flex items-center justify-between rounded-xl border border-[#4a4a4a] px-4 py-3 text-[12.5px] text-white/50">{t("inbox.desk.writeReply", "Write your reply…")}<span className="rounded-lg px-3 py-1 text-[11.5px] font-semibold text-white" style={{ backgroundColor: BLUE }}>{t("inbox.desk.send", "Send")}</span></div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#4a4a4a] px-4 py-3 text-center text-[12.5px] text-white/50">{composer === "done" ? t("inbox.desk.reopenNote", "Resolved. Reopen it if they write back.") : t("inbox.desk.lockedNote", "Join this conversation to reply. Until then, Elpino keeps talking to the customer.")}</div>
              )}
            </div>
          </div>

          {/* visitor */}
          <div className="hidden min-h-0 overflow-y-auto border-l border-[#3a3a3a] [scrollbar-width:thin] lg:block">
            <div className="flex items-center gap-3 border-b border-[#3a3a3a] p-4">
              <span className="grid size-12 place-items-center rounded-full text-sm font-bold" style={{ backgroundColor: "#b8763a" }}>AK</span>
              <div><p className="font-semibold">Aisha Khan</p><p className="text-[11.5px] text-white/55">{t("inbox.desk.websiteVisitor", "Website visitor")}</p></div>
            </div>
            <div className="border-b border-[#3a3a3a] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{t("inbox.desk.locationDevice", "Location & device")}</p>
              <div className="mt-3 space-y-2.5 text-[12.5px]">
                {[[MapPin, t("inbox.desk.location", "Pune, India")], [Monitor, t("inbox.desk.device", "Chrome · macOS")], [Globe2, t("inbox.desk.onPage", "On /pricing")]].map(([Ic, txt]) => { const I = Ic as typeof MapPin; return <p key={txt as string} className="flex items-center gap-2.5"><I size={14} className="text-white/55" />{txt as string}</p>; })}
                <p className="text-[11px] text-white/45">{t("inbox.desk.lastSeen", "Last seen just now")}</p>
              </div>
            </div>
            <div className="border-b border-[#3a3a3a] p-4 text-[12.5px]"><p className="flex items-center gap-1.5 font-semibold" style={{ color: "#5fe0b4" }}><ShieldCheck size={14} />{t("inbox.desk.identityVerified", "Identity verified")}</p><p className="mt-1 text-white/50">{t("inbox.desk.signedIn", "Signed in on the website")}</p></div>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">{t("inbox.desk.otherConvos", "Other conversations")}</p>
              <p className="mt-2 text-[12.5px] text-white/50">{t("inbox.desk.noOtherConvos", "No other conversations from this visitor yet.")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-black/20 px-4 py-3 text-[13px] font-semibold transition-colors duration-500" style={{ backgroundColor: st.color, color: onDark(st.color) }}>
          <st.icon size={15} />{st.banner}
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
          <p className="text-[14px] text-black/50">{t("inbox.hero.badge", "Shared inbox")}</p>
          <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">
            {t("inbox.hero.titlePrefix", "One conversation. ")}{t("inbox.hero.titleHl", "Everyone who should be in it.")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("inbox.hero.subtitle", "The AI keeps the thread until a person is needed, your whole team is alerted at once, and whoever joins gets the full history. Follow one real conversation from first message to resolved.")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">{t("inbox.hero.ctaOpen", "Open your inbox")} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/pricing" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">{t("inbox.hero.ctaPricing", "See pricing")}</Link>
          </div>
        </div>
        <Rv variant="deal" delay={200} className="mt-14"><Desk t={t} /></Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- the real thing

// A real screenshot of the dashboard. The two visitor IP addresses in it are
// covered with bars so no one's address is published.
type Callout = { label: string };
const CALLOUTS_META = [
  { color: YELLOW, style: { right: "1.5%", top: "-4%" } },
  { color: GREEN, style: { left: "3%", top: "-4%" } },
  { color: ORANGE, style: { right: "1.5%", top: "27%" } },
  { color: PINK, style: { left: "34%", bottom: "-4%" } },
];
const CALLOUTS_EN: Callout[] = [
  { label: "Join to take over" },
  { label: "Filter: All · Unread · Read · Resolved" },
  { label: "Location & device" },
  { label: "Auto-closes after 24h quiet" },
];

function RealThing({ t }: { t: T }) {
  const callouts = tList<Callout>(t, "inbox.realThing.callouts", CALLOUTS_EN);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.realThing.eyebrow", "The real thing")} color={ORANGE} title={<>{t("inbox.realThing.titlePrefix", "This is the ")}{t("inbox.realThing.titleHl", "actual inbox.")}</>} sub={t("inbox.realThing.subtitle", "No mock-up. Every conversation, the AI's replies, the visitor's details and the Join button, all on one screen.")} />
        <Rv variant="deal" delay={120}>
          <div className="relative mt-16">
            <div className={`${card} relative overflow-hidden bg-[#262626]`}>
              <Image src="/inbox_prev.png" alt={t("inbox.realThing.imageAlt", "The Elpino team inbox: a conversation list, an AI-handled thread, and the visitor's location and device")} width={1915} height={812} className="h-auto w-full" sizes="(min-width: 1152px) 1100px, 100vw" />
              <span aria-hidden="true" className="absolute rounded bg-[#262626]" style={{ left: "42.4%", top: "5.4%", width: "15.2%", height: "3%" }} />
              <span aria-hidden="true" className="absolute rounded bg-[#262626]" style={{ left: "82.2%", top: "20%", width: "16.2%", height: "3.4%" }} />
            </div>
            {callouts.map((c, i) => {
              const meta = CALLOUTS_META[i] ?? CALLOUTS_META[0];
              return <span key={c.label} className={`absolute hidden rounded-full border border-black/20 bg-white px-3 py-1.5 text-[11px] shadow-[0_6px_20px_rgba(15,23,42,0.12)] md:inline-flex`} style={{ ...meta.style, animation: `elpino-float ${4 + i * 0.6}s ease-in-out ${-i}s infinite` }}>{c.label}</span>;
            })}
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- two tabs

type TabRow = [string, string, string];
type Tab = { key: string; label: string; title: string; body: string; rows: TabRow[] };
const TABS_META = [
  { color: BLUE, icon: Users },
  { color: PURPLE, icon: Bot },
];
const TABS_EN: Tab[] = [
  {
    key: "team", label: "Team Inbox",
    title: "Conversations your team owns",
    body: "Everything a person has joined, taken over, or been assigned. This is where your team works: replies, follow-ups and resolved threads.",
    rows: [["Harnoor Singh", "Can you share the invoice again?", "Priya"], ["Meera Iyer", "Move the team to annual billing?", "Sam"], ["Jo Alvarez", "Thanks, that fixed it!", "Resolved"]],
  },
  {
    key: "ai", label: "AI Assist",
    title: "Conversations Elpino is handling",
    body: "Watch the AI work in real time. A counter shows how many are active, and you can Join any thread the moment you want to step in.",
    rows: [["Aisha Khan", "Elpino is replying…", "AI"], ["Tom Becker", "Checking your payment record…", "AI"], ["Ravi Menon", "Sent a secure payment link", "AI"]],
  },
];

function TwoTabs({ t }: { t: T }) {
  const tabsText = tList<Tab>(t, "inbox.twoTabs.tabs", TABS_EN);
  const tabs = TABS_META.map((meta, i) => ({ ...meta, ...tabsText[i] }));
  const [i, setI] = useState(1);
  const tab = tabs[i];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.twoTabs.eyebrow", "Two views")} color={BLUE} title={<>{t("inbox.twoTabs.titlePrefix", "Watch the AI. ")}{t("inbox.twoTabs.titleHl", "Run the team.")}</>} sub={t("inbox.twoTabs.subtitle", "Your inbox has a tab for what people are handling and a tab for what Elpino is handling, so nothing hides.")} />
        <div className="mt-12 flex w-fit rounded-full border border-black/25 bg-[#f4f4f2] p-1">
          {tabs.map((x, idx) => (
            <button key={x.key ?? idx} type="button" onClick={() => setI(idx)} aria-pressed={idx === i} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={idx === i ? { backgroundColor: INK, color: "#fff" } : undefined}><x.icon size={16} />{x.label}</button>
          ))}
        </div>
        <div key={tab.key} className="mt-10 grid items-center gap-8 lg:grid-cols-2" style={{ animation: "elpino-rv-deal .5s both" }}>
          <div>
            <h3 className="text-3xl font-normal tracking-[-0.03em]">{tab.title}</h3>
            <p className="mt-4 max-w-[46ch] text-[17px] leading-8 text-black/65">{tab.body}</p>
          </div>
          <div className={`${card} bg-[#262626] p-3 text-white`}>
            {tab.rows.map(([n, p, b]) => (
              <div key={`${n}-${p}`} className="flex items-center gap-3 rounded-xl px-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: tab.color }}>{initials(n)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{n}</span><span className="block truncate text-[12px] text-white/55">{p}</span></span>
                <span className={`${mono} rounded-full border border-black/25 px-2 py-0.5 text-[9px]`} style={{ backgroundColor: b === "Resolved" ? PINK : b === "AI" ? PURPLE : GREEN, color: "#fff" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- baton

type BatonItem = { who: string; note: string };
const BATON_META = [
  { color: PURPLE, icon: Bot },
  { color: GREEN, icon: Headset },
  { color: BLUE, icon: UserCheck },
  { color: PURPLE, icon: Undo2 },
];
const BATON_EN: BatonItem[] = [
  { who: "Elpino AI", note: "Answers first" },
  { who: "Priya", note: "Tapped Join chat" },
  { who: "Sam", note: "Took over from Priya" },
  { who: "Elpino AI", note: "Handed back" },
];

function Baton({ t }: { t: T }) {
  const batonText = tList<BatonItem>(t, "inbox.baton.items", BATON_EN);
  const baton = BATON_META.map((meta, i) => ({ ...meta, ...batonText[i] }));
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % baton.length), 2200);
    return () => window.clearInterval(id);
  }, [reduced, baton.length]);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.baton.eyebrow", "Pass the baton")} color={GREEN} title={<>{t("inbox.baton.titlePrefix", "Join it. Take it over. ")}{t("inbox.baton.titleHl", "Give it back.")}</>} sub={t("inbox.baton.subtitle", "A conversation moves between the AI and your people with one tap, and the history travels with it.")} />
        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[34px] hidden h-0.5 md:block" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.3) 50%, transparent 50%)`, backgroundSize: "12px 2px" }} />
          <div className="grid gap-5 md:grid-cols-4">
            {baton.map((b, idx) => {
              const on = idx === i;
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <span className="relative z-10 grid size-[68px] place-items-center rounded-full border border-black/20 bg-white transition-all duration-500" style={{ transform: on ? "scale(1.1)" : "scale(1)", boxShadow: on ? `0 0 0 6px ${b.color}22` : "none", borderColor: on ? b.color : undefined }}><b.icon size={26} style={{ color: b.color }} /></span>
                  <div className={`${card} mt-4 w-full p-4 transition-all duration-500`} style={{ backgroundColor: on ? "#f4f4f2" : "#fff", transform: on ? "translateY(-4px)" : "none", opacity: on ? 1 : 0.6 }}>
                    <p className="text-lg font-medium tracking-[-0.02em]">{b.who}</p>
                    <p className="mt-1 text-[14.5px] text-black/60">{b.note}</p>
                    <span className={`${mono} mt-3 inline-block text-[10px]`} style={{ color: b.color }}>{on ? t("inbox.baton.holdingNow", "Holding it now") : t("inbox.baton.stepLabel", "Step {n}").replace("{n}", String(idx + 1))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- nobody joins

type Mark = { t: string; h: string; d: string };
const MARKS_META = [
  { icon: BellRing, c: ORANGE },
  { icon: UserCheck, c: GREEN },
  { icon: Ticket, c: PINK },
  { icon: Mail, c: BLUE },
];
const MARKS_EN: Mark[] = [
  { t: "0s", h: "Alert goes out", d: "Every teammate sees a Join alert." },
  { t: "≤ 90s", h: "First to join wins", d: "The alert clears for everyone else." },
  { t: "90s", h: "No one free? Ticket", d: "A ticket is created automatically." },
  { t: "24h", h: "Email follow-up", d: "The customer is told to expect a reply by email within 24 hours." },
];

function NobodyFree({ t }: { t: T }) {
  const marksText = tList<Mark>(t, "inbox.nobodyFree.marks", MARKS_EN);
  const marks = MARKS_META.map((meta, i) => ({ ...meta, ...marksText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.nobodyFree.eyebrow", "Nothing gets dropped")} color={PINK} title={<>{t("inbox.nobodyFree.titlePrefix", "Even when everyone's ")}{t("inbox.nobodyFree.titleHl", "busy.")}</>} sub={t("inbox.nobodyFree.subtitle", "If nobody joins in time, the customer isn't left staring at a spinner.")} />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {marks.map((m, i) => (
            <Rv key={m.h} variant="up" delay={i * 90}>
              <div className={`${card} relative h-full bg-white p-5`}>
                <span className={`${mono} absolute -top-3 left-4 rounded-full bg-[#11120f] px-2.5 py-1 text-[10px] text-white`}>{m.t}</span>
                <m.icon size={24} className="mt-2" style={{ color: m.c }} />
                <p className="mt-4 text-xl font-medium leading-snug tracking-[-0.02em]">{m.h}</p>
                <p className="mt-2 text-[15px] leading-7 text-black/65">{m.d}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- find anything

type Convo = { n: string; p: string; s: "resolved" | "unread" | "read" };
const CONVOS_EN: Convo[] = [
  { n: "Harnoor Singh", p: "I can't share anyone's IP address", s: "resolved" },
  { n: "Aisha Khan", p: "Moved countries, billing question", s: "unread" },
  { n: "Tom Becker", p: "Widget not loading on checkout", s: "unread" },
  { n: "Meera Iyer", p: "Move the team to annual billing?", s: "read" },
  { n: "Ravi Menon", p: "Where can I find my receipt?", s: "resolved" },
  { n: "Jo Alvarez", p: "Can I add another teammate?", s: "read" },
];

function FindAnything({ t }: { t: T }) {
  const filters = tList<string>(t, "inbox.filters", ["All", "Unread", "Read", "Resolved"]);
  const convos = tList<Convo>(t, "inbox.findAnything.convos", CONVOS_EN);
  const [f, setF] = useState(0);
  const [q, setQ] = useState("");
  const filterKeys = ["all", "unread", "read", "resolved"];
  const rows = convos.filter((c) => (filterKeys[f] === "all" || c.s === filterKeys[f]) && (c.n + c.p).toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <Rv variant="drop"><Stamp color={YELLOW}><Search size={13} />{t("inbox.findAnything.eyebrow", "Search & filters")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("inbox.findAnything.titlePrefix", "Find any conversation ")}{t("inbox.findAnything.titleHl", "in a second.")}</h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[46ch] text-lg leading-8 text-black/65">{t("inbox.findAnything.subtitle", "Search by name or message and narrow to All, Unread, Read or Resolved. Give it a try on the right.")}</p></Rv>
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} bg-[#262626] p-4 text-white`}>
            <div className="flex items-center gap-2 rounded-lg border border-[#4a4a4a] px-3 py-2.5 text-[13px]"><Search size={14} className="text-white/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("inbox.desk.searchPlaceholder", "Search conversations")} aria-label={t("inbox.desk.searchPlaceholder", "Search conversations")} className="w-full bg-transparent outline-none placeholder:text-white/40" />
            </div>
            <div className="mt-3 flex gap-2 border-b border-[#3a3a3a] pb-3">
              {filters.map((x, idx) => <button key={x} type="button" onClick={() => setF(idx)} aria-pressed={f === idx} className="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition" style={f === idx ? { backgroundColor: "#fff", color: INK } : { color: "#ffffff88" }}>{x}</button>)}
            </div>
            <div className="mt-2 min-h-[288px] space-y-0.5">
              {rows.length === 0 && <p className="py-12 text-center text-sm text-white/45">{t("inbox.findAnything.noMatch", "Nothing matches. Try another word.")}</p>}
              {rows.map((c) => (
                <div key={c.n} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5" style={{ animation: "elpino-rv-pop .3s both" }}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: PURPLE }}>{initials(c.n)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold">{c.n}</span><span className="block truncate text-[12px] text-white/55">{c.p}</span></span>
                  {c.s === "unread" && <span className="size-2.5 rounded-full" style={{ backgroundColor: BLUE }} />}
                  {c.s === "resolved" && <CheckCheck size={15} style={{ color: "#5fe0b4" }} />}
                </div>
              ))}
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- secure request

type Step = { t: string; d: string };
const SECURE_STEPS_META = [
  { icon: MessageCircle, c: BLUE },
  { icon: LockKeyhole, c: PINK },
  { icon: Check, c: GREEN },
];
const SECURE_STEPS_EN: Step[] = [
  { t: "You need something private", d: "For details that shouldn't be typed into a chat window." },
  { t: "Send a secure request", d: "The customer gets a private one-time form instead of a chat box." },
  { t: "Back in the conversation", d: "They submit it once, and your team continues the conversation." },
];

function SecureRequest({ t }: { t: T }) {
  const stepsText = tList<Step>(t, "inbox.secureRequest.steps", SECURE_STEPS_EN);
  const steps = SECURE_STEPS_META.map((meta, i) => ({ ...meta, ...stepsText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.secureRequest.eyebrow", "Secure requests")} color={PINK} title={<>{t("inbox.secureRequest.titlePrefix", "Private details ")}{t("inbox.secureRequest.titleHl", "stay out of the chat.")}</>} sub={t("inbox.secureRequest.subtitle", "Ask for sensitive information through a one-time secure form, so it never sits in the transcript.")} />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Rv key={s.t} variant="deal" delay={i * 100}>
              <div className={`${card} group h-full bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${s.c}1a` }}><s.icon size={21} style={{ color: s.c }} /></span>
                <p className={`${mono} mt-4 text-[#11120f]/45`}>{t("inbox.secureRequest.stepLabel", "Step {n}").replace("{n}", String(i + 1))}</p>
                <p className="mt-1 text-xl font-medium tracking-[-0.02em]">{s.t}</p>
                <p className="mt-2 text-[15.5px] leading-7 text-black/65">{s.d}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- compare

const COMPARE_EN: [string, string][] = [
  ["Customers wait until someone is free", "The AI replies in seconds, then a person joins if needed"],
  ["Nobody knows who is replying", "A badge shows AI, teammate or resolved on every thread"],
  ["The team pings each other to find an owner", "One Join alert reaches everyone, first to join takes it"],
  ["Context lives in ten places", "History, location, device and verification in one panel"],
  ["Customers who close the tab are lost", "Verified visitors can still get your reply by email"],
];

function Compare({ t }: { t: T }) {
  const rows = tList<[string, string]>(t, "inbox.compare.rows", COMPARE_EN);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.compare.eyebrow", "Before & after")} color={ORANGE} title={<>{t("inbox.compare.titlePrefix", "From scramble to ")}{t("inbox.compare.titleHl", "calm.")}</>} />
        <div className="mt-14 space-y-3">
          <div className="hidden grid-cols-2 gap-4 md:grid"><p className={`${mono} px-2 text-[#11120f]/50`}>{t("inbox.compare.headerA", "Without a shared inbox")}</p><p className={`${mono} px-2 text-[#11120f]/50`}>{t("inbox.compare.headerB", "With Elpino")}</p></div>
          {rows.map(([a, b], i) => (
            <Rv key={a} variant="up" delay={i * 60}>
              <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                <div className={`${card} flex items-center gap-3 bg-[#f4f4f2] p-4 text-black/55`}><X size={18} color={PINK} strokeWidth={3} className="shrink-0" /><span>{a}</span></div>
                <div className={`${card} flex items-center gap-3 bg-white p-4 font-medium`}><Check size={18} strokeWidth={3} color={GREEN} className="shrink-0" />{b}</div>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- who holds it

type Holder = { tag: string; title: string; body: string };
const HOLDERS_META = [
  { icon: Bot, color: PURPLE, tilt: "-rotate-2" },
  { icon: Headset, color: GREEN, tilt: "rotate-1" },
  { icon: Check, color: PINK, tilt: "-rotate-1" },
];
const HOLDERS_EN: Holder[] = [
  { tag: "AI", title: "Elpino has it", body: "Answers from your knowledge and tools. You can watch every message live." },
  { tag: "Teammate", title: "A person has it", body: "Tap Join chat, or Take over if a colleague has it. The AI steps aside." },
  { tag: "Resolved", title: "It's done", body: "Resolved threads stay searchable, and you can reopen them in one tap." },
];

function Holders({ t }: { t: T }) {
  const holdersText = tList<Holder>(t, "inbox.holders.items", HOLDERS_EN);
  const holders = HOLDERS_META.map((meta, i) => ({ ...meta, ...holdersText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.holders.eyebrow", "Always clear")} color={PURPLE} title={<>{t("inbox.holders.titlePrefix", "You always know ")}{t("inbox.holders.titleHl", "who has it.")}</>} sub={t("inbox.holders.subtitle", "Every conversation carries a badge in the list, so nobody double-replies and nothing falls through.")} />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {holders.map((h, i) => (
            <Rv key={h.tag} variant="deal" delay={i * 110}>
              <div className={`${card} bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${h.color}1a` }}><h.icon size={21} style={{ color: h.color }} /></span>
                  <span className={`${mono} rounded-full border border-black/20 px-2.5 py-1 text-[10px] text-black/60`}>{h.tag}</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.025em]">{h.title}</h3>
                <p className="mt-2 text-[16px] leading-7 text-black/65">{h.body}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ team alert

function TeamAlert({ t }: { t: T }) {
  const reduced = useReduced();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) { setTick(3); return; }
    const id = window.setInterval(() => setTick((v) => (v + 1) % 6), 1300);
    return () => window.clearInterval(id);
  }, [reduced]);
  const team = [["Priya", GREEN], ["Sam", BLUE], ["Dana", ORANGE], ["Lee", PINK]] as const;
  const joined = tick >= 3;
  const bullets = tList<string>(t, "inbox.teamAlert.bullets", [
    "No one is singled out, so nobody is a bottleneck",
    "90 seconds to jump in before a ticket is filed for you",
    "Joined by mistake? Hand it back to the AI in a tap",
  ]);

  return (
    <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-2">
        <div>
          <Rv variant="drop"><Stamp color={ORANGE}><BellRing size={13} />{t("inbox.teamAlert.eyebrow", "Team-wide alerts")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("inbox.teamAlert.titlePrefix", "Ring the whole team. ")}<span style={{ color: "#6db3ff" }}>{t("inbox.teamAlert.titleHl", "One person answers.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[50ch] text-lg leading-8 text-white/65">{t("inbox.teamAlert.subtitle", "When a customer asks for a human, every teammate gets a Join alert at the same time. The first to tap Join takes the chat, the alert disappears for everyone else, and the customer sees who joined.")}</p></Rv>
          <Rv delay={220}>
            <ul className="mt-7 space-y-3 text-[16px]">
              {bullets.map((x) => <li key={x} className="flex items-start gap-3"><Check size={18} color="#6db3ff" strokeWidth={3} className="mt-1 shrink-0" />{x}</li>)}
            </ul>
          </Rv>
        </div>
        <Rv variant="pop" delay={100}>
          <div className={`rounded-[10px] bg-white p-6 text-[#11120f]`}>
            <p className={`${mono} text-[#11120f]/50`}>{t("inbox.teamAlert.panelLabel", "Inbox alerts")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {team.map(([n, c], i) => {
                const isWinner = i === 0;
                const alerted = tick >= 1;
                const cleared = joined && !isWinner;
                return (
                  <div key={n} className="rounded-xl border border-black/20 p-3.5 transition-all duration-500" style={{ backgroundColor: cleared ? "#f4f4f2" : "#fff", opacity: cleared ? 0.6 : 1 }}>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: c }}>{n[0]}</span>
                      <span className="font-semibold">{n}</span>
                    </div>
                    <div className="mt-3 h-9">
                      {isWinner && joined ? <span className={`${mono} flex h-full items-center justify-center rounded-lg text-[10px] text-white`} style={{ backgroundColor: GREEN, animation: "elpino-slam .35s both" }}>{t("inbox.teamAlert.joinedStatus", "Joined")}</span>
                        : cleared ? <span className={`${mono} flex h-full items-center justify-center text-[10px] text-[#11120f]/50`}>{t("inbox.teamAlert.alertCleared", "Alert cleared")}</span>
                        : alerted ? <span className={`${mono} flex h-full items-center justify-center rounded-lg text-[10px] text-white`} style={{ backgroundColor: BLUE, animation: "elpino-ring 1.4s ease-out infinite" }}>{t("inbox.teamAlert.joinChatStatus", "Join chat")}</span>
                        : <span className={`${mono} flex h-full items-center justify-center text-[10px] text-[#11120f]/35`}>{t("inbox.teamAlert.quietStatus", "Quiet")}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg px-4 py-3 text-sm font-medium" style={{ backgroundColor: joined ? "#e3f5ee" : "#f4f4f2" }}>
              {joined ? t("inbox.teamAlert.bannerJoined", "Priya joined. The customer sees her name.") : tick >= 1 ? t("inbox.teamAlert.bannerAlerting", "Alerting all 4 teammates…") : t("inbox.teamAlert.bannerAsked", "Customer asked for a person")}
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ visitor context

type ContextItem = { t: string; d: string };
const CONTEXT_META = [
  { icon: MapPin, color: GREEN },
  { icon: Monitor, color: BLUE },
  { icon: ShieldCheck, color: PURPLE },
  { icon: LockKeyhole, color: PINK },
  { icon: Clock3, color: ORANGE },
];
const CONTEXT_EN: ContextItem[] = [
  { t: "Where they are", d: "Location and local context on every visitor." },
  { t: "What they're using", d: "Device, browser and the page they were on." },
  { t: "Who they are", d: "A Verified badge when identity is confirmed by a signed token or email code." },
  { t: "Sensitive things, safely", d: "Ask for private details through a secure one-time request, not in chat." },
  { t: "The whole history", d: "Earlier conversations with the same person, right there." },
];

function Context({ t }: { t: T }) {
  const itemsText = tList<ContextItem>(t, "inbox.context.items", CONTEXT_EN);
  const items = CONTEXT_META.map((meta, i) => ({ ...meta, ...itemsText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.context.eyebrow", "Context, built in")} color={GREEN} title={<>{t("inbox.context.titlePrefix", "Never ask ")}{t("inbox.context.titleHl", "“who are you again?”")}</>} sub={t("inbox.context.subtitle", "Your team opens a thread and already knows the essentials.")} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <Rv key={c.t} variant="pop" delay={(i % 3) * 80}>
              <div className={`${card} group relative h-full bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${c.color}1a` }}><c.icon size={21} style={{ color: c.color }} /></span>
                <h3 className="mt-5 text-2xl font-medium tracking-[-0.025em]">{c.t}</h3>
                <p className="mt-2 text-[16px] leading-7 text-black/65">{c.d}</p>
              </div>
            </Rv>
          ))}
          <Rv variant="pop" delay={160}>
            <div className={`${card} flex h-full flex-col justify-center border-dashed bg-[#f4f4f2] p-6 text-center`}>
              <Users className="mx-auto" size={26} aria-hidden="true" />
              <p className="mt-3 text-lg font-medium">{t("inbox.context.extraTitle", "Plus live typing on both sides")}</p>
              <p className="mt-1 text-[15px] text-black/60">{t("inbox.context.extraDesc", "Customers see when you're replying, and you see when they are.")}</p>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- after they leave

const AFTER_LEAVE_META = [
  { icon: Globe2, c: BLUE },
  { icon: KeyRound, c: PURPLE },
  { icon: Mail, c: GREEN },
];
const AFTER_LEAVE_EN: Step[] = [
  { t: "Visitor leaves", d: "They close the chat, or 24 hours pass with no message." },
  { t: "Verified email on file?", d: "If they confirmed their address, they can still be reached." },
  { t: "Reply by email", d: "Your reply goes to their inbox. No verified email means no reply is possible, and the composer says so." },
];

function AfterLeave({ t }: { t: T }) {
  const stepsText = tList<Step>(t, "inbox.afterLeave.steps", AFTER_LEAVE_EN);
  const steps = AFTER_LEAVE_META.map((meta, i) => ({ ...meta, ...stepsText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("inbox.afterLeave.eyebrow", "After they leave")} color={PINK} title={<>{t("inbox.afterLeave.titlePrefix", "Closing the tab ")}{t("inbox.afterLeave.titleHl", "isn't the end.")}</>} sub={t("inbox.afterLeave.subtitle", "Elpino tells you honestly whether a reply can still reach them.")} />
        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map((s, i) => (
            <div key={s.t} className="contents">
              <Rv variant="up" delay={i * 120}>
                <div className={`${card} h-full bg-white p-6`}>
                  <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${s.c}1a` }}><s.icon size={21} style={{ color: s.c }} /></span>
                  <p className={`${mono} mt-4 text-[#11120f]/45`}>{t("inbox.afterLeave.stepLabel", "Step {n}").replace("{n}", String(i + 1))}</p>
                  <p className="mt-1 text-xl font-medium tracking-[-0.02em]">{s.t}</p>
                  <p className="mt-2 text-[15.5px] leading-7 text-black/65">{s.d}</p>
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

// ------------------------------------------------------------------- faq

const FAQS_EN: [string, string][] = [
  ["Who can see a conversation?", "Everyone on your team can see the shared inbox. Each conversation shows who has it: the AI, a teammate, or resolved."],
  ["What is the 90-second window?", "When a customer asks for a person, every teammate gets a Join alert. If nobody joins within 90 seconds, the customer is told and a ticket is created automatically with an email follow-up."],
  ["Can I give a conversation back to the AI?", "Yes. If you joined and it's a simple follow-up, hand the chat back to Elpino in one tap."],
  ["Can I reply after the visitor leaves?", "If they gave a verified email address, your reply is sent by email. Without one, no reply can reach them."],
  ["Does it work on more than website chat?", "The website chat widget is live today. Omnichannel is coming in November."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "inbox.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("inbox.faq.titlePrefix", "Good to ")}{t("inbox.faq.titleHl", "know.")}</h2></Rv>
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
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("inbox.closing.title", "Give your team one place to help from.")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("inbox.closing.subtitle", "Start free and invite your teammates when you're ready.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("inbox.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("inbox.closing.ctaMeetAgent", "Meet the AI agent")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function InboxClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <RealThing t={t} />
      <TwoTabs t={t} />
      <Holders t={t} />
      <Baton t={t} />
      <TeamAlert t={t} />
      <NobodyFree t={t} />
      <FindAnything t={t} />
      <Context t={t} />
      <SecureRequest t={t} />
      <AfterLeave t={t} />
      <Compare t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
