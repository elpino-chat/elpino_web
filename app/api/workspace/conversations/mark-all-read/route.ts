import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };

export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(session.email)}`);
  const organizations = orgResult.organizations ?? [];
  const selected = organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0];
  if (!selected) return Response.json({ ok: false });

  const result = await callGateway<{ ok?: boolean }>("/api/workspace/conversations/mark-all-read", { companyId: selected.id });
  return Response.json(result);
}
