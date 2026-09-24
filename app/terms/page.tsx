import type { Metadata } from "next";
import { TermsView } from "./TermsView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Elpino — the simple AI customer support platform with real human backup.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return <TermsView />;
}
