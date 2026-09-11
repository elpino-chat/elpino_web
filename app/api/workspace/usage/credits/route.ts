import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type AutoRecharge = {
  enabled: boolean;
  amountCents: number | null;
  thresholdPercent: number;
  monthlyCapCents: number | null;
  cardOnFile: boolean;
  lastError: string | null;
};

type Credits = {
  balanceCents?: number;
  grantedCents?: number;
  purchasedCents?: number;
  autoRecharge?: AutoRecharge;
  error?: string;
};

/**
 * The workspace's AI credit, split by where it came from: the plan's monthly
 * grant (which resets) and credit that was bought (which does not).
 *
 * Readable by any member — seeing the balance is not a billing change — but
 * every route that moves money is owner-only.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ balanceCents: null });

  const result = await callGateway<Credits>(
    `/api/workspace/usage/credits?companyId=${encodeURIComponent(workspace.id)}`,
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ balanceCents: null, message: result?.error ?? "Credits unavailable" });
  }
  return Response.json({
    balanceCents: result.balanceCents ?? 0,
    grantedCents: result.grantedCents ?? 0,
    purchasedCents: result.purchasedCents ?? 0,
    autoRecharge: result.autoRecharge ?? null,
    isOwner: workspace.role === "owner",
  });
}
