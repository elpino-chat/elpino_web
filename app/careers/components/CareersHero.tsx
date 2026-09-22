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
    <section className="relative w-full overflow-hidden bg-white pt-24 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-28">
      {/* Subtle ambient gradient mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#fff3eb] via-[#faf7f2] to-[#f4f3ec] opacity-70 blur-3xl"
      />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f5f0] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/75 shadow-xs transition hover:bg-black/5">
            <span className="inline-block size-2 animate-pulse rounded-full bg-[#ff5600]" />
            <span>Careers at Elpino · We are hiring</span>
          </div>

          {/* Monumental Editorial Headline matching fin.ai */}
          <h1 className="mt-8 font-serif text-[clamp(2.75rem,6.8vw,6.5rem)] font-normal leading-[0.92] tracking-[-0.035em] text-[#0c1017]">
            Join the team defining the AI era of customer experience
          </h1>

          {/* Subtitle */}
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-black/65 sm:text-xl md:leading-8">
            Elpino is building autonomous customer agents that resolve complex support
            queries with superhuman craft, unyielding trust, and calm precision.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={scrollToRoles}
              type="button"
              className="inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-8 text-sm font-semibold tracking-tight text-white transition-all duration-200 hover:bg-[#ff5600] hover:shadow-lg active:scale-[0.98]"
            >
              See 8 open roles
              <ArrowDown size={16} />
            </button>

            <a
              href="#who-we-are"
              className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-medium tracking-tight text-black transition-colors hover:border-black hover:bg-black/5"
            >
              Learn about our culture
            </a>
          </div>

          {/* Metric chips */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 border-t border-black/10 pt-8 text-xs font-medium uppercase tracking-[0.12em] text-black/50 sm:gap-12">
            <div>
              <span className="font-semibold text-black">100%</span> Remote-Friendly
            </div>
            <div className="hidden sm:block">·</div>
            <div>
              <span className="font-semibold text-black">6</span> Global Hubs
            </div>
            <div className="hidden sm:block">·</div>
            <div>
              <span className="font-semibold text-black">Tier-1</span> Equity & Benefits
            </div>
            <div className="hidden sm:block">·</div>
            <div>
              <span className="font-semibold text-black">Zero</span> Bureaucracy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
