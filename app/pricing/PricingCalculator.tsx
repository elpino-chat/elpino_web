'use client';

import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

export function FairBillingSection() {
  return (
    <section aria-labelledby='fair-billing-title' className='my-12 bg-black px-5 py-16 text-white sm:px-8 lg:px-20'>
      <div>
        <div className='grid border border-white/15 outline outline-1 outline-offset-[18px] outline-white/10 md:grid-cols-2'>
          <div className='border-b border-white/15 p-7 md:border-b-0 md:border-r sm:p-9'>
            <div className='flex flex-wrap items-start justify-between gap-5'><h3 className='text-2xl font-medium tracking-[-0.04em]'>Extra AI resolutions</h3><p className='text-right'><span className='block text-2xl font-medium'>From $0.04</span><span className='text-xs text-white/50'>per extra resolution on Scale</span></p></div>
            <p className='mt-6 max-w-lg text-sm leading-6 text-white/65'>Every plan includes a monthly pool of AI resolutions shared by your workspace. Paid plans price extra resolutions at $0.10 on Starter, $0.06 on Growth, and $0.04 on Scale.</p>
            <Link href='#comparison' className='mt-6 inline-flex items-center gap-4 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20'>Compare allowances <ArrowUpRight size={16} /></Link>
          </div>
          <div className='bg-[radial-gradient(ellipse_at_bottom_right,#2A2740_0%,transparent_65%)] p-7 sm:p-9'>
            <h3 className='text-2xl font-medium tracking-[-0.04em]'>Your AI. Your team. One inbox.</h3>
            <p className='mt-6 max-w-lg text-sm leading-6 text-white/65'>AI answers from your knowledge base. When a conversation needs a person, your team can pick it up with the context intact.</p>
            <Link href='/features' className='mt-6 inline-flex items-center gap-4 rounded-lg bg-[linear-gradient(120deg,#DDEFEA_0%,#EBE5FA_100%)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-105'>Explore how it works <ArrowUpRight size={16} /></Link>
          </div>
        </div>
        <div className='mt-24 grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]'>
          <div><p className='font-mono text-xs uppercase tracking-[0.12em] text-[#DDEFEA]'>Clear, simple billing</p><h2 id='fair-billing-title' className='mt-5 max-w-xl text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-5xl'>A handoff to a human.<br /><span className='text-white/50'>Not another AI charge.</span></h2><p className='mt-6 max-w-xl text-sm leading-7 text-white/70'>You pay for conversations the AI resolves. If it cannot help and hands the conversation to your team, that escalation is never billed as an AI resolution. Extra teammates have a separate, simple price: $1 a month each.</p></div>
          <div className='relative overflow-hidden rounded-[26px] border border-white/15 bg-[#191C18] p-8 sm:p-10'>
            <div aria-hidden='true' className='absolute inset-0 opacity-20 bg-[radial-gradient(#EBE5FA_1px,transparent_1px)] [background-size:12px_12px]' />
            <div className='relative'><span className='inline-flex items-center gap-2 text-sm font-medium'><Check size={17} className='text-[#DDEFEA]' /> Human handoff</span><p className='mt-16 font-mono text-xs uppercase tracking-wider text-white/50'>AI charge per escalation</p><p className='mt-2 text-7xl font-medium tracking-[-0.06em]'>$0<span className='text-white/35'>.00</span></p><p className='mt-4 text-sm text-white/60'>On every plan. Always.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
