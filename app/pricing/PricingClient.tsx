'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Users, MessageSquare } from 'lucide-react';
import { PricingPlanCards } from './PricingPlanCards';
import { FairBillingSection } from './PricingCalculator';
import { ANNUAL_SAVING_PERCENT, SEAT_BUNDLES, creditLabel, plans, getPlanPrice } from '../components/PricingCards';
import { PricingFaqSection } from '../components/PricingFaqSection';
import { useStoredLanguage } from '@/app/hooks/useStoredLanguage';
import { useTranslation } from '@/app/hooks/useTranslation';

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — same convention as the home page's tList:
 * t()'s traversal really does hand back the raw JSON value (array or not)
 * even though its declared return type is `string`. Falls back to the
 * English array wholesale when the locale hasn't got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

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

// The `values` cells mix plan-specific numbers (seats, storage) with a small
// set of repeated English phrases. Only that closed set is translated —
// numbers and units (MB/GB) stay as written in every locale. "Yes"/"No" are
// matched literally in CellValue below, so they are never run through this
// map; everything else falls back to the English phrase untranslated.
function translateValue(t: T, value: string): string {
  const key = VALUE_KEYS[value];
  return key ? t(`pricing.values.${key}`, value) : value;
}

const VALUE_KEYS: Record<string, string> = {
  'Hands off to a human': 'handsOff',
  'Top up or hand off': 'topUpOrHandoff',
  'No extra charge': 'noExtraCharge',
  'No limit': 'noLimit',
  Standard: 'standard',
  Priority: 'priority',
};

