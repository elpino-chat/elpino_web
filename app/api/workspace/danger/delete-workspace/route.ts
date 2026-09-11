import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Permanently deletes the current workspace — every conversation, customer,
 * knowledge base article, and its Razorpay subscription. Owner-only.
 *
 * The gateway's workspace-lifecycle endpoint does the real work (and
 * re-verifies ownership itself); this route's job is just the fast-fail
 * before anything destructive is attempted, matching the pattern billing
 * uses.
 */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email, "delete the workspace");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace-lifecycle/delete-workspace", {
    organizationId: owner.workspace.id,
    requestedByEmail: session.email,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not delete the workspace" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
