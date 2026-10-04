import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

type CompanyInfo = {
  domain: string | null;
  createdAt: string;
  logoUrl: string | null;
  workspaceType: string | null;
  industry: string | null;
  teamSize: string | null;
  about: string | null;
};
type CompanyResult = { company?: CompanyInfo; error?: string };

// The workspace's own logo, its description (type, industry, team size, about) and a few
// read-only facts (domain, created date) shown in Settings > Information — distinct from the AI teammate's own
// identity (aiName/aiAvatarUrl), which lives under Chatbot Interface.
export async function GET() {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const result = await callGateway<CompanyResult>(`/api/workspace/companies/${encodeURIComponent(companyId)}`);
  if (!result.company) return Response.json({ message: result.error ?? "Not found" }, { status: 404 });
  return Response.json(result.company, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { logoUrl?: string | null; profile?: Record<string, unknown> };

  // The workspace's own description (type, industry, team size, about) is saved on its own endpoint.
  if (body.profile && typeof body.profile === "object") {
    const { payload: saved } = await patchGateway<CompanyResult>(
      `/api/workspace/companies/${encodeURIComponent(companyId)}/profile`,
      body.profile,
    );
    if (!saved.company) return Response.json({ message: saved.error ?? "Could not save" }, { status: 400 });
    return Response.json(saved.company);
  }

  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(companyId)}/logo`,
    { logoUrl: body.logoUrl ?? null },
  );
  if (!result.company) return Response.json({ message: result.error ?? "Could not save" }, { status: 400 });
  return Response.json(result.company);
}
