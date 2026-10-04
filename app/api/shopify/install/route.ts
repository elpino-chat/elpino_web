import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";
import { normalizeShopDomain, SHOPIFY_SCOPES, SHOPIFY_STATE_COOKIE, signStoreState, siteOrigin, STORE_CONNECT_TTL_SECONDS, validShopifySignature } from "@/lib/store-connect";

// Starts the Shopify OAuth install. Reached two ways:
//   - from the Connect page, with ?shop=<store> typed by the merchant;
//   - from Shopify itself (App URL / the App Store "Install" button), with
//     ?shop=...&hmac=...&host=... — that request is signed, so a forged
//     one can't bounce a visitor into an install they didn't ask for.
// Either way the merchant must already be signed in to Elpino; if not they log
// in and land back here with the same query string.

function connectError(code: string): Response {
  return Response.redirect(`${siteOrigin()}/dashboard/connect?integration_error=${encodeURIComponent(code)}`);
}

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return connectError("shopify_install_is_not_configured");

  const url = new URL(request.url);
  const shop = normalizeShopDomain(url.searchParams.get("shop"));
  if (!shop) return connectError("enter_your_store_s_myshopify_com_address");
  // A signed request came from Shopify; if it carries an hmac it has to be right.
  if (url.searchParams.has("hmac") && !validShopifySignature(url.searchParams, clientSecret)) {
    return Response.json({ message: "Invalid request signature" }, { status: 401 });
  }

  const session = await requireSession();
  if (!session) {
    const next = `/api/shopify/install?${url.searchParams.toString()}`;
    return Response.redirect(`${siteOrigin()}/login?next=${encodeURIComponent(next)}`);
  }
  const companyId = await selectedWorkspaceId();
  if (!companyId) return connectError("create_a_workspace_first");

  const { token, nonce } = signStoreState({ kind: "shopify", companyId, store: shop });
  const authorize = new URL(`https://${shop}/admin/oauth/authorize`);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("scope", SHOPIFY_SCOPES);
  authorize.searchParams.set("redirect_uri", `${siteOrigin()}/api/shopify/callback`);
  authorize.searchParams.set("state", token);

  // The nonce is bound to this browser too, so a state token leaked from a
  // URL can't be completed from somebody else's session.
  const secure = siteOrigin().startsWith("https://") ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      "set-cookie": `${SHOPIFY_STATE_COOKIE}=${nonce}; Path=/api/shopify; HttpOnly; SameSite=Lax; Max-Age=${STORE_CONNECT_TTL_SECONDS}${secure}`,
    },
  });
}
