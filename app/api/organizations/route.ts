import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const result = await callGateway(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  return Response.json(result);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";
  if (!name) {
    return Response.json({ message: "Organization name is required" }, { status: 400 });
  }

  const result = await callGateway<{ organization?: unknown; error?: string }>(
    "/api/auth/organizations",
    { email: session.email, name },
  );
  if (result?.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  return Response.json(result);
}
