import { callGateway } from "@/app/api/auth/_lib/gateway";

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; hostname?: string; visitorToken?: string; conversationId?: string };
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim() || !body.conversationId?.trim()) {
    return Response.json({ ok: false }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<{ ok?: boolean }>("/api/workspace/widget/typing", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId.trim(),
  });
  return Response.json(result, { headers: corsHeaders() });
}
