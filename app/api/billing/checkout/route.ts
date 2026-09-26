import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type CheckoutResult = {
  subscriptionId?: string;
  keyId?: string;
  planId?: string;
  cadence?: string;
  currency?: string;
  amountMinor?: number;
  amountInrPaise?: number;
  error?: string;
};

/**
 * Opens a Razorpay subscription for a plan change. Returns the ids the
 * browser hands to Razorpay Checkout — the plan itself does not change until
 * the webhook confirms payment, so abandoning checkout changes nothing.
 *
 * Owner-only: this commits the workspace to a recurring charge.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    planId?: string;
    cadence?: string;
    currency?: string;
  };
  if (!body.planId) return Response.json({ message: "planId is required" }, { status: 400 });

  const owner = await requireWorkspaceOwner(session.email);
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const result = await callGateway<CheckoutResult>("/api/billing/checkout", {
    companyId: owner.workspace.id,
    planId: body.planId,
    cadence: body.cadence ?? "monthly",
    currency: body.currency ?? "USD",
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not start checkout" }, { status: 400 });
  }
  return Response.json(result);
}
