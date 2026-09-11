import { cookies } from "next/headers";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { invalidateTokenVersion } from "@/app/api/auth/_lib/session-version";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type WorkspaceRef = { id: string; name: string };
type DeletionPlan = { canDelete?: boolean; blocked?: WorkspaceRef[]; soloOwned?: WorkspaceRef[]; memberOf?: WorkspaceRef[]; error?: string };

/**
 * Deletes the signed-in user's account.
 *
 * Re-reads the deletion plan itself rather than trusting one the browser
 * might have cached from a moment ago — a workspace's membership can change
 * between opening the confirmation dialog and clicking confirm, and this is
 * not a call worth getting wrong on stale information.
 *
 * Every workspace this account solely owns is deleted outright (via the same
 * gateway endpoint the "Delete workspace" button uses); every workspace it's
 * merely a member of is left (via the same one "Remove workspace" uses). The
 * account row itself is only removed once every one of those has actually
 * succeeded — a failure partway through leaves the account intact and
 * retryable rather than orphaned membership rows pointing at a user that no
 * longer exists.
 */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const plan = await callGateway<DeletionPlan>(
    `/api/auth/account/delete-plan?email=${encodeURIComponent(session.email)}`,
  ).catch(() => null);
  if (!plan || plan.error) {
    return Response.json({ message: plan?.error ?? "Could not verify what deleting this account would affect" }, { status: 400 });
  }
  if (!plan.canDelete) {
    return Response.json(
      {
        message: "You're the only owner of workspaces that still have other people in them. Delete those workspaces, or remove the other members, before deleting your account.",
        blocked: plan.blocked ?? [],
      },
      { status: 409 },
    );
  }

  for (const workspace of plan.soloOwned ?? []) {
    const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace-lifecycle/delete-workspace", {
      organizationId: workspace.id,
      requestedByEmail: session.email,
    }).catch(() => null);
    if (!result || result.error) {
      return Response.json({ message: `Could not delete "${workspace.name}": ${result?.error ?? "unknown error"}` }, { status: 400 });
    }
  }

  for (const workspace of plan.memberOf ?? []) {
    const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace-lifecycle/leave-workspace", {
      organizationId: workspace.id,
      email: session.email,
    }).catch(() => null);
    if (!result || result.error) {
      return Response.json({ message: `Could not leave "${workspace.name}": ${result?.error ?? "unknown error"}` }, { status: 400 });
    }
  }

  const deleted = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/account/delete", {
    email: session.email,
  }).catch(() => null);
  if (!deleted || deleted.error) {
    return Response.json({ message: deleted?.error ?? "Could not delete the account" }, { status: 400 });
  }

  invalidateTokenVersion(session.email);
  (await cookies()).delete("auth_token");
  return Response.json({ ok: true });
}
