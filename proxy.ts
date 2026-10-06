import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { verifyAuthToken } from "@/app/api/auth/_lib/auth-store";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, REFERRAL_CREDITED_COOKIE, REFERRAL_SEEN_COOKIE, normalizeReferralCode } from "@/app/lib/referral";
import { creditReferral } from "@/app/lib/credit-referral";

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

  // A visitor who came through a partner's link is credited again the first time they reach the dashboard, so the
  // referral is never lost if onboarding was skipped or done differently. Once a day at most, in the background.
  const referralCode = request.cookies.get(REFERRAL_COOKIE)?.value;
  // In-app navigations count (onboarding opens the dashboard that way); background prefetches don't.
  const creditDue = pathname.startsWith("/dashboard") && referralCode && !request.cookies.get(REFERRAL_CREDITED_COOKIE)
    && !request.headers.get("next-router-prefetch");
  const dashboardSession = creditDue ? verifyAuthToken(request.cookies.get("auth_token")?.value ?? "") : null;
  if (dashboardSession?.email) event.waitUntil(creditReferral(dashboardSession.email, referralCode));

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

  // A partner's referral link (any page with ?ref=<code>). The code is remembered for 60 days so a signup days
  // later still counts, and the first partner to bring a visitor keeps them. A visit is counted once per person
  // per half hour, and only for a real page load: the router's background fetches of the same address
  // (prefetches and RSC requests) carry ?ref= too and would otherwise count one visit several times. The click
  // is recorded in the background so the page is never held up by it.
  const ref = normalizeReferralCode(request.nextUrl.searchParams.get("ref"));
  if (ref) {
    const secure = request.nextUrl.protocol === "https:";
    if (!request.cookies.get(REFERRAL_COOKIE)?.value) {
      response.cookies.set(REFERRAL_COOKIE, ref, { path: "/", maxAge: REFERRAL_COOKIE_MAX_AGE, sameSite: "lax", httpOnly: true, secure });
    }
    const fetchDest = request.headers.get("sec-fetch-dest");
    const pageLoad = fetchDest ? fetchDest === "document" : !request.headers.get("rsc") && !request.headers.get("next-router-prefetch") && !request.nextUrl.searchParams.has("_rsc");
    const alreadyCounted = request.cookies.get(REFERRAL_SEEN_COOKIE)?.value === ref;
    if (pageLoad && !alreadyCounted) {
      response.cookies.set(REFERRAL_SEEN_COOKIE, ref, { path: "/", maxAge: 30 * 60, sameSite: "lax", httpOnly: true, secure });
      let referrerHost: string | null = null;
      try { referrerHost = new URL(request.headers.get("referer") ?? "").hostname || null; } catch { /* No or bad referrer. */ }
      // The partner's own tag for where they shared the link (?c=whatsapp), or a standard utm_campaign.
      const campaign = request.nextUrl.searchParams.get("c") ?? request.nextUrl.searchParams.get("utm_campaign");
      event.waitUntil(callGateway("/api/workspace/referrals/click", { code: ref, landingPath: pathname, referrerHost, campaign, country }).catch(() => undefined));
    }
  }
  if (dashboardSession?.email) {
    response.cookies.set(REFERRAL_CREDITED_COOKIE, "1", { path: "/", maxAge: 24 * 60 * 60, sameSite: "lax", httpOnly: true, secure: request.nextUrl.protocol === "https:" });
  }
  return response;
}

export const config = {
  // Broad enough to cover both the dashboard auth check and the geo cookie
  // on every real page — skip static assets, Next internals and API routes.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
