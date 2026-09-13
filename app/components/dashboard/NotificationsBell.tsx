"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Flag, Lock, LoaderCircle, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Enough to feel live without hammering the endpoint — this isn't a chat
// thread, it's a summary someone glances at, not watches.
const POLL_MS = 30_000;

type NotificationEntry = {
  id: string;
  kind: "unread" | "escalated" | "secure_request";
  conversationId: string;
  title: string;
  detail: string;
  createdAt: string;
};

const KIND_ICON: Record<NotificationEntry["kind"], typeof MessageCircle> = {
  unread: MessageCircle,
  escalated: Flag,
  secure_request: Lock,
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * The bell in the dashboard toolbar. `open`/`onOpenChange` and `muted` are
 * all controlled from the parent rather than owned here: the account menu
 * has its own "Notifications" row (a second, redundant entry point to this
 * same list) and its own "Mute notifications" toggle, so both need to act on
 * state that lives one level up instead of being duplicated or disconnected.
 */
export function NotificationsBell({
  open,
  onOpenChange,
  muted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muted: boolean;
}) {
  const [entries, setEntries] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/notifications", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : { entries: [] }))
        .then((data: { entries?: NotificationEntry[] }) => {
          if (!cancelled) setEntries(data.entries ?? []);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
            loadedOnce.current = true;
          }
        });
    }
    load();
    const interval = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const showBadge = !muted && entries.length > 0;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger aria-label="Notifications" className="dashboard-notification-button relative rounded-lg border border-transparent p-2 text-black/90 hover:border-[#e1e5e9] hover:bg-white">
        <Bell size={18} strokeWidth={1.8} />
        {showBadge && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ff761b]" />}
      </PopoverTrigger>
      <PopoverContent align="end" className="dashboard-notifications-menu w-[340px] p-0">
        <div className="dashboard-notifications-header flex items-center justify-between border-b border-[#eceef0] px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {entries.length > 0 && <span className="dashboard-notifications-count text-xs text-[#8a8e94]">{entries.length}</span>}
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {loading && !loadedOnce.current ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-[#8a8e94]">
              <LoaderCircle size={14} className="animate-spin" /> Loading
            </div>
          ) : entries.length === 0 ? (
            <div className="dashboard-notifications-empty flex flex-col items-center gap-2 px-6 py-10 text-center text-[#8a8e94]">
              <span className="dashboard-notifications-empty-icon flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f2f3] text-[#8a8e94]">
                <Bell size={16} />
              </span>
              <p className="text-[12px]">Nothing needs you right now.</p>
            </div>
          ) : (
            entries.map((entry) => {
              const Icon = KIND_ICON[entry.kind];
              // Full timestamp on hover — the row itself stays compact with
              // relative time ("5m ago"), but exactly when something arrived
              // is one hover away rather than requiring a click-through.
              const arrivedAt = new Date(entry.createdAt);
              const arrivedLabel = Number.isNaN(arrivedAt.getTime()) ? "" : arrivedAt.toLocaleString();
              return (
                <Link
                  key={entry.id}
                  href={`/dashboard/inbox?conversation=${encodeURIComponent(entry.conversationId)}`}
                  onClick={() => onOpenChange(false)}
                  title={arrivedLabel}
                  className="dashboard-notification-row flex items-start gap-3 border-b border-[#f1f2f3] px-4 py-3 text-left transition hover:bg-[#f7f8fa] last:border-b-0"
                >
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${entry.kind === "escalated" ? "bg-[#FFF4E5] text-[#93651D]" : entry.kind === "secure_request" ? "bg-[#EFE5F2] text-[#8C5DB5]" : "bg-[#EEF3F5] text-[#3578C8]"}`}>
                    <Icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="dashboard-notification-title block truncate text-[13px] font-semibold text-black">{entry.title}</span>
                    <span className="dashboard-notification-detail mt-0.5 block truncate text-[12px] text-[#687178]">{entry.detail}</span>
                  </span>
                  <span className="dashboard-notification-time shrink-0 pt-0.5 text-[10px] text-[#a2a7ac]">{timeAgo(entry.createdAt)}</span>
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
