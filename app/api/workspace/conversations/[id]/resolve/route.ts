import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type AccountResult = { account?: { id: string } };

/**
 * The dashboard's Resolve button. Marks the conversation closed and posts
 * "<name> marked this conversation as resolved" into the thread — the same
 * notice the AI posts when it closes one itself (see the mark_resolved tool
 * in ai-core). Reversible by construction: the next message from anyone
 * reopens it, nothing here has to undo it explicitly.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) {
    return Response.json({ message: "No workspace selected" }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/resolve`,
    { companyId: workspace.id, userId: accountResult.account.id },
  );

  if (!result.ok) {
    return Response.json({ message: result.error ?? "Could not resolve this conversation" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
