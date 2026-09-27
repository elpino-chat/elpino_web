import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Invitations waiting for the signed-in person, for the in-app prompt. Always
 * the session's own email, never one passed in by the browser.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<{ invitations?: unknown[]; error?: string }>(
    `/api/auth/invitations/mine?email=${encodeURIComponent(session.email)}`,
  ).catch(() => null);
  return Response.json({ invitations: result?.invitations ?? [] }, { headers: { "cache-control": "no-store" } });
}
