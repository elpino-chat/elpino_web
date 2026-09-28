import { callGateway } from "../../_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

// Signs every device out except the one making this request.
export async function DELETE() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  if (!session.sid) {
    return Response.json({ message: "Sign out and back in once, then you can end your other sessions." }, { status: 409 });
  }

  const result = await callGateway<{ ok?: boolean; revoked?: number; error?: string }>("/api/auth/sessions/revoke-others", {
    email: session.email,
    keepSessionId: session.sid,
  }).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not sign the other devices out." }, { status: 502 });
  return Response.json({ ok: true, revoked: result.revoked ?? 0 });
}
