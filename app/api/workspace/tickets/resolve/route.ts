import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** Toggles the Issues page's resolved marker on a ticket — local bookkeeping only, never touches the ticket in Trello/Asana. */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { provider?: string; id?: string; resolved?: boolean };
  if (!body.provider?.trim() || !body.id?.trim()) {
    return Response.json({ message: "provider and id are required" }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/agent/tickets/resolve", {
    companyId: workspace.id,
    provider: body.provider,
    id: body.id,
    resolved: !!body.resolved,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not update the ticket" }, { status: 400 });
  }
  return Response.json(result);
}
