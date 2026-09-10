import { callGateway, deleteGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

async function workspaceId(email: string) {
  const result = await callGateway<{ organizations?: { id: string }[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  return result.organizations?.find((item) => item.id === result.selectedOrganizationId)?.id ?? result.organizations?.[0]?.id ?? null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const companyId = await workspaceId(session.email);
  if (!companyId) return Response.json({ message: "Workspace not found" }, { status: 404 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const result = await patchGateway<{ ok?: boolean; error?: string }>(`/api/workspace/sites/${encodeURIComponent(id)}`, { ...body, companyId });
  return Response.json(result.payload.error ? { message: result.payload.error } : { ok: true }, { status: result.payload.error ? 400 : 200 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const companyId = await workspaceId(session.email);
  if (!companyId) return Response.json({ message: "Workspace not found" }, { status: 404 });
  const { id } = await params;
  const result = await deleteGateway<{ ok?: boolean; error?: string }>(`/api/workspace/sites/${encodeURIComponent(id)}?companyId=${encodeURIComponent(companyId)}`);
  return Response.json(result.payload.error ? { message: result.payload.error } : { ok: true }, { status: result.payload.error ? 400 : 200 });
}
