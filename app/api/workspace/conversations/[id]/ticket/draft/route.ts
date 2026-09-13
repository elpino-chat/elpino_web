import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type DraftResult = {
  providers?: { provider: "trello" | "asana"; label: string; detail: string | null }[];
  asanaProjects?: { gid: string; name: string }[];
  suggestedTitle?: string;
  suggestedNote?: string;
  error?: string;
  needsIntegration?: boolean;
};

/** What to prefill the "Create ticket" dialog with: connected tools, Asana projects, and an AI-drafted title/summary. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<DraftResult>("/api/workspace/agent/ticket/draft", {
    companyId: workspace.id,
    conversationId: id,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json(
      { message: result?.error ?? "Could not prepare the ticket", needsIntegration: result?.needsIntegration ?? false },
      { status: 400 },
    );
  }
  return Response.json(result);
}
