import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// Shared by the one-click Shopify and WooCommerce connect flows. Both bounce
// the browser (or, for WooCommerce, the store's own server) off a third party
// and need to know on the way back which workspace started it, without a
// session cookie to lean on — so that identity travels in a short-lived,
// HMAC-signed token, same signing secret as the auth cookie.

export const STORE_CONNECT_TTL_SECONDS = 30 * 60;

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat").replace(/\/+$/, "");
}

function secret(): string {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("AUTH_JWT_SECRET is missing");
  return value;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(`store-connect.${body}`).digest("base64url");
}

export type StoreConnectState = {
  /** Which flow minted this, so a Shopify token can't be replayed against the WooCommerce callback. */
  kind: "shopify" | "woocommerce";
  companyId: string;
  /** The store this token is for: a myshopify.com host, or a WooCommerce site origin. */
  store: string;
  /** Random per-attempt value, also kept in a cookie for the browser-bound Shopify flow. */
  nonce: string;
};

export function signStoreState(state: Omit<StoreConnectState, "nonce"> & { nonce?: string }): { token: string; nonce: string } {
  const nonce = state.nonce ?? randomBytes(16).toString("hex");
  const payload = { ...state, nonce, exp: Math.floor(Date.now() / 1000) + STORE_CONNECT_TTL_SECONDS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body)}`, nonce };
}

export function verifyStoreState(token: string | null | undefined, kind: StoreConnectState["kind"]): StoreConnectState | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as StoreConnectState & { exp?: number };
    if (payload.kind !== kind || !payload.companyId || !payload.store || !payload.nonce) return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { kind: payload.kind, companyId: payload.companyId, store: payload.store, nonce: payload.nonce };
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Accepts "my-store", "my-store.myshopify.com" or a pasted admin URL; returns the canonical host or null. */
export function normalizeShopDomain(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/?#].*$/, "");
  if (!raw) return null;
  const host = raw.includes(".") ? raw : `${raw}.myshopify.com`;
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(host) ? host : null;
}

/**
 * Returns the site's origin, or null when it isn't a public https address.
 * WooCommerce refuses to post keys to (or from) anything else in production,
 * and a plain-http store would send its consumer secret in the clear.
 */
export function normalizeStoreOrigin(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(local && process.env.NODE_ENV === "development")) return null;
    if (!url.hostname.includes(".") && !local) return null;
    // Keep a subdirectory install (https://example.com/shop) — wc-auth lives under the site's own path.
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

// read_orders/write_orders power the AI's order lookups and cancellations.
// read_all_orders lifts Shopify's 60-day window (needs the app approved for it).
export const SHOPIFY_SCOPES = "read_orders,write_orders,read_all_orders";
export const SHOPIFY_STATE_COOKIE = "elpino_shopify_state";

/** Shopify signs every redirect it sends: HMAC-SHA256 (hex) of the sorted query string, minus hmac itself. */
export function validShopifySignature(params: URLSearchParams, clientSecret: string): boolean {
  const hmac = params.get("hmac");
  if (!hmac) return false;
  const message = [...params.entries()]
    .filter(([key]) => key !== "hmac")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return safeEqual(createHmac("sha256", clientSecret).update(message).digest("hex"), hmac);
}
