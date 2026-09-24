"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Blocks, Bot, CreditCard, Plus, Search, SearchX, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// The FAQ: a live search over every answer, a sticky category rail, coloured
// category sections with sticker accordions, and a "still stuck?" card. The
// questions live in faq-categories.ts (also read by the pricing page and the
// FAQ structured data).

export type FaqItem = { q: string; a: string };
export type FaqCategory = { name: string; items: FaqItem[] };

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

const META: Record<string, { icon: LucideIcon; color: string; slug: string; blurb: string }> = {
  "Getting started": { icon: Sparkles, color: YELLOW, slug: "getting-started", blurb: "Setup, the free plan and your first answer." },
  "The AI & escalation": { icon: Bot, color: PURPLE, slug: "ai-escalation", blurb: "How the agent thinks, and when people step in." },
  Integrations: { icon: Blocks, color: ORANGE, slug: "integrations", blurb: "Payments, tickets and your own tools." },
  "Billing & plans": { icon: CreditCard, color: GREEN, slug: "billing-plans", blurb: "Pricing, AI credit and cancelling." },
  "Data & security": { icon: ShieldCheck, color: PINK, slug: "data-security", blurb: "What's stored, encrypted and never shared." },
};
const metaOf = (name: string) => META[name] ?? { icon: Sparkles, color: BLUE, slug: name.toLowerCase().replace(/\W+/g, "-"), blurb: "" };

const SUGGESTED = ["refund", "free plan", "MCP", "handoff", "Stripe", "cancel"];
const PLACEHOLDERS = ["Can the AI issue refunds?", "How does the free plan work?", "What happens when it can't help?", "Is my data used to train models?"];

