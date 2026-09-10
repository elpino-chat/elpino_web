import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread?: number;
  status: "open" | "waiting" | "resolved";
  assignedUserId?: string | null;
  handledBy?: string;
  siteId?: string | null;
  siteDomain?: string | null;
  location?: {
    ip: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    userAgent: string | null;
    seenAt: string | null;
  };
};

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const orgResult = await callGateway<OrganizationsResult>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = orgResult.organizations ?? [];
  const selected =
    organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ??
    organizations[0];

  if (!selected) {
    return Response.json({ conversations: [], workspace: null });
  }

  // A workspace-service Company row mirrors this organization 1:1 by id.
  // Upserting here means an org created before this wiring existed (or any
  // future one) always gets its Company row lazily, no backfill script needed.
  await callGateway("/api/workspace/companies", { organizationId: selected.id, name: selected.name });

  const result = await callGateway<{ conversations?: Conversation[]; error?: string }>(
    `/api/workspace/conversations?companyId=${encodeURIComponent(selected.id)}`,
  );

  return Response.json({
    conversations: result.conversations ?? [],
    workspace: { id: selected.id, name: selected.name },
  });
}
