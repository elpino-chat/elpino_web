import type { Metadata } from "next";
import { HelpCenterClient } from "./HelpCenterClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Self-Service Help Center | Elpino",
  description:
    "A fully integrated, on-brand help center that grounds your AI agent automatically — no-code customization, omnichannel distribution, and 95+ languages.",
  alternates: { canonical: `${SITE_URL}/product/help-center` },
  openGraph: {
    title: "Self-Service Help Center | Elpino",
    description:
      "A fully integrated, on-brand help center that grounds your AI agent automatically — no-code customization, omnichannel distribution, and 95+ languages.",
    url: `${SITE_URL}/product/help-center`,
    type: "website",
  },
};

const faqItems = [
  {
    q: "What is the Elpino Help Center?",
    a: "The Elpino Help Center is a fully integrated, on-brand knowledge base where customers find answers on their own — on your site, inside the chat widget, and anywhere your support content is surfaced. Every article you publish is instantly vectorized and grounds your AI agent automatically.",
  },
  {
    q: "How does the Help Center work with the AI agent?",
    a: "Your articles are the AI agent's source of truth. When a customer asks a question, the agent searches your knowledge base first, answers with citations, and says so honestly when it doesn't know — escalating to your team instead of guessing.",
  },
  {
    q: "Can I customize my Help Center without code?",
    a: "Yes. The no-code styler lets you match layout, colors, fonts, and your logo to your brand in minutes, and host it on your own domain like support.yourbrand.com. Articles support rich media, callouts, code blocks, and CTAs.",
  },
  {
    q: "Does it support multiple brands and languages?",
    a: "You can run separately branded help centers per brand entity — all managed in one workspace — and your content serves customers in 95+ languages with accurate product terminology.",
  },
  {
    q: "How do I know which articles to write next?",
    a: "Content-gap reporting shows exactly what customers searched for without finding an answer, while article reactions and view analytics tell you which pages genuinely resolve questions.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams publish their first branded help center in under an hour: connect your workspace, apply your brand in the styler, import or write your first articles, and embed the widget. No code required.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HelpCenterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HelpCenterClient />
    </>
  );
}
