import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { normalizeAvailability } from "@/lib/availability";

type Organization = { id: string; name: string };
type Member = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  presenceStatus: string;
  availability: unknown;
};
type WorkspaceMember = { id: string; busy?: boolean };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

/**
 * Everything the Availability page needs about the team in one call:
 * the schedule each teammate committed to (auth-service) merged with
 * whether they're connected and already in a chat right now
 * (workspace-service). Scheduled and live are different questions and
 * live in different services — joining them here keeps the page from
 * having to know that.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ members: [], workspace: null });

  const [memberResult, liveResult] = await Promise.all([
    callGateway<{ members?: Member[]; error?: string }>(
      `/api/auth/members?organizationId=${encodeURIComponent(workspace.id)}`,
    ),
    // Best-effort: a workspace-service hiccup should cost the busy flags,
    // not the whole page.
    callGateway<{ members?: WorkspaceMember[]; error?: string }>(
      `/api/workspace/conversations/availability?companyId=${encodeURIComponent(workspace.id)}`,
    ).catch(() => ({ members: [] as WorkspaceMember[] })),
  ]);

  const busyById = new Map((liveResult.members ?? []).map((member) => [member.id, Boolean(member.busy)]));

  const members = (memberResult.members ?? []).map((member) => ({
    id: member.id,
    email: member.email,
    name: member.name,
    avatarUrl: member.avatarUrl,
    role: member.role,
    presenceStatus: member.presenceStatus,
    busy: busyById.get(member.id) ?? false,
    availability: normalizeAvailability(member.availability),
  }));

  return Response.json({ members, workspace: { id: workspace.id, name: workspace.name } });
}
