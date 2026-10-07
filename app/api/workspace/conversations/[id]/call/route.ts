import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { signCallToken } from "@/app/api/workspace/_lib/call-token";

type Organization = { id: string; name: string };
type AccountResult = { account?: { id: string; name?: string | null } };
type StartResult = { callId?: string; iceServers?: unknown; error?: string; offline?: boolean };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

// Where the browser opens the call's signalling socket: the same gateway the widget's own socket uses.
const GATEWAY_WS_ORIGIN = (
  process.env.NEXT_PUBLIC_GATEWAY_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat")
).replace(/^http/, "ws");

/**
 * Places a voice call to the visitor of this conversation. workspace-service checks the teammate may (they have
 * joined the chat, the visitor is reachable, no other call is open) and has the gateway ring the visitor's
 * widget; what comes back is everything the browser needs to carry the call: the ICE servers and a short-lived
 * token for this one call's signalling socket.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const agentName = (accountResult.account.name ?? session.name ?? "").trim().split(/\s+/)[0] || "Support";
  const result = await callGateway<StartResult>("/api/workspace/calls/start", {
    companyId: workspace.id,
    conversationId: id,
    userId: accountResult.account.id,
    agentName,
  }).catch(() => null);

  if (!result || result.error || !result.callId) {
    return Response.json({ message: result?.error ?? "Could not start the call", offline: result?.offline ?? false }, { status: 400 });
  }

  return Response.json({
    callId: result.callId,
    iceServers: result.iceServers ?? [],
    wsUrl: `${GATEWAY_WS_ORIGIN}/rt/call`,
    token: signCallToken({ callId: result.callId, userId: accountResult.account.id, companyId: workspace.id }),
  });
}