function esc(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function Mark({ text, q }: { text: string; q: string }): ReactNode {
  const t = q.trim();
  if (t.length < 2) return text;
  const parts = text.split(new RegExp(`(${esc(t)})`, "gi"));
  return parts.map((p, i) => (p.toLowerCase() === t.toLowerCase() ? <mark key={i} className="rounded px-0.5 text-inherit" style={{ backgroundColor: YELLOW }}>{p}</mark> : p));
}

function Hero({ total, q, setQ }: { total: number; q: string; setQ: (v: string) => void }) {
  const [ph, setPh] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPh((v) => (v + 1) % PLACEHOLDERS.length), 2800);
    return () => window.clearInterval(id);
  }, []);
  return (
    <section className="relative isolate overflow-hidden bg-white text-[#11120f]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }} />
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-[124px] text-center sm:px-8 lg:pt-[140px]">
        <Rv variant="drop"><span className={`${mono} inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3 py-1.5`} style={{ backgroundColor: YELLOW }}><Sparkles size={13} />{total} answers</span></Rv>
        <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.058em]">Ask away. <span className="hl">We&apos;ve answered.</span></h1></Rv>
        <Rv delay={170}><p className="mx-auto mt-6 max-w-[52ch] text-lg leading-8 text-[#11120f]/70">Setup, the AI, integrations, billing and security. Search every answer, or jump to a topic.</p></Rv>
        <Rv delay={240}>
          <div className={`${card} mx-auto mt-9 flex max-w-2xl items-center gap-3 bg-white px-5 py-4 focus-within:bg-[#fff6cf]`}>
            <Search size={22} aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={PLACEHOLDERS[ph]} aria-label="Search the FAQ" className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-[#11120f]/40" />
            {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full border-2 border-[#11120f] bg-white"><X size={15} /></button>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className={`${mono} text-[#11120f]/45`}>Try</span>
            {SUGGESTED.map((s) => <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{s}</button>)}
          </div>
        </Rv>
      </div>
    </section>
  );
}

export function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    const hit = categories.find((c) => metaOf(c.name).slug === h);
    if (hit) setActive(hit.name);
  }, [categories]);

  const term = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      categories
        .filter((c) => !active || c.name === active)
        .map((c) => ({ ...c, items: c.items.filter((i) => term.length < 2 || (i.q + " " + i.a).toLowerCase().includes(term)) }))
        .filter((c) => c.items.length > 0),
    [categories, active, term],
  );
  const count = shown.reduce((n, c) => n + c.items.length, 0);

  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero total={total} q={q} setQ={setQ} />

      <section className="bg-[#fff8ec] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[250px_1fr]">
          {/* category rail */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <p className={`${mono} mb-3 text-[#11120f]/50`}>Topics</p>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible [scrollbar-width:none]">
                <button type="button" onClick={() => setActive(null)} aria-pressed={active === null} className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border-2 border-[#11120f] px-4 py-3 text-left font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: active === null ? INK : "#fff", color: active === null ? "#fff" : INK }}>
                  <span>All topics</span><span className="font-mono text-[12px] opacity-70">{total}</span>
                </button>
                {categories.map((c) => {
                  const m = metaOf(c.name);
                  const on = active === c.name;
                  return (
                    <button key={c.name} type="button" onClick={() => setActive(on ? null : c.name)} aria-pressed={on} className="flex shrink-0 items-center gap-3 rounded-2xl border-2 border-[#11120f] px-4 py-3 text-left font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: on ? m.color : "#fff", color: on ? onDark(m.color) : INK }}>
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-[#11120f] bg-white"><m.icon size={16} color={INK} /></span>
                      <span className="whitespace-nowrap lg:whitespace-normal">{c.name}</span>
                      <span className="ml-auto hidden font-mono text-[12px] opacity-70 lg:inline">{c.items.length}</span>
                    </button>
                  );
                })}
              </div>
              <div className={`${card} mt-6 hidden bg-white p-4 lg:block`}>
                <p className="font-semibold leading-snug">Can&apos;t find it?</p>
                <p className="mt-1 text-[14px] leading-6 text-[#11120f]/60">Ask Elpino in the chat bubble, or write to us.</p>
                <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold underline decoration-2 underline-offset-4">Contact us <ArrowRight size={14} /></Link>
              </div>
            </div>
          </aside>

          {/* answers */}
          <div>
            <p className="mb-6 text-[15px] text-[#11120f]/60" aria-live="polite">{term.length >= 2 ? `${count} ${count === 1 ? "answer" : "answers"} for “${q.trim()}”` : active ? `${count} answers in ${active}` : `${count} answers`}</p>

            {count === 0 && (
              <div className={`${card} flex flex-col items-center bg-white px-6 py-14 text-center`}>
                <span className="grid size-16 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: YELLOW }}><SearchX size={28} /></span>
                <p className="mt-5 text-2xl font-semibold tracking-tight">Nothing matches “{q.trim()}”</p>
                <p className="mt-2 max-w-[40ch] text-[16px] leading-7 text-[#11120f]/60">Try a shorter word, or ask us directly and we&apos;ll add it here.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <button type="button" onClick={() => { setQ(""); setActive(null); }} className="rounded-full border-2 border-[#11120f] bg-white px-5 py-2.5 font-semibold transition hover:bg-[#ffd84d]">Clear search</button>
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-5 py-2.5 font-semibold text-white" style={{ backgroundColor: BLUE }}>Ask us <ArrowRight size={15} /></Link>
                </div>
              </div>
            )}

            <div className="space-y-12">
              {shown.map((c) => {
                const m = metaOf(c.name);
                return (
                  <section key={c.name} id={m.slug} className="scroll-mt-24">
                    <div className={`${card} relative mb-4 flex items-center gap-4 overflow-hidden p-4 sm:p-5`} style={{ backgroundColor: m.color, color: onDark(m.color) }}>
                      <div aria-hidden="true" className="absolute inset-0 opacity-[0.14]" style={dots} />
                      <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-[#11120f] bg-white"><m.icon size={22} color={INK} /></span>
                      <div className="relative min-w-0"><h2 className="text-2xl font-semibold tracking-[-0.03em]">{c.name}</h2><p className="text-[14.5px] opacity-85">{m.blurb}</p></div>
                      <span className="relative ml-auto rounded-full border-2 border-[#11120f] bg-white px-3 py-1 font-mono text-[12px] font-bold text-[#11120f]">{c.items.length}</span>
                    </div>
                    <div className="space-y-3">
                      {c.items.map((item) => {
                        const key = `${c.name}::${item.q}`;
                        const isOpen = open === key || term.length >= 2;
                        return (
                          <div key={key} className={`${card} overflow-hidden transition-colors ${isOpen ? "bg-[#fffdf5]" : "bg-white"}`}>
                            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(open === key ? null : key)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold leading-snug">
                              <span><Mark text={item.q} q={q} /></span>
                              <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-[#11120f] transition-transform duration-300" style={{ backgroundColor: isOpen ? YELLOW : "#fff", transform: isOpen ? "rotate(45deg)" : "none" }}><Plus size={16} /></span>
                            </button>
                            <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                              <div className="overflow-hidden"><p className="px-5 pb-5 text-[16px] leading-7 text-[#11120f]/75"><Mark text={item.a} q={q} /></p></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-24 pt-16 sm:px-8">
        <Rv variant="pop">
          <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-14 text-center text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="relative mx-auto size-20 rounded-full border-2 border-[#11120f] bg-white object-contain p-1.5" style={{ animation: "elpino-float 4.5s ease-in-out infinite" }} />
            <h2 className="relative mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,4.8vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.045em]">Still have a question?</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/90">Ask Elpino in the chat bubble on this page, or start free and try it yourself.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex h-13 items-center gap-2 rounded-full border-2 border-[#11120f] px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
              <Link href="/contact" className="inline-flex h-13 items-center rounded-full border-2 border-[#11120f] bg-white px-8 font-semibold text-[#11120f] transition hover:-translate-y-0.5">Contact us</Link>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
