import { callGateway } from "@/app/api/auth/_lib/gateway";

type WidgetMessage = { id: string; senderType: string; senderId: string | null; body: string; attachmentUrl?: string | null; attachmentType?: string | null; attachmentName?: string | null; createdAt: string };
type MessagesResult = { messages?: WidgetMessage[]; message?: WidgetMessage; greeting?: WidgetMessage | null; conversationId?: string; agentTyping?: boolean; error?: string };
type Attachment = { url: string; type: string; name?: string };

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  const hostname = url.searchParams.get("hostname")?.trim();
  const visitorToken = url.searchParams.get("visitorToken")?.trim();
  const conversationId = url.searchParams.get("conversationId")?.trim();
  if (!key || !hostname || !visitorToken || !conversationId) {
    return Response.json({ error: "key, hostname, visitorToken and conversationId are required" }, { status: 400, headers: corsHeaders() });
  }

  const params = new URLSearchParams({ publicKey: key, hostname, visitorToken, conversationId });
  const result = await callGateway<MessagesResult>(`/api/workspace/widget/messages?${params.toString()}`);
  return Response.json(result, { status: result.error ? 404 : 200, headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    hostname?: string;
    visitorToken?: string;
    conversationId?: string;
    body?: string;
    attachment?: Attachment;
    topic?: string;
  };
  const text = body.body?.trim() ?? "";
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim() || (!text && !body.attachment?.url)) {
    return Response.json({ error: "key, hostname, visitorToken and body (or an attachment) are required" }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<MessagesResult>("/api/workspace/widget/messages", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId?.trim() || undefined,
    body: text,
    attachment: body.attachment,
    topic: body.topic,
  });
  return Response.json(result, { status: result.error ? 400 : 200, headers: corsHeaders() });
}
