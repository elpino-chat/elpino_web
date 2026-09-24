import type { Metadata } from "next";
import { BusyTeamsClient } from "./BusyTeamsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Busy Teams | Elpino",
  description:
    "Autonomous AI customer service engineered for busy teams. Deflect 89% of routine support tickets, eliminate operator tab-hopping, and keep customer queues calm.",
  alternates: { canonical: `${SITE_URL}/solutions/busy` },
  openGraph: {
    title: "For Busy Teams | Elpino",
    description:
      "Autonomous AI customer service engineered for busy teams. Deflect 89% of routine support tickets, eliminate operator tab-hopping, and keep customer queues calm.",
    url: `${SITE_URL}/solutions/busy`,
    type: "website",
  },
};

export default function BusyOperatorsPage() {
  return <BusyTeamsClient />;
}
