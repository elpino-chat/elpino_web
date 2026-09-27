import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** Swaps in a new token — the only way to invalidate a join link that has already gone out to someone. */
export async function POST() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, "manage the join link");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const result = await callGateway<{ enabled?: boolean; token?: string | null; error?: string }>(
    `/api/auth/organizations/${encodeURIComponent(owner.workspace.id)}/join-link/regenerate`,
    { email: session.email },
  ).catch(() => null);
  if (!result || result.error) return Response.json({ message: result?.error ?? "Could not regenerate the join link" }, { status: 400 });
  return Response.json({ enabled: result.enabled, token: result.token });
}
