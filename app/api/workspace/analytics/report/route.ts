import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId, forwardedParams } from "../_lib/workspace";

// One call returns the whole Web analytics dashboard for a period (summary,
// trend, paths, channels, devices, countries). The client calls it twice —
// current and comparison period — to work out the "vs. prior" figures.
export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ report: null });

  const url = new URL(request.url);
  const params = forwardedParams(url, companyId);
  for (const key of ["interval", "path", "country", "device"]) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }

  const result = await callGateway<{ report?: unknown; ok?: false; upgradeRequired?: true; error?: string }>(`/api/workspace/analytics/report?${params.toString()}`);
  // The plan gate answers at 200 with { ok: false, upgradeRequired, error } — pass it through so the page can show why.
  if (result.upgradeRequired) return Response.json({ report: null, upgradeRequired: true, error: result.error });
  return Response.json(result.error ? { report: null, message: result.error } : { report: result.report });
}
