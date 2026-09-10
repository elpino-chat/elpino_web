import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getAuthRedirectBaseUrl(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=asana_missing_code`);
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/integrations/asana/callback", { code, state });
  if (!result.ok) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=${encodeURIComponent(result.error ?? "asana_exchange_failed")}`);
  }
  return Response.redirect(`${baseUrl}/dashboard/connect?connected=asana`);
}
