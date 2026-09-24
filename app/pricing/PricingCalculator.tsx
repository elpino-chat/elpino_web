'use client';

import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

export function FairBillingSection() {
  return (
    <section aria-labelledby='fair-billing-title' className='bg-white px-5 py-20 text-black sm:px-8 lg:px-20 lg:py-28'>
      <div className='mx-auto max-w-[1500px]'>
        <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end'>
          <div>
            <p className='text-xs font-medium uppercase tracking-[0.16em] text-[#7c5ea0]'>Clear, simple billing</p>
            <h2 id='fair-billing-title' className='mt-4 text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-5xl'>Pay for what the AI does.<br /><span className='text-black/40'>Not for handoffs.</span></h2>
          </div>
          <p className='max-w-2xl text-base leading-7 text-black/60 lg:justify-self-end'>Free includes 50 AI conversations a month. Paid plans include a monthly AI credit that covers as many conversations as it can, so a quick question costs less than a long one. When your team takes over, the handoff itself stays free and every message arrives with its context intact.</p>
        </div>

        <div className='mt-12 grid overflow-hidden rounded-3xl border border-black/10 md:grid-cols-3'>
          <article className='flex min-h-80 flex-col border-b border-black/10 p-7 md:border-b-0 md:border-r sm:p-9'>
            <p className='text-sm text-black/50'>Monthly AI credit</p>
            <p className='mt-5 text-5xl font-normal tracking-[-0.055em]'>From $7</p>
            <p className='mt-2 text-sm text-black/50'>every month on Starter</p>
            <p className='mt-auto pt-10 text-sm leading-6 text-black/65'>Starter includes $7, Growth $40 and Scale $240 of AI credit each month, roughly 140, 800 and 4,800 conversations. Need more? Top up any time or turn on auto-recharge.</p>
            <Link href='#comparison' className='group mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-black'>Compare plans <ArrowUpRight size={16} className='transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' /></Link>
          </article>

          <article className='relative flex min-h-80 flex-col overflow-hidden border-b border-black/10 bg-[#d9bef4] p-7 text-black md:border-b-0 md:border-r sm:p-9'>
            <div aria-hidden='true' className='absolute -right-16 -top-16 h-48 w-48 rounded-full border border-black/10' />
            <span className='relative inline-flex items-center gap-2 text-sm font-medium'><Check size={17} /> Human handoff</span>
            <p className='relative mt-auto pt-12 text-xs uppercase tracking-[0.12em] text-black/55'>Extra charge per handoff</p>
            <p className='relative mt-2 text-7xl font-normal tracking-[-0.07em]'>$0.00</p>
            <p className='relative mt-3 text-sm text-black/60'>On every plan. Always.</p>
          </article>

          <article className='flex min-h-80 flex-col p-7 sm:p-9'>
            <p className='text-sm text-black/50'>One continuous conversation</p>
            <h3 className='mt-5 text-3xl font-normal leading-tight tracking-[-0.045em]'>Your AI and your team, in one inbox.</h3>
            <p className='mt-auto pt-10 text-sm leading-6 text-black/65'>AI answers from your knowledge. When a person is needed, your team continues with the full conversation already in view.</p>
            <Link href='/features' className='group mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-black'>Explore how it works <ArrowUpRight size={16} className='transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' /></Link>
          </article>
        </div>
      </div>
    </section>
  );
}
