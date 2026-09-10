import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/onboarding",
          "/login",
          "/signup",
          "/api/",
          // Embeddable chat fragment — duplicate content with no
          // standalone search value; see the X-Robots-Tag rule in
          // next.config.ts for the matching HTTP-header enforcement.
          "/widget",
          // Single-use tokenised links. Kept out of the crawl entirely
          // rather than relying only on the page-level noindex, so a
          // well-behaved crawler never even fetches one.
          "/invite/",
          "/secure/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
