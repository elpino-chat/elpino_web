import type { Metadata } from "next";
import { PricingClient } from "./PricingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Elpino pricing: your plan buys AI resolutions, extra teammates are $1/month on every plan. Escalations to a human are never billed.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing",
    description:
      "Pay for answers, not for seats. Elpino plans buy AI resolutions; extra teammates cost $1/month on every plan.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description:
      "Pay for answers, not for seats — Elpino plans buy AI resolutions, teammates cost $1/month.",
  },
};

// Mirrors app/components/PricingCards.tsx, itself a mirror of
// apps/workspace-service/src/billing/plans.ts — keep all three in sync.
const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Elpino",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter (monthly)", price: "12.50", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter (annual)", price: "120", priceCurrency: "USD" },
    { "@type": "Offer", name: "Growth (annual)", price: "566.40", priceCurrency: "USD" },
    { "@type": "Offer", name: "Scale (annual)", price: "2870.40", priceCurrency: "USD" },
    { "@type": "Offer", name: "Growth", price: "59", priceCurrency: "USD" },
    { "@type": "Offer", name: "Scale", price: "299", priceCurrency: "USD" },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PricingClient />
    </>
  );
}
