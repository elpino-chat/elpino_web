import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type RecentTicket = {
  provider: string;
  id: string;
  url: string | null;
  title: string;
  conversationId: string;
  createdAt: string;
  resolved?: boolean;
  source?: string;
  reason?: string | null;
  category?: string;
  note?: string | null;
  customerName?: string | null;
};

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ tickets: [] });

  const result = await callGateway<{ tickets?: RecentTicket[] }>("/api/workspace/agent/tickets", {
    companyId: workspace.id,
    limit: 200,
  }).catch(() => null);
  return Response.json({ tickets: result?.tickets ?? [] });
}
