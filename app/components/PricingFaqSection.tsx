'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { categories as faqCategories } from '../faq/faq-categories';

type T = (key: string, defaultValue?: string) => string;
type FaqItem = { q: string; a: string };

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

const billingFaqs: FaqItem[] = faqCategories.find((category) => category.name === 'Billing & plans')?.items ?? [];

// The English Q&A below is the shared /faq source of truth (also reused
// verbatim on /faq itself). Only on this page, a translated override is
// looked up as one whole array — matching by index against the English
// list above — and falls back to it wholesale for any locale that doesn't
// have this key yet.
export function PricingFaqSection({ t }: { t: T }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = tList<FaqItem>(t, 'pricing.faq.items', billingFaqs);

  return (
    <section aria-labelledby='pricing-faq-title' className='bg-white px-5 py-20 text-[#11120f] sm:px-8 lg:px-20 lg:py-24'>
      <div className='mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
        <div className='lg:sticky lg:top-24 lg:self-start'>
          <h2 id='pricing-faq-title' className='text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl'>{t('pricing.faq.title', 'Pricing questions')}</h2>
          <p className='mt-5 max-w-md text-base leading-7 text-black/60'>{t('pricing.faq.subtitle', 'The billing details people ask about most. Setup, the AI, integrations and security are covered on the full FAQ.')}</p>
          <Link href='/faq' className='group mt-6 inline-flex items-center gap-2 text-base font-medium text-[#0078f4] underline decoration-1 underline-offset-4 hover:opacity-80'>
            {t('pricing.faq.readFull', 'Read the full FAQ')} <ArrowUpRight size={18} aria-hidden='true' className='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
          </Link>
        </div>

        <dl className='border-b border-black/20'>
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={item.q} className='border-t border-black/20'>
                <dt>
                  <button type='button' aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className='flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2'>
                    <span className='text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug tracking-[-0.015em]'>{item.q}</span>
                    <span aria-hidden='true' className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xl leading-none transition-all duration-300 ${isOpen ? 'rotate-45 border-[#11120f] bg-[#11120f] text-white' : 'border-black/25 text-[#11120f]'}`}>+</span>
                  </button>
                </dt>
                {/* grid-rows 0fr -> 1fr animates the height without measuring it */}
                <dd className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className='overflow-hidden'>
                    <p className='max-w-2xl pb-7 text-[17px] leading-7 text-black/65'>{item.a}</p>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
