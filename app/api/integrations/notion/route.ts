import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl, resolveOAuthCallbackUrl } from "@/app/api/auth/_lib/redirect-url";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";

const NOTION_CALLBACK_PATH = "/api/integrations/notion/callback";

export async function GET(request: Request) {
  const baseUrl = getAuthRedirectBaseUrl(request);
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=no_workspace`);

  const redirectUri = resolveOAuthCallbackUrl(request, NOTION_CALLBACK_PATH, process.env.NOTION_REDIRECT_URI);
  const params = new URLSearchParams({ companyId, redirectUri });

  const result = await callGateway<{ url?: string; error?: string }>(`/api/workspace/integrations/notion/authorize-url?${params.toString()}`);
  if (!result.url) {
    return Response.redirect(`${baseUrl}/dashboard/connect?integration_error=${encodeURIComponent(result.error ?? "notion_not_configured")}`);
  }
  return Response.redirect(result.url);
}
