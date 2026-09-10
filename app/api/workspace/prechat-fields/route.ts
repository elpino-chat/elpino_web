import { callGateway, patchGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
export type PreChatField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
};
type CompanyResult = { company?: { id: string; preChatFields: PreChatField[] | null }; error?: string };

// Mirrors WidgetService.DEFAULT_PRECHAT_FIELDS — shown as the starting point
// so an admin who has never customized the form edits from what visitors
// are actually seeing today, not a blank slate.
export const DEFAULT_PRECHAT_FIELDS: PreChatField[] = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "phone", label: "Phone number", type: "phone", required: true },
  {
    id: "topic",
    label: "What can we help with?",
    type: "select",
    required: true,
    options: ["General question", "Billing", "Technical support", "Cloud migration", "I want a quote"],
  },
];

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

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ fields: DEFAULT_PRECHAT_FIELDS });

  await callGateway("/api/workspace/companies", { organizationId: selected.id, name: selected.name });
  const result = await callGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}`,
  );

  const fields = result.company?.preChatFields;
  return Response.json({ fields: Array.isArray(fields) && fields.length > 0 ? fields : DEFAULT_PRECHAT_FIELDS });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const selected = await resolveSelectedOrg(session.email);
  if (!selected) return Response.json({ message: "No workspace selected" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { fields?: PreChatField[] };
  if (!Array.isArray(body.fields)) return Response.json({ message: "fields is required" }, { status: 400 });

  const { payload: result } = await patchGateway<CompanyResult>(
    `/api/workspace/companies/${encodeURIComponent(selected.id)}/prechat-fields`,
    { fields: body.fields },
  );
  if (!result.company) {
    return Response.json({ message: result.error ?? "Could not update the pre-chat form" }, { status: 400 });
  }

  return Response.json({ fields: result.company.preChatFields ?? DEFAULT_PRECHAT_FIELDS });
}
