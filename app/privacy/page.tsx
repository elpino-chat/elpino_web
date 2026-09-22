import type { Metadata } from "next";
import { PrivacyView } from "./PrivacyView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Elpino collects, processes, and protects your data — customer conversations, OAuth tokens, third-party AI provider safeguards (OpenAI, Claude, xAI, DeepSeek, GLM, Nomic), retention, and your rights.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "Privacy Policy | Elpino",
    description:
      "Understand how Elpino protects your workspace data, customer inquiries, and AI integrations with zero model training.",
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Elpino",
    description:
      "Understand how Elpino protects your workspace data, customer inquiries, and AI integrations with zero model training.",
  },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
