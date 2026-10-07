"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, CircleAlert, Home, MessageCircle } from "lucide-react";
import { useMobileDrawer } from "./mobile-drawer-context";
import { inboxViewHref } from "./inbox-list-ui";

type RecentChat = { id: string; name: string; preview?: string; status: string; assignedUserId?: string | null; handledBy?: string };

const spaceRoutes = ["/dashboard", "/dashboard/notifications", "/dashboard/issues"];

// Opens the chat in the Inbox view that lists it, so the list beside it shows the same thread.
function recentChatHref(chat: RecentChat) {
  if (chat.assignedUserId) return inboxViewHref("all", chat.id);
  return inboxViewHref(chat.handledBy === "ai" ? "ai" : "unassigned", chat.id);
}

export default function SpacePanel() {
  const pathname = usePathname();
  const { open, setOpen } = useMobileDrawer();
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unresolvedIssueCount, setUnresolvedIssueCount] = useState(0);

  useEffect(() => {
    if (!spaceRoutes.includes(pathname)) return;
    Promise.all([
      fetchConversations().then((response) => response.ok ? response.json() : { conversations: [] }),
      fetch("/api/notifications", { cache: "no-store" }).then((response) => response.ok ? response.json() : { entries: [] }),
      fetch("/api/workspace/tickets", { cache: "no-store" }).then((response) => response.ok ? response.json() : { tickets: [] }),
    ]).then(([chatData, notificationData, ticketData]) => {
      setChats((chatData as { conversations?: RecentChat[] }).conversations ?? []);
      setNotificationCount((notificationData as { entries?: unknown[] }).entries?.length ?? 0);
      const tickets = (ticketData as { tickets?: { resolved?: boolean }[] }).tickets ?? [];
      setUnresolvedIssueCount(tickets.filter((ticket) => !ticket.resolved).length);
    }).catch(() => undefined);
  }, [pathname]);

  if (!spaceRoutes.includes(pathname)) return null;

  const openChats = chats.filter((chat) => chat.status !== "resolved");

  const items = [
    { label: "Home", href: "/dashboard", Icon: Home },
    { label: "Notifications", href: "/dashboard/notifications", Icon: Bell, count: notificationCount },
    { label: "Issues", href: "/dashboard/issues", Icon: CircleAlert, count: unresolvedIssueCount },
  ];

  return (
    <>
      {/* Kept mounted (not `hidden`) below md so the slide/fade below has
          something to animate — display can't be transitioned, so toggling
          hidden<->flex made this pop instantly instead of sliding. Position
          off-canvas with translate-x instead; md:hidden still removes it
          from layout and interaction above md. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={`dashboard-space-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-[250px] shrink-0 flex-col border-r px-2.5 py-3 shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out md:static md:z-auto md:w-[250px] md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <p className="space-panel-heading px-2.5 pb-2 text-sm font-normal">Space</p>
      <nav aria-label="Space navigation" className="space-y-1">
        {items.map(({ label, href, Icon, count }) => {
          const active = pathname === href;
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className="space-panel-nav flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-normal transition">
            <Icon size={18} strokeWidth={1.6} /> {label}
            {!!count && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8db8ff] px-1 text-[10px] text-[#172334]">{count > 99 ? "99+" : count}</span>}
          </Link>;
        })}
      </nav>

      <div className="space-panel-divider mx-1 my-4 border-t" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2.5">
          <p className="space-panel-heading text-xs font-normal">Recent chats</p>
          <Link href="/dashboard/inbox" className="space-panel-view-all text-[11px]">View all</Link>
        </div>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {openChats.slice(0, 6).map((chat) => (
            <Link key={chat.id} href={recentChatHref(chat)} className="space-panel-chat-row group flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition">
              <MessageCircle size={16} strokeWidth={1.6} className="space-panel-faint mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1"><span className="space-panel-chat-name block truncate text-xs font-normal">{chat.name}</span><span className="space-panel-faint mt-0.5 block truncate text-[11px]">{chat.preview || "Open conversation"}</span></span>
              <ChevronRight size={14} className="space-panel-fainter mt-1 shrink-0" />
            </Link>
          ))}
          {openChats.length === 0 && <div className="px-3 py-8 text-center"><MessageCircle size={20} className="space-panel-fainter mx-auto" /><p className="space-panel-faint mt-2 text-xs">No open chats</p></div>}
        </div>
      </div>
      </aside>
    </>
  );
}
