import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** One ticket with its conversation, customer and recent messages, for the Issues drawer. */
export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const params = new URL(request.url).searchParams;
  const provider = params.get("provider")?.trim();
  const id = params.get("id")?.trim();
  if (!provider || !id) return Response.json({ message: "provider and id are required" }, { status: 400 });

  const result = await callGateway<{ error?: string }>("/api/workspace/agent/tickets/detail", {
    companyId: workspace.id,
    provider,
    id,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not load the ticket" }, { status: result?.error === "Ticket not found" ? 404 : 400 });
  }
  return Response.json(result);
}
