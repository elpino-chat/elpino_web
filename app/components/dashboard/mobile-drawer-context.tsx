"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shared open/close state for whichever secondary sidebar the current route
 * has (Space's panel, the Team Inbox conversation list, the AI Assist
 * conversation list) — the header's hamburger button and that panel are
 * siblings in the tree, not parent/child, so this is the thing that
 * connects them instead of prop-drilling through layout.tsx.
 */
type DrawerContextValue = { open: boolean; setOpen: (value: boolean) => void; toggle: () => void };
const DrawerContext = createContext<DrawerContextValue | null>(null);

export function MobileDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Any navigation — including picking an item out of the drawer itself —
  // closes it, so it never lingers open over the page it just navigated to.
  useEffect(() => setOpen(false), [pathname]);

  return <DrawerContext.Provider value={{ open, setOpen, toggle: () => setOpen((current) => !current) }}>{children}</DrawerContext.Provider>;
}

export function useMobileDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error("useMobileDrawer must be used inside MobileDrawerProvider");
  return context;
}
