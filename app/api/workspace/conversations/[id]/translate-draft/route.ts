import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type TranslateDraftResult = { translatedText?: string | null; targetLanguage?: string; error?: string };

/**
 * "Translate" in the reply composer — the mirror of "See translation" on a
 * customer's message. Translates the agent's draft into whatever language
 * the customer last wrote in, so an agent can type in their own language
 * and still reply in the customer's.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { text?: string };
  if (!body.text?.trim()) return Response.json({ message: "text is required" }, { status: 400 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<TranslateDraftResult>("/api/workspace/agent/translate-draft", {
    companyId: workspace.id,
    conversationId: id,
    text: body.text,
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not translate this reply" }, { status: 400 });
  }
  return Response.json({ translatedText: result.translatedText ?? null, targetLanguage: result.targetLanguage ?? "en" });
}
