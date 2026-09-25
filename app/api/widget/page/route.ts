import { callGateway } from "@/app/api/auth/_lib/gateway";

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

// The chat widget reports which page of the customer's site the visitor is on,
// so a teammate can see it in the inbox. The backend checks the visitor owns the
// conversation, keeps only the path (no query string), and honours the site's
// "Support context" permission; this route just forwards.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; hostname?: string; visitorToken?: string; conversationId?: string; path?: unknown; title?: unknown };
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim() || !body.conversationId?.trim()) {
    return Response.json({ ok: false }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<{ ok?: boolean }>("/api/workspace/widget/page", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId.trim(),
    path: typeof body.path === "string" ? body.path.slice(0, 600) : undefined,
    title: typeof body.title === "string" ? body.title.slice(0, 400) : undefined,
  });
  return Response.json(result, { headers: corsHeaders() });
}
