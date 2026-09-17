'use client';

import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

export function FairBillingSection() {
  return (
    <section aria-labelledby='fair-billing-title' className='bg-black px-5 py-20 text-white sm:px-8 lg:px-20 lg:py-28'>
      <div className='mx-auto max-w-[1500px]'>
        <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end'>
          <div>
            <p className='text-xs font-medium uppercase tracking-[0.16em] text-[#d9bef4]'>Clear, simple billing</p>
            <h2 id='fair-billing-title' className='mt-4 text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-5xl'>Pay for answers.<br /><span className='text-white/45'>Not handoffs.</span></h2>
          </div>
          <p className='max-w-2xl text-base leading-7 text-white/60 lg:justify-self-end'>Elpino only counts conversations the AI resolves. When your team takes over, the handoff stays free and every message arrives with its context intact.</p>
        </div>

        <div className='mt-12 grid overflow-hidden rounded-3xl border border-white/15 md:grid-cols-3'>
          <article className='flex min-h-80 flex-col border-b border-white/15 p-7 md:border-b-0 md:border-r sm:p-9'>
            <p className='text-sm text-white/50'>Extra AI resolutions</p>
            <p className='mt-5 text-5xl font-normal tracking-[-0.055em]'>From $0.04</p>
            <p className='mt-2 text-sm text-white/50'>per resolution on Scale</p>
            <p className='mt-auto pt-10 text-sm leading-6 text-white/65'>Starter is $0.10, Growth is $0.06, and Scale is $0.04 for each resolution beyond the included allowance.</p>
            <Link href='#comparison' className='group mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-white'>Compare plans <ArrowUpRight size={16} className='transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' /></Link>
          </article>

          <article className='relative flex min-h-80 flex-col overflow-hidden border-b border-white/15 bg-[#d9bef4] p-7 text-black md:border-b-0 md:border-r sm:p-9'>
            <div aria-hidden='true' className='absolute -right-16 -top-16 h-48 w-48 rounded-full border border-black/10' />
            <span className='relative inline-flex items-center gap-2 text-sm font-medium'><Check size={17} /> Human handoff</span>
            <p className='relative mt-auto pt-12 text-xs uppercase tracking-[0.12em] text-black/55'>AI charge per handoff</p>
            <p className='relative mt-2 text-7xl font-normal tracking-[-0.07em]'>$0.00</p>
            <p className='relative mt-3 text-sm text-black/60'>On every plan. Always.</p>
          </article>

          <article className='flex min-h-80 flex-col p-7 sm:p-9'>
            <p className='text-sm text-white/50'>One continuous conversation</p>
            <h3 className='mt-5 text-3xl font-normal leading-tight tracking-[-0.045em]'>Your AI and your team, in one inbox.</h3>
            <p className='mt-auto pt-10 text-sm leading-6 text-white/65'>AI answers from your knowledge. When a person is needed, your team continues with the full conversation already in view.</p>
            <Link href='/features' className='group mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-white'>Explore how it works <ArrowUpRight size={16} className='transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' /></Link>
          </article>
        </div>
      </div>
    </section>
  );
}
