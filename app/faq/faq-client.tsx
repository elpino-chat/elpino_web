"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Blocks, Bot, CreditCard, MessageCircleQuestion, Search, SearchX, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { Reveal } from "@/app/components/Reveal";

export type FaqItem = { q: string; a: string };
export type FaqCategory = { name: string; items: FaqItem[] };

const categoryMeta: Record<string, { icon: LucideIcon; slug: string; blurb: string }> = {
  "Getting started": { icon: Sparkles, slug: "getting-started", blurb: "Setup, the free plan, and your first answer." },
  "The AI & escalation": { icon: Bot, slug: "ai-escalation", blurb: "How the agent thinks, and when humans step in." },
  Integrations: { icon: Blocks, slug: "integrations", blurb: "Payments, tickets, and connectable tools." },
  "Billing & plans": { icon: CreditCard, slug: "billing-plans", blurb: "Pricing, AI credit, and cancellation." },
  "Data & security": { icon: ShieldCheck, slug: "data-security", blurb: "Training, encryption, and your data." },
};

function Highlight({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={index} className="rounded-[4px] bg-[#e5eec9] px-0.5 text-[#2c3625]">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function FaqRow({
  item,
  id,
  isOpen,
  onToggle,
  query = "",
  badge,
}: {
  item: FaqItem;
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  query?: string;
  badge?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
        className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-[#f5f8f0] focus:outline-none focus-visible:bg-[#f5f8f0]"
      >
        <span className="flex min-w-0 items-center gap-3">
          {badge && (
            <span className="hidden shrink-0 rounded-full border border-[#d9e1d3] bg-[#f1f5ec] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5d6d50] sm:inline-flex">
              {badge}
            </span>
          )}
          <span className="text-[15px] font-medium tracking-[-0.01em] text-[#293326] transition-colors group-hover:text-[#3c4a33]">
            <Highlight text={item.q} query={query} />
          </span>
        </span>
        <span
          className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base transition-all duration-300 ${
            isOpen ? "rotate-45 bg-[#637b52] text-white" : "bg-[#e9eee3] text-[#637b52] group-hover:bg-[#dfe8d6]"
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            key="answer"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 pr-14 text-sm leading-6 text-[#667064]">
              <Highlight text={item.a} query={query} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const reduce = useReducedMotion();

  const query = search.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return [];
    return categories
      .flatMap((category, categoryIndex) =>
        category.items.map((item, itemIndex) => ({ ...item, category: category.name, key: `result-${categoryIndex}-${itemIndex}` })),
      )
      .filter((item) => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query));
  }, [categories, query]);

  return (
    <section className="bg-[#fafaf7] px-6 py-16 md:px-10 md:py-20 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl">
          <label htmlFor="faq-search" className="sr-only">
            Search questions
          </label>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7a8474]" />
            <input
              id="faq-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearch("");
              }}
              placeholder="Search questions — billing, escalation, security…"
              className="h-14 w-full rounded-full border border-[#d9e1d3] bg-white pl-12 pr-12 text-[15px] text-[#293326] shadow-[0_14px_35px_-28px_rgba(32,37,29,0.6)] outline-none transition placeholder:text-[#9aa294] focus:border-[#849d6d] focus:ring-4 focus:ring-[#849d6d]/15"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  key="clear"
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#e9eee3] text-[#5d6d50] transition hover:bg-[#dfe8d6]"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const meta = categoryMeta[category.name];
              const Icon = meta?.icon ?? MessageCircleQuestion;
              return (
                <a
                  key={category.name}
                  href={meta ? `#${meta.slug}` : "#"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d9e1d3] bg-white px-3.5 py-1.5 text-xs font-medium text-[#596353] transition hover:-translate-y-0.5 hover:border-[#849d6d]/50 hover:text-[#3c4a33]"
                >
                  <Icon size={13} className="text-[#849d6d]" />
                  {category.name}
                </a>
              );
            })}
          </div>
        </Reveal>

        {query ? (
          <div className="mt-14">
            <p className="text-sm text-[#596353]">
              {results.length > 0 ? (
                <>
                  <span className="font-semibold text-[#293326]">{results.length}</span> answer{results.length !== 1 ? "s" : ""} matching{" "}
                  <span className="font-medium text-[#293326]">“{search.trim()}”</span>
                </>
              ) : null}
            </p>
            {results.length > 0 ? (
              <div className="mt-5 divide-y divide-[#e2e8db] overflow-hidden rounded-[22px] border border-[#d9e1d3] bg-white shadow-[0_18px_45px_-38px_rgba(32,37,29,0.55)]">
                {results.map((item, index) => (
                  <FaqRow
                    key={item.key}
                    item={item}
                    id={item.key}
                    isOpen={openKey === item.key}
                    onToggle={() => setOpenKey(openKey === item.key ? null : item.key)}
                    query={search.trim()}
                    badge={item.category}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[#c9d4bd] bg-white/70 px-8 py-14 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e9eee3] text-[#637b52]">
                  <SearchX size={20} />
                </span>
                <p className="mt-4 text-base font-medium tracking-[-0.01em] text-[#293326]">No answers match “{search.trim()}”.</p>
                <p className="mt-1.5 text-sm text-[#7a8474]">Try a different word — or ask us directly, a human reads every message.</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 inline-flex h-10 items-center rounded-full border border-[#d9e1d3] bg-white px-5 text-sm font-medium text-[#3c4a33] transition hover:border-[#849d6d]/50"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-16 flex flex-col gap-16 md:mt-20 md:gap-24">
            {categories.map((category, categoryIndex) => {
              const meta = categoryMeta[category.name];
              const Icon = meta?.icon ?? MessageCircleQuestion;
              return (
                <Reveal key={category.name} delay={Math.min(categoryIndex * 0.05, 0.15)}>
                  <div id={meta?.slug} className="grid grid-cols-1 gap-8 scroll-mt-32 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <div className="lg:sticky lg:top-28">
                        <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-[#d9e1d3] bg-white text-[#637b52] shadow-[0_10px_25px_-18px_rgba(32,37,29,0.5)]">
                          <Icon size={19} />
                        </span>
                        <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-[#84977a]">
                          {String(categoryIndex + 1).padStart(2, "0")}
                        </p>
                        <h2 className="mt-2 text-2xl font-medium tracking-[-0.045em] text-[#293326]">{category.name}</h2>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-[#7a8474]">{meta?.blurb}</p>
                        <p className="mt-3 text-xs text-[#9aa294]">
                          {category.items.length} question{category.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="lg:col-span-8">
                      <div className="divide-y divide-[#e2e8db] overflow-hidden rounded-[22px] border border-[#d9e1d3] bg-white shadow-[0_18px_45px_-38px_rgba(32,37,29,0.55)]">
                        {category.items.map((item, itemIndex) => {
                          const key = `${categoryIndex}-${itemIndex}`;
                          return (
                            <FaqRow
                              key={item.q}
                              item={item}
                              id={`faq-${meta?.slug ?? categoryIndex}-${itemIndex}`}
                              isOpen={openKey === key}
                              onToggle={() => setOpenKey(openKey === key ? null : key)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal className="mt-20">
          <div className="relative overflow-hidden rounded-[24px] border border-[#d2ddcc] bg-[#e9eee3] p-8 md:p-10">
            <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#637b52] shadow-[0_10px_25px_-18px_rgba(32,37,29,0.5)] sm:inline-flex">
                  <MessageCircleQuestion size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-medium tracking-[-0.03em] text-[#293326]">Didn&apos;t find your answer?</h2>
                  <p className="mt-1.5 text-sm text-[#667064]">Ask us directly, a human reads every message.</p>
                </div>
              </div>
              <a
                href="/contact"
                className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#20251d] px-8 text-sm font-medium text-white transition hover:bg-[#536445]"
              >
                Contact us
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
