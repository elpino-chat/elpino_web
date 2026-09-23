import type { Metadata } from "next";
import { AiAgentClient } from "./AiAgentClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Autonomous AI Customer Service Agent | Elpino",
  description:
    "An autonomous customer support agent grounded in the knowledge and boundaries you set. Resolves up to 76%+ of routine tickets with verified citations and graceful human escalation.",
  alternates: { canonical: `${SITE_URL}/product/ai-agent` },
  openGraph: {
    title: "Autonomous AI Customer Service Agent | Elpino",
    description:
      "An autonomous customer support agent grounded in the knowledge and boundaries you set. Resolves up to 76%+ of routine tickets with verified citations and graceful human escalation.",
    url: `${SITE_URL}/product/ai-agent`,
    type: "website",
  },
};

export default function AiAgentPage() {
  return <AiAgentClient />;
}
