"use client";

import { useEffect, useState } from "react";

const MESSAGE = "Do you have a student discount?";
const REPLY = "Yes — 20% off with a valid student email. I've sent the signup link to your inbox.";

type Phase = "listening" | "sent" | "building" | "live" | "pause";

// Generic, brand-neutral icons for the resolution pipeline below — unlike
// the old Stripe/Sheets marks, nothing here names a specific third-party
// integration, because the three steps (search, check, answer) are what
// every resolution actually does, not something tied to one connector.
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.5A7.96 7.96 0 0 1 4 12Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function KnowledgeMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#635BFF] text-[#11120f] shadow-[0_7px_18px_rgba(99,91,255,.28)]">
      <SearchIcon />
    </span>
  );
}

function AnswerMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#188038] text-white shadow-[0_7px_18px_rgba(24,128,56,.22)]">
      <ReplyIcon />
    </span>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Elpino is answering">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="build-dot h-1.5 w-1.5 rounded-full bg-black/25"
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  );
}

function ChatPanel({ phase }: { phase: Phase }) {
  const isListening = phase === "listening";
  const showRequest = !isListening;
  const showBuilding = phase === "building";
  const showReply = phase === "live" || phase === "pause";

  return (
    <div className="relative flex min-h-[310px] flex-col overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#F7F8FA] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#000000] bg-white text-[10px] font-black text-black">R</span>
          <span className="text-xs font-semibold tracking-[-0.01em] text-black/55">Live in your chat widget</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">
          <span className="h-1.5 w-1.5 rounded-full bg-[#74A879]" /> online
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2.5 py-5">
        {showRequest && (
          <div className="build-message ml-auto max-w-[90%] rounded-[1.15rem] rounded-br-[0.3rem] bg-[#171717] px-4 py-3 text-[15px] leading-6 text-white shadow-[0_10px_28px_rgba(0,0,0,.12)]">
            {MESSAGE}
          </div>
        )}
        {showBuilding && (
          <div className="build-message mr-auto flex items-center gap-2 rounded-[1.15rem] rounded-bl-[0.3rem] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(39,35,28,.06)]">
            <TypingDots />
            <span className="text-xs font-medium text-black/45">searching your knowledge base</span>
          </div>
        )}
        {showReply && (
          <div className="build-message mr-auto max-w-[92%] rounded-[1.15rem] rounded-bl-[0.3rem] bg-white px-4 py-3 text-[13px] leading-5 text-black/75 shadow-[0_8px_22px_rgba(39,35,28,.06)]">
            {REPLY}
          </div>
        )}
      </div>
    </div>
  );
}

