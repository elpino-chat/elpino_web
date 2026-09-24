import type { Metadata } from "next";
import { CopilotClient } from "./CopilotClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Teammate Copilot for Customer Support | Elpino",
  description:
    "An AI teammate for support agents—grounded drafts, clearer context, and human approval. Cuts average ticket handling time by 31% with 1-click approvals.",
  alternates: { canonical: `${SITE_URL}/product/copilot` },
  openGraph: {
    title: "AI Teammate Copilot for Customer Support | Elpino",
    description:
      "An AI teammate for support agents—grounded drafts, clearer context, and human approval. Cuts average ticket handling time by 31% with 1-click approvals.",
    url: `${SITE_URL}/product/copilot`,
    type: "website",
  },
};

export default function CopilotPage() {
  return <CopilotClient />;
}
