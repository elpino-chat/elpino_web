import type { Metadata } from "next";
import { AgenciesServicesClient } from "../agencies-services/AgenciesServicesClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Agencies & Services AI Support Solutions | Elpino",
  description:
    "Exceptional client service without a bigger inbox. Answer deliverables questions, protect scope, and coordinate with clients in Slack Connect channels.",
  alternates: { canonical: `${SITE_URL}/solutions/agencies` },
  openGraph: {
    title: "Agencies & Services AI Support Solutions | Elpino",
    description:
      "Exceptional client service without a bigger inbox. Answer deliverables questions, protect scope, and coordinate with clients in Slack Connect channels.",
    url: `${SITE_URL}/solutions/agencies`,
    type: "website",
  },
};

export default function AgenciesSolutionPage() {
  return <AgenciesServicesClient />;
}
