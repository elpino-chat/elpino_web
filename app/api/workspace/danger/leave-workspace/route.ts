import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Removes the signed-in user's own membership from the current workspace —
 * "Remove workspace" in settings, shown instead of "Delete workspace" to
 * anyone who isn't the owner.
 *
 * Deliberately does not require ownership — this is the opposite action:
 * only a non-owner can leave this way, and the gateway itself refuses an
 * owner (they have to delete the workspace instead).
 */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace-lifecycle/leave-workspace", {
    organizationId: workspace.id,
    email: session.email,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not leave the workspace" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
