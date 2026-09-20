import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { BookOpen, Search, Sparkles, Globe, FileText, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Self-Service Help Center | Elpino",
  description: "Create beautiful, SEO-optimized public help center documentation that grounds your AI agent automatically.",
};

export default function HelpCenterPage() {
  return (
    <ProductFeatureLayout
      category="Help Center"
      title="Publish verified documentation"
      highlightedTitle="that helps customers 24/7."
      description="Create a branded public help center that empowers customers to find answers independently and grounds your AI agent automatically."
      features={[
        {
          title: "Instant AI Synchronization",
          description: "Every article you publish or update is immediately vectorized and ready for the AI agent to reference.",
          icon: Sparkles,
          badge: "Instant Sync",
        },
        {
          title: "Custom Domain & Branding",
          description: "Host your knowledge base at docs.yourbrand.com with your custom colors, logo, and favicon.",
          icon: Globe,
        },
        {
          title: "Semantic Instant Search",
          description: "Help customers find exact paragraphs with vector-assisted typo-tolerant search in under 50ms.",
          icon: Search,
        },
        {
          title: "Markdown & Rich Media",
          description: "Format articles with syntax-highlighted code blocks, embedded callout boxes, and video walkthroughs.",
          icon: FileText,
        },
        {
          title: "Analytics & Content Gaps",
          description: "Discover what customers are searching for that lacks an existing answer to improve documentation.",
          icon: BookOpen,
        },
        {
          title: "Embed in Chat Widget",
          description: "Let visitors browse and search articles directly inside the floating live chat widget without leaving page.",
          icon: Share2,
        },
      ]}
      deepDiveTitle="Self-service made effortless"
      deepDiveDescription="Reduce inbound ticket volume by over 40% with searchable knowledge."
    />
  );
}
