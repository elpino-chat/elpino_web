"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpen, Bot, Check, Code2, Eye, Headset, Inbox, KeyRound, Languages, Lock, Palette, Plug, Plus, Rocket, ShieldCheck, Sparkles, Ticket, Upload, Users, Wallet,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { ConnectorLogo } from "@/app/components/ConnectorLogo";

// The home page. Real product screenshot up top, then a short tour of what
// Elpino actually does (each card links to its page), who it's for, what it
// plugs into, and how it's priced. Only shipped behaviour is described, and
// omnichannel is marked as coming in November.

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

const CONVO: { from: "you" | "tool" | "ai"; text: string }[] = [
  { from: "you", text: "Was I charged twice for my upgrade?" },
  { from: "tool", text: "Checked your payment record" },
  { from: "ai", text: "You were charged once. The second attempt failed and was never captured." },
];

function MiniWidget() {
  const reduced = useReduced();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(CONVO.length); return; }
    const id = window.setTimeout(() => setN((v) => (v >= CONVO.length ? 0 : v + 1)), n === 0 ? 900 : n >= CONVO.length ? 4200 : 1500);
    return () => window.clearTimeout(id);
  }, [n, reduced]);
  return (
    <div className={`${card} w-[290px] overflow-hidden bg-white`}>
      <div className="flex items-center gap-2.5 border-b-2 border-[#11120f] px-3.5 py-2.5 text-white" style={{ backgroundColor: BLUE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/elpino-mascot-0.png" alt="" className="size-8 rounded-full border-2 border-[#11120f] bg-[#ffd84d] object-cover object-top" />
        <div><p className="text-[13px] font-semibold leading-tight">Elpino</p><p className="text-[10.5px] opacity-90">Answers in seconds</p></div>
      </div>
      <div className="flex h-[188px] flex-col justify-end gap-2 bg-[#fffdf5] p-3 text-[12.5px]">
        {CONVO.slice(0, n).map((l, i) => l.from === "tool" ? (
          <div key={i} className="flex w-fit items-center gap-1.5 rounded-full border-2 border-dashed border-[#7060bd] bg-[#f1eefb] px-2.5 py-1 text-[11px] font-medium text-[#4a3d94]" style={{ animation: "elpino-rv-pop .35s both" }}><Check size={11} strokeWidth={3} />{l.text}</div>
        ) : (
          <div key={i} className={`max-w-[88%] rounded-2xl border-2 border-[#11120f] px-3 py-2 leading-[1.45] ${l.from === "you" ? "ml-auto rounded-br-sm text-white" : "rounded-bl-sm bg-white"}`} style={{ animation: "elpino-rv-pop .35s both", ...(l.from === "you" ? { backgroundColor: PURPLE } : {}) }}>{l.text}</div>
        ))}
      </div>
    </div>
  );
}

// A sticker you can pick up and move around.
function Drag({ children, x, y, rot = 0 }: { children: ReactNode; x: string; y: string; rot?: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [down, setDown] = useState(false);
  const start = useRef({ px: 0, py: 0, x: 0, y: 0 });
  return (
    <div
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }; setDown(true); }}
      onPointerMove={(e) => { if (down) setPos({ x: start.current.x + e.clientX - start.current.px, y: start.current.y + e.clientY - start.current.py }); }}
      onPointerUp={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      className="absolute z-20 hidden cursor-grab select-none touch-none active:cursor-grabbing lg:block"
      style={{ left: x, top: y, transform: `translate(${pos.x}px, ${pos.y}px) rotate(${down ? 0 : rot}deg) scale(${down ? 1.08 : 1})`, transition: down ? "none" : "transform .25s" }}
    >
      {children}
    </div>
  );
}

const WORDS = ["answers.", "resolves.", "remembers.", "hands off."];

function RotatingWord() {
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % WORDS.length), 2300);
    return () => window.clearInterval(id);
  }, [reduced]);
  return (
    <span className="relative inline-block">
      <span key={i} className="hl inline-block" style={{ animation: "elpino-rv-drop .5s both" }}>{WORDS[i]}</span>
    </span>
  );
}

const CALLOUTS = [
  { label: "AI badge on every thread", color: PURPLE, style: { left: "2%", top: "-3%" } },
  { label: "Join to take over", color: YELLOW, style: { right: "2%", top: "-3%" } },
  { label: "Visitor location & device", color: ORANGE, style: { right: "1%", top: "30%" } },
] as const;

