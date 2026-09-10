import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { demoContactSessions, isDemoUser } from "@/app/api/_lib/demo-dashboard-data";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
export type ContactSession = {
  id: string;
  topic: string | null;
  status: "open" | "waiting" | "resolved";
  handledBy: "ai" | "human";
  preview: string;
  time: string;
};

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const url = new URL(request.url);
  const contactId = url.searchParams.get("contactId") ?? "";
  const customerIds = url.searchParams.get("customerIds") ?? "";

  if (isDemoUser(session.userId)) {
    return Response.json({ sessions: demoContactSessions(contactId) });
  }

  if (!customerIds.trim()) return Response.json({ sessions: [] });

  const orgResult = await callGateway<OrganizationsResult>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = orgResult.organizations ?? [];
  const selected =
    organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ??
    organizations[0];

  if (!selected) return Response.json({ sessions: [] });

  const result = await callGateway<{ conversations?: ContactSession[]; error?: string }>(
    `/api/workspace/conversations/by-customers?customerIds=${encodeURIComponent(customerIds)}&companyId=${encodeURIComponent(selected.id)}`,
  );

  return Response.json({ sessions: result.conversations ?? [] });
}
