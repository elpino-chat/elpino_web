"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Shown when a click on an internal link starts a navigation that takes a
// moment (slow network, cold route compile). Next's App Router exposes no
// "navigation started" event, so we listen for link clicks and clear the
// state when the pathname actually changes.
//
// Programmatic navigations (router.push) can opt in by dispatching
// window.dispatchEvent(new CustomEvent("elpino:navigate-start", { detail: { href: "/dashboard" } })).

const SHOW_DELAY_MS = 150; // fast navigations never flash the loader
const GIVE_UP_MS = 12000; // click that never led to a route change
const SLOTH_W = 56;

const LABELS: Record<string, string> = {
  "/": "Home",
  "/login": "Login",
  "/signup": "Sign up",
  "/pricing": "Pricing",
  "/dashboard": "your dashboard",
  "/contact": "Contact",
  "/docs": "the docs",
  "/blog": "the blog",
  "/faq": "FAQ",
};

function labelFor(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname];
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  const words = decodeURIComponent(last).replace(/[-_]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "the next page";
}

/** Call just before a programmatic navigation (router.push after login) so the loader shows for it too. */
export function announceNavigation(href: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("elpino:navigate-start", { detail: { href } }));
}

type Phase = "idle" | "active" | "done";

export function NavigationLoader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const pathRef = useRef(pathname);
  const timers = useRef<number[]>([]);
  const ticker = useRef<number | null>(null);
  const pending = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (ticker.current) window.clearInterval(ticker.current);
    ticker.current = null;
  };

  const start = (href: string) => {
    let target: URL;
    try {
      target = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (target.origin !== window.location.origin) return;
    if (target.pathname === pathRef.current) return;

    clearTimers();
    pending.current = true;
    setLabel(labelFor(target.pathname));

    timers.current.push(
      window.setTimeout(() => {
        if (!pending.current) return;
        setProgress(6);
        setPhase("active");
        // Ease toward 90% and wait there — we can't know how long it takes.
        ticker.current = window.setInterval(() => {
          setProgress((p) => p + (90 - p) * 0.05);
        }, 120);
      }, SHOW_DELAY_MS),
      window.setTimeout(() => {
        pending.current = false;
        clearTimers();
        setPhase("idle");
      }, GIVE_UP_MS),
    );
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
      start(href);
    };
    const onCustom = (e: Event) => {
      const href = (e as CustomEvent<{ href?: string }>).detail?.href;
      if (href) start(href);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("elpino:navigate-start", onCustom);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("elpino:navigate-start", onCustom);
      clearTimers();
    };
  }, []);

  // Route changed: the sloth has arrived.
  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    const wasShowing = ticker.current !== null;
    pending.current = false;
    clearTimers();
    if (!wasShowing) {
      setPhase("idle");
      return;
    }
    setProgress(100);
    setPhase("done");
    timers.current.push(window.setTimeout(() => setPhase("idle"), 550));
  }, [pathname]);

  if (phase === "idle") return null;

  const arrived = phase === "done";
  const left = `calc(${progress}% - ${(progress / 100) * SLOTH_W}px)`;

  return (
    <>
    {/* Softly blurs the page while the next one loads. Clicks pass through, so
        a slow page never traps the visitor behind it. */}
    <div aria-hidden="true" className={`elpino-nav-blur ${arrived ? "elpino-nav-blur--out" : ""}`} />
    <div
      role="status"
      aria-live="polite"
      className={`elpino-nav-loader ${arrived ? "elpino-nav-loader--out" : ""}`}
    >
      <div className="elpino-nav-track">
        <div className="elpino-nav-sloth" style={{ left }} aria-hidden="true">
          <svg viewBox="0 0 64 52" width={SLOTH_W} height={(SLOTH_W * 52) / 64} fill="none">
            {/* far-side limbs */}
            <g className="elpino-limb elpino-limb--b" style={{ transformOrigin: "20px 34px" }}>
              <path d="M20 34 L18 47" stroke="#5c4a34" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M15 48 l3 -1 M18 48 l3 -1" stroke="#233d4d" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            <g className="elpino-limb elpino-limb--a" style={{ transformOrigin: "40px 34px" }}>
              <path d="M40 34 L42 47" stroke="#5c4a34" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M39 48 l3 -1 M42 48 l3 -1" stroke="#233d4d" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            {/* body */}
            <ellipse cx="30" cy="28" rx="19" ry="11.5" fill="#8b7355" />
            <ellipse cx="28" cy="31" rx="11" ry="6" fill="#a58c6a" />
            {/* head */}
            <circle cx="50" cy="22" r="10" fill="#eadfc8" />
            <path
              d="M43.5 19.5c2.5-1.2 5-.6 6.6 1.6-1 3.2-4.6 4.6-7.4 2.6-.9-1.1-.9-2.9.8-4.2z"
              fill="#4a3b2a"
              transform="translate(1.5 -.5)"
            />
            <path
              d="M51.2 20.5c2.6-1.4 5.2-.6 6.4 1.6-.6 3-4 4.2-6.6 2.4-.9-1-.9-2.6.2-4z"
              fill="#4a3b2a"
            />
            <circle cx="47.4" cy="22.2" r="1.3" fill="#fff" />
            <circle cx="54.6" cy="22.6" r="1.3" fill="#fff" />
            <ellipse cx="59" cy="24.6" rx="1.8" ry="1.3" fill="#233d4d" />
            <path d="M52 27.6c1.4.9 3 .9 4.2 0" stroke="#4a3b2a" strokeWidth="1.2" strokeLinecap="round" />
            {/* near-side limbs */}
            <g className="elpino-limb elpino-limb--a" style={{ transformOrigin: "14px 33px" }}>
              <path d="M14 33 L12 47" stroke="#6b563c" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M9 48 l3 -1 M12 48 l3 -1" stroke="#233d4d" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            <g className="elpino-limb elpino-limb--b" style={{ transformOrigin: "34px 34px" }}>
              <path d="M34 34 L36 47" stroke="#6b563c" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M33 48 l3 -1 M36 48 l3 -1" stroke="#233d4d" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>

      <span className="sr-only">{arrived ? "Page loaded" : `Loading ${label}`}</span>
    </div>
    </>
  );
}
