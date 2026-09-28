import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/analytics/_lib/workspace";

// Only counts and durations leave here — never the model, tokens or cost behind a reply.
export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ timeSaved: null });

  const url = new URL(request.url);
  const params = new URLSearchParams({ companyId });
  for (const key of ["from", "to", "humanSeconds", "tzOffsetMinutes"]) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }

  const result = await callGateway<{ timeSaved?: unknown; error?: string }>(`/api/workspace/usage/time-saved?${params.toString()}`);
  return Response.json(result.error ? { timeSaved: null, message: result.error } : { timeSaved: result.timeSaved ?? null });
}
