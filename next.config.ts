import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const isProductionBuild = process.env.NODE_ENV === "production";

// The frontend host does not inject runtime environment variables. Keep these
// public production identifiers deterministic at build time so a developer
// .env file can never send production users back to localhost.
const productionFrontend = {
  siteUrl: "https://elpino.chat",
  gatewayUrl: "https://api.elpino.chat",
  googleClientId:
    "927489744703-ipmeciigf234kkceflkatb0o6pg55tlu.apps.googleusercontent.com",
  googleCallbackUrl: "https://elpino.chat/api/auth/google/callback",
  linkedInClientId: "86doutttnd7s6s",
  linkedInCallbackUrl:
    "https://elpino.chat/api/auth/oauth/linkedin/callback",
} as const;

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(webDir, ".."),
  // Elpino used to be pitched as an internal-automation "operator" (Gmail
  // triage, calendar briefings, approval-based workflows). The product is an
  // AI customer support platform — chat widget, knowledge base, human
  // handoff, seat + resolution pricing — and these pages describe a product
  // that no longer exists here. Permanent redirects rather than deleting the
  // routes outright: any external link or old bookmark still lands somewhere
  // real instead of a 404, and any indexed-page authority they hold carries
  // forward instead of evaporating.
  async redirects() {
    return [
      { source: '/agent', destination: '/', permanent: true },
      { source: '/product/ai-operator', destination: '/', permanent: true },
      { source: '/product/email-triage', destination: '/features', permanent: true },
      { source: '/product/approvals', destination: '/features', permanent: true },
      { source: '/solutions/founders', destination: '/pricing', permanent: true },
      { source: '/solutions/revenue-teams', destination: '/pricing', permanent: true },
      { source: '/solutions/busy-operators', destination: '/pricing', permanent: true },
    ];
  },
  // Fallbacks for deploys where env vars aren't configured. Real env vars
  // always take precedence. WARNING: this includes secrets baked into a
  // private repo at the owner's request. If the repo ever goes public,
  // rotate AUTH_*, RESEND_API_KEY, and TELEGRAM_BOT_TOKEN. AUTH_* values
  // must match the gateway env on the production VM.
  env: {
    NEXT_PUBLIC_SITE_URL:
      isProductionBuild
        ? productionFrontend.siteUrl
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    AUTH_INTERNAL_SECRET:
      process.env.AUTH_INTERNAL_SECRET ??
      "Y78vEBQB8cNNqM6bSnv7w0GfSp6qomcAoNdJdY6o2/6fddxea1ZM8Q1cjcsb4eao",
    AUTH_JWT_SECRET:
      process.env.AUTH_JWT_SECRET ??
      "2CAK52uRNuzrSxFrdRNRZexpB5Qqc/go44RNbF7CrvjKFoXAkmk24QueAv1p9G35",
    RESEND_API_KEY:
      process.env.RESEND_API_KEY ?? "re_4KAytbCy_JqR3Nt5tBDfTg9cHikDRz6Uj",
    TELEGRAM_BOT_TOKEN:
      process.env.TELEGRAM_BOT_TOKEN ??
      "8094927949:AAHaYrvy7bpMNUAFHhTvhPd0Jj8i-HUiq_4",
    RESEND_FROM: process.env.RESEND_FROM ?? "Elpino <noreply@elpino.chat>",
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME ?? "tryelpinobot",
    GOOGLE_CLIENT_ID:
      isProductionBuild
        ? productionFrontend.googleClientId
        : process.env.GOOGLE_CLIENT_ID ?? productionFrontend.googleClientId,
    GOOGLE_LOGIN_REDIRECT_URI:
      isProductionBuild
        ? productionFrontend.googleCallbackUrl
        : process.env.GOOGLE_LOGIN_REDIRECT_URI ??
          "http://localhost:3000/api/auth/google/callback",
    LINKEDIN_CLIENT_ID: isProductionBuild
      ? productionFrontend.linkedInClientId
      : process.env.LINKEDIN_CLIENT_ID ?? productionFrontend.linkedInClientId,
    LINKEDIN_REDIRECT_URI:
      isProductionBuild
        ? productionFrontend.linkedInCallbackUrl
        : process.env.LINKEDIN_REDIRECT_URI ??
          "http://localhost:3000/api/auth/oauth/linkedin/callback",
    LINKEDIN_SCOPES:
      process.env.LINKEDIN_SCOPES ?? "openid profile email",
    NEXT_PUBLIC_GATEWAY_URL:
      isProductionBuild
        ? productionFrontend.gatewayUrl
        : process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
      "BBOVlHAJfin3t1acBGcbqeXh5WKzk3mxsMO7cU0b1dj_MZbwdLLHzz8Yj1rV6G4hIZVt6GYfQan9VYFxNoDbYgQ",
    WEB_APP_URL: isProductionBuild
      ? productionFrontend.siteUrl
      : process.env.WEB_APP_URL ?? "http://localhost:3000",
    // Analytics IDs (public, non-secret). Empty string = that script never loads.
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "",
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
      "phc_DoFLAZjbWRsMXeS7jTFG6WJMdXyMuHirDQwrjXXF8PFw",
    NEXT_PUBLIC_POSTHOG_HOST:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'api.elpino.chat',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/images/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Every page except /widget gets clickjacking protection. /widget is
        // deliberately embeddable — it's the chat panel the tag.js loader
        // puts in an iframe on third-party sites, so it can't send DENY (or
        // even SAMEORIGIN) without breaking the one thing it exists to do.
        source: "/((?!widget).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/widget",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "microphone=*" },
        ],
      },
      {
        // cache static assets aggressively
        source: "/(.*)\\.(ico|png|svg|webp|jpg|jpeg|woff2|woff|ttf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // no-index auth/app pages. /invite and /secure carry single-use
        // tokens in the URL — a search engine indexing one of those isn't
        // just wasted crawl budget, it's a private-content leak risk if the
        // link is ever discovered (a shared screenshot, a browser history
        // sync, a referrer header) before it's spent. The page itself also
        // sets a matching `robots` meta export as defense in depth (see
        // app/invite/[token]/page.tsx, app/secure/[token]/page.tsx), but the
        // HTTP header covers crawlers that don't render JS/meta tags and
        // pairs with the disallow rules in app/robots.ts.
        source: "/(login|signup|dashboard|onboarding|invite|secure)(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // /widget is the embeddable chat panel — the same fragment gets
        // iframed on every customer's site, so indexing it directly would be
        // pure duplicate content with no standalone search value. It's a
        // client component (see app/widget/page.tsx), which can't export a
        // `metadata` object, so the header here is the only lever; a thin
        // app/widget/layout.tsx also sets it for anything that does read the
        // rendered <head>.
        source: "/widget",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
