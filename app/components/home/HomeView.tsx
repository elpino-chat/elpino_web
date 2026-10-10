"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck, BookOpen, Bot, Check, CheckCheck, ChevronDown, ChevronLeft, CircleHelp, Code2, Compass, Eye, FileText, Gauge, Globe, Inbox, KeyRound, Languages, LayoutGrid, Lock, MapPin, MessageCircle, MessageSquare, MonitorSmartphone, MoreHorizontal, Palette, Paperclip, PenLine, Plug, Plus, Rocket, Search, Send, Settings, ShieldCheck, Smile, Ticket, Upload, UserPlus, Users, Wallet,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// The home page. Real product screenshot up top, then a short tour of what
// Elpino actually does (each card links to its page), who it's for, what it
// plugs into, and how it's priced. Only shipped behaviour is described, and
// omnichannel is marked as coming in November.
//
// i18n: every user-facing string routes through t("home.<section>.<key>", englishDefault).
// The English default is always the real copy, so a locale file that is
// missing a key (or a whole section) never breaks the page — it just shows
// English for that one string. See web/locales/*.json under "home".

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

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` (t()'s underlying JSON traversal returns the
 * raw value at a path, string or not — t()'s own type signature says
 * `string`, but at runtime an array-shaped key really does hand back an
 * array). Falls back to the English array wholesale if the locale is
 * missing the whole key (a brand-new locale file, or one not yet extended
 * to this section) — never per-item, since a partial array reads as a bug
 * rather than a missing translation.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

// Phones get plain, unpinned sections: no scroll-driven scenes.
function useMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767.98px)");
    const on = () => setM(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return m;
}

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
      <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-[#11120f]/65">{sub}</p></Rv>}
    </div>
  );
}

// -------------------------------------------------------------------- hero

// Email + button in the hero. The signup page reads ?email= and starts with it filled in.
function HeroSignup({ t }: { t: T }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(email.trim() ? `/signup?email=${encodeURIComponent(email.trim())}` : "/signup"); }}
      className="flex w-full max-w-lg overflow-hidden rounded-md border-2 border-[#11120f] bg-white focus-within:border-[#3784ff]"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder={t("home.hero.emailPlaceholder", "Enter your work email")}
        aria-label={t("home.hero.emailLabel", "Email address")}
        className="h-12 min-w-0 flex-1 bg-white px-4 text-[#11120f] outline-none placeholder:text-[#11120f]/45"
      />
      <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-black px-5 font-normal text-white transition hover:bg-[#262626] sm:px-6">
        {t("home.hero.ctaSignUp", "Start free")} <ArrowRight size={17} />
      </button>
    </form>
    </div>
  );
}

// The hero scene: the visitor types a question, Elpino works through it step by step, then types its answer.
function HeroStage({ t }: { t: T }) {
  const reduced = useReduced();
  const question = t("home.hero.widget.convo.0", "Was I charged twice for my upgrade?");
  const steps = [
    t("home.hero.stage.step0", "Reading the question"),
    t("home.hero.stage.step1", "Checking your payment record"),
    t("home.hero.stage.step2", "Reading your refund policy"),
  ];
  const answer = t("home.hero.widget.convo.2", "You were charged once. The second attempt failed and was never captured.");
  const [typed, setTyped] = useState(0);
  const [stepsDone, setStepsDone] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    if (reduced) { setTyped(question.length); setStepsDone(steps.length); setAnswered(answer.length); return; }
    let cancelled = false;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => { timers.push(window.setTimeout(() => { if (!cancelled) fn(); }, ms)); };
    const run = () => {
      setTyped(0); setStepsDone(0); setAnswered(0);
      let t0 = 600;
      for (let i = 1; i <= question.length; i++) { at(t0 + i * 45, () => setTyped(i)); }
      t0 += question.length * 45 + 500;
      for (let i = 1; i <= steps.length; i++) { at(t0 + i * 1000, () => setStepsDone(i)); }
      t0 += steps.length * 1000 + 400;
      for (let i = 1; i <= answer.length; i++) { at(t0 + i * 22, () => setAnswered(i)); }
      t0 += answer.length * 22 + 5000;
      at(t0, run);
    };
    run();
    return () => { cancelled = true; timers.forEach((id) => window.clearTimeout(id)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, question, answer]);

  const analysing = typed >= question.length && stepsDone < steps.length;
  const glass = "rounded-3xl border border-black/10 bg-white/70 text-[#11120f] shadow-[0_20px_60px_rgba(17,18,15,0.12)] backdrop-blur-xl backdrop-saturate-150";
  return (
    <div className="relative mx-auto mt-14 h-[360px] max-w-5xl sm:h-[440px] lg:h-[520px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/elpino-mascot-4.png" alt="A friendly cartoon Elpino sloth working on a laptop" className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 object-contain object-bottom drop-shadow-[0_30px_50px_rgba(17,18,15,0.25)]" />

      <div className={`${glass} absolute left-0 top-6 hidden w-[300px] p-5 text-[14px] leading-6 md:block lg:w-[340px]`}>
        <p className="text-[#11120f]/55">{t("home.hero.glass.customer", "Customer")}</p>
        <p className="mt-1 min-h-[3rem]">{question.slice(0, typed)}{typed < question.length && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[#11120f]" />}</p>
      </div>

      <div className={`${glass} absolute right-0 top-2 hidden w-[300px] p-5 text-[13px] leading-6 md:block lg:w-[350px]`}>
        <p className="text-[#11120f]/55">{analysing ? t("home.hero.stage.working", "Elpino is working…") : t("home.hero.glass.ai", "Elpino")}</p>
        <ul className="mt-2 space-y-1.5">
          {steps.map((label, i) => (
            <li key={label} className={`flex items-center gap-2 transition-opacity duration-300 ${typed >= question.length && i <= stepsDone ? "opacity-100" : "opacity-0"}`}>
              {i < stepsDone
                ? <Check size={13} strokeWidth={3} className="shrink-0 text-[#1aa37a]" />
                : <span className="size-3 shrink-0 animate-spin rounded-full border-2 border-black/20 border-t-[#11120f]" />}
              <span className={i < stepsDone ? "text-[#11120f]/70" : "text-[#11120f]"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${glass} absolute bottom-6 right-0 hidden w-[300px] p-5 text-[14px] leading-6 md:block lg:w-[360px]`}>
        <p className="text-[#11120f]/55">{t("home.hero.glass.ai", "Elpino")}</p>
        <p className="mt-1 min-h-[4.5rem]">{answer.slice(0, answered)}{answered > 0 && answered < answer.length && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[#11120f]" />}</p>
      </div>
    </div>
  );
}