const steps = [
  { eyebrow: "Customer asks", title: "Do you have a student discount?", detail: "chat widget · text", icon: <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#171717] text-[#7060BD]"><BoltIcon /></span> },
  { eyebrow: "Elpino", title: "Search the knowledge base", detail: "pricing · discounts", icon: <KnowledgeMark /> },
  { eyebrow: "Then", title: "Answer, logged for your team", detail: "resolution · audit trail", icon: <AnswerMark /> },
];

function WorkflowPanel({ phase }: { phase: Phase }) {
  const active = phase === "building" || phase === "live" || phase === "pause";
  const live = phase === "live" || phase === "pause";

  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#F7F8FA] p-5 text-[#11120f] sm:p-6">
      <div className="build-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">This resolution</p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.02em]">What Elpino actually did</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] transition-all duration-500 ${live ? "border-[#D9BEF4]/25 bg-[#D9BEF4] text-black" : "border-black/10 bg-black/5 text-black/45"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "build-live-dot bg-white" : "bg-black/25"}`} />
            {live ? "Resolved" : active ? "Working" : "Waiting"}
          </div>
        </div>

        <div className="relative my-auto grid gap-2 py-5">
          <div className={`absolute bottom-[17%] left-[1.05rem] top-[17%] w-px overflow-hidden bg-black/10 transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
            <span className="build-runner absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-[#D9BEF4] to-transparent" />
          </div>
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`build-step relative flex items-center gap-3.5 rounded-[1.1rem] border border-white/[0.07] bg-white/[0.055] p-3 backdrop-blur-sm transition-all duration-500 ${
                active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
              }`}
              style={{ transitionDelay: active ? `${index * 170}ms` : "0ms" }}
            >
              <div className="relative z-10 shrink-0">{step.icon}</div>
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-black/80">{step.eyebrow}</span>
                <span className="block truncate text-[13px] font-semibold tracking-[-0.01em] text-black/90">{step.title}</span>
              </div>
              <span className="hidden text-right font-mono text-[9px] text-black sm:block">{step.detail}</span>
              {active && <span className="build-check grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#D9BEF4] text-[11px] font-black text-black" style={{ animationDelay: `${750 + index * 300}ms` }}>✓</span>}
            </div>
          ))}
        </div>

        <div className={`flex items-center justify-between border-t border-black/10 pt-4 transition-all duration-500 ${live ? "opacity-100" : "opacity-35"}`}>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.07] text-[#7060BD]"><BoltIcon /></span>
            <div>
              <p className="text-[11px] font-semibold text-[#11120f]/70">Resolved in</p>
              <p className="font-mono text-[9px] text-black/40">4.2s · no human needed</p>
            </div>
          </div>
          <span className="font-mono text-[9px] text-black/40">LOGGED · AUDITABLE</span>
        </div>
      </div>
    </div>
  );
}

function AutomationDemo() {
  const [phase, setPhase] = useState<Phase>("listening");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setTyped(MESSAGE);
      setPhase("live");
      return;
    }

    if (phase === "listening") {
      if (typed.length < MESSAGE.length) {
        const timer = window.setTimeout(
          () => setTyped(MESSAGE.slice(0, typed.length + 1)),
          1000 / MESSAGE.length,
        );
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => setPhase("sent"), 80);
      return () => window.clearTimeout(timer);
    }

    const delays: Record<Exclude<Phase, "listening">, number> = { sent: 450, building: 2400, live: 3500, pause: 900 };
    const timer = window.setTimeout(() => {
      if (phase === "sent") setPhase("building");
      if (phase === "building") setPhase("live");
      if (phase === "live") setPhase("pause");
      if (phase === "pause") {
        setTyped("");
        setPhase("listening");
      }
    }, delays[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, typed]);

  return (
    <div className="mt-5 grid w-full gap-3 rounded-[2rem] bg-white p-3 shadow-[0_35px_100px_rgba(0,0,0,.4)] sm:grid-cols-2 sm:p-4">
      <ChatPanel phase={phase} />
      <WorkflowPanel phase={phase} />
    </div>
  );
}

export function BuildSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-14 md:px-10 md:py-20 lg:px-14">
      <style>{`
        @keyframes build-dot { 0%, 60%, 100% { transform: translateY(0); opacity: .35 } 30% { transform: translateY(-3px); opacity: 1 } }
        @keyframes build-runner { from { transform: translateY(-140%) } to { transform: translateY(390%) } }
        @keyframes build-check { 0%, 35% { transform: scale(.5); opacity: 0 } 65% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes build-live { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,.35) } 50% { box-shadow: 0 0 0 5px rgba(0,0,0,0) } }
        @keyframes build-message { from { transform: translateY(8px) scale(.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        .build-dot { animation: build-dot 1s ease-in-out infinite }
        .build-runner { animation: build-runner 2.2s linear infinite }
        .build-check { animation: build-check .55s cubic-bezier(.2,.9,.25,1.3) both }
        .build-live-dot { animation: build-live 1.6s ease-out infinite }
        .build-message { animation: build-message .4s cubic-bezier(.2,.8,.2,1) both }
        .build-grid { background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 24px 24px }
        @media (prefers-reduced-motion: reduce) { .build-dot, .build-runner, .build-check, .build-live-dot, .build-message { animation: none !important } }
      `}</style>
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#D9BEF4]/10 blur-[110px]" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col items-start text-left">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[#D9BEF4]/25 bg-[#D9BEF4]/10 text-xs font-bold text-[#7060BD]">1</span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Ask it. Elpino answers.</span>
        </div>
        <h2 className="max-w-4xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-[#11120f] [text-wrap:balance] md:text-5xl">
          One message becomes an answer <span className="text-[#7060BD]">— with the receipts.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55 md:text-lg">
          Your customer asks in the widget. Elpino searches what you&apos;ve taught it and replies — every step
          logged, so your team can see exactly what it checked and why.
        </p>
        <AutomationDemo />
      </div>
    </section>
  );
}
