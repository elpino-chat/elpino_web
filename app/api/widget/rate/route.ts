import { callGateway } from "@/app/api/auth/_lib/gateway";

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    hostname?: string;
    visitorToken?: string;
    conversationId?: string;
    score?: number;
    rating?: number;
    comment?: string;
  };
  // score: the five-emoji scale, 1 (terrible) to 5 (amazing). rating: the older thumbs (1 / -1), still accepted.
  const validScore = typeof body.score === "number" && Number.isInteger(body.score) && body.score >= 1 && body.score <= 5;
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim() || !body.conversationId?.trim() || (!validScore && body.rating !== 1 && body.rating !== -1)) {
    return Response.json({ error: "key, hostname, visitorToken, conversationId and a score from 1 to 5 are required" }, { status: 400, headers: corsHeaders() });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/widget/rate", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId.trim(),
    ...(validScore ? { score: body.score } : { rating: body.rating }),
    comment: typeof body.comment === "string" ? body.comment.slice(0, 2000) : undefined,
  });
  return Response.json(result, { headers: corsHeaders() });
}
