"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutList, LifeBuoy, Receipt, ShoppingBag, Wrench } from "lucide-react";

type CountedTicket = { category?: string; resolved?: boolean };

const QUEUES = [
  { value: "", label: "All tickets", icon: <LayoutList size={15} /> },
  { value: "billing", label: "Billing", icon: <Receipt size={15} /> },
  { value: "sales", label: "Sales", icon: <ShoppingBag size={15} /> },
  { value: "technical", label: "Technical", icon: <Wrench size={15} /> },
  { value: "support", label: "Support", icon: <LifeBuoy size={15} /> },
];

const POLL_MS = 10_000;

// The Tickets page's own sidebar, styled like the Inbox one: its queues, each with its open tickets.
export default function TicketsNavPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showPanel = pathname === "/dashboard/tickets";
  const active = searchParams.get("category") ?? "";
  const [tickets, setTickets] = useState<CountedTicket[]>([]);

  useEffect(() => {
    if (!showPanel) return;
    let cancelled = false;
    const load = () => fetch("/api/workspace/tickets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tickets?: CountedTicket[] } | null) => { if (!cancelled && data) setTickets(data.tickets ?? []); })
      .catch(() => undefined);
    void load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [showPanel]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { "": 0, billing: 0, sales: 0, technical: 0, support: 0 };
    for (const ticket of tickets) {
      if (ticket.resolved) continue;
      result[""] += 1;
      result[ticket.category && ticket.category in result ? ticket.category : "support"] += 1;
    }
    return result;
  }, [tickets]);

  if (!showPanel) return null;

  // The third column, beside the Inbox sidebar: wide screens only. Below xl the list has its own queue picker.
  return (
    <>
      <aside
        id="dashboard-tickets-nav"
        className="dashboard-space-sidebar hidden h-full w-[300px] shrink-0 flex-col border-r px-2 py-3 xl:flex"
      >
        <div className="flex h-10 items-center pb-2 pl-2.5">
          <p className="space-panel-chat-name flex-1 text-[17px] font-semibold">Tickets</p>
        </div>
        <nav aria-label="Ticket queues" className="flex flex-col gap-1 pt-1.5">
          {QUEUES.map((queue) => (
            <Link
              key={queue.value || "all"}
              href={queue.value ? `/dashboard/tickets?category=${queue.value}` : "/dashboard/tickets"}
              aria-current={active === queue.value ? "page" : undefined}
              className="space-panel-nav inbox-nav-item flex h-8 items-center gap-2.5 rounded-lg border border-transparent px-2.5 text-[13px] font-normal transition"
            >
              {queue.icon}
              <span className="min-w-0 flex-1 truncate">{queue.label}</span>
              <span className="space-panel-faint shrink-0 text-[12px] tabular-nums">{counts[queue.value]}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
