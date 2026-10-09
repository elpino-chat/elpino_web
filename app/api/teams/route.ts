import { callGateway } from "@/app/api/auth/_lib/gateway";
import { ownersOnly, selectedWorkspace } from "@/app/api/teams/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ teams: [] });
  const result = await callGateway<{ teams?: unknown[]; error?: string }>(
    `/api/auth/teams?organizationId=${encodeURIComponent(workspace.id)}`,
  );
  return Response.json(result.error ? { teams: [], message: result.error } : { teams: result.teams ?? [] });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "Create a workspace first." }, { status: 400 });
  if (workspace.role !== "owner") return ownersOnly();

  const body = (await request.json().catch(() => ({}))) as { name?: string; description?: string; memberUserIds?: string[] };
  const name = body.name?.trim();
  if (!name) return Response.json({ message: "Team name is required." }, { status: 400 });

  const result = await callGateway<{ team?: unknown; error?: string }>("/api/auth/teams", {
    organizationId: workspace.id,
    name,
    description: body.description,
    memberUserIds: body.memberUserIds ?? [],
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 201 });
}
