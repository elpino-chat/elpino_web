import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl, resolveOAuthCallbackUrl } from "@/app/api/auth/_lib/redirect-url";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

const ASANA_CALLBACK_PATH = "/api/integrations/asana/callback";

export async function GET(request: Request) {
  const baseUrl = getAuthRedirectBaseUrl(request);
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=no_workspace`);

  const redirectUri = resolveOAuthCallbackUrl(request, ASANA_CALLBACK_PATH, process.env.ASANA_REDIRECT_URI);
  const params = new URLSearchParams({ companyId, redirectUri });

  const result = await callGateway<{ url?: string; error?: string }>(`/api/workspace/integrations/asana/authorize-url?${params.toString()}`);
  if (!result.url) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=${encodeURIComponent(result.error ?? "asana_not_configured")}`);
  }
  return Response.redirect(result.url);
}
