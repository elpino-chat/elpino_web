import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type WorkspaceRef = { id: string; name: string };

type DeletionPlan = {
  canDelete?: boolean;
  blocked?: WorkspaceRef[];
  soloOwned?: WorkspaceRef[];
  memberOf?: WorkspaceRef[];
  error?: string;
};

/**
 * What deleting this account would do, so the confirmation dialog can
 * explain itself before the customer commits to anything irreversible —
 * which workspaces they'll leave, which get deleted with them, and which
 * ones are blocking deletion because other people are still in them.
 */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<DeletionPlan>(
    `/api/auth/account/delete-plan?email=${encodeURIComponent(session.email)}`,
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not load account deletion details" }, { status: 400 });
  }
  return Response.json({
    canDelete: result.canDelete ?? false,
    blocked: result.blocked ?? [],
    soloOwned: result.soloOwned ?? [],
    memberOf: result.memberOf ?? [],
  });
}
