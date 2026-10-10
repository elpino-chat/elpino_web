import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };

/** The workspace greeting in one language, translated once and saved: the Chatbot Interface page calls this when a reply language is picked. */
export async function POST(request: Request) {
  const blocked = await ownerGuard("change the chatbot");
  if (blocked) return blocked;
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(session.email)}`);
  const organizations = orgResult.organizations ?? [];
  const selected = organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0];
  if (!selected) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { language?: string; force?: boolean };
  const result = await callGateway<{ language?: string; lines?: string[]; error?: string }>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/greeting-translate`,
    { language: body.language, force: body.force === true },
  );
  if (!result.lines) return Response.json({ message: result.error ?? "Could not translate the greeting" }, { status: 400 });
  return Response.json({ language: result.language, lines: result.lines });
}
