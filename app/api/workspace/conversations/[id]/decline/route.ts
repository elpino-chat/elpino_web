import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type AccountResult = { account?: { id: string } };

/**
 * The "Cancel" button on the real-time assignment toast — hands the
 * conversation back and immediately looks for someone else, rather than
 * leaving it assigned to whoever just said they can't take it.
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

  const result = await callGateway<{ assignedUserId?: string | null; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/decline`,
    { companyId: workspace.id, userId: accountResult.account.id },
  );

  if (result.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  return Response.json(result);
}
