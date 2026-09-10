"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    q: "Does the AI reply without a human checking?",
    a: "The AI answers instantly using your knowledge base and past conversations. If it's not confident, or a customer asks for a person, it hands the conversation off to your team instead of guessing.",
  },
  {
    q: "What happens if the AI can't solve it?",
    a: "It hands the conversation off to a real teammate with full context, so your customer never has to repeat themselves. You can also jump into any conversation yourself, anytime.",
  },
  {
    q: "Which channels can I support customers on?",
    a: "A website chat widget and a shared email inbox today, with more channels on the way. Every conversation lands in one place for your team.",
  },
  {
    q: "What happens if I go over my AI budget?",
    a: "You get a warning at 80% of your plan's budget. At 100%, the AI pauses auto-replies and routes new conversations straight to your team, no surprise overage charge.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from the dashboard with no lock-in. Cancellation takes effect at the end of the current billing period, so you keep everything you paid for.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-black/10 bg-white px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-3xl">
        <span className="mb-5 block text-[11px] font-normal uppercase tracking-[0.18em] text-gray-500">
          FAQ
        </span>
        <h2 className="text-3xl font-normal leading-tight tracking-tight text-black [text-wrap:balance] md:text-5xl">
          Questions worth answering up front.
        </h2>

        <div className="mt-12 space-y-2">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="overflow-hidden rounded-2xl bg-[#f7f7f6]">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                >
                  <span className="text-base font-normal text-black md:text-lg">{item.q}</span>
                  <span
                    className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base transition-transform duration-300 ${
                      isOpen ? "rotate-45 bg-[#233D4D] text-white" : "bg-white text-black"
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <p className="px-6 pb-6 pr-12 text-sm leading-relaxed text-gray-600 md:text-base">{item.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] pt-8">
          <p className="text-sm text-gray-500">Still curious? There&apos;s a longer list.</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href="/faq" className="text-sm text-gray-600 transition hover:text-black">
              Read all FAQs &rarr;
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 transition hover:text-black">
              Ask us directly &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
