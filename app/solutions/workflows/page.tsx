import type { Metadata } from "next";
import { WorkflowsClient } from "./WorkflowsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Support Workflows & Automation Engine | Elpino",
  description:
    "Automate repetitive support operations with visual branching logic, SLA escalation trees, automated tagging, and bi-directional webhooks.",
  alternates: { canonical: `${SITE_URL}/solutions/workflows` },
  openGraph: {
    title: "Support Workflows & Automation Engine | Elpino",
    description:
      "Automate repetitive support operations with visual branching logic, SLA escalation trees, and bi-directional webhooks.",
    url: `${SITE_URL}/solutions/workflows`,
    type: "website",
  },
};

export default function WorkflowsPage() {
  return <WorkflowsClient />;
}
