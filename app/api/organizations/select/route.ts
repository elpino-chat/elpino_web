import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as { organizationId?: string };
  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return Response.json({ message: "organizationId is required" }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    "/api/auth/organizations/select",
    { email: session.email, organizationId },
  );
  if (result?.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
