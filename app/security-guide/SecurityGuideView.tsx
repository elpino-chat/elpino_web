"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { CHAPTERS, LINKS, NODES, SPECS, type Chapter, type Node } from "./content";

// The security guide as a blueprint of the real system. Top: the architecture,
// each part clickable. Then twelve chapters, every control tagged with the
// component it lives in. It claims only what the codebase does today.

const INK = "#11120f";
const NAVY = "#0f1c44";
const SECURITY_EMAIL = "security@elpino.chat";

const gridBg = {
  backgroundImage: "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
} as const;

// ------------------------------------------------------------ blueprint

const byId = Object.fromEntries(NODES.map((node) => [node.id, node])) as Record<string, Node>;

// Where each connector leaves and arrives, on a 1110 x 520 canvas.
function path(from: string, to: string): string {
  const a = byId[from];
  const b = byId[to];
  if (from === "widget" || from === "team") {
    const y1 = a.y + a.h / 2;
    const y2 = b.y + b.h / 2 + (from === "widget" ? -18 : 18);
    return `M${a.x + a.w},${y1} C${a.x + a.w + 40},${y1} ${b.x - 40},${y2} ${b.x},${y2}`;
  }
  if (from === "gateway" && to === "workspace") {
    const x1 = a.x + a.w / 2;
    const x2 = b.x + b.w / 2;
    return `M${x1},${a.y} C${x1},${a.y - 70} ${x2},${b.y - 70} ${x2},${b.y}`;
  }
  if (["auth", "workspace", "ai"].includes(from) && ["google", "pay", "models"].includes(to)) {
    const x = a.x + a.w / 2;
    return `M${x},${a.y + a.h} L${x},${b.y}`;
  }
  const y = a.y + a.h / 2;
  return `M${a.x + a.w},${y} L${b.x},${b.y + b.h / 2}`;
}

function midpoint(from: string, to: string): [number, number] {
  const a = byId[from];
  const b = byId[to];
  if (from === "gateway" && to === "workspace") return [(a.x + a.w / 2 + b.x + b.w / 2) / 2, a.y - 53];
  if (["auth", "workspace", "ai"].includes(from) && ["google", "pay", "models"].includes(to)) return [a.x + a.w / 2, (a.y + a.h + b.y) / 2];
  if (from === "widget" || from === "team") return [(a.x + a.w + b.x) / 2, (a.y + a.h / 2 + b.y + b.h / 2) / 2 + (from === "widget" ? -9 : 9)];
  return [(a.x + a.w + b.x) / 2, (a.y + a.h / 2 + b.y + b.h / 2) / 2];
}

