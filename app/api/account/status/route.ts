import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status?.trim();
  if (!status || !["online", "away", "brb"].includes(status)) {
    return Response.json({ message: "status must be one of online, away, brb." }, { status: 400 });
  }

  const result = await callGateway<{ presenceStatus?: string; error?: string }>("/api/auth/account/status", {
    email: session.email,
    status,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
