import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { KnowledgeHubClient } from "./KnowledgeHubClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description:
    "Teach Elpino from your website, sitemap, PDFs, Word documents, and pages you write. Answers come only from the knowledge you approve.",
  alternates: { canonical: `${SITE_URL}/product/knowledge-hub` },
  openGraph: {
    title: "Knowledge Hub | Elpino",
    description:
      "Teach Elpino from your website, sitemap, PDFs, Word documents, and pages you write. Answers come only from the knowledge you approve.",
    url: `${SITE_URL}/product/knowledge-hub`,
    type: "website",
  },
};

export default function KnowledgeHubPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Knowledge Hub", path: "/product/knowledge-hub" }]} />
      <KnowledgeHubClient />
    </>
  );
}
