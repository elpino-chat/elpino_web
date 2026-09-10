import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** "Summarize with AI" — a one-shot summary of the thread, for a teammate skimming it. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ summary?: string; error?: string }>("/api/workspace/agent/summarize", {
    companyId: workspace.id,
    conversationId: id,
  }).catch(() => null);

  if (!result || result.error || !result.summary) {
    return Response.json({ message: result?.error ?? "Could not summarize this conversation" }, { status: 400 });
  }
  return Response.json({ summary: result.summary });
}
