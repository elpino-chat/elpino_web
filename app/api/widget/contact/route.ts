import { callGateway } from "@/app/api/auth/_lib/gateway";

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; hostname?: string; visitorToken?: string; conversationId?: string; name?: string; email?: string; phone?: string };
  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim() || (!name && !email && !phone)) {
    return Response.json({ error: "key, hostname, visitorToken and a contact detail are required" }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<{ ok?: boolean; aiWillReply?: boolean; handoffStarted?: boolean; error?: string }>("/api/workspace/widget/contact", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId?.trim() || undefined,
    name,
    email,
    phone,
  });
  return Response.json(result, { headers: corsHeaders() });
}
