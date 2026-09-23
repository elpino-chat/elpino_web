import type { Metadata } from "next";
import { requireSession } from "../api/onboarding/_lib/require-user";
import { PricingClient } from "./PricingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Elpino pricing: your plan buys AI resolutions, extra teammates come in seat packs from $0.60 a seat. Escalations to a human are never billed.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing",
    description:
      "Pay for answers, not for seats. Elpino plans buy AI resolutions; extra teammates come in seat packs from $0.60 a seat.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description:
      "Pay for answers, not for seats — Elpino plans buy AI resolutions, teammates come in seat packs from $0.60 a seat.",
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
    { "@type": "Offer", name: "Starter (monthly)", price: "12", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter (annual)", price: "120", priceCurrency: "USD" },
    { "@type": "Offer", name: "Growth (annual)", price: "590", priceCurrency: "USD" },
    { "@type": "Offer", name: "Scale (annual)", price: "2990", priceCurrency: "USD" },
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

export default async function PricingPage() {
  // A signed-in visitor clicking a plan CTA wants to act on their existing
  // workspace, not create a second account — routing them through /signup
  // again just dead-ends back at a login they've already done.
  const session = await requireSession().catch(() => null);

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
      <PricingClient loggedIn={!!session} />
    </>
  );
}
