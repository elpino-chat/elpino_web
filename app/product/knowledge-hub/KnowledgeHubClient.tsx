"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BookOpen, Check, Cpu, FileText, Globe2, Headset, Map, PenLine, Plus, Search, Upload,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// Knowledge Hub, as a toy you can play with. You stock a shelf with sources,
// flip books private, then ask questions: Elpino only answers from books that
// are on the shelf and public, exactly as the product does. Below it, the
// real facts: a crawl from one link (up to 50 pages), a sitemap (up to 20),
// .pdf/.docx/.txt/.md uploads and written pages. No third-party connectors
// exist, so none are shown.

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

// ------------------------------------------------------------ live diagram

type Source = { id: string; name: string; kind: string; icon: typeof Globe2; color: string; isPrivate?: boolean };
const SOURCES: Source[] = [
  { id: "refund", name: "Refund policy.pdf", kind: "Document", icon: FileText, color: ORANGE },
  { id: "ship", name: "Shipping times", kind: "Written page", icon: PenLine, color: GREEN },
  { id: "reset", name: "Help: reset password", kind: "Web page", icon: Globe2, color: BLUE },
  { id: "esc", name: "Escalation playbook", kind: "Internal notes", icon: BookOpen, color: PURPLE, isPrivate: true },
];

// Each scene: what the customer asks, which source answers (or none), the reply.
const SCENES: { q: string; hit: string | null; a: string }[] = [
  { q: "How long do I have to ask for a refund?", hit: "refund", a: "You can request a refund within 30 days of purchase." },
  { q: "How do I reset my password?", hit: "reset", a: "Choose “Forgot password” on the sign-in page and follow the link we email you." },
  { q: "Do you offer discounts for charities?", hit: null, a: "I don't have that information. Would you like me to connect you with our team?" },
  { q: "How long does delivery take?", hit: "ship", a: "Orders usually arrive in 3–5 business days." },
];

