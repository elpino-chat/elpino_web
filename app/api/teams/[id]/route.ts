import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 400 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { name?: string; description?: string };
  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/teams/update", {
    id,
    organizationId: workspace.id,
    name: body.name,
    description: body.description,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 400 });

  const { id } = await params;
  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/teams/delete", {
    id,
    organizationId: workspace.id,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
