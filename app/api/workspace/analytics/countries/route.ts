import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ countries: [] });

  const params = forwardedParams(new URL(request.url), companyId);
  const result = await callGateway<{ countries?: unknown; error?: string }>(`/api/workspace/analytics/countries?${params.toString()}`);
  return Response.json(result.error ? { countries: [], message: result.error } : { countries: result.countries });
}
