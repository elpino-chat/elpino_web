"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Bot, Check, Headset, Inbox, KeyRound, Languages, Lock, Plug, Plus, Sparkles, Ticket } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// The Helpdesk page in the same sticker language as pricing and the mega
// menu (ink outlines, flat colour, mono labels), but built around motion:
// a typing prompt hero, a sticky scroll story that follows one question
// through the desk, colour bento cards and a statement that lights up as
// you scroll. Everything shown is something Elpino does today, and
// omnichannel is marked as coming in November.

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — same convention as the home/pricing/about
 * pages: t()'s traversal really does hand back the raw JSON value (array or
 * not) even though its declared return type is `string`. Falls back to the
 * English array wholesale when the locale hasn't got this key yet.
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
const CREAM = "#fff8ec";

const card = "rounded-[10px] border border-black/40";
const mono = "font-mono text-[11px] font-medium uppercase tracking-[0.08em]";
const onDark = (c: string) => (c === YELLOW ? INK : "#fff");
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  return r;
}

function Stamp({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/25 bg-white px-3 py-1 text-[12.5px] font-medium text-black/70">
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

function Heading({ eyebrow, color, title, sub, left = false }: { eyebrow: string; color: string; title: ReactNode; sub?: string; left?: boolean }) {
  return (
    <div className={left ? "max-w-3xl" : "max-w-3xl"}>
      <Rv variant="drop"><Stamp color={color}>{eyebrow}</Stamp></Rv>
      <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2></Rv>
      {sub && <Rv delay={160}><p className="mt-5 text-lg leading-8 text-black/65">{sub}</p></Rv>}
    </div>
  );
}

// -------------------------------------------------------------------- hero

type Ask = { q: string; steps: string[]; a: string };

const ASKS_EN: Ask[] = [
  { q: "Was I charged twice for my upgrade?", steps: ["Checked your payment record", "Found one charge and one failed attempt"], a: "You were charged once. The second attempt failed and was never captured." },
  { q: "Where is my order #4821?", steps: ["Verified you by email code", "Looked up the order in your shop"], a: "It shipped yesterday and arrives Thursday. Tracking link sent." },
  { q: "Can I speak to someone about billing?", steps: ["No tool can change billing details", "Asked you first, then alerted the team"], a: "Priya from our team just joined this chat." },
];

function Prompt({ t }: { t: T }) {
  const asks = tList<Ask>(t, "helpdesk.prompt.asks", ASKS_EN);
  const reduced = useReduced();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"type" | "work" | "hold">("type");
  const item = asks[i % asks.length];

  useEffect(() => {
    if (reduced) { setN(item.q.length); setPhase("hold"); return; }
    let id = 0;
    if (phase === "type") id = window.setTimeout(() => (n >= item.q.length ? setPhase("work") : setN(n + 1)), n >= item.q.length ? 350 : 38);
    else if (phase === "work") id = window.setTimeout(() => setPhase("hold"), 2000);
    else id = window.setTimeout(() => { setI((v) => (v + 1) % asks.length); setN(0); setPhase("type"); }, 3600);
    return () => window.clearTimeout(id);
  }, [n, phase, item.q.length, reduced, asks.length]);

  return (
    <div className={`${card} w-full overflow-hidden bg-white text-left shadow-[0_24px_60px_rgba(15,23,42,0.08)]`}>
      <div className="flex items-center gap-3 border-b border-black/15 bg-[#f4f4f2] px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full" style={{ backgroundColor: INK }}><Bot size={17} color="#fff" /></span>
        <p className="min-h-[28px] flex-1 text-[clamp(1rem,2.2vw,1.2rem)] font-medium">{item.q.slice(0, n)}<span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-[#11120f]" /></p>
        <Stamp color={YELLOW}>{t("helpdesk.prompt.customerLabel", "Customer")}</Stamp>
      </div>
      <div className="min-h-[170px] px-5 py-4">
        {(phase === "work" || phase === "hold") && (
          <ul className="space-y-2.5">
            {item.steps.map((s, k) => (
              <li key={s} className="flex items-center gap-3 text-[15.5px] text-[#11120f]/75" style={{ animation: `elpino-rv-up .5s ${k * 0.45}s both` }}>
                <span className="grid size-6 place-items-center rounded-full" style={{ backgroundColor: GREEN }}><Check size={13} color="#fff" strokeWidth={3} /></span>{s}
              </li>
            ))}
            {phase === "hold" && <li className="mt-3 rounded-2xl rounded-bl-md p-4 text-[16px] font-medium leading-7 text-white" style={{ backgroundColor: BLUE, animation: "elpino-rv-pop .45s both" }}>{item.a}</li>}
          </ul>
        )}
        {phase === "type" && <p className="pt-12 text-center text-sm text-[#11120f]/40">{t("helpdesk.prompt.listening", "Elpino is listening…")}</p>}
      </div>
    </div>
  );
}

function Hero({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 pb-16 pt-16 text-[#11120f] sm:px-8 lg:px-20 lg:pt-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="text-[14px] text-black/50">{t("helpdesk.hero.badge", "Elpino helpdesk")}</p>
          <h1 className="mt-4 max-w-[14ch] animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]">{t("helpdesk.hero.titlePrefix", "Support that ")}{t("helpdesk.hero.titleHl", "answers itself.")}</h1>
          <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("helpdesk.hero.subtitle", "One desk for an AI that resolves, a team that joins when it matters, and tickets that never slip. Watch it take a question.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">{t("helpdesk.hero.ctaStart", "Start free")} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/features" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">{t("helpdesk.hero.ctaFeatures", "See all features")}</Link>
          </div>
        </div>
        <div className="animate-[elpino-focus_0.9s_ease-out_0.25s_both]"><Prompt t={t} /></div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ marquee

const WORDS_EN = ["AI agent", "Shared inbox", "Tickets", "Knowledge", "Payments", "MCP tools", "Join alerts", "Verified identity", "Omnichannel · November"];

function Marquee({ t }: { t: T }) {
  const words = tList<string>(t, "helpdesk.marquee.words", WORDS_EN);
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden bg-white py-5" aria-label={t("helpdesk.marquee.ariaLabel", "What's on the desk")}>
      <div className="flex w-max items-center gap-10" style={{ animation: "elpino-marquee 50s linear infinite" }}>
        {row.map((w, i) => <span key={i} className="flex items-center gap-10 whitespace-nowrap text-[clamp(1.1rem,1.8vw,1.4rem)] text-black/60">{w}<span aria-hidden="true" className="size-1 rounded-full bg-black/25" /></span>)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- sticky story

type Chapter = { k: string; n: string; title: string; body: string; color: string; icon: typeof Inbox };

const CHAPTERS_META = [
  { k: "ask", n: "01", color: BLUE, icon: Inbox },
  { k: "ai", n: "02", color: PURPLE, icon: Bot },
  { k: "team", n: "03", color: GREEN, icon: Headset },
  { k: "ticket", n: "04", color: ORANGE, icon: Ticket },
  { k: "learn", n: "05", color: PINK, icon: BookOpen },
];

const CHAPTERS_TEXT_EN = [
  { title: "A customer writes in", body: "From the chat widget on your site, with their location, device and the page they're on already attached." },
  { title: "The AI does the work", body: "It answers from your knowledge, remembers the customer, verifies who they are, and uses your payments and MCP tools to actually fix things." },
  { title: "Your team joins in a tap", body: "Only when it can't help, and only after asking the customer. Everyone gets a Join alert, and the first person to tap takes the chat." },
  { title: "Nothing gets dropped", body: "If nobody's free within 90 seconds, a ticket is filed with the reason and a summary, and the customer gets a reference by email." },
  { title: "You teach it once", body: "Add what was missing to your knowledge base. Next time, the AI simply knows." },
];

function buildChapters(t: T): Chapter[] {
  const text = tList<{ title: string; body: string }>(t, "helpdesk.story.chapters", CHAPTERS_TEXT_EN);
  return CHAPTERS_META.map((meta, i) => ({ ...meta, title: text[i]?.title ?? CHAPTERS_TEXT_EN[i].title, body: text[i]?.body ?? CHAPTERS_TEXT_EN[i].body }));
}

function Visual({ k, t }: { k: string; t: T }) {
  const bubble = "rounded-2xl border border-black/20 px-4 py-3 text-[14.5px] leading-6";
  if (k === "ask") {
    const chips = tList<string>(t, "helpdesk.story.visuals.ask.chips", ["Pune, India", "Chrome · macOS", "On /billing"]);
    return (
      <div className="space-y-3">
        <div className={`${bubble} max-w-[88%] rounded-bl-sm bg-white`}>{t("helpdesk.story.visuals.ask.bubble", "Hi, I can't find my invoice for last month.")}</div>
        <div className="flex flex-wrap gap-2 pt-1">{chips.map((c) => <span key={c} className={`${mono} rounded-full border border-black/20 bg-[#f4f4f2] px-2.5 py-1 text-[10px]`}>{c}</span>)}</div>
      </div>
    );
  }
  if (k === "ai") {
    const rows = tList<[string, string]>(t, "helpdesk.story.visuals.ai.rows", [["search_knowledge", "1 match"], ["send_email_code", "verified"], ["get_receipt", "found · sent"]]);
    return (
      <div className="space-y-2.5 font-mono text-[12.5px]">
        {rows.map(([a, b], i) => (
          <div key={a} className="flex items-center justify-between rounded-lg border border-black/20 bg-white px-3.5 py-3" style={{ animation: `elpino-rv-up .5s ${i * 0.2}s both` }}><span>{a}()</span><span style={{ color: GREEN }}>↳ {b}</span></div>
        ))}
        <div className={`${bubble} rounded-bl-sm font-sans text-white`} style={{ backgroundColor: BLUE }}>{t("helpdesk.story.visuals.ai.bubble", "Here's your invoice. I've emailed a copy too.")}</div>
      </div>
    );
  }
  if (k === "team")
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-black/20 bg-white p-4"><span className="grid size-10 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: GREEN }}>P</span><div className="flex-1"><p className="text-[14.5px] font-semibold">{t("helpdesk.story.visuals.team.title", "New chat needs a person")}</p><p className="text-[12px] text-[#11120f]/55">{t("helpdesk.story.visuals.team.sub", "Alert sent to 4 teammates")}</p></div><span className={`${mono} rounded-full px-3 py-1.5 text-[10px] text-white`} style={{ backgroundColor: BLUE, animation: "elpino-ring 1.4s ease-out infinite" }}>{t("helpdesk.story.visuals.team.join", "Join")}</span></div>
        <p className="text-center text-[13px] text-[#11120f]/60">{t("helpdesk.story.visuals.team.note", "First to tap takes it. The alert clears for everyone else.")}</p>
      </div>
    );
  if (k === "ticket") {
    const ticketChips = tList<string>(t, "helpdesk.story.visuals.ticket.chips", ["Issues page", "Customer emailed"]);
    return (
      <div className="rounded-xl border border-black/20 bg-white p-5">
        <div className="flex items-center justify-between"><Stamp color={ORANGE}><Ticket size={11} />{t("helpdesk.story.visuals.ticket.label", "Ticket")}</Stamp><span className="font-mono text-[13px] font-bold">7F3A9C21</span></div>
        <p className="mt-3 text-[16px] font-semibold">{t("helpdesk.story.visuals.ticket.title", "Support escalation · Aisha Khan")}</p>
        <p className="mt-1 text-[13.5px] text-[#11120f]/60">{t("helpdesk.story.visuals.ticket.reason", "Reason: billing country change needs a person.")}</p>
        <div className="mt-4 flex gap-2">{ticketChips.map((c) => <span key={c} className={`${mono} rounded-full border border-black/20 bg-[#f4f4f2] px-2.5 py-1 text-[10px]`}>{c}</span>)}</div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-black/20 bg-white p-4"><BookOpen size={18} color={PINK} /><span className="flex-1 text-[14.5px] font-semibold">{t("helpdesk.story.visuals.learn.title", "Invoice and receipts guide")}</span><span className={`${mono} rounded-full px-2 py-1 text-[9px] text-white`} style={{ backgroundColor: GREEN }}>{t("helpdesk.story.visuals.learn.added", "Added")}</span></div>
      <p className="text-center text-[13px] text-[#11120f]/60">{t("helpdesk.story.visuals.learn.note", "The next customer gets this answer instantly.")}</p>
    </div>
  );
}

function Story({ t }: { t: T }) {
  const chapters = buildChapters(t);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const c = chapters[active];

  return (
    <section className="bg-white px-5 py-16 text-[#11120f] sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading left eyebrow={t("helpdesk.story.eyebrow", "One conversation")} color={BLUE} title={<>{t("helpdesk.story.titlePrefix", "Watch a question ")}<span className="hl">{t("helpdesk.story.titleHl", "travel the desk.")}</span></>} />
        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className={`${card} relative overflow-hidden bg-[#f4f4f2] p-6`}>
                <div className="relative flex items-center justify-between">
                  <Stamp color={c.color}><c.icon size={12} />{t("helpdesk.story.stepLabel", "Step {n} / 05").replace("{n}", c.n)}</Stamp>
                </div>
                <div key={c.k} className="relative mt-5 min-h-[260px] rounded-xl border border-black/15 bg-white p-5" style={{ animation: "elpino-rv-deal .55s both" }}><Visual k={c.k} t={t} /></div>
                <div className="relative mt-5 flex gap-1.5">{chapters.map((x, i) => <span key={x.k} className="h-1 flex-1 rounded-full transition-colors duration-500" style={{ backgroundColor: i <= active ? INK : "rgba(0,0,0,0.12)" }} />)}</div>
              </div>
            </div>
          </div>

          <div>
            {chapters.map((ch, i) => (
              <div key={ch.k} ref={(el) => { refs.current[i] = el; }} data-i={i} className="flex min-h-[60vh] flex-col justify-center py-8 transition-opacity duration-500" style={{ opacity: i === active ? 1 : 0.4 }}>
                <span className="text-[14px] font-medium" style={{ color: BLUE }}>{ch.n}</span>
                <h3 className="mt-4 text-[clamp(1.9rem,3.2vw,2.7rem)] font-normal leading-[1.08] tracking-[-0.035em]">{ch.title}</h3>
                <p className="mt-4 max-w-[46ch] text-lg leading-8 text-black/65">{ch.body}</p>
                <div className={`${card} mt-6 bg-[#f4f4f2] p-5 lg:hidden`}><div className="rounded-xl border border-black/15 bg-white p-4"><Visual k={ch.k} t={t} /></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------- bento

function Redact({ t }: { t: T }) {
  const reduced = useReduced();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced) { setOn(true); return; }
    const id = window.setInterval(() => setOn((v) => !v), 2600);
    return () => window.clearInterval(id);
  }, [reduced]);
  const chip = (a: string, b: string) => <span className="rounded px-1.5 transition-all duration-500" style={{ backgroundColor: on ? "#dbeafe" : "#f4f4f2" }}>{on ? b : a}</span>;
  return <p className="font-mono text-[13px] leading-8">{t("helpdesk.bento.redact.prefix", "Hi, I'm")} {chip("Aisha Khan", "ref_name_9f2c")}, {t("helpdesk.bento.redact.middle", "reach me at")} {chip("aisha@example.com", "ref_email_41ab")}</p>;
}

function Bento({ t }: { t: T }) {
  // Fixed demo languages showing off the AI's own multi-language reply
  // feature — same convention as the home page Customizer: these are
  // sample content, not translated with the site chrome.
  const langs = ["English", "Español", "Français", "Deutsch", "हिन्दी", "日本語"];
  const cell = "group relative h-full overflow-hidden rounded-[10px] border border-black/40 bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]";
  const inner = "relative mt-5 rounded-xl bg-[#f4f4f2] p-4 text-[#11120f]";
  const Dots = () => null;
  const toolRows = tList<[string, boolean]>(t, "helpdesk.bento.tools.rows", [["get_order", true], ["track_shipment", true], ["delete_customer", false]]);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("helpdesk.bento.eyebrow", "Under the hood")} color={PINK} title={<>{t("helpdesk.bento.titlePrefix", "Small details, ")}<span className="hl">{t("helpdesk.bento.titleHl", "done properly.")}</span></>} sub={t("helpdesk.bento.subtitle", "The things you'd check before trusting an AI with your customers.")} />
        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <Rv variant="pop" className="md:col-span-4">
            <div className={cell} ><Dots />
              <Lock size={20} className="relative" style={{ color: BLUE }} />
              <h3 className="relative mt-3 text-3xl font-medium leading-tight tracking-[-0.025em]">{t("helpdesk.bento.privacy.title", "The model never sees names or emails.")}</h3>
              <p className="relative mt-2 max-w-[48ch] text-black/65">{t("helpdesk.bento.privacy.desc", "Identities are swapped for reference codes before the AI reads a conversation, and secrets are stripped out.")}</p>
              <div className={inner}><Redact t={t} /></div>
            </div>
          </Rv>
          <Rv variant="pop" delay={80} className="md:col-span-2">
            <div className={cell} ><Dots />
              <Languages size={20} className="relative" style={{ color: BLUE }} />
              <h3 className="relative mt-3 text-2xl font-medium leading-tight tracking-[-0.025em]">{t("helpdesk.bento.languages.title", "Replies in your customer's language")}</h3>
              <div className="relative mt-4 flex flex-wrap gap-2">{langs.map((l, i) => <span key={l} className="rounded-full border border-black/25 bg-white px-3 py-1 text-[12.5px]" style={{ animation: `elpino-float ${4 + (i % 3)}s ease-in-out ${-i * 0.6}s infinite` }}>{l}</span>)}</div>
              <p className="relative mt-3 text-[12.5px] text-black/50">{t("helpdesk.bento.languages.note", "You choose the reply language in settings.")}</p>
            </div>
          </Rv>
          <Rv variant="pop" delay={40} className="md:col-span-2">
            <div className={cell} ><Dots />
              <KeyRound size={20} className="relative" style={{ color: BLUE }} />
              <h3 className="relative mt-3 text-2xl font-medium leading-tight tracking-[-0.025em]">{t("helpdesk.bento.verified.title", "Verified before it acts")}</h3>
              <div className="relative mt-4 flex gap-2">{[4, 8, 1, 6].map((d, i) => <span key={i} className="grid size-11 place-items-center rounded-lg bg-[#f4f4f2] font-mono text-lg text-[#11120f]" style={{ animation: `elpino-rv-pop .4s ${i * 0.15}s both` }}>{d}</span>)}</div>
              <p className="relative mt-3 text-[13.5px] text-black/65">{t("helpdesk.bento.verified.note", "A one-time email code or a signed token from your app.")}</p>
            </div>
          </Rv>
          <Rv variant="pop" delay={120} className="md:col-span-2">
            <div className={cell} ><Dots />
              <Plug size={20} className="relative" style={{ color: BLUE }} />
              <h3 className="relative mt-3 text-2xl font-medium leading-tight tracking-[-0.025em]">{t("helpdesk.bento.tools.title", "Your tools, your rules")}</h3>
              <div className="relative mt-4 space-y-2 text-[#11120f]">{toolRows.map(([n, on]) => <div key={n} className="flex items-center justify-between rounded-lg bg-[#f4f4f2] px-3 py-2 font-mono text-[12px]"><span className={on ? "" : "text-[#11120f]/40 line-through"}>{n}</span><span className="h-5 w-9 rounded-full p-0.5" style={{ backgroundColor: on ? GREEN : "#d4d4d0" }}><span className="block size-4 rounded-full bg-white" style={{ marginLeft: on ? "14px" : 0 }} /></span></div>)}</div>
            </div>
          </Rv>
          <Rv variant="pop" delay={200} className="md:col-span-2">
            <div className={cell} ><Dots />
              <Headset size={20} className="relative" style={{ color: BLUE }} />
              <h3 className="relative mt-3 text-2xl font-medium leading-tight tracking-[-0.025em]">{t("helpdesk.bento.handoff.title", "Asks before handing off")}</h3>
              <div className="relative mt-4 space-y-2 text-[13.5px] text-[#11120f]"><div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5">{t("helpdesk.bento.handoff.ask", "I can't change that myself. Connect you with our team?")}</div><div className="ml-auto w-fit rounded-2xl rounded-br-sm px-3.5 py-2.5 font-medium text-white" style={{ backgroundColor: BLUE }}>{t("helpdesk.bento.handoff.reply", "Yes please")}</div></div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------- scroll-lit statement

const STATEMENT_EN = "Elpino answers what it knows, does what you allow, and asks a person for the rest.";

function Statement({ t }: { t: T }) {
  const statement = t("helpdesk.statement", STATEMENT_EN);
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.2))));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  const words = statement.split(" ");
  return (
    <section ref={ref} className="bg-black px-5 py-28 sm:px-8 sm:py-40 lg:px-20">
      <p className="mx-auto max-w-[1500px] text-[clamp(2.2rem,5.4vw,4.8rem)] font-normal leading-[1.05] tracking-[-0.045em]">
        {words.map((w, i) => {
          const tp = Math.min(1, Math.max(0, p * (words.length + 3) - i));
          return <span key={i} style={{ color: `rgba(255,255,255,${0.22 + tp * 0.78})`, transition: "color .2s" }}>{w} </span>;
        })}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------- start

type Step = { n: string; title: string; desc: string; color: string };

const STEPS_META = [
  { n: "01", color: BLUE },
  { n: "02", color: YELLOW },
  { n: "03", color: GREEN },
  { n: "04", color: PINK },
];

const STEPS_TEXT_EN = [
  { title: "Sign up free", desc: "100 AI messages a month. No card." },
  { title: "Teach it", desc: "Add your site, files or write pages." },
  { title: "Paste the snippet", desc: "The widget appears on your site." },
  { title: "Invite your team", desc: "So people are ready when it asks." },
];

function Start({ t }: { t: T }) {
  const text = tList<{ title: string; desc: string }>(t, "helpdesk.start.steps", STEPS_TEXT_EN);
  const steps: Step[] = STEPS_META.map((meta, i) => ({ ...meta, title: text[i]?.title ?? STEPS_TEXT_EN[i].title, desc: text[i]?.desc ?? STEPS_TEXT_EN[i].desc }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("helpdesk.start.eyebrow", "Get started")} color={GREEN} title={<>{t("helpdesk.start.titlePrefix", "Live in ")}<span className="hl">{t("helpdesk.start.titleHl", "an afternoon.")}</span></>} />
        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {steps.map((step, i) => (
            <Rv key={step.n} variant="deal" delay={i * 90}>
              <div className={`${card} h-full bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                <span className="text-[14px] font-medium" style={{ color: BLUE }}>{step.n}</span>
                <p className="mt-4 text-xl font-medium tracking-[-0.02em]">{step.title}</p>
                <p className="mt-2 text-[15.5px] leading-7 text-black/65">{step.desc}</p>
              </div>
            </Rv>
          ))}
        </div>
        <Rv delay={120}><p className="mt-8 text-sm text-black/50">{t("helpdesk.start.note", "Website chat is live today. Omnichannel is coming in November.")}</p></Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------ faq

const FAQS_EN: [string, string][] = [
  ["What is the Elpino helpdesk?", "The whole support workspace: a chat widget, an AI agent, a shared inbox, tickets and a knowledge base, working together."],
  ["Do I need to keep my old helpdesk?", "No. Elpino covers chat, the AI agent, the shared inbox and tickets. Tickets can still be sent to Trello or Asana if your team works there."],
  ["Is there a free plan?", "Yes: 100 AI messages a month, no card required."],
  ["What channels are supported?", "Website chat is live today. Omnichannel is coming in November."],
  ["Can my team use it too?", "Yes. Invite as many teammates as you like, since seats are unlimited, and they'll get Join alerts when a customer needs a person."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "helpdesk.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("helpdesk.faq.titlePrefix", "Good to ")}{t("helpdesk.faq.titleHl", "know.")}</h2></Rv>
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
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("helpdesk.closing.title", "Give your customers an answer before they finish typing.")}</h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("helpdesk.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/features" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("helpdesk.closing.ctaFeatures", "All features")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function HelpdeskClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <Marquee t={t} />
      <Story t={t} />
      <Bento t={t} />
      <Statement t={t} />
      <Start t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
