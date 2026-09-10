import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Contact Elpino",
  description: "Talk with the Elpino team about sales, support, partnerships, or enterprise customer support.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return <ContactClient />;
}
