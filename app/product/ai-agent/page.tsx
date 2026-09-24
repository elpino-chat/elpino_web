import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { AiAgentClient } from "./AiAgentClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "AI Agent",
  description:
    "An AI agent that remembers your customer, verifies who they are, checks payments and calls your own systems through MCP, within limits you set.",
  alternates: { canonical: `${SITE_URL}/product/ai-agent` },
  openGraph: {
    title: "AI Agent | Elpino",
    description:
      "An AI agent that remembers your customer, verifies who they are, checks payments and calls your own systems through MCP, within limits you set.",
    url: `${SITE_URL}/product/ai-agent`,
    type: "website",
  },
};

export default function AiAgentPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "AI Agent", path: "/product/ai-agent" }]} />
      <AiAgentClient />
    </>
  );
}
