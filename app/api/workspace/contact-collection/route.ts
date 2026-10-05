import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type OrganizationsResult = { organizations?: { id: string; name: string }[]; selectedOrganizationId?: string };
type ContactCollection = "chat" | "off";

async function resolveSelectedOrg(email: string) {
  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(email)}`);
  const organizations = orgResult.organizations ?? [];
  return organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0] ?? null;
}

// "Collect contact details" in the Chatbot Interface settings.
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ contactCollection: "chat" });
  const result = await callGateway<{ company?: { contactCollection?: string } }>(`/api/workspace/companies/${encodeURIComponent(selected.id)}`);
  return Response.json({ contactCollection: result.company?.contactCollection === "off" ? "off" : "chat" });
}

export async function PATCH(request: Request) {
  const blocked = await ownerGuard("change how contact details are collected");
  if (blocked) return blocked;
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ message: "No workspace selected" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { contactCollection?: unknown };
  if (body.contactCollection !== "chat" && body.contactCollection !== "off") {
    return Response.json({ message: "contactCollection must be chat or off" }, { status: 400 });
  }
  const { payload } = await patchGateway<{ contactCollection?: ContactCollection; error?: string }>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/contact-collection`,
    { contactCollection: body.contactCollection },
  );
  if (!payload.contactCollection) return Response.json({ message: payload.error ?? "Could not save" }, { status: 400 });
  return Response.json({ contactCollection: payload.contactCollection });
}
