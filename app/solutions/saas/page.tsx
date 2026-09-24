import type { Metadata } from "next";
import { SaaSSoftwareClient } from "../saas-software/SaaSSoftwareClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "SaaS & Software AI Support Solutions | Elpino",
  description:
    "Automate technical triage, API questions, and account onboarding with verified AI resolutions.",
  alternates: { canonical: `${SITE_URL}/solutions/saas` },
  openGraph: {
    title: "SaaS & Software AI Support Solutions | Elpino",
    description:
      "Automate technical triage, API questions, and account onboarding with verified AI resolutions.",
    url: `${SITE_URL}/solutions/saas`,
    type: "website",
  },
};

export default function SaasSolutionPage() {
  return <SaaSSoftwareClient />;
}
