import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { demoContacts, isDemoUser } from "@/app/api/_lib/demo-dashboard-data";

type Organization = { id: string; name: string; role: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  sourceCount: number;
  customerIds: string[];
  customFields: Record<string, string>;
};

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  if (isDemoUser(session.userId)) {
    return Response.json({ contacts: demoContacts() });
  }

  const orgResult = await callGateway<OrganizationsResult>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = orgResult.organizations ?? [];
  const selected =
    organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ??
    organizations[0];

  if (!selected) {
    return Response.json({ contacts: [] });
  }

  const result = await callGateway<{ customers?: Contact[]; ok?: false; upgradeRequired?: true; error?: string }>(
    `/api/workspace/customers?companyId=${encodeURIComponent(selected.id)}`,
  );

  // A plan that doesn't include customer profiles gets { ok: false,
  // upgradeRequired, error } instead of { customers }, at 200 — see
  // BillingService.requireFeature. This used to collapse to an empty
  // contacts list indistinguishable from "no contacts yet"; pass the gate
  // through so the client can show why instead of a silent empty state.
  if (result.upgradeRequired) {
    return Response.json({ contacts: [], upgradeRequired: true, error: result.error });
  }

  return Response.json({ contacts: result.customers ?? [] });
}
