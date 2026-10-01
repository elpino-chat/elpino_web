import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { requireWorkspaceOwner, selectedWorkspace } from "@/app/api/_lib/workspace";

type Permissions = {
  aiRefunds: { enabled: boolean; maxDays: number; limits: Record<string, number> };
  aiOrderActions: { enabled: boolean };
};
type CompanyResult = { company?: Partial<Permissions> | null; error?: string };

const DEFAULTS: Permissions = { aiRefunds: { enabled: false, maxDays: 14, limits: {} }, aiOrderActions: { enabled: false } };

function view(company: Partial<Permissions> | null | undefined): Permissions {
  return {
    aiRefunds: company?.aiRefunds ?? DEFAULTS.aiRefunds,
    aiOrderActions: company?.aiOrderActions ?? DEFAULTS.aiOrderActions,
  };
}

// What the AI agent may do on its own with money and orders. Anyone in the workspace can see it;
// only the owner can change it, since a refund spends the workspace's real money.
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ ...DEFAULTS, isOwner: false });
  const result = await callGateway<CompanyResult>(`/api/workspace/companies/${encodeURIComponent(workspace.id)}`);
  return Response.json({ ...view(result.company), isOwner: workspace.role === "owner" }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, "change what the AI may do");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });
  const id = encodeURIComponent(owner.workspace.id);
  const body = (await request.json().catch(() => ({}))) as { aiRefunds?: { enabled?: unknown; maxDays?: unknown; limits?: unknown }; aiOrderActions?: { enabled?: unknown } };

  let company: Partial<Permissions> | null | undefined;
  if (body.aiRefunds) {
    const { payload } = await patchGateway<CompanyResult>(`/api/workspace/companies/${id}/ai-refunds`, body.aiRefunds);
    if (payload.error || !payload.company) return Response.json({ message: payload.error ?? "Could not save refund settings" }, { status: 400 });
    company = payload.company;
  }
  if (body.aiOrderActions) {
    const { payload } = await patchGateway<CompanyResult>(`/api/workspace/companies/${id}/ai-order-actions`, body.aiOrderActions);
    if (payload.error || !payload.company) return Response.json({ message: payload.error ?? "Could not save order settings" }, { status: 400 });
    company = payload.company;
  }
  return Response.json({ ...view(company), isOwner: true });
}
