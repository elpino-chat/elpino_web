import type { Metadata } from "next";
import { ProductFeatureLayout } from "../../components/product/ProductFeatureLayout";
import { Code, Zap, Shield, Workflow, Layers, BarChart3, Database, Users } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "SaaS & Software AI Support Solutions",
  description: "Automate technical triage, API questions, and account onboarding with verified AI resolutions.",
  alternates: { canonical: `${SITE_URL}/solutions/saas` },
  openGraph: {
    title: "SaaS & Software AI Support Solutions | Elpino",
    description: "Automate technical triage, API questions, and account onboarding with verified AI resolutions.",
    url: `${SITE_URL}/solutions/saas`,
    type: "website",
  },
};

export default function SaasSolutionPage() {
  return (
    <ProductFeatureLayout
      category="Solutions / Industry"
      title="Turn complex software docs into"
      highlightedTitle="instant technical resolutions."
      description="Resolve API queries, subscription questions, and technical onboarding 24/7 with zero hallucination risk."
      primaryCtaText="Start free for SaaS"
      features={[
        {
          title: "API & Code Snippet Guidance",
          description: "Ingest Markdown docs, OpenAPI schemas, and GitHub repos to answer syntax questions with verified code blocks.",
          icon: Code,
          badge: "Developer Ready",
        },
        {
          title: "Subscription & Stripe Lookups",
          description: "Check customer plan limits, invoice history, and seat counts securely without manual lookups.",
          icon: Zap,
        },
        {
          title: "Zero-Hallucination Guardrails",
          description: "Strict grounding ensures the AI only recommends supported endpoints and documented SDK methods.",
          icon: Shield,
        },
        {
          title: "Bug & Issue Escalation",
          description: "Route bug reports with browser logs and user session metadata directly to engineering channels.",
          icon: Workflow,
        },
        {
          title: "Feature Request Tracking",
          description: "Tag and categorize incoming feature requests with user tier data and ARR context.",
          icon: Layers,
        },
        {
          title: "Retention & Churn Signals",
          description: "Detect cancellation sentiment and trigger proactive winback offers or founder alerts instantly.",
          icon: BarChart3,
        },
      ]}
      deepDiveTitle="Built for high-velocity software teams"
      deepDiveDescription="From sandbox onboarding to enterprise SLA handoffs, Elpino handles the repetitive questions so your engineers can build."
      deepDiveItems={[
        {
          title: "Live Documentation Sync",
          description: "Connect GitBook, Mintlify, Notion, or custom developer portals to keep answers fresh on every commit.",
          icon: Database,
          accentColor: "#168cff",
        },
        {
          title: "Deterministic Code Execution",
          description: "Explain webhook payloads and error codes with precision and verified documentation citations.",
          icon: Zap,
          accentColor: "#ff6038",
        },
        {
          title: "High-Tier VIP Routing",
          description: "Direct enterprise customers to designated account managers and priority Slack channels immediately.",
          icon: Users,
          accentColor: "#8557e8",
        },
      ]}
      stats={[
        { value: "78%", label: "First-contact SaaS resolution" },
        { value: "< 2s", label: "Average API answer latency" },
        { value: "100%", label: "Doc-grounded citations" },
        { value: "0", label: "Missed high-ARR tickets" },
      ]}
      faqItems={[
        {
          q: "How does Elpino learn our software documentation?",
          a: "You can sync your public docs URL, sitemap, OpenAPI JSON, or internal knowledge base. Elpino crawls, chunks, and indexes it with continuous sync.",
        },
        {
          q: "Can Elpino trigger actions in our backend?",
          a: "Yes. Using secure MCP tools and webhooks, Elpino can verify customer accounts, retrieve license keys, or trigger password reset links.",
        },
        {
          q: "What happens when a customer reports an obscure bug?",
          a: "If the question is not documented with high confidence, Elpino captures reproduction steps and hands off the conversation cleanly to your team.",
        },
      ]}
    />
  );
}
