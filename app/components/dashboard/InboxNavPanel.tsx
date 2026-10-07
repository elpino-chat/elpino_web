"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Ticket } from "lucide-react";
import { INBOX_SEARCH_EVENT, INBOX_VIEWS, inboxListHref, parseInboxView, viewCounts, type InboxView } from "./inbox-list-ui";
import { useMobileDrawer } from "./mobile-drawer-context";

type CountedConversation = { assignedUserId?: string | null; handledBy?: string; status: string; time: string };

const POLL_MS = 2000;

// The team's views in Intercom's order; the AI agent's view sits apart at the bottom, as "Fin AI Agent" does.
const VIEW_ORDER: InboxView[] = ["mine", "all", "unassigned"];

export default function InboxNavPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open, setOpen } = useMobileDrawer();
  const onTickets = pathname === "/dashboard/tickets";
  const showPanel = pathname === "/dashboard/inbox" || onTickets;
  const active = parseInboxView(searchParams.get("view"));
  // Below lg the Inbox opens on this list of views as a full page; picking one shows its conversations.
  const mobileMenu = pathname === "/dashboard/inbox" && !searchParams.get("conversation") && !searchParams.get("list");

  const [conversations, setConversations] = useState<CountedConversation[]>([]);
  const [myAccountId, setMyAccountId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<{ category?: string; resolved?: boolean }[]>([]);

  // Who "you" are, and the open tickets, change rarely: once on arrival is enough.
  useEffect(() => {
    if (!showPanel) return;
    fetch("/api/account", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: { id?: string } } | null) => setMyAccountId(data?.account?.id ?? null))
      .catch(() => undefined);
    fetch("/api/workspace/tickets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tickets?: { category?: string; resolved?: boolean }[] } | null) => setTickets(data?.tickets ?? []))
      .catch(() => undefined);
  }, [showPanel, searchParams]);

  // Shares one request with the list's own poll (fetchConversations joins calls made within a second).
  useEffect(() => {
    if (!showPanel) return;
    let cancelled = false;
    const load = () => fetchConversations()
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { conversations?: CountedConversation[] } | null) => { if (!cancelled && data) setConversations(data.conversations ?? []); })
      .catch(() => undefined);
    void load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [showPanel]);

  const counts = useMemo(() => viewCounts(conversations, myAccountId), [conversations, myAccountId]);
  // Open tickets per queue, for the Tickets group.
  const ticketCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, billing: 0, sales: 0, technical: 0, support: 0 };
    for (const ticket of tickets) {
      if (ticket.resolved) continue;
      counts.all += 1;
      const queue = ticket.category && ticket.category in counts ? ticket.category : "support";
      counts[queue] += 1;
    }
    return counts;
  }, [tickets]);

  if (!showPanel) return null;

  const navClass = "space-panel-nav inbox-nav-item flex h-8 items-center gap-2.5 rounded-lg border border-transparent px-2.5 text-[13px] font-normal transition";

  const item = (view: InboxView) => {
    const definition = INBOX_VIEWS.find((entry) => entry.value === view)!;
    return (
      <Link
        key={view}
        href={inboxListHref(view)}
        onClick={() => setOpen(false)}
        aria-current={view === active && !onTickets ? "page" : undefined}
        title={definition.hint}
        className={navClass}
      >
        {definition.icon}
        <span className="min-w-0 flex-1 truncate">{definition.label}</span>
        <span className="space-panel-faint shrink-0 text-[12px] tabular-nums">{counts[view] > 999 ? "999+" : counts[view]}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Below xl there is no room beside the list and the open chat, so this becomes the same
          slide-in drawer the Space panel uses, opened from the header's menu button. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 xl:hidden ${mobileMenu ? "max-lg:hidden" : ""} ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        id="dashboard-inbox-nav"
        className={`dashboard-space-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-[216px] shrink-0 flex-col border-r px-2 py-3 shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out xl:static xl:z-auto xl:translate-x-0 xl:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${mobileMenu ? "max-lg:static max-lg:z-auto max-lg:w-full max-lg:translate-x-0 max-lg:border-r-0 max-lg:shadow-none max-lg:px-3" : ""}`}
      >
        <div className="flex h-10 items-center gap-1 pb-2 pl-2.5">
          <p className="space-panel-chat-name flex-1 text-[17px] font-semibold">Inbox</p>
          {/* Opens the search box at the top of the conversation list (ListToolbar listens for this). */}
          {!onTickets && (
            <button
              type="button"
              onClick={() => { setOpen(false); window.dispatchEvent(new Event(INBOX_SEARCH_EVENT)); }}
              aria-label="Search conversations"
              title="Search conversations"
              className={`space-panel-nav flex size-8 items-center justify-center rounded-lg ${mobileMenu ? "max-lg:hidden" : ""}`}
            >
              <Search size={15} />
            </button>
          )}
        </div>
        <nav aria-label="Inbox views" className={`flex flex-col gap-1 pt-1.5 ${mobileMenu ? "max-lg:[&_a]:h-12 max-lg:[&_a]:text-[15px]" : ""}`}>
          {VIEW_ORDER.map(item)}
          {/* Tickets have their own page, with their own sidebar of queues. */}
          <Link href="/dashboard/tickets" onClick={() => setOpen(false)} aria-current={onTickets ? "page" : undefined} title="Tickets filed from conversations" className={navClass}>
            <Ticket size={15} />
            <span className="min-w-0 flex-1 truncate">Tickets</span>
            <span className="space-panel-faint shrink-0 text-[12px] tabular-nums">{ticketCounts.all}</span>
          </Link>
          {item("ai")}
        </nav>
      </aside>
    </>
  );
}
