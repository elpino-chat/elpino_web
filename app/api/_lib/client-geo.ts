// Best-effort IP + geo — read from whatever edge/CDN in front of this app
// already resolved for the incoming request, no external lookup call. Every
// header is optional; a deployment without any of them just stores nulls, and
// locally everything here is null.
//
// Cloudflare is checked first since that's this app's actual CDN — CF-*
// headers only appear on proxied requests, and CF-IPCity/CF-Region need
// "Add visitor location headers" (Rules → Managed Transforms) turned on in
// the Cloudflare dashboard, otherwise only country comes through.

export type ClientLocation = {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
};

export function clientIp(request: Request): string | null {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  // x-forwarded-for is a chain; the client is the first entry, the rest are
  // proxies. Anything after the first is not the visitor.
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function clientGeo(request: Request) {
  const country = request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country");
  const region = decodeHeader(request.headers.get("cf-region")) ?? request.headers.get("x-vercel-ip-country-region");
  const city = decodeHeader(request.headers.get("cf-ipcity")) ?? decodeHeader(request.headers.get("x-vercel-ip-city"));
  return { country, region, city };
}

/** Everything the widget records about where a visitor reached us from. */
export function clientLocation(request: Request): ClientLocation {
  const geo = clientGeo(request);
  return {
    ip: clientIp(request),
    country: geo.country,
    region: geo.region,
    city: geo.city,
    userAgent: request.headers.get("user-agent"),
  };
}
