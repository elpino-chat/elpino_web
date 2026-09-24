"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll reveal: the wrapper is invisible until it enters the viewport, then
// plays one of the entrance animations defined in globals.css ([data-rv]).
// Each instance watches itself, so content that appears later reveals too.
export function Rv({ variant = "up", delay = 0, className, children }: { variant?: "up" | "drop" | "deal" | "pop" | "words"; delay?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} data-rv={variant} {...(seen ? { "data-in": "" } : {})} className={className} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}
