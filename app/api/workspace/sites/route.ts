import { ownerGuard } from "@/app/api/_lib/owner-guard";
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
  if (!workspace) return Response.json({ sites: [] });
  await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name });
  const result = await callGateway<{ sites?: unknown[]; error?: string }>(`/api/workspace/sites?companyId=${encodeURIComponent(workspace.id)}`);
  return Response.json(result.error ? { sites: [], message: result.error } : { sites: result.sites ?? [] });
}

export async function POST(request: Request) {
  const blocked = await ownerGuard("add website tags");
  if (blocked) return blocked;
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name });
  const body = await request.json().catch(() => ({}));
  const result = await callGateway<{ site?: unknown; error?: string }>("/api/workspace/sites", { ...body, companyId: workspace.id });
  return Response.json(result.error ? { message: result.error } : { site: result.site }, { status: result.error ? 400 : 201 });
}
