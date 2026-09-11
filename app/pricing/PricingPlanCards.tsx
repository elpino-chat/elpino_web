import Link from 'next/link';
import { Check } from 'lucide-react';
import { ANNUAL_SAVING_PERCENT, getAnnualTotal, getPlanPrice, plans } from '../components/PricingCards';

export function PricingPlanCards({ billing }: { billing: 'monthly' | 'yearly' }) {
  return (
    <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
      {plans.map((plan) => {
        const price = getPlanPrice(plan, billing);
        const annualTotal = getAnnualTotal(plan);
        return (
          <article key={plan.id} className='relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 pt-8 shadow-[0_16px_35px_-15px_rgba(30,28,60,0.18)]'>
            {plan.id !== 'free' && <span className='absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#BD87FF] to-[#929DFF] px-3 py-1 text-xs font-medium text-white'>{plan.highlighted ? 'Most popular' : 'AI + Live chat'}</span>}
            <h2 className='text-[27px] font-medium tracking-[-0.04em]'>{plan.name}</h2>
            <p className='mt-2 min-h-[96px] text-[15px] leading-6'>{plan.description}</p>
            <div className='mt-5 flex flex-wrap items-baseline justify-between gap-2'>
              <p><span className='text-[34px] font-semibold tracking-[-0.06em]'>{price}</span><span className='ml-1 text-sm'>/mo</span></p>
              {billing === 'yearly' && plan.id !== 'free' && <span className='text-xl font-semibold text-[#A2AABB] line-through'>{plan.price}</span>}
            </div>
            <p className='mt-1 text-sm text-[#767B83]'>{plan.id === 'free' ? 'Free forever' : billing === 'yearly' ? `${annualTotal} billed annually · Save ${ANNUAL_SAVING_PERCENT}%` : 'billed monthly'}</p>
            <Link href={plan.href} className='mt-5 flex h-12 items-center justify-center rounded-full bg-[#191F19] px-4 text-base font-medium text-white transition hover:bg-[#343C34] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'>Get started</Link>
            <Link href={plan.id === 'scale' ? '/contact' : '#comparison'} className='mt-3 w-fit text-sm underline underline-offset-4 hover:text-[#6B49A6]'>{plan.id === 'scale' ? 'or discuss a custom plan' : 'Compare all features'}</Link>
            <div className='mt-5 flex-1 border-t border-black/15 pt-5'>
              <h3 className='text-sm font-medium'>What&apos;s included:</h3>
              <ul className='mt-4 space-y-3'>
                {plan.features.map((feature) => <li key={feature} className='flex items-start gap-2.5 text-sm leading-6'><Check size={17} strokeWidth={2.5} className='mt-1 shrink-0 text-[#00A883]' aria-hidden='true' /><span>{feature}</span></li>)}
              </ul>
              <div className='mt-6 border-t border-black/5 pt-4'>
                <p className='text-sm font-medium'>Built for your whole team</p>
                <p className='mt-2 text-sm leading-6 text-[#707680]'>Shared knowledge, one inbox, and human handoff whenever it is needed.</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
