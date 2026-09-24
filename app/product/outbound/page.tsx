import type { Metadata } from "next";
import { OutboundClient } from "./OutboundClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Proactive Outbound Messaging & In-App Tours | Elpino",
  description:
    "Support customers before they need to ask. Broadcast incident notices, in-app onboarding walkthroughs, and targeted checklists that deflect support ticket spikes by 42%+.",
  alternates: { canonical: `${SITE_URL}/product/outbound` },
  openGraph: {
    title: "Proactive Outbound Messaging & In-App Tours | Elpino",
    description:
      "Support customers before they need to ask. Broadcast incident notices, in-app onboarding walkthroughs, and targeted checklists that deflect support ticket spikes by 42%+.",
    url: `${SITE_URL}/product/outbound`,
    type: "website",
  },
};

export default function OutboundPage() {
  return <OutboundClient />;
}
