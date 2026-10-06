import { clearPartnerSession } from "@/app/partner/_lib/session";

export async function POST() {
  await clearPartnerSession();
  return Response.json({ ok: true });
}
