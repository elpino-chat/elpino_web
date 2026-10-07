import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type TicketResult = {
  ticket?: { provider: string; id: string; url: string | null; title: string };
  error?: string;
  needsIntegration?: boolean;
};

/** Tickets already filed about this conversation — checked before the dialog offers a blank "create ticket" form. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ tickets: [] });

  const result = await callGateway<{ tickets?: { provider: string; id: string; url: string | null; title: string; createdAt: string }[]; error?: string }>(
    "/api/workspace/agent/tickets",
    { companyId: workspace.id, conversationId: id },
  ).catch(() => null);

  return Response.json({ tickets: result?.tickets ?? [] });
}

/** Files a ticket about this conversation. It is always kept in Elpino; a connected project tool can get a copy. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    note?: string;
    provider?: "trello" | "asana";
    asanaProjectGid?: string;
    category?: string;
  };

  const result = await callGateway<TicketResult>("/api/workspace/agent/ticket", {
    companyId: workspace.id,
    conversationId: id,
    title: body.title,
    note: body.note,
    provider: body.provider,
    asanaProjectGid: body.asanaProjectGid,
    category: body.category,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json(
      { message: result?.error ?? "Could not create the ticket", needsIntegration: result?.needsIntegration ?? false },
      { status: 400 },
    );
  }
  return Response.json(result);
}
