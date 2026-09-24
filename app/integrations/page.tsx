import type { Metadata } from "next";
import { IntegrationsContent } from "./IntegrationsContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect Stripe, Razorpay, Cashfree or Paystack for payments, Trello or Asana for tickets, and your own MCP servers. The AI only uses what you switch on.",
  alternates: { canonical: `${SITE_URL}/integrations` },
  openGraph: {
    title: "Integrations",
    description: "Payments, tickets and your own systems, plugged into Elpino.",
    url: `${SITE_URL}/integrations`,
    type: "website",
  },
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}
