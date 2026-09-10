import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ results: [] });

  const body = (await request.json().catch(() => ({}))) as { query?: string; siteId?: string; limit?: number };
  if (!body.query?.trim()) return Response.json({ message: "query is required" }, { status: 400 });

  const result = await callGateway<{ results?: unknown[]; error?: string }>("/api/workspace/knowledge/search", {
    ...body,
    companyId: workspace.id,
  });
  return Response.json(result.error ? { message: result.error } : { results: result.results ?? [] }, {
    status: result.error ? 400 : 200,
  });
}
