import { Suspense } from "react";
import type { Metadata } from "next";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { WordpressConnectClient } from "./WordpressConnectClient";

export const metadata: Metadata = {
  title: "Connect WordPress · Elpino",
  robots: { index: false, follow: false },
};

// Landed on from the "Elpino Chat" WordPress plugin's admin page
// (plugins/wordpress/elpino-chat.php), with ?return_url=<wp-admin URL> and,
// optionally, ?site_url=<the WordPress site's own home_url()>. proxy.ts
// already requires a signed-in session for everything under /connect, so
// by the time this renders there is always a real workspace on the other
// end — this page's only job is picking (or creating) the site to link and
// handing its public key back to WordPress.
export default async function ConnectWordpressPage() {
  // Read here (server-side, same as onboarding/page.tsx) rather than
  // fetched client-side, so the header's account menu doesn't pop in a
  // moment after the rest of the page. proxy.ts guarantees this is never
  // null by the time we get here.
  const session = await requireSession();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fffefe] p-6">
          <div className="text-sm font-medium text-black/40">Loading…</div>
        </div>
      }
    >
      <WordpressConnectClient session={session} />
    </Suspense>
  );
}
