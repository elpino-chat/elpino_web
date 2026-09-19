"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCheck, ChevronDown, Filter, Globe2, MessageSquarePlus, Search } from "lucide-react";

type PanelUser = { email: string; name?: string };
type ConversationStatus = "open" | "waiting" | "resolved";

type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread?: number;
  status: ConversationStatus;
  assignedUserId?: string | null;
  siteId?: string | null;
  siteDomain?: string | null;
};

type Workspace = { id: string; name: string };
type Site = { id: string; domain: string; name: string | null };

const POLL_MS = 2000;

const filters: Array<{ label: string; value: "all" | "resolved" | "unread" | "read" }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
  { label: "Resolved", value: "resolved" },
];

// No avatar color is stored server-side, so derive a stable one from the
// conversation id — same conversation always renders the same color.
const AVATAR_COLORS = ["#172334", "#7c55c7", "#2d8b78", "#c0634d", "#3e76bb", "#aa6d36", "#4e6599"];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const isThisYear = new Date().getFullYear() === date.getFullYear();
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: isThisYear ? undefined : "numeric" });
}

export default function HomePanel({ user: _user }: { user: PanelUser }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showPanel = pathname === "/dashboard/inbox" && searchParams.get("view") !== "ai";
  const openedConversationId = searchParams.get("conversation");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  // null = every domain. A workspace with only one connected site never
  // shows this as more than "All domains" (see domainOptions below) — the
  // picker only earns its place once there's actually something to pick.
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);

  // Sites rarely change while someone is sitting in the inbox — unlike
  // conversations this doesn't need the 2s poll, a fetch on mount is enough.
  useEffect(() => {
    if (!showPanel) return;
    fetch("/api/workspace/sites")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { sites?: Site[] } | null) => setSites(data?.sites ?? []))
      .catch(() => undefined);
  }, [showPanel]);

  useEffect(() => {
    if (!showPanel) return;
    let cancelled = false;

    function load(isFirst: boolean) {
      if (isFirst) setLoading(true);
      fetch("/api/workspace/conversations")
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { conversations?: Conversation[]; workspace?: Workspace } | null) => {
          if (cancelled || !data) return;
          setConversations(data.conversations ?? []);
          setWorkspace(data.workspace ?? null);
          if (isFirst) setActiveId((current) => current ?? data.conversations?.find((item) => item.assignedUserId)?.id ?? null);
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled && isFirst) setLoading(false);
        });
    }

    load(true);
    const interval = window.setInterval(() => load(false), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [showPanel]);

  // The Inbox is for conversations a teammate has actually taken on —
  // anything still unclaimed belongs in AI Assist instead, until someone
  // joins it (assigning it here).
  const assigned = useMemo(() => conversations.filter((conversation) => !!conversation.assignedUserId), [conversations]);

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assigned.filter((conversation) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" ? !!conversation.unread : filter === "read" ? !conversation.unread : conversation.status === filter);
      const matchesQuery =
        !normalizedQuery ||
        conversation.name.toLowerCase().includes(normalizedQuery) ||
        conversation.preview.toLowerCase().includes(normalizedQuery);
      const matchesDomain = !selectedSiteId || conversation.siteId === selectedSiteId;
      return matchesFilter && matchesQuery && matchesDomain;
    });
  }, [assigned, filter, query, selectedSiteId]);

  const unreadCount = useMemo(() => assigned.filter((conversation) => !!conversation.unread).length, [assigned]);

  // AI Assist's own unread count, so its tab can carry a badge the same way
  // the Inbox icon in the primary sidebar does — computed locally since this
  // view already has the full conversation list.
  const aiUnreadCount = useMemo(
    () => conversations.filter((conversation) => !conversation.assignedUserId && !!conversation.unread).length,
    [conversations],
  );

  // When nothing is actually unread, fall back to "how many are still open"
  // — the same thing the sidebar's Inbox badge counts — so the tab isn't
  // silent about conversations that still need attention.
  const teamOpenCount = useMemo(
    () => assigned.filter((conversation) => conversation.status !== "resolved").length,
    [assigned],
  );
  const aiOpenCount = useMemo(
    () => conversations.filter((conversation) => !conversation.assignedUserId && conversation.status !== "resolved").length,
    [conversations],
  );
  const teamBadgeCount = unreadCount > 0 ? unreadCount : teamOpenCount;
  const aiBadgeCount = aiUnreadCount > 0 ? aiUnreadCount : aiOpenCount;

  // How many of this teammate's assigned conversations came from each site
  // — shown next to its name in the picker so "All domains" vs. one
  // specific domain is a real number, not a guess.
  const conversationCountBySite = useMemo(() => {
    const counts = new Map<string, number>();
    for (const conversation of assigned) {
      if (!conversation.siteId) continue;
      counts.set(conversation.siteId, (counts.get(conversation.siteId) ?? 0) + 1);
    }
    return counts;
  }, [assigned]);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;

  async function markAllRead() {
    await fetch("/api/workspace/conversations/mark-all-read", { method: "POST" }).catch(() => undefined);
    setConversations((current) => current.map((conversation) => ({ ...conversation, unread: undefined })));
  }

  if (!showPanel) return null;

  return (
    <aside
      id="dashboard-inbox-list"
      className={`dashboard-secondary-sidebar h-full w-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#262626] lg:static lg:flex lg:w-[304px] ${
        openedConversationId ? "hidden" : "flex"
      }`}
    >
      <nav className="inbox-view-nav flex items-center gap-5 px-3" aria-label="Inbox views">
        <Link href="/dashboard/inbox" aria-current="page" className="flex w-fit items-center gap-1.5 border-b-2 border-white/80 px-0 py-2 text-[13.5px] font-normal text-white">
          Team Inbox
          {teamBadgeCount > 0 && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#27895d] px-1 text-[9px] font-bold text-white">
              {teamBadgeCount > 99 ? "99+" : teamBadgeCount}
            </span>
          )}
        </Link>
        <Link href="/dashboard/inbox?view=ai" className="flex w-fit items-center gap-1.5 px-0 py-2 text-[13.5px] font-normal text-white/70 hover:text-white/90">
          AI Assist
          {aiBadgeCount > 0 && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#27895d] px-1 text-[9px] font-bold text-white">
              {aiBadgeCount > 99 ? "99+" : aiBadgeCount}
            </span>
          )}
        </Link>
      </nav>
      <div className="border-b border-[#e4e7ea] px-3 pb-3 pt-3">
        <div className="inbox-list-summary flex items-start justify-end gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="mt-1 shrink-0 whitespace-nowrap rounded-full border border-[#dfe3e7] px-2.5 py-1 text-[10.5px] font-semibold text-[#3f474d] transition-colors hover:bg-[#f4f6f7]"
            >
              Mark all read
            </button>
          )}
        </div>

        {sites.length > 1 && (
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setDomainMenuOpen((open) => !open)}
              aria-expanded={domainMenuOpen}
              className="dashboard-search-box flex h-9 w-full items-center gap-2 rounded-lg border px-3 text-left transition-colors"
            >
              <Globe2 size={15} className="shrink-0 text-[#7e8791]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                {selectedSite ? selectedSite.domain : "All domains"}
              </span>
              <span className="shrink-0 text-[11px] text-[#9aa2ac]">
                {selectedSite ? conversationCountBySite.get(selectedSite.id) ?? 0 : assigned.length}
              </span>
              <ChevronDown size={14} className={`shrink-0 text-[#9aa2ac] transition-transform ${domainMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {domainMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDomainMenuOpen(false)} />
                <div className="dashboard-search-box absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-white py-1 shadow-[0_16px_40px_-20px_rgba(15,18,22,0.45)]">
                  <button
                    type="button"
                    onClick={() => { setSelectedSiteId(null); setDomainMenuOpen(false); }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-[#f4f6f7] ${!selectedSiteId ? "font-semibold text-[#14171b]" : "text-[#3f474d]"}`}
                  >
                    All domains
                    <span className="text-[11px] text-[#9aa2ac]">{assigned.length}</span>
                  </button>
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => { setSelectedSiteId(site.id); setDomainMenuOpen(false); }}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-[#f4f6f7] ${selectedSiteId === site.id ? "font-semibold text-[#14171b]" : "text-[#3f474d]"}`}
                    >
                      <span className="min-w-0 truncate">{site.domain}</span>
                      <span className="shrink-0 text-[11px] text-[#9aa2ac]">{conversationCountBySite.get(site.id) ?? 0}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="dashboard-search-box mt-3 flex h-9 items-center rounded-lg border px-3 transition-colors">
          <Search size={16} className="shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 bg-transparent px-2 text-[12px] outline-none placeholder:text-[#9aa2ac]"
          />
          <Filter size={14} />
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold transition-colors ${
                filter === item.value ? "dashboard-filter-tab-active" : "dashboard-filter-tab text-[#7e8791]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleConversations.map((conversation) => {
          const active = conversation.id === (openedConversationId ?? activeId);
          return (
            <Link
              key={conversation.id}
              href={`/dashboard/inbox?conversation=${conversation.id}`}
              onClick={() => setActiveId(conversation.id)}
              className={`dashboard-chat-row group mb-1 flex items-start gap-3 rounded-xl px-2.5 py-3 transition-colors ${active ? "dashboard-chat-row-active" : ""}`}
            >
              <span
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: colorForId(conversation.id) }}
              >
                {conversation.initials}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={`min-w-0 flex-1 truncate text-[13px] ${conversation.unread ? "font-semibold text-[#17253a]" : "font-medium text-[#34445a]"}`}>
                    {conversation.name}
                  </span>
                  <span className="shrink-0 text-[9px] text-[#969ea7]">{formatTime(conversation.time)}</span>
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  {conversation.status === "resolved" && <CheckCheck size={13} className="shrink-0 text-[#32a880]" />}
                  <span className={`min-w-0 flex-1 truncate text-[11px] leading-4 ${conversation.unread ? "font-medium text-[#4a596c]" : "text-[#89929c]"}`}>
                    {conversation.preview}
                  </span>
                  {!!conversation.unread && (
                    <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#428ce5] px-1 text-[9px] font-bold text-white">
                      {conversation.unread}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          );
        })}

        {!loading && visibleConversations.length === 0 && (
          <div className="px-4 py-12 text-center">
            <MessageSquarePlus size={25} className="mx-auto text-[#b4bbc3]" />
            <p className="mt-2 text-xs text-[#8c959f]">
              {conversations.length === 0 ? "No conversations yet" : "No conversations found"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
