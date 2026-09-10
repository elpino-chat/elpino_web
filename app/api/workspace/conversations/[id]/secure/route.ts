import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

type SecureRequest = {
  id: string;
  label: string;
  status: "pending" | "submitted" | "revealed" | "expired";
  createdAt: string;
  submittedAt: string | null;
  revealedAt: string | null;
  expiresAt: string;
};

/** Secure requests on this conversation. Never carries a submitted value. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ requests: [] });

  const query = new URLSearchParams({ companyId: workspace.id, conversationId: id });
  const result = await callGateway<{ requests?: SecureRequest[]; error?: string }>(
    `/api/workspace/secure/requests?${query.toString()}`,
  ).catch(() => null);

  return Response.json({ requests: result?.requests ?? [] });
}

/** Opens a request and drops the link into the conversation. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { label?: string };
  if (!body.label?.trim()) return Response.json({ message: "Say what you are asking for" }, { status: 400 });

  const result = await callGateway<{ request?: unknown; error?: string }>("/api/workspace/secure/requests", {
    companyId: workspace.id,
    conversationId: id,
    label: body.label.trim(),
    userId: session.userId,
    // The customer's link has to point at this app's own PUBLIC origin.
    // new URL(request.url).origin gave the container's internal bind
    // address on Cloud Run (literally "localhost:3000"), so every secure
    // link ever sent to a customer was a dead URL on their machine. Same
    // failure as tag.js had — the helper reads x-forwarded-host/proto and
    // falls back to the configured site URL, which is the only thing that
    // survives a platform that terminates TLS in front of the app.
    origin: getAuthRedirectBaseUrl(request),
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not create the request" }, { status: 400 });
  }
  return Response.json(result);
}
