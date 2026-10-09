import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

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

  const body = (await request.json().catch(() => ({}))) as { emails?: string[]; teamIds?: string[] };
  const emails = (body.emails ?? []).map((email) => email.trim()).filter(Boolean);
  // Teams (Sales, Tech…) they join on accepting; auth-service drops any that aren't this workspace's.
  const teamIds = Array.isArray(body.teamIds) ? body.teamIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : [];
  if (!emails.length) return Response.json({ message: "Add at least one email." }, { status: 400 });

  // Public origin, not request.url's — on Cloud Run that resolves to the
  // container's internal bind address, which put "localhost:3000" into the
  // invite link inside every invitation email ever sent.
  const origin = getAuthRedirectBaseUrl(request);
  const result = await callGateway<{ invited?: string[]; skipped?: { email: string; reason: string }[]; error?: string }>(
    "/api/auth/invitations",
    { organizationId: workspace.id, emails, invitedByEmail: session.email, origin, teamIds },
  );
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 201 });
}
