import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Database, FileText, Globe, RefreshCw, Lock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Vector Knowledge Hub | Elpino",
  description: "Connect documentation, help center articles, Notion pages, and PDF manuals into high-dimensional vector embeddings.",
};

export default function KnowledgeHubPage() {
  return (
    <ProductFeatureLayout
      category="Knowledge Hub"
      title="The unified vector knowledge base"
      highlightedTitle="for enterprise AI."
      description="Connect help docs, Notion wikis, website URLs, and product PDFs. High-dimensional vector embeddings ground every AI response."
      features={[
        {
          title: "Multi-Format Ingestion",
          description: "Upload PDFs, Markdown docs, HTML web sitemaps, and canned macro replies in seconds.",
          icon: FileText,
          badge: "Vector Embeddings",
        },
        {
          title: "Live URL Web Crawling",
          description: "Provide your public documentation URL to crawl and index all nested articles automatically.",
          icon: Globe,
        },
        {
          title: "Instant Vector Sync",
          description: "Generates high-dimensional semantic search vectors via Nomic AI for sub-50ms context retrieval.",
          icon: Database,
        },
        {
          title: "Zero Model Training",
          description: "All uploaded content is encrypted at rest and never used by model providers for generalized training.",
          icon: Lock,
        },
        {
          title: "Auto-Refresh & Re-indexing",
          description: "Set scheduled syncs so newly updated articles are reflected in live AI answers immediately.",
          icon: RefreshCw,
        },
        {
          title: "Snippet Citation Ledger",
          description: "Inspect exact text chunks and source articles retrieved for every customer conversation.",
          icon: Sparkles,
        },
      ]}
      deepDiveTitle="Accurate AI starts with accurate data"
      deepDiveDescription="Clean, semantic chunking ensures your AI always retrieves the right paragraph."
    />
  );
}
