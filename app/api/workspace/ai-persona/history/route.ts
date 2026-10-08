import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };

// The avatars this workspace has uploaded before, for the "Used before" list in the avatar picker.
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(session.email)}`);
  const organizations = orgResult.organizations ?? [];
  const selected = organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0];
  if (!selected) return Response.json({ avatars: [] });

  const result = await callGateway<{ avatars?: Array<{ id: string; url: string; current: boolean }> }>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/avatar-history`,
  ).catch(() => null);
  return Response.json({ avatars: result?.avatars ?? [] }, { headers: { "cache-control": "no-store" } });
}
