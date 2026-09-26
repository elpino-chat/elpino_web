import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ events: [] });

  const url = new URL(request.url);
  const params = new URLSearchParams({ companyId: workspace.id });
  for (const key of ["siteIds", "includeWorkspace", "from", "to", "limit"]) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }

  const result = await callGateway<{ events?: unknown[]; error?: string }>(`/api/workspace/usage/events?${params.toString()}`);
  // Which model served a request, and token counts, are never shown to customers, so it is dropped here rather than
  // only hidden in the table (it would still be readable in the browser's network tab).
  const events = (result.events ?? []).map((event) => {
    const { model: _model, inputTokens: _in, outputTokens: _out, ...visible } = event as Record<string, unknown>;
    return visible;
  });
  return Response.json(result.error ? { events: [], message: result.error } : { events });
}
