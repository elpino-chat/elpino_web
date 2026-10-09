import { callGateway } from "@/app/api/auth/_lib/gateway";
import { ownersOnly, selectedWorkspace } from "@/app/api/teams/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 400 });
  if (workspace.role !== "owner") return ownersOnly();

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
  if (workspace.role !== "owner") return ownersOnly();

  const { id } = await params;
  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/teams/delete", {
    id,
    organizationId: workspace.id,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
