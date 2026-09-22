import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Headphones, Inbox, Users, ShieldCheck, Zap, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Helpdesk Platform | Elpino",
  description: "Modern customer support helpdesk powered by AI resolution and seamless human teammate escalation.",
};

export default function HelpdeskPage() {
  return (
    <ProductFeatureLayout
      category="Helpdesk"
      title="The AI-native customer"
      highlightedTitle="helpdesk platform."
      description="An all-in-one support workspace designed to resolve routine tickets instantly with AI and hand off complex queries to human operators."
      features={[
        {
          title: "Unified Support Inbox",
          description: "Manage chat widget, email, and social messages in a single collaborative interface.",
          icon: Inbox,
          badge: "Core",
        },
        {
          title: "Autonomous AI Agent",
          description: "Resolves up to 85% of incoming customer inquiries with verified knowledge grounding.",
          icon: Sparkles,
        },
        {
          title: "Human Teammate Handoff",
          description: "Escalates uncertain queries with full thread history and zero penalty fees.",
          icon: Users,
        },
        {
          title: "Resolution-Based Pricing",
          description: "Pay only when the AI successfully helps a customer, not for unused agent seats.",
          icon: Zap,
        },
        {
          title: "Answer Audit Trail",
          description: "Every AI reply logs the exact knowledge doc, policy version, and timestamp used.",
          icon: ShieldCheck,
        },
        {
          title: "Omnichannel Routing",
          description: "Intelligently assign conversations across departments based on urgency and topic.",
          icon: Headphones,
        },
      ]}
      deepDiveTitle="Built to answer. Designed to help."
      deepDiveDescription="Everything your team needs to provide fast, reliable, empathetic customer assistance."
    />
  );
}
