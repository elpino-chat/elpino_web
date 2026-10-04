"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCheck, MessageSquarePlus, Search } from "lucide-react";

// Shared pieces of the conversation list on the Team Inbox and AI Assist pages, so the two stay identical.

export type ListFilter = "all" | "resolved";

export const LIST_FILTERS: Array<{ label: string; value: ListFilter }> = [
  { label: "All", value: "all" },
  { label: "Resolved", value: "resolved" },
];

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="il-badge flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-bold">{count > 99 ? "99+" : count}</span>;
}

export function InboxViewTabs({ active, teamBadge, aiBadge }: { active: "team" | "ai"; teamBadge: number; aiBadge: number }) {
  return (
    <nav className="inbox-view-nav il-tabs mb-1.5 flex items-center gap-6 px-4" aria-label="Inbox views">
      <Link href="/dashboard/inbox" aria-current={active === "team" ? "page" : undefined} className="il-tab flex items-center gap-2 py-3 text-[15px]">
        Team Inbox <Badge count={teamBadge} />
      </Link>
      <Link href="/dashboard/inbox?view=ai" aria-current={active === "ai" ? "page" : undefined} className="il-tab flex items-center gap-2 py-3 text-[15px]">
        AI Assist <Badge count={aiBadge} />
      </Link>
    </nav>
  );
}

export function ListToolbar({
  query, onQuery, filter, onFilter, unreadCount, onMarkAllRead, children,
}: {
  query: string; onQuery: (value: string) => void;
  filter: ListFilter; onFilter: (value: ListFilter) => void;
  unreadCount: number; onMarkAllRead: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="il-head px-4 pb-3 pt-0">
      {children}
      <label className="il-field flex h-10 items-center gap-2.5 rounded-full border px-4">
        <Search size={15} className="il-muted shrink-0" aria-hidden="true" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="il-input min-w-0 flex-1 bg-transparent text-[14.5px] outline-none" />
      </label>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LIST_FILTERS.map((item) => (
          <button key={item.value} type="button" onClick={() => onFilter(item.value)} aria-pressed={filter === item.value} className={`il-chip h-8 shrink-0 cursor-pointer rounded-full border px-3.5 text-[13.5px] font-medium transition ${filter === item.value ? "il-chip-on" : ""}`}>
            {item.label}
          </button>
        ))}
      </div>
      {unreadCount > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="il-muted text-[13.5px]">{unreadCount} unread</p>
          <button type="button" onClick={onMarkAllRead} className="il-link flex cursor-pointer items-center gap-1.5 text-[13.5px] font-medium underline-offset-4 hover:underline"><CheckCheck size={14} /> Mark all read</button>
        </div>
      )}
    </div>
  );
}

type RowProps = { name: string; initials: string; color: string; preview: string; time: string; unread?: number; resolved: boolean; active: boolean };

export function ConversationRow({ href, onSelect, ...row }: RowProps & { href?: string; onSelect?: () => void }) {
  const content = (
    <>
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ backgroundColor: row.color }}>{row.initials}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`il-name min-w-0 flex-1 truncate text-[15.5px] ${row.unread ? "font-semibold" : "font-medium"}`}>{row.name}</span>
          <span className="il-muted shrink-0 text-[12.5px]">{row.time}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          {row.resolved && <CheckCheck size={14} className="il-resolved shrink-0" />}
          <span className={`il-preview min-w-0 flex-1 truncate text-[14px] ${row.unread ? "il-preview-unread" : ""}`}>{row.preview}</span>
          {!!row.unread && <Badge count={row.unread} />}
        </span>
      </span>
    </>
  );
  const className = `il-row flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors ${row.active ? "il-row-on" : ""}`;
  return href ? <Link href={href} onClick={onSelect} className={className}>{content}</Link> : <button type="button" onClick={onSelect} className={className}>{content}</button>;
}

export function ListEmpty({ hasAny, onShowAll }: { hasAny: boolean; onShowAll: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="il-icon flex size-12 items-center justify-center rounded-xl"><MessageSquarePlus size={22} /></span>
      <p className="il-name mt-4 text-[17px] font-semibold">{hasAny ? "No conversations match" : "No conversations yet"}</p>
      <p className="il-muted il-empty-text mt-1.5 max-w-[240px] text-[14px] leading-6">{hasAny ? "Try another filter or search." : "Chats from your website will show up here."}</p>
      {hasAny && <button type="button" onClick={onShowAll} className="il-chip mt-4 h-9 cursor-pointer rounded-full border px-4 text-[14px] font-medium transition">Show all</button>}
    </div>
  );
}