function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }} />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        {/* stickers you can drag */}
        <Drag x="1%" y="20%" rot={-8}><Stamp color={GREEN}><Check size={12} strokeWidth={3} />Resolved by AI</Stamp></Drag>
        <Drag x="80%" y="14%" rot={7}><Stamp color={ORANGE}><Headset size={12} />Human on standby</Stamp></Drag>
        <Drag x="86%" y="46%" rot={-5}><Stamp color={PURPLE}><Lock size={12} />Private by default</Stamp></Drag>
        <Drag x="-1%" y="52%" rot={6}><Stamp color={PINK}><Ticket size={12} />Nothing dropped</Stamp></Drag>

        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Sparkles size={13} />AI customer support</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(3rem,7.4vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.058em]">Support that <RotatingWord /></h1>
          </Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[58ch] text-lg leading-8 text-[#11120f]/70">An AI that answers from your own knowledge, checks real payments and orders, and hands over to your team with the full story when a person is needed.</p></Rv>
          <Rv delay={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-white transition hover:-translate-y-0.5" style={{ backgroundColor: BLUE }}>Start free <ArrowRight size={17} /></Link>
              <Link href="#try-it" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-7 font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">Try it yourself</Link>
            </div>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-[#11120f]/60">
              {["100 free AI messages a month", "No card required", "Live in an afternoon"].map((t) => <span key={t} className="inline-flex items-center gap-1.5"><Check size={14} color={GREEN} strokeWidth={3} />{t}</span>)}
            </p>
          </Rv>
        </div>

        <Rv variant="deal" delay={300} className="relative mt-16">
          <div
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -5, y: ((e.clientX - r.left) / r.width - 0.5) * 6 }); }}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: "transform .2s ease-out" }}
          >
            <div className={`${card} relative overflow-hidden bg-[#262626]`}>
              <Image src="/inbox_prev.png" alt="The Elpino team inbox: conversation list, an AI-handled thread and the visitor's location and device" width={1915} height={812} priority className="h-auto w-full" sizes="(min-width: 1152px) 1100px, 100vw" />
              <span aria-hidden="true" className="absolute rounded bg-[#262626]" style={{ left: "42.4%", top: "5.4%", width: "15.2%", height: "3%" }} />
              <span aria-hidden="true" className="absolute rounded bg-[#262626]" style={{ left: "82.2%", top: "20%", width: "16.2%", height: "3.4%" }} />
            </div>
          </div>
          {CALLOUTS.map((c, i) => (
            <span key={c.label} className={`${mono} absolute hidden rotate-[-3deg] rounded-full border-2 border-[#11120f] px-3 py-1.5 text-[10px] md:inline-flex`} style={{ ...c.style, backgroundColor: c.color, color: onDark(c.color), animation: `elpino-float ${4 + i * 0.7}s ease-in-out ${-i}s infinite` }}>{c.label}</span>
          ))}
          <div className="absolute -bottom-10 left-3 z-10 hidden sm:block lg:left-8" style={{ animation: "elpino-float 6s ease-in-out infinite" }}><MiniWidget /></div>
        </Rv>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ marquee

const QUESTIONS = ["Where's my invoice?", "How do I reset my password?", "Was I charged twice?", "Can I get a refund?", "Where is my order?", "How do I add a teammate?", "Is my data safe?", "Why did my payment fail?", "Can I speak to someone?"];

