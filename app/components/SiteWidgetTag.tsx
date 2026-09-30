"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    ElpinoSettings?: { getIdentityToken?: () => Promise<string | null> };
    // Set by tag.js once it loads. Sign-out calls logout() so the open chat
    // doesn't stay attached to the previous user on a shared computer.
    ElpinoTag?: { logout?: () => void; identify?: (options: { token: string }) => void };
  }
}

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
// Every other route, including auth and onboarding pages, can show it.
const EXCLUDED_PREFIXES = [
  "/dashboard",
  "/widget",
];

// Same origin as tag.js/route.ts's own dev/prod split: in local dev, load the
// tag from this app itself (/tag.js) so dogfooding actually exercises
// whatever's running locally instead of production's cdn.elpino.chat.
const TAG_SRC = process.env.NODE_ENV === "development" ? "/tag.js" : "https://cdn.elpino.chat/tag.js";

// Production's site key is only valid for elpino.chat. Local dev uses its own,
// registered for localhost by scripts/seed-dev-widget.sh.
const SITE_KEY =
  process.env.NODE_ENV === "development"
    ? (process.env.NEXT_PUBLIC_WIDGET_SITE_KEY ?? "rz_site_devlocalhost00000000000000")
    : "rz_site_22006bb0f7f000862ef24b9f240420";

// Lets the widget recognise a logged-in visitor so the AI can look up their
// account without asking who they are. tag.js reads ElpinoSettings once when
// it loads and calls getIdentityToken whenever the chat asks, so this has to
// exist before the script runs. A logged-out visitor gets null.
function installIdentityProvider() {
  if (typeof window === "undefined" || window.ElpinoSettings?.getIdentityToken) return;
  window.ElpinoSettings = {
    ...window.ElpinoSettings,
    getIdentityToken: () =>
      fetch("/api/widget-identity", { credentials: "same-origin", cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { token?: string | null } | null) => data?.token ?? null)
        .catch(() => null),
  };
}

export function SiteWidgetTag() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (excluded) return null;

  installIdentityProvider();

  return (
    <Script
      src={TAG_SRC}
      data-site-key={SITE_KEY}
      strategy="afterInteractive"
    />
  );
}
