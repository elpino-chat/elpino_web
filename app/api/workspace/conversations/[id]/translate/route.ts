import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type TranslateResult = { translatedBody?: string | null; detectedLanguage?: string; targetLanguage?: string; error?: string };

/**
 * "See translation" on one customer message. Cached on the backend after the
 * first call for a given (message, workspace language) pair, so clicking it
 * again — or another agent opening the same thread — costs nothing further.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { messageId?: string };
  if (!body.messageId?.trim()) return Response.json({ message: "messageId is required" }, { status: 400 });

  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ message: "No workspace selected" }, { status: 404 });

  const result = await callGateway<TranslateResult>("/api/workspace/agent/translate", {
    companyId: workspace.id,
    conversationId: id,
    messageId: body.messageId.trim(),
  }).catch(() => null);

  if (!result || result.error) {
    return Response.json({ message: result?.error ?? "Could not translate this message" }, { status: 400 });
  }
  return Response.json({
    translatedBody: result.translatedBody ?? null,
    detectedLanguage: result.detectedLanguage ?? null,
    targetLanguage: result.targetLanguage ?? "en",
  });
}
