'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type T = (key: string, defaultValue?: string) => string;

export function FairBillingSection({ t }: { t: T }) {
  return (
    <section aria-labelledby='fair-billing-title' className='bg-white px-5 py-20 text-[#11120f] sm:px-8 lg:px-20 lg:py-28'>
      <div className='mx-auto max-w-[1500px]'>
        <div className='grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end'>
          <div>
            <p className='font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#3784ff]'>{t('pricing.billing.eyebrow', 'Clear, simple billing')}</p>
            <h2 id='fair-billing-title' className='mt-4 text-4xl font-normal leading-[1.05] tracking-[-0.05em] sm:text-5xl'>
              {t('pricing.billing.titleLine1', 'Pay for what the AI does.')}<br />
              <span className='bg-[linear-gradient(transparent_62%,#ffd84d_62%)]'>{t('pricing.billing.titleLine2', 'Not for handoffs.')}</span>
            </h2>
          </div>
          <p className='max-w-2xl text-base leading-7 text-black/60 lg:justify-self-end'>{t('pricing.billing.subtitle', 'Free includes 100 AI messages a month. Paid plans include a monthly AI credit that covers as many conversations as it can, so a quick question costs less than a long back-and-forth. Handing a conversation to your team is always free.')}</p>
        </div>

        <div className='mt-12 grid gap-6 md:grid-cols-3'>
          {/* Credit */}
          <article className='group flex min-h-80 flex-col rounded-[26px] border-2 border-[#11120f] bg-[#fff8ec] p-7 transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.5deg] sm:p-9'>
            <p className='font-mono text-[12px] uppercase tracking-[0.1em] text-black/50'>{t('pricing.billing.creditCard.label', 'Monthly AI credit')}</p>
            <p className='mt-5 text-6xl font-normal tracking-[-0.055em]'>{t('pricing.billing.creditCard.amount', 'From $7')}</p>
            <p className='mt-2 text-sm text-black/50'>{t('pricing.billing.creditCard.note', 'every month on Starter')}</p>
            {/* The credit is spent by conversations, then refilled for the new month. */}
            <div className='mt-6' aria-hidden='true'>
              <div className='h-4 overflow-hidden rounded-full border-2 border-[#11120f] bg-white'>
                <div className='relative h-full animate-[elpino-drain_8s_ease-in-out_infinite] rounded-full bg-[#3784ff]'>
                  <span className='absolute inset-x-0 top-0 h-1.5 rounded-full bg-white/35' />
                </div>
              </div>
              <div className='mt-1.5 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.08em] text-black/40'>
                <span>{t('pricing.billing.creditCard.chatsUseCredit', 'chats use credit')}</span>
                <span>{t('pricing.billing.creditCard.refillsMonthly', 'refills monthly')}</span>
              </div>
            </div>
            <p className='mt-auto pt-10 text-sm leading-6 text-black/65'>{t('pricing.billing.creditCard.desc', 'Starter includes $7, Growth $40 and Scale $240 of AI credit each month. Need more? Top up any time or turn on auto-recharge.')}</p>
            <Link href='#comparison' className='group/link mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold underline decoration-[#3784ff] decoration-2 underline-offset-4'>
              {t('pricing.billing.creditCard.cta', 'Compare plans')} <ArrowUpRight size={16} className='transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5' />
            </Link>
          </article>

          {/* $0 handoff, with the AI -> teammate path */}
          <article className='group relative flex min-h-80 flex-col overflow-hidden rounded-[26px] border-2 border-[#11120f] bg-[#ffd84d] p-7 transition duration-300 hover:-translate-y-1.5 hover:rotate-[0.5deg] sm:p-9'>
            <div className='relative h-16' aria-hidden='true'>
              <span className='absolute left-0 top-1 inline-block animate-[elpino-stamp_6s_ease-in_infinite] rounded-lg border-[3px] border-[#11120f] px-3 py-1.5 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-[#11120f]'>
                {t('pricing.billing.handoffCard.stamp', 'Handoff = free')}
              </span>
            </div>
            <p className='relative mt-auto pt-8 font-mono text-[12px] uppercase tracking-[0.1em] text-black/60'>{t('pricing.billing.handoffCard.label', 'Extra charge per handoff')}</p>
            <p className='relative mt-2 text-7xl font-normal tracking-[-0.07em]'>$0.00</p>
            <p className='relative mt-3 text-sm text-black/65'>{t('pricing.billing.handoffCard.note', 'On every plan. Always.')}</p>
          </article>

          {/* One conversation */}
          <article className='group flex min-h-80 flex-col rounded-[26px] border-2 border-[#11120f] bg-white p-7 transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.5deg] sm:p-9'>
            <div className='flex h-12 items-center' aria-hidden='true'>
              <span className='flex h-12 w-12 animate-[elpino-merge-left_5s_ease-in-out_infinite] items-center justify-center rounded-full border-2 border-[#11120f] bg-white text-[13px] font-bold'>AI</span>
              <span className='-ml-3 flex h-12 w-12 animate-[elpino-merge-right_5s_ease-in-out_infinite] items-center justify-center rounded-full border-2 border-[#11120f] bg-[#fc7b33] text-[16px] font-bold text-white'>P</span>
            </div>
            <h3 className='mt-6 text-3xl font-normal leading-tight tracking-[-0.045em]'>{t('pricing.billing.inboxCard.title', 'Your AI and your team, in one inbox.')}</h3>
            <p className='mt-auto pt-8 text-sm leading-6 text-black/65'>{t('pricing.billing.inboxCard.desc', 'AI answers from your knowledge. When a person is needed, your team continues with the full conversation already in view.')}</p>
            <Link href='/features' className='group/link mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold underline decoration-[#3784ff] decoration-2 underline-offset-4'>
              {t('pricing.billing.inboxCard.cta', 'Explore how it works')} <ArrowUpRight size={16} className='transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5' />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
