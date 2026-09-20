"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Heart, MessageCircle, Sparkles, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PricingFaqSection } from "../components/PricingFaqSection";

const wrap = "mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-20";

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} whileInView={reduced ? undefined : { opacity: [0.35, 1], y: [24, 0] }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function ConversationIllustration() {
  return (
    <div aria-label="A customer question moving from Elpino AI to a human teammate" role="img" className="relative min-h-[430px] overflow-hidden rounded-[32px] bg-[#1687ef] p-6 sm:p-10">
      <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff6547]" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#18c983]" />
      <div className="relative mx-auto max-w-lg">
        <div className="w-[86%] rounded-2xl bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,.45)]">
          <div className="flex items-center gap-2 text-xs text-black/45"><MessageCircle size={14} /> Customer</div>
          <p className="mt-4 text-lg leading-7 tracking-[-0.02em] !text-black">Can I change the email address on my account?</p>
        </div>
        <div className="relative z-10 ml-auto mt-5 w-[88%] rounded-2xl bg-black p-5 text-white shadow-[0_20px_60px_-35px_rgba(0,0,0,.65)]">
          <div className="flex items-center gap-2 text-xs text-[#d9bef4]"><Sparkles size={14} /> Elpino AI · from your knowledge</div>
          <p className="mt-4 text-lg leading-7 tracking-[-0.02em]">Yes. Open Settings, choose Profile, then update your contact email.</p>
          <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/50"><BookOpen size={13} /> Account settings guide <Check size={13} className="ml-auto text-[#d9bef4]" /></div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-black/60"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white"><Users size={16} /></span> A teammate is always close when needed.</div>
      </div>
    </div>
  );
}

export function AboutContent() {
  return (
    <main className="overflow-hidden bg-black font-[family-name:var(--font-rethink-sans)] text-white">
      <section className="border-b border-white/10 py-24 sm:py-32">
        <div className={wrap}>
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em]">About us</p>
            <h1 className="mt-7 text-[clamp(3.1rem,6.2vw,6.3rem)] font-normal leading-[0.93] tracking-[-0.06em]">We’re in business<br />to make help feel<br /><span className="bg-gradient-to-r from-[#ff6547] via-[#8f58df] to-[#1687ef] bg-clip-text text-transparent">more human.</span></h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/60">Elpino gives customers useful answers from the knowledge you already have, then keeps your team close for the moments that need a person.</p>
          </Reveal>
        </div>
      </section>

      <section id="our-story" className="py-24 sm:py-32">
        <div className={wrap}>
          <Reveal className="mb-20 text-left">
            <h2 className="text-4xl font-normal tracking-[-0.05em] sm:text-6xl">Our story starts with a question.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">What if customer support software helped both sides of the conversation—not just the company managing it?</p>
          </Reveal>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal><ConversationIllustration /></Reveal>
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8d65b5]">Where it began</p>
              <h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-6xl">Nobody opens a support chat for fun.</h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-white/60">
                <p>Someone is trying to get something done. Something got in the way. They want a clear answer and to get back to their day.</p>
                <p>On the other side is a team handling familiar questions, scattered information, and more conversations than time. Elpino exists to make that moment easier for everyone.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111] py-24 sm:py-32">
        <div className={wrap}>
          <Reveal className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#18c983]">Built remote</p>
              <h2 className="mt-5 max-w-xl text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-6xl">We’ve been working remotely since day one.</h2>
              <p className="mt-7 max-w-lg text-base leading-8 text-white/60">We work through clear writing, shared context, and focused time. Where someone works matters less than the care and judgment they bring to the product.</p>
              <Link href="/careers" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition hover:bg-[#18c983]">See open roles <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-2">
              <Image
                src="/about-remote-team.png"
                alt="A distributed team collaborating with shared AI support tools"
                width={1456}
                height={1086}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="h-full min-h-[420px] w-full rounded-[26px] object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className={wrap}>
          <Reveal className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#8d65b5] sm:text-base">A small team, for now</p>
              <h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-6xl">Built with focus.<br />Shaped with you.</h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/60 sm:text-xl sm:leading-9">Elpino is early. That means the people using it can still influence what it becomes. We listen closely, ship carefully, and keep the customer’s problem at the center.</p>
              <Link href="/contact" className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-medium text-black transition hover:bg-[#d9bef4]">Talk to us <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" /></Link>
            </div>
            <div className="grid aspect-[4/3] grid-cols-2 gap-3 rounded-[32px] bg-black p-5 sm:p-8">
              <div className="flex flex-col justify-between rounded-2xl bg-[#ff6547] p-6"><MessageCircle size={28} /><p className="text-2xl tracking-[-0.04em]">Listen closely.</p></div>
              <div className="flex flex-col justify-between rounded-2xl bg-[#1687ef] p-6 text-white"><Sparkles size={28} /><p className="text-2xl tracking-[-0.04em]">Build clearly.</p></div>
              <div className="col-span-2 flex items-end justify-between rounded-2xl bg-[#18c983] p-6"><p className="max-w-[14ch] text-3xl leading-tight tracking-[-0.045em]">Make support easier for everyone.</p><Heart size={30} /></div>
            </div>
          </Reveal>
        </div>
      </section>

      <PricingFaqSection />

      <section className="border-t border-white/10 bg-black px-5 py-20 text-center sm:px-8 sm:py-24">
        <Reveal className="mx-auto max-w-4xl"><h2 className="text-4xl font-normal leading-tight tracking-[-0.05em] sm:text-6xl">There’s more to build.<br /><span className="text-[#ff6547]">Come shape what’s next.</span></h2><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/signup" className="inline-flex min-h-13 items-center gap-3 rounded-full bg-[#d9bef4] px-7 text-sm font-medium text-black">Try Elpino <ArrowRight size={16} /></Link><Link href="/careers" className="inline-flex min-h-13 items-center gap-3 rounded-full border border-white/25 px-7 text-sm font-medium text-white">See open roles <ArrowRight size={16} /></Link></div></Reveal>
      </section>
    </main>
  );
}
