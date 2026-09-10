import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type PresenceEvent = { id: string; userId: string; name: string | null; email: string; status: "online" | "offline"; occurredAt: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ events: [] });

  const result = await callGateway<{ events?: PresenceEvent[]; error?: string }>(
    `/api/auth/organizations/${encodeURIComponent(workspace.id)}/presence-events`,
  );
  return Response.json({ events: result.events ?? [] });
}
