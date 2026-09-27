import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const { token } = await params;

  const result = await callGateway<{ ok?: boolean; organizationId?: string; error?: string }>(
    `/api/auth/join-link/${encodeURIComponent(token)}/accept`,
    { email: session.email },
  ).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not join this workspace" }, { status: 400 });
  return Response.json({ ok: true, organizationId: result.organizationId });
}
