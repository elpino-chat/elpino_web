import { callGateway } from "@/app/api/auth/_lib/gateway";
import { setPartnerSession } from "@/app/partner/_lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; code?: string };
  const result = await callGateway<{ partnerId?: string; error?: string }>("/api/workspace/referrals/verify", { email: body.email, code: body.code })
    .catch(() => ({ error: "Something went wrong. Please try again." }) as { partnerId?: string; error?: string });
  if (!result.partnerId) return Response.json({ message: result.error ?? "That code is not right." }, { status: 400 });
  await setPartnerSession(result.partnerId);
  return Response.json({ ok: true });
}
