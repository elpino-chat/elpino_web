import { headers } from "next/headers";
import { callGateway } from "./gateway";
import { signAuthToken } from "./auth-store";

type Identity = { email: string; name?: string; tokenVersion?: number };

const PRIVATE_IP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i;

function clientIp(h: Headers): string | undefined {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || undefined;
}

/**
 * Best-effort "City, Country". Uses the geo headers a CDN/proxy already adds
 * (Cloudflare, Vercel). Otherwise, only if GEOIP_LOOKUP_URL is set (a URL with
 * {ip} in it, returning JSON with city/region/country), asks that service —
 * off by default so login IPs aren't sent to a third party unless you opt in.
 */
async function resolveLocation(h: Headers, ip?: string): Promise<string | undefined> {
  const city = h.get("cf-ipcity") || h.get("x-vercel-ip-city");
  const country = h.get("cf-ipcountry") || h.get("x-vercel-ip-country");
  const fromHeaders = [city && decodeURIComponent(city), country && country !== "XX" ? country : null].filter(Boolean).join(", ");
  if (fromHeaders) return fromHeaders;

  if (ip && PRIVATE_IP.test(ip)) return "Local network";

  const template = process.env.GEOIP_LOOKUP_URL;
  if (!template || !ip) return undefined;
  try {
    const res = await fetch(template.replace("{ip}", encodeURIComponent(ip)), { signal: AbortSignal.timeout(1500), cache: "no-store" });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { city?: string; region?: string; country?: string; country_name?: string };
    return [data.city, data.region, data.country_name ?? data.country].filter(Boolean).join(", ") || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Records this sign-in as a device session and returns the auth token that
 * carries its id. If the session can't be recorded the token is still issued
 * (without a sid) — a hiccup in device tracking must never block a login.
 */
export async function startSession(identity: Identity): Promise<string> {
  let sid: string | undefined;
  try {
    const h = await headers();
    const ip = clientIp(h);
    const location = await resolveLocation(h, ip);
    const created = await callGateway<{ sessionId?: string }>("/api/auth/sessions", {
      email: identity.email,
      userAgent: h.get("user-agent") ?? undefined,
      ipAddress: ip,
      location,
    });
    sid = created.sessionId;
  } catch {
    sid = undefined;
  }
  return signAuthToken({ ...identity, sid });
}
