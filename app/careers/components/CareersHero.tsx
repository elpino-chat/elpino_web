"use client";

import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";

export function CareersHero() {
  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#241013] pt-24 pb-16 md:pt-24 md:pb-24 lg:pt-24 lg:pb-28">
      {/* Subtle ambient gradient mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#3a1a1f] via-[#2c1418] to-[#241013] opacity-70 blur-3xl"
      />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="flex max-w-5xl flex-col items-start text-left">
          {/* Monumental Editorial Headline matching fin.ai */}
          <h1 className="text-[clamp(2.25rem,5.5vw,5rem)] font-normal leading-[0.92] tracking-[-0.035em] text-white">
            Defining the AI era of customer experience
          </h1>

          {/* Subtitle */}
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl md:leading-8">
            AI agents that resolve support end-to-end, with craft, trust, and calm precision built into every conversation.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-start gap-4">
            <button
              onClick={scrollToRoles}
              type="button"
              className="inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-8 text-xl font-normal tracking-tight text-black transition-all duration-200 hover:bg-[#ff5600] hover:text-white hover:shadow-lg active:scale-[0.98]"
            >
              Open roles
              <ArrowDown size={16} />
            </button>

            <a
              href="#who-we-are"
              className="inline-flex h-13 items-center justify-center rounded-full border-2 border-white/100 bg-transparent px-7 text-xl font-normal tracking-tight text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              Learn about our culture
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
