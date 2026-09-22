import { callGateway } from "@/app/api/auth/_lib/gateway";
import { rateLimit } from "@/app/api/_lib/rate-limit";
import { requireSession } from "../_lib/require-user";

type Organization = { id: string; name: string };

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const limited = await rateLimit(request, `widget-install:${session.userId}`, { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => ({})) as { emails?: unknown; siteKey?: unknown };
  const emails = Array.isArray(body.emails) ? body.emails.map((value) => String(value)) : [];
  const siteKey = typeof body.siteKey === "string" ? body.siteKey.trim() : "";
  if (!siteKey || emails.length < 1) {
    return Response.json({ message: "Enter up to 10 valid developer email addresses." }, { status: 400 });
  }

  const organizationResult = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = organizationResult.organizations ?? [];
  const workspace = organizations.find((item) => item.id === organizationResult.selectedOrganizationId) ?? organizations[0];
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 404 });

  const result = await callGateway<{ ok?: boolean; sent?: number; error?: string }>(
    "/api/workspace/sites/send-install-instructions",
    { companyId: workspace.id, siteKey, requesterEmail: session.email, requesterName: session.name || session.email, emails },
  );
  if (!result.ok) return Response.json({ message: result.error || "Could not send the instructions." }, { status: 502 });

  return Response.json({ ok: true, sent: result.sent ?? emails.length });
}
