import Link from 'next/link';

export type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  href: string;
  features: string[];
  highlighted?: boolean;
  /** Seats bundled into the price, owner included. */
  seatsIncluded: number;
  /** Hard seat ceiling; null means seats scale indefinitely at $1 each. */
  seatsMax: number | null;
  /** AI resolutions per month, shared by the whole workspace. */
  resolutions: number;
  /** Knowledge base capacity, in megabytes of ingested content. */
  storageMb: number;
  /** Per-resolution price past the allowance. Null = the AI hands off instead. */
  overageUsdCents: number | null;
  /** Launch/intro price shown instead of `price`, e.g. "$15 for your first 3 months". */
  introPrice?: string;
  introNote?: string;
};

// Mirrors apps/workspace-service/src/billing/plans.ts — the backend is the
// source of truth for entitlement; this copy exists so the public pricing
// page renders without a service round-trip. Keep prices, seats, and
// resolution counts in sync with that file.
//
// The model in one line: upgrading buys AI resolutions, $1 buys a teammate,
// and the two never affect each other. Everyone in a workspace shares one
// inbox and one resolution pool no matter how many seats are open.
export const SEAT_PRICE = '$1';
export const FREE_SEAT_MIN_CHARGE = '$5';

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: '/month',
    description: 'For a founder answering their own support. Real AI, no card.',
    cta: 'Get started',
    href: '/signup',
    seatsIncluded: 2,
    seatsMax: 7,
    resolutions: 50,
    storageMb: 20,
    overageUsdCents: null,
    features: [
      '50 AI resolutions/month',
      '2 seats included',
      'Extra seats $1/month each',
      '20 MB knowledge base',
      'Website chat widget',
      'Shared inbox with handoff',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$12.50',
    cadence: '/month',
    description: 'For a small team whose support has outgrown one inbox.',
    cta: 'Get started',
    href: '/signup',
    seatsIncluded: 5,
    seatsMax: null,
    resolutions: 250,
    storageMb: 200,
    overageUsdCents: 10,
    features: [
      '250 AI resolutions/month',
      '5 seats included',
      'Extra seats $1/month each',
      '200 MB knowledge base',
      'Then $0.10 per resolution',
      'Visitor analytics',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$59',
    cadence: '/month',
    description: 'For teams running support as a real function, with the data to prove it.',
    cta: 'Get started',
    href: '/signup',
    seatsIncluded: 15,
    seatsMax: null,
    resolutions: 2000,
    storageMb: 1000,
    overageUsdCents: 6,
    highlighted: true,
    features: [
      '2,000 AI resolutions/month',
      '15 seats included',
      'Extra seats $1/month each',
      '1 GB knowledge base',
      'Then $0.06 per resolution',
      'Full AI audit trail',
      'Priority support',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '$299',
    cadence: '/month',
    description: 'For high-volume support where the AI carries most of the load.',
    cta: 'Get started',
    href: '/signup',
    seatsIncluded: 40,
    seatsMax: null,
    resolutions: 12000,
    storageMb: 5000,
    overageUsdCents: 4,
    features: [
      '12,000 AI resolutions/month',
      '40 seats included',
      'Extra seats $1/month each',
      '5 GB knowledge base',
      'Then $0.04 per resolution',
      'Multi-site knowledge scoping',
      'Integrations & API access',
    ],
  },
];

function CheckIcon({ className = 'text-[#D9BEF4]' }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} fill='none' viewBox='0 0 20 20' stroke='currentColor' strokeWidth='2.5' aria-hidden='true'>
      <path strokeLinecap='round' strokeLinejoin='round' d='M16 6 8.5 13.5 4 9' />
    </svg>
  );
}

