import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type JoinLinkResult = { enabled?: boolean; token?: string | null; error?: string };

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, "manage the join link");
  if (!owner.ok) return Response.json({ enabled: false, token: null }, { status: owner.status });

  const result = await callGateway<JoinLinkResult>(
    `/api/auth/organizations/${encodeURIComponent(owner.workspace.id)}/join-link?email=${encodeURIComponent(session.email)}`,
  ).catch(() => null);
  return Response.json({ enabled: result?.enabled ?? false, token: result?.token ?? null });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, "manage the join link");
  if (!owner.ok) return Response.json({ message: owner.message }, { status: owner.status });

  const body = (await request.json().catch(() => ({}))) as { enabled?: boolean };
  if (typeof body.enabled !== "boolean") return Response.json({ message: "enabled is required" }, { status: 400 });

  const result = await callGateway<JoinLinkResult>(`/api/auth/organizations/${encodeURIComponent(owner.workspace.id)}/join-link`, {
    email: session.email,
    enabled: body.enabled,
  }).catch(() => null);
  if (!result || result.error) return Response.json({ message: result?.error ?? "Could not update the join link" }, { status: 400 });
  return Response.json({ enabled: result.enabled, token: result.token });
}
