import type { Metadata } from "next";
import { FaqClient } from "./faq-client";
import { FaqHero } from "./faq-hero";
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
      <FaqHero total={categories.reduce((n, c) => n + c.items.length, 0)} />

      <FaqClient categories={categories} />
    </main>
  );
}
