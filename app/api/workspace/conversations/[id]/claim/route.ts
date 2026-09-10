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
    `/api/workspace/conversations/${encodeURIComponent(id)}/claim`,
    { companyId: workspace.id, userId: accountResult.account.id },
  );

  if (!result.ok) {
    return Response.json({ message: result.error ?? "Could not join conversation" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
