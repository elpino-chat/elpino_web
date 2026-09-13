"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { primaryNavItems, NavGlyph } from "./nav-items";

type Conversation = { status: "open" | "waiting" | "resolved"; assignedUserId?: string | null };

export type DashboardUser = { email: string; name?: string };

// Desktop-only rail — below md, MobileBottomNav (a fixed bottom tab bar)
// carries the same primaryNavItems instead. Together they're the only two
// places this nav is rendered.
export default function Sidebar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const [aiHandledCount, setAiHandledCount] = useState(0);

  useEffect(() => {
    fetch("/api/workspace/conversations", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { conversations: [] }))
      .then((data: { conversations?: Conversation[] }) => {
        const count = (data.conversations ?? []).filter((conversation) => !conversation.assignedUserId && conversation.status !== "resolved").length;
        setAiHandledCount(count);
      })
      .catch(() => setAiHandledCount(0));
  }, [pathname]);

  return (
    <aside
      aria-label="Dashboard navigation"
      className="dashboard-primary-sidebar relative hidden h-full w-[68px] shrink-0 flex-col md:flex"
    >
      <div className="flex h-[60px] shrink-0 items-center justify-center">
        <Link
          href="/dashboard"
          aria-label="Elpino dashboard"
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Image src="/elpino_slack.png" alt="" width={38} height={38} priority className="h-[38px] w-[38px] object-contain" />
        </Link>
      </div>

      <nav className="relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-2 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full flex-col items-center gap-1">
          {primaryNavItems.map(({ icon, label, href }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`sidebar-nav-item group relative flex w-full flex-col items-center justify-center rounded-lg py-2.5 text-center transition-colors duration-150 ${
                  active
                    ? "dashboard-nav-active"
                    : ""
                }`}
              >
                <span className="relative mb-1">
                  <span className={active ? "text-white/90" : "text-white/60"}>
                    <NavGlyph name={icon} />
                  </span>
                  {label === "Inbox" && aiHandledCount > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#fff8e7] bg-[#27895d] px-0.5 text-[8px] font-bold text-white">
                      {aiHandledCount > 99 ? "99+" : aiHandledCount}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-normal leading-4 ${active ? "text-white/90" : "text-white/60"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex shrink-0 flex-col items-center gap-5 pb-5 pt-3">
        <Link href="/contact" aria-label="Help" className="rounded-lg p-2"><CircleHelp size={20} /></Link>
        <Link href="/dashboard/settings" aria-label="Your profile" className="sidebar-account flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium">
          {(user.name || user.email).slice(0, 2).toUpperCase()}
        </Link>
      </div>
    </aside>
  );
}
