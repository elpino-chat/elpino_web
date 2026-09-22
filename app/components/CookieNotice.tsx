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
      className="fixed inset-x-0 bottom-0 z-50 w-full bg-white px-32 py-6 text-left shadow-[0_-8px_30px_-15px_rgba(15,23,42,0.25)] border-t border-slate-100"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="flex w-full flex-col gap-5">
        <p className="text-[15px] leading-relaxed text-slate-700">
          We use cookies to run our website, analyze your use of our services, manage your online preferences & personalize ad content. By accepting our cookies, you&apos;ll get relevant content and social media features, personalized ads, and an enhanced browsing experience. To manage your choices, click &quot;Cookie Settings.&quot; Necessary cookies are required for the core website functionality and cannot be rejected. For more information, see our{" "}
          <Link href="/privacy#cookies-analytics" className="text-blue-600 hover:underline">
            Cookie Policy.
          </Link>
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => dismiss("accepted")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#111310] px-6 text-base font-normal text-white transition hover:bg-black"
          >
            Allow all cookies
          </button>
          <button
            type="button"
            onClick={() => dismiss("rejected")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-base font-normal text-slate-900 transition hover:bg-slate-50"
          >
            Deny all
          </button>
          <Link
            href="/privacy#cookies-analytics"
            className="text-base font-normal text-slate-900 underline underline-offset-4 hover:text-slate-600"
          >
            Cookie settings
          </Link>
        </div>
      </div>
    </div>
  );
}
