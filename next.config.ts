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
    const to = (destination: string, ...sources: string[]) => sources.map((source) => ({ source, destination, permanent: true }));
    return [
      ...to('/', '/agent'),
      // Legacy product pages -> the page that now covers the topic.
      ...to('/product/ai-agent', '/product/ai-operator', '/product/copilot'),
      ...to('/product/inbox', '/product/email-triage', '/product/approvals'),
      ...to('/features', '/product/channels', '/product/outbound', '/product/reporting'),
      // Legacy solution pages.
      ...to('/solutions/founders', '/solutions/founders-team'),
      ...to('/solutions/busy-operators', '/solutions/busy', '/solutions/triage'),
      ...to('/solutions/developers', '/solutions/saas', '/solutions/saas-software'),
      ...to('/solutions/busy-operators', '/solutions/agencies', '/solutions/agencies-services'),
      ...to('/features', '/solutions/revenue', '/solutions/revenue-teams'),
      ...to('/product/knowledge-hub', '/solutions/self-service'),
      ...to('/product/ai-agent', '/solutions/workflows'),
      ...to('/product/inbox', '/solutions/visitor-intelligence', '/solutions/teammate-handoff', '/solutions/omnichannel-triage', '/solutions/omnichannel'),
    ];
  },
  // Fallbacks for deploys where env vars aren't configured. Real env vars
  // always take precedence. WARNING: this includes secrets baked into a
  // private repo at the owner's request. If the repo ever goes public,
  // rotate AUTH_*, RESEND_API_KEY, TELEGRAM_BOT_TOKEN and ELPINO_WIDGET_IDENTITY_SECRET. AUTH_* values
  // must match the gateway env on the production VM.
  env: {
    NEXT_PUBLIC_SITE_URL:
      isProductionBuild
        ? productionFrontend.siteUrl
        : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    AUTH_INTERNAL_SECRET:
      process.env.AUTH_INTERNAL_SECRET ??
      "53fe6175f780eb04b00378e6843fcdc28a598a7a13c1f4cb9deb60c932ca2b9f",
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
    // Signs the chat widget identity token for logged-in visitors on
    // elpino.chat (app/api/widget-identity). Must equal the identity secret of
    // Elpino own workspace: rotating it there means updating it here.
    ELPINO_WIDGET_IDENTITY_SECRET:
      process.env.ELPINO_WIDGET_IDENTITY_SECRET ?? "elid_A8bprFkI-T-bTitrd_xnFFkv8xUs42hEkzO4i6kNUew",
    // Google sign-in now runs through Firebase (see lib/firebase-client.ts):
    // the popup completes entirely client-side, so this is public web config,
    // not a secret, and the same project serves both dev and prod for now.
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyB04rlClS7Rgn1XJsSkOimJxKO7bREkJDQ",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "elpinoo.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "elpinoo",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "elpinoo.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "864091659433",
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:864091659433:web:c7e9b4ddc6815b85fb5db8",
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
