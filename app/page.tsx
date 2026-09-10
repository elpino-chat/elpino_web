import type { Metadata } from "next";
import Script from "next/script";
import { HomeHero } from "./components/home/HomeHero";
import { FeatureCarousel } from "./components/home/FeatureCarousel";
import { CanvasCodeSection } from "./components/home/CanvasCodeSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

// Kept in sync with the site's real product by hand rather than by import,
// since JSON-LD has to be a plain serialisable object — but the two must
// never drift: Google's structured-data guidelines require markup to
// describe what the business actually is. This previously described an
// internal-automation "operator" product; Elpino is an AI customer support
// platform (chat widget, knowledge base, human handoff, seat + resolution
// pricing) — see /pricing and /features for the parts of the site already
// rewritten to match. Update this block if the product's shape changes.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Elpino",
  url: SITE_URL,
  logo: `${SITE_URL}/elpino.png`,
  description:
    "Elpino is an AI customer support platform. Its AI agent answers customers instantly from your own knowledge base and hands off to a human teammate the moment it can't help.",
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Elpino",
  url: SITE_URL,
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Elpino",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI customer support with a live chat widget, a knowledge base the AI answers from, and automatic handoff to a human teammate when it can't help — plus seats, visitor analytics, and secure one-time information requests.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available, no card required",
  },
  featureList: [
    "AI agent that answers from your own knowledge base",
    "Automatic handoff to a human teammate when the AI can't help",
    "Embeddable website chat widget",
    "Shared team inbox with seat-based pricing",
    "Visitor location and device details on every conversation",
    "Secure one-time requests for sensitive customer information",
  ],
};

export default function Home() {
  return (
    <>
      {[organizationSchema, websiteSchema, softwareSchema].map((schema) => (
        <script key={schema['@type']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      ))}
      <HomeHero />
      <CanvasCodeSection />
      <FeatureCarousel />
      {/* Dogfooding: this is a real site tag (Settings → Tag Manager),
          registered for this exact Cloud Run hostname — see
          docker-compose/SETUP notes if this ever moves to a custom domain,
          the tag would need re-registering under the new host. next/script
          with afterInteractive matches the async loading this codebase
          already uses for third-party scripts (see Analytics.tsx). */}
      <Script
        src="https://cdn.elpino.chat/tag.js"
        data-site-key="rz_site_8e7db3a271be79a174f95d6bc4b976"
        strategy="afterInteractive"
      />
    </>
  );
}
