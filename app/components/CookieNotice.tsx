"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "./Analytics";

const STORAGE_KEY = COOKIE_CONSENT_KEY;

/**
 * Real opt-in consent gate, not just a notice: the essential auth-session
 * cookie is GDPR/ePrivacy-exempt and always set, but Google Analytics and
 * Microsoft Clarity (see Analytics.tsx) load only after "Accept all". The
 * stored choice is broadcast via COOKIE_CONSENT_EVENT so analytics start or
 * stay off in the same session without a reload.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable (private browsing etc.) — skip rather than nag every load.
    }
  }, []);

  function dismiss(choice: "accepted" | "rejected") {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Non-fatal — worst case it reappears next visit.
    }
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 w-full bg-white p-5 text-left shadow-[0_-8px_30px_-15px_rgba(15,23,42,0.25)] sm:p-6"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div>
          <h2 className="text-lg font-normal text-slate-950">Cookies</h2>
          <p className="mt-2 text-base leading-7 text-slate-600">
            We use one essential cookie to keep you signed in, plus optional analytics (Google
            Analytics, Microsoft Clarity) to improve Elpino — those only run if you accept. See our{" "}
            <Link href="/privacy" className="text-slate-900 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => dismiss("rejected")}
            className="inline-flex h-11 items-center justify-center border border-slate-300 px-4 text-base font-normal text-slate-950 transition hover:bg-slate-100 sm:px-5"
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={() => dismiss("accepted")}
            className="inline-flex h-11 items-center justify-center bg-slate-950 px-4 text-base font-normal text-white transition hover:bg-slate-800 sm:px-5"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
