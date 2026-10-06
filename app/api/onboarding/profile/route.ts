import { cookies } from "next/headers";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { REFERRAL_COOKIE } from "@/app/lib/referral";
import { creditReferral } from "@/app/lib/credit-referral";
import { requireSession } from "../_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as { organizationName?: string; websiteUrl?: string };
  const organizationName = body.organizationName?.trim() ?? "";
  const websiteUrl = body.websiteUrl?.trim() ?? "";
  if (!organizationName || !websiteUrl) {
    return Response.json({ message: "Organization name and website URL are required" }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    "/api/auth/onboarding/profile",
    { email: session.email, organizationName, websiteUrl },
  );
  if (result?.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  // The workspace this signup just created goes to the partner whose link brought the visitor in.
  await creditReferral(session.email, (await cookies()).get(REFERRAL_COOKIE)?.value);
  return Response.json({ ok: true });
}
