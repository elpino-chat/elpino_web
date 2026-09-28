import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

// What the workspace still has importing in the background: pages waiting, pages being read,
// and the ones that recently failed.
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const result = await callGateway<{ pending?: number; active?: number; failed?: { url: string; error: string }[]; error?: string }>(
    `/api/workspace/knowledge/import-status?companyId=${encodeURIComponent(workspace.id)}`,
  );
  if (result.error) return Response.json({ message: result.error }, { status: 400 });
  return Response.json({ pending: result.pending ?? 0, active: result.active ?? 0, failed: result.failed ?? [] });
}
