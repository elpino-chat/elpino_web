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

// How long the page waits for Razorpay to describe the card before showing the plan without it.
const CARD_LOOKUP_TIMEOUT_MS = 4000;

type PaymentMethod = { brand: string | null; last4: string; expiryMonth?: number; expiryYear?: number; source: "saved-card" | "last-payment" };

/** Both billing meters for the current workspace, plus the card on file when Razorpay can tell us — what the settings page draws. */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  // The card comes from Razorpay and can be slow or unavailable; it must never hold up or break the plan details.
  const [result, method] = await Promise.all([
    callGateway<{ entitlement?: Entitlement; error?: string }>(`/api/billing/entitlement?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
    Promise.race([
      callGateway<{ paymentMethod?: PaymentMethod | null }>(`/api/billing/payment-method?companyId=${encodeURIComponent(workspace.id)}`),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), CARD_LOOKUP_TIMEOUT_MS)),
    ]).catch(() => null),
  ]);

  if (!result || result.error || !result.entitlement) {
    return Response.json({ message: result?.error ?? "Billing service unreachable" }, { status: 502 });
  }
  return Response.json({ entitlement: result.entitlement, paymentMethod: method?.paymentMethod ?? null });
}
