import { callGateway } from "@/app/api/auth/_lib/gateway";

type ConversationSummary = { id: string; status: string; preview: string; time: string };
type ListResult = { allowed: boolean; conversations?: ConversationSummary[]; error?: string };

function corsHeaders() {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS", "cache-control": "no-store" };
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  const hostname = url.searchParams.get("hostname")?.trim();
  const visitorToken = url.searchParams.get("visitorToken")?.trim();
  if (!key || !hostname || !visitorToken) {
    return Response.json({ allowed: false, message: "key, hostname and visitorToken are required" }, { status: 400, headers: corsHeaders() });
  }

  const params = new URLSearchParams({ publicKey: key, hostname, visitorToken });
  const result = await callGateway<ListResult>(`/api/workspace/widget/conversations?${params.toString()}`);
  return Response.json(result, { status: result.allowed ? 200 : 403, headers: corsHeaders() });
}
