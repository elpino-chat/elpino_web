import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type SecuritySettings = { requireTwoFactor: boolean; signInAlerts: boolean; membersCanInvite: boolean };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ settings: null });

  const result = await callGateway<{ settings?: SecuritySettings; error?: string }>(
    `/api/auth/organizations/${encodeURIComponent(workspace.id)}/security`,
  );
  return Response.json(result.error ? { settings: null, message: result.error } : { settings: result.settings, role: workspace.role });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Partial<SecuritySettings>;
  const result = await callGateway<{ settings?: SecuritySettings; error?: string }>(
    `/api/auth/organizations/${encodeURIComponent(workspace.id)}/security`,
    { requestedByEmail: session.email, ...body },
  );
  return Response.json(result.error ? { message: result.error } : { settings: result.settings }, { status: result.error ? 400 : 200 });
}
