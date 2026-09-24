import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { BusyTeamsClient } from "./BusyTeamsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Busy Teams",
  description:
    "A calmer queue for busy support teams: the AI takes repeat questions, everyone gets the same Join alert, and handoffs carry the full context.",
  alternates: { canonical: `${SITE_URL}/solutions/busy-operators` },
  openGraph: {
    title: "For Busy Teams | Elpino",
    description:
      "A calmer queue for busy support teams: the AI takes repeat questions, everyone gets the same Join alert, and handoffs carry the full context.",
    url: `${SITE_URL}/solutions/busy-operators`,
    type: "website",
  },
};

export default function BusyOperatorsPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "For Busy Teams", path: "/solutions/busy-operators" }]} />
      <BusyTeamsClient />
    </>
  );
}
