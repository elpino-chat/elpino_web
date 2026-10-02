import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Entitlement = {
  planId: string;
  planName: string;
  status: string;
  seatsAllowed: number;
  creditBased?: boolean;
  estimatedConversations?: number | null;
  aiCreditGrantUsdCents?: number;
  resolutionsIncluded: number;
  resolutionsUsed: number;
  resolutionsRemaining: number;
  overageResolutions: number;
  overageUsdCents: number | null;
  canResolve: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  razorpayConfigured: boolean;
};

/** Both billing meters for the current workspace — what the settings page draws. */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ entitlement?: Entitlement; error?: string }>(
    `/api/billing/entitlement?companyId=${encodeURIComponent(workspace.id)}`,
  ).catch(() => null);

  if (!result || result.error || !result.entitlement) {
    return Response.json({ message: result?.error ?? "Billing service unreachable" }, { status: 502 });
  }
  return Response.json({ entitlement: result.entitlement });
}
