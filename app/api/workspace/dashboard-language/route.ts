import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner, selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type CompanyResult = { company?: { id: string; dashboardLanguage: string }; error?: string };

/** The language agents read the dashboard in. Any member can read it; only the owner changes it — same bar as other workspace-wide settings. */
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ dashboardLanguage: "en" });

  const result = await callGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(workspace.id)}`,
  ).catch(() => null);

  return Response.json({ dashboardLanguage: result?.company?.dashboardLanguage ?? "en" });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const owner = await requireWorkspaceOwner(session.email, "change the workspace language");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  if (!body.code?.trim()) return Response.json({ message: "code is required" }, { status: 400 });

  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(owner.workspace.id)}/dashboard-language`,
    { code: body.code.trim() },
  );
  if (!result.company) {
    return Response.json({ message: result.error ?? "Could not update the workspace language" }, { status: 400 });
  }
  return Response.json({ dashboardLanguage: result.company.dashboardLanguage });
}
