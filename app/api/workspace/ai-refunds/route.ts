import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export type AiRefundSettings = { enabled: boolean; maxDays: number; limits: Record<string, number> };
type Organization = { id: string; role: string };
type CompanyResult = { company?: { aiRefunds?: AiRefundSettings }; error?: string };

const DEFAULTS: AiRefundSettings = { enabled: false, maxDays: 14, limits: {} };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

// How far the AI agent may go with refunds on its own. Reading is open to the
// workspace; changing it moves real money, so only the owner can.
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  const result = await callGateway<CompanyResult>(`/api/workspace/companies/${encodeURIComponent(workspace.id)}`);
  if (!result.company) return Response.json({ message: result.error ?? "Not found" }, { status: 404 });
  return Response.json(
    { settings: result.company.aiRefunds ?? DEFAULTS, canEdit: workspace.role === "owner" },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  if (workspace.role !== "owner") return Response.json({ message: "Only the workspace owner can change refund settings." }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Partial<AiRefundSettings>;
  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(workspace.id)}/ai-refunds`,
    { enabled: body.enabled, maxDays: body.maxDays, limits: body.limits ?? {} },
  );
  if (!result.company) return Response.json({ message: result.error ?? "Could not save" }, { status: 400 });
  return Response.json({ settings: result.company.aiRefunds ?? DEFAULTS });
}
