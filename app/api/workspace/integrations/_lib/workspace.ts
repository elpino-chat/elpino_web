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