/** The joined pricing-card grid used on /pricing — one source, no drift. */
export function getPlanPrice(plan: Plan, billing: 'monthly' | 'yearly') {
  const monthlyCents = Math.round(Number(plan.price.replace(/[^0-9.]/g, '')) * 100);
  const cents = billing === 'yearly' ? Math.round(monthlyCents * 0.8) : monthlyCents;
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function PricingCards({ billing = 'monthly', pageStyle = false }: { billing?: 'monthly' | 'yearly'; pageStyle?: boolean }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ${pageStyle ? 'gap-0' : 'gap-5'}`}>
      {plans.map((plan, index) => {
        const numericPrice = Number(plan.price.replace(/[^0-9.]/g, ''));
        const displayPrice = billing === 'yearly' ? getPlanPrice(plan, billing) : plan.introPrice ?? plan.price;
        const annualTotal = (Math.round(numericPrice * 100 * 0.8) * 12 / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });

        if (pageStyle) {
          return (
            <article key={plan.id} className='relative isolate flex h-full flex-col overflow-hidden rounded-none border border-black/40 bg-white text-[#111111] shadow-[0_16px_40px_-24px_rgba(0,0,0,0.25),inset_0_1px_0_1px_rgba(255,255,255,0.9)]'>
              {plan.highlighted && (
                <div aria-hidden='true' className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] bg-[radial-gradient(ellipse_85%_30%_at_50%_0%,#80A7FF_0%,transparent_100%),radial-gradient(ellipse_110%_24%_at_50%_65%,#FFCB57_0%,#FFB87A_45%,transparent_100%)]' />
              )}
              <div className='px-7 pb-7 pt-8'>
                <h3 className={`w-fit text-[28px] font-semibold tracking-[-0.04em] ${plan.highlighted ? '' : 'bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] bg-clip-text text-transparent'}`}>
                  {plan.name}
                </h3>
                <div className='mt-5 flex min-h-[72px] flex-wrap items-center gap-x-3 gap-y-1'>
                  <span className='text-[clamp(2.5rem,3.2vw,3.5rem)] font-semibold leading-none tracking-[-0.065em]'>{displayPrice}</span>
                  <div className='text-[13px] leading-5 text-[#686868]'>
                    <span className='block'>{plan.id === 'free' ? 'Free forever' : 'per workspace / month'}</span>
                    <span className='block'>{plan.id === 'free' ? 'No card required' : `billed ${billing === 'yearly' ? 'annually' : 'monthly'}`}</span>
                  </div>
                </div>
                <p className='mt-2 min-h-5 text-xs text-[#666666]'>
                  {plan.id === 'free' ? '50 AI resolutions every month' : billing === 'yearly' ? `$${annualTotal} per year · Save 20%` : 'Monthly billing, per workspace'}
                </p>
                <Link href={plan.href} className={`mt-7 flex min-h-14 w-full items-center justify-center rounded-none border px-4 py-3 text-base font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${plan.highlighted ? 'border-[#222222] bg-gradient-to-b from-[#343434] to-[#1C1C1C] text-white shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110' : 'border-[#CCCCCC] bg-gradient-to-b from-[#EEEEEE] to-[#E2E2E2] text-black shadow-[0_2px_3px_rgba(0,0,0,0.08),inset_0_1px_0_white] hover:brightness-95'}`}>
                  {plan.cta}
                </Link>
              </div>
              <div className={`flex flex-1 flex-col px-7 pb-8 pt-8 ${plan.highlighted ? '' : 'border-t border-[#EBEBED]'}`}>
                <ul className='space-y-5'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-3 text-[15px] leading-6 tracking-[-0.015em]'>
                      <CheckIcon className='mt-1 text-[#111111]' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href='/contact' className='mt-auto w-fit pt-10 text-sm text-[#707070] transition hover:text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-4'>Need higher limits?</Link>
              </div>
            </article>
          );
        }

        return (
        <div
          key={plan.id}
          className={`group relative flex flex-col ${pageStyle ? 'min-h-[570px] overflow-hidden rounded-[24px] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(35,61,77,0.14)]' : 'rounded-2xl p-8'} ${
            pageStyle
              ? plan.highlighted
                ? 'border-[#D8D5CE] bg-[#FAF9F6] text-[#11120f] shadow-[0_18px_50px_rgba(17,18,15,0.08)]'
                : 'border-[#DDE4E8] bg-white text-[#11120f]'
              : plan.highlighted
                ? 'bg-[#FAF9F6] text-[#11120f]'
                : 'bg-white shadow-[0_20px_60px_-48px_rgba(32,21,28,0.4)]'
          }`}
        >
          {plan.highlighted && (
            <span className={pageStyle ? 'absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#11120f]' : 'mb-4 inline-flex w-fit items-center rounded-full bg-[#D9BEF4] px-3 py-1 text-[11px] font-normal uppercase tracking-[0.16em] text-white'}>
              {pageStyle ? 'Best value' : 'Most popular'}
            </span>
          )}

          {pageStyle && (
            <div className={`mb-12 flex h-10 w-10 items-center justify-center rounded-full ${plan.highlighted ? 'bg-white text-[#11120f]' : 'bg-[#EEF3F5] text-[#11120f]'}`}>
              <svg className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${index === 0 ? '-rotate-[20deg]' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z' />
              </svg>
            </div>
          )}

          <h3 className={pageStyle ? 'text-3xl font-medium tracking-[-0.04em]' : `text-xs font-normal uppercase tracking-[0.18em] ${plan.highlighted ? 'text-black/50' : 'text-gray-500'}`}>
            {plan.name}
          </h3>
          {pageStyle && <p className='mt-1 text-sm text-[#667069]'>{plan.description}</p>}
          <div className={pageStyle ? 'mt-7 flex items-end gap-1 border-b border-[#D8D5CE] pb-6' : 'mt-4 flex items-baseline gap-1.5'}>
            <span className={pageStyle ? 'text-5xl font-medium tracking-[-0.06em]' : 'text-4xl font-normal tracking-tight'}>{displayPrice}</span>
            {plan.id !== 'free' && <span className={`text-sm ${pageStyle ? 'pb-1 text-[#667069]' : plan.highlighted ? 'text-black/50' : 'text-gray-500'}`}>/mo</span>}
            {!pageStyle && plan.introPrice && billing === 'monthly' && (
              <span className={`text-sm line-through ${plan.highlighted ? 'text-black/30' : 'text-gray-300'}`}>
                {plan.price}
              </span>
            )}
          </div>
          {plan.id !== 'free' && (
            <p className='mt-3 text-sm text-[#667069]'>
              {billing === 'yearly' ? `$${annualTotal} billed annually · Save 20%` : 'Billed monthly'}
            </p>
          )}
          {!pageStyle && plan.introNote && billing === 'monthly' && <p className='mt-1 text-xs text-[#D9BEF4]'>{plan.introNote}</p>}
          <p className={pageStyle ? 'mt-5 text-sm font-semibold text-[#11120f]' : `mt-4 min-h-[48px] text-sm leading-6 ${plan.highlighted ? 'text-black/60' : 'text-gray-500'}`}>
            {pageStyle ? (plan.id === 'free' ? 'Free forever' : 'Per month, per workspace') : plan.description}
          </p>
          {pageStyle && <p className='mt-2 text-sm leading-6 text-[#667069]'>
            {plan.description}
          </p>}

          <Link
            href={plan.href}
            className={`${pageStyle ? 'order-last mt-auto' : 'mt-6'} inline-flex h-12 items-center justify-center rounded-none border px-4 text-sm font-semibold transition ${
              pageStyle
                ? plan.highlighted
                  ? 'border-[#11120f] bg-[#11120f] text-white hover:bg-black'
                  : 'border-[#CBD7DC] bg-white text-[#11120f] hover:border-[#11120f] hover:bg-[#11120f] hover:text-white'
                : plan.highlighted
                  ? 'border-transparent bg-[#D9BEF4] text-white hover:bg-[#D9BEF4]'
                  : 'border-transparent bg-[#FAF9F6] text-[#11120f] hover:bg-[#EDEAE3]'
            }`}
          >
            {plan.cta}
          </Link>

          <ul className={pageStyle ? 'mb-8 mt-5 space-y-3' : `mt-8 space-y-3 border-t pt-7 ${plan.highlighted ? 'border-black/10' : 'border-black/[0.06]'}`}>
            {plan.features.map((feature) => (
              <li key={feature} className='flex items-start gap-2.5'>
                <span className='mt-0.5'>
                  <CheckIcon className={pageStyle ? 'text-[#11120f]' : undefined} />
                </span>
                <span className={`text-sm leading-5 ${pageStyle ? 'text-[#46505a]' : plan.highlighted ? 'text-black/70' : 'text-gray-600'}`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )})}
    </div>
  );
}
