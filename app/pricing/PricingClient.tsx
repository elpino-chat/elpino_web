'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Users, MessageSquare } from 'lucide-react';
import { PricingPlanCards } from './PricingPlanCards';
import { FairBillingSection } from './PricingCalculator';
import { ANNUAL_SAVING_PERCENT, SEAT_BUNDLES, SEAT_BUNDLE_SUMMARY, plans, getPlanPrice } from '../components/PricingCards';
import { PricingFaqSection } from '../components/PricingFaqSection';

// Reuse the billing answers from the /faq source of truth rather than keeping a
// second copy here — the pricing page shows only that category, and links out
// for the rest.
type FeatureRow = {
  label: string;
  description: string;
  values: string[];
};

type FeatureCategory = {
  categoryName: string;
  rows: FeatureRow[];
};

// Only claims the product actually ships today. The widget, knowledge base,
// AI answers, escalation, visitor analytics and the audit trail are all real;
// anything not built yet is deliberately absent rather than listed and
// asterisked.
const comparisonCategories: FeatureCategory[] = [
  {
    categoryName: 'What the AI is allowed to do',
    rows: [
      {
        label: 'AI resolutions included',
        description: 'Conversations the AI closes on its own each month, shared by the whole workspace.',
        values: ['50', '250', '2,000', '12,000'],
      },
      {
        label: 'Extra resolutions',
        description: 'What each conversation costs once the monthly allowance runs out.',
        values: ['Hands off to a human', '$0.10 each', '$0.06 each', '$0.04 each'],
      },
      {
        label: 'Escalations to a human',
        description: 'Threads the AI hands over because it could not answer confidently.',
        values: ['Never billed', 'Never billed', 'Never billed', 'Never billed'],
      },
    ],
  },
  {
    categoryName: 'Who can log in',
    rows: [
      {
        label: 'Seats included',
        description: 'Teammates covered by the plan price, workspace owner included.',
        values: ['2', '5', '15', '40'],
      },
      {
        label: 'Extra seats',
        description: 'Every teammate past the included seats, on any plan.',
        values: [SEAT_BUNDLE_SUMMARY, SEAT_BUNDLE_SUMMARY, SEAT_BUNDLE_SUMMARY, SEAT_BUNDLE_SUMMARY],
      },
      {
        label: 'Seat ceiling',
        description: 'The point where you need a bigger plan rather than another seat.',
        values: ['7', 'No limit', 'No limit', 'No limit'],
      },
    ],
  },
  {
    categoryName: 'The product',
    rows: [
      {
        label: 'Website chat widget',
        description: 'The embeddable chat your visitors actually talk to.',
        values: ['Yes', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'Knowledge base & AI answers',
        description: 'Crawl your site or upload docs; the AI answers from them.',
        values: ['Yes', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'Knowledge storage',
        description: 'How much crawled and uploaded content the workspace can hold.',
        values: ['20 MB', '200 MB', '1 GB', '5 GB'],
      },
      {
        label: 'Shared inbox & handoff',
        description: 'One inbox for the team, with the AI handing over when it should.',
        values: ['Yes', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'AI audit trail',
        description: 'Every answer, with the articles and lookups it was built from.',
        values: ['Yes', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'Visitor analytics',
        description: 'Live visitors, sources, countries, and pages.',
        values: ['No', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'Customer profiles & history',
        description: 'Stored customer records and their past conversations.',
        values: ['No', 'Yes', 'Yes', 'Yes'],
      },
      {
        label: 'Connected domain',
        description: 'One workspace, one website — need a second, start a second workspace.',
        values: ['1', '1', '1', '1'],
      },
      {
        label: 'Support',
        description: 'How to reach us when something needs a human on our side.',
        values: ['Standard', 'Standard', 'Priority', 'Priority'],
      },
    ],
  },
];

function CheckIcon({ className = 'text-[#11120f]' }: { className?: string }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill='none' viewBox='0 0 20 20' stroke='currentColor' strokeWidth='2.5' aria-hidden='true'>
      <path strokeLinecap='round' strokeLinejoin='round' d='M16 6 8.5 13.5 4 9' />
    </svg>
  );
}


export function PricingClient() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [expanded, setExpanded] = useState(false);
  const categories = expanded ? comparisonCategories : comparisonCategories.slice(0, 2);
  return (
    <div className='bg-white text-[#191E19]'>
      <section className='bg-black pb-16 pt-20 text-white'>
        <div className='w-full px-5 sm:px-8 lg:px-20'>
          <h1 className='text-center text-5xl font-normal tracking-[-0.045em] sm:text-7xl'>Start free. Grow when you&apos;re ready.</h1>
          <p className='mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-white/70'>Every new account starts with AI support, a shared inbox, and human handoff—no card required. Explore Elpino with your team, then choose a plan when you need more.</p>
          <div className='mt-7 flex justify-center'>
            <Link href='/signup' className='group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#d9bef4] px-9 text-lg font-medium text-black transition hover:bg-[#e5d2f7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d9bef4]'>
              Start for free
              <ArrowRight size={19} aria-hidden='true' className='transition-transform duration-200 group-hover:translate-x-1' />
            </Link>
          </div>
          <div id='plans' className='mb-8 mt-9 flex scroll-mt-40 flex-col justify-between gap-5 sm:flex-row sm:items-center'>
            <div role='group' aria-label='Billing period' className='ml-auto inline-flex w-fit rounded-full border border-white/15 bg-white/10 p-1'>
              {(['monthly', 'yearly'] as const).map((period) => (
                <button key={period} type='button' aria-pressed={billing === period} onClick={() => setBilling(period)} className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-w-36 ${billing === period ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}>
                  <span>{period === 'monthly' ? 'Monthly' : 'Annually'}</span>
                  {period === 'yearly' && <span className='rounded-full bg-[#547FFF] px-2 py-1 text-[11px] font-medium text-white'>save {ANNUAL_SAVING_PERCENT}%</span>}
                </button>
              ))}
            </div>
          </div>
          <PricingPlanCards billing={billing} />
        </div>
      </section>
      <section id='comparison' className='scroll-mt-36 bg-black px-5 py-20 text-white sm:px-8 lg:px-20 lg:py-28'>
        <div className='mx-auto max-w-[1500px]'>
          <p className='text-xs font-medium uppercase tracking-[0.16em] text-[#d9bef4]'>Plan comparison</p>
          <h2 className='mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl'>See what fits your team.</h2>
          <p className='mt-4 max-w-2xl text-base leading-7 text-white/60'>Compare capacity, seats, and product access across every plan. Upgrade whenever your support operation needs more room.</p>
        </div>
        <div className='mx-auto mt-10 max-w-[1500px] overflow-hidden rounded-3xl border border-white/15 bg-black'>
          <div className='overflow-x-auto'>
          <table className='w-full min-w-[900px] border-separate border-spacing-0 text-left'>
            <thead><tr>
              <th className='w-[38%] border-b border-white/15 bg-black px-7 py-7 align-bottom text-sm font-medium text-white/50'>Features</th>
              {plans.map((plan) => <th key={plan.id} className={`w-[15.5%] border-b border-l border-white/15 px-4 py-6 text-center align-bottom ${plan.highlighted ? 'bg-[#d9bef4]/15' : 'bg-black'}`}>{plan.highlighted && <span className='mb-2 inline-flex rounded-full bg-[#d9bef4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black'>Popular</span>}<span className='block text-lg font-medium'>{plan.name}</span><span className='mt-1 block text-2xl font-medium tracking-[-0.04em]'>{getPlanPrice(plan, billing)}<span className='text-sm font-normal text-white/50'>/mo</span></span>{plan.id !== 'free' && <span className='mt-1 block text-xs font-normal text-white/45'>billed {billing === 'yearly' ? 'annually' : 'monthly'}</span>}</th>)}
            </tr></thead>
            <tbody>
              {categories.map((category) => <Fragment key={category.categoryName}>
                <tr><th colSpan={5} className='border-b border-white/15 bg-white/10 px-7 py-4 text-sm font-medium text-white'>{category.categoryName}</th></tr>
                {category.rows.map((row) => <tr key={row.label} className='group'>
                  <th scope='row' className='border-b border-white/15 px-7 py-6 font-normal transition-colors group-hover:bg-white/5'><span className='text-[15px] font-medium'>{row.label}</span><span className='mt-1.5 block max-w-lg text-sm leading-6 text-white/50'>{row.description}</span></th>
                  {row.values.map((value, index) => <td key={index} className={`border-b border-l border-white/15 px-4 py-6 text-center text-sm font-medium transition-colors ${plans[index]?.highlighted ? 'bg-[#d9bef4]/10 group-hover:bg-[#d9bef4]/15' : 'group-hover:bg-white/5'}`}>{value === 'Yes' ? <span className='inline-flex rounded-full bg-[#d9bef4]/15 p-1.5'><CheckIcon className='h-4 w-4 text-[#d9bef4]' /><span className='sr-only'>Included</span></span> : value === 'No' ? <span className='text-white/35'>Not included</span> : value}</td>)}
                </tr>)}
              </Fragment>)}
            </tbody>
          </table>
          </div>
        </div>
        <div className='mt-8 flex justify-center'><button type='button' aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className='group inline-flex h-12 items-center gap-3 rounded-full border border-white/25 bg-transparent px-6 text-sm font-medium text-white transition hover:border-white hover:bg-white hover:text-black'>{expanded ? 'Show fewer features' : 'Show all features'} <span aria-hidden='true' className='flex h-6 w-6 items-center justify-center rounded-full bg-white text-base leading-none text-black transition group-hover:bg-black group-hover:text-white'>{expanded ? '−' : '+'}</span></button></div>
      </section>
      <FairBillingSection />
      <section className='bg-[#f4f1f6] px-5 py-20 sm:px-8 lg:px-20 lg:py-28'>
        <div className='mx-auto max-w-[1500px]'>
          <div className='max-w-2xl'>
            <p className='text-xs font-medium uppercase tracking-[0.16em] text-[#766b80]'>Add capacity</p>
            <h2 className='mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl'>Grow without changing how you work.</h2>
            <p className='mt-4 text-base leading-7 text-[#69666c]'>Add people or AI capacity only when you need it. Your inbox, knowledge, and conversation history stay exactly where they are.</p>
          </div>

          <div className='mt-12 grid gap-5 lg:grid-cols-2'>
            <article className='group rounded-3xl border border-black/10 bg-white p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-9'>
              <div className='flex items-start justify-between gap-6'>
                <span className='flex h-12 w-12 items-center justify-center rounded-full bg-[#ede2f8] text-black'><Users size={22} aria-hidden='true' /></span>
                <p className='text-right text-sm text-[#747078]'><span className='block text-2xl font-medium tracking-[-0.04em] text-black'>{SEAT_BUNDLE_SUMMARY}</span>per month</p>
              </div>
              <h3 className='mt-10 text-3xl font-normal tracking-[-0.04em]'>Additional teammates</h3>
              <p className='mt-3 max-w-lg text-sm leading-6 text-[#747078]'>Give more people their own login while sharing the same inbox, knowledge, and AI resolution pool.</p>
              <div className='mt-8 grid grid-cols-2 gap-3'>
                {SEAT_BUNDLES.map((bundle) => <div key={bundle.seats} className='rounded-2xl border border-black/10 bg-[#faf9fb] p-4'><span className='block text-2xl font-medium'>{bundle.seats}</span><span className='mt-1 block text-sm text-[#747078]'>seats · {bundle.price}/month</span></div>)}
              </div>
            </article>

            <article className='group rounded-3xl border border-black/10 bg-[#191919] p-7 text-white transition-transform duration-300 hover:-translate-y-1 sm:p-9'>
              <div className='flex items-start justify-between gap-6'>
                <span className='flex h-12 w-12 items-center justify-center rounded-full bg-[#d9bef4] text-black'><MessageSquare size={22} aria-hidden='true' /></span>
                <p className='text-right text-sm text-white/50'><span className='block text-2xl font-medium tracking-[-0.04em] text-white'>From $0.04</span>per extra resolution</p>
              </div>
              <h3 className='mt-10 text-3xl font-normal tracking-[-0.04em]'>Additional resolutions</h3>
              <p className='mt-3 max-w-lg text-sm leading-6 text-white/55'>Keep the AI answering after the included monthly allowance is used. Human escalations remain free.</p>
              <div className='mt-8 grid grid-cols-3 gap-2'>
                {[['Starter', '$0.10'], ['Growth', '$0.06'], ['Scale', '$0.04']].map(([name, price]) => <div key={name} className='rounded-2xl border border-white/15 bg-white/5 p-4'><span className='block text-xs text-white/45'>{name}</span><span className='mt-1 block text-xl font-medium'>{price}</span></div>)}
              </div>
            </article>
          </div>
        </div>
      </section>
      <PricingFaqSection />
      <section aria-labelledby='enterprise-title' className='bg-[#f4f1f6] px-5 pb-24 pt-12 sm:px-8 lg:px-20'>
        <div className='mx-auto grid max-w-[1500px] overflow-hidden rounded-[32px] bg-black text-white lg:grid-cols-[1.55fr_0.85fr]'>
          <div className='relative isolate overflow-hidden p-8 sm:p-12 lg:p-16'>
            <div aria-hidden='true' className='absolute inset-0 -z-10 [background:radial-gradient(100%_100%_at_0%_0%,#d9bef426_0%,transparent_60%)]' />
            <div aria-hidden='true' className='absolute inset-0 -z-10 opacity-[0.07] bg-[radial-gradient(#EBE5FA_1px,transparent_1px)] [background-size:14px_14px]' />
            <p className='text-xs font-medium uppercase tracking-[0.16em] text-[#d9bef4]'>Enterprise</p>
            <h2 id='enterprise-title' className='mt-5 max-w-xl text-4xl font-normal leading-tight tracking-[-0.05em] sm:text-6xl'>Support that grows with you.</h2>
            <p className='mt-6 max-w-xl text-sm leading-7 text-white/70'>For organizations supporting more customers across multiple websites and teams. Let’s find the right capacity for your support.</p>
            <ul className='mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2'>
              {['More than 12,000 AI resolutions a month', 'Multiple websites and growing teams', 'Shared customer context and knowledge', 'Volume pricing built around your needs'].map((item) => (
                <li key={item} className='flex items-start gap-3 border-t border-white/15 pt-4 text-sm leading-6 text-white/90'>
                  <Check size={16} className='mt-0.5 shrink-0 text-[#d9bef4]' aria-hidden='true' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className='flex flex-col border-t border-black/10 bg-[#d9bef4] p-8 text-black sm:p-10 lg:border-l lg:border-t-0'>
            <h3 className='text-3xl font-medium tracking-[-0.04em]'>Let’s talk</h3>
            <p className='mt-2 text-sm text-black/55'>Custom pricing available</p>
            <Link href='/contact' className='mt-7 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/80'>Contact sales <ArrowUpRight size={17} aria-hidden='true' /></Link>
            <ul className='mt-9 space-y-4 border-t border-black/15 pt-7 text-sm leading-6 text-black/65'>
              {['Discuss your resolution volume', 'Plan your workspace and seats', 'Scope knowledge across websites', 'Explore onboarding and SLA needs'].map((item) => (
                <li key={item} className='flex items-start gap-3'>
                  <Check size={16} className='mt-0.5 shrink-0 text-black' aria-hidden='true' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
