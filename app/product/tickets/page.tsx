import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { TicketsClient } from "./TicketsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "When the AI can't finish and nobody's free, Elpino files a ticket with the reason and summary, sends it to Trello, Asana or your Issues page, and gives the customer a reference.",
  alternates: { canonical: `${SITE_URL}/product/tickets` },
  openGraph: {
    title: "Tickets | Elpino",
    description:
      "When the AI can't finish and nobody's free, Elpino files a ticket with the reason and summary, sends it to Trello, Asana or your Issues page, and gives the customer a reference.",
    url: `${SITE_URL}/product/tickets`,
    type: "website",
  },
};

export default function TicketsPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Tickets", path: "/product/tickets" }]} />
      <TicketsClient />
    </>
  );
}