function Blueprint({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const chapterNumber = (id: string) => CHAPTERS.find((chapter) => chapter.id === id)?.n ?? "";
  return (
    <svg viewBox="0 0 1110 520" className="h-auto w-full" role="group" aria-label="Elpino's architecture: click a part to see how it is protected">
      {/* connectors, with data flowing along them */}
      {LINKS.map(([from, to]) => (
        <g key={`${from}-${to}`} aria-hidden="true">
          <path d={path(from, to)} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" />
          <path d={path(from, to)} fill="none" stroke="#ffd84d" strokeWidth="2.5" strokeDasharray="4 12" strokeLinecap="round" className="[animation:elpino-dashflow_1.1s_linear_infinite]" />
          <circle cx={midpoint(from, to)[0]} cy={midpoint(from, to)[1]} r="11" fill="#fff8ec" stroke={INK} strokeWidth="2.5" />
          <text x={midpoint(from, to)[0]} y={midpoint(from, to)[1] + 4} textAnchor="middle" fontSize="11">🔒</text>
        </g>
      ))}

      {/* the data plate under the services */}
      <g aria-hidden="true">
        <rect x="390" y="410" width="710" height="70" rx="14" fill="#fff8ec" stroke={INK} strokeWidth="3" strokeDasharray="0" />
        <text x="415" y="440" fontSize="17" fontWeight="700" fill={INK}>Postgres · your data</text>
        <text x="415" y="464" fontSize="12.5" fill="rgba(17,18,15,0.65)">Credentials AES-256-GCM · secure-link secrets under a separate key · loopback only</text>
        {[660, 840, 1025].map((x) => (
          <g key={x}><line x1={x} y1="392" x2={x} y2="410" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeDasharray="3 5" /><path d={`M${x - 6},404 L${x},412 L${x + 6},404`} fill="rgba(255,255,255,0.5)" /></g>
        ))}
      </g>

      {NODES.map((node) => {
        const on = node.id === selected;
        const external = node.color === "#ffffff";
        return (
          <g
            key={node.id}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${node.label}: ${node.sub}`}
            onClick={() => onSelect(node.id)}
            onMouseEnter={() => onSelect(node.id)}
            onFocus={() => onSelect(node.id)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(node.id); } }}
            className="cursor-pointer outline-none"
          >
            {on && <rect x={node.x - 7} y={node.y - 7} width={node.w + 14} height={node.h + 14} rx="18" fill="none" stroke="#ffd84d" strokeWidth="3" strokeDasharray="6 6" className="[animation:elpino-dashflow_2s_linear_infinite]" />}
            <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="14" fill={node.color} stroke={INK} strokeWidth="3" style={{ transition: "transform 0.25s", transformBox: "fill-box", transformOrigin: "center", transform: on ? "scale(1.04)" : "scale(1)" }} />
            <text x={node.x + node.w / 2} y={node.y + node.h / 2 - (external ? 2 : 4)} textAnchor="middle" fontSize={external ? 13 : 17} fontWeight="700" fill={node.ink || external ? INK : "#fff"}>{node.label}</text>
            <text x={node.x + node.w / 2} y={node.y + node.h / 2 + (external ? 14 : 16)} textAnchor="middle" fontSize={external ? 10.5 : 12} fill={node.ink || external ? "rgba(17,18,15,0.65)" : "rgba(255,255,255,0.8)"}>{node.sub}</text>
            {/* chapter callout */}
            <circle cx={node.x + 6} cy={node.y + 6} r="12" fill="#ffd84d" stroke={INK} strokeWidth="2.5" />
            <text x={node.x + 6} y={node.y + 10} textAnchor="middle" fontSize="11" fontWeight="800" fill={INK} style={{ fontFamily: "ui-monospace, monospace" }}>{chapterNumber(node.chapter)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ------------------------------------------------------------ redaction demo

const SAMPLE = "Hi, my name is Sam Lee. My email is sam.lee@example.com and my card 4242 4242 4242 4242 was declined for order ord_88231. My API key is sk_live_abc123def456ghi789 if that helps.";

// An illustration of the filter that runs on the server before any model
// request. The real one uses 128-bit random references and more patterns.
function illustrate(input: string): string {
  const seen = new Map<string, string>();
  let count = 0;
  const alias = (kind: string, value: string) => {
    const key = `${kind}:${value.toLowerCase()}`;
    if (!seen.has(key)) seen.set(key, `ref_${kind}_${(0x9f3a21 + count++ * 0x1b7d3).toString(16).slice(0, 6)}…`);
    return seen.get(key)!;
  };
  return input
    .replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9+/_.=:-]{20,}/gi, "[credential removed]")
    .replace(/\b(?:sk[-_](?:live[-_]|test[-_])?|ghp_|github_pat_|xai-|ya29\.)[A-Za-z0-9_./-]{8,}/g, "[credential removed]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[credential removed]")
    .replace(/((?:password|api[_ -]?key|otp|cvv|pin)\s*["']?\s*(?:[:=]|\bis\b)\s*["']?)\S+/gi, "$1[credential removed]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (v) => alias("email", v))
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[sensitive detail removed]")
    .replace(/(?<!\w)(?:\+\d[\d ().-]{7,}\d|(?:\d{4}[ -]){3}\d{4}|\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}|\d{9,})(?!\w)/g, (v) => alias("number", v))
    .replace(/\b(?:pay|pi|ch|order|ord|txn|cus|sess|session|user|acct|sub)_[A-Za-z0-9_-]+\b/g, (v) => alias(/^(pay|pi|ch)_/.test(v) ? "payment" : "record", v))
    .replace(/\b([Mm]y name is|[Nn]ame\s*[:=])\s*([A-Z][a-z'-]*(?:\s+[A-Z][a-z'-]*){0,3})/g, (_m, label, name) => `${label} ${alias("name", name)}`);
}

function RedactionDemo({ accent }: { accent: string }) {
  const [text, setText] = useState(SAMPLE);
  const output = useMemo(() => illustrate(text), [text]);
  const parts = output.split(/(ref_[a-z]+_[0-9a-f]{6}…|\[credential removed\]|\[sensitive detail removed\])/g);
  return (
    <div className="grid gap-4 border-b-2 border-[#11120f] bg-[#fff8ec] p-5 sm:p-7 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/50">What the customer types</p>
          <button type="button" onClick={() => setText(SAMPLE)} className="rounded-full border-2 border-[#11120f] bg-white px-3 py-0.5 text-[12px] font-semibold transition hover:-translate-y-0.5">Reset sample</button>
        </div>
        <label className="sr-only" htmlFor="redaction-input">Message to filter</label>
        <textarea id="redaction-input" value={text} onChange={(event) => setText(event.target.value)} rows={7} className="mt-2 block w-full resize-none rounded-2xl border-2 border-[#11120f] bg-white p-4 text-[15px] leading-7 outline-none focus:border-[#3784ff]" />
      </div>
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/50">What the model reads</p>
        <div aria-live="polite" className="mt-2 min-h-[178px] rounded-2xl border-2 border-[#11120f] bg-[#11120f] p-4 text-[15px] leading-7 text-[#fff8ec]">
          {parts.map((part, index) =>
            index % 2 ? (
              <span key={index} className="mx-0.5 rounded-md border-2 border-[#11120f] px-1.5 py-0.5 font-mono text-[12.5px] font-bold" style={{ background: part.startsWith("[") ? "#ffd84d" : accent, color: part.startsWith("[") ? INK : "#fff" }}>{part}</span>
            ) : (
              <span key={index}>{part}</span>
            ),
          )}
        </div>
      </div>
      <p className="text-[13px] leading-6 text-black/55 lg:col-span-2">Illustration only, and it runs in your browser: nothing you type here is sent anywhere. The real filter runs on our servers with 128-bit random references and more patterns, and the reference-to-detail mapping never enters a prompt.</p>
    </div>
  );
}

// ------------------------------------------------------------ chapter

function ChapterCard({ chapter }: { chapter: Chapter }) {
  const dark = !chapter.ink;
  return (
    <article id={chapter.id} className="scroll-mt-24 overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-white">
      <header className="relative isolate border-b-2 border-[#11120f] p-6 text-white sm:p-9" style={{ background: NAVY }}>
        <div aria-hidden="true" className="absolute inset-0 -z-10" style={gridBg} />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#ffd84d]">Fig. {chapter.n}</p>
            <h3 className="mt-2 text-3xl font-normal leading-[1.05] tracking-[-0.035em] sm:text-5xl">{chapter.title}</h3>
            <p className="mt-3 max-w-xl text-[17px] leading-7 text-white/75">{chapter.kicker}</p>
          </div>
          <span className="flex h-16 w-16 shrink-0 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#11120f] font-mono text-2xl font-bold sm:h-20 sm:w-20 sm:text-3xl" style={{ background: chapter.color, color: dark ? "#fff" : INK }}>{chapter.n}</span>
        </div>
        <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/60">{chapter.intro}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chapter.stats.map((stat) => <span key={stat} className="rounded-full border-2 border-white/40 px-3 py-1 font-mono text-[11.5px] font-medium uppercase tracking-[0.06em]">{stat}</span>)}
        </div>
      </header>

      {chapter.demo === "redaction" && <RedactionDemo accent={chapter.color} />}

      <ul className="grid gap-px bg-[#11120f] md:grid-cols-2">
        {chapter.controls.map((control) => (
          <li key={control.id} className="group flex flex-col bg-white p-5 transition-colors hover:bg-[#fffdf5] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-md border-2 border-[#11120f] px-2 py-0.5 font-mono text-[12px] font-bold" style={{ background: chapter.color, color: dark ? "#fff" : INK }}>{control.id}</span>
              <span className="rounded-full border-2 border-[#11120f] bg-[#fff8ec] px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em]">{control.where}</span>
            </div>
            <h4 className="mt-4 text-[20px] font-medium leading-tight tracking-[-0.02em]">{control.title}</h4>
            <p className="mt-2 text-[15px] leading-7 text-black/65">{control.text}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

// ------------------------------------------------------------ page

export function SecurityGuideView() {
  const [selected, setSelected] = useState("gateway");
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const node = byId[selected];
  const nodeChapter = CHAPTERS.find((chapter) => chapter.id === node.chapter);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      setShowBar(window.scrollY > 560);
      let current = CHAPTERS[0].id;
      for (const chapter of CHAPTERS) {
        const el = document.getElementById(chapter.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = chapter.id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const activeChapter = CHAPTERS.find((chapter) => chapter.id === active) ?? CHAPTERS[0];
  const controlCount = CHAPTERS.reduce((total, chapter) => total + chapter.controls.length, 0);

  return (
    <main className="bg-white text-[#11120f]">
      {/* Sticky header */}
      <div className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] ${showBar ? "translate-y-0" : "-translate-y-full"}`} aria-hidden={!showBar}>
        <div className="border-b-2 border-[#11120f] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1300px] items-center gap-4 px-5 sm:px-8">
            <Link href="/" aria-label="Elpino home" className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="h-8 w-8 rounded-full border-2 border-[#11120f] bg-white object-contain p-0.5" />
              <span className="hidden text-[15px] font-semibold sm:inline">Security</span>
            </Link>
            <span className="hidden h-5 w-px bg-black/15 sm:block" />
            <p className="min-w-0 flex-1 truncate font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/55">Fig. {activeChapter.n} · {activeChapter.title}</p>
            <a href={`mailto:${SECURITY_EMAIL}?subject=Security%20report`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5">
              <Mail size={14} /> <span className="hidden sm:inline">Report an issue</span>
            </a>
          </div>
          <div className="h-[3px] bg-black/10"><div className="h-full bg-[#3784ff]" style={{ width: `${progress * 100}%` }} /></div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-16 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="grid items-end gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <p className="w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Security guide</p>
              <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-7xl">
                Every lock, <span className="hl-load">in the open.</span>
              </h1>
              <p className="mt-6 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
                This guide lists every protection by where it lives in the code: the web app, the gateway, the auth, workspace and AI services. It describes what the platform does today, with no badges we can&apos;t back up.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#blueprint" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
                  See the blueprint <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
                </a>
                <a href="#chapters" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Read the chapters</a>
                <Link href="/trust" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Trust Center <ArrowRight size={16} /></Link>
              </div>
            </div>
            {/* the count, as a title block */}
            <div className="animate-[elpino-focus_0.9s_ease-out_0.3s_both] rounded-[22px] border-2 border-[#11120f] bg-white p-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-black/45">Drawing register</p>
              <dl className="mt-3 divide-y-2 divide-dashed divide-black/15 text-sm">
                {[
                  ["Chapters", String(CHAPTERS.length)],
                  ["Controls described", String(controlCount)],
                  ["Components covered", "6"],
                  ["Checked against", "the codebase"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 py-2"><dt className="text-black/55">{label}</dt><dd className="font-mono text-[15px] font-bold">{value}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* The blueprint */}
      <section id="blueprint" className="scroll-mt-16 px-5 pb-20 sm:px-8">
        <Rv variant="up" className="mx-auto max-w-[1200px]">
          <div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] p-4 text-white sm:p-8" style={{ background: NAVY }}>
            <div aria-hidden="true" className="absolute inset-0 -z-10" style={gridBg} />
            <div className="flex flex-wrap items-end justify-between gap-3 px-1">
              <div>
                <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#ffd84d]">Fig. 00 · System overview</p>
                <h2 className="mt-1 text-2xl font-normal tracking-[-0.03em] sm:text-4xl">How a request travels</h2>
              </div>
              <p className="max-w-sm text-[13.5px] leading-6 text-white/55">Every arrow is encrypted or authenticated. Point at any part to see what protects it. The yellow number is its chapter.</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[760px]"><Blueprint selected={selected} onSelect={setSelected} /></div>
            </div>

            <div key={selected} className="mt-4 grid animate-[elpino-focus_0.4s_ease-out_both] gap-4 rounded-2xl border-2 border-[#11120f] bg-[#fff8ec] p-5 text-[#11120f] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#11120f] font-mono text-lg font-bold" style={{ background: node.color, color: node.ink || node.color === "#ffffff" ? INK : "#fff" }}>{nodeChapter?.n}</span>
              <div>
                <p className="text-xl font-medium tracking-[-0.02em]">{node.label} <span className="text-black/45">· {node.sub}</span></p>
                <p className="mt-1 max-w-3xl text-[15px] leading-7 text-black/65">{node.guards}</p>
              </div>
              {nodeChapter && <a href={`#${nodeChapter.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 text-[14px] font-semibold transition hover:-translate-y-0.5">Read chapter {nodeChapter.n} →</a>}
            </div>
          </div>
        </Rv>
      </section>

      {/* Chapters */}
      <section id="chapters" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">The chapters</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Twelve chapters. <span className="hl">Nothing skipped.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">Each control names the part of the system it lives in. Where a number appears (10 minutes, 5 attempts, 30 seconds), it is the number in the code.</p>
          </Rv>

          <div className="mt-14 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
            <nav aria-label="Chapters" className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border-2 border-[#11120f] bg-white p-3">
                <p className="mb-2 px-2 pt-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-black/45">Contents</p>
                <ol className="space-y-0.5">
                  {CHAPTERS.map((chapter) => (
                    <li key={chapter.id}>
                      <a href={`#${chapter.id}`} className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] transition ${active === chapter.id ? "bg-[#ffd84d] font-semibold" : "text-black/65 hover:bg-[#fff8ec]"}`}>
                        <span className="w-5 font-mono text-[11px] text-black/45">{chapter.n}</span>{chapter.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="min-w-0 space-y-10">
              {CHAPTERS.map((chapter) => (
                <Rv key={chapter.id} variant="up"><ChapterCard chapter={chapter} /></Rv>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spec sheet, as a drawing title block */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1000px]">
          <Rv>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#3784ff]">The spec sheet</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">The numbers, <span className="hl">in one place.</span></h2>
          </Rv>
          <Rv variant="up" className="mt-12">
            <dl className="overflow-hidden rounded-[24px] border-2 border-[#11120f]">
              <div className="border-b-2 border-[#11120f] px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white sm:px-8" style={{ background: NAVY }}>Title block · Elpino platform · security parameters</div>
              {SPECS.map(([spec, standard], index) => (
                <div key={spec} className={`grid gap-1 px-6 py-4 transition-colors hover:bg-[#fff8ec] sm:grid-cols-[250px_1fr] sm:gap-6 sm:px-8 ${index ? "border-t-2 border-dashed border-black/15" : ""}`}>
                  <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/50">{spec}</dt>
                  <dd className="text-[15.5px] leading-7 text-black/80">{standard}</dd>
                </div>
              ))}
            </dl>
          </Rv>
        </div>
      </section>

      {/* Scope, and reporting */}
      <section className="bg-white px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <Rv className="rounded-[24px] border-2 border-dashed border-[#11120f] bg-[#fff8ec] p-6 sm:p-8">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-black/50">About this guide</p>
            <p className="mt-3 max-w-3xl text-[16px] leading-8 text-black/70">This is a description of how the platform is built, not a certification. It covers the controls that exist in the product today, and it will change as the product does. If you need a security questionnaire answered or a data processing agreement signed, email <a href={`mailto:${SECURITY_EMAIL}`} className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">{SECURITY_EMAIL}</a>.</p>
          </Rv>

          <Rv variant="pop">
            <div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#3784ff] px-7 py-14 text-white sm:px-14 sm:py-20">
              <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
              <span aria-hidden="true" className="elpino-stamp absolute right-6 top-6 hidden rotate-[-8deg] rounded-lg border-[3px] border-[#ffd84d] px-3 py-1 font-mono text-[14px] font-bold uppercase tracking-[0.16em] text-[#ffd84d] sm:block">Found something?</span>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-white/80">Report a vulnerability</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-6xl">Think you found a weak spot? We want to hear it first.</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">Email the details and how to reproduce it. A person on the team reads every report.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`mailto:${SECURITY_EMAIL}?subject=Security%20report`} className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">
                  <Mail size={16} /> {SECURITY_EMAIL} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </a>
                <Link href="/privacy" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Privacy policy</Link>
                <Link href="/terms" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Terms</Link>
                <Link href="/security-policy" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Security policy</Link>
              </div>
            </div>
          </Rv>
        </div>
      </section>
    </main>
  );
}
