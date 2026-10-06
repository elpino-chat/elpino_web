import { callGateway } from "@/app/api/auth/_lib/gateway";
import { currentPartnerId } from "@/app/partner/_lib/session";

export async function POST(request: Request) {
  const partnerId = await currentPartnerId();
  if (!partnerId) return Response.json({ message: "Please log in again." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { name?: string; payoutDetails?: string };
  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/referrals/settings", { partnerId, name: body.name, payoutDetails: body.payoutDetails })
    .catch(() => ({ error: "Something went wrong. Please try again." }));
  return result.error ? Response.json({ message: result.error }, { status: 400 }) : Response.json({ ok: true });
}
