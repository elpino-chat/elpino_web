'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { ArrowUpRight, Check, Users, MessageSquare, Sparkles } from 'lucide-react';
import { PricingPlanCards } from './PricingPlanCards';
import { FairBillingSection } from './PricingCalculator';
import { ANNUAL_SAVING_PERCENT, SEAT_BUNDLES, SEAT_BUNDLE_SUMMARY, plans, getPlanPrice } from '../components/PricingCards';
import { categories as faqCategories } from '../faq/faq-categories';

// Reuse the billing answers from the /faq source of truth rather than keeping a
// second copy here — the pricing page shows only that category, and links out
// for the rest.
const billingFaqs = faqCategories.find((category) => category.name === 'Billing & plans')?.items ?? [];

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
        label: 'Multi-site knowledge scoping',
        description: 'Separate knowledge per site tag from one workspace.',
        values: ['No', 'No', 'Yes', 'Yes'],
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const categories = expanded ? comparisonCategories : comparisonCategories.slice(0, 2);
  return (
    <div className='bg-white text-[#191E19]'>
      <section className='bg-[linear-gradient(180deg,#DDEFEA_0%,#EBE5FA_65%,#FFFFFF_100%)] pb-16 pt-20'>
        <div className='w-full px-5 sm:px-8 lg:px-20'>
          <h1 className='text-4xl font-semibold tracking-[-0.045em] sm:text-5xl'>Plans &amp; Pricing</h1>
          <p className='mt-3 max-w-2xl text-base leading-7'>AI customer support, with your team always in the loop.<br />Start with what you need. Add more as you grow.</p>
          <div id='plans' className='mb-8 mt-9 flex scroll-mt-40 flex-col justify-between gap-5 sm:flex-row sm:items-center'>
            <span className='inline-flex w-fit items-center gap-3 rounded-full border border-black/15 bg-white px-5 py-3 text-base'><Sparkles size={19} aria-hidden='true' /> AI support + Live chat</span>
            <div role='group' aria-label='Billing period' className='inline-flex w-fit self-end rounded-full border border-black/5 bg-[#F8F9F9] p-1'>
              {(['monthly', 'yearly'] as const).map((period) => (
                <button key={period} type='button' aria-pressed={billing === period} onClick={() => setBilling(period)} className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-w-36 ${billing === period ? 'bg-white text-black shadow-sm' : 'text-[#676D74] hover:text-black'}`}>
                  {period === 'monthly' ? 'Monthly' : 'Annually'}
                  {period === 'yearly' && <span className='rounded-full bg-[#547FFF] px-2 py-1 text-[11px] font-medium text-white'>save {ANNUAL_SAVING_PERCENT}%</span>}
                </button>
              ))}
            </div>
          </div>
          <PricingPlanCards billing={billing} />
        </div>
      </section>
      <section id='comparison' className='scroll-mt-36 px-5 pb-16 pt-12 sm:px-8 lg:px-20'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[740px] border-collapse text-left'>
            <thead><tr className='border-b border-black/10'>
              <th className='w-[44%] px-4 pb-6 text-3xl font-medium tracking-[-0.04em]'>Compare Plans</th>
              {plans.map((plan) => <th key={plan.id} className='px-3 pb-6 text-center text-xl font-medium'>{plan.name}<span className='mt-1.5 block text-sm font-normal text-[#767B83]'>{getPlanPrice(plan, billing)}/mo{plan.id !== 'free' && <span className='block'>billed {billing === 'yearly' ? 'annually' : 'monthly'}</span>}</span></th>)}
            </tr></thead>
            <tbody>
              {categories.map((category) => <Fragment key={category.categoryName}>
                <tr className='border-b border-black/10'><th colSpan={5} className='px-4 py-6 text-lg font-semibold text-[#73777C]'>{category.categoryName}</th></tr>
                {category.rows.map((row) => <tr key={row.label} className='border-b border-black/10'>
                  <th scope='row' className='px-4 py-6 font-normal'><span className='text-base'>{row.label}</span><span className='mt-1.5 block max-w-xl text-sm leading-6 text-[#85888D]'>{row.description}</span></th>
                  {row.values.map((value, index) => <td key={index} className='border-l border-black/5 px-3 py-6 text-center text-base'>{value === 'Yes' ? <span className='inline-flex'><CheckIcon className='text-[#00A883]' /><span className='sr-only'>Included</span></span> : value === 'No' ? <span className='text-[#A5A9AE]'>Not included</span> : value}</td>)}
                </tr>)}
              </Fragment>)}
            </tbody>
          </table>
        </div>
        <div className='mt-8 text-center'><button type='button' aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className='rounded-full border border-black/20 bg-[#FAFAFA] px-6 py-3 text-sm transition hover:bg-[#F0F1F0]'>{expanded ? 'Show fewer features' : 'Show all features'} <span aria-hidden='true'>{expanded ? '−' : '+'}</span></button></div>
      </section>
      <FairBillingSection />
      <section className='px-5 py-12 sm:px-8 lg:px-20'>
        <h2 className='text-3xl font-medium tracking-[-0.04em]'>Improve your plan with add-ons</h2>
        <div className='mt-9 grid gap-6 md:grid-cols-2'>
          <article className='flex items-start gap-4 rounded-2xl border border-black/10 p-7'>
            <Users className='mt-1 shrink-0' size={25} aria-hidden='true' />
            <div><h3 className='text-2xl font-medium tracking-[-0.03em]'>Additional teammates</h3><p className='mt-1'>{SEAT_BUNDLE_SUMMARY}, per month</p>
              <ul className='mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-[#757A80]'><li>Invite colleagues to your shared workspace</li><li>Work together with individual logins</li><li>Keep the same AI resolution pool</li>{SEAT_BUNDLES.map((bundle) => <li key={bundle.seats}>{bundle.seats} seats for {bundle.price}/month</li>)}</ul>
            </div>
          </article>
          <article className='flex items-start gap-4 rounded-2xl border border-black/10 p-7'>
            <MessageSquare className='mt-1 shrink-0' size={25} aria-hidden='true' />
            <div><h3 className='text-2xl font-medium tracking-[-0.03em]'>Additional resolutions</h3><p className='mt-1'>From $0.04 per resolution on Scale</p>
              <ul className='mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-[#757A80]'><li>Starter: $0.10 per extra resolution</li><li>Growth: $0.06 per extra resolution</li><li>Scale: $0.04 per extra resolution</li><li>Escalations to a human are never billed</li></ul>
            </div>
          </article>
        </div>
      </section>
      <section aria-labelledby='faq-title' className='px-5 py-12 sm:px-8 lg:px-20'>
        <div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
          <div className='lg:sticky lg:top-24 lg:self-start'>
            <p className='font-mono text-xs uppercase tracking-[0.12em] text-[#7060BD]'>FAQ</p>
            <h2 id='faq-title' className='mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl'>Pricing questions</h2>
            <p className='mt-4 max-w-md text-sm leading-7 text-[#72767D]'>The billing details people ask about most. Setup, the AI, integrations and security are covered on the full FAQ.</p>
            <Link href='/faq' className='mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline'>Read the full FAQ <ArrowUpRight size={16} aria-hidden='true' /></Link>
          </div>
          <dl className='border-t border-black/10'>
            {billingFaqs.map((item, index) => (
              <div key={item.q} className='border-b border-black/10'>
                <dt>
                  <button type='button' aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className='flex w-full items-center justify-between gap-6 py-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2'>
                    <span className='text-base leading-7'>{item.q}</span>
                    <span aria-hidden='true' className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg transition duration-300 ${openFaq === index ? 'rotate-45 border-transparent bg-[#191E19] text-white' : 'border-black/15 bg-white'}`}>+</span>
                  </button>
                </dt>
                {openFaq === index && <dd className='pb-6 pr-4 text-sm leading-7 text-[#72767D] sm:pr-12'>{item.a}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section aria-labelledby='enterprise-title' className='px-5 pb-20 pt-12 sm:px-8 lg:px-20'>
        <div className='grid overflow-hidden rounded-3xl border border-white/10 bg-[#020807] text-white lg:grid-cols-[1.6fr_1fr]'>
          <div className='relative isolate overflow-hidden p-8 sm:p-11'>
            <div aria-hidden='true' className='absolute inset-0 -z-10 [background:radial-gradient(120%_120%_at_0%_0%,#DDEFEA24_0%,transparent_55%),radial-gradient(100%_100%_at_100%_100%,#EBE5FA2E_0%,transparent_60%)]' />
            <div aria-hidden='true' className='absolute inset-0 -z-10 opacity-[0.07] bg-[radial-gradient(#EBE5FA_1px,transparent_1px)] [background-size:14px_14px]' />
            <p className='font-mono text-xs uppercase tracking-[0.12em] text-[#DDEFEA]'>Enterprise</p>
            <h2 id='enterprise-title' className='mt-5 max-w-xl text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-5xl'>Elpino for larger teams</h2>
            <p className='mt-6 max-w-xl text-sm leading-7 text-white/70'>For organizations supporting more customers across multiple websites and teams. Let’s find the right capacity for your support.</p>
            <ul className='mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2'>
              {['More than 12,000 AI resolutions a month', 'Multiple websites and growing teams', 'Shared customer context and knowledge', 'Volume pricing built around your needs'].map((item) => (
                <li key={item} className='flex items-start gap-3 border-t border-white/15 pt-4 text-sm leading-6 text-white/90'>
                  <Check size={16} className='mt-0.5 shrink-0 text-[#DDEFEA]' aria-hidden='true' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className='flex flex-col border-t border-white/10 bg-[#191C18] p-8 sm:p-9 lg:border-l lg:border-t-0'>
            <h3 className='text-3xl font-medium tracking-[-0.04em]'>Let’s talk</h3>
            <p className='mt-2 text-sm text-white/55'>Custom pricing available</p>
            <Link href='/contact' className='mt-7 inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[linear-gradient(120deg,#DDEFEA_0%,#EBE5FA_100%)] px-5 text-sm font-semibold text-black transition hover:brightness-105'>Contact sales <ArrowUpRight size={17} aria-hidden='true' /></Link>
            <ul className='mt-9 space-y-4 border-t border-white/15 pt-7 text-sm leading-6 text-white/70'>
              {['Discuss your resolution volume', 'Plan your workspace and seats', 'Scope knowledge across websites', 'Explore onboarding and SLA needs'].map((item) => (
                <li key={item} className='flex items-start gap-3'>
                  <Check size={16} className='mt-0.5 shrink-0 text-[#DDEFEA]' aria-hidden='true' />
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
