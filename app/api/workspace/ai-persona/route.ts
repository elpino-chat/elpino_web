import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
type Persona = { id: string; name: string; aiName: string; aiAvatarUrl: string | null; aiPersona: string | null; chatbotAccent: string; chatbotTheme: string; greetingLines: string[] };
type CompanyResult = { company?: Persona; error?: string };

// Every workspace starts out with this stock icon as its AI teammate's
// avatar until someone picks something else — same asset the avatar picker
// offers, served from /api/stock-icons so it works both in this dashboard
// and from a customer's own site (tag.js needs an absolute, this app's own
// origin URL, not a relative path).
const DEFAULT_AVATAR_ICON = "widget_5";
function defaultAvatarUrl(request: Request) {
  return `${new URL(request.url).origin}/api/stock-icons/${DEFAULT_AVATAR_ICON}.png`;
}

async function resolveSelectedOrg(email: string) {
  const orgResult = await callGateway<OrganizationsResult>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = orgResult.organizations ?? [];
  return (
    organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ??
    organizations[0] ??
    null
  );
}

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ persona: null });

  // Self-heal, same as the conversations route: make sure the Company row
  // exists before reading its persona fields.
  await callGateway("/api/workspace/companies", { organizationId: selected.id, name: selected.name });
  const result = await callGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}`,
  );
  if (!result.company) return Response.json({ message: result.error ?? "Not found" }, { status: 404 });
  if (!result.company.aiAvatarUrl) result.company.aiAvatarUrl = defaultAvatarUrl(request);

  return Response.json({ persona: result.company });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    aiName?: string;
    aiAvatarUrl?: string;
    aiPersona?: string;
    chatbotAccent?: string;
    chatbotTheme?: string;
    greetingLines?: string[];
  };

  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/ai-persona`,
    body,
  );
  if (!result.company) {
    return Response.json({ message: result.error ?? "Could not update AI persona" }, { status: 400 });
  }

  return Response.json({ persona: result.company });
}
