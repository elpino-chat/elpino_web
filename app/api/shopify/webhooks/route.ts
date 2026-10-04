import { createHmac } from "crypto";
import { safeEqual } from "@/lib/store-connect";

// Shopify's mandatory compliance webhooks (customers/data_request,
// customers/redact, shop/redact), required for any app listed in the App Store.
// Elpino keeps no copy of a store's customers: orders are read live from
// Shopify on demand and never stored, so there is nothing of Shopify's to
// export or erase. We still verify the signature and answer 200 so Shopify
// records the endpoint as live; a bad signature is the one case that gets a 401.
// Subscribed to in integrations/shopify/shopify.app.toml.

export async function POST(request: Request) {
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientSecret) return Response.json({ message: "Not configured" }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const expected = createHmac("sha256", clientSecret).update(rawBody).digest("base64");
  if (!signature || !safeEqual(expected, signature)) return Response.json({ message: "Invalid signature" }, { status: 401 });

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const shop = request.headers.get("x-shopify-shop-domain") ?? "unknown";
  console.info(`[shopify-webhook] ${topic} for ${shop}`);
  return Response.json({ ok: true });
}
