import type { Metadata } from "next";
import { TicketsClient } from "./TicketsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Conversational Support Tickets & Linear Sync | Elpino",
  description:
    "Tickets that keep the conversation moving. Frontline customer tickets, internal back-office escalations, and tracker issues synced bi-directionally with Linear and GitHub.",
  alternates: { canonical: `${SITE_URL}/product/tickets` },
  openGraph: {
    title: "Conversational Support Tickets & Linear Sync | Elpino",
    description:
      "Tickets that keep the conversation moving. Frontline customer tickets, internal back-office escalations, and tracker issues synced bi-directionally with Linear and GitHub.",
    url: `${SITE_URL}/product/tickets`,
    type: "website",
  },
};

export default function TicketsPage() {
  return <TicketsClient />;
}
