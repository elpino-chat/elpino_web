import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ pages: [] });

  const params = forwardedParams(new URL(request.url), companyId);
  const result = await callGateway<{ pages?: unknown; error?: string }>(`/api/workspace/analytics/pages?${params.toString()}`);
  return Response.json(result.error ? { pages: [], message: result.error } : { pages: result.pages });
}
