import { patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

// Changes a contact's status and/or tags.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown; tags?: unknown };
  const result = await patchGateway<{ ok?: true; status?: string; tags?: string[]; error?: string }>(
    `/api/workspace/customers/${encodeURIComponent(id)}`,
    { companyId, status: body.status, tags: body.tags },
  );
  if (!result.payload?.ok) return Response.json({ message: result.payload?.error ?? "Could not update the contact" }, { status: 400 });
  return Response.json({ ok: true, status: result.payload.status, tags: result.payload.tags });
}
