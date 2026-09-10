import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

export async function selectedWorkspaceId(): Promise<string | null> {
  const session = await requireSession();
  if (!session) return null;
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = result.organizations ?? [];
  const workspace = organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
  return workspace?.id ?? null;
}

// Every analytics GET route forwards the same three optional query params
// (siteId, from, to) alongside the resolved companyId.
export function forwardedParams(url: URL, companyId: string) {
  const params = new URLSearchParams({ companyId });
  for (const key of ["siteId", "from", "to"]) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }
  return params;
}
