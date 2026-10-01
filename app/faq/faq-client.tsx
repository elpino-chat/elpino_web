"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Blocks, Bot, CreditCard, Plus, Search, SearchX, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// The FAQ: a live search over every answer, a topic list beside the answers, and a closing call to action.
// Plain white with thin outlines, like the rest of the site. The questions live in faq-categories.ts (also read
// by the pricing page and the FAQ structured data).

export type FaqItem = { q: string; a: string };
export type FaqCategory = { name: string; items: FaqItem[] };

const BLUE = "#0078f4";

const META: Record<string, { icon: LucideIcon; slug: string; blurb: string }> = {
  "Getting started": { icon: Sparkles, slug: "getting-started", blurb: "Setup, the free plan and your first answer." },
  "The AI & escalation": { icon: Bot, slug: "ai-escalation", blurb: "How the agent thinks, and when people step in." },
  Integrations: { icon: Blocks, slug: "integrations", blurb: "Payments, tickets and your own tools." },
  "Billing & plans": { icon: CreditCard, slug: "billing-plans", blurb: "Pricing, AI credit and cancelling." },
  "Data & security": { icon: ShieldCheck, slug: "data-security", blurb: "What's stored, encrypted and never shared." },
};
const metaOf = (name: string) => META[name] ?? { icon: Sparkles, slug: name.toLowerCase().replace(/\W+/g, "-"), blurb: "" };

const SUGGESTED = ["refund", "free plan", "MCP", "handoff", "Stripe", "cancel"];
const PLACEHOLDERS = ["Can the AI issue refunds?", "How does the free plan work?", "What happens when it can't help?", "Is my data used to train models?"];

