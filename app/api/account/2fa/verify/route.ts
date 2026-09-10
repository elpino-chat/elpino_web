import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  if (!body.code?.trim()) return Response.json({ message: "Code is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/account/2fa/verify", {
    email: session.email,
    code: body.code.trim(),
  });
  if (!result.ok) {
    return Response.json({ message: result.error ?? "Could not verify code" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
