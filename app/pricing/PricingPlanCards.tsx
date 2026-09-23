import Link from 'next/link';
import { Check, Info } from 'lucide-react';
import { ANNUAL_SAVING_PERCENT, getAnnualTotal, getPlanPrice, plans } from '../components/PricingCards';

export function PricingPlanCards({ billing, loggedIn = false }: { billing: 'monthly' | 'yearly'; loggedIn?: boolean }) {
  return (
    <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
      {plans.map((plan) => {
        const price = getPlanPrice(plan, billing);
        const annualTotal = getAnnualTotal(plan);
        // A signed-in visitor already has a workspace — send them there to
        // change plans instead of back through /signup, which just loops
        // them into a login they've already done.
        const ctaHref = loggedIn ? '/dashboard' : plan.href;
        return (
          <article
            key={plan.id}
            className={`relative flex flex-col overflow-visible rounded-2xl bg-white p-6 pt-8 text-black ${plan.highlighted ? 'border-2 border-transparent' : 'border border-black/10'}`}
            style={plan.highlighted ? { background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #d9bef4, #929DFF, #7BE6C4) border-box' } : undefined}
          >
            {plan.highlighted && <span className='absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#BD87FF] to-[#929DFF] px-3 py-1 text-xs font-medium text-white'>Most popular</span>}
            <h2 className='text-[27px] font-medium tracking-[-0.04em]'>{plan.name}</h2>
            <p className='mt-2 min-h-[96px] text-[15px] leading-6 text-black/65'>{plan.description}</p>
            <div className='mt-5 flex flex-wrap items-baseline justify-between gap-2'>
              <p><span className='text-[34px] font-semibold tracking-[-0.06em]'>{price}</span><span className='ml-1 text-sm'>/mo</span></p>
              {billing === 'yearly' && plan.id !== 'free' && <span className='text-xl font-semibold text-black/40 line-through'>{plan.price}</span>}
            </div>
            <p className='mt-1 text-sm text-black/55'>{plan.id === 'free' ? 'Free forever' : billing === 'yearly' ? `${annualTotal} billed annually · Save ${ANNUAL_SAVING_PERCENT}%` : 'billed monthly'}</p>
            <Link href={ctaHref} className={`mt-5 flex h-12 items-center justify-center rounded-full border px-4 text-base font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 ${plan.highlighted ? 'border-[#d9bef4] bg-[#d9bef4] text-black hover:bg-[#e5d2f7] focus-visible:outline-[#d9bef4]' : 'border-black/20 bg-transparent text-black hover:border-black hover:bg-black hover:text-white focus-visible:outline-black'}`}>{loggedIn ? 'Go to dashboard' : 'Get started'}</Link>
            <Link href={plan.id === 'scale' ? '/contact' : '#comparison'} className='mt-3 w-fit text-sm text-black/65 underline underline-offset-4 hover:text-black'>{plan.id === 'scale' ? 'or discuss a custom plan' : 'Compare all features'}</Link>
            <div className='mt-5 flex-1 border-t border-black/10 pt-5'>
              <h3 className='text-sm font-medium'>What&apos;s included:</h3>
              <ul className='mt-4 space-y-3'>
                {plan.features.map((feature) => <li key={feature} className='flex items-start gap-2.5 text-sm leading-6'><Check size={17} strokeWidth={2.5} className='mt-1 shrink-0 text-[#00A883]' aria-hidden='true' /><span>{feature}</span>{feature.startsWith('Up to ') && <span className='group/tooltip relative mt-1 inline-flex shrink-0'><button type='button' aria-label='How AI resolution limits work' className='text-black/40 transition hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2'><Info size={15} aria-hidden='true' /></button><span role='tooltip' className='pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-center text-xs leading-5 text-black shadow-xl group-hover/tooltip:block group-focus-within/tooltip:block'>The number of resolutions is an estimate. Actual usage depends on the AI model and credits used for each conversation.</span></span>}</li>)}
              </ul>
              <div className='mt-6 border-t border-black/10 pt-4'>
                <p className='text-sm font-medium'>Built for your whole team</p>
                <p className='mt-2 text-sm leading-6 text-black/55'>Shared knowledge, one inbox, and human handoff whenever it is needed.</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
