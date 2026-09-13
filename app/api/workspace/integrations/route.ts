import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "./_lib/workspace";

type Integration = {
  provider: string;
  authType: string;
  status: string;
  connectedAt: string;
  metadata?: { workspaceGid?: string; workspaceName?: string } | null;
};

export async function GET() {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ integrations: [] });

  const result = await callGateway<{ integrations?: Integration[]; error?: string }>(`/api/workspace/integrations?companyId=${encodeURIComponent(companyId)}`);
  return Response.json(result.error ? { integrations: [], message: result.error } : { integrations: result.integrations ?? [] });
}
