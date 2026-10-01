"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BookOpen, Check, Lock, Search, ShieldCheck, Users } from "lucide-react";

// Animated demos for the AI agent page, in the same framed style as the home page's previews: a soft pastel frame
// around a dark panel. Each one plays once its panel scrolls into view (the hero's loops), and shows the final state
// straight away when the visitor prefers reduced motion. Every name, tool and number shown is something the agent
// really does or really calls; the customers, orders and amounts are sample data.

// ---------------------------------------------------------------- helpers

function useSeen<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setSeen(true); observer.disconnect(); } }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, seen] as const;
}

// A list of moments, in milliseconds after the panel appears. Returns how many have happened. With `loopMs` the
// whole thing replays that long after the last moment.
function useTimeline(seen: boolean, times: number[], loopMs?: number) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage(times.length); return; }
    const timers: number[] = [];
    let alive = true;
    const run = () => {
      setStage(0);
      times.forEach((ms, index) => timers.push(window.setTimeout(() => alive && setStage(index + 1), ms)));
      if (loopMs) timers.push(window.setTimeout(() => alive && run(), times[times.length - 1] + loopMs));
    };
    run();
    return () => { alive = false; timers.forEach((id) => window.clearTimeout(id)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return stage;
}

const pop = (on: boolean): CSSProperties => ({ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(10px)", transition: "opacity 450ms ease, transform 450ms ease" });

const userBubble = "ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-[#6c5ce7] px-4 py-2.5 text-[14px] leading-[1.5] text-white";
const aiBubble = "w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5 text-[14px] leading-[1.5] text-white";

// The soft frame with the dark panel inside, as on the home page.
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] p-5 sm:p-7" style={{ backgroundColor: "#eeeeec", backgroundImage: ["radial-gradient(60% 55% at 0% 0%, rgba(176,222,196,0.85) 0%, rgba(176,222,196,0) 70%)", "radial-gradient(55% 60% at 100% 10%, rgba(150,142,184,0.8) 0%, rgba(150,142,184,0) 70%)", "radial-gradient(60% 55% at 10% 100%, rgba(238,196,190,0.75) 0%, rgba(238,196,190,0) 70%)", "radial-gradient(55% 55% at 100% 100%, rgba(205,200,216,0.9) 0%, rgba(205,200,216,0) 70%)"].join(", ") }}>
      <div className="relative overflow-hidden rounded-2xl bg-[#0f1629] shadow-[0_24px_60px_rgba(15,22,41,0.35)]">{children}</div>
    </div>
  );
}

function Panel({ children, seenRef }: { children: ReactNode; seenRef: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={seenRef} className="grid min-h-[430px] w-full place-items-center p-6 text-white sm:p-9">{children}</div>;
}

const Tag = ({ children, color = "#7fe0b3" }: { children: ReactNode; color?: string }) => <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase" style={{ background: `${color}33`, color }}>{children}</span>;

// ------------------------------------------------------------- the hero

const TRACE = [
  { tag: "route", color: "#8ab4ff", text: "router → support specialist" },
  { tag: "tool", color: "#b6a9ff", text: "recall_conversation(“order 4821”)", result: "2 earlier messages" },
  { tag: "tool", color: "#b6a9ff", text: "get_past_conversations", result: "1 resolved chat last month" },
  { tag: "verify", color: "#7fe0b3", text: "send_email_code → check_email_code", result: "identity verified" },
  { tag: "mcp", color: "#ffb48a", text: "mcp_shop__get_order(“4821”)", result: "shipped · arrives Thursday" },
  { tag: "review", color: "#f0a3c4", text: "review", result: "facts match tool results" },
];

// A customer asks, and the agent's work appears line by line before it answers. Loops.
export function HeroDemo() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [500, 1500, 2500, 3500, 4500, 5500, 6500, 7800], 4500);
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[460px] space-y-4">
          <div className={userBubble} style={pop(stage >= 1)}>Hi, where is my order #4821?</div>
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
            <div className="flex items-center justify-between text-[12px] text-white/50"><span>What the agent is doing</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: stage > 1 && stage < 8 ? "#7fe0b3" : "#6b7280", animation: stage > 1 && stage < 8 ? "pulse 1s ease-in-out infinite" : undefined }} />{stage > 1 && stage < 8 ? "working" : stage >= 8 ? "done" : "waiting"}</span>
            </div>
            <div className="mt-3 min-h-[188px] space-y-2.5 font-mono text-[12px] leading-[1.45]">
              {TRACE.map((line, index) => (
                <div key={line.text} className="flex items-start gap-2.5" style={pop(stage >= index + 2)}>
                  <Tag color={line.color}>{line.tag}</Tag>
                  <span><span className="text-white/90">{line.text}</span>{line.result && <span className="block text-[#7fe0b3]">↳ {line.result}</span>}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={aiBubble} style={pop(stage >= 8)}>Your order #4821 shipped yesterday and arrives Thursday.</div>
        </div>
      </Panel>
    </Frame>
  );
}

// -------------------------------------------------- 1. the same questions

export function PreviewKnowledge() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1500, 2700, 4300, 5400, 6400], 4000);
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[420px] space-y-3">
          <div className={userBubble} style={pop(stage >= 1)}>How do I change my account email?</div>
          <div className="flex items-center gap-2 text-[12px] text-white/55" style={pop(stage === 2)}><Search size={13} className="animate-pulse" />Searching your knowledge…</div>
          <div className={aiBubble} style={pop(stage >= 3)}>Open Settings, choose Profile, then update your contact email.</div>
          <div className="flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-[12.5px] text-white/75" style={pop(stage >= 3)}><BookOpen size={13} />Account settings guide<Check size={13} className="ml-1 text-[#7fe0b3]" /></div>
          <div className="pt-3" />
          <div className={userBubble} style={pop(stage >= 4)}>Do you offer on-site training?</div>
          <div className={aiBubble} style={pop(stage >= 5)}>I don&apos;t have that in my knowledge, so I&apos;m bringing in a teammate.</div>
          <p className="text-center text-[12px] text-white/45" style={pop(stage >= 6)}>Answers only from what you&apos;ve approved. When it isn&apos;t there, it says so.</p>
        </div>
      </Panel>
    </Frame>
  );
}

