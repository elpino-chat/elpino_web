import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type TicketResult = {
  ticket?: { provider: string; id: string; url: string | null; title: string };
  error?: string;
  needsIntegration?: boolean;
};

/** Files a ticket about this conversation in the workspace's connected project tool. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { title?: string; note?: string };

  const result = await callGateway<TicketResult>("/api/workspace/agent/ticket", {
    companyId: workspace.id,
    conversationId: id,
    title: body.title,
    note: body.note,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json(
      { message: result?.error ?? "Could not create the ticket", needsIntegration: result?.needsIntegration ?? false },
      { status: 400 },
    );
  }
  return Response.json(result);
}
