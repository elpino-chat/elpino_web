import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/app/api/auth/_lib/auth-store";

export async function proxy(request: NextRequest) {
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
  return response;
}

export const config = {
  // Broad enough to cover both the dashboard auth check and the geo cookie
  // on every real page — skip static assets, Next internals and API routes.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
