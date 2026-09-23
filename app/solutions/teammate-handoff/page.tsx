import type { Metadata } from "next";
import { TeammateHandoffClient } from "./TeammateHandoffClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Teammate Handoff & Internal Collaboration | Elpino",
  description:
    "Hand conversations across Support, Engineering, Billing, and Sales without losing context. Features private whisper notes, @mentions, Linear issue sync, and collision locking.",
  alternates: { canonical: `${SITE_URL}/solutions/teammate-handoff` },
  openGraph: {
    title: "Teammate Handoff & Internal Collaboration | Elpino",
    description:
      "Hand conversations across Support, Engineering, Billing, and Sales without losing the thread.",
    url: `${SITE_URL}/solutions/teammate-handoff`,
    type: "website",
  },
};

export default function TeammateHandoffPage() {
  return <TeammateHandoffClient />;
}
