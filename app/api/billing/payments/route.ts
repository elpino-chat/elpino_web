import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Payment = {
  id: string;
  kind: string;
  amountPaise: number;
  currency: string;
  status: string;
  createdAt: string;
};

/** Billing history for the settings page — plan cycles, seat purchases, overage. */
export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ payments: [] });

  const limit = new URL(request.url).searchParams.get("limit") ?? "25";
  const params = new URLSearchParams({ companyId: workspace.id, limit });
  const result = await callGateway<{ payments?: Payment[]; error?: string }>(
    `/api/billing/payments?${params.toString()}`,
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ payments: [], message: result?.error ?? "Billing service unreachable" });
  }
  return Response.json({ payments: result.payments ?? [] });
}
