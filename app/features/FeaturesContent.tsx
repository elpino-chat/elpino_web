"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, BookOpen, Bot, Check, Code2, Headset, Plus, Rocket, Search, ShieldCheck, Sparkles, Store,
  Users, Wrench, Zap,
} from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// Features, laid out like a periodic table: every real capability is a tile
// with a symbol, grouped by colour into six families. Tap a tile for what it
// does and where to read more. Everything here exists in the product today;
// omnichannel is shown as "coming in November", not as a feature.

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

// ------------------------------------------------------------ the table

type Family = "answer" | "team" | "know" | "act" | "trust" | "grow";
const FAMILIES: Record<Family, { label: string; color: string }> = {
  answer: { label: "Answer", color: BLUE },
  team: { label: "Team", color: GREEN },
  know: { label: "Knowledge", color: YELLOW },
  act: { label: "Act", color: ORANGE },
  trust: { label: "Trust", color: PURPLE },
  grow: { label: "Grow", color: PINK },
};

type Feature = { sym: string; name: string; fam: Family; body: string; href: string; more: string };
const FEATURES: Feature[] = [
  { sym: "Ga", name: "Grounded answers", fam: "answer", body: "Replies come from the knowledge you approved. If it isn't there, the AI says so instead of guessing.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Rl", name: "Reply language", fam: "answer", body: "Choose the language the chatbot replies in for your customers.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Pa", name: "Page awareness", fam: "answer", body: "Decide whether the AI can see the page URL a visitor is on, and use it to answer in context.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Wb", name: "Branded widget", fam: "answer", body: "Your logo and colours on a chat widget you embed with one snippet.", href: "/demo", more: "Demo" },
  { sym: "Ty", name: "Live typing", fam: "answer", body: "Customers see when a teammate is replying, and you see when they are.", href: "/product/inbox", more: "Inbox" },
  { sym: "At", name: "Attachments", fam: "answer", body: "Customers and your team can send files right inside the conversation.", href: "/product/inbox", more: "Inbox" },

  { sym: "Si", name: "Shared inbox", fam: "team", body: "Every conversation and reply in one place, with a badge showing whether the AI, a teammate or nobody has it.", href: "/product/inbox", more: "Inbox" },
  { sym: "Ja", name: "Join alerts", fam: "team", body: "When a customer asks for a person, every teammate gets a Join alert. The first to join takes it and the alert clears for everyone.", href: "/product/inbox", more: "Inbox" },
  { sym: "Th", name: "Take over & hand back", fam: "team", body: "Take a chat from the AI or a colleague, and hand it back to the AI in one tap.", href: "/product/inbox", more: "Inbox" },
  { sym: "As", name: "Assignments", fam: "team", body: "Conversations can be assigned to a teammate, who gets notified.", href: "/product/inbox", more: "Inbox" },
  { sym: "Ti", name: "Team invites", fam: "team", body: "Invite teammates by email and add seats as your team grows.", href: "/pricing", more: "Pricing" },
  { sym: "Tk", name: "Auto tickets", fam: "team", body: "If nobody joins within 90 seconds, the customer is told and a ticket is created automatically, with an email follow-up.", href: "/product/inbox", more: "Inbox" },

  { sym: "Wc", name: "Website crawl", fam: "know", body: "Point Elpino at a page. JavaScript-built pages are rendered in a real browser first.", href: "/product/knowledge-hub", more: "Knowledge Hub" },
  { sym: "Sm", name: "Sitemap import", fam: "know", body: "Pull in up to 20 pages from your sitemap in one go.", href: "/product/knowledge-hub", more: "Knowledge Hub" },
  { sym: "Di", name: "Discover", fam: "know", body: "Start at one link and Elpino follows it through up to 50 pages, help and policy pages first.", href: "/product/knowledge-hub", more: "Knowledge Hub" },
  { sym: "Fu", name: "File upload", fam: "know", body: "Upload PDF, Word, text and Markdown files and the text is extracted for you.", href: "/product/knowledge-hub", more: "Knowledge Hub" },
  { sym: "Wp", name: "Written pages", fam: "know", body: "Write your own pages in the editor for things that live nowhere else.", href: "/product/knowledge-hub", more: "Knowledge Hub" },
  { sym: "Pp", name: "Public / private", fam: "know", body: "Each source has a visibility switch, so internal notes stay internal.", href: "/product/knowledge-hub", more: "Knowledge Hub" },

  { sym: "Pl", name: "Payment lookup", fam: "act", body: "Checks real payments in Stripe or Razorpay so answers are facts, not guesses.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Pk", name: "Payment links", fam: "act", body: "Creates a fresh, secure payment link when a payment needs another try.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Su", name: "Subscriptions", fam: "act", body: "Checks subscription status and can cancel one when the customer asks.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Rf", name: "Refunds (opt-in)", fam: "act", body: "Off by default. The workspace owner decides whether the AI may refund at all.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Rc", name: "Receipts", fam: "act", body: "Finds and sends the receipt for a specific payment.", href: "/product/ai-agent", more: "AI agent" },
  { sym: "Mc", name: "MCP tools", fam: "act", body: "Connect up to five MCP servers and switch on exactly the tools the agent may use.", href: "/product/ai-agent", more: "AI agent" },

  { sym: "Iv", name: "Identity check", fam: "trust", body: "A one-time email code or a signed token from your app confirms who the customer is.", href: "/security-guide", more: "Security guide" },
  { sym: "Pd", name: "Private-data filter", fam: "trust", body: "Names and emails are swapped for reference codes before the AI reads a conversation, and secrets are stripped out.", href: "/security-guide", more: "Security guide" },
  { sym: "Sr", name: "Secure requests", fam: "trust", body: "Ask for sensitive details through a one-time private form instead of the chat.", href: "/security-guide", more: "Security guide" },
  { sym: "Ec", name: "Encrypted keys", fam: "trust", body: "Connected credentials are stored encrypted.", href: "/security-guide", more: "Security guide" },
  { sym: "Bg", name: "Budget guardrails", fam: "trust", body: "A monthly AI credit on paid plans keeps AI spend predictable.", href: "/pricing", more: "Pricing" },
  { sym: "Fr", name: "Fact review", fam: "trust", body: "Drafts are checked against tool results before the customer sees them.", href: "/product/ai-agent", more: "AI agent" },

  { sym: "Vc", name: "Visitor context", fam: "grow", body: "Location, device and the page they were on, attached to every conversation.", href: "/product/inbox", more: "Inbox" },
  { sym: "An", name: "Analytics", fam: "grow", body: "See how conversations are going across your workspace.", href: "/pricing", more: "Pricing" },
  { sym: "Hi", name: "History", fam: "grow", body: "Earlier conversations with the same customer, right next to the thread.", href: "/product/inbox", more: "Inbox" },
  { sym: "Fp", name: "Free plan", fam: "grow", body: "Start with 50 AI conversations a month, no card required.", href: "/pricing", more: "Pricing" },
  { sym: "Cr", name: "Credit-based plans", fam: "grow", body: "Paid plans include a monthly AI credit, and extra seats are simple add-ons.", href: "/pricing", more: "Pricing" },
  { sym: "Em", name: "Email replies", fam: "grow", body: "Verified visitors who left the chat can still get your reply by email.", href: "/product/inbox", more: "Inbox" },
];

