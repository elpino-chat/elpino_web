import { notFound } from "next/navigation";
import { VisitorsClient, type VisitorView } from "../_visitors-client";

const views = new Set<VisitorView>(["realtime", "analytics", "pages", "installation"]);

export default async function VisitorDetailPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!views.has(view as VisitorView)) notFound();
  return <VisitorsClient view={view as VisitorView} />;
}
