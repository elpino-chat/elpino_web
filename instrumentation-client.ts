// Inert until NEXT_PUBLIC_SENTRY_DSN is set — every deploy can ship this
// unconditionally. Uses NEXT_PUBLIC_ (not SENTRY_DSN) because this file runs
// in the browser; DSNs are meant to be public (they're write-only tokens).
import * as Sentry from "@sentry/browser";
import posthog from "posthog-js";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!posthogToken || !posthogHost) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = posthogToken
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
    // A warning, not a throw: an uncaught error here aborts this whole module
    // and pops Next's dev error overlay over the page, and local dev has no
    // PostHog project to point at.
    console.warn(
      `${missingVariable} is not set, so PostHog analytics are off. Set it in .env.local to enable them.`,
    );
  }
} else {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  });

  window.addEventListener("error", (event) => {
    Sentry.captureException(event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    Sentry.captureException(event.reason);
  });
}
