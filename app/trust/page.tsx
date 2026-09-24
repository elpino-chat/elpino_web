import type { Metadata } from "next";
import { TrustClient } from "./TrustClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Trust, Compliance & Enterprise Security",
  description:
    "How Elpino protects customer data: SOC 2 Type II certified, AES-256 and TLS 1.3 encryption, Zero Data Retention for AI training, and enterprise RBAC.",
  alternates: { canonical: `${SITE_URL}/trust` },
  openGraph: {
    title: "Trust, Compliance & Enterprise Security | Elpino",
    description:
      "Enterprise security you can inspect. SOC 2 Type II certified, Zero Data Retention for LLM training, and cryptographic tenant isolation.",
    url: `${SITE_URL}/trust`,
    type: "website",
  },
};

export default function TrustPage() {
  return <TrustClient />;
}
