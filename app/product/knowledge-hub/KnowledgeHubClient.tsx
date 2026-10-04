"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, BookOpen, Check, Cpu, Eye, EyeOff, FileText, Globe2, Headset, Map, PenLine, Plus, Search, Upload, X,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// Knowledge Hub, as a toy you can play with. You stock a shelf with sources,
// flip books private, then ask questions: Elpino only answers from books that
// are on the shelf and public, exactly as the product does. Below it, the
// real facts: a crawl from one link (up to 50 pages), a sitemap (up to 20),
// .pdf/.docx/.txt/.md uploads and written pages. No third-party connectors
// exist, so none are shown.

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

// ------------------------------------------------------------ live diagram

type SourceText = { name: string; kind: string };
const SOURCES_META = [
  { id: "refund", icon: FileText, color: ORANGE },
  { id: "ship", icon: PenLine, color: GREEN },
  { id: "reset", icon: Globe2, color: BLUE },
  { id: "esc", icon: BookOpen, color: PURPLE, isPrivate: true },
];
const SOURCES_EN: SourceText[] = [
  { name: "Refund policy.pdf", kind: "Document" },
  { name: "Shipping times", kind: "Written page" },
  { name: "Help: reset password", kind: "Web page" },
  { name: "Escalation playbook", kind: "Internal notes" },
];

type Scene = { q: string; hit: string | null; a: string };
const SCENES_EN: Scene[] = [
  { q: "How long do I have to ask for a refund?", hit: "refund", a: "You can request a refund within 30 days of purchase." },
  { q: "How do I reset my password?", hit: "reset", a: "Choose “Forgot password” on the sign-in page and follow the link we email you." },
  { q: "Do you offer discounts for charities?", hit: null, a: "I don't have that information. Would you like me to connect you with our team?" },
  { q: "How long does delivery take?", hit: "ship", a: "Orders usually arrive in 3–5 business days." },
];

