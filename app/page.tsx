import type { Metadata } from "next";
import { HomeView } from "./components/home/HomeView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Elpino | The AI-native customer support platform that takes real action",
  description:
    "Most AI support tools fall apart when things get complicated. Elpino takes real action: resolves repetitive tickets, checks live payments, executes warm handoffs, and files fail-safe tickets.",
  alternates: { canonical: SITE_URL },
};

// Kept in sync with the site's real product by hand rather than by import,
// since JSON-LD has to be a plain serialisable object — but the two must
// never drift: Google's structured-data guidelines require markup to
// describe what the business actually is.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Elpino",
  url: SITE_URL,
  logo: `${SITE_URL}/elpino.png`,
  description:
    "Elpino is the AI-native customer support platform that takes real action. Resolves repetitive tickets, executes live payment checks, and hands off warm to human teammates with zero context lost.",
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
    "AI customer support that acts: resolves repetitive tickets from approved knowledge, checks live orders and payments, executes warm human handoffs with full context, and automatically files tickets when teammates are busy.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available, no card required",
  },
  featureList: [
    "Autonomous AI agent that resolves repeat tickets from approved knowledge",
    "Grounded AI with zero hallucinations and real system tools",
    "100% warm human handoff with full conversation dossier and visitor context",
    "90-second ticket fail-safe so no customer conversation is ever dropped",
    "Real-time payment and order checks via Stripe, Razorpay, and MCP",
    "Shared team inbox with no per-seat penalty",
  ],
};

export default function Home() {
  return (
    <>
      {[organizationSchema, websiteSchema, softwareSchema].map((schema) => (
        <script key={schema['@type']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      ))}
      <HomeView />
    </>
  );
}
