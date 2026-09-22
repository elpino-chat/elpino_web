import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const docsPages = [
  { href: "/docs", title: "Overview", short: "Start here", group: "Get started", description: "Set up Elpino and understand the support workflow." },
  { href: "/docs/knowledge", title: "Knowledge base", short: "Trusted sources", group: "AI support", description: "Give the AI accurate, customer-ready information." },
  { href: "/docs/ai-answers", title: "AI answers", short: "Answers and handoff", group: "AI support", description: "Understand answer generation, confidence, and escalation." },
  { href: "/docs/chat-widget", title: "Chat widget", short: "Install and configure", group: "Chat widget", description: "Add Elpino to your website and configure visitor details." },
  { href: "/docs/identity-verification", title: "Identity verification", short: "Identify signed-in users", group: "Chat widget", description: "Safely identify customers before accessing private data." },
  { href: "/docs/inbox", title: "Team inbox", short: "Human support", group: "Team workspace", description: "Claim, route, reply to, and resolve conversations." },
  { href: "/docs/integrations", title: "Integrations", short: "Connect your tools", group: "Connect", description: "Connect payment, project, and MCP tools." },
  { href: "/docs/billing", title: "Billing and usage", short: "Credits and plans", group: "Platform", description: "Understand plans, resolution credits, seats, and recharge." },
  { href: "/docs/security", title: "Security", short: "Protect customer data", group: "Platform", description: "Learn how identity, credentials, tenancy, and privacy are handled." },
  { href: "/docs/troubleshooting", title: "Troubleshooting", short: "Fix common issues", group: "Help", description: "Diagnose widget, knowledge, identity, realtime, and billing issues." },
] as const;

export type DocsHref = (typeof docsPages)[number]["href"];

export const docsToc: Record<DocsHref, ReadonlyArray<{ id: string; label: string }>> = {
  "/docs": [{ id: "start", label: "Start with the essentials" }, { id: "quickstart", label: "Quickstart" }],
  "/docs/knowledge": [{ id: "sources", label: "Source of truth" }, { id: "quality", label: "Accurate retrieval" }, { id: "next", label: "Next step" }],
  "/docs/ai-answers": [{ id: "answer-flow", label: "Answer flow" }, { id: "handoff", label: "Human handoff" }, { id: "prepare", label: "Prepare better answers" }],
  "/docs/chat-widget": [{ id: "install", label: "Add the site tag" }, { id: "details", label: "Collect visitor details" }, { id: "identity", label: "Signed-in customers" }],
  "/docs/identity-verification": [{ id: "why", label: "Why you need it" }, { id: "how-it-works", label: "How it works" }, { id: "setup", label: "Set it up" }, { id: "claims", label: "Token claims" }, { id: "security", label: "Keep it secure" }, { id: "troubleshooting", label: "Troubleshooting" }],
  "/docs/inbox": [{ id: "views", label: "AI Assist and Team Inbox" }, { id: "workflow", label: "Work a conversation" }, { id: "routing", label: "Assignment and availability" }],
  "/docs/integrations": [{ id: "available", label: "Available connections" }, { id: "connect", label: "Connect safely" }],
  "/docs/billing": [{ id: "credits", label: "Usage and credits" }, { id: "payments", label: "Payment confirmation" }, { id: "recharge", label: "Automatic recharge" }],
  "/docs/security": [{ id: "boundaries", label: "Trust boundaries" }, { id: "credentials", label: "Sensitive data" }, { id: "privacy", label: "Privacy operations" }],
  "/docs/troubleshooting": [{ id: "widget", label: "Widget does not appear" }, { id: "answers", label: "Missing or outdated answers" }, { id: "handoff", label: "Handoff and realtime" }, { id: "identity", label: "Identity and billing" }],
};

export function docsMetadata(href: DocsHref, title: string, description: string): Metadata {
  const url = `${SITE_URL}${href}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: `${title} | Elpino Docs`, description, url, type: "article", siteName: "Elpino" },
    twitter: { card: "summary_large_image", title: `${title} | Elpino Docs`, description },
  };
}
