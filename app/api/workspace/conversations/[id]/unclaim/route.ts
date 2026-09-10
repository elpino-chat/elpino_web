import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** Hands a conversation back — to the AI, unless it was escalated (see ConversationsService.unclaim). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/unclaim`,
    { companyId: workspace.id },
  );

  if (result.error) return Response.json({ message: result.error }, { status: 400 });
  return Response.json(result);
}
