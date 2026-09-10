import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ sources: [] });

  const params = forwardedParams(new URL(request.url), companyId);
  const result = await callGateway<{ sources?: unknown; error?: string }>(`/api/workspace/analytics/sources?${params.toString()}`);
  return Response.json(result.error ? { sources: [], message: result.error } : { sources: result.sources });
}
