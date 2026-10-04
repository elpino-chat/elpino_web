"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { primaryNavItems, NavGlyph } from "./nav-items";

type Conversation = { status: "open" | "waiting" | "resolved"; assignedUserId?: string | null };

// The first three are the day-to-day tabs, one tap away. The rest sit behind "More", which opens a menu above the dock.
const VISIBLE_COUNT = 3;
const visibleItems = primaryNavItems.slice(0, VISIBLE_COUNT);
const overflowItems = primaryNavItems.slice(VISIBLE_COUNT);

/**
 * The phone navigation: a floating dock, centred along the bottom with a gap around it, in place of the desktop rail
 * (Sidebar.tsx), which hides itself below md. Same items, same order and same Inbox badge as the rail, so switching between
 * phone and desktop widths never changes what is reachable.
 *
 * The dock is about 64px tall plus a 12px gap. DashboardMain, the setup badge and the chat bubble's
 * --elpino-bottom-offset all reserve 88px (plus the device safe area) to stay clear of it.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const [aiHandledCount, setAiHandledCount] = useState(0);
  // The menu is open "for" the page it was opened on, so any navigation (including picking an item from the menu) closes it
  // without an effect having to reset anything.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const moreOpen = openFor === pathname;
  const setMoreOpen = (open: boolean) => setOpenFor(open ? pathname : null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations()
      .then((response) => (response.ok ? response.json() : { conversations: [] }))
      .then((data: { conversations?: Conversation[] }) => {
        const count = (data.conversations ?? []).filter((conversation) => !conversation.assignedUserId && conversation.status !== "resolved").length;
        setAiHandledCount(count);
      })
      .catch(() => setAiHandledCount(0));
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setOpenFor(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenFor(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
  const overflowActive = overflowItems.some((item) => isActive(item.href));
  const itemClass = "dock-item relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-0.5 py-2 text-center transition active:scale-95";

  return (
    <nav
      aria-label="Dashboard navigation"
      className="dashboard-dock pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="dock-bar pointer-events-auto flex w-full max-w-[360px] items-center justify-between gap-0.5 rounded-[26px] border p-1.5">
        {visibleItems.map(({ icon, label, href }) => {
          const active = isActive(href);
          return (
            <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`${itemClass} ${active ? "dock-item-active" : ""}`}>
              <span className="relative">
                <NavGlyph name={icon} size={22} />
                {label === "Inbox" && aiHandledCount > 0 && (
                  <span className="dock-badge absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 bg-[#27895d] px-1 text-[9px] font-bold leading-none text-white">
                    {aiHandledCount > 99 ? "99+" : aiHandledCount}
                  </span>
                )}
              </span>
              <span className="w-full truncate text-[11px] font-medium leading-3">{label}</span>
            </Link>
          );
        })}

        {overflowItems.length > 0 && (
          <div ref={moreRef} className="relative flex min-w-0 flex-1">
            {moreOpen && (
              <div role="menu" aria-label="More navigation" className="dock-menu absolute bottom-full right-0 mb-3 w-52 overflow-hidden rounded-2xl border p-1.5">
                {overflowItems.map(({ icon, label, href }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={label}
                      href={href}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={`dock-menu-item ${active ? "dock-menu-item-active" : ""} flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium`}
                    >
                      <NavGlyph name={icon} size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={`${itemClass} ${overflowActive || moreOpen ? "dock-item-active" : ""} cursor-pointer`}
            >
              <MoreHorizontal size={22} />
              <span className="w-full truncate text-[11px] font-medium leading-3">More</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
