'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { categories as faqCategories } from '../faq/faq-categories';

const billingFaqs = faqCategories.find((category) => category.name === 'Billing & plans')?.items ?? [];

export function PricingFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section aria-labelledby='pricing-faq-title' className='bg-white px-5 py-12 text-black sm:px-8 lg:px-20'>
      <div className='mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16'>
        <div className='lg:sticky lg:top-24 lg:self-start'>
          <p className='font-mono text-sm uppercase tracking-[0.12em] text-[#7060BD]'>FAQ</p>
          <h2 id='pricing-faq-title' className='mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl'>Pricing questions</h2>
          <p className='mt-5 max-w-lg text-base leading-8 text-[#72767D] sm:text-lg'>The billing details people ask about most. Setup, the AI, integrations and security are covered on the full FAQ.</p>
          <Link href='/faq' className='mt-7 inline-flex items-center gap-2 text-base font-semibold underline-offset-4 hover:underline'>Read the full FAQ <ArrowUpRight size={18} aria-hidden='true' /></Link>
        </div>

        <dl className='border-t border-black/10'>
          {billingFaqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={item.q} className='border-b border-black/10'>
                <dt>
                  <button type='button' aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className='flex w-full items-center justify-between gap-6 py-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2'>
                    <span className='text-lg leading-8 sm:text-xl'>{item.q}</span>
                    <span aria-hidden='true' className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xl transition duration-300 ${isOpen ? 'rotate-45 border-transparent bg-[#191E19] text-white' : 'border-black/15 bg-white'}`}>+</span>
                  </button>
                </dt>
                {isOpen && <dd className='pb-7 pr-4 text-base leading-8 text-[#72767D] sm:pr-12'>{item.a}</dd>}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