// phase: 0 idle · 1 customer asks · 2 searching · 3 result · 4 reply
function Playground({ t }: { t: T }) {
  const sourcesText = tList<SourceText>(t, "knowledgeHub.playground.sources", SOURCES_EN);
  const sources = SOURCES_META.map((meta, i) => ({ ...meta, ...sourcesText[i] }));
  const scenes = tList<Scene>(t, "knowledgeHub.playground.scenes", SCENES_EN);

  const reduced = useReduced();
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    if (reduced) { setPhase(4); return; }
    const wait = [600, 1000, 1900, 1000, 3800][phase];
    const id = window.setTimeout(() => {
      if (phase === 4) { setScene((s) => (s + 1) % scenes.length); setPhase(0); } else setPhase(phase + 1);
    }, wait);
    return () => window.clearTimeout(id);
  }, [phase, reduced, scenes.length]);

  useEffect(() => {
    if (phase !== 2) return;
    const id = window.setInterval(() => setScan((v) => (v + 1) % sources.length), 260);
    return () => window.clearInterval(id);
  }, [phase, sources.length]);

  const sc = scenes[scene];
  const searching = phase === 2;
  const showResult = phase >= 3;
  const status = phase < 2 ? t("knowledgeHub.playground.statusWaiting", "Waiting for a question") : searching ? t("knowledgeHub.playground.statusSearching", "Searching your knowledge…") : sc.hit ? t("knowledgeHub.playground.statusFound", "Found a match") : t("knowledgeHub.playground.statusNoMatch", "No match found");

  return (
    <div className={`${card} overflow-hidden bg-white`}>
      <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1.1fr]">
        {/* left · knowledge badges */}
        <div className="p-5 sm:p-6">
          <p className={`${mono} mb-4 text-[#11120f]/55`}>{t("knowledgeHub.playground.yourKnowledge", "Your knowledge")}</p>
          <div className="space-y-2.5">
            {sources.map((s, i) => {
              const isHit = showResult && sc.hit === s.id;
              const scanning = searching && scan === i;
              return (
                <div key={s.id} className="relative flex items-center gap-3 rounded-lg border border-black/20 px-3 py-3 transition-all duration-300" style={{ backgroundColor: isHit ? "#eafaf3" : scanning ? "#f4f4f2" : "#fff", transform: isHit ? "translateX(10px)" : scanning ? "translateX(5px)" : "none", borderColor: isHit ? GREEN : undefined }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${s.color}1a` }}><s.icon size={16} style={{ color: s.color }} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{s.name}</span><span className="text-[11px] text-[#11120f]/50">{s.kind}</span></span>
                  {s.isPrivate && <span className={`${mono} rounded bg-[#f4f4f2] px-1.5 py-0.5 text-[9px] text-black/60`}>{t("knowledgeHub.playground.privateBadge", "Private")}</span>}
                  {isHit && <span className={`${mono} rounded-full px-2 py-0.5 text-[9px] text-white`} style={{ backgroundColor: GREEN, animation: "elpino-slam .35s both" }}>{t("knowledgeHub.playground.matchBadge", "Match")}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* connector left */}
        <div aria-hidden="true" className="hidden w-14 items-center lg:flex">
          <div className="h-0.5 w-full" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.35) 50%, transparent 50%)`, backgroundSize: "12px 2px", animation: searching || showResult ? "elpino-dashflow 0.8s linear infinite reverse" : "none", opacity: searching || showResult ? 1 : 0.25 }} />
        </div>

        {/* middle · elpino */}
        <div className="flex flex-col items-center justify-center gap-4 bg-[#f4f4f2] p-6">
          <div className="relative">
            {searching && <span aria-hidden="true" className="absolute -inset-3 rounded-full border-2 border-dashed border-[#7060bd]" style={{ animation: "elpino-orbit 3s linear infinite" }} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/help-center-sloth.png" alt="A sloth learning from the knowledge hub" className="relative size-24 rounded-full border border-black/15 bg-white object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
          </div>
          <p className="text-lg font-medium tracking-[-0.02em]">{t("knowledgeHub.playground.elpinoAi", "Elpino AI")}</p>
          <span className={`${mono} inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] text-white`} style={{ backgroundColor: phase < 2 ? "#8a8676" : searching ? INK : sc.hit ? GREEN : ORANGE }}>
            {searching ? <Search size={12} /> : showResult ? (sc.hit ? <Check size={12} strokeWidth={3} /> : <Headset size={12} />) : null}{status}
          </span>
        </div>

        {/* connector right */}
        <div aria-hidden="true" className="hidden w-14 items-center lg:flex">
          <div className="h-0.5 w-full" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.35) 50%, transparent 50%)`, backgroundSize: "12px 2px", animation: phase >= 1 ? "elpino-dashflow 0.8s linear infinite" : "none", opacity: phase >= 1 ? 1 : 0.25 }} />
        </div>

        {/* right · customer */}
        <div className="flex flex-col p-5 sm:p-6">
          <p className={`${mono} mb-4 text-[#11120f]/55`}>{t("knowledgeHub.playground.customer", "Customer")}</p>
          <div className="flex min-h-[210px] flex-1 flex-col justify-center gap-3 text-[14.5px]">
            {phase >= 1 && (
              <div key={`q${scene}`} className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm px-4 py-2.5 text-white" style={{ backgroundColor: INK, animation: "elpino-rv-pop .35s both" }}>{sc.q}</div>
            )}
            {phase >= 2 && phase < 4 && (
              <span className="flex gap-1.5 px-1">{[0, 1, 2].map((d) => <span key={d} className="size-2.5 animate-bounce rounded-full" style={{ backgroundColor: BLUE, animationDelay: `${d * 0.12}s` }} />)}</span>
            )}
            {phase >= 4 && (
              <div key={`a${scene}`} className="max-w-[94%]" style={{ animation: "elpino-rv-pop .35s both" }}>
                <div className={`rounded-2xl rounded-bl-sm border border-black/20 px-4 py-2.5 ${sc.hit ? "bg-white" : "bg-[#f4f4f2]"}`}>{sc.a}</div>
                {sc.hit ? (
                  <span className={`${mono} mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eafaf3] px-2.5 py-1 text-[9px] text-[#0f7a5a]`}><FileText size={10} />{sources.find((s) => s.id === sc.hit)?.name}</span>
                ) : (
                  <span className={`${mono} mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#f4f4f2] px-2.5 py-1 text-[9px] text-black/70`}><Headset size={10} />{t("knowledgeHub.playground.offersHuman", "Offers a human")}</span>
                )}
              </div>
            )}
          </div>
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
          <p className="text-[14px] text-black/50">{t("knowledgeHub.hero.badge", "Knowledge Hub")}</p>
          <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">
            {t("knowledgeHub.hero.titlePrefix", "Ask it anything. ")}{t("knowledgeHub.hero.titleHl", "It checks your knowledge.")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">{t("knowledgeHub.hero.subtitle", "Elpino only answers from the knowledge you give it. Don't take our word for it. Watch it search your knowledge on the left and answer the customer on the right. When it can't find anything, it says so.")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">{t("knowledgeHub.closing.ctaStart", "Start free")} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">{t("knowledgeHub.closing.ctaMeetAgent", "Meet the AI agent")}</Link>
          </div>
        </div>
        <Rv variant="deal" delay={220} className="mt-14"><Playground t={t} /></Rv>
        <Rv delay={100}>
          <p className="mt-6 text-center text-sm text-black/55">{t("knowledgeHub.hero.privateNote", "Private sources are never used to answer customers.")}</p>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- crawl web

const RINGS: [number, number][] = [[6, 78], [10, 140], [14, 200]];
const NODES = RINGS.flatMap(([n, r], ring) => Array.from({ length: n }, (_, k) => {
  const a = (k / n) * Math.PI * 2 + ring * 0.35;
  return { x: 240 + Math.cos(a) * r * 1.02, y: 225 + Math.sin(a) * r * 0.9, ring, skip: (k * 7 + ring * 3) % 5 === 0, key: `${ring}-${k}` };
}));

function CrawlWeb({ t }: { t: T }) {
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(NODES.length); return; }
    const id = window.setInterval(() => setN((v) => (v >= NODES.length + 14 ? 0 : v + 1)), 130);
    return () => window.clearInterval(id);
  }, [reduced]);
  const kept = NODES.slice(0, n).filter((x) => !x.skip).length;

  return (
    <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Rv variant="drop"><Stamp color={GREEN}><Globe2 size={13} />{t("knowledgeHub.crawlWeb.eyebrow", "Discover")}</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("knowledgeHub.crawlWeb.titlePrefix", "One link in. ")}<span style={{ color: "#6db3ff" }}>{t("knowledgeHub.crawlWeb.titleHl", "A whole site out.")}</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[48ch] text-lg leading-8 text-white/65">{t("knowledgeHub.crawlWeb.subtitle", "Give Elpino your homepage and it follows the links itself, up to 50 pages. It reads help, pricing and policy pages first and skips images, downloads and other noise. Pages built with JavaScript are rendered in a real browser so nothing comes back empty.")}</p></Rv>
          <Rv delay={220}>
            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              {[[t("knowledgeHub.crawlWeb.pagesKept", "Pages kept"), kept, GREEN], [t("knowledgeHub.crawlWeb.filesSkipped", "Files skipped"), NODES.slice(0, n).length - kept, PINK]].map(([l, v, c]) => (
                <span key={l as string} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: c as string }} /><b className="tabular-nums">{v as number}</b>{l as string}</span>
              ))}
            </div>
          </Rv>
        </div>
        <Rv variant="pop" delay={100}>
          <div className="rounded-[10px] bg-white p-2">
            <svg viewBox="0 0 480 450" role="img" aria-label={t("knowledgeHub.crawlWeb.svgAlt", "A crawl spreading from one page out to linked pages")} className="w-full">
              {NODES.slice(0, n).map((x) => (
                <line key={`l${x.key}`} x1="240" y1="225" x2={x.x} y2={x.y} stroke={INK} strokeOpacity={x.ring === 0 ? 0.5 : 0.18} strokeWidth="1.5" style={{ animation: "elpino-rv-pop .4s both" }} />
              ))}
              {NODES.slice(0, n).map((x) => (
                <g key={x.key} style={{ animation: "elpino-rv-pop .45s both", transformOrigin: `${x.x}px ${x.y}px` }}>
                  <circle cx={x.x} cy={x.y} r={x.ring === 2 ? 9 : 11} fill={x.skip ? "#e4e4e0" : x.ring === 0 ? GREEN : x.ring === 1 ? BLUE : "#9cc9ff"} stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
                  {x.skip && <path d={`M${x.x - 4} ${x.y - 4} L${x.x + 4} ${x.y + 4} M${x.x + 4} ${x.y - 4} L${x.x - 4} ${x.y + 4}`} stroke={INK} strokeWidth="2" strokeLinecap="round" />}
                </g>
              ))}
              <circle cx="240" cy="225" r="26" fill={INK} />
              <text x="240" y="230" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="monospace">{t("knowledgeHub.crawlWeb.startLabel", "START")}</text>
            </svg>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- other ways

