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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = tList<FaqItem>(t, 'pricing.faq.items', billingFaqs);

  return (
    <section aria-labelledby='pricing-faq-title' className='bg-white px-5 py-12 text-[#11120f] sm:px-8 lg:px-20'>
      <div className='mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
        <div className='lg:sticky lg:top-24 lg:self-start'>
          <p className='font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060BD]'>{t('pricing.faq.eyebrow', 'FAQ')}</p>
          <h2 id='pricing-faq-title' className='mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl'>{t('pricing.faq.title', 'Pricing questions')}</h2>
          <p className='mt-5 max-w-lg text-base leading-8 text-[#72767D] sm:text-lg'>{t('pricing.faq.subtitle', 'The billing details people ask about most. Setup, the AI, integrations and security are covered on the full FAQ.')}</p>
          <Link href='/faq' className='group mt-7 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 py-2.5 text-base font-semibold transition hover:-translate-y-0.5'>
            {t('pricing.faq.readFull', 'Read the full FAQ')} <ArrowUpRight size={18} aria-hidden='true' className='transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
          </Link>
        </div>

        <dl className='flex flex-col gap-3'>
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={item.q} className={`rounded-2xl border-2 border-[#11120f] transition-colors duration-300 ${isOpen ? 'bg-[#fff8ec]' : 'bg-white hover:bg-[#fffdf5]'}`}>
                <dt>
                  <button type='button' aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className='flex w-full items-center justify-between gap-6 px-5 py-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2'>
                    <span className='text-lg leading-8 sm:text-xl'>{item.q}</span>
                    <span aria-hidden='true' className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#11120f] text-xl font-medium transition duration-300 ${isOpen ? 'rotate-[135deg] bg-[#ffd84d]' : 'bg-white'}`}>+</span>
                  </button>
                </dt>
                {/* grid-rows 0fr -> 1fr animates the height without measuring it */}
                <dd className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className='overflow-hidden'>
                    <p className={`px-5 pb-6 pr-4 text-base leading-8 text-[#5f636a] transition-opacity duration-500 sm:pr-12 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.a}</p>
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
