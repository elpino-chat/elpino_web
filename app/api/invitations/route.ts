import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };

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
  if (!workspace) return Response.json({ invitations: [] });
  const result = await callGateway<{ invitations?: unknown[]; error?: string }>(
    `/api/auth/invitations?organizationId=${encodeURIComponent(workspace.id)}`,
  );
  return Response.json(result.error ? { invitations: [], message: result.error } : { invitations: result.invitations ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { emails?: string[] };
  const emails = (body.emails ?? []).map((email) => email.trim()).filter(Boolean);
  if (!emails.length) return Response.json({ message: "Add at least one email." }, { status: 400 });

  const origin = new URL(request.url).origin;
  const result = await callGateway<{ invited?: string[]; skipped?: { email: string; reason: string }[]; error?: string }>(
    "/api/auth/invitations",
    { organizationId: workspace.id, emails, invitedByEmail: session.email, origin },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 201 });
}
