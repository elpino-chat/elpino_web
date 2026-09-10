import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

type WidgetMessage = { id: string; senderType: string; senderId: string | null; body: string; createdAt: string };
type StartResult = { allowed: boolean; visitorToken?: string; conversationId?: string; botName?: string; botAvatarUrl?: string | null; messages?: WidgetMessage[]; error?: string };

// Same default as the Chatbot Interface settings page — a workspace that
// hasn't picked an avatar yet still shows a real icon instead of a blank/
// initial-letter fallback.
function defaultAvatarUrl(request: Request) {
  return `${getAuthRedirectBaseUrl(request)}/api/stock-icons/widget_5.png`;
}

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; hostname?: string; visitorToken?: string };
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim()) {
    return Response.json({ allowed: false, message: "key, hostname and visitorToken are required" }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<StartResult>("/api/workspace/widget/new", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
  });
  if (result.allowed && !result.botAvatarUrl) result.botAvatarUrl = defaultAvatarUrl(request);
  return Response.json(result, { status: result.allowed ? 200 : 403, headers: corsHeaders() });
}
