"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Site-wide scroll motion, layered on top of the pages without touching them:
//  1. a thin progress bar across the top that fills as you read,
//  2. headings, copy, cards, list items and images below the fold rise and
//     un-blur in as they scroll into view, staggered when several arrive at once,
//  3. big pill buttons lean toward the cursor,
//  4. cards lift on hover, and large images drift against the scroll (CSS only, see globals.css).
// Elements already handled by <Rv> (data-rv), the header/footer, and anything that sets its own
// transform or animation are left alone, and nothing runs under prefers-reduced-motion.

const TARGETS = [
  "main section h1", "main section h2", "main section h3",
  "main section p", "main section li",
  "main section img", "main section svg[role='img']",
  "main section [class*='rounded-[10px]'][class*='border']",
  "main section [class*='rounded-tl-[2rem]']",
  "main section table",
].join(",");

function eligible(el: HTMLElement): boolean {
  if (el.closest("[data-rv], header, footer, nav, [data-fx-skip], [aria-hidden='true'], dialog, [role='dialog'], [role='menu']")) return false;
  if (el.hasAttribute("data-fx")) return false;
  // A pinned/sticky scene manages its own motion.
  if (el.closest(".sticky, [class*='sticky']")) return false;
  // Inside a collapsed accordion (a clipped, zero-height ancestor): it never scrolls "into view", so leave it.
  for (let a: HTMLElement | null = el.parentElement; a && a.tagName !== "MAIN"; a = a.parentElement) {
    if (a.clientHeight === 0 && getComputedStyle(a).overflow !== "visible") return false;
  }
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.position === "fixed") return false;
  if (cs.animationName !== "none") return false;
  return true;
}

export function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Phones: no scroll-driven motion at all.
    if (window.matchMedia("(max-width: 767.98px)").matches) return;
    const root = document.documentElement;
    root.setAttribute("data-fx-on", "");

    // 1. progress bar
    const bar = document.getElementById("elpino-progress");
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      root.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // 2. reveal
    let queue: HTMLElement[] = [];
    let flush = 0;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        queue.push(e.target as HTMLElement);
      }
      if (!flush && queue.length) {
        flush = window.setTimeout(() => {
          queue.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
          queue.forEach((el, i) => { el.style.setProperty("--fx-d", `${Math.min(i, 6) * 70}ms`); el.setAttribute("data-fx-in", ""); });
          queue = []; flush = 0;
        }, 30);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    const scan = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (!eligible(el)) return;
        const r = el.getBoundingClientRect();
        // Already on screen at load: leave it visible, no flash.
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) { el.setAttribute("data-fx", "seen"); return; }
        if (r.top < 0) { el.setAttribute("data-fx", "seen"); return; }
        const cs = getComputedStyle(el);
        const free = cs.transform === "none" && cs.translate === "none";
        el.setAttribute("data-fx", free ? "up" : "fade");
        io.observe(el);
      });
    };
    scan();
    let t = 0;
    const mo = new MutationObserver(() => { window.clearTimeout(t); t = window.setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });

    // 3. magnetic pills
    const mag = (e: PointerEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("main a[class*='rounded-full'][class*='h-1'], main button[class*='rounded-full'][class*='h-1']") as HTMLElement | null;
      document.querySelectorAll<HTMLElement>("[data-fx-mag]").forEach((x) => { if (x !== a) { x.style.translate = ""; x.removeAttribute("data-fx-mag"); } });
      if (!a) return;
      const r = a.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      a.setAttribute("data-fx-mag", "");
      a.style.translate = `${(dx * 10).toFixed(1)}px ${(dy * 8).toFixed(1)}px`;
    };
    window.addEventListener("pointermove", mag, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", mag);
      window.clearTimeout(t); window.clearTimeout(flush);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect(); mo.disconnect();
      root.removeAttribute("data-fx-on");
    };
  }, [pathname]);

  return <div id="elpino-progress" aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-[#0078f4]" />;
}