// ------------------------------------------- 2. customers repeat themselves

export function PreviewMemory() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1200, 2000, 3000, 4200], 4500);
  const rows = [
    ["This conversation", "Asked about order #4821, wants a delivery date"],
    ["Earlier in this chat", "2 messages, looked up again when needed"],
    ["Last month", "Login issue, resolved"],
  ];
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-3" style={pop(stage >= 1)}>
            <span className="grid size-10 place-items-center rounded-full bg-white/10 text-[13px] font-medium">AK</span>
            <div><p className="text-[15px] font-medium">Aisha Khan</p><p className="text-[12px] text-white/50">Returning customer · 2 chats</p></div>
          </div>
          <div className="mt-5 space-y-2.5">
            {rows.map(([label, value], index) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3" style={pop(stage >= index + 2)}>
                <p className="text-[12px] text-white/50">{label}</p>
                <p className="mt-0.5 text-[14.5px]">{value}</p>
              </div>
            ))}
          </div>
          <div className={`${aiBubble} mt-5`} style={pop(stage >= 5)}>Welcome back, Aisha. Still about order #4821? It shipped yesterday.</div>
        </div>
      </Panel>
    </Frame>
  );
}

// ------------------------------------ 3. you can't tell who you're talking to

export function PreviewVerify() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1500, 2700, 3100, 3500, 3900, 4300, 4700, 5300], 4500);
  const digits = Math.max(0, Math.min(6, stage - 3));
  const open = stage >= 9;
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[400px] space-y-3">
          <div className={userBubble} style={pop(stage >= 1)}>I&apos;m Alex Morgan. Show me my invoices.</div>
          <div className={aiBubble} style={pop(stage >= 2)}>I need to verify you first. I&apos;ve sent a 6-digit code to the email on the account.</div>
          <div className="flex items-center gap-2" style={pop(stage >= 2)}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] transition-colors duration-500" style={{ background: open ? "rgba(44,138,99,0.3)" : "rgba(183,121,31,0.28)", color: open ? "#7fe0b3" : "#f6c667" }}>
              {open ? <ShieldCheck size={12} /> : <Lock size={12} />}{open ? "Identity verified" : "Not verified · account locked"}
            </span>
          </div>
          <div className="flex gap-2" style={pop(stage >= 3)}>
            {[0, 1, 2, 3, 4, 5].map((digit) => <span key={digit} className="grid h-11 flex-1 place-items-center rounded-lg border bg-white/[0.06] text-[17px] font-medium tabular-nums transition-colors duration-300" style={{ borderColor: digits > digit ? "#8b7cf6" : "rgba(255,255,255,0.18)" }}>{digits > digit ? "482917"[digit] : ""}</span>)}
          </div>
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5" style={{ opacity: stage >= 2 ? 1 : 0, transition: "opacity 450ms ease" }}>
            <div className="flex items-center justify-between transition-[filter] duration-700" style={{ filter: open ? "none" : "blur(6px)" }}>
              <span><span className="block text-[14.5px] font-medium leading-tight">Invoice #1042</span><span className="block text-[12.5px] text-white/55">Growth plan · paid</span></span>
              <span className="text-[16px] font-medium">$59.00</span>
            </div>
            <span aria-hidden="true" className="absolute inset-0 grid place-items-center transition-opacity duration-500" style={{ opacity: open ? 0 : 1 }}><Lock size={18} className="text-white/70" /></span>
          </div>
          <p className="text-center text-[12px] text-white/45" style={pop(stage >= 9)}>An email code or a signed token from your app, before anything personal.</p>
        </div>
      </Panel>
    </Frame>
  );
}