// Only claims the product actually ships today. The widget, knowledge base,
// AI answers, escalation, visitor analytics and the audit trail are all real;
// anything not built yet is deliberately absent rather than listed and
// asterisked.
function buildComparisonCategories(t: T): FeatureCategory[] {
  const messages = t('pricing.values.messages', 'messages');
  const credit = t('pricing.values.credit', 'credit');
  const seatBundleSummary = t('pricing.values.seatBundleSummary', '3 seats for $2, 5 for $3');
  return [
    {
      categoryName: t('pricing.comparison.categories.aiRules.name', 'What the AI is allowed to do'),
      rows: [
        {
          label: t('pricing.comparison.categories.aiRules.rows.allowance.label', 'Monthly AI allowance'),
          description: t('pricing.comparison.categories.aiRules.rows.allowance.description', 'Free is capped at 100 AI messages. Paid plans include a monthly dollar credit that the AI spends as it works, shared by the whole workspace.'),
          values: [`100 ${messages}`, `${creditLabel(plans[1])} ${credit}`, `${creditLabel(plans[2])} ${credit}`, `${creditLabel(plans[3])} ${credit}`],
        },
        {
          label: t('pricing.comparison.categories.aiRules.rows.whenOut.label', 'When the allowance runs out'),
          description: t('pricing.comparison.categories.aiRules.rows.whenOut.description', 'The AI hands new conversations to your team. On paid plans you can top up credit at any time, or turn on auto-recharge.'),
          values: ['Hands off to a human', 'Top up or hand off', 'Top up or hand off', 'Top up or hand off'].map((v) => translateValue(t, v)),
        },
        {
          label: t('pricing.comparison.categories.aiRules.rows.escalations.label', 'Escalations to a human'),
          description: t('pricing.comparison.categories.aiRules.rows.escalations.description', 'Threads the AI hands over because it could not answer confidently. The handoff itself never costs extra.'),
          values: ['No extra charge', 'No extra charge', 'No extra charge', 'No extra charge'].map((v) => translateValue(t, v)),
        },
      ],
    },
    {
      categoryName: t('pricing.comparison.categories.seats.name', 'Who can log in'),
      rows: [
        {
          label: t('pricing.comparison.categories.seats.rows.included.label', 'Seats included'),
          description: t('pricing.comparison.categories.seats.rows.included.description', 'Teammates covered by the plan price, workspace owner included.'),
          values: ['2', '5', '15', '40'],
        },
        {
          label: t('pricing.comparison.categories.seats.rows.extra.label', 'Extra seats'),
          description: t('pricing.comparison.categories.seats.rows.extra.description', 'Every teammate past the included seats, on any plan.'),
          values: [seatBundleSummary, seatBundleSummary, seatBundleSummary, seatBundleSummary],
        },
        {
          label: t('pricing.comparison.categories.seats.rows.ceiling.label', 'Seat ceiling'),
          description: t('pricing.comparison.categories.seats.rows.ceiling.description', 'The point where you need a bigger plan rather than another seat.'),
          values: ['7', 'No limit', 'No limit', 'No limit'].map((v) => translateValue(t, v)),
        },
      ],
    },
    {
      categoryName: t('pricing.comparison.categories.product.name', 'The product'),
      rows: [
        {
          label: t('pricing.comparison.categories.product.rows.widget.label', 'Website chat widget'),
          description: t('pricing.comparison.categories.product.rows.widget.description', 'The embeddable chat your visitors actually talk to.'),
          values: ['Yes', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.knowledge.label', 'Knowledge base & AI answers'),
          description: t('pricing.comparison.categories.product.rows.knowledge.description', 'Crawl your site or upload docs; the AI answers from them.'),
          values: ['Yes', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.storage.label', 'Knowledge storage'),
          description: t('pricing.comparison.categories.product.rows.storage.description', 'How much crawled and uploaded content the workspace can hold.'),
          values: ['20 MB', '200 MB', '1 GB', '5 GB'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.inbox.label', 'Shared inbox & handoff'),
          description: t('pricing.comparison.categories.product.rows.inbox.description', 'One inbox for the team, with the AI handing over when it should.'),
          values: ['Yes', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.audit.label', 'AI audit trail'),
          description: t('pricing.comparison.categories.product.rows.audit.description', 'Every answer, with the articles and lookups it was built from.'),
          values: ['Yes', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.analytics.label', 'Visitor analytics'),
          description: t('pricing.comparison.categories.product.rows.analytics.description', 'Live visitors, sources, countries, and pages.'),
          values: ['No', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.profiles.label', 'Customer profiles & history'),
          description: t('pricing.comparison.categories.product.rows.profiles.description', 'Stored customer records and their past conversations.'),
          values: ['No', 'Yes', 'Yes', 'Yes'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.domain.label', 'Connected domain'),
          description: t('pricing.comparison.categories.product.rows.domain.description', 'One workspace, one website — need a second, start a second workspace.'),
          values: ['1', '1', '1', '1'],
        },
        {
          label: t('pricing.comparison.categories.product.rows.support.label', 'Support'),
          description: t('pricing.comparison.categories.product.rows.support.description', 'How to reach us when something needs a human on our side.'),
          values: ['Standard', 'Standard', 'Priority', 'Priority'].map((v) => translateValue(t, v)),
        },
      ],
    },
  ];
}

const INK = 'border-[#11120f]';

// Table cells: "Yes" becomes a small ticked square, "No" a dash, anything else
// is shown as written. Matched against the untranslated English literal, so
// this check stays correct in every language.
function CellValue({ value, t }: { value: string; t: T }) {
  if (value === 'Yes') {
    return (
      <span className='inline-flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#3784ff] text-white'>
        <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 20 20' stroke='currentColor' strokeWidth='3.5' aria-hidden='true'>
          <path className='elpino-check-path' strokeLinecap='round' strokeLinejoin='round' d='M16 6 8.5 13.5 4 9' />
        </svg>
        <span className='sr-only'>{t('pricing.comparison.included', 'Included')}</span>
      </span>
    );
  }
  if (value === 'No') return <span className='text-black/30'><span aria-hidden='true'>—</span><span className='sr-only'>{t('pricing.comparison.notIncluded', 'Not included')}</span></span>;
  return <>{value}</>;
}

const planColour: Record<string, string> = { free: '#ffffff', starter: '#ffd84d', growth: '#3784ff', scale: '#7060bd' };

export function PricingClient({ loggedIn = false }: { loggedIn?: boolean }) {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [expanded, setExpanded] = useState(false);
  const comparisonCategories = buildComparisonCategories(t);
  const categories = expanded ? comparisonCategories : comparisonCategories.slice(0, 2);
  const primaryHref = loggedIn ? '/dashboard' : '/signup';
  const seatBundleSummary = t('pricing.values.seatBundleSummary', '3 seats for $2, 5 for $3');
  const enterpriseFeatures = tList<string>(t, 'pricing.enterprise.features', [
    'AI credit well beyond the Scale plan',
    'Multiple websites and growing teams',
    'Shared customer context and knowledge',
    'Volume pricing built around your needs',
  ]);
  const enterpriseTalkPoints = tList<string>(t, 'pricing.enterprise.talkPoints', [
    'Discuss your conversation volume',
    'Plan your workspace and seats',
    'Scope knowledge across websites',
    'Explore onboarding and SLA needs',
  ]);
  const creditCards = tList<{ name: string; note: string }>(t, 'pricing.capacity.creditCards', [
    { name: 'Monthly credit', note: 'Resets each month' },
    { name: 'Top-ups', note: 'Never expire' },
    { name: 'Auto-recharge', note: 'Optional' },
  ]);
  return (
    <div className='bg-white text-[#11120f]'>
      {/* Hero: the same gradient backdrop as the home page, running behind the header. */}
      <section className='relative isolate overflow-hidden bg-white pb-16 pt-[124px] text-[#11120f]'>
        <div
          aria-hidden='true'
          className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
        />
        <div className='relative w-full px-5 sm:px-8 lg:px-20'>
          {/* floating stickers, wide screens only */}
          <span aria-hidden='true' className='absolute left-[6%] top-2 hidden -rotate-6 animate-[elpino-pop_0.6s_ease-out_0.7s_both] rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold lg:block'>{t('pricing.hero.stickerFree', 'Free forever ✓')}</span>
          <span aria-hidden='true' className='absolute right-[7%] top-10 hidden rotate-3 animate-[elpino-pop_0.6s_ease-out_0.9s_both] rounded-2xl border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold lg:block'>{t('pricing.hero.stickerNoCard', 'No card needed')}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src='/icon.png' alt='' className='absolute right-[14%] top-[150px] hidden h-16 w-16 origin-bottom animate-[elpino-wave_5s_ease-in-out_infinite] rounded-full border-2 border-[#11120f] bg-white object-contain p-1.5 xl:block' />

          <p className='mx-auto w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 text-center font-mono text-[12px] font-medium uppercase tracking-[0.12em]'>{t('pricing.hero.badge', 'Pricing')}</p>
          <h1 className='mx-auto mt-5 max-w-4xl animate-[elpino-focus_0.9s_ease-out_both] text-center text-5xl font-normal tracking-[-0.045em] sm:text-7xl'>{t('pricing.hero.title', "Start free. Grow when you're ready.")}</h1>
          <p className='mx-auto mt-5 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-center text-base leading-7 text-black/60'>{t('pricing.hero.subtitle', 'Every new account starts with AI support, a shared inbox, and human handoff—no card required. Explore Elpino with your team, then choose a plan when you need more.')}</p>
          <div className='mt-7 flex animate-[elpino-focus_0.9s_ease-out_0.3s_both] justify-center'>
            <Link href={primaryHref} className='group inline-flex h-14 items-center justify-center gap-3 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-9 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f77ea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3784ff]'>
              {loggedIn ? t('pricing.hero.ctaDashboard', 'Go to dashboard') : t('pricing.hero.ctaStart', 'Start for free')}
              <ArrowRight size={19} aria-hidden='true' className='transition-transform duration-200 group-hover:translate-x-1' />
            </Link>
          </div>
          <div id='plans' className='mb-8 mt-10 flex scroll-mt-40 justify-center sm:justify-end'>
            <div role='group' aria-label={t('pricing.hero.billingPeriodLabel', 'Billing period')} className='relative grid w-[300px] grid-cols-2 rounded-full border-2 border-[#11120f] bg-white p-1'>
              {/* the knob */}
              <span aria-hidden='true' className='absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full border-2 border-[#11120f] bg-[#ffd84d] transition-transform duration-500 ease-[cubic-bezier(0.5,1.5,0.4,1)]' style={{ transform: billing === 'yearly' ? 'translateX(100%)' : 'translateX(0)' }} />
              {(['monthly', 'yearly'] as const).map((period) => (
                <button key={period} type='button' aria-pressed={billing === period} onClick={() => setBilling(period)} className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3784ff] ${billing === period ? 'text-[#11120f]' : 'text-black/50 hover:text-black'}`}>
                  <span>{period === 'monthly' ? t('pricing.hero.monthly', 'Monthly') : t('pricing.hero.annually', 'Annually')}</span>
                  {period === 'yearly' && <span className='-rotate-3 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-1.5 py-0.5 text-[10.5px] font-bold text-white'>-{ANNUAL_SAVING_PERCENT}%</span>}
                </button>
              ))}
            </div>
          </div>
          <PricingPlanCards billing={billing} loggedIn={loggedIn} t={t} />
        </div>
      </section>

      {/* Comparison */}
      <section id='comparison' className='scroll-mt-36 bg-white px-5 py-20 text-[#11120f] sm:px-8 lg:px-20 lg:py-28'>
        <div className='mx-auto max-w-[1500px]'>
          <p className='font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]'>{t('pricing.comparison.eyebrow', 'Plan comparison')}</p>
          <h2 className='mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl'>{t('pricing.comparison.titlePrefix', 'See what ')}<span className='bg-[linear-gradient(transparent_62%,#ffd84d_62%)]'>{t('pricing.comparison.titleHl', 'fits your team.')}</span></h2>
          <p className='mt-4 max-w-2xl text-base leading-7 text-black/60'>{t('pricing.comparison.subtitle', 'Compare capacity, seats, and product access across every plan. Upgrade whenever your support operation needs more room.')}</p>
        </div>
        <div className={`mx-auto mt-10 max-w-[1500px] overflow-hidden rounded-[26px] border-2 ${INK} bg-white`}>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[900px] border-separate border-spacing-0 text-left'>
              <thead>
                <tr>
                  <th className='w-[38%] border-b-2 border-[#11120f] bg-[#fff8ec] px-7 py-7 align-bottom font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/50'>{t('pricing.comparison.featuresHeader', 'Features')}</th>
                  {plans.map((plan) => {
                    const dark = plan.id === 'growth' || plan.id === 'scale';
                    return (
                      <th key={plan.id} className={`w-[15.5%] border-b-2 border-l-2 border-[#11120f] px-4 py-6 text-center align-bottom ${dark ? 'text-white' : 'text-[#11120f]'}`} style={{ background: planColour[plan.id] ?? '#fff' }}>
                        {plan.highlighted && <span className='mb-2 inline-flex -rotate-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#11120f]'>{t('pricing.comparison.popular', 'Popular')}</span>}
                        <span className='block text-lg font-medium'>{t(`pricing.plans.${plan.id}.name`, plan.name)}</span>
                        <span className='mt-1 block text-2xl font-medium tracking-[-0.04em]'>{getPlanPrice(plan, billing)}<span className='text-sm font-normal opacity-70'>/mo</span></span>
                        {plan.id !== 'free' && <span className='mt-1 block text-xs font-normal opacity-70'>{billing === 'yearly' ? t('pricing.comparison.billedAnnually', 'billed annually') : t('pricing.comparison.billedMonthly', 'billed monthly')}</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <Fragment key={category.categoryName}>
                    <tr><th colSpan={5} className='border-b-2 border-[#11120f] bg-[#fff8ec] px-7 py-4 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/70'>{category.categoryName}</th></tr>
                    {category.rows.map((row) => (
                      <tr key={row.label} className='group'>
                        <th scope='row' className='border-b border-black/10 px-7 py-6 font-normal transition-colors group-hover:bg-[#fffdf5]'>
                          <span className='text-[15px] font-medium'>{row.label}</span>
                          <span className='mt-1.5 block max-w-lg text-sm leading-6 text-black/50'>{row.description}</span>
                        </th>
                        {row.values.map((value, index) => (
                          <td key={index} className={`border-b border-l-2 border-black/10 border-l-[#11120f] px-4 py-6 text-center text-sm font-medium transition-colors group-hover:bg-[#fffdf5] ${plans[index]?.highlighted ? 'bg-[#3784ff]/[0.05]' : ''}`}>
                            <CellValue value={value} t={t} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className='mt-8 flex justify-center'>
          <button type='button' aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className='group inline-flex h-12 items-center gap-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-6 text-sm font-semibold transition hover:-translate-y-0.5'>
            {expanded ? t('pricing.comparison.showFewer', 'Show fewer features') : t('pricing.comparison.showAll', 'Show all features')}
            <span aria-hidden='true' className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>↓</span>
          </button>
        </div>
      </section>

      <FairBillingSection t={t} />

      {/* Add capacity */}
      <section className='bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-28'>
        <div className='mx-auto max-w-[1500px]'>
          <div className='max-w-2xl'>
            <p className='font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#fc7b33]'>{t('pricing.capacity.eyebrow', 'Add capacity')}</p>
            <h2 className='mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl'>{t('pricing.capacity.title', 'Grow without changing how you work.')}</h2>
            <p className='mt-4 text-base leading-7 text-black/60'>{t('pricing.capacity.subtitle', 'Add people or AI capacity only when you need it. Your inbox, knowledge, and conversation history stay exactly where they are.')}</p>
          </div>

          <div className='mt-12 grid gap-6 lg:grid-cols-2'>
            <article className='group rounded-[26px] border-2 border-[#11120f] bg-[#fff8ec] p-7 transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.4deg] sm:p-9'>
              <div className='flex items-start justify-between gap-6'>
                <span className='flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl border-2 border-[#11120f] bg-[#ffd84d]'><Users size={24} aria-hidden='true' /></span>
                <p className='text-right text-sm text-black/55'><span className='block text-2xl font-medium tracking-[-0.04em] text-[#11120f]'>{seatBundleSummary}</span>{t('pricing.capacity.perMonth', 'per month')}</p>
              </div>
              <h3 className='mt-10 text-3xl font-normal tracking-[-0.04em]'>{t('pricing.capacity.teammatesTitle', 'Additional teammates')}</h3>
              <p className='mt-3 max-w-lg text-sm leading-6 text-black/60'>{t('pricing.capacity.teammatesDesc', 'Give more people their own login while sharing the same inbox, knowledge, and AI credit. They stay on your plan every month until you remove them.')}</p>
              <div className='mt-8 grid grid-cols-2 gap-3'>
                {SEAT_BUNDLES.map((bundle) => (
                  <div key={bundle.seats} className='rounded-2xl border-2 border-[#11120f] bg-white p-4 transition group-hover:bg-[#fffdf5]'>
                    <span className='block text-3xl font-medium tracking-[-0.03em]'>{bundle.seats}</span>
                    <span className='mt-1 block text-sm text-black/55'>{t('pricing.capacity.seatsWord', 'seats')} · {bundle.price}/mo</span>
                    {/* seats light up one by one, as if teammates were joining */}
                    <span className='mt-3 flex gap-1.5' aria-hidden='true'>
                      {Array.from({ length: bundle.seats }).map((_, seat) => (
                        <span key={seat} className='h-3 w-3 animate-[elpino-seat_4.5s_ease-in-out_infinite] rounded-full border-2 border-[#11120f]' style={{ animationDelay: `${seat * 0.4}s` }} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className='group rounded-[26px] border-2 border-[#11120f] bg-[#3784ff] p-7 text-white transition duration-300 hover:-translate-y-1.5 hover:rotate-[0.4deg] sm:p-9'>
              <div className='flex items-start justify-between gap-6'>
                <span className='flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl border-2 border-[#11120f] bg-white text-[#11120f]'><MessageSquare size={24} aria-hidden='true' /></span>
                <p className='text-right text-sm text-white/75'><span className='block text-2xl font-medium tracking-[-0.04em] text-white'>{t('pricing.capacity.topUpAnytime', 'Top up any time')}</span>{t('pricing.capacity.onAnyPaidPlan', 'on any paid plan')}</p>
              </div>
              <h3 className='mt-10 text-3xl font-normal tracking-[-0.04em]'>{t('pricing.capacity.creditTitle', 'Additional AI credit')}</h3>
              <p className='mt-3 max-w-lg text-sm leading-6 text-white/80'>{t('pricing.capacity.creditDesc', 'Keep the AI answering after your monthly credit is used. Handing a conversation to your team never costs extra.')}</p>
              <div className='mt-8 grid grid-cols-3 gap-2'>
                {creditCards.map(({ name, note }) => (
                  <div key={name} className='rounded-2xl border-2 border-[#11120f] bg-white p-4 text-[#11120f]'>
                    <span className='block text-xs text-black/55'>{name}</span>
                    <span className='mt-1 block text-sm font-semibold'>{note}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <PricingFaqSection t={t} />

      {/* Enterprise */}
      <section aria-labelledby='enterprise-title' className='bg-white px-5 pb-24 pt-12 sm:px-8 lg:px-20'>
        <div className='mx-auto grid max-w-[1500px] overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#fff8ec] text-[#11120f] lg:grid-cols-[1.55fr_0.85fr]'>
          <div className='relative isolate overflow-hidden p-8 sm:p-12 lg:p-16'>
            <div aria-hidden='true' className='absolute inset-0 -z-10 opacity-[0.12] bg-[radial-gradient(#11120f_1px,transparent_1px)] [background-size:16px_16px]' />
            <div className='absolute right-10 top-10 hidden h-20 w-20 sm:block' aria-hidden='true'>
              {/* a dot orbiting the mascot */}
              <span className='absolute -inset-4 animate-[elpino-orbit_12s_linear_infinite] rounded-full border-2 border-dashed border-[#11120f]/40'>
                <span className='absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#11120f] bg-[#fc7b33]' />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src='/icon.png' alt='' className='h-20 w-20 rounded-full border-2 border-[#11120f] bg-white object-contain p-2' />
            </div>
            <p className='w-fit rounded-full border-2 border-[#11120f] bg-white px-3 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]'>{t('pricing.enterprise.badge', 'Enterprise')}</p>
            <h2 id='enterprise-title' className='mt-5 max-w-xl text-4xl font-normal leading-tight tracking-[-0.05em] sm:text-6xl'>{t('pricing.enterprise.title', 'Support that grows with you.')}</h2>
            <p className='mt-6 max-w-xl text-sm leading-7 text-black/60'>{t('pricing.enterprise.subtitle', 'For organizations supporting more customers across multiple websites and teams. Let’s find the right capacity for your support.')}</p>
            <ul className='mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2'>
              {enterpriseFeatures.map((item) => (
                <li key={item} className='flex items-start gap-3 border-t-2 border-dashed border-black/20 pt-4 text-sm leading-6 text-black/80'>
                  <span className='mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#3784ff] text-white'><Check size={11} strokeWidth={3.5} aria-hidden='true' /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className='flex flex-col border-t-2 border-[#11120f] bg-[#7060bd] p-8 text-white sm:p-10 lg:border-l-2 lg:border-t-0'>
            <h3 className='text-3xl font-medium tracking-[-0.04em]'>{t('pricing.enterprise.talkTitle', "Let's talk")}</h3>
            <p className='mt-2 text-sm text-white/75'>{t('pricing.enterprise.customPricing', 'Custom pricing available')}</p>
            <Link href='/contact' className='group mt-7 inline-flex h-12 items-center justify-center gap-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 text-sm font-semibold text-[#11120f] transition hover:-translate-y-0.5'>
              {t('pricing.enterprise.contactCta', 'Contact sales')} <ArrowUpRight size={17} aria-hidden='true' className='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
            </Link>
            <ul className='mt-9 space-y-4 border-t-2 border-dashed border-white/30 pt-7 text-sm leading-6 text-white/85'>
              {enterpriseTalkPoints.map((item) => (
                <li key={item} className='flex items-start gap-3'>
                  <Check size={16} className='mt-0.5 shrink-0 text-[#ffd84d]' aria-hidden='true' />
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
