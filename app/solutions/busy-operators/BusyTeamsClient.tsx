"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BellRing, Bot, Check, Clock3, Eye, Headset, Inbox, MapPin, MessageCircle, Moon, Plus, RotateCcw, Search, ShieldCheck, Sun, Ticket, Users } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Busy teams, in the site's sticker language, built around rush hour: a
// small simulation of a queue (illustrative, clearly labelled), two teammates
// racing to join one chat, the context that travels with a handoff, and a
// 24-hour scrubber showing who covers which hours. Real behaviour only:
// Join / Take over, AI ownership badges, ask-first handoff, the 90-second
// alert, tickets and email follow-up. Omnichannel is coming in November.

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

// ------------------------------------------------------------ rush hour sim

type Sim = { queue: number; ai: number; human: number };
const TEAM = [["Priya", GREEN], ["Sam", BLUE], ["Dana", ORANGE], ["Lee", PINK]] as const;

function RushHour({ t }: { t: T }) {
  const reduced = useReduced();
  const [aiOn, setAiOn] = useState(true);
  const [team, setTeam] = useState(2);
  const [s, setS] = useState<Sim>({ queue: 6, ai: 0, human: 0 });

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setS((p) => {
        const arrivals = 3;
        const aiTake = aiOn ? Math.round(arrivals * 0.65) : 0; // an example setting, not a measured rate
        let queue = p.queue + arrivals - aiTake;
        const humanTake = Math.min(queue, Math.ceil(team / 1.5)); // each teammate clears roughly two-thirds of a chat per tick
        queue = Math.min(60, Math.max(0, queue - humanTake));
        return { queue, ai: p.ai + aiTake, human: p.human + humanTake };
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [aiOn, team, reduced]);

  const shown = Math.min(s.queue, 30);
  const level = s.queue < 8 ? { t: t("busyOperators.rush.levelCalm", "Calm"), c: GREEN } : s.queue < 20 ? { t: t("busyOperators.rush.levelBusy", "Getting busy"), c: ORANGE } : { t: t("busyOperators.rush.levelFire", "Queue on fire"), c: PINK };

  return (
    <div className={`${card} overflow-hidden bg-[#fffdf5]`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#11120f] bg-white px-4 py-3">
        <span className={`${mono} text-[#11120f]/55`}>{t("busyOperators.rush.badgeLabel", "Rush hour · illustrative simulation")}</span>
        <button type="button" onClick={() => setS({ queue: 6, ai: 0, human: 0 })} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-3 py-1 text-xs font-semibold transition hover:bg-[#ffd84d]"><RotateCcw size={12} />{t("busyOperators.rush.reset", "Reset")}</button>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_260px]">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold">{t("busyOperators.rush.waitingForPerson", "Waiting for a person")}</p>
            <span className={`${mono} rounded-full border-2 border-[#11120f] px-2.5 py-1 text-[10px] text-white transition-colors`} style={{ backgroundColor: level.c }}>{level.t}</span>
          </div>
          <div className="mt-4 flex min-h-[132px] flex-wrap content-start gap-1.5">
            {Array.from({ length: shown }).map((_, i) => <span key={i} className="size-7 rounded-lg border-2 border-[#11120f]" style={{ backgroundColor: i % 5 === 0 ? ORANGE : YELLOW, animation: "elpino-rv-pop .3s both" }} />)}
            {s.queue > 30 && <span className="grid h-7 place-items-center px-2 font-mono text-xs font-bold">+{s.queue - 30}</span>}
            {s.queue === 0 && <p className="w-full pt-10 text-center text-[#11120f]/45">{t("busyOperators.rush.inboxZero", "Inbox zero. Nice.")}</p>}
          </div>
          <p className="mt-3 font-mono text-4xl font-bold tabular-nums tracking-[-0.04em]">{s.queue}<span className="ml-2 text-sm font-medium text-[#11120f]/45"> {t("busyOperators.rush.chatsWaiting", "chats waiting")}</span></p>
        </div>

        <div className="space-y-4 border-t-2 border-[#11120f] bg-[#fff8ec] p-5 md:border-l-2 md:border-t-0">
          <button type="button" role="switch" aria-checked={aiOn} onClick={() => setAiOn(!aiOn)} className="flex w-full items-center justify-between rounded-2xl border-2 border-[#11120f] bg-white px-4 py-3 font-semibold transition hover:-translate-y-0.5">
            <span className="flex items-center gap-2"><Bot size={18} />{t("busyOperators.rush.aiToggleLabel", "Elpino AI")}</span>
            <span className="relative h-7 w-12 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: aiOn ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: aiOn ? "calc(100% - 22px)" : "2px" }} /></span>
          </button>
          <div>
            <p className="text-[13px] font-semibold">{t("busyOperators.rush.teammatesOnline", "Teammates online")}</p>
            <div className="mt-2 flex gap-2">
              {TEAM.map(([n, c], i) => {
                const on = i < team;
                return <button key={n} type="button" aria-label={`${n} ${on ? "online" : "offline"}`} aria-pressed={on} onClick={() => setTeam(on && team === i + 1 ? i : i + 1)} className="grid size-11 place-items-center rounded-full border-2 border-[#11120f] text-sm font-bold text-white transition" style={{ backgroundColor: on ? c : "#d9d5c7", opacity: on ? 1 : 0.6, animation: on ? "elpino-float 3s ease-in-out infinite" : undefined }}>{n[0]}</button>;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border-2 border-[#11120f] p-2.5 text-white" style={{ backgroundColor: PURPLE }}><p className="text-2xl font-semibold tabular-nums">{s.ai}</p><p className={`${mono} text-[8.5px] text-white/80`}>{t("busyOperators.rush.resolvedByAi", "Resolved by AI")}</p></div>
            <div className="rounded-xl border-2 border-[#11120f] p-2.5 text-white" style={{ backgroundColor: GREEN }}><p className="text-2xl font-semibold tabular-nums">{s.human}</p><p className={`${mono} text-[8.5px] text-white/80`}>{t("busyOperators.rush.resolvedByTeam", "Resolved by team")}</p></div>
          </div>
          <p className="text-[11.5px] leading-5 text-[#11120f]/50">{t("busyOperators.rush.disclaimer", "A toy model: 3 chats arrive each tick and the AI takes an example share. Real results depend on your knowledge base and tools.")}</p>
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
          <Rv variant="drop"><Stamp color={YELLOW}><Users size={13} />{t("busyOperators.hero.badge", "For busy teams")}</Stamp></Rv>
          <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.058em]">{t("busyOperators.hero.titlePrefix", "Rush hour, ")}<span className="hl">{t("busyOperators.hero.titleHl", "handled.")}</span></h1></Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[56ch] text-lg leading-8 text-[#11120f]/70">{t("busyOperators.hero.subtitle", "When the queue spikes, the AI takes the repeat questions, your team takes the rest, and nobody trips over each other. Flip the switch below and feel the difference.")}</p></Rv>
          <Rv delay={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>{t("busyOperators.hero.ctaStart", "Start free")} <ArrowRight size={17} /></Link>
              <Link href="/product/inbox" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{t("busyOperators.hero.ctaInbox", "See the inbox")}</Link>
            </div>
          </Rv>
        </div>
        <Rv variant="deal" delay={300} className="mt-14"><RushHour t={t} /></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- race to join

function Race({ t }: { t: T }) {
  const reduced = useReduced();
  const [ti, setTi] = useState(0);
  useEffect(() => {
    if (reduced) { setTi(4); return; }
    const id = window.setTimeout(() => setTi((v) => (v >= 6 ? 0 : v + 1)), ti === 0 ? 1200 : ti === 6 ? 2600 : 1100);
    return () => window.clearTimeout(id);
  }, [ti, reduced]);
  const alerted = ti >= 1;
  const priyaJoined = ti >= 3;
  const samBlocked = ti >= 4;

  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Rv variant="drop"><Stamp color={ORANGE}><Eye size={13} />{t("busyOperators.race.badge", "No double replies")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{t("busyOperators.race.titlePrefix", "Two people, one chat. ")}<span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>{t("busyOperators.race.titleHl", "Only one joins.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[48ch] text-lg leading-8 text-white/65">{t("busyOperators.race.subtitle", "Everyone gets the same Join alert. The first person to tap takes the conversation, the alert clears for everyone else, and the inbox shows who has it. A colleague can still Take over later, on purpose.")}</p></Rv>
        </div>
        <Rv variant="deal" delay={100}>
          <div className={`${card} bg-[#fffdf5] p-5 text-[#11120f]`}>
            <div className="rounded-2xl border-2 border-[#11120f] bg-white p-3.5">
              <p className="text-[15px] font-semibold">{t("busyOperators.race.askedForPerson", "Aisha Khan asked for a person")}</p>
              <p className="text-[12.5px] text-[#11120f]/55">{alerted ? t("busyOperators.race.alertSent", "Alert sent to the whole team") : t("busyOperators.race.waiting", "Waiting…")}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[["Priya", GREEN, priyaJoined], ["Sam", BLUE, false]].map(([n, c, won], k) => {
                const isSam = k === 1;
                return (
                  <div key={n as string} className="rounded-2xl border-2 border-[#11120f] p-3.5 transition-all duration-500" style={{ backgroundColor: isSam && samBlocked ? "#f1efe7" : "#fff" }}>
                    <div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-full border-2 border-[#11120f] text-sm font-bold text-white" style={{ backgroundColor: c as string }}>{(n as string)[0]}</span><span className="font-semibold">{n as string}</span></div>
                    <div className="mt-3 h-12">
                      {!isSam && (won ? <span className={`${mono} flex h-full items-center justify-center rounded-lg border-2 border-[#11120f] text-[10px] text-white`} style={{ backgroundColor: GREEN, animation: "elpino-slam .35s both" }}>{t("busyOperators.race.joined", "Joined")}</span>
                        : alerted ? <span className={`${mono} flex h-full items-center justify-center rounded-lg border-2 border-[#11120f] text-[10px]`} style={{ backgroundColor: YELLOW, animation: "elpino-ring 1.4s ease-out infinite" }}>{t("busyOperators.race.joinChat", "Join chat")}</span> : <span className="block h-full" />)}
                      {isSam && (samBlocked ? <span className="flex h-full items-center justify-center text-center text-[11.5px] leading-tight text-[#11120f]/60">{t("busyOperators.race.priyaHasThis", "Priya has this")}</span>
                        : alerted ? <span className={`${mono} flex h-full items-center justify-center rounded-lg border-2 border-[#11120f] text-[10px]`} style={{ backgroundColor: YELLOW, animation: "elpino-ring 1.4s ease-out infinite" }}>{t("busyOperators.race.joinChat", "Join chat")}</span> : <span className="block h-full" />)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border-2 border-[#11120f] px-4 py-3 text-sm font-medium" style={{ backgroundColor: samBlocked ? "#d8f3e9" : "#fff1e6" }}>{samBlocked ? t("busyOperators.race.priyaJoinedFirst", "Priya joined first. The inbox badge now says Priya.") : alerted ? t("busyOperators.race.bothSee", "Both teammates see the alert…") : t("busyOperators.race.customerSaidYes", "Customer said yes to a person")}</div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- context

function Context({ t }: { t: T }) {
  const [seen, setSeen] = useState(true);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("busyOperators.context.eyebrow", "The handoff")} color={PURPLE} title={<>{t("busyOperators.context.titlePrefix", "Nobody repeats ")}<span className="hl">{t("busyOperators.context.titleHl", "themselves.")}</span></>} sub={t("busyOperators.context.subtitle", "Toggle to compare a cold handoff with the one Elpino makes.")} />
        <div className="mx-auto mt-10 flex w-fit rounded-full border-2 border-[#11120f] bg-white p-1">
          {[[false, t("busyOperators.context.toggleCold", "Cold handoff")], [true, t("busyOperators.context.toggleElpino", "Elpino handoff")]].map(([v, l]) => <button key={String(v)} type="button" onClick={() => setSeen(v as boolean)} aria-pressed={seen === v} className="rounded-full px-5 py-2.5 text-[15px] font-semibold transition" style={seen === v ? { backgroundColor: v ? GREEN : PINK, color: "#fff" } : undefined}>{l as string}</button>)}
        </div>
        <div key={String(seen)} className="mt-8" style={{ animation: "elpino-rv-deal .5s both" }}>
          {!seen ? (
            <div className={`${card} mx-auto max-w-3xl bg-white p-6`}>
              <div className="space-y-3 text-[15px]">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-[#f1efe7] px-4 py-2.5">{t("busyOperators.context.coldGreeting", "Hi, I'm Priya. How can I help?")}</div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-4 py-2.5 text-white" style={{ backgroundColor: PURPLE }}>{t("busyOperators.context.coldComplaint", "…I already explained all this to the bot. I moved countries and need my billing country changed. Again.")}</div>
              </div>
              <p className="mt-4 text-center text-sm text-[#11120f]/55">{t("busyOperators.context.coldNote", "The customer starts over, and the team member starts blind.")}</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-[1.2fr_.8fr]">
              <div className={`${card} bg-white p-5`}>
                <p className={`${mono} text-[#11120f]/50`}>{t("busyOperators.context.whatPersonSees", "What the person sees")}</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    [MessageCircle, t("busyOperators.context.reasonLabel", "Reason"), t("busyOperators.context.reasonValue", "Billing country change needs a person")],
                    [Bot, t("busyOperators.context.summaryLabel", "Summary"), t("busyOperators.context.summaryValue", "Moved countries, wants billing country updated. Verified by email code.")],
                    [Clock3, t("busyOperators.context.fullThreadLabel", "Full thread"), t("busyOperators.context.fullThreadValue", "Every message so far, right above the composer")],
                  ].map(([Ic, k, v]) => { const I = Ic as typeof Bot; return (
                    <div key={k as string} className="flex items-start gap-3 rounded-xl border-2 border-[#11120f] bg-[#fffdf5] p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-[#11120f]" style={{ backgroundColor: YELLOW }}><I size={15} /></span><div><p className={`${mono} text-[9px] text-[#11120f]/45`}>{k as string}</p><p className="text-[14.5px] font-medium leading-snug">{v as string}</p></div></div>
                  ); })}
                </div>
              </div>
              <div className={`${card} bg-[#262626] p-5 text-white`}>
                <p className={`${mono} text-white/50`}>{t("busyOperators.context.visitorLabel", "Visitor")}</p>
                <div className="mt-3 space-y-3 text-[13.5px]">
                  <p className="flex items-center gap-2.5"><MapPin size={15} className="text-white/55" />{t("busyOperators.context.visitorLocation", "Pune, India")}</p>
                  <p className="flex items-center gap-2.5"><Search size={15} className="text-white/55" />{t("busyOperators.context.visitorPage", "On /billing")}</p>
                  <p className="flex items-center gap-2.5" style={{ color: "#5fe0b4" }}><ShieldCheck size={15} />{t("busyOperators.context.identityVerified", "Identity verified")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- 24h

function fmt(h: number, am: string, pm: string) { const x = h % 24; return `${x === 0 ? 12 : x > 12 ? x - 12 : x}:00 ${x < 12 ? am : pm}`; }

type AroundMeta = { icon: typeof Bot; c: string };
type AroundText = { t: string; d: string };

const AROUND_DAY_META: AroundMeta[] = [{ icon: Bot, c: PURPLE }, { icon: BellRing, c: ORANGE }, { icon: Users, c: GREEN }];
const AROUND_DAY_EN: AroundText[] = [
  { t: "AI answers first", d: "Repeat questions never reach the queue." },
  { t: "Team gets Join alerts", d: "The first to tap takes the chat." },
  { t: "Hand back any time", d: "Give simple follow-ups back to the AI." },
];
const AROUND_NIGHT_META: AroundMeta[] = [{ icon: Bot, c: PURPLE }, { icon: Ticket, c: ORANGE }, { icon: Inbox, c: GREEN }];
const AROUND_NIGHT_EN: AroundText[] = [
  { t: "AI answers first", d: "Questions it can answer are answered." },
  { t: "Nobody free? Ticket", d: "After 90 seconds a ticket is filed with the reason and summary." },
  { t: "Morning starts organised", d: "The customer was emailed, and tickets are waiting for you." },
];

function useAround(t: T, day: boolean) {
  const meta = day ? AROUND_DAY_META : AROUND_NIGHT_META;
  const key = day ? "busyOperators.around.dayItems" : "busyOperators.around.nightItems";
  const fallback = day ? AROUND_DAY_EN : AROUND_NIGHT_EN;
  const text = tList<AroundText>(t, key, fallback);
  return meta.map((m, i) => ({ ...m, ...text[i] }));
}

function Around({ t }: { t: T }) {
  const [h, setH] = useState(14);
  const day = h >= 9 && h < 18;
  const items = useAround(t, day);
  const am = t("busyOperators.around.am", "AM");
  const pm = t("busyOperators.around.pm", "PM");
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow={t("busyOperators.around.eyebrow", "Round the clock")} color={BLUE} title={<>{t("busyOperators.around.titlePrefix", "Cover every hour, ")}<span className="hl">{t("busyOperators.around.titleHl", "without shifts.")}</span></>} sub={t("busyOperators.around.subtitle", "Drag through an example day. Team hours are 9 to 6 here; yours will be your own.")} />
        <div className={`${card} mt-14 bg-[#fffdf5] p-6 sm:p-8`}>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-3xl font-bold tabular-nums tracking-[-0.03em]">{day ? <Sun size={26} color={ORANGE} /> : <Moon size={26} color={PURPLE} />}{fmt(h, am, pm)}</p>
            <Stamp color={day ? GREEN : PURPLE}>{day ? t("busyOperators.around.teamOnline", "Team online") : t("busyOperators.around.aiOnWatch", "AI on watch")}</Stamp>
          </div>
          <div className="mt-6 flex h-10 overflow-hidden rounded-xl border-2 border-[#11120f]" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="flex-1 border-r border-[#11120f]/15 transition-colors" style={{ backgroundColor: i >= 9 && i < 18 ? "#d8f3e9" : "#e4dffa", outline: i === h ? `3px solid ${INK}` : "none", outlineOffset: -3 }} />)}
          </div>
          <input type="range" min={0} max={23} value={h} onChange={(e) => setH(Number(e.target.value))} aria-label={t("busyOperators.around.hourAriaLabel", "Hour of the day")} className="mt-3 w-full" style={{ accentColor: day ? GREEN : PURPLE }} />
          <div key={String(day)} className="mt-6 grid gap-3 md:grid-cols-3" style={{ animation: "elpino-rv-up .4s both" }}>
            {items.map((it, i) => (
              <div key={i} className={`${card} bg-white p-4`}><span className="grid size-10 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: it.c }}><it.icon size={18} color="#fff" /></span><p className="mt-3 font-semibold leading-snug">{it.t}</p><p className="mt-1 text-[14px] leading-6 text-[#11120f]/60">{it.d}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- toolkit

type ToolMeta = { icon: typeof Inbox; c: string };
type ToolText = { t: string; d: string };

const TOOLS_META: ToolMeta[] = [
  { icon: Inbox, c: BLUE },
  { icon: Search, c: YELLOW },
  { icon: MessageCircle, c: GREEN },
  { icon: ShieldCheck, c: PURPLE },
  { icon: MapPin, c: ORANGE },
  { icon: Headset, c: PINK },
];

const TOOLS_EN: ToolText[] = [
  { t: "Ownership badges", d: "AI, teammate or resolved, on every thread." },
  { t: "Search and filters", d: "All, Unread, Read, Resolved." },
  { t: "Live typing", d: "See when the customer is writing, and let them see you." },
  { t: "Verified badge", d: "Know who has proved who they are." },
  { t: "Visitor details", d: "Location, device and the page they're on." },
  { t: "Take over, hand back", d: "Move a chat between the AI and people in a tap." },
];

function useTools(t: T) {
  const text = tList<ToolText>(t, "busyOperators.toolkit.items", TOOLS_EN);
  return TOOLS_META.map((m, i) => ({ ...m, ...text[i] }));
}

function Toolkit({ t }: { t: T }) {
  const TOOLS = useTools(t);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow={t("busyOperators.toolkit.eyebrow", "Calm by design")} color={ORANGE} title={<>{t("busyOperators.toolkit.titlePrefix", "The small things that ")}<span className="hl">{t("busyOperators.toolkit.titleHl", "keep a queue sane.")}</span></>} />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Rv key={i} variant="pop" delay={(i % 3) * 80}>
              <div className={`${card} group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5`} style={{ backgroundColor: tool.c, color: onDark(tool.c) }}>
                <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />
                <span className="relative grid size-12 place-items-center rounded-2xl border-2 border-[#11120f] bg-white transition-transform duration-300 group-hover:-rotate-12"><tool.icon size={22} color={INK} /></span>
                <h3 className="relative mt-5 text-2xl font-semibold tracking-tight">{tool.t}</h3>
                <p className="relative mt-2 text-[16px] leading-7 opacity-90">{tool.d}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- faq

type Faq = { q: string; a: string };

const FAQS_EN: Faq[] = [
  { q: "How do you stop two people replying to the same customer?", a: "Everyone gets the same Join alert, and the first person to tap takes the chat. The alert clears for everyone else, and the inbox shows who has it." },
  { q: "Will Elpino replace my team?", a: "No. It handles repeat questions, and your people take the conversations that need judgment. You can also hand any chat back to the AI." },
  { q: "What can it learn from?", a: "Your website pages (including JavaScript-built ones), uploaded PDF, Word, text and Markdown files, and pages you write. You control which are public." },
  { q: "What happens when nobody's online?", a: "The AI answers what it can. If a customer asks for a person and nobody joins within 90 seconds, a ticket is filed with the reason and summary, and the customer is emailed." },
  { q: "How long does rollout take?", a: "Most teams are live the same day: add knowledge, paste the widget, and invite teammates." },
];

function Faq({ t }: { t: T }) {
  const FAQS = tList<Faq>(t, "busyOperators.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow={t("busyOperators.faq.eyebrow", "Questions")} color={YELLOW} title={<>{t("busyOperators.faq.titlePrefix", "Good to ")}<span className="hl">{t("busyOperators.faq.titleHl", "know.")}</span></>} />
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
        <Rv delay={100}><p className="mt-8 text-center text-sm text-[#11120f]/55">{t("busyOperators.faq.footNote", "Website chat is live today. Omnichannel is coming in November.")}</p></Rv>
      </div>
    </section>
  );
}

function Closing({ t }: { t: T }) {
  return (
    <section className="bg-white px-5 pb-24 pt-4 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: GREEN }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Users size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-3xl text-[clamp(2.3rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.05em]">{t("busyOperators.closing.title", "Make the queue someone else's problem.")}</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">{t("busyOperators.closing.subtitle", "Start free and invite your team when you're ready.")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>{t("busyOperators.closing.ctaStart", "Start free")} <ArrowRight size={16} /></Link>
            <Link href="/product/tickets" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">{t("busyOperators.closing.ctaTickets", "See tickets")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function BusyTeamsClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero t={t} />
      <Race t={t} />
      <Context t={t} />
      <Around t={t} />
      <Toolkit t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
