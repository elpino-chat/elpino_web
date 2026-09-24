import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

export type UrlRules = { show: string[]; hide: string[] };
type CompanyResult = { company?: { chatbotUrlRules?: UrlRules }; error?: string };

// Which pages of a connected site show the chat widget — enforced by tag.js
// itself (it's the only place that ever sees the visitor's actual path).
export async function GET() {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const result = await callGateway<CompanyResult>(`/api/workspace/companies/${encodeURIComponent(companyId)}`);
  if (!result.company) return Response.json({ message: result.error ?? "Not found" }, { status: 404 });
  return Response.json({ rules: result.company.chatbotUrlRules ?? { show: [], hide: [] } }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Partial<UrlRules>;
  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(companyId)}/url-rules`,
    { show: body.show ?? [], hide: body.hide ?? [] },
  );
  if (!result.company) return Response.json({ message: result.error ?? "Could not save" }, { status: 400 });
  return Response.json({ rules: result.company.chatbotUrlRules ?? { show: [], hide: [] } });
}
