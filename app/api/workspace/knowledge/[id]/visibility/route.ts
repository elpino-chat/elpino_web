import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

async function workspaceId(email: string) {
  const result = await callGateway<{ organizations?: { id: string }[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  return result.organizations?.find((item) => item.id === result.selectedOrganizationId)?.id ?? result.organizations?.[0]?.id ?? null;
}

// The knowledge page's "Show to visitors" switch for the widget's Help tab.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const companyId = await workspaceId(session.email);
  if (!companyId) return Response.json({ message: "Workspace not found" }, { status: 404 });
  const body = await request.json().catch(() => ({})) as { visible?: unknown };
  if (typeof body.visible !== "boolean") return Response.json({ message: "visible is required" }, { status: 400 });
  const { id } = await params;
  const result = await patchGateway<{ ok?: boolean; visible?: boolean; error?: string }>(`/api/workspace/knowledge/${encodeURIComponent(id)}/visibility`, { companyId, visible: body.visible });
  return Response.json(result.payload.error ? { message: result.payload.error } : result.payload, { status: result.payload.error ? 400 : 200 });
}
