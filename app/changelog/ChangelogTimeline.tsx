"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const releases = [
  { date: "July 01, 2026", shortDate: "Jul 2026", type: "AI answers", title: "Clearer answer trails", text: "Every AI answer now carries a simpler trail of the knowledge checked along the way, so your team can quickly see the source behind a reply.", highlights: ["Source trail beside every AI reply", "Faster review before a handoff", "A cleaner view of answer confidence"], tone: "lavender" },
  { date: "June 24, 2026", shortDate: "Jun 2026", type: "Inbox", title: "A calmer way to hand off", text: "When a conversation needs a person, Elpino now sends the customer context and reason for the handoff straight into your shared inbox.", highlights: ["Customer history stays attached", "Clear handoff reason at a glance", "Less catching up for your team"], tone: "blue" },
  { date: "June 17, 2026", shortDate: "Jun 2026", type: "Knowledge base", title: "Smarter content readiness", text: "Website pages, help articles, and uploaded documents are easier to review before they become part of your agent’s knowledge.", highlights: ["A clearer review state", "Better visibility into indexed content", "More control before publishing"], tone: "sage" },
  { date: "June 10, 2026", shortDate: "Jun 2026", type: "Customer context", title: "More useful visitor details", text: "Location, device, page, and conversation history now sit closer to every open conversation, helping your team understand the moment faster.", highlights: ["Context grouped in one view", "Page and device details nearby", "Quicker first replies"], tone: "sand" },
];

const foundations = [["v1.0", "The support workspace", "AI answers, shared inbox, and human handoff in one place.", "May 2026"], ["v0.8", "Knowledge that works", "Bring website pages, articles, and documents together for your agent.", "Mar 2026"], ["v0.5", "Conversations, connected", "A simpler shared inbox for keeping every customer conversation moving.", "Jan 2026"]];
const tones = { lavender: "border-[#d9c8f0] bg-[#f4effb] text-[#694d8b]", blue: "border-[#bdd8ef] bg-[#edf7ff] text-[#356887]", sage: "border-[#c9dbbf] bg-[#f1f7ed] text-[#496447]", sand: "border-[#f0d5b7] bg-[#fff3e5] text-[#956840]" };