function Table() {
  const [fam, setFam] = useState<Family | "all">("all");
  const [sel, setSel] = useState(0);
  const f = FEATURES[sel];
  const fc = FAMILIES[f.fam];

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setFam("all")} aria-pressed={fam === "all"} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={fam === "all" ? { backgroundColor: INK, color: "#fff" } : { backgroundColor: "#fff" }}>All · {FEATURES.length}</button>
        {(Object.keys(FAMILIES) as Family[]).map((k) => (
          <button key={k} type="button" onClick={() => setFam(fam === k ? "all" : k)} aria-pressed={fam === k} className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2 text-[13.5px] font-semibold transition hover:-translate-y-0.5" style={fam === k ? { backgroundColor: FAMILIES[k].color, color: onDark(FAMILIES[k].color) } : { backgroundColor: "#fff" }}>
            <span className="size-3 rounded-full border-2 border-[#11120f]" style={{ backgroundColor: FAMILIES[k].color }} />{FAMILIES[k].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {FEATURES.map((x, i) => {
            const c = FAMILIES[x.fam].color;
            const dim = fam !== "all" && fam !== x.fam;
            const on = i === sel;
            return (
              <button key={x.sym} type="button" onClick={() => setSel(i)} aria-pressed={on} aria-label={x.name} className="group relative aspect-square rounded-2xl border-2 border-[#11120f] p-2 text-left transition-all duration-300 hover:-translate-y-1 hover:rotate-[-2deg]" style={{ backgroundColor: c, color: onDark(c), opacity: dim ? 0.22 : 1, transform: on ? "scale(1.06) rotate(-3deg)" : undefined, boxShadow: on ? `0 0 0 4px #fff, 0 0 0 6px ${INK}` : "none", zIndex: on ? 2 : 1 }}>
                <span className="font-mono text-[9px] font-bold opacity-70">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute inset-x-0 top-[26%] text-center text-[clamp(1.4rem,3.2vw,2.1rem)] font-semibold leading-none tracking-[-0.04em]">{x.sym}</span>
                <span className="absolute inset-x-1.5 bottom-1.5 truncate text-center text-[9.5px] font-semibold leading-tight sm:text-[10.5px]">{x.name}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div key={f.sym} className={`${card} bg-white p-5`} style={{ animation: "elpino-rv-deal .45s both" }}>
            <div className="flex items-start justify-between">
              <span className="grid size-24 place-items-center rounded-2xl border-2 border-[#11120f] text-[2.8rem] font-semibold leading-none tracking-[-0.05em]" style={{ backgroundColor: fc.color, color: onDark(fc.color) }}>{f.sym}</span>
              <Stamp color={fc.color}>{fc.label}</Stamp>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">{f.name}</h3>
            <p className="mt-2 text-[16px] leading-7 text-[#11120f]/70">{f.body}</p>
            <Link href={f.href} className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5">Read more in {f.more} <ArrowRight size={14} /></Link>
          </div>
          <p className="mt-3 text-center text-xs text-[#11120f]/50">Tap any tile. Every feature here is live today.</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 45%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent)" }} />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-[124px] sm:px-8 lg:pt-[140px]">
        <div className="mx-auto max-w-4xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Sparkles size={13} />Features</Stamp></Rv>
          <Rv delay={80}>
            <h1 className="mt-6 text-[clamp(2.7rem,6.4vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              The elements of <span className="hl">great support.</span>
            </h1>
          </Rv>
          <Rv delay={170}><p className="mx-auto mt-6 max-w-[58ch] text-lg leading-8 text-[#11120f]/70">{FEATURES.length} capabilities, one workspace. Filter by family, tap a tile, and see exactly what Elpino does.</p></Rv>
        </div>
        <Rv variant="deal" delay={200} className="mt-12"><Table /></Rv>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- the loop

const LOOP = [
  { icon: BookOpen, c: YELLOW, t: "Teach", d: "Crawl your site, upload files, write pages.", link: "/product/knowledge-hub" },
  { icon: Bot, c: BLUE, t: "Answer", d: "The AI replies from your knowledge, in your language.", link: "/product/ai-agent" },
  { icon: Wrench, c: ORANGE, t: "Act", d: "Payments, subscriptions and your MCP tools.", link: "/product/ai-agent" },
  { icon: Headset, c: GREEN, t: "Hand off", d: "Ask first, alert the team, join or ticket.", link: "/product/inbox" },
  { icon: BarChart3, c: PINK, t: "Learn", d: "Review conversations and improve your knowledge.", link: "/product/knowledge-hub" },
];

function Loop() {
  const reduced = useReduced();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % LOOP.length), 2200);
    return () => window.clearInterval(id);
  }, [reduced]);
  const cur = LOOP[i];
  return (
    <section className="bg-[#fff8ec] px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Heading eyebrow="How they fit" color={BLUE} title={<>It&apos;s a loop, <span className="hl">not a list.</span></>} sub="Each feature feeds the next, so support gets better the more you use it." />
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="200" cy="200" r="150" fill="none" stroke={INK} strokeWidth="2.5" strokeDasharray="4 10" strokeLinecap="round" style={{ animation: "elpino-dashflow 4s linear infinite", transformOrigin: "200px 200px" }} />
            </svg>
            {LOOP.map((l, k) => {
              const a = (k / LOOP.length) * Math.PI * 2 - Math.PI / 2;
              const on = k === i;
              return (
                <button key={l.t} type="button" onClick={() => setI(k)} aria-label={l.t} className="absolute grid size-[76px] place-items-center rounded-full border-2 border-[#11120f] transition-all duration-500" style={{ left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 37.5}%`, transform: `translate(-50%,-50%) scale(${on ? 1.2 : 1})`, backgroundColor: l.c, boxShadow: on ? `0 0 0 6px ${l.c}55` : "none" }}>
                  <l.icon size={26} color={onDark(l.c)} />
                </button>
              );
            })}
            <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="mx-auto size-16 rounded-full border-2 border-[#11120f] bg-white object-contain p-1" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className={`${mono} mt-2 text-[#11120f]/50`}>Elpino</p>
            </div>
          </div>
          <div key={cur.t} className={`${card} bg-white p-7`} style={{ animation: "elpino-rv-deal .45s both" }}>
            <span className="grid size-14 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: cur.c }}><cur.icon size={26} color={onDark(cur.c)} /></span>
            <p className={`${mono} mt-5 text-[#11120f]/45`}>Step {i + 1} of {LOOP.length}</p>
            <h3 className="mt-1 text-4xl font-semibold tracking-[-0.04em]">{cur.t}</h3>
            <p className="mt-3 text-[17px] leading-8 text-[#11120f]/65">{cur.d}</p>
            <Link href={cur.link} className="mt-6 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4">Explore this step <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- personas

const PERSONAS = [
  { key: "founder", icon: Rocket, label: "Founder", c: ORANGE, line: "You're the whole support team and want your evenings back.", picks: ["Free plan, no card", "Answers from your site in minutes", "AI handles payments and receipts", "Only pings you when it truly needs you"] },
  { key: "lead", icon: Users, label: "Support lead", c: GREEN, line: "You run a team and need clean ownership and no dropped chats.", picks: ["Shared inbox with clear badges", "Team-wide Join alerts", "Auto tickets when everyone's busy", "Visitor context on every thread"] },
  { key: "dev", icon: Code2, label: "Developer", c: PURPLE, line: "You want it wired into your own product and data.", picks: ["Signed-token identity from your app", "MCP servers with per-tool approval", "Stripe and Razorpay lookups", "One embeddable widget snippet"] },
  { key: "owner", icon: Store, label: "Store owner", c: PINK, line: "Customers ask about orders and payments all day.", picks: ["Order lookups through your MCP tools", "Payment links and receipts", "Refunds only if you switch them on", "Replies in your customer's language"] },
] as const;

function Personas() {
  const [i, setI] = useState(0);
  const p = PERSONAS[i];
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Heading eyebrow="Who it's for" color={GREEN} title={<>Pick your seat. <span className="hl">See your features.</span></>} />
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {PERSONAS.map((x, k) => (
            <button key={x.key} type="button" onClick={() => setI(k)} aria-pressed={k === i} className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2.5 text-[14.5px] font-semibold transition hover:-translate-y-0.5" style={k === i ? { backgroundColor: x.c, color: "#fff" } : undefined}><x.icon size={16} />{x.label}</button>
          ))}
        </div>
        <div key={p.key} className={`${card} mt-8 grid overflow-hidden lg:grid-cols-[.9fr_1.1fr]`} style={{ animation: "elpino-rv-deal .45s both" }}>
          <div className="p-8 text-white" style={{ backgroundColor: p.c }}>
            <p.icon size={34} />
            <p className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.03em]">{p.line}</p>
          </div>
          <ul className="divide-y-2 divide-[#11120f]/10 bg-[#fffdf5] p-3">
            {p.picks.map((x) => <li key={x} className="flex items-center gap-3 px-4 py-4 text-[17px] font-medium"><span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: p.c }}><Check size={14} color="#fff" strokeWidth={3} /></span>{x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------- replace the stack

const STACK = ["Chat widget", "Helpdesk inbox", "Knowledge base", "Chatbot builder", "Payment look-ups", "Handoff rules"];

function Stack() {
  return (
    <section className="bg-[#11120f] px-5 py-24 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <Rv variant="drop"><Stamp color={YELLOW}><Zap size={13} />One tool</Stamp></Rv>
          <Rv delay={80}><h2 className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Six tools in. <span className="rounded-md px-2" style={{ backgroundColor: YELLOW, color: INK }}>One workspace out.</span></h2></Rv>
          <Rv delay={160}><p className="mt-5 text-lg leading-8 text-white/65">Most teams stitch a widget, a helpdesk, a knowledge base and a bot together. Elpino is all of it in one place, with one memory of every customer.</p></Rv>
        </div>
        <div className="mt-14 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap justify-center gap-2.5">
            {STACK.map((s, i) => <Rv key={s} variant="pop" delay={i * 70}><span className="inline-block rounded-full border-2 border-white/30 px-4 py-2 text-[15px] text-white/60 line-through decoration-[#d9508a] decoration-2" style={{ transform: `rotate(${(i % 3 - 1) * 3}deg)` }}>{s}</span></Rv>)}
          </div>
          <ArrowRight size={34} className="mx-auto rotate-90 md:rotate-0" style={{ color: YELLOW }} aria-hidden="true" />
          <Rv variant="deal" delay={300}>
            <div className={`${card} bg-[#fffdf5] p-7 text-center text-[#11120f]`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="mx-auto size-16 rounded-full border-2 border-[#11120f] bg-white object-contain p-1" style={{ animation: "elpino-float 4s ease-in-out infinite" }} />
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Elpino</p>
              <p className="mt-1 text-[15px] text-[#11120f]/60">Widget · Inbox · Knowledge · AI agent · Tools · Handoff</p>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- coming soon

function Soon() {
  return (
    <section className="bg-[#fff8ec] px-5 py-20 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-4xl overflow-hidden bg-white p-8 text-center`}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
          <div className="relative">
            <Stamp color={PINK}><Search size={12} />Coming in November</Stamp>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">Omnichannel is next.</h3>
            <p className="mx-auto mt-3 max-w-[54ch] text-[17px] leading-8 text-[#11120f]/65">Website chat is live today. Bringing more channels into the same inbox is what we&apos;re shipping next, and we&apos;ll announce it on the changelog.</p>
            <Link href="/changelog" className="mt-5 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4">See the changelog <ArrowRight size={15} /></Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

// --------------------------------------------------------------------- faq

const FAQS: [string, string][] = [
  ["Is everything on this page live?", "Yes. Every tile describes something Elpino does today. Omnichannel is the one thing we're still building, and it's marked as coming in November."],
  ["Do I need all of it?", "No. Start with a knowledge base and the widget on the free plan, then turn on tools, MCP and teammates as you need them."],
  ["What's included on the free plan?", "50 AI conversations a month with no card required."],
  ["How do paid plans work?", "Paid plans include a monthly AI credit, and extra seats are simple add-ons. See the pricing page for details."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
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
    <section className="bg-white px-5 pb-24 pt-4 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "16px 16px" }} />
          <ShieldCheck size={38} className="relative mx-auto" aria-hidden="true" />
          <h2 className="relative mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Every element, ready to use.</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/85">Start on the free plan and switch things on as you grow.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            <Link href="/pricing" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">See pricing</Link>
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function FeaturesContent() {
  return (
    <main className="font-[family-name:var(--font-rethink-sans)]">
      <Hero />
      <Loop />
      <Personas />
      <Stack />
      <Soon />
      <Faq />
      <Closing />
    </main>
  );
}
