import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** The invitee turning down an invitation sent to their own email. */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id?.trim()) return Response.json({ message: "id is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/invitations/decline", {
    id: body.id.trim(),
    email: session.email,
  }).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not decline invitation" }, { status: 400 });
  return Response.json({ ok: true });
}
