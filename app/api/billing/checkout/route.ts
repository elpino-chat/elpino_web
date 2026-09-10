import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type CheckoutResult = {
  subscriptionId?: string;
  keyId?: string;
  planId?: string;
  amountInrPaise?: number;
  error?: string;
};

/**
 * Opens a Razorpay subscription for a plan change. Returns the ids the
 * browser hands to Razorpay Checkout — the plan itself does not change until
 * the webhook confirms payment, so abandoning checkout changes nothing.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { planId?: string };
  if (!body.planId) return Response.json({ message: "planId is required" }, { status: 400 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<CheckoutResult>("/api/billing/checkout", {
    companyId: workspace.id,
    planId: body.planId,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not start checkout" }, { status: 400 });
  }
  return Response.json(result);
}
