import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, "remove a member");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  if (!body.userId?.trim()) return Response.json({ message: "userId is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    `/api/auth/organizations/${encodeURIComponent(owner.workspace.id)}/members/remove`,
    { userId: body.userId.trim(), requestedByEmail: session.email },
  ).catch(() => null);
  if (!result?.ok) return Response.json({ message: result?.error ?? "Could not remove that member" }, { status: 400 });
  return Response.json({ ok: true });
}
