import type { Metadata } from "next";
import { RevenueTeamsClient } from "./RevenueTeamsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Revenue Teams | Elpino",
  description:
    "Autonomous AI inbound conversion intelligence for revenue teams. Answer pricing, qualify enterprise buyers, sync Stripe context, and book demos in real time.",
  alternates: { canonical: `${SITE_URL}/solutions/revenue` },
  openGraph: {
    title: "For Revenue Teams | Elpino",
    description:
      "Autonomous AI inbound conversion intelligence for revenue teams. Answer pricing, qualify enterprise buyers, sync Stripe context, and book demos in real time.",
    url: `${SITE_URL}/solutions/revenue`,
    type: "website",
  },
};

export default function RevenueTeamsPage() {
  return <RevenueTeamsClient />;
}
