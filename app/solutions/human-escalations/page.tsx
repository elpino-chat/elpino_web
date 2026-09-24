import type { Metadata } from "next";
import { HumanEscalationsClient } from "./HumanEscalationsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Human Escalations & Contextual Handoff | Elpino",
  description:
    "Seamlessly hand off customer conversations from AI to human specialists in under 12 seconds with complete context, zero customer repetition, and private whisper briefings.",
  alternates: { canonical: `${SITE_URL}/solutions/human-escalations` },
  openGraph: {
    title: "Human Escalations & Contextual Handoff | Elpino",
    description:
      "A handoff should feel like progress, not a restart. Know exactly when a human specialist should step in.",
    url: `${SITE_URL}/solutions/human-escalations`,
    type: "website",
  },
};

export default function HumanEscalationsPage() {
  return <HumanEscalationsClient />;
}