type WayIn = { title: string; big: string; note: string };
const WAYS_META = [
  { icon: Map, color: PURPLE, tilt: "-rotate-2" },
  { icon: Upload, color: ORANGE, tilt: "rotate-1" },
  { icon: PenLine, color: GREEN, tilt: "-rotate-1" },
];
const WAYS_EN: WayIn[] = [
  { title: "Sitemap", big: "20", note: "pages pulled in from your sitemap in one go" },
  { title: "Files", big: ".pdf", note: "also .docx, .txt and .md. Text is extracted for you" },
  { title: "Write it", big: "Aa", note: "policies and “how we do it” pages, written right in the editor" },
];

function Tickets({ t }: { t: T }) {
  const waysText = tList<WayIn>(t, "knowledgeHub.otherWays.items", WAYS_EN);
  const ways = WAYS_META.map((meta, i) => ({ ...meta, ...waysText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("knowledgeHub.otherWays.eyebrow", "More ways in")} color={ORANGE} title={<>{t("knowledgeHub.otherWays.titlePrefix", "Not everything lives ")}{t("knowledgeHub.otherWays.titleHl", "on a website.")}</>} sub={t("knowledgeHub.otherWays.subtitle", "Three more ways to teach Elpino, for the knowledge that never got a URL.")} />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {ways.map((w, i) => (
            <Rv key={w.title} variant="deal" delay={i * 110}>
              <div className={`${card} bg-white p-6 transition-colors duration-300 hover:bg-[#fafaf9]`}>
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full" style={{ backgroundColor: `${w.color}1a` }}><w.icon size={20} style={{ color: w.color }} /></span>
                  <span className={`${mono} text-[#11120f]/45`}>{w.title}</span>
                </div>
                <p className="mt-6 text-[5rem] font-normal leading-none tracking-[-0.06em]" style={{ color: w.color }}>{w.big}</p>
                <div aria-hidden="true" className="my-5 border-t border-dashed border-black/20" />
                <p className="text-[16px] leading-7 text-black/65">{w.note}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- mill

type MillStep = { t: string; d: string };
const MILL_META = [
  { icon: Globe2, color: BLUE },
  { icon: FileText, color: ORANGE },
  { icon: Cpu, color: PURPLE },
  { icon: Search, color: GREEN },
];
const MILL_EN: MillStep[] = [
  { t: "Fetched safely", d: "As ElpinoBot, with protection against reaching private networks." },
  { t: "Cleaned up", d: "Menus and boilerplate out, useful text in." },
  { t: "Chunked and embedded", d: "Split into passages and indexed by meaning, not only keywords." },
  { t: "Found on demand", d: "The closest passages are pulled up the moment a customer asks." },
];

function Mill({ t }: { t: T }) {
  const millText = tList<MillStep>(t, "knowledgeHub.mill.items", MILL_EN);
  const mill = MILL_META.map((meta, i) => ({ ...meta, ...millText[i] }));
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("knowledgeHub.mill.eyebrow", "What happens next")} color={BLUE} title={<>{t("knowledgeHub.mill.titlePrefix", "Every page takes ")}{t("knowledgeHub.mill.titleHl", "the same trip.")}</>} />
        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-0.5 md:block" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 50%, transparent 50%)`, backgroundSize: "2px 12px" }} />
          <div className="space-y-6">
            {mill.map((m, i) => (
              <Rv key={m.t} variant="up" delay={i * 90}>
                <div className="flex items-start gap-5">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-black/20 bg-white"><m.icon size={22} style={{ color: m.color }} /></span>
                  <div className={`${card} flex-1 bg-white p-5`}>
                    <p className={`${mono} text-[#11120f]/45`}>{i + 1}</p>
                    <p className="text-xl font-medium tracking-[-0.02em]">{m.t}</p>
                    <p className="mt-1 text-[16px] leading-7 text-black/65">{m.d}</p>
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


// ------------------------------------------------------------- shared bits

/** Fires once when the element has been scrolled into view. */
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

/** Counts up to `to` the first time it's seen. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
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
  return <span ref={ref} className="tabular-nums">{v}{suffix}</span>;
}

// --------------------------------------------------------------- numbers

type Fact = { to: number; suffix: string; label: string };
const FACTS_EN: Fact[] = [
  { to: 50, suffix: "", label: "pages from one link, crawled for you" },
  { to: 20, suffix: "", label: "pages from a sitemap, in one go" },
  { to: 4, suffix: "", label: "file types read: PDF, Word, text, Markdown" },
  { to: 1, suffix: "", label: "switch per source decides who can see it" },
];

function Numbers({ t }: { t: T }) {
  const facts = tList<Fact>(t, "knowledgeHub.numbers.items", FACTS_EN);
  return (
    <section className="bg-white px-5 pb-8 sm:px-8 lg:px-20">
      <div className="mx-auto grid max-w-[1500px] gap-px overflow-hidden rounded-[10px] border border-black/40 bg-black/15 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <Rv key={f.label} variant="up" delay={i * 80} className="bg-white">
            <div className="h-full p-7">
              <p className="text-[clamp(3rem,5vw,4.4rem)] font-normal leading-none tracking-[-0.05em]"><CountUp to={f.to} suffix={f.suffix} /></p>
              <p className="mt-3 max-w-[22ch] text-[15.5px] leading-6 text-black/60">{f.label}</p>
            </div>
          </Rv>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------- how it reads a page

const RAW_LINES = [
  { text: "Home · Pricing · Login · Sign up", noise: true },
  { text: "Accept cookies   ✕", noise: true },
  { text: "Refunds", noise: false },
  { text: "You can request a refund within 30 days of purchase.", noise: false },
  { text: "Follow us: X · LinkedIn · GitHub", noise: true },
  { text: "Refunds are returned to the original payment method.", noise: false },
  { text: "© 2026 Acme Inc. All rights reserved.", noise: true },
];

function ReadsPage({ t }: { t: T }) {
  const reduced = useReduced();
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setStep(RAW_LINES.length); return; }
    const id = window.setInterval(() => setStep((v) => (v >= RAW_LINES.length + 3 ? 0 : v + 1)), 650);
    return () => window.clearInterval(id);
  }, [seen, reduced]);
  const kept = RAW_LINES.filter((l, i) => !l.noise && i < step).length;
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Heading eyebrow={t("knowledgeHub.reads.eyebrow", "Cleaned up")} color={BLUE} title={t("knowledgeHub.reads.title", "It reads the page, not the menus around it.")} sub={t("knowledgeHub.reads.subtitle", "Navigation, cookie banners and footers are stripped out so only the useful text is kept. If a page is built with JavaScript and has little readable text, it's rendered in a browser first.")} />
          <Rv delay={160}>
            <ul className="mt-8 space-y-3 text-[16px]">
              {tList<string>(t, "knowledgeHub.reads.bullets", ["Menus, banners and footers dropped", "Real text kept, in the order it was written", "JavaScript-built pages rendered first, so nothing comes back empty"]).map((x) => (
                <li key={x} className="flex items-start gap-3"><Check size={18} strokeWidth={3} color={GREEN} className="mt-1 shrink-0" />{x}</li>
              ))}
            </ul>
          </Rv>
        </div>
        <div ref={ref} className="grid gap-4 sm:grid-cols-2">
          <div className={`${card} bg-[#f4f4f2] p-5`}>
            <p className={`${mono} text-black/50`}>{t("knowledgeHub.reads.before", "The web page")}</p>
            <div className="mt-4 space-y-2 font-mono text-[12.5px] leading-5">
              {RAW_LINES.map((l, i) => {
                const scanned = i < step;
                return (
                  <p key={l.text} className="rounded px-2 py-1 transition-all duration-500" style={{ background: scanned && l.noise ? "#fde8ee" : scanned ? "#e3f5ee" : "transparent", color: scanned && l.noise ? "#b0476a" : INK, textDecoration: scanned && l.noise ? "line-through" : "none", opacity: scanned && l.noise ? 0.55 : 1 }}>{l.text}</p>
                );
              })}
            </div>
          </div>
          <div className={`${card} bg-white p-5`}>
            <p className={`${mono} text-black/50`}>{t("knowledgeHub.reads.after", "What Elpino keeps")}</p>
            <div className="mt-4 space-y-2 text-[15px] leading-6">
              {RAW_LINES.map((l, i) => !l.noise && i < step && <p key={l.text} style={{ animation: "elpino-rv-up .45s both" }}>{l.text}</p>)}
              {kept === 0 && <p className="pt-10 text-center text-sm text-black/40">{t("knowledgeHub.reads.reading", "Reading…")}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------- visibility

type Book = { name: string; kind: string };
const BOOKS_EN: Book[] = [
  { name: "Refund policy", kind: "Public page" },
  { name: "Escalation playbook", kind: "Internal notes" },
  { name: "Discount rules", kind: "Internal notes" },
];

function Visibility({ t }: { t: T }) {
  const books = tList<Book>(t, "knowledgeHub.visibility.books", BOOKS_EN);
  const [open, setOpen] = useState<boolean[]>([true, false, false]);
  const [q, setQ] = useState(1);
  const asks = tList<{ q: string; from: number }>(t, "knowledgeHub.visibility.asks", [
    { q: "Can I get a refund?", from: 0 },
    { q: "How do you handle escalations?", from: 1 },
    { q: "What discount can I get?", from: 2 },
  ]);
  const ask = asks[q - 1] ?? asks[0];
  const answered = open[ask.from];
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("knowledgeHub.visibility.eyebrow", "Public or private")} color={PURPLE} title={t("knowledgeHub.visibility.title", "You decide what a customer can learn.")} sub={t("knowledgeHub.visibility.subtitle", "Every source has a visibility switch. Private sources stay internal and are never used to answer a customer. Flip a switch and ask a question to see it.")} />
        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Rv variant="up">
            <div className={`${card} bg-white p-5 sm:p-6`}>
              <p className={`${mono} mb-4 text-black/50`}>{t("knowledgeHub.visibility.sources", "Your sources")}</p>
              <div className="space-y-2.5">
                {books.map((b, i) => (
                  <div key={b.name} className="flex items-center gap-3 rounded-lg border border-black/20 px-3.5 py-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#f4f4f2]">{open[i] ? <Eye size={16} /> : <EyeOff size={16} className="text-black/45" />}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[14.5px] font-medium">{b.name}</span><span className="text-[12px] text-black/50">{b.kind}</span></span>
                    <button type="button" role="switch" aria-checked={open[i]} aria-label={`${b.name}: ${open[i] ? t("knowledgeHub.visibility.public", "Public") : t("knowledgeHub.visibility.private", "Private")}`} onClick={() => setOpen(open.map((v, k) => (k === i ? !v : v)))} className="flex items-center gap-2 text-[12.5px] font-medium text-black/60">
                      {open[i] ? t("knowledgeHub.visibility.public", "Public") : t("knowledgeHub.visibility.private", "Private")}
                      <span className="h-6 w-11 rounded-full p-0.5 transition-colors duration-300" style={{ backgroundColor: open[i] ? GREEN : "#d4d4d0" }}><span className="block size-5 rounded-full bg-white transition-transform duration-300" style={{ transform: open[i] ? "translateX(20px)" : "none" }} /></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Rv>
          <Rv variant="up" delay={100}>
            <div className={`${card} h-full bg-[#f4f4f2] p-5 sm:p-6`}>
              <p className={`${mono} mb-4 text-black/50`}>{t("knowledgeHub.visibility.customerAsks", "A customer asks")}</p>
              <div className="flex flex-wrap gap-2">
                {asks.map((a, i) => (
                  <button key={a.q} type="button" onClick={() => setQ(i + 1)} aria-pressed={q === i + 1} className="rounded-full border border-black/25 bg-white px-3.5 py-1.5 text-[13px] font-medium transition hover:border-black/60" style={q === i + 1 ? { backgroundColor: INK, color: "#fff", borderColor: INK } : undefined}>{a.q}</button>
                ))}
              </div>
              <div key={`${q}-${answered}`} className="mt-5 space-y-3 text-[14.5px]" style={{ animation: "elpino-rv-pop .35s both" }}>
                <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-[#11120f] px-4 py-2.5 text-white">{ask.q}</div>
                {answered ? (
                  <div className="max-w-[94%] rounded-2xl rounded-bl-sm border border-black/20 bg-white px-4 py-2.5">{t("knowledgeHub.visibility.answered", "Here's what I found in")} <b>{books[ask.from].name}</b>.</div>
                ) : (
                  <div className="max-w-[94%] rounded-2xl rounded-bl-sm border border-black/20 bg-white px-4 py-2.5">{t("knowledgeHub.visibility.noInfo", "I don't have that information. Would you like me to connect you with our team?")}</div>
                )}
                <p className={`${mono} flex items-center gap-1.5 text-[10px] ${answered ? "text-[#0f7a5a]" : "text-black/50"}`}>{answered ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}{answered ? t("knowledgeHub.visibility.usedPublic", "Answered from a public source") : t("knowledgeHub.visibility.notUsed", "Private source not used")}</p>
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- when it doesn't know

type Beat = { t: string; d: string };
const BEATS_EN: Beat[] = [
  { t: "It searches your knowledge", d: "The closest passages are pulled up the moment the question arrives." },
  { t: "Nothing close enough", d: "If nothing matches, it says so instead of guessing." },
  { t: "It offers a person", d: "It asks the customer whether to connect them with your team." },
  { t: "Your team joins", d: "Everyone gets a Join alert, and if nobody is free a ticket is filed." },
];
const BEATS_META = [
  { icon: Search, c: BLUE },
  { icon: X, c: ORANGE },
  { icon: Headset, c: PURPLE },
  { icon: Check, c: GREEN },
];

function WhenUnknown({ t }: { t: T }) {
  const beats = tList<Beat>(t, "knowledgeHub.unknown.beats", BEATS_EN);
  const [ref, seen] = useSeen<HTMLDivElement>(0.25);
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setN(beats.length); return; }
    const id = window.setInterval(() => setN((v) => (v >= beats.length + 2 ? 0 : v + 1)), 1100);
    return () => window.clearInterval(id);
  }, [seen, reduced, beats.length]);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("knowledgeHub.unknown.eyebrow", "When it isn't there")} color={ORANGE} title={t("knowledgeHub.unknown.title", "No answer in your knowledge? It says so.")} sub={t("knowledgeHub.unknown.subtitle", "A gap in your knowledge never turns into a made-up answer. It turns into a handoff.")} />
        <div ref={ref} className="relative mt-14 grid gap-4 md:grid-cols-4">
          <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[34px] hidden h-px bg-black/15 md:block">
            <div className="h-full bg-[#11120f] transition-[width] duration-1000 ease-out" style={{ width: `${Math.min(100, (Math.max(0, n - 1) / (beats.length - 1)) * 100)}%` }} />
          </div>
          {beats.map((b, i) => {
            const meta = BEATS_META[i % BEATS_META.length];
            const on = i < n;
            return (
              <div key={b.t} className="flex flex-col items-center text-center">
                <span className="relative z-10 grid size-[68px] place-items-center rounded-full border bg-white transition-all duration-500" style={{ borderColor: on ? meta.c : "rgba(0,0,0,0.2)", boxShadow: on ? `0 0 0 6px ${meta.c}1f` : "none", transform: on ? "scale(1.06)" : "scale(1)" }}><meta.icon size={26} style={{ color: on ? meta.c : "#00000055" }} /></span>
                <div className={`${card} mt-4 w-full bg-white p-4 transition-opacity duration-500`} style={{ opacity: on ? 1 : 0.5 }}>
                  <p className="text-lg font-medium tracking-[-0.02em]">{b.t}</p>
                  <p className="mt-1 text-[14.5px] leading-6 text-black/60">{b.d}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Rv delay={120}>
          <div className="mt-8 flex flex-wrap gap-4 text-[15px]">
            <Link href="/product/inbox" className="inline-flex items-center gap-2 font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("knowledgeHub.unknown.linkInbox", "See the shared inbox")} <ArrowRight size={16} /></Link>
            <Link href="/product/tickets" className="inline-flex items-center gap-2 font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{t("knowledgeHub.unknown.linkTickets", "See tickets")} <ArrowRight size={16} /></Link>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ compare

const COMPARE_EN: [string, string][] = [
  ["Answers from whatever the model remembers", "Answers only from the knowledge you gave it"],
  ["Sounds sure when it's wrong", "Says it doesn't know, and offers a person"],
  ["Internal notes can leak into answers", "Private sources are never used for customers"],
  ["Someone pastes pages in by hand", "Paste a link, a sitemap or a file and it's read for you"],
  ["Knowledge scattered across tools", "One shelf: web pages, files and pages you write"],
];

function Compare({ t }: { t: T }) {
  const rows = tList<[string, string]>(t, "knowledgeHub.compare.rows", COMPARE_EN);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Heading eyebrow={t("knowledgeHub.compare.eyebrow", "Before & after")} color={GREEN} title={t("knowledgeHub.compare.title", "A bot that guesses, and one that checks.")} />
        <div className="mt-12 overflow-hidden rounded-[10px] border border-black/40">
          <div className="hidden grid-cols-2 bg-[#f4f4f2] text-[13px] font-medium text-black/55 md:grid">
            <p className="px-6 py-3">{t("knowledgeHub.compare.headerA", "A typical chatbot")}</p>
            <p className="border-l border-black/15 px-6 py-3">{t("knowledgeHub.compare.headerB", "Elpino with the Knowledge Hub")}</p>
          </div>
          {rows.map(([a, b], i) => (
            <Rv key={a} variant="up" delay={i * 60}>
              <div className="grid border-t border-black/10 md:grid-cols-2">
                <p className="flex items-center gap-3 px-6 py-4 text-black/55"><X size={16} strokeWidth={2.5} className="shrink-0 text-[#d9508a]" aria-hidden="true" />{a}</p>
                <p className="flex items-center gap-3 border-t border-black/10 px-6 py-4 font-medium md:border-l md:border-t-0"><Check size={16} strokeWidth={3} className="shrink-0 text-[#1aa37a]" aria-hidden="true" />{b}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- faq

const FAQS_EN: [string, string][] = [
  ["What can I add?", "Web pages by URL, a sitemap (up to 20 pages), a crawl from one link (up to 50 pages), PDF, Word, text and Markdown files, and pages you write yourself."],
  ["Does it read JavaScript-built pages?", "Yes. If a page has little readable text, it's rendered in a browser first and the result is read."],
  ["Can I keep content private?", "Yes. Each source has a visibility switch, so internal notes stay internal."],
  ["Can I connect Notion, Zendesk or Confluence?", "Notion, yes: connect it and pick the pages to import. Zendesk and Confluence are not available yet; for those, add sources by URL, sitemap, file upload, or by writing pages."],
  ["What if the answer isn't there?", "Elpino says it doesn't have that information and offers to connect the customer with your team, rather than guessing."],
];

function Faq({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "knowledgeHub.faq.items", FAQS_EN);
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("knowledgeHub.faq.titlePrefix", "Good to ")}{t("knowledgeHub.faq.titleHl", "know.")}</h2></Rv>
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
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("knowledgeHub.closing.title", "Stock your real shelf.")}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("knowledgeHub.closing.subtitle", "Paste a link and Elpino starts answering from it.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("knowledgeHub.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("knowledgeHub.closing.ctaMeetAgent", "Meet the AI agent")}</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function KnowledgeHubClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero t={t} />
      <Numbers t={t} />
      <CrawlWeb t={t} />
      <Tickets t={t} />
      <ReadsPage t={t} />
      <Mill t={t} />
      <Visibility t={t} />
      <WhenUnknown t={t} />
      <Compare t={t} />
      <Faq t={t} />
      <Closing t={t} />
    </main>
  );
}
