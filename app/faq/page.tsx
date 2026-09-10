import type { Metadata } from "next";
import { Eyebrow } from "../components/product/Eyebrow";
import { HeroGlow } from "../components/product/HeroGlow";
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
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative overflow-hidden border-b border-black/10 bg-white">
        <HeroGlow />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-28 text-center md:px-10">
          <Eyebrow>FAQ</Eyebrow>
          <h1 className="max-w-2xl text-4xl font-normal leading-[1.08] tracking-tight text-[#233D4D] [text-wrap:balance] md:text-5xl">
            Answers on setup, <span className="text-[#D9BEF4]">billing, and control</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
            Everything you&apos;d ask before putting an AI in front of your customers —{" "}
            {categories.reduce((n, c) => n + c.items.length, 0)} questions, straight answers.
          </p>
        </div>
      </section>

      <FaqClient categories={categories} />
    </main>
  );
}
