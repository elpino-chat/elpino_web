"use client";

import Link from 'next/link';
import Image from 'next/image';
import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Heart, MessageCircle, Sparkles, Users } from 'lucide-react';
import FAQSection from './FAQSection';

const wrap = 'mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-20';
const title = 'text-[clamp(2.3rem,4.1vw,4.2rem)] font-normal leading-[1.05] tracking-[-0.05em]';
const pill = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#d9bef4] px-6 text-sm font-medium text-black transition hover:bg-[#e5d2f7] focus-visible:outline-2 focus-visible:outline-offset-4';

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} whileInView={reduced ? undefined : { opacity: [0.4, 1], y: [22, 0] }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function Hero() {
  return <section className="about-hero relative overflow-hidden bg-black pb-12 pt-20 text-white sm:pt-28"><div className={wrap}>
    <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
      <Reveal><h1 className="text-[clamp(3.4rem,6.7vw,6.8rem)] font-normal leading-[0.94] tracking-[-0.065em]">A little more help.<br /><span className="font-[family-name:var(--font-instrument-serif)] text-[1.09em] italic text-[#8c6aac]">A lot more human.</span></h1><p className="mt-8 max-w-[39ch] text-base leading-7 text-[#6d7167] sm:text-lg sm:leading-8">We’re building Elpino for the people on both sides of a support conversation. The ones asking for help. And the ones trying to give it.</p><div className="mt-8 flex flex-wrap items-center gap-6"><Link href="#our-story" className={pill}>A little about us <ArrowDown size={16} /></Link><Link href="/features" className="inline-flex items-center gap-2 text-sm underline decoration-black/25 underline-offset-8">Meet the product <ArrowUpRight size={15} /></Link></div></Reveal>
      <Reveal delay={0.15} className="relative mx-auto w-full max-w-[460px] pb-8 pt-5"><div aria-hidden="true" className="absolute inset-x-5 bottom-8 top-10 rounded-t-[220px] rounded-b-3xl bg-[#d9bef4]" /><div aria-hidden="true" className="absolute inset-x-9 bottom-12 top-14 rounded-t-[220px] rounded-b-2xl border border-white/30" />
        <div className="relative ml-2 mr-10 -rotate-3 rounded-2xl border border-[#e1d9e9] bg-white p-5 shadow-[0_14px_35px_-24px_#4f3b65]"><span className="flex items-center gap-2 text-[10px] text-[#8b7a98]"><MessageCircle size={12} /> On the other side of the screen</span><p className="mt-3 text-xl tracking-tight">“Could someone help me with this?”</p></div>
        <div className="relative ml-auto mr-1 mt-5 w-fit rotate-3 rounded-2xl bg-[#171b17] px-6 py-4 text-white shadow-lg"><span className="mr-2 text-[#c7a3ed]">✦</span> That’s where we come in.</div>
        <Image src="/desk_avatar1.png" alt="Elpino’s friendly sloth mascot at a desk" width={600} height={377} priority sizes="(min-width: 1024px) 420px, (min-width: 640px) 460px, 90vw" className="relative mt-3 h-auto w-full" />
        <span className="absolute bottom-1 right-4 rotate-[-5deg] rounded-sm border border-[#e5d69c] bg-[#fff2c8] px-5 py-3 font-[family-name:var(--font-instrument-serif)] text-xl italic text-[#80633e]">Here to make your day easier.</span>
      </Reveal>
    </div>
    <div className="mt-16 grid gap-5 border-t border-black/10 pt-6 text-xs text-[#74786c] sm:grid-cols-3 sm:gap-8">{[[BookOpen, 'Grounded in what you know'], [Users, 'Built around your people'], [Heart, 'Focused on being helpful']].map(([Icon, text]) => { const Mark = Icon as typeof Heart; return <p key={String(text)} className="flex items-center gap-2"><Mark size={15} className="text-[#8c6aac]" />{String(text)}</p>; })}</div>
  </div></section>;
}

function Story() {
  return <section id="our-story" className={`${wrap} scroll-mt-28 py-20 sm:py-28`}><Reveal className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20"><div><p className="text-[10px] uppercase tracking-[0.14em] text-[#8c6aac]">The reason we’re here</p><h2 className="mt-6 max-w-[12ch] text-3xl leading-tight tracking-[-0.04em] sm:text-4xl">Nobody opens a support chat for fun.</h2><div aria-hidden="true" className="mt-8 hidden w-fit rotate-[-8deg] rounded-full border border-[#ded5e7] p-5 text-[#9b80b6] lg:block"><MessageCircle size={33} strokeWidth={1.3} /></div></div><div><p className="max-w-[37ch] text-2xl leading-[1.4] tracking-[-0.035em] sm:text-3xl">They’re trying to do something.<br />Something got in the way.<br /><span className="text-[#8a739d]">They just want to get back to their day.</span></p><div className="mt-8 grid gap-6 text-sm leading-7 text-[#70766a] sm:grid-cols-2"><p>And on the other side is a team trying to help. Often with the same questions, scattered information, and more conversations than time. We think software should make that moment easier for everyone.</p><p>That’s the idea behind Elpino. Let AI handle questions it can answer from your knowledge. Keep your team close for everything else. Bring the conversation and its context into one place.</p></div></div></Reveal></section>;
}

function FounderNote() {
  return <section className="bg-[#edf7ff] py-16 sm:py-24"><div className={wrap}><Reveal className="grid overflow-hidden rounded-[24px] border border-[#b9d9f2] bg-white lg:grid-cols-[0.65fr_1.35fr]"><aside className="relative flex flex-col justify-between overflow-hidden bg-[#171a20] p-8 text-white sm:p-10"><div><p className="text-[10px] uppercase tracking-[0.15em] text-[#bf9fe3]">A note from the founder</p><h2 className="mt-7 text-4xl leading-[1.07] tracking-[-0.045em]">Still early.<br />Already<br /><span className="font-[family-name:var(--font-instrument-serif)] text-5xl italic text-[#ccb0e9]">opinionated.</span></h2></div><div className="mt-12 border-t border-white/15 pt-6"><p className="text-sm font-medium">Unknown</p><p className="mt-1 text-xs text-white/65">Founder &amp; CEO</p><p className="mt-4 max-w-[26ch] text-[11px] leading-6 text-[#cbb4e2]">Identity revealed once we’re funded. Priorities first, introductions later.</p></div></aside><div className="px-6 py-8 sm:p-10 lg:p-12"><p className="font-[family-name:var(--font-instrument-serif)] text-3xl italic text-[#777b6d]">Hello, from a small team.</p><div className="mt-6 space-y-5 text-base leading-8 text-[#676e61]"><p>Elpino is early. We’re a small team building around a simple idea: solving a customer’s problem should be the first priority.</p><p>We care about the everyday details. Can someone find the answer they need? Does the AI know when to ask for help? Can a teammate pick up a conversation without making the customer start over?</p><p>Those questions shape what we build. Answers from your own knowledge. A shared inbox with context. A handoff when a person is needed. Pricing that explains what you’re paying for.</p><p>There’s more to build, and we want the people using Elpino to help shape it. If something could make your support easier, we’d like to hear it.</p></div><blockquote className="my-7 border-l-2 border-[#c4a2e6] pl-5 text-xl leading-8 tracking-[-0.025em] text-[#242920]">“Keep things simple. Focus first on solving what matters.”</blockquote><Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">Write back to us <ArrowUpRight size={15} /></Link></div></Reveal></div></section>;
}

const principles = [
  { title: 'Help is the point.', description: 'A good answer gets someone unstuck. We build around that outcome, from the first question to the moment the conversation is resolved.', note: 'Useful before impressive.', icon: MessageCircle },
  { title: 'Know when to ask.', description: 'AI should use the knowledge you give it and bring in a person when it cannot help. A clear handoff belongs in the product.', note: 'Good judgment includes a handoff.', icon: Users },
  { title: 'Keep the context.', description: 'Your team should see the conversation and understand what the AI checked. Nobody should have to piece the story together from scratch.', note: 'The next reply starts informed.', icon: BookOpen },
  { title: 'Make the terms clear.', description: 'Plans include AI resolutions, additional seats are priced separately, and human handoffs are never billed as AI resolutions.', note: 'Clarity is part of the experience.', icon: Check },
];

function PrincipleArtwork({ kind }: { kind: string }) {
  if (kind === 'help') {
    return <div aria-hidden="true" className="relative mt-8 flex h-28 items-center justify-center">
      <div className="absolute left-[8%] top-1 -rotate-6 rounded-2xl rounded-bl-sm border border-black/10 bg-white/80 px-5 py-3 text-sm shadow-sm">A little stuck…</div>
      <div className="absolute bottom-1 right-[6%] rotate-3 rounded-2xl rounded-br-sm bg-[#27202f] px-5 py-3 text-sm text-white shadow-lg"><Check size={14} className="mr-2 inline text-[#dbc2f4]" /> Let’s figure it out.</div>
    </div>;
  }
  if (kind === 'handoff') {
    return <div aria-hidden="true" className="mt-8 flex h-28 items-center justify-center gap-4">
      <span className="flex size-16 -rotate-6 items-center justify-center rounded-2xl border border-[#ded6c6] bg-white shadow-sm"><Sparkles size={27} className="text-[#9c7aa7]" /></span>
      <span className="relative w-14 border-t border-dashed border-[#ad9d83]"><ArrowRight size={15} className="absolute -right-1 -top-2 text-[#ad9d83]" /></span>
      <span className="flex size-16 rotate-6 items-center justify-center rounded-2xl bg-[#ded5bb] shadow-sm"><Users size={27} className="text-[#756348]" /></span>
    </div>;
  }
  if (kind === 'context') {
    return <div aria-hidden="true" className="relative mx-auto mt-8 flex h-28 w-full max-w-[310px] items-center">
      <div className="absolute inset-x-4 inset-y-2 rotate-[-5deg] rounded-xl border border-white/15 bg-[#343139]" />
      <div className="relative w-full rounded-xl border border-white/25 bg-[#252329] p-4">
        <span className="flex items-center gap-2 text-xs text-[#dac9e7]"><BookOpen size={15} /> The whole conversation</span>
        <div className="mt-4 flex gap-2"><span className="h-1.5 w-1/2 rounded-full bg-[#ae92c0]/55" /><span className="h-1.5 w-1/4 rounded-full bg-white/15" /></div>
        <div className="mt-2 h-1.5 w-2/3 rounded-full bg-white/15" />
      </div>
    </div>;
  }
  return <div aria-hidden="true" className="mx-auto mt-8 w-full max-w-[310px] -rotate-2 rounded-xl border border-[#c6ddea] bg-white/80 p-4 shadow-sm">
    <div className="flex justify-between border-b border-dashed border-[#c6ddea] pb-3 text-xs text-[#59798b]"><span>Human handoff</span><span className="font-medium text-[#283e4b]">$0 AI charge</span></div>
    <div className="flex items-center gap-2 pt-3 text-xs text-[#59798b]"><Check size={13} /> Clear before you commit.</div>
  </div>;
}

function Principles() {
  const styles = [
    { kind: 'help', surface: 'bg-[#dfc7ef] text-[#302239]', muted: 'text-[#67516f]', line: 'border-[#302239]/15', note: 'text-[#6b457f]', label: 'The outcome' },
    { kind: 'handoff', surface: 'bg-[#f5efdf] text-[#342e23]', muted: 'text-[#766953]', line: 'border-[#342e23]/15', note: 'text-[#82704e]', label: 'The judgment' },
    { kind: 'context', surface: 'border border-white/20 bg-[#1d1b21] text-white', muted: 'text-[#b9b1c1]', line: 'border-white/15', note: 'text-[#c7a6df]', label: 'The continuity' },
    { kind: 'clarity', surface: 'bg-[#e5f1f8] text-[#293d4a]', muted: 'text-[#5d7b8e]', line: 'border-[#293d4a]/15', note: 'text-[#53798f]', label: 'The promise' },
  ];
  return (
    <section aria-labelledby="about-principles-title" className="bg-[#111014] py-20 text-white sm:py-28">
      <div className={wrap}>
        <Reveal className="mb-12 grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 text-xs text-[#c3aecf]"><span aria-hidden="true" className="size-1.5 rounded-full bg-[#c9a3e5]" /> What we stand for</p>
            <h2 id="about-principles-title" className={title}>Small decisions.<br /><span className="text-[#d1b0e8]">Strong convictions.</span></h2>
          </div>
          <p className="max-w-[36ch] text-base leading-8 text-[#ada5b5] lg:ml-auto">A simpler product starts with knowing what matters. These beliefs show up in the way Elpino helps, hands over, and earns your trust.</p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 md:items-start lg:gap-7">
          {principles.map((item, index) => {
            const design = styles[index];
            return <Reveal key={item.title} delay={index % 2 * 0.08} className={index % 2 === 1 ? 'md:translate-y-12' : ''}>
              <article className={`group flex h-full flex-col overflow-hidden rounded-[24px] p-6 sm:p-9 ${design.surface}`}>
                <div className={`mb-8 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] ${design.note}`}>
                  <span>{design.label}</span><item.icon size={19} aria-hidden="true" className="transition-transform duration-300 motion-safe:group-hover:-rotate-12" />
                </div>
                <h3 className="text-[30px] font-medium leading-[1.08] tracking-[-0.04em] sm:text-[38px]">{item.title}</h3>
                <p className={`mt-5 max-w-[46ch] text-base leading-8 ${design.muted}`}>{item.description}</p>
                <PrincipleArtwork kind={design.kind} />
                <p className={`mt-7 border-t pt-5 font-[family-name:var(--font-instrument-serif)] text-[24px] italic leading-7 ${design.line} ${design.note}`}>{item.note}</p>
              </article>
            </Reveal>;
          })}
        </div>
        <div className="mt-10 flex items-center justify-center gap-3 text-xs text-[#b8a9c4] md:mt-24">
          <Heart size={14} aria-hidden="true" /><span>Built into the product. Carried into every conversation.</span>
        </div>
      </div>
    </section>
  );
}

function Direction() {
  return <section className={`${wrap} py-20 sm:py-28`}><Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"><div><p className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#8c6aac]">What we’re working toward</p><h2 className={title}>More time for<br />the human part.</h2><p className="mt-6 max-w-[39ch] text-base leading-8 text-[#74796d]">When everyday questions are handled and context stays close, your team has more room for the conversations that need care, judgment, and a person.</p><Link href="/features" className={`${pill} mt-8`}>See what we’re building <ArrowUpRight size={16} /></Link></div><div className="relative rounded-[28px] bg-[#f2eef7] p-6 sm:p-10"><div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8c799b]"><span>A shared conversation</span><Heart size={15} /></div><div className="mt-8 flex items-center justify-center gap-4 sm:gap-8"><div className="text-center"><span className="flex size-20 items-center justify-center rounded-full border border-[#d6c4e8] bg-white text-[#9270b4] sm:size-24"><Sparkles size={35} strokeWidth={1.4} /></span><p className="mt-3 text-xs text-[#72617e]">Elpino AI</p></div><PlusSign /><div className="text-center"><span className="flex size-20 items-center justify-center rounded-full border border-[#d6c4e8] bg-white text-[#9270b4] sm:size-24"><Users size={35} strokeWidth={1.4} /></span><p className="mt-3 text-xs text-[#72617e]">Your people</p></div></div><div className="mt-8 rounded-xl border border-white bg-white/80 px-5 py-5"><p className="text-center text-lg tracking-tight">One helpful next step.</p><p className="mt-2 text-center text-xs leading-6 text-[#8c799b]">The customer stays at the center of it.</p></div></div></Reveal></section>;
}

function PlusSign() { return <span aria-hidden="true" className="pb-7 text-3xl font-light text-[#b7a5c6]">+</span>; }

export function AboutContent() {
  return <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#20251d]"><Hero /><Story /><FounderNote /><Principles /><Direction /><FAQSection /><section className={`${wrap} py-16 sm:py-20`}><Reveal className="flex flex-col items-start justify-between gap-8 rounded-[24px] bg-[#e9eee3] p-7 sm:p-10 lg:flex-row lg:items-center"><div><p className="mb-3 text-xs text-[#78866b]">Built with care. Better with your feedback.</p><h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Come be part of the next chapter.</h2></div><div className="flex shrink-0 flex-wrap gap-3"><Link href="/signup" className={pill}>Try Elpino <ArrowRight size={16} /></Link><Link href="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#758269]/40 px-6 text-sm transition hover:bg-white/50">Say hello <ArrowUpRight size={16} /></Link></div></Reveal></section></div>;
}
