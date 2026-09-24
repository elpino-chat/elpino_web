import type { Metadata } from "next";
import { VisitorIntelligenceClient } from "./VisitorIntelligenceClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Visitor Intelligence & Real-Time Telemetry | Elpino",
  description:
    "Give support teams real-time context: page breadcrumbs, dwell time, rage click alerts, B2B firmographic enrichment, and live CRM subscription history.",
  alternates: { canonical: `${SITE_URL}/solutions/visitor-intelligence` },
  openGraph: {
    title: "Visitor Intelligence & Real-Time Telemetry | Elpino",
    description:
      "A better conversation starts with better context. Understand visitors before you reply.",
    url: `${SITE_URL}/solutions/visitor-intelligence`,
    type: "website",
  },
};

export default function VisitorIntelligencePage() {
  return <VisitorIntelligenceClient />;
}
