import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type AccountResult = { account?: { id: string } };
type NotificationEntry = {
  id: string;
  kind: "unread" | "escalated" | "secure_request";
  conversationId: string;
  title: string;
  detail: string;
  createdAt: string;
};

/**
 * Live notifications for the signed-in user in their current workspace —
 * conversations assigned to them with unread activity, escalations, and
 * secure requests waiting to be opened. Computed on read from real state
 * (see workspace-service NotificationsService), not a stored feed, so
 * there's nothing here to go stale or double-send.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) {
    return Response.json({ entries: [] });
  }

  const params = new URLSearchParams({ companyId: workspace.id, userId: accountResult.account.id });
  const result = await callGateway<{ entries?: NotificationEntry[]; error?: string }>(
    `/api/workspace/notifications?${params.toString()}`,
  ).catch(() => null);

  return Response.json({ entries: result?.entries ?? [] });
}
