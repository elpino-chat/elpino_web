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

  const body = (await request.json().catch(() => ({}))) as { amountCents?: number };
  const amountCents = Math.round(Number(body.amountCents));
  if (!amountCents || amountCents <= 0) {
    return Response.json({ message: "Enter a positive amount." }, { status: 400 });
  }

  const result = await callGateway<{ balanceCents?: number; error?: string }>("/api/workspace/usage/credits/add", {
    companyId: workspace.id,
    amountCents,
    note: `Manual top-up by ${session.email}`,
  });
  if (result.balanceCents === undefined) {
    return Response.json({ message: result.error ?? "Could not add credits" }, { status: 400 });
  }
  return Response.json({ balanceCents: result.balanceCents });
}
