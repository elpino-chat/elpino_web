import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Drops the workspace back to Free at the end of the paid period — the plan
 * keeps working until then, since it has already been paid for.
 *
 * Owner-only: a teammate should not be able to downgrade the workspace.
 */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email);
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const result = await callGateway<{ ok?: boolean; effectiveAt?: string | null; error?: string }>(
    "/api/billing/cancel",
    { companyId: owner.workspace.id },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not cancel subscription" }, { status: 400 });
  }
  return Response.json(result);
}

/**
 * Reverses a cancellation that has not taken effect yet.
 *
 * Razorpay cannot un-cancel a subscription, so the backend opens a fresh one
 * on the same tier and this returns a checkout session the browser has to
 * complete — same shape as POST /api/billing/checkout.
 */
export async function DELETE() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email);
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const result = await callGateway<{ subscriptionId?: string; keyId?: string; error?: string }>(
    "/api/billing/resume",
    { companyId: owner.workspace.id },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not resume subscription" }, { status: 400 });
  }
  return Response.json(result);
}
