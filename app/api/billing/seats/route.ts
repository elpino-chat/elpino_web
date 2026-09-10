import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type SeatPurchaseResult = {
  /** Free plan: a one-off Razorpay order the browser must complete. */
  orderId?: string;
  keyId?: string;
  amountPaise?: number;
  seatsGranted?: number;
  /** Paid plans: the seat lands on the next invoice, nothing to pay now. */
  seatsAllowed?: number;
  billedOnNextInvoice?: boolean;
  error?: string;
  upgradeRequired?: boolean;
};

/**
 * Buys seats at $1/month each.
 *
 * On a paid plan this returns immediately — the seat is added and billed as
 * an addon on the invoice already scheduled. On Free there is no invoice to
 * attach to, so this returns a Razorpay order for the browser to complete,
 * and the seats are granted by the webhook once the money is captured.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { quantity?: number };
  const quantity = Math.round(Number(body.quantity ?? 1));
  if (!Number.isFinite(quantity) || quantity < 1) {
    return Response.json({ message: "quantity must be at least 1" }, { status: 400 });
  }

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<SeatPurchaseResult>("/api/billing/seats", {
    companyId: workspace.id,
    quantity,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json(
      { message: result?.error ?? "Could not add seats", upgradeRequired: result?.upgradeRequired ?? false },
      { status: 400 },
    );
  }
  return Response.json(result);
}

/** Releases a seat, effective at the next renewal rather than as a refund. */
export async function DELETE(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const quantity = Math.round(Number(new URL(request.url).searchParams.get("quantity") ?? 1));
  if (!Number.isFinite(quantity) || quantity < 1) {
    return Response.json({ message: "quantity must be at least 1" }, { status: 400 });
  }

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ seatsPendingRelease?: number; error?: string }>("/api/billing/seats/release", {
    companyId: workspace.id,
    quantity,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not release seats" }, { status: 400 });
  }
  return Response.json(result);
}
