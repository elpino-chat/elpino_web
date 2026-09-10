import { callGateway } from "@/app/api/auth/_lib/gateway";

export type Organization = { id: string; name: string };

/**
 * The workspace the signed-in user is currently acting in.
 *
 * The organization id doubles as the workspace-service company id — the two
 * services share the key by construction — so the value returned here is what
 * every `companyId` query parameter downstream expects.
 */
export async function selectedWorkspace(email: string): Promise<Organization | null> {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}
