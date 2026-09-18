"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: string };
export type FaqCategory = { name: string; items: FaqItem[] };

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d9e1d3] bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#849d6d]"
      >
        <span className="text-base font-medium tracking-[-0.02em] text-[#293326]">{item.q}</span>
        <span
          className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base transition-transform duration-300 ${
            isOpen ? "rotate-45 bg-[#637b52] text-white" : "bg-[#e9eee3] text-[#637b52]"
          }`}
        >
          +
        </span>
      </button>
      {isOpen ? <p className="px-6 pb-6 pr-12 text-sm leading-6 text-[#667064]">{item.a}</p> : null}
    </div>
  );
}

export function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section className="bg-[#fafaf7] px-6 py-16 md:px-10 md:py-20 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-16">
          {categories.map((category, categoryIndex) => (
            <div key={category.name} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#84977a]">
                    {String(categoryIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.045em] text-[#293326]">{category.name}</h2>
                  <p className="mt-2 text-sm text-[#7a8474]">
                    {category.items.length} question{category.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-2 lg:col-span-8">
                {category.items.map((item, itemIndex) => {
                  const key = `${categoryIndex}-${itemIndex}`;
                  return (
                    <FaqRow
                      key={item.q}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[22px] border border-[#d2ddcc] bg-[#e9eee3] p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-medium tracking-[-0.03em] text-[#293326]">Didn&apos;t find your answer?</h2>
            <p className="mt-1.5 text-sm text-[#667064]">Ask us directly, a human reads every message.</p>
          </div>
          <a
            href="/contact"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[#20251d] px-8 text-sm font-medium text-white transition hover:bg-[#536445]"
          >
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
