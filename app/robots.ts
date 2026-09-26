import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only non-HTML endpoints are disallowed. Private pages (/login,
        // /signup, /dashboard, /onboarding, /widget, /invite/, /secure/)
        // are kept out of the index by the X-Robots-Tag: noindex header in
        // next.config.ts. They must stay crawlable: a page blocked here is
        // never fetched, so Google can't see the noindex and reports
        // "Indexed, though blocked by robots.txt" for any URL it finds a
        // link to.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
