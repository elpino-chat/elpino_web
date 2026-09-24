import type { Metadata } from "next";
import { ReportingClient } from "./ReportingClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Helpdesk Reporting & Support Analytics | Elpino",
  description:
    "Get instant insights with AI reporting and analysis. Track human and AI support together, build custom dashboards, and uncover what customers care about most.",
  alternates: { canonical: `${SITE_URL}/product/reporting` },
  openGraph: {
    title: "AI Helpdesk Reporting & Support Analytics | Elpino",
    description:
      "Get instant insights with AI reporting and analysis. Track human and AI support together, build custom dashboards, and uncover what customers care about most.",
    url: `${SITE_URL}/product/reporting`,
    type: "website",
  },
};

export default function ReportingPage() {
  return <ReportingClient />;
}
