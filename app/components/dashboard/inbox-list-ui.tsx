"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, CheckCheck, ChevronDown, CircleDashed, Layers, MessageSquarePlus, Search, UserRound } from "lucide-react";

// Shared pieces of the conversation list on the Team Inbox and AI Assist pages, so the two stay identical.

// Which conversations a list shows. Every view, the AI agent's included, is the same list beside the open chat.
export type InboxView = "mine" | "unassigned" | "ai" | "all";
// Fired by the search button in the Inbox sidebar; the list's toolbar opens its search box.
export const INBOX_SEARCH_EVENT = "elpino:inbox-search";
export type StatusFilter = "open" | "closed" | "all";
export type SortOrder = "newest" | "oldest";

type ViewedConversation = { assignedUserId?: string | null; handledBy?: string; status: string; time: string };

export const INBOX_VIEWS: Array<{ value: InboxView; label: string; hint: string; icon: ReactNode }> = [
  { value: "mine", label: "Your inbox", hint: "Assigned to you", icon: <UserRound size={15} /> },
  { value: "unassigned", label: "Unassigned", hint: "Handed to your team, nobody has joined", icon: <CircleDashed size={15} /> },
  { value: "ai", label: "AI agent", hint: "Your AI is handling these", icon: <Image src="/elpino_slack.png" alt="" width={16} height={16} className="size-4 shrink-0 object-contain" /> },
  { value: "all", label: "All conversations", hint: "Every conversation", icon: <Layers size={15} /> },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

// The inbox opens on every conversation, so nothing is hidden until a view is chosen. An old
// "?view=team" link lands here too.
export const DEFAULT_INBOX_VIEW: InboxView = "all";

export function parseInboxView(value: string | null): InboxView {
  return INBOX_VIEWS.some((view) => view.value === value) ? (value as InboxView) : DEFAULT_INBOX_VIEW;
}

export function inboxViewHref(view: InboxView, conversationId?: string) {
  const params = new URLSearchParams();
  if (view !== DEFAULT_INBOX_VIEW) params.set("view", view);
  if (conversationId) params.set("conversation", conversationId);
  const query = params.toString();
  return query ? `/dashboard/inbox?${query}` : "/dashboard/inbox";
}

// On phones the Inbox opens on the list of views; `list=1` marks "a view was picked, show its conversations".
export function inboxListHref(view: InboxView) {
  const href = inboxViewHref(view);
  return `${href}${href.includes("?") ? "&" : "?"}list=1`;
}

// A handoff sets handledBy to "human" and assigns whoever is free, so a human-handled thread with
// nobody on it is one waiting for the team. Until then (or after a teammate leaves it) it is the AI's.
export function inView(conversation: ViewedConversation, view: InboxView, myAccountId: string | null) {
  switch (view) {
    case "mine": return !!myAccountId && conversation.assignedUserId === myAccountId;
    case "unassigned": return !conversation.assignedUserId && conversation.handledBy !== "ai";
    case "ai": return !conversation.assignedUserId && conversation.handledBy === "ai";
    case "all": return true;
  }
}

export function matchesStatus(conversation: ViewedConversation, status: StatusFilter) {
  if (status === "all") return true;
  return status === "closed" ? conversation.status === "resolved" : conversation.status !== "resolved";
}

export function sortConversations<T extends ViewedConversation>(conversations: T[], order: SortOrder): T[] {
  const sign = order === "newest" ? -1 : 1;
  return [...conversations].sort((a, b) => sign * (new Date(a.time).getTime() - new Date(b.time).getTime()));
}

// Open conversations in each view: the number beside it in the Inbox sidebar.
export function viewCounts(conversations: ViewedConversation[], myAccountId: string | null): Record<InboxView, number> {
  const counts: Record<InboxView, number> = { mine: 0, unassigned: 0, ai: 0, all: 0 };
  for (const conversation of conversations) {
    if (conversation.status === "resolved") continue;
    for (const view of INBOX_VIEWS) if (inView(conversation, view.value, myAccountId)) counts[view.value] += 1;
  }
  return counts;
}

// "now", "5m", "3h", "2d", then a date: the short age Intercom shows beside each conversation.
export function shortAge(iso: string) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const minutes = Math.floor((Date.now() - at.getTime()) / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d`;
  const thisYear = at.getFullYear() === new Date().getFullYear();
  return at.toLocaleDateString(undefined, { month: "short", day: "numeric", year: thisYear ? undefined : "numeric" });
}

export function statusCounts(conversations: ViewedConversation[]): Record<StatusFilter, number> {
  const closed = conversations.filter((conversation) => conversation.status === "resolved").length;
  return { open: conversations.length - closed, closed, all: conversations.length };
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="il-badge flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-bold">{count > 99 ? "99+" : count}</span>;
}

// A dropdown that closes on a click outside it or on Escape.
function useMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, setOpen, toggle: () => setOpen((value) => !value), close: () => setOpen(false) };
}

function MenuBackdrop({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden="true" />;
}

export function MenuSelect<T extends string>({ label, value, options, counts, onChange, align = "left", footer }: {
  label: string; value: T; options: Array<{ value: T; label: string }>; counts?: Record<T, number>;
  onChange: (value: T) => void; align?: "left" | "right";
  footer?: { label: string; onClick: () => void };
}) {
  const menu = useMenu();
  const current = options.find((option) => option.value === value) ?? options[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={menu.toggle}
        aria-haspopup="listbox"
        aria-expanded={menu.open}
        aria-label={`${label}: ${current.label}`}
        className="il-name flex h-8 cursor-pointer items-center gap-1 rounded-lg text-[12.5px] font-normal"
      >
        {counts && <span className="tabular-nums">{counts[current.value]}</span>}
        {current.label}
        <ChevronDown size={14} className={`il-muted transition-transform ${menu.open ? "rotate-180" : ""}`} />
      </button>
      {menu.open && (
        <>
          <MenuBackdrop onClose={menu.close} />
          <div role="listbox" aria-label={label} className={`il-menu absolute top-full z-30 mt-1 min-w-[190px] overflow-hidden rounded-xl border py-1 ${align === "right" ? "right-0" : "left-0"}`}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => { onChange(option.value); menu.close(); }}
                className="il-menu-item flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px]"
              >
                <span className="flex w-3.5 shrink-0 justify-center">{option.value === value && <Check size={14} />}</span>
                <span className="flex-1">{option.label}</span>
                {counts && <span className="il-muted tabular-nums text-[12.5px]">{counts[option.value]}</span>}
              </button>
            ))}
            {footer && (
              <>
                <div className="il-menu-divider my-1 border-t" />
                <button type="button" onClick={() => { footer.onClick(); menu.close(); }} className="il-menu-item flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap px-3.5 py-2 text-left text-[13.5px]">
                  <CheckCheck size={14} className="shrink-0" />
                  {footer.label}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// The top of a conversation list, laid out like Intercom's: the view's name with a search button, then
// "12 Open" and "Newest" pickers. The views themselves are chosen in the Inbox sidebar (InboxNavPanel).
export function ListToolbar({
  view, query, onQuery, status, onStatus, statusCount, sort, onSort, unreadCount, onMarkAllRead, children,
}: {
  view: InboxView;
  query: string; onQuery: (value: string) => void;
  status: StatusFilter; onStatus: (value: StatusFilter) => void; statusCount: Record<StatusFilter, number>;
  sort: SortOrder; onSort: (value: SortOrder) => void;
  unreadCount: number; onMarkAllRead: () => void;
  children?: ReactNode;
}) {
  const current = INBOX_VIEWS.find((item) => item.value === view) ?? INBOX_VIEWS[0];
  const [searchOpen, setSearchOpen] = useState(false);
  const showSearch = searchOpen || query.length > 0;
  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener(INBOX_SEARCH_EVENT, open);
    return () => window.removeEventListener(INBOX_SEARCH_EVENT, open);
  }, []);
  return (
    <div className="il-head px-2 pb-2.5 pt-1.5">
      <div className="flex h-[52px] items-center gap-2 px-2.5">
        <span className="il-name shrink-0">{current.icon}</span>
        <h2 className="il-name min-w-0 flex-1 truncate text-[17px] font-semibold">{current.label}</h2>
      </div>
      {showSearch && (
        <label className="il-field mx-1 mb-2 flex h-9 items-center gap-2 rounded-lg border px-3">
          <Search size={14} className="il-muted shrink-0" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") { onQuery(""); setSearchOpen(false); } }}
            placeholder="Search by name or message"
            aria-label="Search conversations"
            className="il-input min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
          />
        </label>
      )}
      {children}
      <div className="flex items-center justify-between gap-2 px-2.5">
        <MenuSelect label="Status" value={status} options={STATUS_OPTIONS} counts={statusCount} onChange={onStatus} footer={unreadCount > 0 ? { label: "Mark all as read", onClick: onMarkAllRead } : undefined} />
        <MenuSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={onSort} align="right" />
      </div>
    </div>
  );
}

type RowProps = { name: string; initials: string; color: string; preview: string; time: string; unread?: number; resolved: boolean; active: boolean };

// One conversation: a small initial avatar, the name and time on one line, the last message under it.
// The open one is lifted as a card, as in Intercom.
export function ConversationRow({ href, onSelect, ...row }: RowProps & { href?: string; onSelect?: () => void }) {
  const content = (
    <>
      <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: row.color }}>{row.initials.charAt(0) || "?"}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="il-name min-w-0 flex-1 truncate text-[13px] font-normal">{row.name}</span>
          {!!row.unread && <Badge count={row.unread} />}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          {row.resolved && <CheckCheck size={12} className="il-resolved shrink-0" />}
          <span className={`il-preview min-w-0 flex-1 truncate text-[12px] ${row.unread ? "il-preview-unread" : ""}`}>{row.preview}</span>
          <span className="il-muted shrink-0 text-[11.5px] tabular-nums">{row.time}</span>
        </span>
      </span>
    </>
  );
  const className = `il-row mb-1.5 flex w-full cursor-pointer items-start gap-2 rounded-xl border border-transparent px-2.5 py-3 text-left transition-colors ${row.active ? "il-row-on" : ""}`;
  return href ? <Link href={href} onClick={onSelect} className={className}>{content}</Link> : <button type="button" onClick={onSelect} className={className}>{content}</button>;
}

export function ListEmpty({ hasAny, onShowAll }: { hasAny: boolean; onShowAll: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <MessageSquarePlus size={20} className="il-muted" />
      <p className="il-name mt-3 text-[14px] font-semibold">{hasAny ? "Nothing here" : "No conversations yet"}</p>
      <p className="il-muted il-empty-text mt-1 max-w-[220px] text-[13px] leading-5">{hasAny ? "No conversations match this view and filter." : "Chats from your website will show up here."}</p>
      {hasAny && <button type="button" onClick={onShowAll} className="il-link mt-3 cursor-pointer text-[13px] font-normal underline underline-offset-4">Show all</button>}
    </div>
  );
}
