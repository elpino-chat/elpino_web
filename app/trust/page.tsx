import type { Metadata } from "next";
import { TrustClient } from "./TrustClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Trust & Security",
  description:
    "How Elpino protects customer data: private details are swapped out before the AI sees them, conversations are never used to train models, and every customer is verified before the AI acts.",
  alternates: { canonical: `${SITE_URL}/trust` },
  openGraph: {
    title: "Trust & Security | Elpino",
    description:
      "Security you can inspect: private details never reach the model, conversations are never used for training, and access is checked on every request.",
    url: `${SITE_URL}/trust`,
    type: "website",
  },
};

export default function TrustPage() {
  return <TrustClient />;
}
