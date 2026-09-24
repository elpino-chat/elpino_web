import type { Metadata } from "next";
import { AgenciesServicesClient } from "./AgenciesServicesClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Customer Support for Agencies & Professional Services | Elpino",
  description:
    "Exceptional client service without a bigger inbox. Answer deliverables questions, protect scope, and coordinate with clients in Slack Connect channels.",
  alternates: { canonical: `${SITE_URL}/solutions/agencies-services` },
  openGraph: {
    title: "AI Customer Support for Agencies & Professional Services | Elpino",
    description:
      "Exceptional client service without a bigger inbox. Answer deliverables questions, protect scope, and coordinate with clients in Slack Connect channels.",
    url: `${SITE_URL}/solutions/agencies-services`,
    type: "website",
  },
};

export default function AgenciesServicesPage() {
  return <AgenciesServicesClient />;
}
