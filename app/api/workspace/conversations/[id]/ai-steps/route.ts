import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

// What the AI did on each of its turns in one conversation, for the activity lines shown in the
// thread. Only the step names, whether each worked, a short note on a few of them, and when the turn ran
// leave this route: run errors, model names, token counts and other step arguments stay on the server.
type AgentRun = {
  id: string;
  conversationId: string;
  outcome: string;
  steps: { tool?: unknown; ok?: unknown; args?: unknown; summary?: unknown }[] | null;
  latencyMs: number;
  createdAt: string;
};

// The few details a step may carry to the team, all plain text: the router's reading of what the customer
// wants, the AI's own reason for a handoff, and the handoff check's verdict. Any other step argument stays on
// the server.
function stepNote(step: { tool?: unknown; args?: unknown; summary?: unknown }): string | undefined {
  const args = (step.args ?? null) as { intent?: unknown; reason?: unknown } | null;
  const text = step.tool === "route_specialist" ? args?.intent
    : step.tool === "escalate_to_human" ? args?.reason
    : step.tool === "handoff_check" ? step.summary
    // Why the AI could not answer: the fallback and a failed router carry a short reason (no model names).
    : step.tool === "model_fallback" || step.tool === "route_specialist" && !args?.intent ? step.summary
    : undefined;
  return typeof text === "string" && text.trim() ? text.trim().slice(0, 200) : undefined;
}

type LiveProgress = { startedAt: number; running: string | null; steps: { tool?: unknown; ok?: unknown; args?: unknown; summary?: unknown }[] };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ runs: [], live: null }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ runs: [], live: null });

  const query = new URLSearchParams({ companyId: workspace.id, conversationId: id, limit: "50" });
  const result = await callGateway<{ runs?: AgentRun[]; live?: LiveProgress | null }>(`/api/workspace/agent/runs?${query.toString()}`).catch(() => null);
  const runs = (result?.runs ?? [])
    .filter((run) => run.conversationId === id)
    .map((run) => ({
      id: run.id,
      outcome: run.outcome,
      // The turn began when the customer's message was picked up; the row is written when it ends.
      startedAt: new Date(new Date(run.createdAt).getTime() - (run.latencyMs || 0)).toISOString(),
      steps: (Array.isArray(run.steps) ? run.steps : [])
        .filter((step) => typeof step?.tool === "string")
        .map((step) => ({ tool: step.tool as string, ok: step.ok === true, note: stepNote(step) })),
    }));
  // The turn running right now, if any: the steps so far and what is in progress, in the same plain form.
  const live = result?.live && Array.isArray(result.live.steps)
    ? {
        startedAt: new Date(result.live.startedAt).toISOString(),
        // A tool name only; anything else is dropped.
        running: typeof result.live.running === "string" && /^[a-z_]{1,40}$/.test(result.live.running) ? result.live.running : null,
        steps: result.live.steps
          .filter((step) => typeof step?.tool === "string")
          .map((step) => ({ tool: step.tool as string, ok: step.ok === true, note: stepNote(step) })),
      }
    : null;
  return Response.json({ runs, live });
}
