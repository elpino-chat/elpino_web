import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type AccountResult = { account?: { id: string } };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) return Response.json({ busy: false, openConversations: 0 });

  const result = await callGateway<{ busy?: boolean; openConversations?: number; error?: string }>(
    `/api/workspace/conversations/my-status?companyId=${encodeURIComponent(workspace.id)}&userId=${encodeURIComponent(accountResult.account.id)}`,
  );
  return Response.json(result.error ? { busy: false, openConversations: 0, message: result.error } : result);
}
