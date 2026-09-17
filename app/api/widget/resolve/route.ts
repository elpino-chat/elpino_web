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
    return Response.json({ error: "key, hostname, visitorToken and conversationId are required" }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/widget/resolve", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId.trim(),
  });
  return Response.json(result, { headers: corsHeaders() });
}
