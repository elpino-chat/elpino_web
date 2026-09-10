import { notFound } from "next/navigation";
import { KnowledgeClient, type KnowledgeView } from "../_knowledge-client";

const views = new Set<KnowledgeView>(["articles", "sources"]);

export default async function KnowledgeDetailPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!views.has(view as KnowledgeView)) notFound();
  return <KnowledgeClient view={view as KnowledgeView} />;
}
