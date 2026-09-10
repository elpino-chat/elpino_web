import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

async function workspaceId(email: string) {
  const result = await callGateway<{ organizations?: { id: string }[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  return result.organizations?.find((item) => item.id === result.selectedOrganizationId)?.id ?? result.organizations?.[0]?.id ?? null;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const organizationId = await workspaceId(session.email);
  if (!organizationId) return Response.json({ message: "Workspace not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id?.trim()) return Response.json({ message: "id is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/invitations/revoke", {
    id: body.id.trim(),
    organizationId,
    requestedByEmail: session.email,
  });
  return Response.json(result.error ? { message: result.error } : { ok: true }, { status: result.error ? 400 : 200 });
}
