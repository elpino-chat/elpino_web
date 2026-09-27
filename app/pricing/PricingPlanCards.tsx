import Link from 'next/link';
import { Check } from 'lucide-react';
import { ANNUAL_SAVING_PERCENT, getAnnualTotal, getPlanPrice, plans } from '../components/PricingCards';

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — same convention as elsewhere: t()'s
 * traversal really does hand back the raw JSON value (array or not) even
 * though its declared return type is `string`. Falls back to the English
 * array wholesale when the locale hasn't got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

// Same visual language as the header mega menu: ink outlines, flat sticker
// colours and a little motion. Each plan gets its own colour so the four
// cards read as a set rather than four copies of one box.
const planTheme: Record<string, { bg: string; dark: boolean }> = {
  free: { bg: '#ffffff', dark: false },
  starter: { bg: '#ffd84d', dark: false },
  growth: { bg: '#3784ff', dark: true },
  scale: { bg: '#7060bd', dark: true },
};

export function PricingPlanCards({ billing, loggedIn = false, t }: { billing: 'monthly' | 'yearly'; loggedIn?: boolean; t: T }) {
  return (
    <div className='grid gap-6 pt-4 sm:grid-cols-2 xl:grid-cols-4'>
      {plans.map((plan, index) => {
        const price = getPlanPrice(plan, billing);
        const annualTotal = getAnnualTotal(plan);
        const theme = planTheme[plan.id] ?? planTheme.free;
        // A signed-in visitor already has a workspace — send them there to
        // change plans instead of back through /signup, which just loops
        // them into a login they've already done.
        const ctaHref = loggedIn ? '/dashboard' : plan.href;
        const onColour = theme.dark ? 'text-white' : 'text-[#11120f]';
        // The plan's own name/description/cta/features are shared with the
        // authenticated dashboard billing page (not part of the marketing
        // language switcher), so the shared `plans` array itself stays
        // English. Here on the public pricing page we look up a translated
        // override per plan id and fall back to that English copy.
        const planName = t(`pricing.plans.${plan.id}.name`, plan.name);
        const planDescription = t(`pricing.plans.${plan.id}.description`, plan.description);
        const planCta = t(`pricing.plans.${plan.id}.cta`, plan.cta);
        const planFeatures = tList<string>(t, `pricing.plans.${plan.id}.features`, plan.features);
        return (
          <article
            key={plan.id}
            className={`group relative flex animate-[elpino-deal_0.9s_cubic-bezier(0.2,0.9,0.25,1.12)_both] flex-col rounded-[26px] border-2 border-[#11120f] bg-white text-[#11120f] transition duration-300 hover:-translate-y-2 hover:-rotate-[0.6deg] ${plan.highlighted ? 'xl:-mt-3' : ''}`}
            style={{ animationDelay: `${index * 140}ms` }}
          >
            {plan.highlighted && (
              <span className='absolute -top-4 right-5 z-10 rotate-3 animate-[elpino-pop_0.6s_ease-out_1.1s_both] rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-[#11120f]'>
                {t('pricing.planCards.mostPopular', 'Most popular')}
              </span>
            )}

            <div className={`relative overflow-hidden rounded-t-[24px] border-b-2 border-[#11120f] p-6 ${onColour}`} style={{ background: theme.bg }}>
              <span aria-hidden='true' className='pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 animate-[elpino-shine_6s_ease-in-out_infinite] bg-white/35' style={{ animationDelay: `${index * 0.9}s` }} />
              <div className='flex items-center justify-between gap-3'>
                <h2 className='text-[27px] font-medium tracking-[-0.04em]'>{planName}</h2>
                {billing === 'yearly' && plan.id !== 'free' && (
                  <span className='relative -rotate-3 animate-[elpino-pop_0.5s_ease-out_0.5s_both] rounded-full border-2 border-[#11120f] bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#11120f]'>{t('pricing.planCards.save', 'save')} {ANNUAL_SAVING_PERCENT}%</span>
                )}
              </div>
              <div className='mt-5 flex flex-wrap items-baseline gap-x-2'>
                <span key={price} className='relative inline-block animate-[elpino-roll_0.5s_cubic-bezier(0.2,0.9,0.3,1)_both] text-[44px] font-semibold leading-none tracking-[-0.06em]' style={{ transformOrigin: '50% 100%' }}>{price}</span>
                <span className='text-sm opacity-80'>/mo</span>
                {billing === 'yearly' && plan.id !== 'free' && <span className='ml-auto text-lg font-semibold line-through opacity-50'>{plan.price}</span>}
              </div>
              <p className='mt-2 font-mono text-[12px] uppercase tracking-[0.06em] opacity-75'>
                {plan.id === 'free' ? t('pricing.planCards.freeForever', 'Free forever') : billing === 'yearly' ? `${annualTotal} ${t('pricing.comparison.billedAnnually', 'billed annually')}` : t('pricing.comparison.billedMonthly', 'billed monthly')}
              </p>
            </div>

            <div className='flex flex-1 flex-col p-6'>
              <p className='min-h-[72px] text-[15px] leading-6 text-black/65'>{planDescription}</p>
              <Link
                href={ctaHref}
                className={`group/cta mt-4 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] px-4 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 ${plan.highlighted ? 'bg-[#ffd84d] text-[#11120f] hover:bg-[#ffe27a]' : plan.id === 'free' ? 'bg-white text-[#11120f] hover:bg-[#fff8ec]' : 'bg-[#11120f] text-white hover:bg-black/85'}`}
              >
                {planCta}
                <span aria-hidden='true' className='transition-transform duration-200 group-hover/cta:translate-x-1'>→</span>
              </Link>
              <Link href={plan.id === 'scale' ? '/contact' : '#comparison'} className='mt-3 w-fit text-sm text-black/60 underline decoration-[#3784ff] decoration-2 underline-offset-4 hover:text-black'>
                {plan.id === 'scale' ? t('pricing.planCards.discussCustomPlan', 'or discuss a custom plan') : t('pricing.planCards.compareAllFeatures', 'Compare all features')}
              </Link>

              <div className='mt-5 flex-1 border-t-2 border-dashed border-black/15 pt-5'>
                <h3 className='font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-black/50'>{t('pricing.planCards.whatsIncluded', "What's included")}</h3>
                <ul className='mt-4 space-y-3'>
                  {planFeatures.map((feature) => (
                    <li key={feature} className='flex items-start gap-3 text-[14.5px] leading-6'>
                      <span className='mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#3784ff] text-white'>
                        <Check size={11} strokeWidth={3.5} aria-hidden='true' />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className='mt-6 rounded-xl bg-[#fff8ec] p-4'>
                  <p className='text-sm font-semibold'>{t('pricing.planCards.builtForTeam', 'Built for your whole team')}</p>
                  <p className='mt-1.5 text-[13.5px] leading-5 text-black/55'>{t('pricing.planCards.builtForTeamDesc', 'Shared knowledge, one inbox, and human handoff whenever it is needed.')}</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
