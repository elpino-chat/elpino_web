"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, Volume2, Sparkles } from "lucide-react";

export function CareersCeoVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative w-full bg-[#fbfaf8] py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B5CF6]">
              Leadership Note
            </span>
            <h3 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl md:text-5xl">
              Why Elpino, from our CEO and Co-founder
            </h3>
          </div>
          <p className="max-w-md text-sm text-black/60">
            A 4-minute reflection on why small, ambitious teams with high conviction will win the AI era.
          </p>
        </div>

        {/* Video Card Poster */}
        <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl">
          <div className="relative aspect-[16/9] w-full max-h-[640px] overflow-hidden sm:aspect-[21/9]">
            {/* Background image / poster */}
            <Image
              src="/images/heros/hero-vibe.jpg"
              alt="Why Elpino video thumbnail"
              fill
              className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Play button in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Play CEO video message"
                className="group/btn relative flex size-20 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#8B5CF6] hover:text-white sm:size-24"
              >
                <span className="absolute -inset-2 animate-ping rounded-full bg-white/20 duration-1000 group-hover/btn:bg-[#8B5CF6]/30" />
                <Play size={32} className="ml-1 fill-current text-inherit transition-transform group-hover/btn:scale-110" />
              </button>

              <div className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 backdrop-blur-md">
                <Volume2 size={14} className="text-[#8B5CF6]" />
                <span className="text-xs font-medium text-white/90">
                  3:45 min · Founder Vision & Culture
                </span>
              </div>
            </div>

            {/* Bottom quote overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="w-full md:flex-1">
                  <p className="text-lg font-normal leading-snug tracking-tight text-white sm:text-xl lg:text-2xl">
                    &ldquo;I don&apos;t believe in job titles. I just love to build things
                    people love, and help the people building them with me.&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    CEO and Co-founder of Elpino
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(true)}
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  Watch reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Player */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-[#0e131f] text-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#8B5CF6]" />
                <span className="text-sm font-medium">Founder Conversation</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
                <h4 className="text-2xl font-normal text-white sm:text-3xl">
                  Why building Elpino is the most high-conviction bet in AI customer operations.
                </h4>
                <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                  &ldquo;Most software companies in our space are trying to bolt chatbots onto
                  decade-old ticketing databases. At Elpino, we started with a clean slate:
                  what does software look like when an AI agent can read every document, understand
                  human nuance, and resolve 85% of issues end-to-end autonomously?&rdquo;
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
                    Pillar 01
                  </span>
                  <h5 className="mt-2 text-base font-medium">Small, Elite Squads</h5>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    We hire singular craftspeople. A team of 20 builders out-executes legacy orgs of 500.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
                    Pillar 02
                  </span>
                  <h5 className="mt-2 text-base font-medium">Uncompromising Craft</h5>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    We obsess over every transition, token latency, and customer moment.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5CF6]">
                    Pillar 03
                  </span>
                  <h5 className="mt-2 text-base font-medium">Calm Acceleration</h5>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    High speed through clarity and automation, never through burnout or chaos.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#8B5CF6] hover:text-white transition-colors"
                >
                  Continue exploring careers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