function esc(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function Mark({ text, q }: { text: string; q: string }): ReactNode {
  const t = q.trim();
  if (t.length < 2) return text;
  const parts = text.split(new RegExp(`(${esc(t)})`, "gi"));
  return parts.map((p, i) => (p.toLowerCase() === t.toLowerCase() ? <mark key={i} className="rounded px-0.5 text-inherit" style={{ backgroundColor: "rgba(0,120,244,0.16)" }}>{p}</mark> : p));
}

function Hero({ total, q, setQ }: { total: number; q: string; setQ: (v: string) => void }) {
  const [ph, setPh] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPh((v) => (v + 1) % PLACEHOLDERS.length), 2800);
    return () => window.clearInterval(id);
  }, []);
  return (
    <section className="bg-white px-5 pb-12 pt-16 text-[#11120f] sm:px-8 lg:px-20 lg:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <Rv><h1 className="max-w-[16ch] text-[clamp(2.6rem,6vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.045em]">Ask away. We&apos;ve answered.</h1></Rv>
        <Rv delay={100}><p className="mt-5 max-w-[52ch] text-lg leading-8 text-[#11120f]/65">{total} answers on setup, the AI, integrations, billing and security. Search them all, or jump to a topic.</p></Rv>
        <Rv delay={180}>
          <div className="mt-9 flex max-w-2xl items-center gap-3 rounded-[10px] border border-black/40 bg-white px-5 py-4 transition-colors focus-within:border-[#0078f4]">
            <Search size={20} aria-hidden="true" className="text-[#11120f]/55" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={PLACEHOLDERS[ph]} aria-label="Search the FAQ" className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#11120f]/40" />
            {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full border border-black/25 transition hover:border-black/60"><X size={15} /></button>}
          </div>
          <div className="mt-4 flex max-w-2xl flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] text-[#11120f]/50">Try</span>
            {SUGGESTED.map((s) => <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-black/25 bg-white px-3.5 py-1.5 text-[14px] transition hover:border-black/60">{s}</button>)}
          </div>
        </Rv>
      </div>
    </section>
  );
}

export function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>(categories[0]?.name ?? "");
  const [open, setOpen] = useState<string | null>(null);
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    const hit = categories.find((c) => metaOf(c.name).slug === h);
    if (hit) setActive(hit.name);
  }, [categories]);

  const term = q.trim().toLowerCase();
  // Searching looks across every topic; otherwise only the selected topic's questions show.
  const shown = useMemo(
    () =>
      categories
        .filter((c) => term.length >= 2 || c.name === active)
        .map((c) => ({ ...c, items: c.items.filter((i) => term.length < 2 || (i.q + " " + i.a).toLowerCase().includes(term)) }))
        .filter((c) => c.items.length > 0),
    [categories, active, term],
  );
  const count = shown.reduce((n, c) => n + c.items.length, 0);

  const searching = term.length >= 2;
  const current = categories.find((c) => c.name === active) ?? categories[0];
  const currentMeta = current ? metaOf(current.name) : null;

  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <Hero total={total} q={q} setQ={setQ} />

      <section className="bg-white px-5 pb-20 pt-6 sm:px-8 sm:pb-24 lg:px-20">
        <div className="mx-auto max-w-[1500px] border-t border-black/20 pt-12">
          {/* the topics, as cards across the top */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Topics">
            {categories.map((c) => {
              const m = metaOf(c.name);
              const on = !searching && active === c.name;
              return (
                <button key={c.name} type="button" aria-pressed={on} onClick={() => { setQ(""); setActive(c.name); }} className={`flex flex-col rounded-[10px] p-5 text-left transition-colors ${on ? "border-2 border-[#11120f] bg-[#f4f4f2]" : "border border-black/40 bg-white hover:bg-[#fafaf9]"}`}>
                  <span className={`grid size-11 place-items-center rounded-lg ${on ? "bg-[#11120f] text-white" : "border border-black/25 text-[#11120f]"}`}><m.icon size={20} /></span>
                  <span className="mt-6 text-xl font-medium leading-tight tracking-[-0.02em]">{c.name}</span>
                  <span className="mt-2 text-[14px] leading-5 text-[#11120f]/55">{m.blurb}</span>
                  <span className="mt-4 text-[13px] text-[#11120f]/45">{c.items.length} answers</span>
                </button>
              );
            })}
          </div>

          {/* the chosen topic: its description on the left, its questions on the right */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <aside>
              <div className="lg:sticky lg:top-24">
                {searching ? (
                  <>
                    <h2 className="text-3xl font-normal leading-[1.1] tracking-[-0.03em] sm:text-4xl" aria-live="polite">{count} {count === 1 ? "answer" : "answers"} for “{q.trim()}”</h2>
                    <p className="mt-3 max-w-sm text-[16px] leading-7 text-[#11120f]/60">Across every topic. Clear the search to browse a topic instead.</p>
                  </>
                ) : current && currentMeta ? (
                  <>
                    <span className="grid size-12 place-items-center rounded-lg border border-black/25"><currentMeta.icon size={22} /></span>
                    <h2 className="mt-5 text-3xl font-normal leading-[1.1] tracking-[-0.03em] sm:text-4xl">{current.name}</h2>
                    <p className="mt-3 max-w-sm text-[16px] leading-7 text-[#11120f]/60">{currentMeta.blurb}</p>
                  </>
                ) : null}
                <div className="mt-8 hidden rounded-[10px] bg-[#f4f4f2] p-4 lg:block">
                  <p className="font-medium leading-snug">Can&apos;t find it?</p>
                  <p className="mt-1 text-[14px] leading-6 text-[#11120f]/60">Ask Elpino in the chat bubble, or write to us.</p>
                  <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0078f4] underline underline-offset-4">Contact us <ArrowRight size={14} /></Link>
                </div>
              </div>
            </aside>

            <div>
              {count === 0 && (
                <div className="flex flex-col items-center rounded-[10px] border border-black/25 px-6 py-14 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[#f4f4f2]"><SearchX size={24} /></span>
                  <p className="mt-5 text-2xl font-medium tracking-tight">Nothing matches “{q.trim()}”</p>
                  <p className="mt-2 max-w-[40ch] text-[16px] leading-7 text-[#11120f]/60">Try a shorter word, or ask us directly and we&apos;ll add it here.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                    <button type="button" onClick={() => setQ("")} className="rounded-full border border-black/30 bg-white px-5 py-2.5 font-medium transition hover:border-black/70">Clear search</button>
                    <Link href="/contact" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white" style={{ backgroundColor: BLUE }}>Ask us <ArrowRight size={15} /></Link>
                  </div>
                </div>
              )}

              <div className="space-y-10">
                {shown.map((c) => (
                  <section key={c.name} id={metaOf(c.name).slug} className="scroll-mt-24">
                    {searching && <p className="mb-2 text-[13px] text-[#11120f]/50">{c.name}</p>}
                    <div className="border-b border-black/20">
                      {c.items.map((item) => {
                        const key = `${c.name}::${item.q}`;
                        const isOpen = open === key || searching;
                        return (
                          <div key={key} className="border-t border-black/20">
                            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(open === key ? null : key)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-medium leading-snug">
                              <span><Mark text={item.q} q={q} /></span>
                              <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#11120f] bg-[#11120f] text-white" : "border-black/25 text-[#11120f]"}`}><Plus size={16} /></span>
                            </button>
                            <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                              <div className="overflow-hidden"><p className="max-w-2xl pb-6 text-[17px] leading-7 text-[#11120f]/70"><Mark text={item.a} q={q} /></p></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-24 pt-4 sm:px-8 lg:px-20">
        <Rv>
          <div className="relative isolate mx-auto max-w-[1500px] overflow-hidden rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-12 sm:py-16">
            <div className="max-w-xl">
              <h2 className="text-[clamp(2.1rem,4.4vw,3.4rem)] font-normal leading-[1.04] tracking-[-0.035em]">Still have a question?</h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#11120f]/65">Ask Elpino in the chat bubble on this page, or start free and try it yourself.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-7 text-[15px] font-medium text-white transition hover:opacity-85">Start free <ArrowRight size={18} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-1" /></Link>
                <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-7 text-[15px] font-medium transition hover:border-black/60">Contact us</Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/help-center-sloth.png" alt="A helpful sloth with answers" className="pointer-events-none absolute bottom-0 right-10 hidden h-[85%] w-auto object-contain object-bottom lg:block" />
          </div>
        </Rv>
      </section>
    </main>
  );
}
