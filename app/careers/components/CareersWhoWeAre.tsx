"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function CareersWhoWeAre() {
  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="who-we-are"
      className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
                Who we are
              </span>
              <h2 className="font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
                A company built for extraordinary success.
              </h2>

              {/* Sloth wisdom card */}
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#e9e6dc]">
                  <Image
                    src="/desk_avatar1.png"
                    alt="Pino the mascot"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-black">The Elpino Standard</p>
                  <p className="mt-0.5 text-xs text-black/60">
                    Quiet craft, high-leverage AI, and uncompromising standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col justify-between space-y-8 text-lg leading-relaxed text-black/70 sm:text-xl md:leading-8 lg:col-span-7">
            <div className="space-y-6">
              <p>
                <strong className="font-semibold text-black">
                  Elpino is the Customer Agent company
                </strong>{" "}
                delivering calm, flawless customer experiences — from instant frontline
                resolution to proactive intelligence. Founded to eliminate chaotic,
                repetitive support tickets, today we lead the frontier in agentic AI.
              </p>
              <p>
                We aim to create extraordinary value for both employees and customers by
                tackling work worth trillions across service, sales, and automated customer
                resolution. We want to be a defining AI company — one people point to when
                they tell the story of this era.
              </p>
              <p>
                And we want to continue building a special company culture that shapes careers
                and stays with people long after they leave. We hold an exceptionally high bar,
                but for the particularly ambitious, brilliant, and craft-obsessed, there are
                few better places to work.
              </p>
              <p className="text-base text-black/60 sm:text-lg">
                If you want to work at the company redefining how humans and AI collaborate
                during the most pivotal shift in technology history, we would love to talk.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={scrollToRoles}
                type="button"
                className="group inline-flex cursor-pointer items-center gap-2 text-base font-semibold text-black underline decoration-black/25 underline-offset-8 transition hover:text-[#ff5600] hover:decoration-[#ff5600]"
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
