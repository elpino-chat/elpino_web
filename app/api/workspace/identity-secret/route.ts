import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

type SecretResult = { configured?: boolean; secret?: string | null; error?: string };

// The workspace's identity-verification secret. Only the signed-in dashboard
// reaches this; the secret itself belongs on the business's server, never in
// a page they serve to visitors.
export async function GET() {
  const blocked = await ownerGuard("view the identity verification secret");
  if (blocked) return blocked;
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const result = await callGateway<SecretResult>(`/api/workspace/companies/${encodeURIComponent(companyId)}/identity-secret`);
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200, headers: { "cache-control": "no-store" } });
}

// Creates the secret, or replaces it. Replacing immediately invalidates every
// token signed with the old one.
export async function POST() {
  const blocked = await ownerGuard("change the identity verification secret");
  if (blocked) return blocked;
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const result = await callGateway<SecretResult>(`/api/workspace/companies/${encodeURIComponent(companyId)}/identity-secret`, {});
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200, headers: { "cache-control": "no-store" } });
}
