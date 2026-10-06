import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { verifyAuthToken } from "@/app/api/auth/_lib/auth-store";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, normalizeReferralCode } from "@/app/lib/referral";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname === "/onboarding" || pathname.startsWith("/connect")) {
    const token = request.cookies.get("auth_token")?.value;
    const session = token ? verifyAuthToken(token) : null;

    if (!session?.email) {
      const loginUrl = new URL("/login", request.url);
      // Keep the query string too (e.g. /connect/wordpress?return_url=...):
      // dropping it here would strip the WordPress plugin's return_url and
      // site_url before the visitor ever reaches the connect page.
      loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // The domain sits behind Cloudflare, which stamps every proxied request
  // with a CF-IPCountry header (the visitor's country, from their IP — not
  // stored server-side, just relayed, so no consent banner needed for this
  // alone). We hand that country to the browser as a short-lived, JS-readable
  // cookie so GeoLanguagePrompt can offer to switch the site language on
  // first visit, without an extra round trip to read the request headers.
  const country = request.headers.get("cf-ipcountry");
  const response = NextResponse.next();
  if (country && country !== "XX" && country !== "T1") {
    // XX/T1 are Cloudflare's "unknown" and "Tor" placeholders — nothing to act on.
    response.cookies.set("elpino-geo-country", country, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }

  // A partner's referral link (any page with ?ref=<code>). Every visit through it is counted; the code is
  // remembered for 60 days so a signup days later still counts, and the first partner to bring a visitor keeps
  // them. The click is recorded in the background so the page is never held up by it.
  const ref = normalizeReferralCode(request.nextUrl.searchParams.get("ref"));
  if (ref) {
    if (!request.cookies.get(REFERRAL_COOKIE)?.value) {
      response.cookies.set(REFERRAL_COOKIE, ref, { path: "/", maxAge: REFERRAL_COOKIE_MAX_AGE, sameSite: "lax", httpOnly: true, secure: request.nextUrl.protocol === "https:" });
    }
    let referrerHost: string | null = null;
    try { referrerHost = new URL(request.headers.get("referer") ?? "").hostname || null; } catch { /* No or bad referrer. */ }
    // The partner's own tag for where they shared the link (?c=whatsapp), or a standard utm_campaign.
    const campaign = request.nextUrl.searchParams.get("c") ?? request.nextUrl.searchParams.get("utm_campaign");
    event.waitUntil(callGateway("/api/workspace/referrals/click", { code: ref, landingPath: pathname, referrerHost, campaign, country }).catch(() => undefined));
  }
  return response;
}

export const config = {
  // Broad enough to cover both the dashboard auth check and the geo cookie
  // on every real page — skip static assets, Next internals and API routes.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
