import { callGateway } from "@/app/api/auth/_lib/gateway";
import { verifyStoreState } from "@/lib/store-connect";

// WooCommerce POSTs here, from the store's own server, once the merchant has
// approved the connection: { key_id, user_id, consumer_key, consumer_secret,
// key_permissions }. No cookies, so trust comes from user_id — the signed,
// expiring token minted in /api/woocommerce/start. The site address is read
// from that token, never from this body, so the keys can only ever be saved
// against the store the merchant actually chose.

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    user_id?: string;
    consumer_key?: string;
    consumer_secret?: string;
    key_permissions?: string;
  } | null;

  const state = verifyStoreState(body?.user_id, "woocommerce");
  if (!state) return Response.json({ message: "This connection link has expired. Start again from Elpino." }, { status: 400 });
  if (!body?.consumer_key?.startsWith("ck_") || !body.consumer_secret?.startsWith("cs_")) {
    return Response.json({ message: "No keys were provided." }, { status: 400 });
  }

  // workspace-service checks the keys against the store before keeping them.
  const saved = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/integrations/apikey", {
    companyId: state.companyId,
    provider: "woocommerce",
    credentials: { siteUrl: state.store, consumerKey: body.consumer_key, consumerSecret: body.consumer_secret },
  });
  if (saved.error) return Response.json({ message: saved.error }, { status: 400 });
  return Response.json({ ok: true });
}
