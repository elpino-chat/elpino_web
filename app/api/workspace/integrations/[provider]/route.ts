import { deleteGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../_lib/workspace";

export async function DELETE(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const { provider } = await params;
  const result = await deleteGateway<{ ok?: boolean; error?: string }>(
    `/api/workspace/integrations/${encodeURIComponent(provider)}?companyId=${encodeURIComponent(companyId)}`,
  );
  return Response.json(result.payload.error ? { message: result.payload.error } : { ok: true }, { status: result.ok ? 200 : 400 });
}
