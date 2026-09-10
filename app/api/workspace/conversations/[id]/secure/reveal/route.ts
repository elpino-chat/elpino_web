import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * The single permitted read. The value comes back once and is destroyed
 * server-side in the same call, so the response is explicitly uncacheable and
 * the client is expected to hold it in memory only.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  // The conversation id scopes the route; the request id says which of its
  // handovers to open.
  await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { requestId?: string };
  if (!body.requestId?.trim()) return Response.json({ message: "requestId is required" }, { status: 400 });

  const result = await callGateway<{ secret?: string; label?: string; error?: string }>(
    `/api/workspace/secure/requests/${encodeURIComponent(body.requestId.trim())}/reveal`,
    { companyId: workspace.id, userId: session.userId },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not open this request" }, { status: 400 });
  }
  return Response.json(result, { headers: { "cache-control": "no-store" } });
}
