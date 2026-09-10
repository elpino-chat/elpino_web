import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ items: [] });
  const result = await callGateway<{ items?: unknown[]; error?: string }>(`/api/workspace/knowledge?companyId=${encodeURIComponent(workspace.id)}`);
  return Response.json(result.error ? { items: [], message: result.error } : { items: result.items ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name });
  const body = (await request.json().catch(() => ({}))) as { title?: string; content?: string; siteId?: string };
  const result = await callGateway<{ ok?: boolean; ids?: string[]; chunkCount?: number; error?: string }>(
    "/api/workspace/knowledge",
    { ...body, companyId: workspace.id },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 201 });
}
