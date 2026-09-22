"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Cpu, Sparkles, Globe, Compass } from "lucide-react";

export function CareersAmbitionBento() {
  return (
    <section className="relative w-full border-t border-black/10 bg-[#faf9f6] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
            The Long Game
          </span>
          <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
            The ambition that sets us apart.
          </h2>
          <p className="mt-4 text-base text-black/65 sm:text-lg">
            We are not building another incremental SaaS widget. We are constructing the
            autonomous agentic backbone that will power enterprise communication for decades.
          </p>
        </div>

        {/* Bento Grid matching fin.ai */}
        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Card 1: Our Vision (Span 7) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xs transition-all duration-300 hover:border-black/30 hover:shadow-lg lg:col-span-7 lg:p-10">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#f4f3ec] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black/70">
                  <Compass size={13} className="text-[#ff5600]" />
                  Our Vision
                </span>
                <span className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-[#f4f3ec] text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-black group-hover:text-white">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              <h3 className="mt-8 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
                Our vision: an Autonomous AI Customer Agent
              </h3>

              <p className="mt-4 text-base leading-relaxed text-black/70 sm:text-lg">
                Elpino started as a customer support co-pilot, and now we are pursuing the holy
                grail of customer experience — a seamless, personal, concierge experience
                across the entire customer lifecycle, capable of multi-step reasoning, tool execution,
                and instant resolution without human fatigue.
              </p>
            </div>

            <div className="relative mt-8 h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f5ee] to-[#ece7dc] p-4 sm:h-60">
              <Image
                src="/images/heros/rizly-signal-valley-v2.png"
                alt="Elpino autonomous agent architecture"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-medium">Continuous context ingestion</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-md">Sub-400ms latency</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Research (Span 5) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xs transition-all duration-300 hover:border-black/30 hover:shadow-lg lg:col-span-5 lg:p-10">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#f4f3ec] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black/70">
                  <Cpu size={13} className="text-[#ff5600]" />
                  AI Research
                </span>
                <span className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-[#f4f3ec] text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-black group-hover:text-white">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              <h3 className="mt-8 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
                Cutting-edge AI research
              </h3>

              <p className="mt-4 text-base leading-relaxed text-black/70">
                The Elpino AI Group continuously benchmarks and optimizes our agent’s reasoning
                loops through synthetic evaluation, reflection algorithms, and tool-calling
                alignment, publishing our insights freely for the research community.
              </p>
            </div>

            <div className="relative mt-8 h-48 w-full overflow-hidden rounded-2xl bg-[#090e1a] p-4 text-white sm:h-60">
              <Image
                src="/images/blog/learning-sloth.png"
                alt="AI research benchmarking"
                fill
                className="object-contain p-4 opacity-90 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                <span className="font-mono text-[11px]">benchmarks.elpino.ai</span>
                <span className="text-[#ff5600] font-semibold">98.4% Precision</span>
              </div>
            </div>
          </div>

          {/* Card 3: Flagship Events Worldwide (Span 12 Full-width) */}
          <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xs transition-all duration-300 hover:border-black/30 hover:shadow-lg lg:col-span-12 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#f4f3ec] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black/70">
                    <Globe size={13} className="text-[#ff5600]" />
                    Flagship Events
                  </span>
                  <span className="text-xs text-black/50 font-medium">San Francisco · London · Berlin</span>
                </div>

                <h3 className="mt-6 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
                  Hosting flagship events worldwide
                </h3>

                <p className="mt-4 text-base leading-relaxed text-black/70 sm:text-lg">
                  We host flagship summits and intimate salons worldwide — from AI Operator
                  Meetups to builder hackathons — bringing together the engineers, researchers,
                  and founders shaping the future of agentic computing.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1.5 text-xs font-medium text-black">
                    🏛️ AI Operator Salon '26
                  </span>
                  <span className="rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1.5 text-xs font-medium text-black">
                    ⚡ Frontier Hacks SF
                  </span>
                  <span className="rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1.5 text-xs font-medium text-black">
                    🌍 London Demo Day
                  </span>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#f4f3ec] lg:col-span-5">
                <Image
                  src="/images/community-sloths.png"
                  alt="Flagship Elpino community event"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
