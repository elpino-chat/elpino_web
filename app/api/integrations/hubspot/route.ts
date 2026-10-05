import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl, resolveOAuthCallbackUrl } from "@/app/api/auth/_lib/redirect-url";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

const HUBSPOT_CALLBACK_PATH = "/api/integrations/hubspot/callback";

export async function GET(request: Request) {
  if (await ownerGuard("connect integrations")) return Response.redirect(`${getAuthRedirectBaseUrl(request)}/dashboard/connect?integration_error=only_the_owner_can_connect_integrations`);
  const baseUrl = getAuthRedirectBaseUrl(request);
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=no_workspace`);

  const redirectUri = resolveOAuthCallbackUrl(request, HUBSPOT_CALLBACK_PATH, process.env.HUBSPOT_REDIRECT_URI);
  const params = new URLSearchParams({ companyId, redirectUri });

  const result = await callGateway<{ url?: string; error?: string }>(`/api/workspace/integrations/hubspot/authorize-url?${params.toString()}`);
  if (!result.url) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=${encodeURIComponent(result.error ?? "hubspot_not_configured")}`);
  }
  return Response.redirect(result.url);
}
