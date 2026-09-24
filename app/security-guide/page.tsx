import type { Metadata } from "next";
import { SecurityGuideView } from "./SecurityGuideView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Security Guide",
  description:
    "How Elpino protects your data: encrypted credentials, signed webhooks, identity checks and guardrails around the AI.",
  alternates: { canonical: `${SITE_URL}/security-guide` },
  openGraph: {
    title: "Security Guide | Elpino",
    description: "Five layers of protection around your customer conversations, from transport encryption to AI guardrails.",
    url: `${SITE_URL}/security-guide`,
    type: "website",
  },
};

export default function SecurityGuidePage() {
  return <SecurityGuideView />;
}
