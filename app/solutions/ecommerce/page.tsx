import type { Metadata } from "next";
import { EcommerceClient } from "./EcommerceClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "E-Commerce AI Support Solutions",
  description:
    "Resolve order tracking, returns, shipping inquiries, and pre-purchase sizing questions 24/7 with AI grounded in your live store data.",
  alternates: { canonical: `${SITE_URL}/solutions/ecommerce` },
  openGraph: {
    title: "E-Commerce AI Support Solutions | Elpino",
    description:
      "Resolve order tracking, returns, shipping inquiries, and pre-purchase sizing questions 24/7 with AI grounded in your live store data.",
    url: `${SITE_URL}/solutions/ecommerce`,
    type: "website",
  },
};

const faqItems = [
  {
    q: "How does Elpino check order status?",
    a: "Elpino securely queries your e-commerce platform (Shopify, WooCommerce, BigCommerce, or a custom API) using the customer's verified email and order number. Only the shopper whose account matches sees their order details.",
  },
  {
    q: "Can Elpino issue refunds automatically?",
    a: "You set the rules. Store credit, exchanges, and return labels can be fully automated, while cash refunds above an amount you choose always require human approval. Every proposed action is logged for your team.",
  },
  {
    q: "Which platforms and couriers does it connect to?",
    a: "Shopify, WooCommerce, BigCommerce, and custom storefronts via API — plus courier tracking from DHL, UPS, FedEx, Royal Mail, and regional carriers.",
  },
  {
    q: "Will the widget slow my store down?",
    a: "No. The Elpino widget is under 20KB, loads asynchronously, and is mobile-optimized — it won't hurt your Core Web Vitals or Lighthouse scores.",
  },
  {
    q: "Can it handle Black Friday level traffic?",
    a: "Yes. Elpino answers in parallel, not in queues — thousands of conversations can be verified and resolved simultaneously, so peak-season surges stop being a hiring problem.",
  },
  {
    q: "Does it work across languages for international shoppers?",
    a: "Yes — Elpino supports 95+ languages with accurate product and shipping terminology.",
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

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Elpino for E-Commerce",
  applicationCategory: "BusinessApplication",
  description:
    "AI customer support for e-commerce: automated order tracking (WISMO), policy-exact returns and exchanges, pre-purchase advice, and abandoned-cart recovery.",
  url: `${SITE_URL}/solutions/ecommerce`,
  publisher: { "@type": "Organization", name: "Elpino", url: SITE_URL },
};

export default function EcommerceSolutionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <EcommerceClient />
    </>
  );
}
