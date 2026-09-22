import { callGateway } from "@/app/api/auth/_lib/gateway";
import { getAuthRedirectBaseUrl } from "@/app/api/auth/_lib/redirect-url";

type WidgetConfig = {
  botName?: string;
  botAvatarUrl?: string | null;
  greetingLines?: string[];
  permissions?: unknown;
  /** Plan entitlement: paid tiers drop the "Powered by Elpino" footer. */
  removeBranding?: boolean;
};

// Same default as the Chatbot Interface settings page — a workspace that
// hasn't picked an avatar yet still shows a real icon instead of the
// generic chat-bubble SVG in the launcher button.
function defaultAvatarUrl(request: Request) {
  return `${getAuthRedirectBaseUrl(request)}/api/stock-icons/widget_5.png`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  const hostname = url.searchParams.get("hostname")?.trim();
  if (!key || !hostname) return Response.json({ allowed: false, message: "key and hostname are required" }, { status: 400 });

  const claimedHost = hostname.toLowerCase().replace(/^www\./, "");
  const source = request.headers.get("origin") || request.headers.get("referer");
  let sourceHost = "";
  try {
    sourceHost = source ? new URL(source).hostname.toLowerCase().replace(/^www\./, "") : "";
  } catch {
    sourceHost = "";
  }
  if (!sourceHost || sourceHost !== claimedHost) {
    return Response.json(
      { allowed: false, message: "The widget request did not come from the registered domain" },
      { status: 403, headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } },
    );
  }

  const result = await callGateway<{ allowed?: boolean; config?: WidgetConfig }>(`/api/workspace/sites/resolve/${encodeURIComponent(key)}?hostname=${encodeURIComponent(hostname)}`);
  if (result.allowed) {
    await callGateway<{ allowed?: boolean }>("/api/workspace/sites/collect", { publicKey: key, hostname });
  }
  if (result.allowed && result.config && !result.config.botAvatarUrl) result.config.botAvatarUrl = defaultAvatarUrl(request);
  return Response.json(result, { status: result.allowed ? 200 : 403, headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
