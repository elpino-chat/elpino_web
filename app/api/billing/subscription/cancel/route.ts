import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Drops the workspace back to Free at the end of the paid period — the plan
 * keeps working until then, since it has already been paid for.
 */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ ok?: boolean; effectiveAt?: string | null; error?: string }>(
    "/api/billing/cancel",
    { companyId: workspace.id },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not cancel subscription" }, { status: 400 });
  }
  return Response.json(result);
}
