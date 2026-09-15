"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Elpino's own chat widget, dogfooding the product on elpino.chat's public
// marketing pages — home, pricing, features, blog, and so on.
//
// Deliberately NOT everywhere: this used to sit unconditionally in the root
// layout, which put Elpino's marketing chat bubble on top of two places it
// never belonged —
//   - /dashboard: the authenticated app. A signed-in customer using their
//     own inbox does not need Elpino's support widget floating over it.
//   - /widget: this app's OWN widget iframe content. Rendered as a full
//     page (as it is when testing it directly, or if it were ever loaded
//     outside an iframe), the site-wide script would inject a second,
//     real launcher on top of the very iframe content it's meant to be
//     embedded inside — a widget on top of a widget.
// Auth pages (login/signup/onboarding/etc.) are excluded too: a focused
// sign-up flow is not where a chat bubble popping up helps.
const EXCLUDED_PREFIXES = [
  "/dashboard",
  "/widget",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/invite",
  "/onboarding",
];

export function SiteWidgetTag() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (excluded) return null;

  return (
    <Script
      src="https://cdn.elpino.chat/tag.js"
      data-site-key="rz_site_a9ea653bc866c86f5e88c7af4c832b"
      strategy="afterInteractive"
    />
  );
}
