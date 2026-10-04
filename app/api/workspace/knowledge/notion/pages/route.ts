import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

// The Notion pages shared with the workspace's integration, for the import picker.
export async function GET(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams({ companyId });
  const query = searchParams.get("query")?.trim();
  const cursor = searchParams.get("cursor");
  if (query) params.set("query", query);
  if (cursor) params.set("cursor", cursor);

  const result = await callGateway<{
    ok?: boolean;
    connected?: boolean;
    pages?: { id: string; title: string; url: string; lastEdited: string }[];
    nextCursor?: string | null;
    error?: string;
  }>(`/api/workspace/knowledge/notion/pages?${params.toString()}`);
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
