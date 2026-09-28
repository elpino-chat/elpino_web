import { callGateway } from "../../_lib/gateway";
import { invalidateSessionState } from "../../_lib/session-version";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

// Signs one other device out. Signing out *this* device goes through /api/auth/logout.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  if (id === session.sid) return Response.json({ message: "Use Sign out to end this device's session." }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/sessions/revoke", { email: session.email, sessionId: id }).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not sign that device out." }, { status: 502 });
  invalidateSessionState(session.userId, id);
  return Response.json({ ok: true });
}
