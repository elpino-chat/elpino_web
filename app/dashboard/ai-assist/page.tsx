"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, Filter, Globe, LoaderCircle, MapPin, MessageCircle, MessageSquarePlus, MonitorSmartphone, Search, Send, ShieldCheck, Sparkles } from "lucide-react";
import MessageMarkdown from "@/app/components/MessageMarkdown";
import TypingDots from "@/app/components/TypingDots";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEFAULT_BOT_AVATAR,
  formatDevice,
  formatPlace,
  formatTime,
  groupMessages,
  type Message,
  type VisitorLocation,
} from "@/app/dashboard/lib/conversation";

type AiPersona = {
  id: string;
  name: string;
  aiName: string;
  aiAvatarUrl: string | null;
  chatbotAccent: string;
};

type ConversationStatus = "open" | "waiting" | "resolved";
type Conversation = {
  id: string;
  name: string;
  initials: string;
  email?: string | null;
  phone?: string | null;
  topic?: string | null;
  preview: string;
  time: string;
  unread?: number;
  status: ConversationStatus;
  assignedUserId?: string | null;
  handledBy?: string;
  location?: VisitorLocation;
  aiName?: string;
  aiAvatarUrl?: string | null;
  /** Proved this is really them (signed in, or confirmed a code) — not just a typed-in name/email. */
  verified?: boolean;
};


type PastConversation = { id: string; preview: string; time: string; status: ConversationStatus };

const POLL_MS = 2000;
const TYPING_PING_MS = 2000;

// Mirrors HomePanel's avatar coloring so a conversation looks the same
// here as it will once it lands in the Inbox.
const AVATAR_COLORS = ["#172334", "#7c55c7", "#2d8b78", "#c0634d", "#3e76bb", "#aa6d36", "#4e6599"];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Lists show a date for older threads; the transcript itself only ever shows
// a clock time, which is what `formatTime` from the shared module gives.
function formatListTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const isThisYear = new Date().getFullYear() === date.getFullYear();
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: isThisYear ? undefined : "numeric" });
}

const filters: Array<{ label: string; value: "all" | "resolved" | "unread" | "read" }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
  { label: "Resolved", value: "resolved" },
];

