import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ realtime: null });

  const url = new URL(request.url);
  const params = new URLSearchParams({ companyId });
  const siteId = url.searchParams.get("siteId");
  if (siteId) params.set("siteId", siteId);

  const result = await callGateway<{ realtime?: unknown; error?: string }>(`/api/workspace/analytics/realtime?${params.toString()}`);
  return Response.json(result.error ? { realtime: null, message: result.error } : { realtime: result.realtime });
}
