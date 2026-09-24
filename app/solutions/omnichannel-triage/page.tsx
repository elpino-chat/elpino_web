import type { Metadata } from "next";
import { OmnichannelTriageClient } from "./OmnichannelTriageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Omnichannel Triage | Elpino",
  description:
    "Unify live chat, support email, Slack Connect, and mobile messaging into one calm, AI-triaged pipeline with sub-second intent classification.",
  alternates: { canonical: `${SITE_URL}/solutions/omnichannel-triage` },
  openGraph: {
    title: "Omnichannel Triage | Elpino",
    description:
      "Unify live chat, support email, Slack Connect, and mobile messaging into one calm, AI-triaged pipeline with sub-second intent classification.",
    url: `${SITE_URL}/solutions/omnichannel-triage`,
    type: "website",
  },
};

export default function OmnichannelTriagePage() {
  return <OmnichannelTriageClient />;
}
