import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Sparkles, Edit3, CheckCircle2, Zap, BrainCircuit, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Teammate Copilot | Elpino",
  description: "AI-generated reply drafts, conversation summaries, and instant translation to empower human support agents.",
};

export default function CopilotPage() {
  return (
    <ProductFeatureLayout
      category="Copilot"
      title="An AI copilot inside your inbox"
      highlightedTitle="for every human agent."
      description="Draft suggested replies, summarize long threads into 2 sentences, and translate customer inquiries instantly."
      features={[
        {
          title: "AI Draft Suggestions",
          description: "Generates recommended replies grounded in company policy for human teammates to review and send in 1 click.",
          icon: Sparkles,
          badge: "Copilot",
        },
        {
          title: "Instant Thread Summaries",
          description: "Catch up on 20-message customer conversations with concise 2-sentence key takeaway summaries.",
          icon: BrainCircuit,
        },
        {
          title: "Tone & Style Adjustments",
          description: "Rewrite drafted answers to sound more formal, empathetic, or concise with one keyboard shortcut.",
          icon: Edit3,
        },
        {
          title: "Real-Time Multilingual Translation",
          description: "Translate inbound messages from 90+ languages and draft replies in the customer's native tongue.",
          icon: Zap,
        },
        {
          title: "Human Approval Flow",
          description: "Human agents retain final oversight — review, tweak, and approve drafts before sending.",
          icon: CheckCircle2,
        },
        {
          title: "Teammate Collaboration",
          description: "Tag teammates in private internal notes without exposing internal discussions to the customer.",
          icon: Users,
        },
      ]}
      deepDiveTitle="Supercharge human team productivity"
      deepDiveDescription="Help your support agents resolve 3x more tickets with less burnout."
    />
  );
}
