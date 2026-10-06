import { cookies } from "next/headers";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { REFERRAL_COOKIE, normalizeReferralCode } from "@/app/lib/referral";
import { requireSession } from "../_lib/require-user";

type Organization = { id: string; name: string };

// The workspace this signup just created is credited to the partner whose referral link brought the visitor in.
// Never allowed to fail the onboarding step: a missed referral is fixable by hand, a broken signup is not.
async function creditReferral(email: string) {
  const code = normalizeReferralCode((await cookies()).get(REFERRAL_COOKIE)?.value);
  if (!code) return;
  try {
    const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
    const workspace = result.organizations?.find((org) => org.id === result.selectedOrganizationId) ?? result.organizations?.[0];
    if (!workspace) return;
    await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name });
    await callGateway("/api/workspace/referrals/attribute", { companyId: workspace.id, code, email });
  } catch {
    // See above.
  }
}

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
  await creditReferral(session.email);
  return Response.json({ ok: true });
}
