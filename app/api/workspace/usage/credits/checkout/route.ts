import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type TopUpResult = {
  orderId?: string;
  keyId?: string;
  amountMinor?: number;
  currency?: string;
  creditCents?: number;
  error?: string;
};

/**
 * Opens a Razorpay order for an AI credit top-up.
 *
 * This replaces `credits/add`, which incremented the balance directly from
 * the amount in the request body — no payment, no owner check. Credit is now
 * applied only when Razorpay's signed webhook reports the payment captured,
 * so an abandoned checkout adds nothing.
 *
 * `saveCard` asks Razorpay for a reusable token, which is what auto-recharge
 * needs later. It is opt-in on the dialog, not assumed.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email);
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const body = (await request.json().catch(() => ({}))) as { amountCents?: number; saveCard?: boolean; phone?: string };
  const amountCents = Math.round(Number(body.amountCents));
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return Response.json({ message: "Enter a positive amount." }, { status: 400 });
  }
  if (body.saveCard && !body.phone?.trim()) {
    return Response.json({ message: "A phone number is required to save a card for auto-recharge." }, { status: 400 });
  }

  const result = await callGateway<TopUpResult>("/api/workspace/usage/credits/checkout", {
    companyId: owner.workspace.id,
    amountCents,
    saveCard: Boolean(body.saveCard),
    email: session.email,
    name: session.name,
    phone: body.phone?.trim(),
  }).catch(() => null);

  if (!result || result.error || !result.orderId) {
    return Response.json({ message: result?.error ?? "Could not start the top-up" }, { status: 400 });
  }
  return Response.json(result);
}
