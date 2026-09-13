"use client";

import { useEffect, useState } from "react";

// "light" dropped: the dashboard shell and every page surface are a fixed
// charcoal workspace regardless of this setting (see the unconditional
// #dashboard-settings-page-style rules in globals.css), so a saved "light"
// preference only ever meant text and backgrounds disagreeing with each
// other. "system" is kept as a distinct choice for a future real light
// theme, but resolves to dark today the same as picking Dark directly —
// there's no OS-driven light path to honor yet.
export type DashboardAppearance = "dark" | "system";
export const DASHBOARD_THEME_EVENT = "elpino-dashboard-theme";
export const DASHBOARD_THEME_KEY = "elpino-dashboard-theme";

type DashboardTheme = { accent: string; appearance: DashboardAppearance };
const fallback: DashboardTheme = { accent: "#428CE5", appearance: "dark" };

export function readDashboardTheme(): DashboardTheme {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = JSON.parse(window.localStorage.getItem(DASHBOARD_THEME_KEY) ?? "null") as Partial<{ accent: string; appearance: string }> | null;
    // A workspace saved "light" before that option was removed — fall back
    // to dark rather than carry an appearance value that no longer exists.
    const appearance = saved?.appearance === "dark" || saved?.appearance === "system" ? saved.appearance : fallback.appearance;
    return { accent: saved?.accent ?? fallback.accent, appearance };
  } catch { return fallback; }
}

export function saveDashboardTheme(theme: DashboardTheme) {
  window.localStorage.setItem(DASHBOARD_THEME_KEY, JSON.stringify(theme));
  window.dispatchEvent(new CustomEvent(DASHBOARD_THEME_EVENT, { detail: theme }));
}

// Sidebars now render the accent color at full strength as their
// background, so the text/icon color on top has to be picked per-accent
// (WCAG relative luminance) instead of a theme-wide black/white — otherwise
// a light accent (e.g. white/yellow) makes light-theme text unreadable, and
// a dark accent (e.g. black/navy) does the same in dark theme.
function contrastColorFor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "rgba(255, 255, 255, 0.92)";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const linear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
  return luminance > 0.45 ? "rgba(15, 17, 19, 0.92)" : "rgba(255, 255, 255, 0.92)";
}

export default function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<DashboardTheme>(fallback);

  useEffect(() => {
    setTheme(readDashboardTheme());
    const syncTheme = (event: Event) => setTheme((event as CustomEvent<DashboardTheme>).detail);
    window.addEventListener(DASHBOARD_THEME_EVENT, syncTheme);
    return () => window.removeEventListener(DASHBOARD_THEME_EVENT, syncTheme);
  }, []);

  // "system" has no OS-driven light path to resolve to yet — see the
  // DashboardAppearance comment above — so both choices render dark today.
  const resolved = "dark";
  const style = { "--dashboard-accent": theme.accent, "--dashboard-accent-contrast": contrastColorFor(theme.accent) } as React.CSSProperties;
  return <div data-dashboard-theme={resolved} style={style} className="flex h-full min-h-0 w-full flex-col">{children}</div>;
}
