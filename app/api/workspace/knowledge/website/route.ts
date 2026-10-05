import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { url?: string; siteId?: string };
  if (!body.url?.trim() || !body.siteId?.trim()) return Response.json({ message: "Website and site ID are required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; groupId?: string; chunkCount?: number; error?: string }>(
    "/api/workspace/knowledge/website",
    { companyId: workspace.id, url: body.url.trim(), siteId: body.siteId || undefined },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 201 });
}