// ----------------------------------- 4. looking up a payment or order by hand

export function PreviewLookup() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1300, 2200, 3100, 4000, 5000], 4500);
  const rows = [
    { tool: "stripe · get_subscription", result: "Growth · active", color: "#ffb48a" },
    { tool: "stripe · last_payment", result: "Failed · card declined", color: "#f0838f" },
    { tool: "send_payment_link", result: "Link sent to the customer", color: "#7fe0b3" },
    { tool: "mcp_shop__get_order(“4821”)", result: "Shipped · arrives Thursday", color: "#7fe0b3" },
  ];
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[430px] space-y-3">
          <div className={userBubble} style={pop(stage >= 1)}>My payment failed, and where is my order?</div>
          <div className="space-y-2">
            {rows.map((row, index) => {
              const done = stage >= index + 3;
              return (
                <div key={row.tool} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3" style={pop(stage >= index + 2)}>
                  <code className="font-mono text-[12.5px] text-white/80">{row.tool}</code>
                  <span className="shrink-0 text-[12.5px] transition-colors duration-300" style={{ color: done ? row.color : "rgba(255,255,255,0.4)" }}>{done ? row.result : "looking up…"}</span>
                </div>
              );
            })}
          </div>
          <div className={aiBubble} style={pop(stage >= 6)}>Your card was declined, so I&apos;ve sent a fresh payment link. Your order ships Thursday.</div>
        </div>
      </Panel>
    </Frame>
  );
}

// ---------------------------------------------- 5. bots that make things up

export function PreviewReview() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [500, 1700, 3000, 4200, 5200], 4500);
  const wrong = stage >= 3 && stage < 4;
  const fixed = stage >= 4;
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[420px] space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4" style={pop(stage >= 1)}>
            <p className="text-[12px] text-white/50">Draft reply</p>
            <p className="mt-2 text-[15px] leading-[1.55]">
              Your order shipped yesterday and arrives{" "}
              <span className="rounded px-1 transition-colors duration-500" style={{ background: wrong ? "rgba(240,131,143,0.3)" : fixed ? "rgba(127,224,179,0.25)" : "transparent", textDecoration: wrong ? "line-through" : "none" }}>{fixed ? "Thursday" : "Monday"}</span>.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4" style={pop(stage >= 2)}>
            <p className="text-[12px] text-white/50">What the order tool returned</p>
            <p className="mt-2 font-mono text-[12.5px] text-white/85">status: shipped<br />arrives: Thursday</p>
          </div>
          <div className="flex items-center gap-2 text-[13px]" style={pop(stage >= 3)}>
            {wrong || stage < 4 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0838f]/20 px-3 py-1 text-[#f0838f]">✕ “Monday” doesn&apos;t match the tool result</span> : null}
            {fixed && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2c8a63]/30 px-3 py-1 text-[#7fe0b3]"><Check size={13} strokeWidth={3} />Corrected and reviewed</span>}
          </div>
          <p className="text-center text-[12px] text-white/45" style={pop(stage >= 5)}>A review pass checks every draft against what the tools returned, before it&apos;s sent.</p>
        </div>
      </Panel>
    </Frame>
  );
}

// --------------------------------- 6. an AI that can do more than you meant

