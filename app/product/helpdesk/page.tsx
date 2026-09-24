import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { HelpdeskClient } from "./HelpdeskClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Helpdesk",
  description:
    "The whole support desk in one place: a chat widget, an AI agent that answers and acts, a shared inbox, tickets that never get dropped, and the knowledge behind it all.",
  alternates: { canonical: `${SITE_URL}/product/helpdesk` },
  openGraph: {
    title: "Helpdesk | Elpino",
    description:
      "The whole support desk in one place: a chat widget, an AI agent that answers and acts, a shared inbox, tickets that never get dropped, and the knowledge behind it all.",
    url: `${SITE_URL}/product/helpdesk`,
    type: "website",
  },
};

export default function HelpdeskPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Helpdesk", path: "/product/helpdesk" }]} />
      <HelpdeskClient />
    </>
  );
}
