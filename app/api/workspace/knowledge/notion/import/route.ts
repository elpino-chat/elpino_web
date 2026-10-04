import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

export async function POST(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { pageIds?: unknown };

  const result = await callGateway<{
    ok?: boolean;
    imported?: { id: string; title: string; groupId: string }[];
    failed?: { id: string; error: string }[];
    error?: string;
  }>("/api/workspace/knowledge/notion/import", { companyId, pageIds: body.pageIds });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
