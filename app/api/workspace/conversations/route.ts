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

const ensuredCompanies = new Set<string>();

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
  // Idempotent, so once per workspace per server instance is enough; repeating
  // it on every 2-second poll was a whole extra round trip each time.
  if (!ensuredCompanies.has(selected.id)) {
    await callGateway("/api/workspace/companies", { organizationId: selected.id, name: selected.name });
    ensuredCompanies.add(selected.id);
  }

  const result = await callGateway<{ conversations?: Conversation[]; error?: string }>(
    // avatarRefs=1: get the AI avatar as a short URL (served by /api/workspace/ai-avatar)
    // instead of a 300 KB image repeated in every conversation.
    `/api/workspace/conversations?companyId=${encodeURIComponent(selected.id)}&avatarRefs=1`,
  );

  return Response.json({
    conversations: result.conversations ?? [],
    workspace: { id: selected.id, name: selected.name },
  });
}
