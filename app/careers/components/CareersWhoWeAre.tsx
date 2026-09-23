"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CareersWhoWeAre() {
  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="who-we-are"
      className="relative w-full border-t border-black/10 bg-[#f7f5f1] py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left column */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 space-y-6 text-left">
              <span className="text-4xl font-semibold uppercase tracking-[0.16em] text-black">
                Who we are
              </span>
              <h2 className="mt-4 text-xl font-normal leading-relaxed text-black/70">
                Honestly? We&apos;re a little lazy. That&apos;s why we built AI agents that answer instantly at 3am, so we don&apos;t have to. Call it laziness. Haha.
              </h2>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col justify-between space-y-8 text-lg leading-relaxed text-black/70 sm:text-xl md:leading-8 lg:w-2/3">
            <div className="space-y-6">
              <p>
                <strong className="font-semibold text-black">
                  Support sucks when it&apos;s slow, robotic, or both.
                </strong>{" "}
                So we built agents that actually resolve things: instantly, calmly,
                correctly, instead of shuffling tickets around. No chatbot theater, no
                &quot;let me transfer you.&quot; Just answers.
              </p>
              <p>
                Every company with customers has this problem, and it&apos;s worth trillions
                to fix. We&apos;re not chasing another AI trend. We want to build something
                people genuinely love using, the way you talk about the handful of tools you
                actually enjoy opening.
              </p>
              <p>
                That takes an unusually high bar. Not &quot;we work hard&quot; high, but
                &quot;we sweat the details nobody else would bother with&quot; high. Do that
                for long enough, alongside people who push you, and you end up building a
                career (and a company) worth talking about for years after.
              </p>
              <p className="text-base text-black/60 sm:text-lg">
                If you want to help write the story of this era instead of just reading about
                it, we&apos;d love to talk.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={scrollToRoles}
                type="button"
                className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-black underline decoration-black/25 underline-offset-8 transition hover:text-[#2F8CF0] hover:decoration-[#2F8CF0]"
              >
                Explore all open roles
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
