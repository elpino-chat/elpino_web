import { callGateway } from "@/app/api/auth/_lib/gateway";
import { ownersOnly, selectedWorkspace } from "@/app/api/teams/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 400 });
  if (workspace.role !== "owner") return ownersOnly();

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  if (!body.userId?.trim()) return Response.json({ message: "userId is required." }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/teams/members/add", {
    teamId: id,
    organizationId: workspace.id,
    userId: body.userId.trim(),
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 400 });
  if (workspace.role !== "owner") return ownersOnly();

  const { id } = await params;
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId?.trim()) return Response.json({ message: "userId is required." }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/teams/members/remove", {
    teamId: id,
    organizationId: workspace.id,
    userId: userId.trim(),
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