function Marquee() {
  const row = [...QUESTIONS, ...QUESTIONS];
  const colors = [YELLOW, "#fff", "#c9d9ff", "#d8f3e9", "#ffe6d6"];
  return (
    <div className="mt-16 overflow-hidden border-y-2 border-[#11120f] bg-[#fff8ec] py-5 sm:mt-20" aria-label="Questions Elpino answers every day">
      <div className="flex w-max gap-3" style={{ animation: "elpino-marquee 40s linear infinite" }}>
        {row.map((q, i) => <span key={i} className="whitespace-nowrap rounded-full border-2 border-[#11120f] px-5 py-2 text-[15px] font-medium" style={{ backgroundColor: colors[i % colors.length] }}>{q}</span>)}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- try it

type QA = { q: string; steps: string[]; a: string; human?: boolean };
const QAS: QA[] = [
  { q: "Was I charged twice?", steps: ["Verified you by email code", "Checked your payment record"], a: "You were charged once. The second attempt failed and was never captured." },
  { q: "Where is my order?", steps: ["Verified you by email code", "Called your shop over MCP"], a: "It shipped yesterday and arrives Thursday. I've emailed the tracking link." },
  { q: "How do I reset my password?", steps: ["Searched your knowledge base"], a: "Choose “Forgot password” on the sign-in page and follow the link we email you." },
  { q: "Can I get a refund?", steps: ["Checked the payment", "Refunds are switched off for this workspace"], a: "I can't refund that myself. Would you like me to connect you with our team?", human: true },
  { q: "Can I speak to someone?", steps: ["Asked you before handing off", "Alerted every teammate at once"], a: "Priya from our team has joined and has the whole conversation.", human: true },
  { q: "Do you sell gift cards?", steps: ["Searched your knowledge base", "No match found"], a: "I don't have that information. Would you like me to connect you with our team?", human: true },
];

function TryIt() {
  const [sel, setSel] = useState(0);
  const [stage, setStage] = useState(0);
  const qa = QAS[sel];
  useEffect(() => {
    setStage(0);
    const total = qa.steps.length + 1;
    const ids: number[] = [];
    for (let k = 1; k <= total; k++) ids.push(window.setTimeout(() => setStage(k), 500 + k * 750));
    return () => ids.forEach((t) => window.clearTimeout(t));
  }, [sel, qa.steps.length]);
  const done = stage > qa.steps.length;

  return (
    <section id="try-it" className="scroll-mt-20 bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Try it" color={PURPLE} title={<>Ask it something. <span className="hl">See what it does.</span></>} sub="Pick a customer question. On the left is the chat, on the right is everything Elpino did before it replied." />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {QAS.map((x, i) => <button key={x.q} type="button" onClick={() => setSel(i)} aria-pressed={i === sel} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[14.5px] font-semibold transition hover:-translate-y-0.5" style={i === sel ? { backgroundColor: YELLOW } : { backgroundColor: "#fff" }}>{x.q}</button>)}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <div className={`${card} flex min-h-[380px] flex-col overflow-hidden bg-[#fffdf5]`}>
            <div className="flex items-center gap-2.5 border-b-2 border-[#11120f] px-4 py-3 text-white" style={{ backgroundColor: BLUE }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/elpino-mascot-0.png" alt="" className="size-9 rounded-full border-2 border-[#11120f] bg-[#ffd84d] object-cover object-top" />
              <div><p className="text-sm font-semibold leading-tight">Elpino</p><p className="text-[11px] opacity-90">AI support</p></div>
            </div>
            <div key={sel} className="flex flex-1 flex-col justify-end gap-2.5 p-4 text-[14px]">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-3.5 py-2.5 text-white" style={{ backgroundColor: PURPLE, animation: "elpino-rv-pop .35s both" }}>{qa.q}</div>
              {!done && <span className="flex gap-1.5 px-1">{[0, 1, 2].map((d) => <span key={d} className="size-2.5 animate-bounce rounded-full" style={{ backgroundColor: BLUE, animationDelay: `${d * 0.12}s` }} />)}</span>}
              {done && <div className="max-w-[92%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] px-3.5 py-2.5 leading-6" style={{ backgroundColor: qa.human ? "#fff1e6" : "#fff", animation: "elpino-rv-pop .4s both" }}>{qa.a}</div>}
            </div>
          </div>
          <div className={`${card} flex min-h-[380px] flex-col overflow-hidden bg-[#11120f] text-white`}>
            <div className="flex items-center justify-between border-b-2 border-white/15 px-4 py-3"><span className={`${mono} text-white/60`}>What Elpino did</span><span className="text-[11px] text-white/60">{done ? "Done" : "Working…"}</span></div>
            <div className="flex-1 space-y-2.5 p-4 font-mono text-[13px]">
              {qa.steps.slice(0, Math.max(0, stage)).map((s, i) => (
                <div key={sel + s} className="flex items-start gap-2.5" style={{ animation: "elpino-rv-up .4s both" }}><span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#11120f]" style={{ backgroundColor: i === 0 ? YELLOW : "#c9f5e2" }}>{i === 0 ? "start" : "step"}</span><span className="text-white/90">{s}</span></div>
              ))}
              {done && <div className="flex items-start gap-2.5" style={{ animation: "elpino-rv-up .4s both" }}><span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" style={{ backgroundColor: qa.human ? ORANGE : GREEN }}>{qa.human ? "person" : "resolved"}</span><span style={{ color: qa.human ? "#ffb98a" : "#7dffc5" }}>{qa.human ? "Asked first · a teammate can join, or a ticket is filed" : "Answered and resolved, no human needed"}</span></div>}
            </div>
            <p className="border-t-2 border-white/15 px-4 py-3 text-[11.5px] text-white/45">Sample answers. The steps shown are the kinds of tools Elpino really uses.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- make it yours

const ACCENTS = [BLUE, PURPLE, GREEN, ORANGE, PINK, INK];

type LangKey = "en" | "es" | "fr" | "hi";
const LANGS: { k: LangKey; label: string; q: string; a1: string; a0: string }[] = [
  { k: "en", label: "English", q: "Do you have a free plan?", a1: "Yes! Since you're looking at pricing, the Free plan includes 100 AI messages a month.", a0: "Yes, the Free plan includes 100 AI messages a month." },
  { k: "es", label: "Español", q: "¿Tienen un plan gratuito?", a1: "¡Sí! Como estás viendo los precios, el plan Gratis incluye 50 conversaciones con IA al mes.", a0: "Sí, el plan Gratis incluye 50 conversaciones con IA al mes." },
  { k: "fr", label: "Français", q: "Avez-vous une offre gratuite ?", a1: "Oui ! Puisque vous consultez les tarifs, l'offre Gratuite comprend 100 messages IA par mois.", a0: "Oui, l'offre Gratuite comprend 100 messages IA par mois." },
  { k: "hi", label: "हिन्दी", q: "क्या आपके पास कोई मुफ़्त प्लान है?", a1: "हाँ! चूँकि आप कीमतें देख रहे हैं, मुफ़्त प्लान में हर महीने 100 AI संदेश शामिल हैं।", a0: "हाँ, मुफ़्त प्लान में हर महीने 100 AI संदेश शामिल हैं।" },
];

function Customizer() {
  const [accent, setAccent] = useState(BLUE);
  const [dark, setDark] = useState(false);
  const [name, setName] = useState("Acme AI");
  const [greeting, setGreeting] = useState("Hi there 👋 How can I help you today?");
  const [logo, setLogo] = useState<string | null>(null);
  const [asks, setAsks] = useState<LangKey>("es");
  const [reply, setReply] = useState<"auto" | LangKey>("auto");
  const [url, setUrl] = useState(true);
  const [fileNote, setFileNote] = useState("");

  useEffect(() => () => { if (logo) URL.revokeObjectURL(logo); }, [logo]);
  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 2_000_000) { setFileNote("Use an image under 2 MB."); return; }
    setFileNote("Shown here only. It's not uploaded anywhere.");
    setLogo(URL.createObjectURL(f));
  };

  const customer = LANGS.find((l) => l.k === asks)!;
  const replyLang = LANGS.find((l) => l.k === (reply === "auto" ? asks : reply))!;
  const bg = dark ? "#1c1c1f" : "#fffdf5";
  const fg = dark ? "#f2f2f4" : INK;
  const bub = dark ? "#2b2b30" : "#fff";
  const avatar = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="" className="size-full object-cover" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/elpino-mascot-1.png" alt="" className="size-full object-cover object-top" />
  );

  const field = "mt-2 w-full rounded-xl border-2 border-[#11120f] bg-white px-3.5 py-2.5 text-[15px] outline-none focus:bg-[#fff6cf]";
  const chip = (on: boolean) => ({ backgroundColor: on ? YELLOW : "#fff" });

  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Rv variant="drop"><Stamp color={PINK}><Palette size={13} />Make it yours</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">A widget that <span className="hl">looks and speaks like you.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[50ch] text-lg leading-8 text-[#11120f]/65">Add your logo, name your AI, pick a colour and theme, and choose the language it replies in. Play with the controls and watch the widget change.</p></Rv>
          <Rv delay={220}>
            <div className={`${card} mt-8 space-y-6 bg-white p-5 sm:p-6`}>
              <div>
                <p className="text-sm font-semibold">Your logo</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="grid size-14 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-white">{avatar}</span>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}><Upload size={15} />Upload a logo<input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label>
                  {logo && <button type="button" onClick={() => { setLogo(null); setFileNote(""); }} className="text-[13.5px] font-medium underline underline-offset-2">Remove</button>}
                </div>
                {fileNote && <p className="mt-2 text-[12.5px] text-[#11120f]/55">{fileNote}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">AI name<input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} className={field} /></label>
                <label className="block text-sm font-semibold">Greeting<input value={greeting} maxLength={60} onChange={(e) => setGreeting(e.target.value)} className={field} /></label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div><p className="text-sm font-semibold">Accent colour</p><div className="mt-2 flex flex-wrap gap-2.5">{ACCENTS.map((c) => <button key={c} type="button" aria-label={`Accent ${c}`} aria-pressed={accent === c} onClick={() => setAccent(c)} className="size-9 rounded-full border-2 border-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: c, boxShadow: accent === c ? `0 0 0 3px #fff, 0 0 0 5px ${INK}` : "none" }} />)}</div></div>
                <div><p className="text-sm font-semibold">Theme</p><div className="mt-2 flex w-fit rounded-full border-2 border-[#11120f] bg-[#fff8ec] p-1">{[[false, "Light"], [true, "Dark"]].map(([v, l]) => <button key={String(v)} type="button" aria-pressed={dark === v} onClick={() => setDark(v as boolean)} className="rounded-full px-4 py-1.5 text-[14px] font-semibold" style={dark === v ? { backgroundColor: INK, color: "#fff" } : undefined}>{l as string}</button>)}</div></div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-semibold"><Languages size={15} />Customer writes in</p>
                <div className="mt-2 flex flex-wrap gap-2">{LANGS.map((l) => <button key={l.k} type="button" aria-pressed={asks === l.k} onClick={() => setAsks(l.k)} className="rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-semibold" style={chip(asks === l.k)}>{l.label}</button>)}</div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold"><Bot size={15} />{name || "The AI"} replies in</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={reply === "auto"} onClick={() => setReply("auto")} className="rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-semibold" style={chip(reply === "auto")}>Auto: match the customer</button>
                  {LANGS.map((l) => <button key={l.k} type="button" aria-pressed={reply === l.k} onClick={() => setReply(l.k)} className="rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-semibold" style={chip(reply === l.k)}>{l.label}</button>)}
                </div>
              </div>

              <button type="button" role="switch" aria-checked={url} onClick={() => setUrl(!url)} className="flex w-full items-center justify-between rounded-xl border-2 border-[#11120f] px-4 py-3 text-left"><span className="flex items-center gap-2 text-[15px] font-semibold"><Eye size={16} />AI can see the page URL</span><span className="relative h-7 w-12 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: url ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: url ? "calc(100% - 22px)" : "2px" }} /></span></button>
            </div>
          </Rv>
        </div>

        <Rv variant="deal" delay={100} className="lg:sticky lg:top-24">
          <div className={`${card} mx-auto w-full max-w-[400px] overflow-hidden`} style={{ backgroundColor: bg, color: fg }}>
            <div className="flex items-center gap-3 border-b-2 border-[#11120f] px-4 py-3.5 text-white transition-colors duration-500" style={{ backgroundColor: accent }}>
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-white">{avatar}</span>
              <div className="min-w-0"><p className="truncate font-semibold leading-tight">{name || "Support"}</p><p className="text-[12px] opacity-90">We reply in seconds</p></div>
            </div>
            <div className="min-h-[360px] space-y-3 p-4 text-[14px]">
              <div className="flex items-end gap-2">
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-white">{avatar}</span>
                <div className="max-w-[84%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] px-3.5 py-2.5" style={{ backgroundColor: bub }}>{greeting || "Hi there 👋"}</div>
              </div>
              {url && <div className={`${mono} mx-auto w-fit rounded-full border-2 border-dashed px-2.5 py-1 text-[9px] opacity-60`} style={{ borderColor: fg }}>Visitor is on /pricing</div>}
              <div key={asks} className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm border-2 border-[#11120f] px-3.5 py-2.5 text-white transition-colors duration-500" style={{ backgroundColor: accent, animation: "elpino-rv-pop .3s both" }}>{customer.q}</div>
              <div key={`${asks}-${reply}-${url}`} className="flex items-end gap-2" style={{ animation: "elpino-rv-pop .35s .15s both" }}>
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-white">{avatar}</span>
                <div className="max-w-[84%] rounded-2xl rounded-bl-sm border-2 border-[#11120f] px-3.5 py-2.5 leading-6" style={{ backgroundColor: bub }}>{url ? replyLang.a1 : replyLang.a0}</div>
              </div>
              <p className={`${mono} pt-1 text-center text-[9px] opacity-50`}>Replying in {replyLang.label}{reply === "auto" ? " (matched)" : ""}</p>
            </div>
            <div className="flex items-center gap-2 border-t-2 border-[#11120f] px-4 py-3 text-[13px] opacity-70" style={{ backgroundColor: bub }}>Write a message…</div>
          </div>
          <p className="mx-auto mt-3 max-w-[400px] text-center text-xs text-[#11120f]/50">Preview with sample text. Your real widget uses your own logo, colours and greeting.</p>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- product tour

const TOUR = [
  { href: "/product/ai-agent", c: PURPLE, icon: Bot, tag: "AI agent", t: "An agent that knows who it's talking to", d: "Remembers customers, verifies identity, checks payments and calls your tools." },
  { href: "/product/inbox", c: GREEN, icon: Inbox, tag: "Shared inbox", t: "One inbox for your team and the AI", d: "Clear ownership, Join alerts and the full context on every thread." },
  { href: "/product/knowledge-hub", c: YELLOW, icon: BookOpen, tag: "Knowledge Hub", t: "Teach it from anything you have", d: "Crawl your site, upload files, write pages. Public and private switches." },
  { href: "/product/tickets", c: ORANGE, icon: Ticket, tag: "Tickets", t: "Nothing gets dropped", d: "If nobody's free, a ticket is filed and the customer is told." },
];

function TourVisual({ k }: { k: string }) {
  const chip = "rounded-lg border-2 border-[#11120f] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold";
  if (k === "ai") return <div className="space-y-2">{["search_knowledge()", "send_email_code()", "get_receipt()"].map((x, i) => <div key={x} className={chip} style={{ animation: `elpino-nudge ${3 + i * 0.4}s ease-in-out infinite` }}>{x} <span style={{ color: GREEN }}>✓</span></div>)}</div>;
  if (k === "inbox") return <div className="space-y-2">{[["Aisha", "AI", PURPLE], ["Tom", "Priya", GREEN], ["Meera", "Resolved", PINK]].map(([n, b, c]) => <div key={n} className={`${chip} flex items-center justify-between`}><span>{n}</span><span className="rounded-full px-2 py-0.5 text-[9px] text-white" style={{ backgroundColor: c }}>{b}</span></div>)}</div>;
  if (k === "kb") return <div className="flex flex-wrap gap-2">{["site crawl", "policy.pdf", "faq.docx", "notes.md"].map((x, i) => <span key={x} className={chip} style={{ animation: `elpino-float ${4 + i * 0.5}s ease-in-out ${-i}s infinite` }}>{x}</span>)}</div>;
  return <div className="rounded-xl border-2 border-dashed border-[#11120f] bg-white p-3"><p className="font-mono text-[10px] text-[#11120f]/50">REF</p><p className="font-mono text-lg font-bold">7F3A9C21</p><div aria-hidden="true" className="elpino-barcode mt-2 h-7 w-full" /></div>;
}

function Tour() {
  const keys = ["ai", "inbox", "kb", "tickets"];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="The product" color={ORANGE} title={<>Everything a support desk needs, <span className="hl">in one place.</span></>} />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {TOUR.map((t, i) => (
            <Rv key={t.href} variant="deal" delay={(i % 2) * 100}>
              <Link href={t.href} className={`${card} group relative flex h-full flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-2 hover:rotate-[-0.6deg] sm:p-7`} style={{ backgroundColor: t.c, color: onDark(t.c) }}>
                <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className={`${mono} inline-flex items-center gap-1.5 opacity-80`}><t.icon size={13} />{t.tag}</span>
                    <h3 className="mt-3 max-w-[18ch] text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{t.t}</h3>
                    <p className="mt-2 max-w-[38ch] text-[15.5px] leading-7 opacity-90">{t.d}</p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#11120f] bg-white transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={18} color={INK} /></span>
                </div>
                <div className="relative mt-6 rounded-2xl border-2 border-[#11120f] bg-[#fffdf5] p-4 text-[#11120f]"><TourVisual k={keys[i]} /></div>
              </Link>
            </Rv>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- who

const WHO = [
  { href: "/solutions/founders", c: BLUE, icon: Rocket, t: "Founders", d: "Ship product, not support replies. Elpino only taps you when it truly needs a founder.", pts: ["Free plan, 100 AI messages a month", "Alerts you only when a person is needed", "Set up in an afternoon"], vis: "founder" },
  { href: "/solutions/busy-operators", c: GREEN, icon: Users, t: "Busy teams", d: "Rush hour handled: the AI takes repeats, everyone gets the same Join alert, nobody double-replies.", pts: ["One Join alert reaches the whole team", "Ownership badges on every thread", "A ticket when nobody's free"], vis: "team" },
  { href: "/solutions/developers", c: PURPLE, icon: Code2, t: "Developers", d: "One tag, a signed identity token and MCP servers. You choose what the AI can touch.", pts: ["One script tag for the widget", "Signed, short-lived identity tokens", "MCP servers, approved tool by tool"], vis: "dev" },
] as const;

function WhoVisual({ k }: { k: string }) {
  if (k === "founder")
    return (
      <div className="space-y-2">
        {[["How do I export data?", true], ["Why did my card fail?", true], ["Custom contract?", false]].map(([q, ok]) => (
          <div key={q as string} className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#11120f] bg-white px-3 py-2 text-[12.5px] font-semibold"><span className="truncate">{q as string}</span><span className={`${mono} shrink-0 rounded-full px-2 py-0.5 text-[8.5px] ${ok ? "text-white" : ""}`} style={{ backgroundColor: ok ? GREEN : YELLOW }}>{ok ? "Handled" : "Needs you"}</span></div>
        ))}
      </div>
    );
  if (k === "team")
    return (
      <div className="flex items-center gap-2">
        {[["P", GREEN, true], ["S", BLUE, false], ["D", ORANGE, false], ["L", PINK, false]].map(([n, c, on]) => (
          <span key={n as string} className="grid size-11 place-items-center rounded-full border-2 border-[#11120f] text-sm font-bold text-white" style={{ backgroundColor: c as string, opacity: on ? 1 : 0.55, animation: on ? "elpino-ring 1.6s ease-out infinite" : undefined }}>{n as string}</span>
        ))}
        <span className={`${mono} ml-1 rounded-full border-2 border-[#11120f] bg-white px-2.5 py-1 text-[9px]`}>Priya joined</span>
      </div>
    );
  return <div className="rounded-xl border-2 border-[#11120f] bg-[#11120f] p-3 font-mono text-[11px] leading-5 text-[#c9f5e2]">{'$elpino.push(["identify", {'}<br />{"  token: elpinoToken"}<br />{"}]);"}</div>;
}

function Who() {
  const [a, setA] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Who it's for" color={GREEN} title={<>Built for the people <span className="hl">doing the support.</span></>} />

        {/* wide: expanding panels */}
        <div className="mt-14 hidden h-[430px] gap-3 lg:flex">
          {WHO.map((w, i) => {
            const on = i === a;
            return (
              <Link key={w.href} href={w.href} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} className={`${card} relative flex min-w-0 flex-col overflow-hidden p-6 text-white transition-[flex-grow] duration-500 ease-out`} style={{ backgroundColor: w.c, flexGrow: on ? 3.4 : 1, flexBasis: 0 }}>
                <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />
                <div className="relative flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-[#11120f] bg-white"><w.icon size={22} color={INK} /></span><span className={`${mono} text-white/75`}>0{i + 1}</span></div>
                {!on && <p className="relative mt-auto text-2xl font-semibold tracking-[-0.03em] [writing-mode:vertical-rl] rotate-180">{w.t}</p>}
                {on && (
                  <div className="relative mt-5 flex min-h-0 flex-1 flex-col" style={{ animation: "elpino-rv-up .5s both" }}>
                    <h3 className="text-4xl font-semibold tracking-[-0.04em]">{w.t}</h3>
                    <p className="mt-2 max-w-[40ch] text-[16px] leading-7 text-white/90">{w.d}</p>
                    <ul className="mt-4 space-y-1.5">{w.pts.map((p) => <li key={p} className="flex items-center gap-2 text-[14.5px]"><Check size={15} strokeWidth={3} className="shrink-0" />{p}</li>)}</ul>
                    <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                      <div className="w-[230px] rounded-2xl border-2 border-[#11120f] bg-[#fffdf5] p-3 text-[#11120f]"><WhoVisual k={w.vis} /></div>
                      <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#11120f] bg-white"><ArrowUpRight size={20} color={INK} /></span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* narrow: stacked cards */}
        <div className="mt-14 space-y-4 lg:hidden">
          {WHO.map((w) => (
            <Link key={w.href} href={w.href} className={`${card} relative block overflow-hidden p-6 text-white`} style={{ backgroundColor: w.c }}>
              <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />
              <div className="relative flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl border-2 border-[#11120f] bg-white"><w.icon size={22} color={INK} /></span><h3 className="text-3xl font-semibold tracking-[-0.03em]">{w.t}</h3></div>
              <p className="relative mt-3 text-[16px] leading-7 text-white/90">{w.d}</p>
              <ul className="relative mt-3 space-y-1.5">{w.pts.map((p) => <li key={p} className="flex items-center gap-2 text-[14.5px]"><Check size={15} strokeWidth={3} className="shrink-0" />{p}</li>)}</ul>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- statement

const STATEMENT = "Elpino answers what it knows, does what you allow, and asks a person for the rest.";

function Statement() {
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
  const words = STATEMENT.split(" ");
  return (
    <section ref={ref} className="border-y-2 border-[#11120f] bg-[#ffd84d] px-5 py-32 sm:px-8 sm:py-44">
      <p className="mx-auto max-w-5xl text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
        {words.map((w, i) => { const t = Math.min(1, Math.max(0, p * (words.length + 3) - i)); return <span key={i} style={{ color: `rgba(17,18,15,${0.2 + t * 0.8})`, transition: "color .2s" }}>{w} </span>; })}
      </p>
    </section>
  );
}

// -------------------------------------------------------------- integrations

type Node = { id: string; name: string; c: string; logo?: string; icon?: ReactNode };
const INNER: Node[] = [
  { id: "stripe", name: "Stripe", c: "#635bff", logo: "stripe" },
  { id: "razorpay", name: "Razorpay", c: "#2465dc", logo: "razorpay" },
  { id: "cashfree", name: "Cashfree", c: "#0a8f5a", logo: "cashfree" },
  { id: "paystack", name: "Paystack", c: "#0ba4db", logo: "paystack" },
];
const OUTER: Node[] = [
  { id: "trello", name: "Trello", c: "#0c66e4", logo: "trello" },
  { id: "asana", name: "Asana", c: "#f06a6a", logo: "asana" },
  { id: "mcp", name: "MCP", c: ORANGE, icon: <Plug size={22} color={ORANGE} /> },
];

function OrbitNode({ n, i, total, ring }: { n: Node; i: number; total: number; ring: "in" | "out" }) {
  const a = (i / total) * 360;
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateX(var(--r-${ring})) rotate(${-a}deg)` }}>
      <div className="group/n relative" style={{ animation: `elp-orb ${ring === "in" ? 46 : 62}s linear infinite ${ring === "in" ? "reverse" : "normal"}` }}>
        <div className="grid size-[58px] place-items-center rounded-full border-2 border-[#11120f] bg-white p-2.5 transition duration-300 group-hover/n:scale-125" style={{ boxShadow: `0 0 0 4px ${n.c}33` }}>
          {n.logo ? <ConnectorLogo provider={n.logo} alt={n.name} className="size-full object-contain" fallback={<span className="text-sm font-black" style={{ color: n.c }}>{n.name[0]}</span>} /> : n.icon}
        </div>
        <span className={`${mono} pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-2 py-0.5 text-[9px] opacity-0 transition group-hover/n:opacity-100`}>{n.name}</span>
      </div>
    </div>
  );
}

function Integrations() {
  return (
    <section className="overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Rv variant="drop"><Stamp color={PINK}><Plug size={13} />Integrations</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Plugs into what <span className="hl">you already use.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[46ch] text-lg leading-8 text-[#11120f]/65">Payments for lookups and links, project tools for tickets, and MCP for your own systems. Elpino sits in the middle, and everything you connect works with it.</p></Rv>
          <Rv delay={220}>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[["Payments", BLUE], ["Tickets", GREEN], ["Your systems", ORANGE]].map(([l, c]) => <span key={l} className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#fffdf5] px-4 py-2 text-[14.5px] font-semibold"><span className="size-3 rounded-full border-2 border-[#11120f]" style={{ backgroundColor: c }} />{l}</span>)}
            </div>
            <Link href="/integrations" className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-6 py-3 font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>See all integrations <ArrowRight size={16} /></Link>
          </Rv>
        </div>

        <Rv variant="pop" delay={100}>
          <div className="relative mx-auto size-[340px] [--r-in:78px] [--r-out:140px] sm:size-[470px] sm:[--r-in:108px] sm:[--r-out:196px]">
            <div aria-hidden="true" className="absolute inset-0 rounded-full opacity-[0.08]" style={{ ...dots, maskImage: "radial-gradient(circle, #000 55%, transparent 72%)", WebkitMaskImage: "radial-gradient(circle, #000 55%, transparent 72%)" }} />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#11120f]/40" style={{ width: "calc(var(--r-in) * 2)", height: "calc(var(--r-in) * 2)" }} />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#11120f]/40" style={{ width: "calc(var(--r-out) * 2)", height: "calc(var(--r-out) * 2)" }} />
            <div className="absolute inset-0" style={{ animation: "elp-orb 46s linear infinite" }}>{INNER.map((n, i) => <OrbitNode key={n.id} n={n} i={i} total={INNER.length} ring="in" />)}</div>
            <div className="absolute inset-0" style={{ animation: "elp-orb 62s linear infinite reverse" }}>{OUTER.map((n, i) => <OrbitNode key={n.id} n={n} i={i} total={OUTER.length} ring="out" />)}</div>
            <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-2 border-[#11120f] bg-[#ffd84d] sm:size-28" style={{ boxShadow: `0 0 0 10px ${YELLOW}88` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/elpino-mascot-2.png" alt="A cartoon Elpino sloth connecting the tools" className="size-full scale-125 object-cover object-top" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
            </div>
          </div>
        </Rv>
      </div>
      <style>{`@keyframes elp-orb { to { transform: rotate(360deg); } } @media (prefers-reduced-motion: reduce) { [style*="elp-orb"] { animation: none !important; } }`}</style>
    </section>
  );
}

// -------------------------------------------------------------- trust

function Trust() {
  const [refunds, setRefunds] = useState(false);
  const rules = [
    { icon: BookOpen, c: BLUE, t: "Answer only from approved knowledge", d: "If it isn't in your knowledge, it says so and offers a person.", lock: true },
    { icon: Lock, c: PURPLE, t: "Hide names and emails from the AI", d: "The model sees reference codes, not your customers' identities.", lock: true },
    { icon: KeyRound, c: GREEN, t: "Verify before anything personal", d: "An email code or a signed token comes first.", lock: true },
    { icon: Plug, c: PINK, t: "Only tools you switched on", d: "Every MCP tool is approved by you, one at a time.", lock: true },
  ];
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <Rv variant="drop"><Stamp color={GREEN}><ShieldCheck size={13} />Trust</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em]">Powerful, with <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>the brakes on.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 max-w-[44ch] text-lg leading-8 text-white/65">This is the rulebook Elpino works under. Most of it is always on. The parts that move money are yours to switch on.</p></Rv>
          <Rv delay={220}><Link href="/security-guide" className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 font-semibold transition hover:bg-white hover:text-[#11120f]">Read the security guide <ArrowRight size={16} /></Link></Rv>
        </div>

        <Rv variant="deal" delay={100}>
          <div className={`${card} overflow-hidden bg-[#fffdf5] text-[#11120f]`}>
            <div className="flex items-center gap-3 border-b-2 border-[#11120f] bg-white px-5 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/elpino-mascot-3.png" alt="" className="size-9 rounded-full border-2 border-[#11120f] bg-[#ffd84d] object-cover object-top" />
              <div><p className="font-semibold leading-tight">Elpino&apos;s rulebook</p><p className={`${mono} text-[#11120f]/50`}>Set by you</p></div>
              <span className={`${mono} ml-auto inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-2.5 py-1 text-[9px] text-white`} style={{ backgroundColor: GREEN }}><ShieldCheck size={11} />Guardrails on</span>
            </div>
            <div className="divide-y-2 divide-[#11120f]/10">
              {rules.map((r, i) => (
                <div key={r.t} className="flex items-center gap-4 px-5 py-4" style={{ animation: `elpino-rv-up .5s ${i * 0.08}s both` }}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-[#11120f]" style={{ backgroundColor: r.c }}><r.icon size={20} color="#fff" /></span>
                  <div className="min-w-0 flex-1"><p className="text-[16px] font-semibold leading-snug">{r.t}</p><p className="text-[13.5px] leading-5 text-[#11120f]/60">{r.d}</p></div>
                  <span className={`${mono} inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-[#11120f] bg-[#eafaf3] px-2.5 py-1 text-[9px]`}><Lock size={10} />Always on</span>
                </div>
              ))}
              <div className="flex items-center gap-4 bg-[#fff6cf] px-5 py-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-[#11120f]" style={{ backgroundColor: ORANGE }}><Wallet size={20} color="#fff" /></span>
                <div className="min-w-0 flex-1"><p className="text-[16px] font-semibold leading-snug">Let the AI issue refunds</p><p className="text-[13.5px] leading-5 text-[#11120f]/60">{refunds ? "On. The AI may refund, using the workspace owner's setting." : "Off by default. Only the workspace owner can turn it on."}</p></div>
                <button type="button" role="switch" aria-checked={refunds} aria-label="Let the AI issue refunds" onClick={() => setRefunds(!refunds)} className="relative h-7 w-12 shrink-0 rounded-full border-2 border-[#11120f] transition-colors" style={{ backgroundColor: refunds ? GREEN : "#e7e2d6" }}><span className="absolute top-0.5 size-5 rounded-full border-2 border-[#11120f] bg-white transition-all" style={{ left: refunds ? "calc(100% - 22px)" : "2px" }} /></button>
              </div>
            </div>
          </div>
        </Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- pricing

function Pricing() {
  const plans = [
    { name: "Free", big: "$0", note: "100 AI messages a month", pts: ["No card required", "Widget, knowledge and inbox", "Handoffs never cost extra"], c: "#fff" },
    { name: "Paid plans", big: "Credit-based", note: "A monthly AI credit that fits your volume", pts: ["Payment and account tools", "Room for a bigger team", "Top up any time"], c: YELLOW },
    { name: "Extra teammates", big: "Seat packs", note: "Add seats that renew with your plan", pts: ["Only when you grow", "Same inbox, more hands", "Cancel any time"], c: "#c9d9ff" },
  ];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="Pricing" color={YELLOW} title={<>Pay for the help, <span className="hl">not the headcount.</span></>} sub="Start free. Paid plans are metered by the work the AI does." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <Rv key={p.name} variant="deal" delay={i * 100}>
              <div className={`${card} h-full p-7`} style={{ backgroundColor: p.c }}>
                <p className={`${mono} text-[#11120f]/60`}>{p.name}</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{p.big}</p>
                <p className="mt-2 text-[15px] text-[#11120f]/70">{p.note}</p>
                <ul className="mt-6 space-y-2.5">{p.pts.map((x) => <li key={x} className="flex items-center gap-2.5 text-[15.5px]"><Check size={16} color={GREEN} strokeWidth={3} />{x}</li>)}</ul>
              </div>
            </Rv>
          ))}
        </div>
        <Rv delay={150}><div className="mt-10 text-center"><Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#11120f] px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5">See full pricing <ArrowRight size={16} /></Link></div></Rv>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- faq + cta

const FAQS: [string, string][] = [
  ["What is Elpino?", "An AI customer support platform: a website chat widget, an AI agent that answers from your knowledge and checks real payments, a shared team inbox, and tickets when nobody's free."],
  ["Will the AI make things up?", "It answers from the knowledge you've approved, and a review pass checks drafts against tool results. When it doesn't know, it says so and offers a person."],
  ["What happens when it can't help?", "It asks the customer first. On a yes, every teammate gets a Join alert and has 90 seconds to jump in. If nobody does, a ticket is filed and the customer is emailed."],
  ["How long does setup take?", "Most teams are live the same day: add your knowledge, paste the widget snippet and invite your team."],
  ["Is there a free plan?", "Yes: 100 AI messages a month, no card required."],
  ["Does it work on other channels?", "Website chat is live today. Omnichannel is coming in November."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <Heading eyebrow="Questions" color={PURPLE} title={<>Things people <span className="hl">ask first.</span></>} />
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
    <section className="bg-white px-5 pb-24 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <Image src="/images/elpino-mascot-4.png" alt="A friendly cartoon Elpino sloth ready to support customers" width={434} height={724} className="relative mx-auto size-24 rounded-full border-2 border-[#11120f] bg-[#ffd84d] object-cover object-top" style={{ animation: "elpino-float 4.5s ease-in-out infinite" }} />
          <h2 className="relative mx-auto mt-6 max-w-3xl text-[clamp(2.3rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.05em]">Give your customers the answer before they finish typing.</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg leading-8 text-white/85">Start free, teach it your business, and let it take the repeat questions.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/contact" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">Talk to us</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function HomeView() {
  return (
    <>
      <Hero />
      <Marquee />
      <TryIt />
      <Customizer />
      <Tour />
      <Who />
      <Statement />
      <Integrations />
      <Trust />
      <Pricing />
      <Faq />
      <Closing />
    </>
  );
}
