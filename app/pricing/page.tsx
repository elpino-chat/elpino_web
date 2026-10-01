import type { Metadata } from "next";
import { PricingShell } from "./PricingShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Elpino pricing: 100 free AI messages, then a monthly AI credit on paid plans. Seats are unlimited. Handing off to a human never costs extra.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: "Pricing",
    description:
      "Start with 100 free AI messages. Paid plans include a monthly AI credit; seats are unlimited.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description:
      "100 free AI messages, then a monthly AI credit — seats are unlimited.",
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
    { "@type": "Offer", name: "Growth (annual)", price: "588", priceCurrency: "USD" },
    { "@type": "Offer", name: "Scale (annual)", price: "2988", priceCurrency: "USD" },
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
      <PricingShell />
    </>
  );
}
