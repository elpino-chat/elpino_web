import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Sparkles, BrainCircuit, ShieldCheck, Zap, Lock, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Autonomous AI Support Agent | Elpino",
  description: "Deploy an intelligent customer support AI agent trained exclusively on your company's verified knowledge base.",
};

export default function AiAgentPage() {
  return (
    <ProductFeatureLayout
      category="AI Agent"
      title="The intelligent customer agent"
      highlightedTitle="that never hallucinates."
      description="Ground your customer support AI directly in your product docs, website guides, and return policies with multi-model intelligence."
      features={[
        {
          title: "Multi-Model Intelligence",
          description: "Powered by Claude 3.5, OpenAI GPT-4o, and xAI Grok for high-nuance, instant customer reasoning.",
          icon: BrainCircuit,
          badge: "Enterprise",
        },
        {
          title: "Zero Model Training",
          description: "Your proprietary customer inquiries and uploaded documentation are never used to train public AI models.",
          icon: Lock,
        },
        {
          title: "Instant Sub-2s Responses",
          description: "Delivers accurate, empathetic answers while visitors are still looking at your pricing or checkout page.",
          icon: Zap,
        },
        {
          title: "Vector Knowledge Sync",
          description: "Indexes help center articles, Notion pages, and PDF manuals into high-dimensional vector embeddings.",
          icon: BookOpen,
        },
        {
          title: "Answer Verification Ledger",
          description: "Transparently logs the exact policy citation and document section behind each generated reply.",
          icon: ShieldCheck,
        },
        {
          title: "Confidence-Score Escalation",
          description: "Detects ambiguous or edge-case inquiries and transfers seamlessly to human agents.",
          icon: Sparkles,
        },
      ]}
      deepDiveTitle="Autonomous assistance you can trust"
      deepDiveDescription="Speed without sacrificing brand integrity or customer trust."
    />
  );
}
