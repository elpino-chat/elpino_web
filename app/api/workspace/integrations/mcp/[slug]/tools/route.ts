import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../../../_lib/workspace";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const blocked = await ownerGuard("change MCP server tools");
  if (blocked) return blocked;
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const { slug } = await params;
  if (!/^[a-z0-9]{1,16}$/.test(slug)) return Response.json({ message: "Unknown MCP server." }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { enabled?: unknown; access?: unknown };
  if (!Array.isArray(body.enabled) || !body.enabled.every((name) => typeof name === "string")) {
    return Response.json({ message: "enabled must be a list of tool names." }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string; metadata?: unknown }>(
    `/api/workspace/integrations/mcp/${encodeURIComponent(slug)}/tools`,
    { companyId, enabled: body.enabled, access: body.access },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
