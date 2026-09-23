import type { Metadata } from "next";
import { InboxClient } from "./InboxClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Helpdesk Inbox & Collaboration | Elpino",
  description:
    "Work smarter and collaborate faster with Elpino's configurable shared inbox. Designed for speed, real-time presence, keyboard shortcuts, and AI Copilot assistance.",
  alternates: { canonical: `${SITE_URL}/product/inbox` },
  openGraph: {
    title: "AI Helpdesk Inbox & Collaboration | Elpino",
    description:
      "Work smarter and collaborate faster with Elpino's configurable shared inbox. Designed for speed, real-time presence, keyboard shortcuts, and AI Copilot assistance.",
    url: `${SITE_URL}/product/inbox`,
    type: "website",
  },
};

export default function InboxPage() {
  return <InboxClient />;
}
