import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

type PastConversation = { id: string; preview: string; time: string; status: "open" | "waiting" | "resolved" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ conversations: [] }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ conversations: [] });

  const result = await callGateway<{ conversations?: PastConversation[]; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/history?companyId=${encodeURIComponent(workspace.id)}`,
  );
  return Response.json({ conversations: result.conversations ?? [] });
}
