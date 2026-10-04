import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = getAuthRedirectBaseUrl(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // HubSpot sends an error parameter when the user cancels on the consent screen.
  if (url.searchParams.get("error")) return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=hubspot_access_denied`);
  if (!code || !state) return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=hubspot_missing_code`);

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/integrations/hubspot/callback", { code, state });
  if (!result.ok) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=${encodeURIComponent(result.error ?? "hubspot_exchange_failed")}`);
  }
  return Response.redirect(`${baseUrl}/dashboard/connect?connected=hubspot`);
}