// The team inbox, drawn in code to match the real dashboard, so it stays crisp and tells the same story as the
// widget floating over it: the AI checks the payment and fixes the plan, then hands the refund to Billing. It
// is laid out once at the real dashboard's size and scaled to whatever width it gets, so it reads like a
// screenshot at every breakpoint. Every name, email and address in it is made up.
const INBOX_W = 1914, INBOX_H = 928;
function InboxMock({ t }: { t: T }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    // Fires once on observe, so this also sets the first scale.
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / INBOX_W));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const rail = [
    { icon: LayoutGrid, label: t("home.hero.inbox.space", "Space") },
    { icon: Inbox, label: t("home.hero.inbox.inbox", "Inbox"), active: true },
    { icon: Globe, label: t("home.hero.inbox.analytics", "Analytics") },
    { icon: Users, label: t("home.hero.inbox.contacts", "Contacts") },
    { icon: FileText, label: t("home.hero.inbox.knowledge", "Knowledge") },
    { icon: Settings, label: t("home.hero.inbox.settings", "Settings") },
  ];
  const visitorName = t("home.hero.inbox.visitor", "Website visitor");
  const threads = [
    { initials: "NG", color: "#b8743a", name: "Neha Gupta", when: "Oct 6", preview: t("home.hero.chat.a2", "Refunds need a teammate's approval, so I've passed this to Billing with your payment details. They'll reply right here."), active: true },
    { initials: "AM", color: "#c4573f", name: "Alex Morgan", when: "Oct 6", preview: t("home.hero.inbox.p2", "Where's my invoice for September?"), plain: true },
    { initials: "WV", color: "#7a4fc4", name: visitorName, when: "Oct 5", preview: t("home.hero.inbox.p3", "Hey! What can I help you with today?") },
    { initials: "WV", color: "#3a6fc0", name: visitorName, when: "Oct 5", preview: t("home.hero.inbox.p4", "Your order #4821 ships tomorrow.") },
    { initials: "RK", color: "#c4573f", name: "Riya Kapoor", when: "Sep 30", preview: t("home.hero.inbox.p5", "Here's the lineup: Free, Starter, Growth…") },
    { initials: "WV", color: "#7a4fc4", name: visitorName, when: "Sep 29", preview: t("home.hero.inbox.p6", "Updated with the correct address.") },
    { initials: "AM", color: "#3a6fc0", name: "Arjun Mehta", when: "Sep 27", preview: t("home.hero.inbox.p7", "I've passed this to the team.") },
    { initials: "TB", color: "#b8743a", name: "Tom Becker", when: "Sep 25", preview: t("home.hero.inbox.p8", "ok thanks") },
  ];
  // The AI's messages sit on the right as plain text with its logo beside them; the visitor's sit on the left in a grey bubble.
  const logo = (size: number) => <span className="block shrink-0 overflow-hidden" style={{ width: size * 0.9, height: size }}><Image src="/elpino.png" alt="" width={906} height={275} className="h-full w-auto max-w-none" /></span>;
  const ai = (text: ReactNode) => (
    <div className="flex justify-end gap-5">
      <div className="max-w-[600px]"><p className="text-[14px] leading-[1.55]">{text}</p><p className="mt-2 text-right text-[12px]">1:43 PM</p></div>
      {logo(26)}
    </div>
  );
  const visitor = (text: string) => (
    <div>
      <div className="flex items-center gap-4">
        <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#f1f1f1] text-[13px] font-semibold">NG</span>
        <p className="max-w-[520px] rounded-2xl bg-[#f1f1f1] px-4 py-3 text-[14px]">{text}</p>
      </div>
      <p className="ml-[52px] mt-2 text-[12px]">1:43 PM</p>
    </div>
  );
  const verified = <span className="inline-flex items-center gap-1 rounded-md bg-[#eef8f1] px-2 py-0.5 text-[11.5px] font-medium"><ShieldCheck size={12} />{t("home.hero.inbox.verified", "Verified")}</span>;
  return (
    <div ref={boxRef} className="relative aspect-[1914/928] w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(17,18,15,0.18)]">
      <div aria-hidden="true" className="absolute left-0 top-0 flex text-[#11120f]" style={{ width: INBOX_W, height: INBOX_H, transform: `scale(${scale})`, transformOrigin: "0 0", opacity: scale ? 1 : 0 }}>
        {/* Navigation rail */}
        <div className="flex w-[80px] shrink-0 flex-col items-center bg-[#f7f7f7] pt-3.5 pb-8">
          {logo(46)}
          <div className="mt-8 flex flex-col items-center gap-3">
            {rail.map(({ icon: Icon, label, active }) => (
              <span key={label} className={`relative flex w-[62px] flex-col items-center gap-1.5 rounded-xl py-2.5 text-[12px] ${active ? "bg-[#ececec] text-[#11120f]" : "text-[#11120f]/70"}`}>
                <Icon size={18} strokeWidth={1.6} />{label}
                {active && <span className="absolute right-3 top-2 grid size-4 place-items-center rounded-full bg-[#2c8a63] text-[9.5px] font-semibold text-white">1</span>}
              </span>
            ))}
          </div>
          <span className="mt-auto text-[#11120f]/80"><CircleHelp size={20} strokeWidth={1.6} /></span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex h-[66px] shrink-0 items-center px-8">
            <span className="flex items-center gap-2.5 text-[15px]">{t("home.hero.inbox.workspace", "Elpino's Workspace")}<ChevronDown size={15} /></span>
            <span className="ml-10 flex items-center gap-2.5 text-[13px]"><Compass size={15} />{t("home.hero.inbox.tour", "Page tour")}</span>
            <span className="ml-8 flex h-[36px] w-[806px] items-center gap-3 rounded-xl border border-black/15 px-4 text-[14px] text-[#11120f]/55"><Search size={15} className="text-[#11120f]" />{t("home.hero.inbox.searchAll", "Search people, chats, workspaces...")}</span>
            <span className="ml-auto flex items-center gap-2.5 text-[14px]"><UserPlus size={15} />{t("home.hero.inbox.invite", "Invite team")}</span>
            <span className="ml-9 flex items-center gap-2.5 text-[14px]"><Gauge size={15} />{t("home.hero.inbox.usage", "Usage")}</span>
            <span className="relative ml-7 grid size-[30px] place-items-center rounded-full bg-[#1f1f1f] text-[13px] text-white">J<span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#2c8a63]" /></span>
            <ChevronDown size={13} className="ml-1.5" />
          </div>
          <div className="flex min-h-0 flex-1">
            {/* Conversation list */}
            <div className="flex w-[364px] shrink-0 flex-col overflow-hidden px-2.5">
              <div className="flex gap-7 px-4 text-[15px]">
                <span className="pb-3 pt-0.5 text-[#11120f]/75">{t("home.hero.inbox.team", "Team Inbox")}</span>
                <span className="flex items-center gap-2.5 border-b-2 border-[#11120f] pb-3 pt-0.5 font-medium">{t("home.hero.inbox.ai", "AI Assist")}<span className="grid size-[21px] place-items-center rounded-full bg-[#11120f] text-[11px] font-semibold text-white">1</span></span>
              </div>
              <span className="mx-2.5 mt-2 flex h-[38px] items-center gap-2.5 rounded-full border border-black/15 px-5 text-[14.5px] text-[#11120f]/55"><Search size={15} className="text-[#11120f]" />{t("home.hero.inbox.search", "Search conversations")}</span>
              <div className="mx-2.5 mt-4 flex gap-2.5 text-[14px]">
                <span className="rounded-full border border-[#11120f] px-4 py-1.5 font-medium">{t("home.hero.inbox.all", "All")}</span>
                <span className="rounded-full border border-black/15 px-4 py-1.5 text-[#11120f]/75">{t("home.hero.inbox.resolved", "Resolved")}</span>
              </div>
              <div className="mt-3 space-y-1">
                {threads.map((c, i) => (
                  <div key={i} className={`flex items-center gap-4 rounded-xl px-3 py-3 ${c.active ? "bg-[#ececec]" : ""}`}>
                    <span className="grid size-[40px] shrink-0 place-items-center rounded-full text-[14px] font-medium text-white/95" style={{ backgroundColor: c.color }}>{c.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2"><span className="truncate text-[15px]">{c.name}</span><span className="shrink-0 text-[13px] text-[#11120f]/80">{c.when}</span></span>
                      <span className="mt-1 flex items-center gap-2 text-[14px] text-[#11120f]/80">{!c.plain && <CheckCheck size={13} className="shrink-0 text-[#2c8a63]" />}<span className="truncate">{c.preview}</span></span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* The open conversation */}
            <div className="flex min-w-0 flex-1 flex-col border-x border-black/[0.08]">
              <div className="flex items-center gap-4 border-b border-black/[0.08] px-6 pb-4 pt-2">
                <span className="grid size-[36px] place-items-center rounded-full bg-[#b8743a] text-[13px] font-medium text-white">NG</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-3 text-[15px] font-medium">Neha Gupta{verified}</span>
                  <span className="mt-1 flex items-center gap-4 text-[12px]">
                    <span>{t("home.hero.inbox.handed", "Assigned to Billing — waiting for a teammate")}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} />IN</span>
                    <span className="flex items-center gap-1"><Globe size={13} />203.0.113.42</span>
                    <span className="flex items-center gap-1"><MonitorSmartphone size={13} />Chrome · macOS</span>
                  </span>
                </span>
                <span className="flex items-center gap-2.5 rounded-xl bg-[#1f1f1f] px-5 py-3 text-[14px] font-medium text-white"><MessageCircle size={14} />{t("home.hero.inbox.join", "Join")}</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col justify-end gap-7 overflow-hidden px-10 pb-8">
                {ai(t("home.hero.inbox.greet", "Hi Neha 👋 How can I help you today?"))}
                {visitor(t("home.hero.chat.q1", "I paid for Growth but my account still says Free"))}
                {ai(t("home.hero.chat.a1", "Found it: your ₹4,999 payment from this morning went through. Growth is now active, so refresh and you'll see it."))}
                {visitor(t("home.hero.chat.q2", "Thanks! Can I get a refund for last month?"))}
                {ai(t("home.hero.chat.a2", "Refunds need a teammate's approval, so I've passed this to Billing with your payment details. They'll reply right here."))}
                <div className="flex items-center gap-4 text-[12px]"><span className="h-px flex-1 bg-black/15" />{t("home.hero.inbox.assigned", "Assigned to Billing: refunds need a teammate's approval")}<span className="h-px flex-1 bg-black/15" /></div>
              </div>
              {/* The dashboard's own reply bar: the prompt, attachment, emoji, ticket, private-info and translate
                  tools, and the black Send button with its options. */}
              <div className="mx-6 mb-5 rounded-2xl border border-black/10 px-6 pb-3.5 pt-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <p className="text-[14px] text-[#11120f]/55">{t("home.hero.inbox.composer", "Write your reply to the customer, press 'space' for AI, '/' for commands")}</p>
                <div className="mt-7 flex items-center gap-5 text-[#11120f]/75">
                  <Paperclip size={16} /><Smile size={16} /><Ticket size={16} /><Lock size={16} /><Languages size={16} />
                  <span className="ml-auto flex h-[34px] items-center overflow-hidden rounded-lg bg-[#17191b] text-white">
                    <span className="flex h-full w-11 items-center justify-center"><Send size={16} /></span>
                    <span className="flex h-5 w-7 items-center justify-center border-l border-white/25"><ChevronDown size={13} /></span>
                  </span>
                </div>
              </div>
            </div>
            {/* Visitor details */}
            <div className="w-[374px] shrink-0">
              <div className="border-b border-black/[0.08] px-6 pb-6 pt-3">
                <div className="flex items-center gap-4">
                  <span className="grid size-[48px] place-items-center rounded-full bg-[#b8743a] text-[18px] font-medium text-white">NG</span>
                  <span><span className="flex items-center gap-3 text-[15px] font-medium">Neha Gupta{verified}</span><span className="mt-1 block text-[12.5px] text-[#11120f]/70">{visitorName}</span></span>
                </div>
                <p className="mt-5 rounded-xl bg-[#fafafa] px-4 py-4 text-[13px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"><span className="font-semibold">{t("home.hero.inbox.email", "Email")}:</span> neha@example.com</p>
              </div>
              <div className="space-y-4 border-b border-black/[0.08] px-5 py-7 text-[13.5px]">
                <p className="text-[11.5px] font-semibold tracking-[0.1em] text-[#11120f]/70">{t("home.hero.inbox.device", "LOCATION & DEVICE")}</p>
                <p className="flex items-center gap-3"><MapPin size={13} />IN</p>
                <p className="flex items-center gap-3"><Globe size={13} />203.0.113.42</p>
                <p className="flex items-center gap-3"><MonitorSmartphone size={13} />Chrome · macOS</p>
                <p className="text-[12px] text-[#11120f]/65">{t("home.hero.inbox.lastSeen", "Last seen 10/6/2026, 2:00:04 PM")}</p>
              </div>
              <div className="px-5 py-7">
                <p className="text-[11.5px] font-semibold tracking-[0.1em] text-[#11120f]/70">{t("home.hero.inbox.other", "OTHER CONVERSATIONS")}</p>
                {[
                  { text: t("home.hero.inbox.o1", "Where's my invoice for September?"), when: "Sep 30" },
                  { text: t("home.hero.inbox.o2", "ok thanks"), when: "Sep 25" },
                ].map((o) => (
                  <div key={o.when} className="px-3 pt-6">
                    <p className="flex justify-between gap-3 text-[13.5px] font-medium"><span className="truncate">{o.text}</span><span className="shrink-0 text-[11px] font-normal text-[#11120f]/60">{o.when}</span></p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11.5px]"><CheckCheck size={13} />{t("home.hero.inbox.resolvedTag", "Resolved")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  const trust = tList(t, "home.hero.trust", ["100 free AI messages a month", "No card required"]);
  const [widgetRef, widgetSeen] = useSeen<HTMLDivElement>();
  return (
    <section className="relative isolate -mt-16 -mb-8 overflow-hidden bg-white text-[#11120f]">
      <div className="relative w-full px-5 pb-12 pt-56 sm:px-8 sm:pb-14 sm:pt-48 lg:px-12 lg:pt-52">

        <div className="text-left">
          <Rv delay={80}>
            <h1 className="max-w-5xl font-[family-name:var(--font-bricolage)] text-[clamp(1.6rem,3.1vw,2.9rem)] font-normal leading-[1.25]">{t("home.hero.headLead", "Let AI answer the repeated questions,")}{" "}
              {t("home.hero.headEmphasis", "so your team handles the ones that matter.")}</h1>
          </Rv>
          <Rv delay={240}>
            <HeroSignup t={t} />
            <p className="mt-4 flex flex-wrap items-center justify-start gap-x-5 gap-y-1 text-sm text-[#11120f]/70">
              {trust.map((x) => <span key={x} className="inline-flex items-center gap-1.5"><Check size={14} color={GREEN} strokeWidth={3} />{x}</span>)}
            </p>
          </Rv>
        </div>

        {/* Elpino's own inbox, full width under the headline. */}
        <Rv variant="deal" delay={300} className="mt-14">
          {/* The screenshot sits on a padded colour panel: a blue glow from the bottom, pink in both
              corners and a soft violet top, the same palette used earlier in the hero. */}
          <div
            ref={widgetRef}
            className="relative rounded-3xl p-4 sm:p-8 lg:p-12"
            style={{
              backgroundColor: "#eef2ff",
              backgroundImage: [
                "radial-gradient(60% 70% at 50% 110%, rgba(68,120,255,0.85) 0%, rgba(68,120,255,0) 72%)",
                "radial-gradient(50% 60% at 0% 100%, rgba(255,61,139,0.6) 0%, rgba(255,61,139,0) 72%)",
                "radial-gradient(50% 60% at 100% 100%, rgba(255,84,176,0.55) 0%, rgba(255,84,176,0) 72%)",
                "radial-gradient(70% 50% at 50% 0%, rgba(124,92,255,0.25) 0%, rgba(124,92,255,0) 70%)",
              ].join(", "),
            }}
          >
          <InboxMock t={t} />
          {/* The chat widget visitors see, floating over the bottom-right corner of the inbox. Hidden on
              phones, where it would cover most of the screenshot. */}
          {/* The story it tells is the headline's: the AI settles the routine question itself, with a real check behind
              the answer, and hands the one that needs a person to the team. */}
          <ChatWidgetPreview large seen={widgetSeen} className="hidden sm:-bottom-6 sm:right-8 sm:flex lg:-bottom-8 lg:right-12" lines={[
            { ai: false, text: t("home.hero.chat.q1", "I paid for Growth but my account still says Free") },
            { ai: true, meta: t("home.hero.chat.m1", "AI agent · Payment verified"), text: t("home.hero.chat.a1", "Found it: your ₹4,999 payment from this morning went through. Growth is now active, so refresh and you'll see it.") },
            { ai: false, text: t("home.hero.chat.q2", "Thanks! Can I get a refund for last month?") },
            { ai: true, meta: t("home.hero.chat.m2", "AI agent · Handed to Billing"), text: t("home.hero.chat.a2", "Refunds need a teammate's approval, so I've passed this to Billing with your payment details. They'll reply right here.") },
          ]} />
          </div>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- product tour

const DEMO_SITE = "yourcompany.com";
const DEMO_SHARE = 0.7; // how much of each step's scroll the demo uses before the row slides on
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Step 1's preview: the bar where a visitor types their website, carried to signup. As the page scrolls (p, 0 to 1)
// the address types itself, the button is pressed, and it confirms. A visitor can still type their own address.
function WebsiteBar({ t, p }: { t: T; p: number }) {
  const router = useRouter();
  const [site, setSite] = useState("");
  const typed = DEMO_SITE.slice(0, Math.round(clamp01(p / 0.5) * DEMO_SITE.length));
  const pressed = p > 0.6 && p < 0.72;
  const added = p >= 0.72;
  const value = site || typed;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); router.push(value.trim() ? `/signup?website=${encodeURIComponent(value.trim())}` : "/signup"); }}
      className="flex w-[min(100%,380px)] items-center gap-2 rounded-xl border-2 bg-white p-1.5 transition-colors focus-within:border-[#3784ff]"
      style={{ borderColor: p > 0 && p < 0.5 ? "#3784ff" : "#11120f" }}
    >
      <Globe size={18} className="ml-2 shrink-0 text-[#11120f]/50" aria-hidden="true" />
      <input value={value} onChange={(e) => setSite(e.target.value)} inputMode="url" autoComplete="url" aria-label={t("home.tour.websiteLabel", "Your website")} placeholder={t("home.tour.websitePlaceholder", "yourcompany.com")} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-[#11120f]/40" />
      <button type="submit" className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 ${added ? "bg-[#1aa37a]" : "bg-[#11120f]"} ${pressed ? "scale-90" : "scale-100"}`}>
        {added ? <span className="inline-flex items-center gap-1.5"><Check size={15} strokeWidth={3} />{t("home.tour.websiteAdded", "Added")}</span> : t("home.tour.websiteButton", "Add website")}
      </button>
    </form>
  );
}

// Each step's preview plays as p goes from 0 to 1: the site is added, then its pages are crawled and the plugins
// connect, then the widget snippet goes in and the places it runs light up.
function TourVisual({ k, t, p }: { k: string; t: T; p: number }) {
  const chip = "rounded-lg border-2 border-[#11120f] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold";
  const fade = (from: number, to: number) => { const v = clamp01((p - from) / (to - from)); return { opacity: v, transform: `translateY(${(1 - v) * 8}px)` }; };
  if (k === "site") return <WebsiteBar t={t} p={p} />;
  if (k === "crawl")
    return (
      <div className="w-[min(100%,340px)] space-y-4">
        <div className="space-y-2">{["/pricing", "/returns-policy", "/faq", "guide.pdf"].map((x, i) => {
          const done = p > 0.12 + i * 0.16 + 0.1;
          return (
            <div key={x} className={`${chip} flex items-center justify-between`} style={fade(0.02 + i * 0.16, 0.12 + i * 0.16)}>
              <span>{x}</span>
              {done ? <span style={{ color: GREEN }}>✓</span> : <span className="text-[#11120f]/40">…</span>}
            </div>
          );
        })}</div>
        <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-black/25 pt-3" style={fade(0.78, 0.9)}>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#11120f]/55"><Plug size={13} />{t("home.tour.plugins", "Plugins")}</span>
          {["Stripe", "Shopify", "HubSpot"].map((x) => <span key={x} className={chip}>{x} <span style={{ color: GREEN }}>✓</span></span>)}
        </div>
      </div>
    );
  return (
    <div className="w-[min(100%,340px)] space-y-3">
      <div className="rounded-lg bg-[#11120f] p-3 font-mono text-[11px] leading-5 text-white/90" style={fade(0, 0.2)}>{"<script src=\"https://cdn.elpino.chat/tag.js\""}<br />{"        async></script>"}</div>
      <div className="flex flex-wrap items-center gap-2">
        {["Website", "Mobile web", "React"].map((x, i) => <span key={x} className={chip} style={fade(0.35 + i * 0.12, 0.47 + i * 0.12)}>{x}</span>)}
        <span className={`${chip} bg-[#1aa37a] text-white`} style={fade(0.88, 1)}>Live ✓</span>
      </div>
    </div>
  );
}

function Tour({ t }: { t: T }) {
  const reduced = useReduced();
  const mobile = useMobile();
  const outer = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const scroller = useRef<HTMLDivElement>(null); // phones: the row you swipe through
  const [current, setCurrent] = useState(0); // the card nearest the left edge
  const [story, setStory] = useState(0); // 0 to the number of cards: the whole number is the step, the fraction is how far its demo has played
  const reach = useRef(0); // px of scrolling for the whole story
  // The section pins to the screen. One timeline, `story`, runs with the scroll: step 1 types a website and clicks the
  // button, then the row slides left to step 2 as its demo plays, then on to step 3. The row's position and every demo
  // are pure functions of that one number, so scrolling back up rewinds it.
  useEffect(() => {
    const box = outer.current;
    const row = strip.current;
    if (!box || !row || mobile) return;
    let frame = 0;
    const steps = () => row.children.length;
    const lefts = () => { const c = Array.from(row.children) as HTMLElement[]; return c.map((el) => el.offsetLeft - c[0].offsetLeft); };
    const size = () => {
      reach.current = steps() * window.innerHeight * 0.9;
      box.style.height = `${window.innerHeight + reach.current}px`;
    };
    const update = () => {
      frame = 0;
      const n = steps();
      const done = Math.min(1, Math.max(0, -box.getBoundingClientRect().top / reach.current));
      const time = done * n;
      const range = Math.max(0, row.scrollWidth - window.innerWidth);
      const at = lefts().map((x) => Math.min(range, x));
      // Each step owns one stretch of the timeline: its demo plays while the row stays put (the first DEMO_SHARE of
      // the stretch), and only once the demo has finished does the row slide on to the next step.
      const i = Math.min(n - 1, Math.floor(time));
      const part = time - i;
      const slide = i < n - 1 ? clamp01((part - DEMO_SHARE) / (1 - DEMO_SHARE)) : 0;
      const shift = i < n - 1 ? at[i] + (at[i + 1] - at[i]) * slide : at[i];
      row.style.transform = `translate3d(${-shift}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${done})`;
      setStory(i + clamp01(part / DEMO_SHARE));
      setCurrent(i + (slide > 0.5 ? 1 : 0));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const onResize = () => { size(); onScroll(); };
    size();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); if (frame) window.cancelAnimationFrame(frame); box.style.height = ""; row.style.transform = ""; };
  }, [mobile]);
  // Phones: the row is a plain swipeable strip; keep `current` in step with the card at the left edge.
  useEffect(() => {
    const box = scroller.current;
    if (!mobile || !box) return;
    const onSwipe = () => {
      const cards = Array.from(box.children[0].children) as HTMLElement[];
      const at = box.scrollLeft;
      let best = 0;
      cards.forEach((c, i) => { if (Math.abs(c.offsetLeft - cards[0].offsetLeft - at) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - at)) best = i; });
      setCurrent(best);
    };
    onSwipe();
    box.addEventListener("scroll", onSwipe, { passive: true });
    return () => box.removeEventListener("scroll", onSwipe);
  }, [mobile]);
  function swipeTo(index: number) {
    const box = scroller.current;
    if (!box) return;
    const cards = Array.from(box.children[0].children) as HTMLElement[];
    const card = cards[Math.min(cards.length - 1, Math.max(0, index))];
    box.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: reduced ? "auto" : "smooth" });
  }
  // Prev and next scroll to the start of that step's stretch, so its demo plays from the top.
  function goTo(index: number) {
    const box = outer.current;
    const row = strip.current;
    if (!box || !row) return;
    const n = row.children.length;
    const step = Math.min(n - 1, Math.max(0, index));
    window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY + ((step + 0.02) / n) * reach.current, behavior: reduced ? "auto" : "smooth" });
  }
  const keys = ["site", "crawl", "widget"];
  const STAGES = ["widget", "kb", "inbox"];
  const icons = [Globe, Plug, MessageSquare];
  const hrefs = ["/product/knowledge-hub", "/product/knowledge-hub", "/product/ai-agent"];
  const items = tList(t, "home.tour.steps", [
    { tag: "Step 1", title: "Add your website", desc: "Paste your site address. That is all Elpino needs to start learning your business." },
    { tag: "Step 2", title: "Crawl your site and feed it", desc: "Elpino reads your pages and files, and keeps every customer's details and past chats in its built-in CRM. Connect plugins like Stripe or Shopify to keep that data in sync." },
    { tag: "Step 3", title: "Add the chat widget in minutes", desc: "Drop one snippet into your website or web app, from a landing page to a React app, and talk to visitors in real time." },
  ]).map((item, i) => ({ ...item, href: hrefs[i], icon: icons[i] }));
  return (
    <section id="product-tour" className="scroll-mt-20 bg-white pb-4">
      {/* A pinned stage: the cards sit in one flex row that slides right to left as you scroll down. */}
      <div ref={outer}>
        <div className={mobile ? "flex flex-col py-10" : "sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-20"}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 px-5 sm:px-8">
            <h2 className="max-w-[22ch] text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.035em] text-[#11120f]">{t("home.tour.title3", "Everything a support desk needs, in 3 steps")}</h2>
            <div className="flex shrink-0 items-center gap-3">
              <span className="mr-2 hidden font-mono sm:inline text-sm text-[#11120f]/50" aria-live="polite">{String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <button type="button" aria-label={t("home.tour.prev", "Previous")} disabled={current === 0} onClick={() => (mobile ? swipeTo(current - 1) : goTo(current - 1))} className="grid size-12 place-items-center rounded-full border-2 border-[#11120f] bg-white text-[#11120f] transition hover:bg-[#11120f] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#11120f]"><ArrowLeft size={20} /></button>
              <button type="button" aria-label={t("home.tour.next", "Next")} disabled={current === items.length - 1} onClick={() => (mobile ? swipeTo(current + 1) : goTo(current + 1))} className="grid size-12 place-items-center rounded-full border-2 border-[#11120f] bg-white text-[#11120f] transition hover:bg-[#11120f] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#11120f]"><ArrowRight size={20} /></button>
            </div>
          </div>
          <div ref={scroller} className={mobile ? "snap-x snap-mandatory scroll-px-5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : ""}>
          <div ref={strip} className="flex w-max gap-4 px-5 will-change-transform sm:gap-8 sm:px-8">
            {items.map((it, i) => (
              <div key={it.title} className="group flex w-[80vw] shrink-0 snap-start flex-col sm:w-[min(86vw,540px)] overflow-hidden rounded-tl-[2rem] border border-black/20 bg-white">
                {/* The same pastel stage as the product tabs, with the visual sitting on it. */}
                <div className="relative grid min-h-[300px] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden border-b border-black/20 p-5 sm:min-h-[340px] sm:p-6">
                  <div className="relative w-full rounded-2xl border border-black/10 bg-white p-4 shadow-[0_24px_60px_rgba(17,18,15,0.18)] sm:w-auto sm:p-5"><TourVisual k={keys[i]} t={t} p={reduced || mobile ? 1 : Math.min(1, Math.max(0, story - i))} /></div>
                </div>
                <div className="flex flex-1 items-start justify-between gap-6 p-6 sm:p-7">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[13px] text-[#11120f]/55"><it.icon size={15} />{it.tag}</span>
                    <h3 className="mt-3 max-w-[20ch] text-[clamp(1.3rem,1.8vw,1.65rem)] font-medium leading-[1.15] tracking-[-0.025em] text-[#11120f]">{it.title}</h3>
                    <p className="mt-2.5 max-w-[42ch] text-[15px] leading-6 text-[#11120f]/65">{it.desc}</p>
                    <Link href={it.href} className="mt-4 inline-flex items-center gap-2.5 text-[15px] text-[#6a4bc4] underline decoration-1 underline-offset-4 hover:opacity-75">{t("home.tabs.more", "Learn more")} <ArrowRight size={20} strokeWidth={1.5} /></Link>
                  </div>
                  <span className="font-mono text-sm text-[#11120f]/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
          {mobile && (
            <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label={t("home.tour.stepsAria", "Steps")}>
              {items.map((it, i) => (
                <button key={it.title} type="button" role="tab" aria-selected={i === current} aria-label={`${it.tag}`} onClick={() => swipeTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#11120f]" : "w-2 bg-[#11120f]/25"}`} />
              ))}
            </div>
          )}
          <div aria-hidden="true" className={`mx-5 mt-8 h-0.5 overflow-hidden ${mobile ? "hidden" : ""} bg-[#11120f]/10 sm:mx-8`}>
            <span ref={bar} className="block h-full origin-left bg-[#11120f]" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- teams

// Runs once the element first scrolls into view, so the previews below can animate in as they arrive.
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect(); } }, { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, seen] as const;
}

// One message in a ChatWidgetPreview: the AI's in a grey bubble with a byline under it, the visitor's plain and right-aligned.
type ChatLine = { ai: boolean; text: ReactNode; meta?: string };

// The chat widget a visitor sees, drawn in code; its `lines` arrive one by one once `seen`, as in a real chat.
// `className` places it (position and display) over whatever it floats on. `large` is the hero's size: the
// proportions of a real widget (511x779), with type scaled up to match.
function ChatWidgetPreview({ seen, lines, className, large = false }: { seen: boolean; lines: ChatLine[]; className: string; large?: boolean }) {
  const msg = (ms: number) => ({ opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(8px)", transition: `opacity 450ms ease ${ms}ms, transform 450ms ease ${ms}ms` });
  const z = large
    ? { box: "aspect-[511/779] w-[34%] min-w-[260px] max-w-[340px] p-4", icon: "size-8", iconPx: 15, name: "text-[14px]", role: "text-[11.5px]", body: "mt-4 space-y-3 text-[13px] leading-[1.5]", bubble: "rounded-2xl px-3 py-2", meta: "mt-1 text-[10px]", box2: "mt-3 px-3 pb-2 pt-2.5", hint: "text-[12.5px]", tool: 14, send: "size-7", sendPx: 13, foot: "mt-2 text-[10px]" }
    : { box: "w-[38%] min-w-[200px] max-w-[290px] p-3", icon: "size-6", iconPx: 12, name: "text-[11px]", role: "text-[9.5px]", body: "mt-3 space-y-2 text-[10.5px] leading-[1.45]", bubble: "rounded-xl px-2.5 py-1.5", meta: "mt-0.5 text-[8.5px]", box2: "mt-2.5 px-2.5 pb-1.5 pt-2", hint: "text-[10px]", tool: 11, send: "size-5", sendPx: 10, foot: "mt-1.5 text-[8px]" };
  return (
    <div aria-hidden="true" className={`absolute z-10 flex-col rounded-2xl bg-[#fafafa] text-[#11120f] shadow-[0_30px_80px_rgba(15,22,41,0.55)] ring-4 ring-[#8b7cf6]/60 ${z.box} ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`grid ${z.icon} shrink-0 place-items-center rounded-full bg-black/5`}><ChevronLeft size={z.iconPx} /></span>
        <span className="min-w-0 flex-1"><span className={`block ${z.name} font-semibold leading-tight`}>Elpino AI</span><span className={`block ${z.role} leading-tight text-[#11120f]/50`}>AI Assistant</span></span>
        <span className={`grid ${z.icon} shrink-0 place-items-center rounded-full bg-black/5`}><MoreHorizontal size={z.iconPx} /></span>
      </div>
      {/* flex-1 so, at the hero's fixed proportions, the composer sits at the bottom like a real widget's; anything
          that does not fit is cut off at the top, as an older message scrolled out of a real chat would be. */}
      <div className={`flex min-h-0 flex-1 flex-col justify-end overflow-hidden ${z.body}`}>
        {lines.map((line, i) => line.ai
          ? <div key={i} style={msg(500 + i * 1000)}><p className={`w-fit max-w-[92%] bg-[#eef1f4] ${z.bubble}`}>{line.text}</p><p className={`${z.meta} text-[#11120f]/45`}>{line.meta ?? "AI agent · Just now"}</p></div>
          : <p key={i} className="ml-auto w-fit max-w-[85%] text-left" style={msg(500 + i * 1000)}>{line.text}</p>)}
      </div>
      <div className={`rounded-2xl border border-black/15 bg-white ${z.box2}`}>
        <p className={`${z.hint} text-[#11120f]/45`}>Ask anything...</p>
        <div className="mt-3 flex items-center justify-between text-[#11120f]/55">
          <span className="flex items-center gap-1.5"><Paperclip size={z.tool} /><Smile size={z.tool} /></span>
          <span className={`grid ${z.send} place-items-center rounded-full bg-black/10`}><ArrowUp size={z.sendPx} /></span>
        </div>
      </div>
      <p className={`${z.foot} text-center text-[#11120f]/45`}>Powered by <span className="underline">elpino.chat</span></p>
    </div>
  );
}

// The four previews: a reply with the checks behind it, the numbers, the contacts it collects, the plugins it uses.
function TeamPreview({ k, t }: { k: string; t: T }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const mobile = useMobile();
  // The contacts story, in the widget's own order: the AI asks for the email (1), the answer field fills in (2),
  // it is sent and the contact appears (3). The typed value never shows as a visitor bubble, as in the real widget.
  const [stage, setStage] = useState(0);
  const [chars, setChars] = useState(0);
  const CONTACT_EMAIL = "maya@brightly.co";
  useEffect(() => {
    if (k !== "contacts" || !seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage(3); setChars(CONTACT_EMAIL.length); return; }
    const timers = [setTimeout(() => setStage(1), 500), setTimeout(() => setStage(2), 1700), setTimeout(() => setStage(3), 3900)];
    return () => timers.forEach(clearTimeout);
  }, [k, seen]);
  useEffect(() => {
    if (stage < 2) return;
    if (stage >= 3) { setChars(CONTACT_EMAIL.length); return; }
    const tick = setInterval(() => setChars((c) => Math.min(CONTACT_EMAIL.length, c + 1)), 100);
    return () => clearInterval(tick);
  }, [stage]);
  // The identity story: a guest claims a name (1), the AI keeps the account locked (2), the visitor signs in on the
  // host website and its signed token reaches Elpino (3), and only then does the account open (4).
  useEffect(() => {
    if (k !== "verify" || !seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage(4); return; }
    const timers = [setTimeout(() => setStage(1), 400), setTimeout(() => setStage(2), 1500), setTimeout(() => setStage(3), 3200), setTimeout(() => setStage(4), 5000)];
    return () => timers.forEach(clearTimeout);
  }, [k, seen]);
  const rise = (i: number) => ({ opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(10px)", transition: `opacity 500ms ease ${i * 160}ms, transform 500ms ease ${i * 160}ms` });
  let body: ReactNode = null;
  if (k === "verify") {
    const open = stage >= 4;
    const pop = (on: boolean) => ({ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)", transition: "opacity 450ms ease, transform 450ms ease" });
    return (
      <div ref={ref} className="grid min-h-[460px] w-full grid-cols-[minmax(0,1fr)] place-items-center p-4 sm:p-10">
        <div className="w-full max-w-[400px] space-y-3 text-white">
          <div className="ml-auto w-fit max-w-[88%] rounded-2xl bg-[#6c5ce7] px-4 py-2.5 text-[14px] leading-[1.5]" style={pop(stage >= 1)}>{t("home.teams.verify.claim", "I'm Alex Morgan. Show me my invoices.")}</div>
          <div className="w-fit max-w-[92%] rounded-2xl bg-white/10 px-4 py-2.5 text-[14px] leading-[1.5]" style={pop(stage >= 2)}>{open ? t("home.teams.verify.ok", "Thanks, Alex. You're signed in, so here are your invoices.") : t("home.teams.verify.ask", "I can't share account details with a guest. Sign in on the site and I'll check it's really you.")}</div>
          <div className="flex items-center gap-2 pt-1" style={pop(stage >= 2)}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] transition-colors duration-500" style={{ backgroundColor: open ? "rgba(44,138,99,0.3)" : "rgba(183,121,31,0.28)", color: open ? "#7fe0b3" : "#f6c667" }}>
              {open ? <ShieldCheck size={12} /> : <Lock size={12} />}{open ? t("home.teams.verify.verified", "Identity verified") : t("home.teams.verify.locked", "Guest · account locked")}
            </span>
          </div>
          {/* Your website signs the visitor in; Elpino trusts only that signed proof, never what is typed in the chat. */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3" style={pop(stage >= 3)}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><KeyRound size={16} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-medium leading-tight">{t("home.teams.verify.site", "Signed in on your website")}</span><span className="block truncate text-[12px] text-white/55">{t("home.teams.verify.token", "Signed token received · alex@example.com")}</span></span>
            <Check size={16} strokeWidth={3} className="shrink-0 text-[#7fe0b3]" />
          </div>
          {/* What verification unlocks: blurred and out of reach until the visitor is verified. */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5" style={{ opacity: stage >= 2 ? 1 : 0, transition: "opacity 450ms ease" }}>
            <div className="flex items-center justify-between transition-[filter] duration-700" style={{ filter: open ? "none" : "blur(6px)" }}>
              <span><span className="block text-[14.5px] font-medium leading-tight">{t("home.teams.verify.invoice", "Invoice #1042")}</span><span className="block text-[12.5px] text-white/55">{t("home.teams.verify.plan", "Growth plan · paid")}</span></span>
              <span className="text-[16px] font-medium">$59.00</span>
            </div>
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center transition-opacity duration-500" style={{ opacity: open ? 0 : 1 }}><Lock size={18} className="text-white/70" /></span>
          </div>
        </div>
      </div>
    );
  }
  // The team's inbox with the visitor's chat widget floating over its corner: both sides of the same conversation.
  if (k === "reply") {
    return (
      <div ref={ref} className="relative">
        <Image src="/images/ai_repli.png" alt="The Elpino inbox: the AI replying to a visitor while the team watches" width={1462} height={877} className="h-auto w-full rounded-2xl" sizes="(min-width: 1024px) 560px, 90vw" />
        {/* The visitor's side of the same chat as the inbox screenshot, drawn in code so the two always agree. */}
        <ChatWidgetPreview seen={seen} className="-bottom-10 right-4 flex sm:right-8" lines={[
          { ai: true, text: "Hi there 👋 How can I help you today?" },
          { ai: false, text: "Hi" },
          { ai: true, text: "Hey! What can I help you with today?" },
          { ai: false, text: "Who are you" },
          { ai: true, text: <>I&apos;m <strong>Elpino AI</strong>, the AI assistant for this site. I answer questions, help with support and billing, and hand things over to a real teammate when you need one.</> },
        ]} />
      </div>
    );
  }
  if (k === "analytics")
    return <Image src="/images/analaytic.png" alt="The Elpino web analytics dashboard: visitors, page views, sessions, session duration, bounce rate and unique visitors over time" width={1749} height={763} className="h-auto w-full rounded-2xl" sizes="(min-width: 1024px) 560px, 90vw" />;
  if (k === "plugins") {
    // A fan of plugins around the Elpino hub: arcs, spokes with a pulse running out to each one, icons popping in.
    const W = 560, H = 460, HUB = [280, 470] as const;
    const fan = mobile ? 0.8 : 1; // phones: a tighter fan so the outer icons stay inside the frame
    // The integrations Elpino actually has, nine in two arcs: payments and stores nearest the hub, the rest outside.
    const nodes = [
      { id: "stripe", name: "Stripe", r: 255, a: 165 }, { id: "razorpay", name: "Razorpay", r: 255, a: 135 }, { id: "cashfree", name: "Cashfree", r: 255, a: 105 },
      { id: "paystack", name: "Paystack", r: 255, a: 75 }, { id: "asana", name: "Asana", r: 255, a: 45 }, { id: "trello", name: "Trello", r: 255, a: 15 },
      { id: "shopify", name: "Shopify", r: 165, a: 135 }, { id: "woocommerce", name: "WooCommerce", r: 165, a: 90 }, { id: "hubspot", name: "HubSpot", r: 165, a: 45 },
    ].map((n) => ({ ...n, x: HUB[0] + n.r * fan * Math.cos((n.a * Math.PI) / 180), y: HUB[1] - n.r * fan * Math.sin((n.a * Math.PI) / 180) }));
    return (
      <div ref={ref} className="relative aspect-[560/460] w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_60px_rgba(15,22,41,0.12)]" style={{ backgroundImage: "radial-gradient(60% 55% at 50% 100%, rgba(55,132,255,0.09) 0%, rgba(55,132,255,0) 70%), radial-gradient(rgba(17,18,15,0.07) 1px, transparent 1px)", backgroundSize: "auto, 18px 18px" }}>
        <style>{`@keyframes elp-spoke { from { stroke-dashoffset: 12 } to { stroke-dashoffset: -100 } } @keyframes elp-halo { from { transform: translate(-50%,-50%) scale(1); opacity: .35 } to { transform: translate(-50%,-50%) scale(1.55); opacity: 0 } } @media (prefers-reduced-motion: reduce) { .elp-spoke, .elp-halo { animation: none !important } }`}</style>
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[12px] text-[#11120f]/70 backdrop-blur" style={{ opacity: seen ? 1 : 0, transition: "opacity 500ms ease 100ms" }}>
          <span className="size-1.5 rounded-full bg-[#1aa37a]" />{t("home.teams.plugins.live", "9 plugins connected")}
        </span>
        <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full">
          {[100, 165, 255].map((r) => <circle key={r} cx={HUB[0]} cy={HUB[1]} r={r * fan} fill="none" stroke="#e3e7f1" strokeWidth="1.2" strokeDasharray={r === 100 ? "3 5" : undefined} />)}
          {nodes.map((n, i) => (
            <g key={n.id} style={{ opacity: seen ? 1 : 0, transition: `opacity 500ms ease ${300 + i * 110}ms` }}>
              <line x1={HUB[0]} y1={HUB[1]} x2={n.x} y2={n.y} stroke="#e3e7f1" strokeWidth="1.2" />
              <line className="elp-spoke" x1={HUB[0]} y1={HUB[1]} x2={n.x} y2={n.y} stroke="#3784ff" strokeWidth="2.2" strokeLinecap="round" pathLength={100} strokeDasharray="12 100" style={{ animation: seen ? `elp-spoke 3s linear ${1 + i * 0.35}s infinite` : "none" }} />
            </g>
          ))}
        </svg>
        {nodes.map((n, i) => (
          <span key={n.id} className="absolute flex flex-col items-center" style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, transform: `translate(-50%,-50%) translateY(${seen ? 0 : 8}px)`, opacity: seen ? 1 : 0, transition: `opacity 450ms ease ${i * 110}ms, transform 450ms cubic-bezier(.2,.8,.2,1) ${i * 110}ms` }}>
            <span className="grid size-[clamp(40px,10.5vw,58px)] place-items-center rounded-2xl border border-black/[0.07] bg-white p-[22%] shadow-[0_8px_22px_rgba(15,22,41,0.1)] sm:size-[58px]">
              <ConnectorLogo provider={n.id} alt={n.name} className="size-full object-contain" fallback={<span className="text-sm font-semibold">{n.name[0]}</span>} />
            </span>
            <span className="absolute top-full mt-1.5 hidden whitespace-nowrap text-[11px] sm:block font-medium text-[#11120f]/55">{n.name}</span>
          </span>
        ))}
        {/* The hub, half out of view at the bottom: the Elpino mark with a soft halo that keeps pulsing out. */}
        {[0, 1.2].map((d) => <span key={d} aria-hidden="true" className="elp-halo absolute left-1/2 aspect-square w-[28%] rounded-full border border-[#3784ff]/40" style={{ top: `${(HUB[1] / H) * 100}%`, transform: "translate(-50%,-50%)", animation: seen ? `elp-halo 3.6s ease-out ${d}s infinite` : "none" }} />)}
        <span aria-hidden="true" className="absolute left-1/2 z-10 grid aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 place-items-start justify-items-center rounded-full border border-black/10 bg-white shadow-[0_0_0_8px_rgba(55,132,255,0.08),0_20px_50px_rgba(15,22,41,0.18)]" style={{ top: `${(HUB[1] / H) * 100}%` }}>
          <img src="/icon0.svg" alt="" className="mt-[14%] w-[34%]" />
        </span>
      </div>
    );
  }
  if (k === "contacts")
    body = (
      // A dark contacts table behind, a frosted chat in front: the chat is where the lead is captured.
      <div className="relative w-full max-w-[560px] sm:min-h-[430px]">
        <div className="w-full rounded-xl sm:w-[88%] border border-white/10 bg-[#1b2236] p-3 text-white shadow-[0_20px_50px_rgba(15,22,41,0.35)]">
          <p className="border-b border-white/15 px-2 pb-2 text-[15px]">{t("home.teams.contacts.label", "Contacts")}</p>
          <div className="mt-3 overflow-hidden rounded-md border border-white/10 text-[12px]">
            <div className="grid grid-cols-[1fr_1.4fr_auto] sm:grid-cols-[1.1fr_1.5fr_0.8fr] bg-white/[0.04] px-3 py-2 font-semibold"><span>{t("home.teams.contacts.name", "Name")}</span><span>{t("home.teams.contacts.contact", "Email or phone")}</span><span>{t("home.teams.contacts.status", "Status")}</span></div>
            <div className="grid transition-[grid-template-rows,opacity] duration-500 ease-out" style={{ gridTemplateRows: stage >= 3 ? "1fr" : "0fr", opacity: stage >= 3 ? 1 : 0 }}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-[1fr_1.4fr_auto] sm:grid-cols-[1.1fr_1.5fr_0.8fr] items-center border-t border-[#8b7cf6] bg-[#6c5ce7]/25 px-3 py-2.5"><span>Maya Chen</span><span className="truncate text-white/75">maya@brightly.co</span><span><span className="rounded-full bg-[#6c5ce7] px-2 py-0.5 text-[10.5px]">{t("home.teams.contacts.new", "New lead")}</span></span></div>
              </div>
            </div>
            {[["Tom Ruiz", "+1 415 555 0142", "Customer"], ["Aisha Khan", "aisha@northwind.io", "Customer"], ["Daniel Cole", "daniel@fernhill.com", "Customer"], ["Priya Nair", "+44 20 7946 0123", "Customer"]].map(([name, detail, tag], i) => (
              <div key={name} className="grid grid-cols-[1fr_1.4fr_auto] sm:grid-cols-[1.1fr_1.5fr_0.8fr] items-center border-t border-white/10 px-3 py-2.5 text-white/80" style={rise(i * 0.4)}><span>{name}</span><span className="truncate">{detail}</span><span>{tag}</span></div>
            ))}
          </div>
        </div>
        <div className="relative mt-3 w-full rounded-xl border border-white/60 sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:w-[80%] bg-white/55 p-4 text-[#11120f] shadow-[0_24px_60px_rgba(15,22,41,0.3)] backdrop-blur-xl">
          <div style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "none" : "translateY(8px)", transition: "opacity 450ms ease, transform 450ms ease" }}>
            <p className="w-fit max-w-[92%] rounded-xl bg-black/10 px-3 py-2 text-[13.5px] leading-[1.45]">{t("home.teams.contacts.ask", "What's your email, just in case we get disconnected?")}</p>
          </div>
          {stage < 3 ? (
            // The message box turns into an answer field for exactly what the AI asked.
            <div className="mt-2.5 max-w-[92%]" style={{ opacity: stage >= 1 ? 1 : 0, transition: "opacity 450ms ease 200ms" }}>
              <div className="flex items-center rounded-md border border-black/25 bg-white/80 py-1.5 pl-3 pr-1.5">
                <span className="h-7 min-w-0 flex-1 truncate text-[13.5px] leading-7">{chars > 0 ? CONTACT_EMAIL.slice(0, chars) : <span className="text-[#11120f]/40">you@example.com</span>}</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300" style={{ backgroundColor: chars > 0 ? "#18181b" : "#eceef0", color: chars > 0 ? "#fff" : "#b5b8bd" }}><ArrowUp size={14} strokeWidth={2.2} /></span>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-[#11120f]/55"><span>{t("home.teams.contacts.agent", "AI agent · Just now")}</span><span className="underline underline-offset-2">{t("home.teams.contacts.skip", "Skip")}</span></div>
            </div>
          ) : (
            <div className="mt-2.5" style={{ animation: "elpino-rv-up 0.5s ease both" }}>
              <p className="w-fit max-w-[92%] rounded-xl bg-black/10 px-3 py-2 text-[13.5px] leading-[1.45]">{t("home.teams.contacts.thanks", "Thanks, Maya! Is there anything else I can help you with?")}</p>
              <p className="mt-1 px-1 text-[11px] text-[#11120f]/55">{t("home.teams.contacts.agent", "AI agent · Just now")}</p>
            </div>
          )}
        </div>
      </div>
    );
  return <div ref={ref} className="grid min-h-[460px] w-full grid-cols-[minmax(0,1fr)] place-items-center p-4 sm:p-10">{body}</div>;
}

// Four things a team does with Elpino. Each is a row: a preview on a soft frame, with the explanation beside it,
// the sides alternating down the page.
function Teams({ t }: { t: T }) {
  const keys = ["verify", "reply", "analytics", "contacts", "plugins"];
  const hrefs = ["/product/ai-agent", "/product/ai-agent", "/product/helpdesk", "/product/inbox", "/integrations"];
  const items = tList<{ tag: string; title: string; desc: string; note: string; points: string[] }>(t, "home.teams.cards", [
    { tag: "Identity verification", title: "Nobody gets in just by claiming a name", desc: "A name or an email typed into a chat proves nothing. Elpino opens private account data only for visitors your own website has signed in and vouched for, so a guest pretending to be someone else gets nothing.", note: "Payment and order lookups use only the verified email from your login, and logging out ends the chat session straight away.", points: ["Your site signs the user in, and Elpino trusts only that", "Guests can chat, but private tools stay locked", "Logging out ends the session at once"] },
    { tag: "AI replies", title: "See exactly what the AI replies", desc: "Every reply shows its working: the pages of your knowledge it drew on and the payment or order it looked up in your connected tools. Nothing the AI says is a black box.", note: "Watch the conversation live from the inbox and step in when a person is needed. Your team gets the full story, so nobody asks the customer to repeat themselves.", points: ["See the pages and tools behind each reply", "Read each reply as the customer sees it", "Join in one click with the full context"] },
    { tag: "Analytics", title: "See who visits and what they do", desc: "Web analytics sits right next to your inbox. Track visitors, page views, sessions, time on site and bounce rate for the last 7 days or any period, and compare it with the one before.", note: "Real visitors are counted apart from bots, so the numbers describe people. Filter by domain and save presets for the views you check most.", points: ["Visitors, page views, sessions and bounce rate", "Compare with the previous period", "Filter by domain and save your favourite views"] },
    { tag: "Contacts", title: "Turn chats into contacts", desc: "Every visitor who shares an email or phone number lands in your built-in CRM, with their whole conversation history attached.", note: "Whenever you speak to someone you see who they are and what they asked before, so every reply feels personal.", points: ["Leads captured right in the chat", "History and plan beside every contact", "Synced with HubSpot"] },
    { tag: "Plugins", title: "Plug into the tools you already use", desc: "Connect payments, stores, CRMs and ticketing tools in minutes, so every answer comes from live data instead of a guess.", note: "Elpino reads and acts through the plugins you switch on, and only with the permissions you give it.", points: ["Payments, orders and plans, looked up live", "Tickets filed in Asana or Trello", "Switch a plugin off at any time"] },
  ]).map((item, i) => ({ ...item, href: hrefs[i] }));
  return (
    <section className="bg-white px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:px-16">
      <div>
        <Rv><p className="text-[15px] text-[#11120f]/55">{t("home.teams.eyebrow", "Built for trust")}</p></Rv>
        <Rv delay={80}><h2 className="mt-3 max-w-[22ch] text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.035em] text-[#11120f]">{t("home.teams.title", "Know who is asking, and see what the AI says")}</h2></Rv>
        <div className="mt-14 space-y-20 lg:mt-20 lg:space-y-28">
          {items.map((it, i) => (
            <div key={it.tag} className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <Rv variant="deal" className={i % 2 === 1 ? "lg:order-2" : ""}>
                {/* A soft, blurred pastel frame around a dark panel, the preview inside it. */}
                <div className={`relative rounded-[2rem] p-5 sm:p-7 ${keys[i] === "reply" ? "" : "overflow-hidden"}`} style={{ backgroundColor: "#eeeeec", backgroundImage: ["radial-gradient(60% 55% at 0% 0%, rgba(176,222,196,0.85) 0%, rgba(176,222,196,0) 70%)", "radial-gradient(55% 60% at 100% 10%, rgba(150,142,184,0.8) 0%, rgba(150,142,184,0) 70%)", "radial-gradient(60% 55% at 10% 100%, rgba(238,196,190,0.75) 0%, rgba(238,196,190,0) 70%)", "radial-gradient(55% 55% at 100% 100%, rgba(205,200,216,0.9) 0%, rgba(205,200,216,0) 70%)"].join(", ") }}>
                  {keys[i] === "contacts" || keys[i] === "plugins" ? <TeamPreview k={keys[i]} t={t} /> : <div className={`relative rounded-2xl bg-[#0f1629] shadow-[0_24px_60px_rgba(15,22,41,0.35)] ${keys[i] === "reply" ? "" : "overflow-hidden"}`}><TeamPreview k={keys[i]} t={t} /></div>}
                </div>
              </Rv>
              <Rv delay={120} className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="max-w-lg">
                  <h3 className="text-[clamp(1.6rem,2.4vw,2.2rem)] font-medium leading-[1.12] tracking-[-0.03em] text-[#11120f]">{it.title}</h3>
                  <p className="mt-4 text-[17px] leading-7 text-[#11120f]/70">{it.desc}</p>
                  <p className="mt-4 text-[17px] leading-7 text-[#11120f]/70">{it.note}</p>
                  <ul className="mt-6 space-y-3">
                    {it.points.map((point) => <li key={point} className="flex items-start gap-3 text-[16px] leading-6 text-[#11120f]"><Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#6a4bc4]" />{point}</li>)}
                  </ul>
                  <Link href={it.href} className="mt-6 inline-flex w-fit items-center gap-2.5 text-[16px] text-[#6a4bc4] underline decoration-1 underline-offset-4 hover:opacity-75">{t("home.tabs.more", "Learn more")} <ArrowRight size={20} strokeWidth={1.5} /></Link>
                </div>
              </Rv>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- autopilot

const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
// Cents only when there are some, so a receipt's lines add up to its total exactly.
const moneyC = (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
const cents = (v: number) => Math.round(v * 100) / 100;

// A number that glides to its new value instead of jumping.
function useTween(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const began = performance.now();
    const start = from.current;
    let frame = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - began) / 650);
      const eased = 1 - Math.pow(1 - k, 3);
      from.current = start + (target - start) * eased;
      setValue(from.current);
      if (k < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

type Rival = "zendesk" | "intercom" | "crisp";
const RIVALS: { id: Rival; name: string }[] = [{ id: "zendesk", name: "Zendesk" }, { id: "intercom", name: "Intercom" }, { id: "crisp", name: "Crisp" }];

// Each helpdesk's mark, shown at the top of its receipt. The rivals' are used only to say whose bill it is.
const BILL_LOGOS: Record<Rival | "elpino", string> = { elpino: "/icon0.svg", zendesk: "/competitor-logos/zendesk.svg", intercom: "/competitor-logos/intercom.svg", crisp: "/competitor-logos/crisp.png" };

type Line = { label: string; detail?: string; amount: string };
type Bill = { name: string; month: number; lines: Line[] };

// One month's bill from each helpdesk for the same team and the same AI work, itemised. Rivals' figures are their public
// list prices (checked 1 Oct 2026, USD): Zendesk Suite Team $55 per agent (the first tier with AI agents) with 5 automated resolutions per agent
// included then $1.50 each, Intercom Essential $29 per seat plus $0.99 per Fin outcome, Crisp Mini/Essentials/Plus flat
// per workspace with about 5.6 cents per conversation beyond the AI credit the plan includes. Elpino has no commitment: a
// team stays on the Starter plan ($10 a month on annual billing, $7 of AI credit included, seats unlimited) and tops up AI
// credit only when it needs more, at the team's ceiling of $0.03 a conversation. Topped-up credit carries forward.
function bills(seats: number, conversations: number): Record<Rival | "elpino", Bill> {
  const topUp = Math.max(0, conversations * 0.03 - 7);
  const crisp = seats <= 4 ? { name: "Mini", price: 45, included: 90 } : seats <= 10 ? { name: "Essentials", price: 95, included: 450 } : { name: "Plus", price: 295, included: 1350 };
  const cSeats = Math.max(0, seats - 20) * 10; // Plus includes 20 seats, $10 a month for each one after that
  const zExtra = Math.max(0, conversations - 5 * seats);
  const cExtra = Math.max(0, conversations - crisp.included);
  const zAi = cents(zExtra * 1.5);
  const cAi = cents(cExtra * (5 / 90));
  const iAi = cents(conversations * 0.99);
  return {
    elpino: { name: "Elpino", month: 10 + topUp, lines: [{ label: "Starter plan", detail: "annual billing", amount: "$10" }, { label: "Seats", detail: "unlimited", amount: "$0" }, { label: "AI top-up", detail: topUp > 0 ? `${conversations.toLocaleString("en-US")} × $0.03, less $7 included` : "covered by the $7 included", amount: money(topUp) }] },
    zendesk: { name: "Zendesk", month: seats * 55 + zAi, lines: [{ label: "Suite Team seats", detail: `${seats} × $55`, amount: money(seats * 55) }, { label: "AI", detail: `${zExtra.toLocaleString("en-US")} beyond ${5 * seats} included × $1.50`, amount: moneyC(zAi) }] },
    intercom: { name: "Intercom", month: seats * 29 + iAi, lines: [{ label: "Seats", detail: `${seats} × $29`, amount: money(seats * 29) }, { label: "AI", detail: `${conversations.toLocaleString("en-US")} × $0.99`, amount: moneyC(iAi) }] },
    crisp: { name: "Crisp", month: crisp.price + cSeats + cAi, lines: [{ label: `${crisp.name} plan`, amount: money(crisp.price) }, ...(cSeats > 0 ? [{ label: "Extra seats", detail: `${seats - 20} × $10`, amount: money(cSeats) }] : []), { label: "AI extra", detail: `${cExtra.toLocaleString("en-US")} beyond ${crisp.included} included × $5 ÷ 90`, amount: moneyC(cAi) }] },
  };
}

// The pricing promise, laid out like the "hours back" section: the saving as the headline, with the sliders and two
// short paragraphs under it, and one printed receipt per helpdesk on the right. The paper gets longer as the bill
// does, so the saving reads at a glance. The saving is against the average of the three rivals until a receipt is clicked.
function Autopilot({ t }: { t: T }) {
  const [seats, setSeats] = useState(3);
  const [conversations, setConversations] = useState(500);
  const [vs, setVs] = useState<Rival | null>(null);
  const [ref, seen] = useSeen<HTMLDivElement>();
  const all = bills(seats, conversations);
  const order: (Rival | "elpino")[] = ["elpino", "zendesk", "intercom", "crisp"];
  // The headline is measured against the cheapest of the three, never an average that a dear setup could inflate.
  const cheapest = RIVALS.reduce((best, r) => (all[r.id].month < all[best].month ? r.id : best), RIVALS[0].id);
  const target = vs ?? cheapest;
  const savingVs = (id: Rival) => (all[id].month - all.elpino.month) * 12;
  const saving = savingVs(target);
  const shown = useTween(saving);
  const topMonth = Math.max(...order.map((k) => all[k].month));
  const slider = "mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white";
  const zigzag = { WebkitMask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%", mask: "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%" } as const;
  return (
    <section className="bg-black px-6 py-6 text-white sm:px-12">
      <div className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-10">
            <Rv>
              <h2 className="text-[clamp(2.8rem,5.2vw,4.6rem)] font-normal leading-none tracking-[-0.035em] tabular-nums" style={{ color: "#a6e05a" }} aria-live="polite">{saving > 0 ? `${t("home.autopilot.save", "Save")} ${money(shown)} ${t("home.autopilot.perYear", "a year")}` : t("home.autopilot.close", "About the same")}</h2>
              <p className="mt-4 text-base text-white/65">{`${t("home.autopilot.comparedWith", "compared with")} ${all[target].name}${vs ? "" : `, ${t("home.autopilot.cheapest", "the cheapest of the three")}`}`}</p>
              {/* Every comparison, so nothing is hidden behind the headline. */}
              <ul className="mt-6 max-w-sm divide-y divide-white/15 border-y border-white/15 text-[15px]" aria-label={t("home.autopilot.each", "Saving against each")}>
                {RIVALS.map((r) => {
                  const value = savingVs(r.id);
                  return (
                    <li key={r.id} className="flex items-center justify-between py-2.5" style={{ color: r.id === target ? "#fff" : "rgba(255,255,255,0.6)" }}>
                      <span>{t("home.autopilot.youSave", "You save vs")} {r.name}</span>
                      <span className="tabular-nums">{value > 0 ? `${money(value)} ${t("home.autopilot.yr", "a year")}` : t("home.autopilot.same", "about the same")}</span>
                    </li>
                  );
                })}
              </ul>
            </Rv>
            <Rv delay={80}>
              <div className="max-w-sm space-y-6">
                <label className="block text-sm"><span className="flex justify-between text-white/70"><span>{t("home.autopilot.seats", "Seats")}</span><span className="text-white">{seats}</span></span>
                  <input type="range" min={1} max={40} step={1} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={slider} aria-label={t("home.autopilot.seats", "Seats")} /></label>
                <label className="block text-sm"><span className="flex justify-between text-white/70"><span>{t("home.autopilot.conversations", "AI conversations / mo")}</span><span className="text-white">{conversations.toLocaleString("en-US")}</span></span>
                  <input type="range" min={100} max={5000} step={100} value={conversations} onChange={(e) => setConversations(Number(e.target.value))} className={slider} aria-label={t("home.autopilot.conversations", "AI conversations / mo")} /></label>
              </div>
            </Rv>
            <Rv delay={140}>
              <div className="max-w-sm space-y-5 text-lg leading-7 text-white/70">
                <p>{t("home.autopilot.p1", "Unlimited seats on every plan, even Free, so you can grow your team without growing your software bill.")}</p>
                <p>{t("home.autopilot.p2", "No commitment. Stay on the $10 plan and top up AI credit only when you need it, at $0.03 a conversation at most. Top-ups carry forward, and there is never an overage bill.")}</p>
              </div>
            </Rv>
          </div>

          <Rv delay={80}>
            <div ref={ref}>
              {/* The receipts print out of a slot, one per helpdesk: Elpino's is the short one. Click a rival's to compare with just that one. */}
              <div className="rounded-tl-[2rem] border border-white/15 bg-[#121212] px-4 pb-6 pt-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm"><p>{t("home.autopilot.bills", "One month's bill, itemised")}</p><p className="text-white/65">{seats} {t("home.autopilot.seatsUnit", "seats")} · {conversations.toLocaleString("en-US")} {t("home.autopilot.convUnit", "AI conversations")}</p></div>
                <div className="relative mt-3 h-2.5 rounded-full bg-black shadow-[inset_0_1px_3px_rgba(255,255,255,0.18),0_0_0_1px_rgba(255,255,255,0.12)]" />
                <div className="-mt-0.5 grid grid-cols-2 items-start gap-x-3 gap-y-6 px-1.5 sm:grid-cols-4 sm:gap-x-4">
                  {order.map((id, i) => {
                    const bill = all[id];
                    const own = id === "elpino";
                    const chosen = own || vs === null || id === vs;
                    const paper = (
                      <div className={`overflow-hidden px-3.5 pb-9 pt-4 text-left text-[#11120f] ${own ? "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]" : "bg-[#dcd9d0]"}`} style={{ ...zigzag, height: seen ? `${345 + (bill.month / topMonth) * 150}px` : "0px", transition: `height 1000ms cubic-bezier(.2,.8,.2,1) ${i * 130}ms` }}>
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={BILL_LOGOS[id]} alt="" aria-hidden="true" className="size-5 shrink-0 rounded-[4px] object-contain" />
                          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: own ? GREEN_INK : "rgba(17,18,15,0.7)" }}>{bill.name}</p>
                        </div>
                        <div className="mt-3 space-y-2.5 border-t border-dashed border-black/25 pt-3">
                          {bill.lines.map((l) => (
                            <div key={l.label}>
                              <div className="flex items-baseline justify-between gap-1 text-[12.5px]"><span className="font-medium">{l.label}</span><span className="tabular-nums">{l.amount}</span></div>
                              {l.detail && <p className="text-[10.5px] text-[#11120f]/55">{l.detail}</p>}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 border-t border-dashed border-black/25 pt-3">
                          <p className="text-[10.5px] uppercase tracking-wider text-[#11120f]/55">{t("home.autopilot.perMonth", "Per month")}</p>
                          <p className="text-[18px] font-semibold tabular-nums">{moneyC(bill.month)}</p>
                          <p className="mt-2 text-[10.5px] uppercase tracking-wider text-[#11120f]/55">{t("home.autopilot.perYearLabel", "Per year")}</p>
                          <p className="text-[22px] font-semibold leading-none tabular-nums" style={{ color: own ? GREEN_INK : undefined }}>{moneyC(cents(bill.month * 12))}</p>
                        </div>
                      </div>
                    );
                    return own
                      ? <div key={id}>{paper}</div>
                      : <button key={id} type="button" aria-pressed={vs === id} aria-label={`${t("home.autopilot.compareWith", "Compare with")} ${bill.name}`} onClick={() => setVs(vs === id ? null : (id as Rival))} className="block w-full cursor-pointer text-left transition-opacity duration-300 hover:opacity-100" style={{ opacity: chosen ? 1 : 0.55 }}>{paper}</button>;
                  })}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <p className="max-w-xl text-[12.5px] leading-5 text-white/50">{t("home.autopilot.footnote", "Public list prices in USD, checked 1 October 2026 (Zendesk Suite Team, the first Zendesk tier with AI agents; Intercom Essential; Crisp Mini, Essentials or Plus by team size), annual billing where shown, for the same number of seats and AI conversations on every product. Excludes taxes, add-ons and enterprise discounts. Intercom and Zendesk charge only for conversations the AI resolves; Elpino charges for every AI conversation it handles, resolved or not. This comparison assumes every AI conversation is resolved, which is the most those two would bill. Elpino: Starter plan on annual billing ($10 a month, $7 of AI credit included), unlimited seats, and AI credit topped up at up to $0.03 a conversation.")}</p>
                <Link href="/pricing" className="inline-flex shrink-0 items-center gap-2.5 text-[15px] text-white underline decoration-1 underline-offset-4 hover:opacity-75">{t("home.autopilot.cta", "See pricing")} <ArrowRight size={18} strokeWidth={1.5} /></Link>
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- shared

type Node = { id: string; name: string; c: string; logo?: string; icon?: ReactNode };
// -------------------------------------------------------------- faq + cta

// The questions people ask first, as a one-at-a-time accordion beside the headline.
function Faq({ t }: { t: T }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = tList<{ q: string; a: string }>(t, "home.faq.items", [
    { q: "What is Elpino?", a: "An AI customer support platform: a website chat widget, an AI agent that answers from your knowledge and checks real payments, a shared team inbox, and tickets when nobody's free." },
    { q: "Will the AI make things up?", a: "It answers from the knowledge you've approved, and a review pass checks drafts against tool results. When it doesn't know, it says so and offers a person." },
    { q: "What happens when it can't help?", a: "It asks the customer first. On a yes, every teammate gets a Join alert and has 90 seconds to jump in. If nobody does, a ticket is filed and the customer is emailed." },
    { q: "How long does setup take?", a: "Most teams are live the same day: add your knowledge, paste the widget snippet and invite your team." },
    { q: "Is there a free plan?", a: "Yes: 100 AI messages a month, no card required." },
    { q: "Does it work on other channels?", a: "Website chat is live today. Omnichannel is coming in November." },
  ]);
  return (
    <section id="faq" className="bg-white px-6 py-6 text-[#11120f] sm:px-12">
      <div className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between gap-10">
            <Rv><h2 className="max-w-[12ch] text-[clamp(2.4rem,4.6vw,4rem)] font-normal leading-[1.05] tracking-[-0.03em]">{t("home.faq.titlePrefix", "Things people")} {t("home.faq.titleHl", "ask first.")}</h2></Rv>
            <Rv delay={100}>
              <p className="max-w-xs text-lg leading-7 text-[#11120f]/70">{t("home.faq.more", "Can't find your answer?")}{" "}
                <Link href="/contact" className="text-[#6a4bc4] underline decoration-1 underline-offset-4 hover:opacity-75">{t("home.faq.talk", "Talk to us")}</Link>
              </p>
            </Rv>
          </div>
          <Rv delay={80}>
            <div className="border-b border-black/20">
              {items.map((it, i) => {
                const isOpen = open === i;
                return (
                  <div key={it.q} className="border-t border-black/20">
                    <h3>
                      <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                        <span className="text-[clamp(1.15rem,1.7vw,1.4rem)] font-medium leading-snug tracking-[-0.015em]">{it.q}</span>
                        <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${isOpen ? "border-[#11120f] bg-[#11120f] text-white" : "border-black/25 text-[#11120f]"}`}><Plus size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} /></span>
                      </button>
                    </h3>
                    <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden"><p className="max-w-2xl pb-7 text-[17px] leading-7 text-[#11120f]/70">{it.a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// The last word before the footer: one sentence, two buttons, the sloth waiting at the bottom edge.
function Closing({ t }: { t: T }) {
  return (
    <section className="bg-white px-6 pb-20 pt-10 text-[#11120f] sm:px-12 sm:pb-28">
      <Rv>
        <div className="relative isolate overflow-hidden rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-12 sm:py-20 lg:min-h-[440px]">
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(rgba(17,18,15,0.12) 1px, transparent 1px)", backgroundSize: "20px 20px", maskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)" }} />
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-normal leading-[1.04] tracking-[-0.035em]">{t("home.closing.title", "Give your customers the answer before they finish typing.")}</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#11120f]/65">{t("home.closing.subtitle", "Start free, teach it your business, and let it take the repeat questions.")}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-7 text-[15px] font-medium text-white transition hover:opacity-85">{t("home.closing.ctaPrimary", "Start free")} <ArrowRight size={18} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-1" /></Link>
              <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-7 text-[15px] font-medium transition hover:border-black/60">{t("home.closing.ctaSecondary", "Talk to us")}</Link>
            </div>
          </div>
          <Image src="/images/elpino-mascot-4.png" alt="A friendly cartoon Elpino sloth ready to support customers" width={434} height={724} className="pointer-events-none absolute -bottom-2 right-8 hidden h-[88%] w-auto object-contain object-bottom drop-shadow-[0_24px_40px_rgba(17,18,15,0.25)] lg:block" sizes="320px" />
        </div>
      </Rv>
    </section>
  );
}

// A one-line promise straight after the hero, and the tools Elpino plugs into today.
const TOOL_LOGOS: Node[] = [
  { id: "stripe", name: "Stripe", c: "#635bff", logo: "stripe" },
  { id: "razorpay", name: "Razorpay", c: "#2465dc", logo: "razorpay" },
  { id: "cashfree", name: "Cashfree", c: "#0a8f5a", logo: "cashfree" },
  { id: "paystack", name: "Paystack", c: "#0ba4db", logo: "paystack" },
  { id: "shopify", name: "Shopify", c: "#5e8e3e", logo: "shopify" },
  { id: "woocommerce", name: "WooCommerce", c: "#7f54b3", logo: "woocommerce" },
  { id: "hubspot", name: "HubSpot", c: "#ff7a59", logo: "hubspot" },
  { id: "asana", name: "Asana", c: "#f06a6a", logo: "asana" },
  { id: "trello", name: "Trello", c: "#0c66e4", logo: "trello" },
  { id: "mcp", name: "MCP", c: ORANGE, icon: <Plug size={36} color={ORANGE} /> },
];

// Five logos in a bordered box with a divider between each. Every 3 seconds the row slides one cell to
// the left and the next connector comes in on the right, forever. Six cells are rendered (the five in view
// plus the incoming one); after each slide the window moves on by one and the track snaps back unseen.
const VISIBLE_DESKTOP = 5;
const VISIBLE_MOBILE = 3;
const STEP_MS = 7000;
const SLIDE_MS = 500;

function LogoStepper() {
  const reduced = useReduced();
  const mobile = useMobile();
  const VISIBLE = mobile ? VISIBLE_MOBILE : VISIBLE_DESKTOP;
  const [start, setStart] = useState(0);
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setSliding(true), STEP_MS);
    return () => window.clearTimeout(id);
  }, [start, reduced]);
  const cells = Array.from({ length: VISIBLE + 1 }, (_, i) => TOOL_LOGOS[(start + i) % TOOL_LOGOS.length]);
  return (
    <div className="mt-8 w-full overflow-hidden rounded-none border border-black/100 sm:border-2">
      <ul
        className="flex"
        style={{ width: `${((VISIBLE + 1) / VISIBLE) * 100}%`, transform: sliding ? `translateX(-${100 / (VISIBLE + 1)}%)` : "none", transition: sliding ? `transform ${SLIDE_MS}ms ease-in-out` : "none" }}
        onTransitionEnd={() => { setSliding(false); setStart((v) => (v + 1) % TOOL_LOGOS.length); }}
      >
        {cells.map((n, i) => (
          <li key={`${start}-${i}`} aria-hidden={i === VISIBLE} className="flex h-32 flex-1 flex-col items-center justify-center gap-3 border-l border-black/100 first:border-l-0 sm:h-36 sm:border-l-2">
            <span className="grid size-14 place-items-center overflow-hidden">
              {n.icon ?? <ConnectorLogo provider={n.logo} alt="" className="size-full object-contain" fallback={<span className="text-3xl font-black" style={{ color: n.c }}>{n.name[0]}</span>} />}
            </span>
            <span className="max-w-full truncate px-1 text-[11px] text-[#11120f]/60">{n.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolsLine({ t }: { t: T }) {
  return (
    <section className="bg-white px-6 sm:px-12 py-16 sm:py-20">
      <Rv><h2 className="mx-auto max-w-4xl text-center text-xl font-normal text-[#11120f]">{t("home.toolsLine.title", "Connects to the payment, store, CRM and ticketing tools you already use, in minutes, not sprints.")}</h2></Rv>
      <Rv delay={120}><LogoStepper /></Rv>
    </section>
  );
}

// The visitor's own numbers: how much of their team's time goes on support today, and how much is left when
// Elpino answers the repeat questions. No claim about results is made; the assumptions are shown and adjustable.
const GREEN_INK = "#4a6a12";
const HATCH = "repeating-linear-gradient(135deg, rgba(17,18,15,0.85) 0 1px, transparent 1px 6px)";

function TimeSaved({ t }: { t: T }) {
  const [conversations, setConversations] = useState(1200);
  const [share, setShare] = useState(40);
  const [minutes, setMinutes] = useState(6);
  const perMonth = (conversations * minutes) / 60;
  const today = Math.round(perMonth);
  const withElpino = Math.round(perMonth * (1 - share / 100));
  const saved = today - withElpino;
  // At most ~120 tiles: each tile is a round number of hours so the grid always fits the card.
  const tileHours = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((h) => today / h <= 120) ?? 500;
  const tiles = Math.max(1, Math.ceil(today / tileHours));
  const freedTiles = Math.min(tiles, Math.round(saved / tileHours));
  const slider = "mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-black/20 accent-black";
  return (
    <section className="bg-white px-6 sm:px-12 py-6 text-[#11120f]">
      <div className="border-y border-black/30 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between gap-12">
            <Rv><h2 className="text-[clamp(2rem,4.6vw,4rem)] font-normal leading-[1.05] tracking-[-0.03em]">{t("home.saved.title", "Give your team its hours back.")}</h2></Rv>
            <Rv delay={120}>
              <div className="max-w-sm space-y-5 text-lg leading-7 text-[#11120f]/70">
                <p>{t("home.saved.p1", "Elpino answers the repeat questions and looks up payments and orders itself, so your people keep the conversations that need them.")}</p>
                <p>{t("home.saved.p2", "Move the sliders to your own numbers. It is an estimate, not a promise.")}</p>
              </div>
            </Rv>
          </div>

          <Rv delay={80}>
            <div className="relative">
              <div className="relative grid gap-8 p-2 sm:grid-cols-[1fr_0.8fr] sm:p-4">
                <div className="flex flex-col justify-between gap-8">
                  <p className="text-[clamp(2.2rem,5vw,4.2rem)] font-normal leading-none tracking-[-0.03em]" style={{ color: GREEN_INK }}>{t("home.saved.save", "Save")} {saved.toLocaleString()} {t("home.saved.hours", "hours")}</p>
                  <p className="text-base text-[#11120f]/70">{t("home.saved.per", "of your team's time, given back")}</p>
                </div>
                <div className="space-y-6">
                  <label className="block text-sm"><span className="flex justify-between text-[#11120f]/70"><span>{t("home.saved.conversations", "Conversations/mo")}</span><span className="text-[#11120f]">{conversations.toLocaleString()}</span></span>
                    <input type="range" min={100} max={5000} step={100} value={conversations} onChange={(e) => setConversations(Number(e.target.value))} className={slider} aria-label="Conversations a month" /></label>
                  <label className="block text-sm"><span className="flex justify-between text-[#11120f]/70"><span>{t("home.saved.share", "Answered without a person")}</span><span className="text-[#11120f]">{share}%</span></span>
                    <input type="range" min={10} max={80} step={5} value={share} onChange={(e) => setShare(Number(e.target.value))} className={slider} aria-label="Share answered without a person" /></label>
                  <label className="block text-sm"><span className="flex justify-between text-[#11120f]/70"><span>{t("home.saved.minutes", "Minutes each")}</span><span className="text-[#11120f]">{minutes}</span></span>
                    <input type="range" min={2} max={20} step={1} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={slider} aria-label="Minutes a person spends on one conversation" /></label>
                </div>
              </div>

              {/* A waffle of tiles, one tile a fixed number of hours: hatched for time still spent, green for time
                  Elpino gives back. The green ones pop in one after another whenever a slider moves. */}
              <div className="relative mt-12">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-sm">{t("home.saved.grid", "Your team's support time, one square")} = {tileHours} {t("home.saved.hr", "hr")}</p>
                  <p className="text-sm text-[#11120f]/65">{withElpino.toLocaleString()} {t("home.saved.left", "hrs left")} / {today.toLocaleString()} {t("home.saved.hrs", "hrs")}</p>
                </div>
                <div className="mt-3 grid gap-[3px]" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }} role="img" aria-label={`${saved} of ${today} hours saved`}>
                  {Array.from({ length: tiles }, (_, i) => {
                    const freed = i >= tiles - freedTiles;
                    return (
                      <span
                        key={`${freed}-${i}`}
                        className="aspect-square border border-black/70"
                        style={freed
                          ? { backgroundColor: GREEN_INK, animation: "elpino-rv-pop .35s both", animationDelay: `${Math.min((i - (tiles - freedTiles)) * 12, 700)}ms` }
                          : { backgroundImage: HATCH, backgroundColor: "rgba(255,255,255,0.35)" }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#11120f]/65">
                  <span className="inline-flex items-center gap-2"><span className="size-3 border border-black/70" style={{ backgroundImage: HATCH }} />{t("home.saved.today", "Your team today")}</span>
                  <span className="inline-flex items-center gap-2"><span className="size-3 border border-black/70" style={{ backgroundColor: GREEN_INK }} />{t("home.saved.givenBack", "Given back by Elpino")}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/elpino-mascot-1.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-2 -top-24 hidden h-28 w-auto -rotate-6 drop-shadow-[0_12px_20px_rgba(17,18,15,0.25)] lg:block" />
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// A headline and one supporting line that introduce the product tour.
function PlatformLine({ t }: { t: T }) {
  return (
    <section className="bg-white px-6 pb-6 pt-20 sm:px-12 sm:pt-28">
      <Rv><h2 className="mx-auto max-w-[22ch] text-center text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.08] tracking-[-0.035em] text-[#11120f]">{t("home.platform.title", "AI that checks the way your best agent would")}</h2></Rv>
      <Rv delay={120}><p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-7 text-[#11120f]/65">{t("home.platform.subtitle", "It verifies who it is talking to, looks up the real payment or order, keeps private details out of the model, then replies. When a person is needed, your team gets everything it found.")}</p></Rv>
    </section>
  );
}

// The chat widget, drawn in code (not a screenshot) so it stays crisp and can play a short conversation. It
// replays every time the Widget tab opens: greeting, the visitor's question, a typing pause, then the answer.
function WidgetMock({ t, progress }: { t: T; progress: number }) {
  // Everything here is a pure function of `progress` (0 to 1, the scroll fill of the Elpino AI tab), so scrolling
  // down plays the story and scrolling back up rewinds it. Each step has a moment it appears and a moment it is done.
  const rows = [
    { doing: t("home.widgetMock.row0", "Reading your message"), finished: t("home.widgetMock.row0done", "Got your message") },
    { doing: t("home.widgetMock.row1", "Verifying it's you"), finished: t("home.widgetMock.row1done", "You're verified") },
    { doing: t("home.widgetMock.row2", "Checking your payment and plan"), finished: t("home.widgetMock.row2done", "Payment and plan checked") },
    { doing: t("home.widgetMock.row3", "Protecting your private details"), finished: t("home.widgetMock.row3done", "Private details kept out of the AI") },
  ];
  const ASKED_AT = 0.05;
  const nodes = [
    ...rows.map((row, i) => ({ key: row.doing, appear: 0.14 + i * 0.17, done: 0.24 + i * 0.17, doing: row.doing, finished: row.finished, reply: false })),
    { key: "reply", appear: 0.86, done: 0.86, doing: "", finished: "", reply: true },
  ];
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const bubble = "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.5]";
  return (
    <div className="flex min-h-[420px] w-[min(330px,calc(100vw-5.5rem))] flex-col rounded-[26px] sm:h-[420px] sm:w-[330px] border border-black/10 bg-white text-[#11120f] shadow-[0_24px_60px_rgba(17,18,15,0.22)]">
      <div className="flex items-center gap-3 rounded-t-[26px] border-b border-black/10 px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-black/5"><ChevronLeft size={16} /></span>
        <div className="leading-tight"><p className="text-[14px]">{t("home.widgetMock.name", "Elpino AI")}</p><p className="text-[11.5px] text-[#11120f]/50">{t("home.widgetMock.role", "AI Assistant")}</p></div>
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-black/5"><MoreHorizontal size={16} /></span>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-2.5 rounded-b-[26px] bg-[#ffffff] p-3.5">
        <div className={`${bubble} max-w-[85%] self-end bg-[#11120f] text-white transition-all duration-300`} style={{ opacity: progress >= ASKED_AT ? 1 : 0, transform: progress >= ASKED_AT ? "none" : "translateY(6px)" }}>{t("home.widgetMock.question", "I purchased a plan but it's still not active")}</div>
        <div className={`${bubble} w-full self-start sm:-ml-[100px] sm:w-[290px] border border-white/70 bg-white/40 shadow-[0_14px_36px_rgba(17,18,15,0.16)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-300`} style={{ opacity: progress >= nodes[0].appear ? 1 : 0 }}>
          {/* What the AI does before it replies, drawn as a graph: every step is a node that gets a blue tick once
              it is done, and the edge to the next node fills in as you scroll. The reply is the last node. */}
          <ol>
            {nodes.map((node, i) => {
              const shown = progress >= node.appear;
              const done = progress >= node.done;
              const next = nodes[i + 1];
              const edge = next ? clamp((progress - node.done) / (next.appear - node.done)) : 0;
              return (
                <li key={node.key} className={`relative flex items-start gap-2.5 transition-opacity duration-300 ${next ? "pb-3.5" : ""}`} style={{ opacity: shown ? 1 : 0.18 }}>
                  {next && (
                    <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-[18px] w-0.5 rounded-full bg-black/12">
                      <span className="block h-full w-full origin-top rounded-full bg-[#3784ff]" style={{ transform: `scaleY(${edge})` }} />
                    </span>
                  )}
                  {node.reply
                    ? <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#11120f]" aria-hidden="true"><Bot size={10} color="#fff" /></span>
                    : done
                      ? <BadgeCheck size={16} className="relative shrink-0 text-[#3784ff]" aria-hidden="true" />
                      : shown
                        ? <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-black/15 border-t-[#3784ff]" aria-hidden="true" />
                        : <span className="size-4 shrink-0 rounded-full border-2 border-black/15" aria-hidden="true" />}
                  {node.reply
                    ? <p className="text-[13px] leading-[1.5]">{t("home.widgetMock.answer", "Thanks for your patience. Your payment went through and your plan is now active. If you still see the old plan, refresh your dashboard.")}</p>
                    : <span className={`text-[12.5px] leading-4 ${done ? "text-[#11120f]/80" : "text-[#11120f]/55"}`}>{done ? node.finished : node.doing}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

// The Knowledge tab's visual: four sources feed the Knowledge Hub, which feeds Elpino's answers. Like the widget it is
// a pure function of the tab's scroll fill (0 to 1): each source appears, its edge draws in, and it gets a blue tick.
function KnowledgeGraph({ t, progress }: { t: T; progress: number }) {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const ramp = (from: number, to: number) => clamp((progress - from) / (to - from));
  const CARD_W = 150;
  const CARD_H = 50;
  const HUB = { x: 232, y: 170, r: 42 };
  const ANSWER = { x: 388, y: 170, r: 42 };
  const sources = [
    { Icon: Globe, name: t("home.kgraph.s0", "Website sitemap"), hint: "sitemap.xml", top: 6, at: 0.05 },
    { Icon: FileText, name: t("home.kgraph.s1", "PDFs and documents"), hint: "guide.pdf · faq.docx", top: 92, at: 0.2 },
    { Icon: PenLine, name: t("home.kgraph.s2", "Pages you write"), hint: t("home.kgraph.s2hint", "policies and how-tos"), top: 178, at: 0.35 },
    { Icon: Plug, name: t("home.kgraph.s3", "Your connected tools"), hint: t("home.kgraph.s3hint", "live data via MCP"), top: 264, at: 0.5 },
  ].map((source) => ({ ...source, cy: source.top + CARD_H / 2, drawFrom: source.at + 0.02, drawTo: source.at + 0.12, doneAt: source.at + 0.12 }));
  const hubOn = progress >= 0.63;
  const hubDone = progress >= 0.72;
  const answerOn = progress >= 0.88;
  const track = "rgba(17,18,15,0.18)";
  const flow = "#3784ff";
  return (
    <div className="relative h-[320px] w-[440px] max-w-full" role="img" aria-label={t("home.kgraph.aria", "Your website, documents, pages and tools all feed Elpino's knowledge")}>
      <svg viewBox="0 0 440 320" className="absolute inset-0 size-full" aria-hidden="true">
        {sources.map((source) => {
          const d = `M ${CARD_W} ${source.cy} C ${CARD_W + 44} ${source.cy}, ${HUB.x - HUB.r - 44} ${HUB.y}, ${HUB.x - HUB.r} ${HUB.y}`;
          return (
            <g key={source.name}>
              <path d={d} fill="none" stroke={track} strokeWidth="2" />
              <path d={d} fill="none" stroke={flow} strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(source.drawFrom, source.drawTo)} />
            </g>
          );
        })}
        <path d={`M ${HUB.x + HUB.r} ${HUB.y} L ${ANSWER.x - ANSWER.r} ${ANSWER.y}`} fill="none" stroke={track} strokeWidth="2" />
        <path d={`M ${HUB.x + HUB.r} ${HUB.y} L ${ANSWER.x - ANSWER.r} ${ANSWER.y}`} fill="none" stroke={flow} strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(0.72, 0.88)} />
      </svg>

      {sources.map(({ Icon, name, hint, top, at, doneAt }) => {
        const shown = progress >= at;
        const done = progress >= doneAt;
        return (
          <div key={name} className="absolute left-0 flex items-center gap-2.5 rounded-xl border border-black/15 bg-white px-3 shadow-[0_10px_28px_rgba(17,18,15,0.12)] transition-opacity duration-300" style={{ top, width: CARD_W, height: CARD_H, opacity: shown ? 1 : 0.22 }}>
            <Icon size={17} className="shrink-0 text-[#11120f]/70" aria-hidden="true" />
            <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[12.5px] text-[#11120f]">{name}</span><span className="block truncate font-mono text-[10px] text-[#11120f]/45">{hint}</span></span>
            {done
              ? <BadgeCheck size={16} className="shrink-0 text-[#3784ff]" aria-hidden="true" />
              : shown ? <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-black/15 border-t-[#3784ff]" aria-hidden="true" /> : null}
          </div>
        );
      })}

      <div className="absolute grid place-items-center rounded-full border border-black/15 bg-white text-center shadow-[0_10px_28px_rgba(17,18,15,0.14)] transition-all duration-300" style={{ left: HUB.x - HUB.r, top: HUB.y - HUB.r, width: HUB.r * 2, height: HUB.r * 2, boxShadow: hubOn ? "0 0 0 6px rgba(55,132,255,0.16), 0 10px 28px rgba(17,18,15,0.14)" : undefined, opacity: hubOn ? 1 : 0.3 }}>
        <span className="leading-tight"><BookOpen size={17} className="mx-auto text-[#11120f]/75" aria-hidden="true" /><span className="mt-1 block text-[10.5px] text-[#11120f]">{t("home.kgraph.hub", "Knowledge")}</span></span>
        {hubDone && <BadgeCheck size={17} className="absolute -right-1 -top-1 rounded-full bg-white text-[#3784ff]" aria-hidden="true" />}
      </div>

      <div className="absolute grid place-items-center rounded-full bg-[#11120f] text-center text-white shadow-[0_12px_30px_rgba(17,18,15,0.3)] transition-all duration-300" style={{ left: ANSWER.x - ANSWER.r, top: ANSWER.y - ANSWER.r, width: ANSWER.r * 2, height: ANSWER.r * 2, opacity: answerOn ? 1 : 0.25, transform: answerOn ? "scale(1)" : "scale(0.92)" }}>
        <span className="leading-tight"><Bot size={17} className="mx-auto" aria-hidden="true" /><span className="mt-1 block text-[10.5px]">{t("home.kgraph.answer", "Answers")}</span></span>
      </div>
    </div>
  );
}

// The Tickets tab's visual, driven by the tab's scroll fill (0 to 1): nobody is free, so a ticket writes itself
// (title typed, priority and category tagged, a summary drawn in), gets filed to the team's tool, and the
// customer is told. Scrolling back rewinds it.
function TicketFlow({ t, progress }: { t: T; progress: number }) {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const ramp = (from: number, to: number) => clamp((progress - from) / (to - from));
  const title = t("home.ticketFlow.title", "Paid, but the plan is still not active");
  const typed = title.slice(0, Math.floor(title.length * ramp(0.3, 0.52)));
  const cardIn = ramp(0.12, 0.3);
  const steps = [
    { label: t("home.ticketFlow.filed", "Filed"), at: 0.8 },
    { label: t("home.ticketFlow.assigned", "Assigned"), at: 0.88 },
    { label: t("home.ticketFlow.told", "Customer told"), at: 0.96 },
  ];
  const chip = "rounded-full px-2.5 py-1 text-[11px] transition-all duration-300";
  return (
    <div className="relative h-[340px] w-[420px] max-w-full" role="img" aria-label={t("home.ticketFlow.aria", "When nobody is free, a ticket is written, filed to your team's tool, and the customer is told")}>
      {/* 1. Nobody is free */}
      <div className="absolute left-0 top-0 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12.5px] text-[#11120f] shadow-[0_10px_28px_rgba(17,18,15,0.14)] transition-all duration-300" style={{ opacity: progress >= 0.04 ? 1 : 0, transform: progress >= 0.04 ? "none" : "translateY(-8px)" }}>
        <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff9f1a]/70" /><span className="relative inline-flex size-2 rounded-full bg-[#ff9f1a]" /></span>
        {t("home.ticketFlow.nobody", "Nobody on the team is free right now")}
      </div>

      {/* 2. The ticket writes itself */}
      <div className="absolute inset-x-0 top-14 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(17,18,15,0.2)]" style={{ opacity: cardIn, transform: `translateY(${(1 - cardIn) * 28}px) scale(${0.97 + cardIn * 0.03})` }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#11120f]/45">{t("home.ticketFlow.ticket", "Ticket")}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#11120f]/55"><span className={`size-1.5 rounded-full ${progress >= 0.8 ? "bg-[#1aa37a]" : "bg-[#ff9f1a]"}`} />{progress >= 0.8 ? t("home.ticketFlow.open", "Open") : t("home.ticketFlow.draft", "Draft")}</span>
        </div>
        <p className="mt-3 min-h-[1.6rem] text-[17px] leading-snug text-[#11120f]">{typed}{typed.length < title.length && progress >= 0.3 && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[#11120f]" />}</p>
        <div className="mt-3 flex gap-2">
          <span className={`${chip} bg-[#ffe3e0] text-[#c2382b]`} style={{ opacity: progress >= 0.5 ? 1 : 0, transform: progress >= 0.5 ? "none" : "scale(0.85)" }}>{t("home.ticketFlow.high", "High")}</span>
          <span className={`${chip} bg-[#e6ecff] text-[#2f55c7]`} style={{ opacity: progress >= 0.56 ? 1 : 0, transform: progress >= 0.56 ? "none" : "scale(0.85)" }}>{t("home.ticketFlow.billing", "Billing")}</span>
        </div>
        <div className="mt-4 space-y-2" aria-hidden="true">
          {[[0.5, 0.62, 100], [0.58, 0.7, 88], [0.66, 0.76, 58]].map(([from, to, width]) => (
            <div key={from} className="h-2 rounded-full bg-black/[0.06]"><div className="h-full rounded-full bg-[#11120f]/25" style={{ width: `${ramp(from, to) * width}%` }} /></div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#11120f]/45" style={{ opacity: progress >= 0.7 ? 1 : 0, transition: "opacity .3s" }}>{t("home.ticketFlow.summary", "Summary, what was checked and what was found attached")}</p>
        {/* 3. Filed to the team's tool */}
        <div className="mt-4 flex items-center gap-2.5 border-t border-black/10 pt-3.5 text-[12px] text-[#11120f]/70" style={{ opacity: progress >= 0.78 ? 1 : 0.25, transition: "opacity .3s" }}>
          <span className="grid size-6 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-black/10"><ConnectorLogo provider="asana" alt="" className="size-4 object-contain" fallback={<span className="text-xs font-black">A</span>} /></span>
          {t("home.ticketFlow.filedTo", "Filed to your ticketing tool")}
          {progress >= 0.8 && <BadgeCheck size={16} className="ml-auto text-[#3784ff]" aria-hidden="true" />}
        </div>
      </div>

      {/* 4. Status track: filed, assigned, the customer is told */}
      <div className="absolute inset-x-1 bottom-0 flex items-center">
        {steps.map((step, i) => {
          const on = progress >= step.at;
          return (
            <div key={step.label} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] transition-all duration-300 ${on ? "bg-[#11120f] text-white" : "bg-white/70 text-[#11120f]/45"}`}>{on && <Check size={11} strokeWidth={3} aria-hidden="true" />}{step.label}</span>
              {i < steps.length - 1 && <span className="mx-1.5 h-0.5 flex-1 rounded-full bg-black/15"><span className="block h-full origin-left rounded-full bg-[#11120f]" style={{ transform: `scaleX(${ramp(step.at, steps[i + 1].at)})` }} /></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The four product areas as tabs in a square black-bordered box. The section pins to the screen while the page
// scrolls through it: the tab bar is a progress bar, so the current tab fills in slowly, then the next one
// takes over, and once the last is full the page carries on. Clicking a tab scrolls to its stretch.
// Each tab gets its own wash, so the four stages do not all look alike.
const STAGE_GRADIENTS: Record<string, string> = {
  widget: "linear-gradient(200deg, #ffc1c4 0%, #f3c7e8 28%, #d3bcf5 58%, #b7a9fb 100%)",
  inbox: "linear-gradient(200deg, #d6e4ff 0%, #bcd4ff 35%, #a9d8ff 65%, #b8f0ec 100%)",
  kb: "linear-gradient(200deg, #fff1bf 0%, #ffdcae 32%, #ffc3b8 64%, #ffb3cf 100%)",
  tickets: "linear-gradient(200deg, #e3f7bd 0%, #bff0cf 35%, #a4e6db 68%, #a2d4f5 100%)",
};

const SCROLL_PER_TAB = 80; // vh of scrolling for each item

function ProductTabs({ t }: { t: T }) {
  const reduced = useReduced();
  const mobile = useMobile();
  const [picked, setPicked] = useState(0); // phones: the open item is whichever was tapped
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 to 4: the whole number is the open item, the fraction is how far its demo has played
  const tabs = [
    { key: "widget", Icon: Bot, label: t("home.tabs.widget.label", "Elpino AI"), title: t("home.tabs.widget.title", "An AI that checks before it answers"), body: t("home.tabs.widget.body", "Elpino confirms who it is talking to, looks up the real payment or order, keeps private details out of the model, and only then replies."), points: [t("home.tabs.widget.p0", "Verifies the customer before it touches account data"), t("home.tabs.widget.p1", "Checks payments, plans and orders in your connected tools"), t("home.tabs.widget.p2", "Hands over to your team with the full story when a person is needed")], href: "/product/ai-agent" },
    { key: "inbox", Icon: Inbox, label: t("home.tabs.inbox.label", "Shared inbox"), title: t("home.tabs.inbox.title", "One inbox for your team and the AI"), body: t("home.tabs.inbox.body", "Clear ownership, join alerts and the full context on every thread."), points: [t("home.tabs.inbox.p0", "See what the AI already checked"), t("home.tabs.inbox.p1", "Join a conversation in one click"), t("home.tabs.inbox.p2", "Visitor location, device and history alongside")], href: "/product/inbox" },
    { key: "kb", Icon: BookOpen, label: t("home.tabs.kb.label", "Knowledge"), title: t("home.tabs.kb.title", "Teach it from anything you have"), body: t("home.tabs.kb.body", "Crawl your site, upload files, write pages. Public and private switches decide who sees what."), points: [t("home.tabs.kb.p0", "Crawl your website"), t("home.tabs.kb.p1", "Upload documents and notes"), t("home.tabs.kb.p2", "Keep private pages away from visitors")], href: "/product/knowledge-hub" },
    { key: "tickets", Icon: Ticket, label: t("home.tabs.tickets.label", "Tickets"), title: t("home.tabs.tickets.title", "Nothing gets dropped"), body: t("home.tabs.tickets.body", "If nobody is free, a ticket is filed and the customer is told."), points: [t("home.tabs.tickets.p0", "Filed to Asana or Trello"), t("home.tabs.tickets.p1", "The summary travels with the ticket"), t("home.tabs.tickets.p2", "The customer always hears back")], href: "/product/tickets" },
  ];
  useEffect(() => {
    if (mobile) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = track.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      if (range <= 0) return;
      const done = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range));
      setProgress(done * tabs.length);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, [tabs.length, mobile]);

  const active = mobile ? picked : Math.min(tabs.length - 1, Math.floor(progress));
  const fill = mobile ? 1 : active === tabs.length - 1 ? Math.min(1, progress - active) : progress - active;

  // Opening an item scrolls to the start of its stretch, so the demo plays from the top.
  function jumpTo(index: number) {
    if (mobile) { setPicked(index); return; }
    const el = track.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (range * (index + 0.02)) / tabs.length, behavior: reduced ? "auto" : "smooth" });
  }

  const tab = tabs[active];

  return (
    <section className="bg-white px-6 sm:px-12">
      <div ref={track} style={mobile ? undefined : { height: `calc(100vh + ${tabs.length * SCROLL_PER_TAB}vh)` }}>
      <div className={`grid content-start gap-12 pb-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 ${mobile ? "py-10" : "sticky top-0 h-screen pt-28"}`}>
        {/* The stage: a pastel wash with the open item's product drawn on it, its top-left corner left square like a folder tab. */}
        <div key={tab.key} className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-tl-[2rem] p-5 sm:min-h-[520px] sm:p-8 lg:self-start" style={{ backgroundImage: STAGE_GRADIENTS[tab.key] }}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute -left-[38%] top-[8%] aspect-square w-[120%] rounded-full border border-white/70" />
            <span className="absolute inset-y-8 left-10 w-[70%] border-l border-t border-dashed border-white/80" />
          </div>
          <div className="relative">
            {tab.key === "widget" && <div className="sm:pl-16"><WidgetMock t={t} progress={fill} /></div>}
            {tab.key === "inbox" && <Image src="/inbox_prev.png" alt="The Elpino team inbox" width={1915} height={812} className="h-auto max-h-[38vh] w-auto max-w-full rounded-xl border border-black/10 shadow-[0_24px_60px_rgba(17,18,15,0.22)]" />}
            {tab.key === "kb" && <KnowledgeGraph t={t} progress={fill} />}
            {tab.key === "tickets" && <TicketFlow t={t} progress={fill} />}
          </div>
        </div>
        <div role="tablist" aria-orientation="vertical" aria-label={t("home.tabs.aria", "Product areas")} className="self-start border-b border-black/15">
          {tabs.map(({ key, title, body, points, href }, i) => {
            const open = i === active;
            return (
              <div key={key} className="border-t border-black/15">
                <button
                  type="button"
                  role="tab"
                  id={`tab-${key}`}
                  aria-selected={open}
                  aria-expanded={open}
                  aria-controls={`panel-${key}`}
                  onClick={() => jumpTo(i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-[clamp(1.4rem,2vw,1.9rem)] font-medium leading-tight tracking-[-0.02em] text-[#11120f]">{title}</span>
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.06] text-[#11120f]"><ChevronDown size={18} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} /></span>
                </button>
                <div id={`panel-${key}`} role="tabpanel" aria-labelledby={`tab-${key}`} className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="pb-8">
                      <p className="max-w-xl text-xl leading-9 text-[#11120f]/70">{body}</p>
                      <ul className="mt-6 space-y-3">
                        {points.map((point) => <li key={point} className="flex items-start gap-3 text-lg leading-7 text-[#11120f]"><Check size={18} strokeWidth={2.5} className="mt-1.5 shrink-0 text-[#6a4bc4]" />{point}</li>)}
                      </ul>
                      <Link href={href} tabIndex={open ? 0 : -1} className="mt-7 inline-flex w-fit items-center gap-3 text-lg text-[#6a4bc4] underline decoration-1 underline-offset-4 hover:opacity-75">{t("home.tabs.more", "Learn more")} <ArrowRight size={20} strokeWidth={1.5} /></Link>
                    </div>
                  </div>
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

export function HomeView() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <div>
      <Hero t={t} />
      <ToolsLine t={t} />
      <TimeSaved t={t} />
      <PlatformLine t={t} />
      <ProductTabs t={t} />
      <Tour t={t} />
      <Teams t={t} />
      <Autopilot t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </div>
  );
}