export function PreviewPermissions() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1100, 1800, 2500, 3200, 4600, 5600], 4500);
  const tools = [
    { name: "get_order", note: "Reads an order", on: true },
    { name: "track_shipment", note: "Live tracking", on: true },
    { name: "update_address", note: "Changes data · needs a verified customer", on: true },
    { name: "cancel_order", note: "Changes data", on: false },
    { name: "delete_customer", note: "Destructive", on: false },
  ];
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[430px]">
          <p className="text-[12px] text-white/50" style={pop(stage >= 1)}>Your shop MCP server · tools you&apos;ve switched on</p>
          <div className="mt-3 space-y-2">
            {tools.map((tool, index) => {
              const shown = stage >= index + 1;
              const on = tool.on && stage >= index + 2;
              return (
                <div key={tool.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3" style={pop(shown)}>
                  <span className="min-w-0"><code className="block font-mono text-[13px]">{tool.name}</code><span className="block text-[12px] text-white/50">{tool.note}</span></span>
                  <span className="relative h-6 w-11 shrink-0 rounded-full border border-white/20 transition-colors duration-300" style={{ background: on ? "#1aa37a" : "rgba(255,255,255,0.08)" }}><span className="absolute top-0.5 size-5 rounded-full bg-white transition-all duration-300" style={{ left: on ? "calc(100% - 22px)" : "2px" }} /></span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-[#f0838f]/40 bg-[#f0838f]/10 px-4 py-3 font-mono text-[12.5px]" style={pop(stage >= 6)}>
            <span className="text-white/80">agent → cancel_order(“4821”)</span><span className="block text-[#f0838f]">✕ blocked: not switched on</span>
          </div>
          <p className="mt-3 text-center text-[12px] text-white/45" style={pop(stage >= 7)}>Refunds stay off until the workspace owner turns them on.</p>
        </div>
      </Panel>
    </Frame>
  );
}

// ------------------------------------------ 7. conversations that get dropped

export function PreviewHandoff() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [400, 1500, 2500, 3500, 6500, 7700], 4500);
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[420px] space-y-3">
          <div className={aiBubble} style={pop(stage >= 1)}>I don&apos;t have a tool for that. Want me to bring in a teammate?</div>
          <div className={userBubble} style={pop(stage >= 2)}>Yes please</div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4" style={pop(stage >= 3)}>
            <div className="flex items-center justify-between text-[13px]"><span className="inline-flex items-center gap-2"><Users size={14} />Join alert sent to the team</span><span className="tabular-nums text-white/60">90 s</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#8b7cf6]" style={{ width: stage >= 4 ? "35%" : stage >= 3 ? "100%" : "100%", transition: stage >= 3 ? "width 3000ms linear" : "none" }} /></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#7fe0b3]/30 bg-[#2c8a63]/15 px-4 py-3 text-[13.5px]" style={pop(stage >= 5)}>
            <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[12px] font-medium">PS</span>
            <span><b className="font-medium">Priya joined</b><span className="block text-[12px] text-white/60">She sees what the AI already checked</span></span>
          </div>
          <p className="text-center text-[12px] text-white/45" style={pop(stage >= 6)}>If nobody joins in time, a ticket is filed and the customer is emailed.</p>
        </div>
      </Panel>
    </Frame>
  );
}

// ------------------------------ 8. the wrong kind of help for the question

export function PreviewRouting() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const stage = useTimeline(seen, [500, 1800, 3100, 4400], 1200);
  const cases = [
    { q: "What does the Growth plan cost?", lane: 0 },
    { q: "My payment failed", lane: 1 },
    { q: "My webhook returns a 401", lane: 2 },
  ];
  const lanes = [["Sales", "Plans, pricing, fit"], ["Support", "Accounts, payments, how-to"], ["Technical", "Errors, setup, integration"]];
  const active = stage >= 1 && stage <= 3 ? cases[stage - 1] : null;
  return (
    <Frame>
      <Panel seenRef={ref}>
        <div className="w-full max-w-[420px]">
          <div className="min-h-[46px]">{active && <div key={active.q} className={userBubble} style={{ animation: "elpino-rv-up .4s both" }}>{active.q}</div>}</div>
          <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-1.5 text-[13px]">Router <span className="text-white/50">picks the specialist</span></div>
          <div aria-hidden="true" className="mx-auto h-5 w-px bg-white/25" />
          <div className="grid grid-cols-3 gap-2.5">
            {lanes.map(([name, note], index) => {
              const on = active?.lane === index;
              return (
                <div key={name} className="rounded-xl border p-3 text-center transition-all duration-500" style={{ borderColor: on ? "#8b7cf6" : "rgba(255,255,255,0.12)", background: on ? "rgba(139,124,246,0.22)" : "rgba(255,255,255,0.04)", transform: on ? "translateY(-4px)" : "none", opacity: on || !active ? 1 : 0.55 }}>
                  <p className="text-[15px] font-medium">{name}</p>
                  <p className="mt-1 text-[11.5px] leading-4 text-white/55">{note}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-center text-[12px] text-white/45">Hard turns go to a stronger reasoning model, with a fallback if a provider is down.</p>
        </div>
      </Panel>
    </Frame>
  );
}
