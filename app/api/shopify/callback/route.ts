import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { normalizeShopDomain, safeEqual, SHOPIFY_STATE_COOKIE, siteOrigin, validShopifySignature, verifyStoreState } from "@/lib/store-connect";

// Shopify sends the merchant back here after they approve the install. The
// request is verified three ways before a code is exchanged: Shopify's own
// HMAC over the query, our signed state token, and the nonce cookie set when
// this browser started the install.

function done(query: string): Response {
  // The state cookie has served its purpose; clear it on the way out.
  return new Response(null, {
    status: 302,
    headers: {
      location: `${siteOrigin()}/dashboard/connect?${query}`,
      "set-cookie": `${SHOPIFY_STATE_COOKIE}=; Path=/api/shopify; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}

const fail = (code: string) => done(`integration_error=${encodeURIComponent(code)}`);

export async function GET(request: Request) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("shopify_install_is_not_configured");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const shop = normalizeShopDomain(url.searchParams.get("shop"));
  if (!code || !shop) return fail("shopify_did_not_return_a_store");
  if (!validShopifySignature(url.searchParams, clientSecret)) return fail("shopify_request_could_not_be_verified");

  const state = verifyStoreState(url.searchParams.get("state"), "shopify");
  const cookieNonce = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${SHOPIFY_STATE_COOKIE}=([a-f0-9]+)`))?.[1];
  if (!state || state.store !== shop || !cookieNonce || !safeEqual(cookieNonce, state.nonce)) return fail("the_install_link_expired_try_again");

  // Whoever finishes the install has to be signed in. Together with the nonce
  // cookie above, that keeps a leaked callback link useless to anyone else.
  const session = await requireSession();
  if (!session) return fail("sign_in_to_elpino_and_try_again");

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    cache: "no-store",
  }).catch(() => null);
  if (!tokenResponse?.ok) return fail("shopify_would_not_issue_an_access_token");
  const { access_token: accessToken } = (await tokenResponse.json().catch(() => ({}))) as { access_token?: string };
  if (!accessToken) return fail("shopify_would_not_issue_an_access_token");

  // Same path the manual form uses: workspace-service verifies the token against the
  // store and stores it encrypted, replacing any earlier Shopify connection.
  const saved = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/integrations/apikey", {
    companyId: state.companyId,
    provider: "shopify",
    credentials: { shopDomain: shop, accessToken },
  });
  if (saved.error) return fail(saved.error.replace(/[^a-z0-9]+/gi, "_").toLowerCase().slice(0, 80));
  return done("connected=shopify");
}