export function ChangelogTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [timelineHeight, setTimelineHeight] = useState(0);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const measure = () => setTimelineHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 12%", "end 55%"] });
  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, timelineHeight]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <main className="overflow-hidden bg-[#fcfcfa] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      <section className="relative border-b border-[#17181c]/10 bg-[#f2f4ed] px-5 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-36 lg:px-16">
        <div aria-hidden className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(35,61,77,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div aria-hidden className="absolute -right-40 top-0 size-[36rem] rounded-full bg-[#e4d8f3]/65 blur-3xl" />
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto max-w-6xl">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c416f]"><span className="h-px w-8 bg-current" /> Product changelog</p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-7xl">A little better,<br /><span className="text-[#7651b0]">every release.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#4b504b] sm:text-xl">A living record of the small, thoughtful improvements we make to help teams support customers well.</p>
            </div>
            <div className="relative min-h-44 rounded-3xl border border-[#17181c]/10 bg-white/75 p-6 shadow-[0_20px_55px_-40px_rgba(23,24,28,0.65)] backdrop-blur-sm">
              <Image src="/images/changelog-sloth.png" alt="" width={1214} height={1295} className="pointer-events-none absolute -right-8 -top-24 w-36 rotate-6 drop-shadow-xl" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7651b0]">Latest release</p>
              <p className="mt-3 max-w-[12rem] text-xl font-medium tracking-[-0.04em]">Clearer answer trails</p>
              <a href="#latest" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#293f4e] hover:text-[#7651b0]">Explore updates <ArrowDownRight size={16} /></a>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="latest" className="scroll-mt-[calc(var(--elpino-header-h,64px)+1.5rem)] px-5 py-20 sm:px-8 md:py-28 lg:px-16">
        <div ref={containerRef} className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl md:mb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7651b0]">Latest updates</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">Follow the thread.</h2>
            <p className="mt-4 text-base leading-7 text-black/55">New work, in the order it shipped. Scroll to trace the line through every change.</p>
          </div>

          <div ref={timelineRef} className="relative">
            {releases.map((release, index) => (
              <div key={release.title} className="flex justify-start pt-10 first:pt-0 md:gap-10 md:pt-40">
                <div className="sticky top-[calc(var(--elpino-header-h,64px)+6.5rem)] z-40 flex h-fit w-full max-w-xs items-start self-start lg:max-w-sm">
                  <div aria-hidden className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-[#fcfcfa]">
                    <div className="size-4 rounded-full border border-[#cbb2ee] bg-[#e9dcf8] shadow-[0_0_0_3px_rgba(252,252,250,1)]" />
                  </div>
                  <div className="hidden pl-20 md:block">
                    <h3 className="text-4xl font-semibold tracking-[-0.045em] text-[#7651b0]/45 lg:text-5xl">{release.shortDate}</h3>
                    <p className="mt-2 text-xs text-black/40">{release.date}</p>
                    {index === 0 && <span className="mt-4 inline-flex rounded-full bg-[#233d4d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white">New</span>}
                  </div>
                </div>

                <div className="relative w-full pl-20 pr-2 md:pl-4 md:pr-6 lg:pr-10">
                  <div className="mb-5 md:hidden">
                    <h3 className="text-2xl font-semibold tracking-[-0.045em] text-[#7651b0]/60">{release.shortDate}</h3>
                    <p className="mt-1 text-xs text-black/45">{release.date}</p>
                    {index === 0 && <span className="mt-3 inline-flex rounded-full bg-[#233d4d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white">New</span>}
                  </div>
                  <motion.article
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[42rem] rounded-3xl border border-[#17181c]/10 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(23,24,28,0.55)] sm:p-9"
                  >
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${tones[release.tone as keyof typeof tones]}`}>{release.type}</span>
                    <h4 className="mt-5 text-3xl font-medium tracking-[-0.055em] sm:text-4xl">{release.title}</h4>
                    <p className="mt-4 max-w-xl text-base leading-7 text-black/60">{release.text}</p>
                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {release.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2 text-sm leading-5 text-[#3f4942]">
                          <Check size={15} className="mt-0.5 shrink-0 text-[#7651b0]" strokeWidth={2.5} />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                </div>
              </div>
            ))}

            <div
              aria-hidden
              style={{ height: timelineHeight }}
              className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,rgba(27,44,53,0),rgba(27,44,53,0.16)_6%,rgba(27,44,53,0.16)_94%,rgba(27,44,53,0))] [mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]"
            >
              <motion.div
                style={{ height: reducedMotion ? timelineHeight : beamHeight, opacity: reducedMotion ? 1 : beamOpacity }}
                className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-[linear-gradient(to_top,#7651b0_0%,#428ce5_14%,rgba(66,140,229,0)_70%)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#17181c]/10 bg-[#eef6eb] px-5 py-20 sm:px-8 md:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#496447]">Earlier chapters</p>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="text-4xl font-medium tracking-[-0.055em] sm:text-5xl">The foundation.</h2>
            <p className="max-w-sm text-sm leading-6 text-black/55">The releases that shaped the support workspace Elpino is becoming.</p>
          </div>
          <div className="mt-12 grid border-l border-t border-[#17181c]/10 md:grid-cols-3">
            {foundations.map(([version, title, text, date]) => (
              <article key={version} className="border-b border-r border-[#17181c]/10 p-7 sm:p-8">
                <p className="text-sm font-semibold text-[#7651b0]">{version}</p>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.045em]">{title}</h3>
                <p className="mt-4 min-h-14 text-sm leading-6 text-black/55">{text}</p>
                <time className="mt-8 block text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">{date}</time>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#192016] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]"><Sparkles size={14} /> Help shape what’s next</p>
            <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.06em] sm:text-5xl">Have an idea for a better customer conversation?</h2>
            <p className="mt-5 text-base leading-7 text-white/60">We’d love to hear where your support workflow could feel easier.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#d9bef4] px-6 text-sm font-semibold text-[#231c29] transition hover:bg-white">Share feedback <ArrowUpRight size={16} /></Link>
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium transition hover:border-white hover:bg-white/10">Try Elpino free</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