// phase: 0 idle · 1 customer asks · 2 searching · 3 result · 4 reply
function Playground() {
  const reduced = useReduced();
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    if (reduced) { setPhase(4); return; }
    const wait = [600, 1000, 1900, 1000, 3800][phase];
    const id = window.setTimeout(() => {
      if (phase === 4) { setScene((s) => (s + 1) % SCENES.length); setPhase(0); } else setPhase(phase + 1);
    }, wait);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== 2) return;
    const id = window.setInterval(() => setScan((v) => (v + 1) % SOURCES.length), 260);
    return () => window.clearInterval(id);
  }, [phase]);

  const sc = SCENES[scene];
  const searching = phase === 2;
  const showResult = phase >= 3;
  const status = phase < 2 ? "Waiting for a question" : searching ? "Searching your knowledge…" : sc.hit ? "Found a match" : "No match found";

  return (
    <div className={`${card} overflow-hidden bg-[#fffdf5]`}>
      <div className="grid lg:grid-cols-[1fr_auto_1fr_auto_1.1fr]">
        {/* left · knowledge badges */}
        <div className="p-5 sm:p-6">
          <p className={`${mono} mb-4 text-[#11120f]/55`}>Your knowledge</p>
          <div className="space-y-2.5">
            {SOURCES.map((s, i) => {
              const isHit = showResult && sc.hit === s.id;
              const scanning = searching && scan === i;
              return (
                <div key={s.id} className="relative flex items-center gap-3 rounded-xl border-2 border-[#11120f] px-3 py-3 transition-all duration-300" style={{ backgroundColor: isHit ? "#eafaf3" : scanning ? "#fff6cf" : "#fff", transform: isHit ? "translateX(10px) scale(1.03)" : scanning ? "translateX(5px)" : "none", boxShadow: isHit ? `0 0 0 4px ${GREEN}55` : "none" }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-[#11120f]" style={{ backgroundColor: s.color }}><s.icon size={16} color="#fff" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{s.name}</span><span className="text-[11px] text-[#11120f]/50">{s.kind}</span></span>
                  {s.isPrivate && <span className={`${mono} rounded border-2 border-[#11120f] bg-[#e7e2d6] px-1.5 py-0.5 text-[9px]`}>Private</span>}
                  {isHit && <span className={`${mono} rounded-full border-2 border-[#11120f] px-2 py-0.5 text-[9px] text-white`} style={{ backgroundColor: GREEN, animation: "elpino-slam .35s both" }}>Match</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* connector left */}
        <div aria-hidden="true" className="hidden w-14 items-center lg:flex">
          <div className="h-0.5 w-full" style={{ backgroundImage: `linear-gradient(90deg, ${INK} 50%, transparent 50%)`, backgroundSize: "12px 2px", animation: searching || showResult ? "elpino-dashflow 0.8s linear infinite reverse" : "none", opacity: searching || showResult ? 1 : 0.25 }} />
        </div>

        {/* middle · elpino */}
        <div className="flex flex-col items-center justify-center gap-4 border-y-2 border-[#11120f] bg-[#f1eefb] p-6 lg:border-y-0">
          <div className="relative">
            {searching && <span aria-hidden="true" className="absolute -inset-3 rounded-full border-2 border-dashed border-[#7060bd]" style={{ animation: "elpino-orbit 3s linear infinite" }} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/help-center-sloth.png" alt="A sloth learning from the knowledge hub" className="relative size-24 rounded-full border-2 border-[#11120f] bg-white object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
          </div>
          <p className="text-lg font-semibold tracking-tight">Elpino AI</p>
          <span className={`${mono} inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-3 py-1.5 text-[10px] text-white`} style={{ backgroundColor: phase < 2 ? "#8a8676" : searching ? PURPLE : sc.hit ? GREEN : ORANGE }}>
            {searching ? <Search size={12} /> : showResult ? (sc.hit ? <Check size={12} strokeWidth={3} /> : <Headset size={12} />) : null}{status}
          </span>
        </div>

        {/* connector right */}
        <div aria-hidden="true" className="hidden w-14 items-center lg:flex">
          <div className="h-0.5 w-full" style={{ backgroundImage: `linear-gradient(90deg, ${INK} 50%, transparent 50%)`, backgroundSize: "12px 2px", animation: phase >= 1 ? "elpino-dashflow 0.8s linear infinite" : "none", opacity: phase >= 1 ? 1 : 0.25 }} />
        </div>

        {/* right · customer */}
        <div className="flex flex-col p-5 sm:p-6">
          <p className={`${mono} mb-4 text-[#11120f]/55`}>Customer</p>
          <div className="flex min-h-[210px] flex-1 flex-col justify-center gap-3 text-[14.5px]">
            {phase >= 1 && (
              <div key={`q${scene}`} className="ml-auto max-w-[90%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-4 py-2.5 text-white" style={{ backgroundColor: PURPLE, animation: "elpino-rv-pop .35s both" }}>{sc.q}</div>
            )}
            {phase >= 2 && phase < 4 && (
              <span className="flex gap-1.5 px-1">{[0, 1, 2].map((d) => <span key={d} className="size-2.5 animate-bounce rounded-full" style={{ backgroundColor: BLUE, animationDelay: `${d * 0.12}s` }} />)}</span>
            )}
            {phase >= 4 && (
              <div key={`a${scene}`} className="max-w-[94%]" style={{ animation: "elpino-rv-pop .35s both" }}>
                <div className={`rounded-2xl rounded-bl-sm border-2 border-[#11120f] px-4 py-2.5 ${sc.hit ? "bg-white" : "bg-[#fff1e6]"}`}>{sc.a}</div>
                {sc.hit ? (
                  <span className={`${mono} mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-2.5 py-1 text-[9px]`}><FileText size={10} />{SOURCES.find((s) => s.id === sc.hit)?.name}</span>
                ) : (
                  <span className={`${mono} mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-2.5 py-1 text-[9px] text-white`} style={{ backgroundColor: ORANGE }}><Headset size={10} />Offers a human</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 50%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent)" }} />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><BookOpen size={13} />Knowledge Hub</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.7rem,6.6vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              Ask it anything. <span className="hl">It checks your knowledge.</span>
            </h1>
          </Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[56ch] text-lg leading-8 text-[#11120f]/70">Elpino only answers from the knowledge you give it. Don&apos;t take our word for it. Watch it search your knowledge on the left and answer the customer on the right. When it can&apos;t find anything, it says so.</p></Rv>
        </div>
        <Rv variant="deal" delay={220} className="mt-12"><Playground /></Rv>
        <Rv delay={100}>
          <p className="mt-6 text-center text-sm text-[#11120f]/60">Private sources are never used to answer customers.</p>
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

function CrawlWeb() {
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(NODES.length); return; }
    const id = window.setInterval(() => setN((v) => (v >= NODES.length + 14 ? 0 : v + 1)), 130);
    return () => window.clearInterval(id);
  }, [reduced]);
  const kept = NODES.slice(0, n).filter((x) => !x.skip).length;

  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Rv variant="drop"><Stamp color={GREEN}><Globe2 size={13} />Discover</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">One link in. <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>A whole site out.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[48ch] text-lg leading-8 text-white/65">Give Elpino your homepage and it follows the links itself, up to 50 pages. It reads help, pricing and policy pages first and skips images, downloads and other noise. Pages built with JavaScript are rendered in a real browser so nothing comes back empty.</p></Rv>
          <Rv delay={220}>
            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              {[["Pages kept", kept, GREEN], ["Files skipped", NODES.slice(0, n).length - kept, PINK]].map(([l, v, c]) => (
                <span key={l as string} className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-4 py-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: c as string }} /><b className="tabular-nums">{v as number}</b>{l as string}</span>
              ))}
            </div>
          </Rv>
        </div>
        <Rv variant="pop" delay={100}>
          <div className={`${card} bg-[#fffdf5] p-2`}>
            <svg viewBox="0 0 480 450" role="img" aria-label="A crawl spreading from one page out to linked pages" className="w-full">
              {NODES.slice(0, n).map((x) => (
                <line key={`l${x.key}`} x1="240" y1="225" x2={x.x} y2={x.y} stroke={INK} strokeOpacity={x.ring === 0 ? 0.5 : 0.18} strokeWidth="1.5" style={{ animation: "elpino-rv-pop .4s both" }} />
              ))}
              {NODES.slice(0, n).map((x) => (
                <g key={x.key} style={{ animation: "elpino-rv-pop .45s both", transformOrigin: `${x.x}px ${x.y}px` }}>
                  <circle cx={x.x} cy={x.y} r={x.ring === 2 ? 9 : 11} fill={x.skip ? "#e7e2d6" : x.ring === 0 ? GREEN : x.ring === 1 ? BLUE : YELLOW} stroke={INK} strokeWidth="2" />
                  {x.skip && <path d={`M${x.x - 4} ${x.y - 4} L${x.x + 4} ${x.y + 4} M${x.x + 4} ${x.y - 4} L${x.x - 4} ${x.y + 4}`} stroke={INK} strokeWidth="2" strokeLinecap="round" />}
                </g>
              ))}
              <circle cx="240" cy="225" r="26" fill={PURPLE} stroke={INK} strokeWidth="2.5" />
              <text x="240" y="230" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="monospace">START</text>
            </svg>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- other ways

const TICKETS = [
  { icon: Map, color: PURPLE, title: "Sitemap", big: "20", note: "pages pulled in from your sitemap in one go", tilt: "-rotate-2" },
  { icon: Upload, color: ORANGE, title: "Files", big: ".pdf", note: "also .docx, .txt and .md. Text is extracted for you", tilt: "rotate-1" },
  { icon: PenLine, color: GREEN, title: "Write it", big: "Aa", note: "policies and “how we do it” pages, written right in the editor", tilt: "-rotate-1" },
];

function Tickets() {
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="More ways in" color={ORANGE} title={<>Not everything lives <span className="hl">on a website.</span></>} sub="Three more ways to teach Elpino, for the knowledge that never got a URL." />
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {TICKETS.map((t, i) => (
            <Rv key={t.title} variant="deal" delay={i * 110}>
              <div className={`${card} ${t.tilt} bg-white p-6 transition duration-300 hover:rotate-0 hover:-translate-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: t.color }}><t.icon size={20} color="#fff" /></span>
                  <span className={`${mono} text-[#11120f]/45`}>{t.title}</span>
                </div>
                <p className="mt-6 text-[5rem] font-semibold leading-none tracking-[-0.06em]" style={{ color: t.color }}>{t.big}</p>
                <div aria-hidden="true" className="my-5 border-t-2 border-dashed border-[#11120f]/25" />
                <p className="text-[16px] leading-7 text-[#11120f]/70">{t.note}</p>
              </div>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- mill

const MILL = [
  { icon: Globe2, t: "Fetched safely", d: "As ElpinoBot, with protection against reaching private networks.", color: BLUE },
  { icon: FileText, t: "Cleaned up", d: "Menus and boilerplate out, useful text in.", color: ORANGE },
  { icon: Cpu, t: "Chunked and embedded", d: "Split into passages and indexed by meaning, not only keywords.", color: PURPLE },
  { icon: Search, t: "Found on demand", d: "The closest passages are pulled up the moment a customer asks.", color: GREEN },
];

function Mill() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="What happens next" color={BLUE} title={<>Every page takes <span className="hl">the same trip.</span></>} />
        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-0.5 md:block" style={{ backgroundImage: `linear-gradient(${INK} 50%, transparent 50%)`, backgroundSize: "2px 12px" }} />
          <div className="space-y-6">
            {MILL.map((m, i) => (
              <Rv key={m.t} variant="up" delay={i * 90}>
                <div className="flex items-start gap-5">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: m.color }}><m.icon size={22} color="#fff" /></span>
                  <div className={`${card} flex-1 bg-[#fffdf5] p-5`}>
                    <p className={`${mono} text-[#11120f]/45`}>{i + 1}</p>
                    <p className="text-xl font-semibold tracking-tight">{m.t}</p>
                    <p className="mt-1 text-[16px] leading-7 text-[#11120f]/65">{m.d}</p>
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

const FAQS: [string, string][] = [
  ["What can I add?", "Web pages by URL, a sitemap (up to 20 pages), a crawl from one link (up to 50 pages), PDF, Word, text and Markdown files, and pages you write yourself."],
  ["Does it read JavaScript-built pages?", "Yes. If a page has little readable text, it's rendered in a browser first and the result is read."],
  ["Can I keep content private?", "Yes. Each source has a visibility switch, so internal notes stay internal."],
  ["Can I connect Notion, Zendesk or Confluence?", "Not yet. Today you add sources by URL, sitemap, file upload, or by writing pages."],
  ["What if the answer isn't there?", "Elpino says it doesn't have that information and offers to connect the customer with your team, rather than guessing."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow="Questions" color={YELLOW} title={<>Good to <span className="hl">know.</span></>} />
        <div className="mt-12 space-y-3">
          {FAQS.map(([q, a], i) => (
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

function Closing() {
  return (
    <section className="bg-white px-5 pb-24 pt-8 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: PURPLE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
          <h2 className="relative mx-auto max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Stock your real shelf.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/85">Paste a link and Elpino starts answering from it.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/product/ai-agent" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">Meet the AI agent</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function KnowledgeHubClient() {
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero />
      <CrawlWeb />
      <Tickets />
      <Mill />
      <Faq />
      <Closing />
    </main>
  );
}
