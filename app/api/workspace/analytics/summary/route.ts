import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ summary: null });

  const params = forwardedParams(new URL(request.url), companyId);
  const result = await callGateway<{ summary?: unknown; error?: string }>(`/api/workspace/analytics/summary?${params.toString()}`);
  return Response.json(result.error ? { summary: null, message: result.error } : { summary: result.summary });
}
