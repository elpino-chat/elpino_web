import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Turns auto-recharge on or off and sets its bounds.
 *
 * Owner-only, and deliberately so: this is the one setting that lets the
 * product charge a saved card with nobody watching.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email);
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const body = (await request.json().catch(() => ({}))) as {
    enabled?: boolean;
    amountCents?: number | null;
    thresholdPercent?: number;
    monthlyCapCents?: number | null;
  };

  const result = await callGateway<{ error?: string; balanceCents?: number }>(
    "/api/workspace/usage/credits/auto-recharge",
    { companyId: owner.workspace.id, ...body },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not update auto-recharge" }, { status: 400 });
  }
  return Response.json(result);
}
