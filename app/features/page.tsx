import type { Metadata } from "next";
import { FeaturesContent } from "./FeaturesContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Chat Widget, Knowledge Base & Human Handoff",
  description:
    "Explore Elpino's AI answers, shared team inbox, knowledge base, human handoff, customer context, and answer audit trail.",
  alternates: { canonical: `${SITE_URL}/features` },
  openGraph: {
    title: "AI Chat Widget, Knowledge Base & Human Handoff",
    description: "Everything your AI and your team need to keep customer conversations moving.",
    url: `${SITE_URL}/features`,
    type: "website",
  },
};

export default function FeaturesPage() {
  return (
    <FeaturesContent />
  );
}
