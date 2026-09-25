"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { primaryNavItems, NavGlyph } from "./nav-items";

type Conversation = { status: "open" | "waiting" | "resolved"; assignedUserId?: string | null };

// First 4 are the day-to-day items, reachable in one tap; the rest are
// config/setup work people reach for less often on a phone, tucked behind
// "More" instead of squeezing all 7 into one row.
const VISIBLE_COUNT = 4;
const visibleItems = primaryNavItems.slice(0, VISIBLE_COUNT);
const overflowItems = primaryNavItems.slice(VISIBLE_COUNT);

/**
 * Material-style bottom tab bar — the mobile replacement for the desktop
 * rail (Sidebar.tsx), which hides itself below md. Same items, same order,
 * same Inbox badge, so switching between phone and desktop widths never
 * changes what's reachable. Items past VISIBLE_COUNT live behind a "More"
 * tab that opens a small menu anchored right above it.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const [aiHandledCount, setAiHandledCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
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

  // Route change (including picking an item from the menu itself) always
  // closes it — nothing should linger open over the new page.
  useEffect(() => setMoreOpen(false), [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moreOpen]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
  const overflowActive = overflowItems.some((item) => isActive(item.href));

  return (
    <nav
      aria-label="Dashboard navigation"
      className="dashboard-bottom-nav fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-white/10 bg-[#1c1c1c] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {visibleItems.map(({ icon, label, href }) => {
        const active = isActive(href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className="dashboard-bottom-nav-item relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-center"
          >
            <span className={`relative ${active ? "text-white" : "text-white/50"}`}>
              <NavGlyph name={icon} size={20} />
              {label === "Inbox" && aiHandledCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-2 border-[#1c1c1c] bg-[#27895d] px-0.5 text-[7px] font-bold text-white">
                  {aiHandledCount > 99 ? "99+" : aiHandledCount}
                </span>
              )}
            </span>
            <span className={`truncate text-[9.5px] leading-3 ${active ? "font-medium text-white" : "text-white/50"}`}>{label}</span>
            {active && <span className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-white" />}
          </Link>
        );
      })}

      {overflowItems.length > 0 && (
        <div ref={moreRef} className="relative flex min-w-0 flex-1">
          {moreOpen && (
            <div
              role="menu"
              aria-label="More navigation"
              className="dashboard-bottom-nav-more absolute bottom-full right-0 mb-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#232323] shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
            >
              {overflowItems.map(({ icon, label, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={label}
                    href={href}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] ${active ? "bg-white/[0.06] font-medium text-white" : "text-white/70 hover:bg-white/[0.04]"}`}
                  >
                    <NavGlyph name={icon} size={17} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className="dashboard-bottom-nav-item relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-center"
          >
            <span className={overflowActive || moreOpen ? "text-white" : "text-white/50"}>
              <MoreHorizontal size={20} />
            </span>
            <span className={`truncate text-[9.5px] leading-3 ${overflowActive || moreOpen ? "font-medium text-white" : "text-white/50"}`}>More</span>
            {overflowActive && !moreOpen && <span className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-white" />}
          </button>
        </div>
      )}
    </nav>
  );
}
