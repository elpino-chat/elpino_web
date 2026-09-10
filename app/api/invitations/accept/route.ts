import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { token?: string };
  if (!body.token?.trim()) return Response.json({ message: "token is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; organizationId?: string; error?: string }>(
    "/api/auth/invitations/accept",
    { token: body.token.trim(), email: session.email },
  );
  if (!result.ok) {
    return Response.json({ message: result.error ?? "Could not accept invitation" }, { status: 400 });
  }
  return Response.json({ ok: true, organizationId: result.organizationId });
}
