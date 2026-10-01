'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type T = (key: string, defaultValue?: string) => string;

// How the bill works, in three plain cards: the monthly AI credit, the free handoff, and the shared inbox.
// Same quiet style as the rest of the pricing page: thin outlines, 10px corners, blue and green only as accents.
const card = 'group flex min-h-80 flex-col rounded-[10px] border border-black/40 bg-white p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8';
const link = 'group/link mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#0078f4] underline decoration-1 underline-offset-4 hover:opacity-80';

export function FairBillingSection({ t }: { t: T }) {
  return (
    <section aria-labelledby='fair-billing-title' className='bg-white px-5 py-20 text-[#11120f] sm:px-8 lg:px-20 lg:py-24'>
      <div className='mx-auto max-w-[1500px]'>
        <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end'>
          <h2 id='fair-billing-title' className='text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl'>
            {t('pricing.billing.titleLine1', 'Pay for what the AI does.')}<br />
            {t('pricing.billing.titleLine2', 'Not for handoffs.')}
          </h2>
          <p className='max-w-2xl text-base leading-7 text-black/60 lg:justify-self-end'>{t('pricing.billing.subtitle', 'Free includes 100 AI messages a month. Paid plans include a monthly AI credit that covers as many conversations as it can, so a quick question costs less than a long back-and-forth. Handing a conversation to your team is always free.')}</p>
        </div>

        <div className='mt-12 grid gap-6 md:grid-cols-3'>
          {/* Credit */}
          <article className={card}>
            <p className='text-[13px] font-medium text-black/55'>{t('pricing.billing.creditCard.label', 'Monthly AI credit')}</p>
            <p className='mt-5 text-6xl font-normal tracking-[-0.055em]'>{t('pricing.billing.creditCard.amount', 'From $7')}</p>
            <p className='mt-2 text-sm text-black/55'>{t('pricing.billing.creditCard.note', 'every month on Starter')}</p>
            {/* The credit is spent by conversations, then refilled for the new month. */}
            <div className='mt-6' aria-hidden='true'>
              <div className='h-2 overflow-hidden rounded-full bg-black/10'>
                <div className='h-full animate-[elpino-drain_8s_ease-in-out_infinite] rounded-full bg-[#0078f4]' />
              </div>
              <div className='mt-2 flex justify-between text-[11.5px] text-black/45'>
                <span>{t('pricing.billing.creditCard.chatsUseCredit', 'chats use credit')}</span>
                <span>{t('pricing.billing.creditCard.refillsMonthly', 'refills monthly')}</span>
              </div>
            </div>
            <p className='mt-auto pt-10 text-sm leading-6 text-black/65'>{t('pricing.billing.creditCard.desc', 'Starter includes $7, Growth $40 and Scale $240 of AI credit each month. Need more? Top up any time or turn on auto-recharge.')}</p>
            <Link href='#comparison' className={link}>
              {t('pricing.billing.creditCard.cta', 'Compare plans')} <ArrowUpRight size={16} className='transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5' />
            </Link>
          </article>

          {/* $0 handoff */}
          <article className={`${card} relative overflow-hidden`}>
            <div className='relative h-16' aria-hidden='true'>
              <span className='absolute left-0 top-1 inline-block animate-[elpino-stamp_6s_ease-in_infinite] rounded-md border-2 border-[#1aa37a] px-3 py-1.5 font-mono text-[12.5px] font-bold uppercase tracking-[0.14em] text-[#1aa37a]'>
                {t('pricing.billing.handoffCard.stamp', 'Handoff = free')}
              </span>
            </div>
            <p className='mt-auto pt-8 text-[13px] font-medium text-black/55'>{t('pricing.billing.handoffCard.label', 'Extra charge per handoff')}</p>
            <p className='mt-2 text-7xl font-normal tracking-[-0.07em]'>$0.00</p>
            <p className='mt-3 text-sm text-black/55'>{t('pricing.billing.handoffCard.note', 'On every plan. Always.')}</p>
          </article>

          {/* One conversation */}
          <article className={card}>
            <div className='flex h-12 items-center' aria-hidden='true'>
              <span className='flex h-12 w-12 animate-[elpino-merge-left_5s_ease-in-out_infinite] items-center justify-center rounded-full border border-black/40 bg-white text-[13px] font-bold'>AI</span>
              <span className='-ml-3 flex h-12 w-12 animate-[elpino-merge-right_5s_ease-in-out_infinite] items-center justify-center rounded-full bg-[#0078f4] text-[16px] font-bold text-white'>P</span>
            </div>
            <h3 className='mt-6 text-3xl font-normal leading-tight tracking-[-0.04em]'>{t('pricing.billing.inboxCard.title', 'Your AI and your team, in one inbox.')}</h3>
            <p className='mt-auto pt-8 text-sm leading-6 text-black/65'>{t('pricing.billing.inboxCard.desc', 'AI answers from your knowledge. When a person is needed, your team continues with the full conversation already in view.')}</p>
            <Link href='/features' className={link}>
              {t('pricing.billing.inboxCard.cta', 'Explore how it works')} <ArrowUpRight size={16} className='transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5' />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
