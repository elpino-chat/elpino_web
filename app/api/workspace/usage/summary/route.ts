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
  if (!workspace) return Response.json({ summary: null });

  const url = new URL(request.url);
  const params = new URLSearchParams({ companyId: workspace.id });
  for (const key of ["siteIds", "includeWorkspace", "from", "to"]) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }

  const result = await callGateway<{ summary?: unknown; error?: string }>(`/api/workspace/usage/summary?${params.toString()}`);
  // Which model did the work, and token counts, are never shown to customers, so they are dropped here
  // rather than only hidden in the page (they would still be readable in the browser's network tab).
  const summary = result.summary as ({ daily?: Record<string, unknown>[] } & Record<string, unknown>) | undefined;
  const visible = summary
    ? (() => {
        const { byModel: _byModel, totalInputTokens: _in, totalOutputTokens: _out, daily, ...rest } = summary;
        return { ...rest, daily: (daily ?? []).map(({ inputTokens: _i, outputTokens: _o, ...day }) => day) };
      })()
    : null;
  return Response.json(result.error ? { summary: null, message: result.error } : { summary: visible });
}
