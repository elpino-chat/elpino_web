import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../../../_lib/workspace";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const { slug } = await params;
  if (!/^[a-z0-9]{1,16}$/.test(slug)) return Response.json({ message: "Unknown MCP server." }, { status: 404 });

  const result = await callGateway<{ ok?: boolean; error?: string; metadata?: unknown }>(
    `/api/workspace/integrations/mcp/${encodeURIComponent(slug)}/refresh`,
    { companyId },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
