import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway, deleteGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };

// Takes one image out of the "Used before" list. It does not change the avatar in use.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await ownerGuard("change the chatbot");
  if (blocked) return blocked;
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(session.email)}`);
  const organizations = orgResult.organizations ?? [];
  const selected = organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0];
  if (!selected) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const result = await deleteGateway<{ ok?: boolean; error?: string }>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/avatar-history/${encodeURIComponent(id)}`,
  );
  if (!result.payload?.ok) return Response.json({ message: result.payload?.error ?? "Could not remove it" }, { status: 404 });
  return Response.json({ ok: true });
}
