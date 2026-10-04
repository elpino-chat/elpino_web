import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { selectedWorkspaceId } from "@/app/api/workspace/integrations/_lib/workspace";
import { normalizeStoreOrigin, signStoreState, siteOrigin } from "@/lib/store-connect";

// WooCommerce ships its own one-click key flow (wc-auth/v1/authorize): the
// merchant approves a screen on their own store, and the store then POSTs a
// freshly generated read/write consumer key + secret to our callback_url — no
// copy-paste. The workspace is carried through as the signed `user_id`, since
// that server-to-server POST has no Elpino session behind it.

function connectError(code: string): Response {
  return Response.redirect(`${siteOrigin()}/dashboard/connect?integration_error=${encodeURIComponent(code)}`);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = normalizeStoreOrigin(url.searchParams.get("siteUrl"));
  if (!store) return connectError("enter_your_store_s_https_address");

  const session = await requireSession();
  if (!session) {
    return Response.redirect(`${siteOrigin()}/login?next=${encodeURIComponent(`/api/woocommerce/start?${url.searchParams.toString()}`)}`);
  }
  const companyId = await selectedWorkspaceId();
  if (!companyId) return connectError("create_a_workspace_first");

  const { token } = signStoreState({ kind: "woocommerce", companyId, store });
  const authorize = new URL(`${store}/wc-auth/v1/authorize`);
  authorize.searchParams.set("app_name", "Elpino");
  authorize.searchParams.set("scope", "read_write");
  authorize.searchParams.set("user_id", token);
  authorize.searchParams.set("return_url", `${siteOrigin()}/dashboard/connect?connected=woocommerce`);
  authorize.searchParams.set("callback_url", `${siteOrigin()}/api/woocommerce/callback`);
  return Response.redirect(authorize.toString());
}
