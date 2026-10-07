"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * Replaces a plain <main> in the dashboard shell so the Team Inbox route can
 * do a WhatsApp-style master-detail split on mobile: HomePanel (the
 * conversation list) takes the full screen until a chat is opened, at which
 * point this — the conversation itself — takes over instead. Every other
 * route (including AI Assist, which manages its own list/detail split
 * entirely inside itself) always shows as a normal flex-1 pane.
 */
export default function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isTeamInboxRoute = pathname === "/dashboard/inbox";
  const hasConversation = !!searchParams.get("conversation");
  const mobileHidden = isTeamInboxRoute && !hasConversation;
  // Pages that are plain scrolling content run all the way to the bottom of the screen, under the floating phone dock; their own scroll
  // area carries the clearance (see globals.css). Chat-style pages (Inbox, AI Assist) and Contacts keep a reserved strip instead, because
  // their message box and lists sit at the very bottom and the dock would cover them.
  const dockOverlays = /^\/dashboard\/(settings|knowledge|visitors)(\/|$)/.test(pathname);

  return (
    <main
      data-tour="page"
      className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${dockOverlays ? "pb-0" : "pb-[calc(88px+env(safe-area-inset-bottom))]"} md:pb-0 ${
        mobileHidden ? "hidden lg:block" : "block"
      }`}
    >
      {children}
    </main>
  );
}
