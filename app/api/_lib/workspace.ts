import { callGateway } from "@/app/api/auth/_lib/gateway";

export type Organization = { id: string; name: string; role?: string };

/**
 * The workspace the signed-in user is currently acting in.
 *
 * The organization id doubles as the workspace-service company id — the two
 * services share the key by construction — so the value returned here is what
 * every `companyId` query parameter downstream expects.
 */
export async function selectedWorkspace(email: string): Promise<Organization | null> {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

/**
 * The workspace, but only for the owner.
 *
 * Billing routes spend the workspace's money and can cancel its plan, so
 * membership is not a high enough bar: every teammate the owner invites is a
 * member, and until this existed any one of them could downgrade the
 * workspace or put seats on the invoice. Mirrors the owner-only rule
 * auth-service already applies to invites and security settings.
 *
 * Returns a discriminated result rather than throwing so each route can shape
 * its own response body.
 */
export async function requireWorkspaceOwner(
  email: string,
  action: string = "change billing",
): Promise<
  | { ok: true; workspace: Organization }
  | { ok: false; status: 403 | 404; message: string }
> {
  const workspace = await selectedWorkspace(email);
  if (!workspace) return { ok: false, status: 404, message: "No workspace selected" };
  if (workspace.role !== "owner") {
    return { ok: false, status: 403, message: `Only the workspace owner can ${action}.` };
  }
  return { ok: true, workspace };
}
