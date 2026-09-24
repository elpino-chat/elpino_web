import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { FoundersClient } from "./FoundersClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Founders",
  description:
    "AI support for founders: it answers from your docs, checks real payments, and only alerts you when it truly needs a person.",
  alternates: { canonical: `${SITE_URL}/solutions/founders` },
  openGraph: {
    title: "For Founders | Elpino",
    description:
      "AI support for founders: it answers from your docs, checks real payments, and only alerts you when it truly needs a person.",
    url: `${SITE_URL}/solutions/founders`,
    type: "website",
  },
};

export default function FoundersPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "For Founders", path: "/solutions/founders" }]} />
      <FoundersClient />
    </>
  );
}
