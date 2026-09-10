import type { Metadata } from "next";
import { IntegrationsContent } from "./IntegrationsContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Stripe, Razorpay & Trello Integrations",
  description:
    "Connect Elpino to Stripe or Razorpay so the AI can verify a real order before it answers, and to Trello so an escalation becomes tracked work. Read-only for payment data.",
  alternates: { canonical: `${SITE_URL}/integrations` },
  openGraph: {
    title: "Stripe, Razorpay & Trello Integrations",
    description: "Payments the AI can verify, and tickets your team can track.",
    url: `${SITE_URL}/integrations`,
    type: "website",
  },
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}
