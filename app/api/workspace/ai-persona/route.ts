import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
type Persona = { id: string; name: string; aiName: string; aiAvatarUrl: string | null; aiPersona: string | null; chatbotAccent: string; chatbotTheme: string; chatbotReplyLanguage: string; greetingLines: string[] };
type CompanyResult = { company?: Persona; error?: string };

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

  return Response.json({ persona: result.company });
}

export async function PATCH(request: Request) {
  const blocked = await ownerGuard("change the chatbot");
  if (blocked) return blocked;
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
    chatbotReplyLanguage?: string;
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
