import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type AccountResult = { account?: { id: string } };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

/**
 * Plays a call recording in the inbox. Only a teammate of the workspace the call belongs to gets it;
 * workspace-service checks the call against the workspace.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const session = await requireSession();
  if (!session) return new Response("Unauthenticated", { status: 401 });

  const { callId } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return new Response("No workspace selected", { status: 400 });

  const result = await callGateway<{ mimeType?: string; data?: string; error?: string }>("/api/workspace/calls/recording/read", {
    companyId: workspace.id,
    callId,
  }).catch(() => null);
  if (!result?.data || !result.mimeType) return new Response(result?.error ?? "Recording not found", { status: 404 });

  return new Response(Buffer.from(result.data, "base64"), {
    headers: { "content-type": result.mimeType, "cache-control": "private, max-age=3600" },
  });
}

/** The teammate's browser uploads the recording of a call it just finished. */
export async function POST(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { callId } = await params;
  const body = (await request.json().catch(() => null)) as { mimeType?: unknown; data?: unknown; durationSec?: unknown } | null;
  if (!body || typeof body.mimeType !== "string" || typeof body.data !== "string") {
    return Response.json({ message: "A recording is required" }, { status: 400 });
  }

  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/calls/recording", {
    companyId: workspace.id,
    callId,
    userId: accountResult.account.id,
    mimeType: body.mimeType,
    data: body.data,
    durationSec: Number(body.durationSec) || 0,
  }).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not save the recording" }, { status: 400 });
  return Response.json({ ok: true });
}
