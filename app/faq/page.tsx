import type { Metadata } from "next";
import Image from "next/image";
import { FaqClient } from "./faq-client";
import { categories } from "./faq-categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on setup, the AI agent, escalation, integrations, billing, and data security for Elpino, the AI customer support platform.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "FAQ",
    description: "Answers on setup, escalation, integrations, billing, and data security for Elpino.",
    url: `${SITE_URL}/faq`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: categories.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

export default function FaqPage() {
  return (
    <main className="overflow-hidden bg-[#fafaf7] font-[family-name:var(--font-rethink-sans)] text-[#20251d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative overflow-hidden border-b border-[#758269]/20 bg-[#e9eee3] px-6 pt-14 md:px-10 md:pt-20">
        <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-3 lg:grid-cols-[1fr_0.6fr]">
          <div className="pb-14 md:pb-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#758269]/35 bg-white/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5d6d50]"><span className="h-1.5 w-1.5 rounded-full bg-[#849d6d]" />Help center</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-medium leading-[0.93] tracking-[-0.065em] sm:text-6xl">
              Answers, without the <span className="font-[family-name:var(--font-instrument-serif)] italic font-normal text-[#667b55]">runaround.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-6 text-[#596353] md:text-base">
            Everything you&apos;d ask before putting an AI in front of your customers —{" "}
            {categories.reduce((n, c) => n + c.items.length, 0)} questions, straight answers.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[300px] self-end"><Image src="/images/help-center-sloth.png" alt="Elpino's helpful sloth guide reading a handbook" width={1024} height={1536} priority sizes="(min-width: 1024px) 26vw, 0px" className="hidden h-auto w-full lg:block" /></div>
        </div>
      </section>

      <FaqClient categories={categories} />
    </main>
  );
}
