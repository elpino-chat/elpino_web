import type { Metadata } from "next";
import { ChannelsClient } from "./ChannelsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Omnichannel Customer Support & Channels | Elpino",
  description:
    "Manage all your customer channels—from website live chat and email to Slack Connect, WhatsApp, and Telegram—in one connected omnichannel platform.",
  alternates: { canonical: `${SITE_URL}/product/channels` },
  openGraph: {
    title: "Omnichannel Customer Support & Channels | Elpino",
    description:
      "Manage all your customer channels—from website live chat and email to Slack Connect, WhatsApp, and Telegram—in one connected omnichannel platform.",
    url: `${SITE_URL}/product/channels`,
    type: "website",
  },
};

export default function ChannelsPage() {
  return <ChannelsClient />;
}
