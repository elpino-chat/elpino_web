import { callGateway } from "@/app/api/auth/_lib/gateway";
import { clientGeo, clientIp } from "@/app/api/_lib/client-geo";

type TrackResult = { allowed: boolean };

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    key?: string; hostname?: string; visitorId?: string; sessionId?: string; url?: string; path?: string; referrer?: string;
  };
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorId?.trim() || !body.sessionId?.trim() || !body.url?.trim() || !body.path?.trim()) {
    return Response.json({ allowed: false }, { status: 400, headers: corsHeaders() });
  }

  const geo = clientGeo(request);
  const result = await callGateway<TrackResult>("/api/workspace/analytics/track", {
    key: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorId: body.visitorId.trim(),
    sessionId: body.sessionId.trim(),
    url: body.url.trim(),
    path: body.path.trim(),
    referrer: body.referrer?.trim() || undefined,
    country: geo.country ?? undefined,
    region: geo.region ?? undefined,
    city: geo.city ?? undefined,
    ip: clientIp(request) ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });
  return Response.json(result, { status: result.allowed ? 200 : 403, headers: corsHeaders() });
}
