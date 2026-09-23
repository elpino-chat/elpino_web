"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, CircleAlert, Home, MessageCircle } from "lucide-react";
import { useMobileDrawer } from "./mobile-drawer-context";

type RecentChat = { id: string; name: string; preview?: string; status: string; assignedUserId?: string | null };

const spaceRoutes = ["/dashboard", "/dashboard/notifications", "/dashboard/issues"];

function recentChatHref(chat: RecentChat) {
  const params = new URLSearchParams({ conversation: chat.id });
  if (!chat.assignedUserId) params.set("view", "ai");
  return `/dashboard/inbox?${params.toString()}`;
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
      fetch("/api/workspace/conversations", { cache: "no-store" }).then((response) => response.ok ? response.json() : { conversations: [] }),
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
        className={`dashboard-space-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-[250px] shrink-0 flex-col border-r border-white/10 px-2.5 py-3 text-white shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out md:static md:z-auto md:w-[250px] md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <p className="px-2.5 pb-2 text-sm font-normal text-white/45">Space</p>
      <nav aria-label="Space navigation" className="space-y-1">
        {items.map(({ label, href, Icon, count }) => {
          const active = pathname === href;
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-normal transition ${active ? "bg-white/10 text-white/90" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}>
            <Icon size={18} strokeWidth={1.6} /> {label}
            {!!count && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8db8ff] px-1 text-[10px] text-[#172334]">{count > 99 ? "99+" : count}</span>}
          </Link>;
        })}
      </nav>

      <div className="mx-1 my-4 border-t border-white/10" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2.5">
          <p className="text-xs font-normal text-white/45">Recent chats</p>
          <Link href="/dashboard/inbox" className="text-[11px] text-white/35 hover:text-white/75">View all</Link>
        </div>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {openChats.slice(0, 6).map((chat) => (
            // Unassigned conversations live in AI Assist, not Team Inbox —
            // opening one there instead of AI Assist 404s the AI Assist tab
            // out from under the visible chat (Team Inbox only lists chats
            // someone has joined, same filter HomePanel's own list uses).
            <Link key={chat.id} href={recentChatHref(chat)} className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition hover:bg-white/[0.06]">
              <MessageCircle size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-white/35" />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-normal text-white/75">{chat.name}</span><span className="mt-0.5 block truncate text-[11px] text-white/35">{chat.preview || "Open conversation"}</span></span>
              <ChevronRight size={14} className="mt-1 shrink-0 text-white/20" />
            </Link>
          ))}
          {openChats.length === 0 && <div className="px-3 py-8 text-center"><MessageCircle size={20} className="mx-auto text-white/20" /><p className="mt-2 text-xs text-white/35">No open chats</p></div>}
        </div>
      </div>
      </aside>
    </>
  );
}
