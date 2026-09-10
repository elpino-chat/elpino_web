import { callGateway } from "@/app/api/auth/_lib/gateway";

type PreChatResult = { allowed: boolean; conversationId?: string | null; error?: string };

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
    answers?: Record<string, string>;
  };
  if (!body.key?.trim() || !body.hostname?.trim() || !body.visitorToken?.trim()) {
    return Response.json({ allowed: false, error: "key, hostname and visitorToken are required" }, { status: 400, headers: corsHeaders() });
  }

  const answers = Object.fromEntries(
    Object.entries(body.answers ?? {})
      .map(([id, value]) => [id, typeof value === "string" ? value.trim() : value])
      .filter(([, value]) => value),
  );

  const result = await callGateway<PreChatResult>("/api/workspace/widget/prechat", {
    publicKey: body.key.trim(),
    hostname: body.hostname.trim(),
    visitorToken: body.visitorToken.trim(),
    conversationId: body.conversationId?.trim() || undefined,
    answers,
  });
  return Response.json(result, { status: result.allowed ? 200 : 400, headers: corsHeaders() });
}
