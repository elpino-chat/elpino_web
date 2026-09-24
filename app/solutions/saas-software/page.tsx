import type { Metadata } from "next";
import { SaaSSoftwareClient } from "./SaaSSoftwareClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Customer Support for SaaS & Software Teams | Elpino",
  description:
    "Support that knows your software as well as your best engineer. Deflect 84% of developer and setup inquiries, sync Linear bug issues, and accelerate Stripe self-serve upgrades.",
  alternates: { canonical: `${SITE_URL}/solutions/saas-software` },
  openGraph: {
    title: "AI Customer Support for SaaS & Software Teams | Elpino",
    description:
      "Support that knows your software as well as your best engineer. Deflect 84% of developer and setup inquiries, sync Linear bug issues, and accelerate Stripe self-serve upgrades.",
    url: `${SITE_URL}/solutions/saas-software`,
    type: "website",
  },
};

export default function SaaSSoftwarePage() {
  return <SaaSSoftwareClient />;
}
