import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { InboxClient } from "./InboxClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Shared Inbox",
  description:
    "One shared inbox for your AI and your team: team-wide Join alerts, clear ownership, visitor context, and hand-back to the AI.",
  alternates: { canonical: `${SITE_URL}/product/inbox` },
  openGraph: {
    title: "Shared Inbox | Elpino",
    description:
      "One shared inbox for your AI and your team: team-wide Join alerts, clear ownership, visitor context, and hand-back to the AI.",
    url: `${SITE_URL}/product/inbox`,
    type: "website",
  },
};

export default function InboxPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Shared Inbox", path: "/product/inbox" }]} />
      <InboxClient />
    </>
  );
}
