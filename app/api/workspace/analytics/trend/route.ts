import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ trend: [] });

  const params = forwardedParams(new URL(request.url), companyId);
  const result = await callGateway<{ trend?: unknown; error?: string }>(`/api/workspace/analytics/trend?${params.toString()}`);
  return Response.json(result.error ? { trend: [], message: result.error } : { trend: result.trend });
}
