import type { Metadata } from "next";
import { KnowledgeHubClient } from "./KnowledgeHubClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Knowledge Hub & Content Management | Elpino",
  description:
    "Centralize your support content for AI and human support. Connect Notion, Zendesk, Confluence, and PDFs to power verified, grounded customer answers.",
  alternates: { canonical: `${SITE_URL}/product/knowledge-hub` },
  openGraph: {
    title: "AI Knowledge Hub & Content Management | Elpino",
    description:
      "Centralize your support content for AI and human support. Connect Notion, Zendesk, Confluence, and PDFs to power verified, grounded customer answers.",
    url: `${SITE_URL}/product/knowledge-hub`,
    type: "website",
  },
};

export default function KnowledgeHubPage() {
  return <KnowledgeHubClient />;
}