function TakeoverBanner({ aiName }: { aiName: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px flex-1 bg-[#edf0f2]" />
      <span className="rounded-full border border-[#d7ecdf] bg-[#edf7f1] px-3 py-1 text-[10.5px] font-semibold text-[#2e8a5c]">
        You took over from {aiName || "AI"}
      </span>
      <span className="h-px flex-1 bg-[#edf0f2]" />
    </div>
  );
}

export default function AiAssistPage() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [aiName, setAiName] = useState("Elpino AI");
  const [aiAvatarUrl, setAiAvatarUrl] = useState("");
  const [accent, setAccent] = useState("#202225");
  const [error, setError] = useState<string | null>(null);
  const [myAccountId, setMyAccountId] = useState("");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justJoined, setJustJoined] = useState<{ conversationId: string; afterCount: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // True while the reader is at (or near) the bottom of the thread. Only then does a new message pull the view down.
  const stickToBottomRef = useRef(true);

  function loadConversations() {
    return fetchConversations()
      .then((response) => (response.ok ? response.json() : { conversations: [] }))
      .then((data: { conversations?: Conversation[] }) => setConversations(data.conversations ?? []))
      .catch(() => setConversations([]));
  }

  useEffect(() => {
    fetch("/api/workspace/ai-persona")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { persona?: AiPersona | null } | null) => {
        if (!data?.persona) return;
        setWorkspaceName(data.persona.name ?? "");
        setAiName(data.persona.aiName ?? "Elpino AI");
        setAiAvatarUrl(data.persona.aiAvatarUrl ?? "");
        setAccent(data.persona.chatbotAccent ?? "#202225");
      })
      .catch(() => undefined);

    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: { id: string } } | null) => setMyAccountId(data?.account?.id ?? ""))
      .catch(() => undefined);

    loadConversations().finally(() => setConversationsLoading(false));
    const interval = window.setInterval(loadConversations, POLL_MS);
    return () => window.clearInterval(interval);
  }, []);

  // "AI handled" = unassigned to any teammate — resolved ones stay in this
  // list too now (under the Resolved tab) rather than disappearing outright,
  // since the tabs are the thing responsible for status filtering.
  const aiHandled = useMemo(() => conversations.filter((conversation) => !conversation.assignedUserId), [conversations]);

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return aiHandled.filter((conversation) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" ? !!conversation.unread : filter === "read" ? !conversation.unread : conversation.status === filter);
      const matchesQuery =
        !normalizedQuery ||
        conversation.name.toLowerCase().includes(normalizedQuery) ||
        conversation.preview.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [aiHandled, filter, query]);

  const unreadCount = useMemo(() => aiHandled.filter((conversation) => !!conversation.unread).length, [aiHandled]);

  // Team Inbox's own unread count, so its tab can carry a badge the same way
  // the Inbox icon in the primary sidebar does — computed locally since this
  // view already has the full conversation list.
  const teamUnreadCount = useMemo(
    () => conversations.filter((conversation) => !!conversation.assignedUserId && !!conversation.unread).length,
    [conversations],
  );

  // When nothing is actually unread, fall back to "how many are still open"
  // — the same thing the sidebar's Inbox badge counts — so the tab isn't
  // silent about conversations that still need attention.
  const aiOpenCount = useMemo(() => aiHandled.filter((conversation) => conversation.status !== "resolved").length, [aiHandled]);
  const teamOpenCount = useMemo(
    () => conversations.filter((conversation) => !!conversation.assignedUserId && conversation.status !== "resolved").length,
    [conversations],
  );
  const aiBadgeCount = unreadCount > 0 ? unreadCount : aiOpenCount;
  const teamBadgeCount = teamUnreadCount > 0 ? teamUnreadCount : teamOpenCount;

  async function markAllRead() {
    await fetch("/api/workspace/conversations/mark-all-read", { method: "POST" }).catch(() => undefined);
    void loadConversations();
  }

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const joined = !!selected?.assignedUserId && selected.assignedUserId === myAccountId;
  // The persona endpoint and the conversation row can each carry an avatar;
  // prefer whatever this thread actually came through, then the workspace
  // persona, then the same stock icon the widget falls back to.
  const botAvatar = selected?.aiAvatarUrl || aiAvatarUrl || DEFAULT_BOT_AVATAR;
  const place = formatPlace(selected?.location);
  const device = formatDevice(selected?.location?.userAgent);

  const [customerTyping, setCustomerTyping] = useState(false);
  const lastTypingPingRef = useRef(0);

  useEffect(() => {
    if (!selectedId) { setMessages([]); setCustomerTyping(false); return; }
    let cancelled = false;
    setMessagesLoading(true);
    stickToBottomRef.current = true;

    function load() {
      fetch(`/api/workspace/conversations/${encodeURIComponent(selectedId!)}/messages`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : { messages: [] }))
        .then((data: { messages?: Message[]; customerTyping?: boolean }) => {
          if (cancelled) return;
          setMessages(data.messages ?? []);
          setCustomerTyping(!!data.customerTyping);
        })
        .finally(() => { if (!cancelled) setMessagesLoading(false); });
    }

    load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [selectedId]);

  // Keyed on the last message's id and the count rather than the `messages` array itself: polling
  // swaps that array for a new reference every 2s even when nothing changed, which used to yank the
  // view back to the bottom over and over, so nothing could be read after scrolling up. This only
  // re-fires when a message really arrives (or the typing indicator changes), and only pulls the
  // view down when the reader is already at the bottom.
  const lastMessageKey = `${messages.length}:${messages[messages.length - 1]?.id ?? ""}`;
  useEffect(() => {
    if (!stickToBottomRef.current) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lastMessageKey, customerTyping]);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingPingRef.current < TYPING_PING_MS || !selectedId) return;
    lastTypingPingRef.current = now;
    fetch(`/api/workspace/conversations/${encodeURIComponent(selectedId)}/typing`, { method: "POST" }).catch(() => undefined);
  }

  const [pastConversations, setPastConversations] = useState<PastConversation[]>([]);
  useEffect(() => {
    if (!selectedId) { setPastConversations([]); return; }
    let cancelled = false;
    fetch(`/api/workspace/conversations/${encodeURIComponent(selectedId)}/history`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { conversations: [] }))
      .then((data: { conversations?: PastConversation[] }) => { if (!cancelled) setPastConversations(data.conversations ?? []); })
      .catch(() => { if (!cancelled) setPastConversations([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  async function joinConversation() {
    if (!selectedId || joining) return;
    setJoining(true);
    setError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(selectedId)}/claim`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not join this conversation");
        return;
      }
      setConversations((current) => current.map((conversation) => (conversation.id === selectedId ? { ...conversation, assignedUserId: myAccountId } : conversation)));
      setJustJoined({ conversationId: selectedId, afterCount: messages.length });

      // AI Assist is for watching what the bot is doing; the Inbox is where
      // you actually work a thread — full composer, attachments, tickets,
      // secure requests, visitor detail. Once you have taken the
      // conversation, that is where you want to be, so go there rather than
      // leaving you in a read-only view wondering why you cannot do much.
      //
      // The server has already posted "<name> joined the chat", so the
      // customer's widget and the Inbox transcript both show the handover the
      // moment this lands.
      router.push(`/dashboard/inbox?conversation=${encodeURIComponent(selectedId)}`);
    } finally {
      setJoining(false);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || sending || !selectedId) return;
    setSending(true);
    setDraft("");
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(selectedId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await response.json()) as { message?: Message };
      if (data.message) setMessages((current) => [...current, data.message as Message]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div id="dashboard-ai-assist" className="flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
      <aside
        className={`dashboard-ai-list dashboard-secondary-sidebar h-full w-full shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#262626] md:static md:flex md:w-[260px] lg:w-[304px] ${
          selectedId ? "hidden" : "flex"
        } md:flex`}
      >
        <nav className="inbox-view-nav flex items-center gap-5 px-3" aria-label="Inbox views">
          <Link href="/dashboard/inbox" className="flex w-fit items-center gap-1.5 px-0 py-2 text-[13.5px] font-normal text-white/70 hover:text-white/90">
            Team Inbox
            {teamBadgeCount > 0 && (
              <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#27895d] px-1 text-[9px] font-bold text-white">
                {teamBadgeCount > 99 ? "99+" : teamBadgeCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/inbox?view=ai" aria-current="page" className="flex w-fit items-center gap-1.5 border-b-2 border-white/80 px-0 py-2 text-[13.5px] font-normal text-white">
            AI Assist
            {aiBadgeCount > 0 && (
              <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#27895d] px-1 text-[9px] font-bold text-white">
                {aiBadgeCount > 99 ? "99+" : aiBadgeCount}
              </span>
            )}
          </Link>
        </nav>
        <div className="px-3 pt-3">
          <div className="inbox-list-summary flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Chats</h2>
              <p className="mt-0.5 text-[13px] text-[#8a929c]">
                {conversationsLoading
                  ? "Loading…"
                  : `${aiHandled.length} handled by ${aiName || "AI"}`}
              </p>
            </div>
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

          <div className="mt-3 flex gap-4 border-b border-[#e4e7ea] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`relative shrink-0 pb-2 text-[13.5px] font-semibold transition-colors ${
                  filter === item.value ? "text-[#17181a]" : "text-[#8a929c] hover:text-[#3f474d]"
                }`}
              >
                {item.label}
                {filter === item.value && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[var(--chat-line-text)]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {conversationsLoading ? (
            <div className="flex min-h-[140px] items-center justify-center text-[12px] text-[#7b858a]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading</div>
          ) : (
            visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => { setSelectedId(conversation.id); setJustJoined(null); }}
                className={`dashboard-chat-row mb-1 flex w-full items-start gap-3 rounded-xl px-2.5 py-3 text-left transition-colors ${selectedId === conversation.id ? "dashboard-chat-row-active" : ""}`}
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
                    <span className="shrink-0 text-[9px] text-[#969ea7]">{formatListTime(conversation.time)}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-1.5">
                    {conversation.status === "resolved" && <CheckCheck size={13} className="shrink-0 text-[#32a880]" />}
                    <span className={`min-w-0 flex-1 truncate text-[11px] leading-4 ${conversation.unread ? "font-medium text-[#4a596c]" : "text-[#89929c]"}`}>
                      {conversation.preview || "No messages yet"}
                    </span>
                    {!!conversation.unread && (
                      <span className="chat-action-primary flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-bold">
                        {conversation.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))
          )}

          {!conversationsLoading && visibleConversations.length === 0 && (
            <div className="px-4 py-12 text-center">
              <MessageSquarePlus size={25} className="mx-auto text-[#b4bbc3]" />
              <p className="mt-2 text-xs text-[#8c959f]">
                {aiHandled.length === 0 ? "No conversations right now" : "No conversations found"}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className={`dashboard-page-surface dashboard-ai-assist-main dashboard-conversation relative min-h-0 flex-1 flex-col overflow-hidden bg-[#262626] md:flex ${selected ? "flex" : "hidden"}`}>
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--chat-customer-bg)] text-[var(--chat-line-text)]"><Sparkles size={24} /></span>
            <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.02em]">{aiName || "Your AI"} is on it</h1>
            <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#74808c]">
              {aiHandled.length
                ? `Pick a conversation from the list to preview it — join it to start replying yourself.`
                : `${aiName || "Your AI"} is handling every open chat for ${workspaceName || "this workspace"} right now. Nothing needs you yet.`}
            </p>
            {error && <p className="mt-4 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11.5px] font-medium text-[#a64a53]">{error}</p>}
          </div>
        ) : (
          <>
            <header className="dashboard-ai-header flex h-16 shrink-0 items-center border-b border-white/10 px-5">
              {/* Only reachable on mobile, where the list and the open chat
                  trade places instead of sitting side by side. */}
              <button
                type="button"
                onClick={() => { setSelectedId(null); setJustJoined(null); }}
                aria-label="Back to conversations"
                className="-ml-1.5 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--chat-muted)] transition hover:bg-[var(--chat-customer-bg)] md:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: colorForId(selected.id) }}>
                {selected.initials}
              </span>
              <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-[15px] font-semibold text-[#17233a]">{selected.name}</h1>
                  {selected.verified && (
                    <span title="Proved their identity — signed in, or confirmed with a code" className="flex shrink-0 items-center gap-1 rounded-full bg-[#edf7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e8a5c]">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                  {joined && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#edf7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e8a5c]">
                      <CheckCheck size={11} /> Assigned to you
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--chat-muted)]">
                  <span>{joined ? "You're handling this conversation" : `${aiName || "AI"} is replying — you're just viewing`}</span>
                  {/* Where the visitor actually is, at a glance — the same
                      detail the Inbox shows, so switching views does not mean
                      losing context about who you are talking to. */}
                  {place && <span className="flex items-center gap-1"><MapPin size={10} className="shrink-0" /> {place}</span>}
                  {selected.location?.ip && <span className="flex items-center gap-1"><Globe size={10} className="shrink-0" /> {selected.location.ip}</span>}
                  {device && <span className="flex items-center gap-1"><MonitorSmartphone size={10} className="shrink-0" /> {device}</span>}
                </p>
              </div>
              {!joined && (
                <button
                  type="button"
                  onClick={() => void joinConversation()}
                  disabled={joining}
                  className="chat-join-button flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#202225] px-4 text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? <LoaderCircle size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                  {joining ? "Joining…" : "Join"}
                </button>
              )}
            </header>

            {error && <p className="mx-4 mt-3 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11.5px] font-medium text-[#a64a53]">{error}</p>}

            <div ref={scrollRef} onScroll={(event) => { const el = event.currentTarget; stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; }} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto max-w-2xl">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex min-h-[160px] items-center justify-center text-[12px] text-[#7b858a]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading conversation</div>
                ) : messages.length === 0 && justJoined?.conversationId !== selected.id ? (
                  <div className="flex min-h-[160px] items-center justify-center text-[12px] text-[#7b858a]">No messages yet.</div>
                ) : (
                  <div className="space-y-5">
                    {justJoined?.conversationId === selected.id && justJoined.afterCount === 0 && <TakeoverBanner aiName={aiName} />}
                    {groupMessages(messages).map((group) => {
                      // Join/leave notices and secure-handover events are
                      // thread events, not messages — a centered rule, the
                      // same as the Inbox and the customer's own widget.
                      if (group.kind === "system") {
                        return (
                          <div key={group.key} className="chat-system-notice flex items-center gap-3 py-1 text-[11px]">
                            <span className="whitespace-nowrap">{group.messages[0].body}</span>
                          </div>
                        );
                      }

                      const isTeam = group.senderType !== "customer";
                      const isAi = group.senderType === "ai";
                      const lastIndex = messages.findIndex((item) => item.id === group.messages[group.messages.length - 1].id);

                      return (
                        <div key={group.key}>
                          <div className={`flex gap-3 ${isTeam ? "flex-row-reverse" : ""}`}>
                            {isAi && botAvatar ? (
                              <img src={botAvatar} alt={aiName} title={aiName} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                            ) : (
                              <span
                                title={isTeam ? (isAi ? aiName : "You") : selected.name}
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isTeam ? "chat-avatar-team" : "chat-avatar-customer"}`}
                              >
                                {isTeam ? (isAi ? (aiName.charAt(0).toUpperCase() || "A") : "Y") : selected.initials}
                              </span>
                            )}
                            <div className={`min-w-0 max-w-[76%] ${isTeam ? "text-right" : ""}`}>
                              <div className="space-y-1.5">
                                {group.messages.map((message) => (
                                  <div
                                    key={message.id}
                                    title={new Date(message.createdAt).toLocaleString()}
                                    className={`chat-line text-left text-[13.5px] leading-[1.55] ${isTeam ? "chat-line-team" : "chat-line-customer"}`}
                                  >
                                    <MessageMarkdown text={message.body} />
                                  </div>
                                ))}
                              </div>
                              <p className="mt-1 text-[11px] text-[var(--chat-muted)]">
                                {formatTime(group.messages[group.messages.length - 1].createdAt)}
                              </p>
                            </div>
                          </div>
                          {justJoined?.conversationId === selected.id && justJoined.afterCount === lastIndex + 1 && (
                            <div className="mt-5"><TakeoverBanner aiName={aiName} /></div>
                          )}
                        </div>
                      );
                    })}
                    {customerTyping && (
                      <div className="flex gap-3">
                        <span className="chat-avatar-customer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">{selected.initials}</span>
                        <div className="py-1"><TypingDots color="currentColor" /></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-ai-composer shrink-0 border-t border-white/10 p-4">
              {joined ? (
                <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-[var(--chat-divider)] px-3 py-2 focus-within:border-[var(--chat-line-text)]">
                  <input
                    value={draft}
                    onChange={(event) => { setDraft(event.target.value); notifyTyping(); }}
                    onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }}
                    placeholder="Write your reply…"
                    className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9aa2ac]"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={!draft.trim() || sending}
                    aria-label="Send message"
                    className="chat-action-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed"
                  >
                    {sending ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              ) : (
                <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dde2e7] bg-[#f7f8f9] px-3 py-3 text-[12.5px] text-[#74808c]">
                  Join this conversation to reply — until then, {aiName || "your AI"} keeps talking to the customer.
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {selected && (
        <aside className="dashboard-ai-details hidden w-[310px] shrink-0 flex-col border-l border-white/10 bg-[#262626] xl:flex">
          <div className="border-b border-[#e2e5e8] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: colorForId(selected.id) }}>
                {selected.initials}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-[15px] font-bold text-[#183252]">{selected.name}</h2>
                  {selected.verified && (
                    <span title="Proved their identity — signed in, or confirmed with a code" className="flex shrink-0 items-center gap-1 rounded-full bg-[#edf7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e8a5c]">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] font-medium opacity-70">Website visitor</p>
              </div>
            </div>
            {(selected.email || selected.phone || selected.topic) && (
              <div className="dashboard-contact-card mt-4 space-y-1.5 rounded-lg p-3 text-[12px]">
                {selected.topic && <p><span className="font-semibold">Topic: </span>{selected.topic}</p>}
                {selected.email && <p className="truncate"><span className="font-semibold">Email: </span>{selected.email}</p>}
                {selected.phone && <p><span className="font-semibold">Phone: </span>{selected.phone}</p>}
              </div>
            )}
          </div>

          {/* Same "Location & device" detail the Inbox shows — this used to
              stop at a one-line chip in the header, which lost the IP and
              the exact last-seen time that a support agent actually needs
              when they are looking something up. */}
          <div className="border-b border-[#e2e5e8] p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa2ac]">Location & device</p>
            {place || selected.location?.ip || device ? (
              <div className="space-y-2.5">
                {place && (
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-[#9aa2ac]" />
                    <span className="min-w-0 text-[12px] leading-5 text-[#34445a]">{place}</span>
                  </div>
                )}
                {selected.location?.ip && (
                  <div className="flex items-start gap-2">
                    <Globe size={13} className="mt-0.5 shrink-0 text-[#9aa2ac]" />
                    <span className="min-w-0 break-words text-[12px] leading-5 text-[#34445a]">{selected.location.ip}</span>
                  </div>
                )}
                {device && (
                  <div className="flex items-start gap-2">
                    <MonitorSmartphone size={13} className="mt-0.5 shrink-0 text-[#9aa2ac]" />
                    <span className="min-w-0 text-[12px] leading-5 text-[#34445a]">{device}</span>
                  </div>
                )}
                {selected.location?.seenAt && (
                  <p className="pt-0.5 text-[10.5px] text-[#9aa2ac]">
                    Last seen {new Date(selected.location.seenAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              // Said plainly rather than left blank: locally, and without a
              // CDN resolving visitor geo, there is genuinely nothing here.
              <p className="text-[11.5px] leading-5 text-[#9aa2ac]">
                No location recorded for this visitor yet.
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa2ac]">Other conversations</p>
            {pastConversations.length === 0 ? (
              <p className="text-[11.5px] text-[#9aa2ac]">No other conversations from this visitor yet.</p>
            ) : (
              <div className="space-y-1">
                {pastConversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setSelectedId(item.id); setJustJoined(null); }}
                    className="dashboard-chat-row block w-full rounded-lg px-2.5 py-2 text-left"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#34445a]">{item.preview || "New conversation"}</span>
                      <span className="shrink-0 text-[9px] text-[#969ea7]">{formatListTime(item.time)}</span>
                    </span>
                    {item.status === "resolved" && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[#32a880]"><CheckCheck size={11} /> Resolved</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
