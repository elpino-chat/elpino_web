import { callGateway } from "@/app/api/auth/_lib/gateway";

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
  if (!key || !hostname) {
    return Response.json({ allowed: false, message: "key and hostname are required" }, { status: 400, headers: corsHeaders() });
  }
  const params = new URLSearchParams({ publicKey: key, hostname });
  params.set("q", (url.searchParams.get("q") ?? "").slice(0, 100));
  const result = await callGateway<{ allowed?: boolean }>(`/api/workspace/widget/help/search?${params.toString()}`);
  return Response.json(result, { status: result.allowed === false ? 403 : 200, headers: corsHeaders() });
}
