import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { demoSessionMessages, isDemoUser } from "@/app/api/_lib/demo-dashboard-data";

type Organization = { id: string; name: string };
type Message = { id: string; senderType: string; senderId: string | null; body: string; createdAt: string };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  if (isDemoUser(session.userId)) {
    return Response.json({ messages: demoSessionMessages(id) });
  }

  const orgResult = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = orgResult.organizations ?? [];
  const selected =
    organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ??
    organizations[0];

  if (!selected) return Response.json({ messages: [] });

  const result = await callGateway<{ messages?: Message[]; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/messages?companyId=${encodeURIComponent(selected.id)}`,
  );
  return Response.json({ messages: result.messages ?? [] });
}
