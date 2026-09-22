"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";

type ValueItem = {
  id: string;
  title: string;
  shortTagline: string;
  description: string;
  slothNote: string;
  slothImage: string;
  slothAlt: string;
};

const values: ValueItem[] = [
  {
    id: "success-first",
    title: "Success First",
    shortTagline: "Shareholder & customer value driven by incredible execution.",
    description:
      "Our north star is customer and shareholder value. We believe we will create that through incredible work. And we believe we will achieve that through an unyielding, high-trust culture. We play to win the defining category of our generation.",
    slothNote: "Focus on outcomes that genuinely matter. Everything else is distraction.",
    slothImage: "/images/founders-sloth.png",
    slothAlt: "Elpino team celebrating real milestones",
  },
  {
    id: "high-standards",
    title: "Incredibly High Standards",
    shortTagline: "Aspire to true greatness; demand the best of ourselves.",
    description:
      "We aspire to true greatness. We demand the very best of ourselves, and of those we work with. We aim for very-best-in-class work with everything we do—from distributed infra latency to every punctuation mark in our copy.",
    slothNote: "Craft takes deliberation. We don't ship sloppiness.",
    slothImage: "/slotpointing.png",
    slothAlt: "Sloth inspecting every detail with precision",
  },
  {
    id: "open-mindedness",
    title: "Open Mindedness",
    shortTagline: "Independent thinkers who question conventions.",
    description:
      "We want independent thinkers. We will question the status quo in order to eliminate blind spots and increase our freedom to maneuver and innovate. The AI landscape reinvents itself monthly; dogmatism is fatal.",
    slothNote: "Hold strong opinions loosely. Learn in public.",
    slothImage: "/images/blog/learning-sloth.png",
    slothAlt: "Sloth reading and absorbing fresh research",
  },
  {
    id: "resilience",
    title: "Resilience",
    shortTagline: "Rise above tension; adapt rapidly to ambitious goals.",
    description:
      "We will exhibit great maturity and rise above tension that disrupts our work and distracts us from our goals. We will show a high degree of adaptability and hunger for change. When things break or shift, we fix them calmly.",
    slothNote: "Calm in high seas. When systems shake, we remain centered.",
    slothImage: "/images/trust-sloth.png",
    slothAlt: "Sloth standing resilient and steady",
  },
  {
    id: "impatience",
    title: "Impatience",
    shortTagline: "Move fast via smart work, automation, and tight loops.",
    description:
      "52 weeks is not a long amount of time. We need everything done today, this week, this month. We move fast via hard work and smart work. We automate the repetitive so humans can sprint on frontier breakthroughs.",
    slothNote: "High speed doesn't mean frantic rush. It means zero drag.",
    slothImage: "/images/busy-teams-sloth.png",
    slothAlt: "Sloth flying across multi-monitor setup",
  },
  {
    id: "positive-optimistic",
    title: "Positive and Optimistic",
    shortTagline: "Bold optimism is the fuel for doing very hard things.",
    description:
      "Negativity and pessimism make all things harder. The opposite is how you achieve very hard things. We need people who are on board with and bullish about our vision, who bring high energy and relentless optimism to their teams.",
    slothNote: "Good vibes make hard engineering problems solvable.",
    slothImage: "/desk_avatar1.png",
    slothAlt: "Pino radiating warmth and positive energy",
  },
  {
    id: "customer-obsessed",
    title: "Customer Obsessed",
    shortTagline: "Walk the walk: deliver magical support to our customers.",
    description:
      "Our purpose is to help our customers deliver incredible customer service to theirs. We must walk the walk and do that with our customers too. Every engineer talks to users; every product decision starts with real customer pain.",
    slothNote: "Put on the headset. Understand what customers feel.",
    slothImage: "/images/contact-support-sloth.png",
    slothAlt: "Sloth listening attentively on customer support",
  },
];

export function CareersValues() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? -1 : index);
  }

  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 pb-12 sm:flex-row sm:items-end sm:pb-16 border-b border-black/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Our Culture & Ethos
            </span>
            <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
              The values that make great work possible.
            </h2>
          </div>
          <p className="max-w-md text-base text-black/60 sm:text-lg">
            Principles honed over millions of interactions. Not empty poster slogans, but
            how we make hard tradeoffs every day.
          </p>
        </div>

        {/* Values Accordion & Active Illustration Preview */}
        <div className="grid gap-12 pt-8 lg:grid-cols-12 lg:gap-16">
          {/* Left: Accordion list (7 columns) */}
          <div className="divide-y divide-black/10 lg:col-span-7">
            {values.map((v, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={v.id} className="py-5 sm:py-6 transition-colors duration-200">
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 text-left group"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span className="font-mono text-sm font-semibold text-black/40 group-hover:text-[#ff5600] transition-colors">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="font-serif text-2xl font-normal tracking-tight text-black transition group-hover:text-[#ff5600] sm:text-3xl">
                          {v.title}
                        </h3>
                        <p className="mt-1 text-xs text-black/55 sm:text-sm">
                          {v.shortTagline}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#faf9f6] text-black transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-black text-white" : "group-hover:border-black"
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {/* Expanded description */}
                  {isOpen && (
                    <div className="pt-5 pl-10 pr-4 sm:pl-12 animate-in fade-in duration-300">
                      <p className="text-base leading-relaxed text-black/75 sm:text-lg">
                        {v.description}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#faf9f6] px-3 py-1.5 text-xs font-medium text-black/70">
                        <span className="text-sm">🦥</span>
                        <span>{v.slothNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Dynamic Mascot Showcase for Active Value (5 columns) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-32 rounded-3xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm">
              {openIndex >= 0 && openIndex < values.length ? (
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-inner">
                    <Image
                      src={values[openIndex].slothImage}
                      alt={values[openIndex].slothAlt}
                      fill
                      className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="mt-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
                      Value in Action · 0{openIndex + 1}
                    </span>
                    <h4 className="mt-1 font-serif text-2xl font-normal text-black">
                      {values[openIndex].title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">
                      &ldquo;{values[openIndex].slothNote}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center text-center text-black/50">
                  <p>Click any value on the left to explore its culture principle.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom role CTA link */}
        <div className="mt-12 flex justify-center border-t border-black/10 pt-10">
          <button
            onClick={scrollToRoles}
            type="button"
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5600]"
          >
            See 8 open roles aligning with our values
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
