"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

type Conversation = { status: "open" | "waiting" | "resolved"; assignedUserId?: string | null };

export type DashboardUser = { email: string; name?: string };

const primaryItems = [
  { icon: "inbox", label: "Inbox", href: "/dashboard" },
  { icon: "assistant", label: "AI Assist", href: "/dashboard/ai-assist" },
  { icon: "visitors", label: "Visitors", href: "/dashboard/visitors" },
  { icon: "contacts", label: "Contacts", href: "/dashboard/contacts" },
  { icon: "knowledge", label: "Knowledge", href: "/dashboard/knowledge" },
  { icon: "integrations", label: "Connect", href: "/dashboard/connect" },
  { icon: "settings", label: "Settings", href: "/dashboard/settings" },
] as const;

function NavGlyph({ name }: { name: (typeof primaryItems)[number]["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...common}>
      {name === "inbox" && (
        <>
          <path d="M5.5 4h13l2 10.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-4.5Z" />
          <path d="M3.5 14.5h5l1.4 2h4.2l1.4-2h5M8 8h8" />
        </>
      )}
      {name === "assistant" && (
        <>
          <path d="M7 7.5h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-3.5L10 21v-2.5H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" />
          <path d="m12 2 .7 2.1L15 5l-2.3.8L12 8l-.7-2.2L9 5l2.3-.9ZM8 13h.01M16 13h.01" />
        </>
      )}
      {name === "visitors" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" />
          <circle cx="17.8" cy="6.2" r="2.2" fill="#35b92c" stroke="#111827" strokeWidth="1.2" />
        </>
      )}
      {name === "contacts" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.2" />
          <path d="M3.5 19c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5M14 15c3.6-.7 5.8.7 6.5 3.5" />
        </>
      )}
      {name === "knowledge" && (
        <>
          <path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14 3.5V8h4M8.5 12h6M8.5 16h4" />
        </>
      )}
      {name === "integrations" && (
        <>
          {[6, 12, 18].flatMap((x) => [6, 12, 18].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="currentColor" stroke="none" />))}
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" />
          <circle cx="12" cy="12" r="7.2" />
        </>
      )}
    </svg>
  );
}

export default function Sidebar({
  isMobileOpen = false,
  setIsMobileOpen,
}: {
  user: DashboardUser;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}) {
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

  function closeMobile() {
    if (isMobileOpen) setIsMobileOpen?.(false);
  }

  return (
    <aside
      aria-label="Dashboard navigation"
      className={`dashboard-primary-sidebar absolute inset-y-0 left-0 z-40 ml-2 mr-0.5 my-0.5 flex h-[calc(100%_-_4px)] w-[80px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#eadfbe] bg-[#fff8e7] text-[#2b2923] shadow-[0_2px_10px_rgba(82,68,32,0.06)] transition-transform duration-200 md:relative md:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {setIsMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation"
          className="absolute -right-10 top-2 rounded-full bg-black p-2 text-white md:hidden"
        >
          <X size={18} />
        </button>
      )}

      <nav className="relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-2 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-full flex-col items-center gap-1">
          {primaryItems.map(({ icon, label, href }, index) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={closeMobile}
                aria-current={active ? "page" : undefined}
                className={`group relative flex w-full flex-col items-center justify-center rounded-xl py-[7px] text-center transition-colors duration-150 ${
                  active
                    ? "dashboard-nav-active border bg-white/70 text-[#2b2923]"
                    : ""
                }`}
              >
                <span className="relative mb-1">
                  <span className={active ? "text-[#2b2923]" : "text-[#696454] group-hover:text-[#2b2923]"}>
                    <NavGlyph name={icon} />
                  </span>
                  {label === "AI Assist" && aiHandledCount > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#fff8e7] bg-[#27895d] px-0.5 text-[8px] font-bold text-white">
                      {aiHandledCount > 99 ? "99+" : aiHandledCount}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] leading-4 ${active ? "font-semibold text-[#2b2923]" : "font-medium text-[#696454]"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
