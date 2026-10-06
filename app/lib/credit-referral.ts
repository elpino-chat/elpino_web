import { callGateway } from "@/app/api/auth/_lib/gateway";
import { normalizeReferralCode } from "./referral";

type Organization = { id: string; name: string };

// Credits the signed-in user's workspace to the partner whose referral link brought them in. Safe to call more
// than once: the backend keeps the first partner, ignores workspaces that already pay or are older than 30 days,
// and never credits a partner for their own signup. Never throws: a missed referral must not break a page.
export async function creditReferral(email: string, rawCode: string | undefined) {
  const code = normalizeReferralCode(rawCode);
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
