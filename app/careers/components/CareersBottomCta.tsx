"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function CareersBottomCta() {
  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-40 md:py-52 2xl:rounded-t-3xl">
      {/* Background imagery with dark overlay */}
      <div className="absolute inset-0 -z-0">
        <Image
          src="/images/heros/hero-vibe.jpg"
          alt="Careers at Elpino"
          fill
          className="object-cover opacity-25 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
          <Sparkles size={13} className="text-[#ff5600]" />
          <span>The Next Chapter Starts Now</span>
        </div>

        <h2 className="mt-8 font-serif text-[clamp(2.75rem,6vw,5.5rem)] font-normal leading-[0.92] tracking-[-0.035em] text-white">
          Now is the time. Take your career to the next level.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
          Join an elite team building autonomous AI customer agents that will define this
          era of computing.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollToRoles}
            type="button"
            className="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-[#ff5600] px-9 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:bg-white hover:text-black active:scale-[0.98]"
          >
            Find your next role
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
