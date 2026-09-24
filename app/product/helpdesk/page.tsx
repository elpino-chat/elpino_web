import type { Metadata } from "next";
import { HelpdeskClient } from "./HelpdeskClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Customer Support Helpdesk Platform | Elpino",
  description:
    "The next-gen Helpdesk designed for efficiency. Unifies autonomous AI resolution, an AI Copilot for human agents, a lightning-fast shared inbox, omnichannel connectors, and proactive outbound messaging.",
  alternates: { canonical: `${SITE_URL}/product/helpdesk` },
  openGraph: {
    title: "AI Customer Support Helpdesk Platform | Elpino",
    description:
      "The next-gen Helpdesk designed for efficiency. Unifies autonomous AI resolution, an AI Copilot for human agents, a lightning-fast shared inbox, omnichannel connectors, and proactive outbound messaging.",
    url: `${SITE_URL}/product/helpdesk`,
    type: "website",
  },
};

export default function HelpdeskPage() {
  return <HelpdeskClient />;
}
