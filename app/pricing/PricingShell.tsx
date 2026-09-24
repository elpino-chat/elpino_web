"use client";

import { useEffect, useState } from "react";
import { PricingClient } from "./PricingClient";

// The pricing page itself is static (good for search engines and speed). A
// signed-in visitor is detected in the browser so plan buttons can act on their
// existing workspace instead of sending them back through sign-up.
export function PricingShell() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => { if (!cancelled && r.ok) setLoggedIn(true); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  return <PricingClient loggedIn={loggedIn} />;
}
