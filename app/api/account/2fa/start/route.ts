import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<{ secret?: string; otpauthUrl?: string; error?: string }>("/api/auth/account/2fa/start", {
    email: session.email,
  });
  if (!result.secret) {
    return Response.json({ message: result.error ?? "Could not start two-factor setup" }, { status: 400 });
  }
  return Response.json({ secret: result.secret, otpauthUrl: result.otpauthUrl });
}
