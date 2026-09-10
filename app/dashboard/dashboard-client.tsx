"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  Eye,
  Globe,
  Globe2,
  Info,
  LoaderCircle,
  Lock,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  TicketPlus,
  UserRound,
  X,
} from "lucide-react";
import { BRAND_GRADIENT } from "@/lib/gradient";
import MessageMarkdown from "@/app/components/MessageMarkdown";
import TypingDots from "@/app/components/TypingDots";
import {
  DEFAULT_BOT_AVATAR,
  formatDevice,
  formatPlace,
  formatTime,
  groupMessages,
  type Message,
  type VisitorLocation,
} from "@/app/dashboard/lib/conversation";

type ConversationSummary = {
  id: string;
  name: string;
  initials: string;
  email?: string | null;
  phone?: string | null;
  topic?: string | null;
  status: "open" | "waiting" | "resolved";
  handledBy?: string;
  escalationReason?: string | null;
  escalationSummary?: string | null;
  assignedUserId?: string | null;
  location?: VisitorLocation;
  /** The bot's name and face as configured for the widget this thread came through. */
  aiName?: string;
  aiAvatarUrl?: string | null;
};
type CreatedTicket = { provider: string; id: string; url: string | null; title: string };
type SecureRequest = {
  id: string;
  label: string;
  status: "pending" | "submitted" | "revealed" | "expired";
  createdAt: string;
  submittedAt: string | null;
  revealedAt: string | null;
  expiresAt: string;
};

const POLL_MS = 2000;
const TYPING_PING_MS = 2000;

// Attachments travel as data URIs, exactly as the widget sends them, so the
// ceiling has to sit under the services' 8 MB body-parser limit with room for
// base64's ~33% overhead.
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const EMOJI = ["👍", "🙏", "😊", "🎉", "✅", "👀", "🔥", "💡", "⚠️", "❤️", "😅", "🤔", "👋", "🚀", "📎", "⏳"];

function DetailSection({
  title,
  children,
  collapsed: initiallyCollapsed = false,
}: {
  title: string;
  children?: React.ReactNode;
  collapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  return (
    <section className="border-b border-[var(--chat-divider)]">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        className="flex h-12 w-full items-center px-4 text-left text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]"
      >
        <span className="flex-1">{title}</span>
        {collapsed ? <ChevronRight size={16} className="text-[var(--chat-muted)]" /> : <ChevronDown size={16} className="text-[var(--chat-muted)]" />}
      </button>
      {!collapsed && <div className="space-y-3 px-5 pb-4 text-[13px]">{children}</div>}
    </section>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[var(--chat-muted)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--chat-muted)]">{label}</span>
        <span className="mt-0.5 block break-words text-[12.5px]">{value}</span>
      </span>
    </div>
  );
}

// Escalation summaries come from the AI's own handoff call — for a
// conversation with barely anything said yet, it sometimes has nothing to
// synthesize and just formats the raw exchange as "ai: ... customer: ..."
// turns instead of prose. That's not a summary, it's the transcript again,
// and showing it as one reads as duplicated content since the same lines
// are already visible above it.
const TRANSCRIPT_LINE = /^(ai|agent|customer):/im;
function looksLikeTranscriptDump(text: string): boolean {
  const matches = text.match(new RegExp(TRANSCRIPT_LINE, "gim"));
  return (matches?.length ?? 0) >= 2;
}

function DashboardContent({ name }: { name: string }) {
  const conversationId = useSearchParams().get("conversation");
  const [conversation, setConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [ticketState, setTicketState] = useState<"idle" | "creating">("idle");
  const [ticket, setTicket] = useState<CreatedTicket | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [myAccountId, setMyAccountId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const [secureRequests, setSecureRequests] = useState<SecureRequest[]>([]);
  const [revealed, setRevealed] = useState<{ id: string; label: string; secret: string } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unclaiming, setUnclaiming] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  // null = not checked yet, so the plain "pick a conversation" state never
  // flashes for a brand-new workspace before this resolves.
  const [hasAnyConversations, setHasAnyConversations] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingPingRef = useRef(0);

  // Only matters for the empty state (see the !conversationId branch below),
  // so it's skipped once something is actually open — no point re-asking
  // "does this workspace have any chats" while reading one.
  useEffect(() => {
    if (conversationId || hasAnyConversations !== null) return;
    let cancelled = false;
    fetch("/api/workspace/conversations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { conversations?: unknown[] } | null) => {
        if (!cancelled) setHasAnyConversations((data?.conversations?.length ?? 0) > 0);
      })
      .catch(() => {
        if (!cancelled) setHasAnyConversations(true); // unknown — don't claim the workspace is empty
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId, hasAnyConversations]);

  useEffect(() => {
    if (!conversationId) { setConversation(null); setMessages([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setTicket(null);
    setTicketError(null);
    setSearchOpen(false);
    setSearchQuery("");
    setSummary(null);
    setSummaryError(null);

    function load() {
      Promise.all([
        fetch("/api/workspace/conversations", { cache: "no-store" }).then((response) => (response.ok ? response.json() : { conversations: [] })),
        fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId!)}/messages`, { cache: "no-store" }).then((response) => (response.ok ? response.json() : { messages: [] })),
      ]).then(([conversationsData, messagesData]: [{ conversations?: ConversationSummary[] }, { messages?: Message[]; customerTyping?: boolean }]) => {
        if (cancelled) return;
        setConversation(conversationsData.conversations?.find((item) => item.id === conversationId) ?? null);
        setMessages(messagesData.messages ?? []);
        setCustomerTyping(!!messagesData.customerTyping);
      }).finally(() => { if (!cancelled) setLoading(false); });
    }

    load();
    void loadSecureRequests();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [conversationId]);

  // Keyed on the last message's id + count rather than the `messages` array
  // itself: polling replaces that array with a new reference every 2s even
  // when nothing changed, which used to yank the view back to the bottom
  // over and over — impossible to read anything after scrolling up. This
  // only re-fires when a message genuinely arrives (or leaves, e.g. on
  // switching conversations).
  const lastMessageKey = `${messages.length}:${messages[messages.length - 1]?.id ?? ""}`;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageKey, customerTyping]);

  // Needed to tell "assigned to me" from "assigned to a teammate" — the
  // conversation only carries an id, and the two states offer very different
  // actions.
  useEffect(() => {
    fetch("/api/account", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: { id?: string } } | null) => setMyAccountId(data?.account?.id ?? null))
      .catch(() => setMyAccountId(null));
  }, []);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingPingRef.current < TYPING_PING_MS || !conversationId) return;
    lastTypingPingRef.current = now;
    fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/typing`, { method: "POST" }).catch(() => undefined);
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || sending || !conversationId) return;
    setSending(true);
    setDraft("");
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/messages`, {
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

  /**
   * Sends a file as a data URI, matching how the widget sends the visitor's
   * attachments. Crude compared with object storage, but consistent with what
   * already exists, and the alternative is a storage backend this product
   * does not have yet.
   */
  async function attachFile(file: File) {
    if (!conversationId || sending) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setTicketError(`${file.name} is larger than 5 MB.`);
      return;
    }
    setSending(true);
    setTicketError(null);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file."));
        reader.readAsDataURL(file);
      });

      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: draft.trim(),
          attachment: { url, type: file.type.startsWith("image/") ? "image" : "file", name: file.name },
        }),
      });
      const data = (await response.json()) as { message?: Message; message_?: string };
      if (data.message) {
        setMessages((current) => [...current, data.message as Message]);
        setDraft("");
      }
    } catch (issue) {
      setTicketError(issue instanceof Error ? issue.message : "Could not attach that file.");
    } finally {
      setSending(false);
    }
  }

  /**
   * Takes the thread. The server posts "<name> joined the chat" into the
   * conversation, which the customer sees in their widget and which shows up
   * here on the next poll — so the act of joining is visible to both sides
   * rather than being a silent state change in a database.
   */
  async function joinConversation() {
    if (!conversationId || joining) return;
    setJoining(true);
    setTicketError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/claim`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setTicketError(data.message ?? "Could not join this conversation.");
        return;
      }
      setConversation((current) => (current ? { ...current, assignedUserId: myAccountId, handledBy: "human" } : current));
    } finally {
      setJoining(false);
    }
  }

  /**
   * Closes the conversation. Posts "<name> marked this conversation as
   * resolved" into the thread — the same notice the AI leaves when it closes
   * one itself. Nothing here has to remember to reopen it later: the next
   * message from anyone flips status back to "open" on the server, so a
   * resolution that turns out to be premature corrects itself.
   */
  async function resolveConversation() {
    if (!conversationId || resolving || conversation?.status === "resolved") return;
    setResolving(true);
    setTicketError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/resolve`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setTicketError(data.message ?? "Could not resolve this conversation.");
        return;
      }
      setConversation((current) => (current ? { ...current, status: "resolved" } : current));
    } finally {
      setResolving(false);
    }
  }

  function insertEmoji(emoji: string) {
    setDraft((current) => current + emoji);
    setEmojiOpen(false);
  }

  /** Hands the thread back — to the AI, unless it was escalated (the server enforces that, not this). */
  async function unclaimConversation() {
    if (!conversationId || unclaiming) return;
    setUnclaiming(true);
    setMoreOpen(false);
    setTicketError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/unclaim`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setTicketError(data.message ?? "Could not hand this conversation back.");
        return;
      }
      setConversation((current) => (current ? { ...current, assignedUserId: null } : current));
    } finally {
      setUnclaiming(false);
    }
  }

  /**
   * One-shot summary for a teammate skimming a long thread — not a
   * resolution, so it never touches the plan's AI-resolution allowance (see
   * AgentService.summarizeConversation on the backend).
   */
  async function summarizeConversation() {
    if (!conversationId || summarizing) return;
    setSummarizing(true);
    setSummary(null);
    setSummaryError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/summarize`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { summary?: string; message?: string };
      if (!response.ok || !data.summary) {
        setSummaryError(data.message ?? "Could not summarize this conversation.");
        return;
      }
      setSummary(data.summary);
    } finally {
      setSummarizing(false);
    }
  }

  async function loadSecureRequests() {
    if (!conversationId) return;
    const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/secure`, { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { requests?: SecureRequest[] };
    setSecureRequests(data.requests ?? []);
  }

  async function createSecureRequest(label: string) {
    if (!conversationId || !label.trim()) return;
    const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/secure`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setTicketError(data.message ?? "Could not create the request.");
      return;
    }
    await loadSecureRequests();
  }

  /**
   * The one permitted read. What comes back is held in component state and
   * nowhere else — not localStorage, not the URL, not the conversation — and
   * the server has already destroyed its copy by the time this resolves.
   */
  async function revealSecret(request: SecureRequest) {
    if (!conversationId) return;
    const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/secure/reveal`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId: request.id }),
    });
    const data = (await response.json().catch(() => ({}))) as { secret?: string; label?: string; message?: string };
    if (!response.ok || !data.secret) {
      setTicketError(data.message ?? "Could not open this request.");
      return;
    }
    setRevealed({ id: request.id, label: data.label ?? request.label, secret: data.secret });
    await loadSecureRequests();
  }

  async function createTicket() {
    if (!conversationId || ticketState === "creating") return;
    setTicketState("creating");
    setTicketError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/ticket`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await response.json()) as { ticket?: CreatedTicket; message?: string };
      if (!response.ok || !data.ticket) throw new Error(data.message ?? "Could not create the ticket.");
      setTicket(data.ticket);
    } catch (issue) {
      setTicketError(issue instanceof Error ? issue.message : "Could not create the ticket.");
    } finally {
      setTicketState("idle");
    }
  }

  if (!conversationId) {
    // A brand-new workspace with zero conversations anywhere gets a real
    // welcome instead of "pick a conversation" pointing at an empty list —
    // that instruction is only useful once there's something to pick.
    if (hasAnyConversations === false) {
      return (
        <div className="dashboard-page-surface dashboard-conversation flex h-full min-w-0 flex-col items-center justify-center overflow-y-auto px-8 py-10 text-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-[0_16px_36px_-14px_rgba(168,85,247,0.55)]"
            style={{ backgroundImage: BRAND_GRADIENT }}
          >
            <Sparkles size={26} />
          </span>
          <h1 className="mt-5 text-[22px] font-semibold tracking-[-0.02em]">Welcome to your inbox</h1>
          <p className="mt-2 max-w-sm text-[13px] leading-5 text-[var(--chat-muted)]">
            It&apos;s quiet in here — once your AI or a teammate handles a customer chat, it&apos;ll show up on the left.
            A few minutes on these get you ready for the first one:
          </p>

          <div className="mt-7 grid w-full max-w-[560px] gap-3 sm:grid-cols-3">
            {[
              { href: "/dashboard/settings/chatbot", icon: Bot, label: "Set up your AI", detail: "Name, look and tone" },
              { href: "/dashboard/knowledge", icon: BookOpen, label: "Add knowledge", detail: "What it should know" },
              { href: "/dashboard/connect", icon: Globe2, label: "Connect your site", detail: "Where chats come from" },
            ].map(({ href, icon: Icon, label, detail }) => (
              <a
                key={href}
                href={href}
                className="dashboard-welcome-card group flex flex-col items-start gap-2.5 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-customer-bg)] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(15,18,22,0.35)]"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundImage: BRAND_GRADIENT }}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold">
                    {label}
                    <ArrowRight size={12} className="shrink-0 text-[var(--chat-muted)] transition group-hover:translate-x-0.5 group-hover:text-current" />
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-[var(--chat-muted)]">{detail}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-page-surface dashboard-conversation flex h-full min-w-0 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--chat-customer-bg)] text-[var(--chat-customer-text)]"><MessageCircle size={24} /></span>
        <h1 className="mt-5 text-[20px] font-semibold tracking-[-0.02em]">Pick a conversation</h1>
        <p className="mt-2 max-w-sm text-[13px] leading-5 text-[var(--chat-muted)]">Select a chat from the list on the left to see the conversation.</p>
      </div>
    );
  }

  const initial = (name || "You").charAt(0).toUpperCase();
  const customerInitials = conversation?.initials ?? "?";
  const customerName = conversation?.name ?? "Customer";
  const aiName = conversation?.aiName?.trim() || "AI";
  // Mirrors the widget's own fallback (api/widget/start) so a workspace that
  // never picked an avatar still shows the icon its visitors actually see.
  const aiAvatarUrl = conversation?.aiAvatarUrl || DEFAULT_BOT_AVATAR;
  const isMine = !!myAccountId && conversation?.assignedUserId === myAccountId;
  const assignedElsewhere = !!conversation?.assignedUserId && conversation.assignedUserId !== myAccountId;
  const place = formatPlace(conversation?.location);
  const device = formatDevice(conversation?.location?.userAgent);
  const ip = conversation?.location?.ip ?? null;
  // Text-only, against what's already loaded — no reason to round-trip to
  // the server for a search over a few dozen messages already in memory.
  const searchTerm = searchQuery.trim().toLowerCase();
  const visibleMessages = searchTerm ? messages.filter((message) => message.body.toLowerCase().includes(searchTerm)) : messages;

  return (
    <div className="dashboard-page-surface dashboard-conversation flex h-full min-w-0">
      {/* The only place the value is ever visible. It exists in this
          component's state and nowhere else — the server destroyed its copy
          before this rendered, so closing the panel loses it for good, and
          the copy is the agent's one chance to keep it. */}
      {revealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--chat-surface)] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--chat-customer-bg)]">
                <ShieldCheck size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-semibold">{revealed.label}</h2>
                <p className="mt-1 text-[12px] leading-5 text-[var(--chat-muted)]">
                  This has been destroyed on the server. Copy it now — it cannot be shown again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevealed(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 opacity-70 hover:opacity-100"
              >
                <X size={17} />
              </button>
            </div>

            <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[var(--chat-divider)] bg-[var(--chat-customer-bg)] p-3.5 font-mono text-[12.5px] leading-5">
              {revealed.secret}
            </pre>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(revealed.secret)}
                className="chat-action-primary flex h-10 flex-1 items-center justify-center rounded-lg text-[13px] font-semibold"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setRevealed(null)}
                className="h-10 rounded-lg border border-[var(--chat-divider)] px-4 text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col border-r border-[var(--chat-divider)] bg-[var(--chat-surface)]">
        <header className="flex h-[58px] shrink-0 items-center border-b border-[var(--chat-divider)] px-4">
          <span className="chat-avatar-customer relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold">
            {customerInitials}
            <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--chat-surface)] bg-[#35b92c]" />
          </span>
          <div className="ml-3 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold">{customerName}</h1>
              {conversation && (
                <span className="rounded-full border border-[var(--chat-divider)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-muted)]">
                  {conversation.status.toUpperCase()}
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--chat-muted)]">
              {place ? <><MapPin size={11} className="shrink-0" /> {place}</> : "Customer support"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {/* Joining is the act that takes a thread off the AI and puts a
                named person on it, so it is the primary thing to do from
                here until it has happened. */}
            {!isMine && (
              <button
                type="button"
                onClick={() => void joinConversation()}
                disabled={joining}
                title="Take this conversation and reply yourself"
                className="chat-action-primary flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[12.5px] font-semibold"
              >
                {joining ? <LoaderCircle size={15} className="animate-spin" /> : <UserRound size={15} />}
                {joining ? "Joining…" : assignedElsewhere ? "Take over" : "Join chat"}
              </button>
            )}
            {isMine && (
              <span className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--chat-divider)] px-3 text-[12px] font-semibold text-[var(--chat-muted)]">
                <UserRound size={14} /> You&apos;re handling this
              </span>
            )}
            <button
              type="button"
              onClick={() => void createTicket()}
              disabled={ticketState === "creating"}
              title="Create a ticket in your connected project tool"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--chat-divider)] px-3 text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)] disabled:opacity-60"
            >
              {ticketState === "creating" ? <LoaderCircle size={15} className="animate-spin" /> : <TicketPlus size={15} />}
              Ticket
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => { if (open) setSearchQuery(""); return !open; })}
              aria-label="Search conversation"
              aria-pressed={searchOpen}
              className={`rounded-lg p-2 hover:bg-[var(--chat-customer-bg)] hover:opacity-100 ${searchOpen ? "opacity-100 bg-[var(--chat-customer-bg)]" : "opacity-70"}`}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-label="Conversation details"
              aria-pressed={detailsOpen}
              title="Visitor location, secure requests, and history"
              className={`rounded-lg p-2 hover:bg-[var(--chat-customer-bg)] hover:opacity-100 xl:hidden ${detailsOpen ? "opacity-100 bg-[var(--chat-customer-bg)]" : "opacity-70"}`}
            >
              <Info size={18} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-label="More actions"
                aria-pressed={moreOpen}
                className={`rounded-lg p-2 hover:bg-[var(--chat-customer-bg)] hover:opacity-100 ${moreOpen ? "opacity-100 bg-[var(--chat-customer-bg)]" : "opacity-70"}`}
              >
                <MoreHorizontal size={19} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] py-1 shadow-[0_16px_40px_-20px_rgba(15,18,22,0.45)]">
                    <button
                      type="button"
                      onClick={() => { setMoreOpen(false); setSecureOpen(true); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] hover:bg-[var(--chat-customer-bg)]"
                    >
                      <Lock size={15} /> Request private info
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Sits next to Resolve rather than tucked in the "..." menu —
                it's the other half of "how do I stop handling this thread",
                and needed just as often (auto-assigned to someone who can't
                take it right now, not just a thread someone deliberately
                claimed and finished). */}
            {conversation?.assignedUserId && (
              <button
                type="button"
                disabled={unclaiming}
                onClick={() => void unclaimConversation()}
                title="Hand this thread back — to the AI, unless it was escalated"
                className="ml-2 flex h-9 items-center gap-1.5 rounded-lg border border-[var(--chat-divider)] px-3 text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)] disabled:opacity-60"
              >
                {unclaiming ? <LoaderCircle size={15} className="animate-spin" /> : <UserRound size={15} />}
                Hand back
              </button>
            )}
            <button
              type="button"
              onClick={() => void resolveConversation()}
              disabled={resolving || conversation?.status === "resolved"}
              title={conversation?.status === "resolved" ? "This conversation is already resolved" : "Mark this conversation as resolved"}
              className="chat-action-primary ml-2 flex h-9 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold disabled:opacity-50"
            >
              {resolving ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {conversation?.status === "resolved" ? "Resolved" : resolving ? "Resolving…" : "Resolve"}
            </button>
          </div>
        </header>

        {(ticket || ticketError) && (
          <div
            role="status"
            className="flex shrink-0 items-center gap-2 border-b border-[var(--chat-divider)] px-5 py-2.5 text-[12.5px]"
          >
            {ticket ? (
              <>
                <TicketPlus size={14} className="shrink-0" />
                <span>
                  Ticket created in {ticket.provider}
                  {ticket.url && (
                    <>
                      {" — "}
                      <a href={ticket.url} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">
                        open it
                      </a>
                    </>
                  )}
                </span>
              </>
            ) : (
              <span className="text-[#c0554f]">{ticketError}</span>
            )}
            <button
              type="button"
              onClick={() => { setTicket(null); setTicketError(null); }}
              className="ml-auto text-[11px] font-medium text-[var(--chat-muted)] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {searchOpen && (
            <div className="flex shrink-0 items-center gap-2 border-b border-[var(--chat-divider)] px-5 py-2.5">
              <Search size={15} className="shrink-0 text-[var(--chat-muted)]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search this conversation…"
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--chat-muted)]"
              />
              {searchTerm && (
                <span className="shrink-0 text-[11px] text-[var(--chat-muted)]">
                  {visibleMessages.length} of {messages.length}
                </span>
              )}
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                aria-label="Close search"
                className="shrink-0 rounded-md p-1 text-[var(--chat-muted)] hover:bg-[var(--chat-customer-bg)]"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto max-w-3xl">
              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center text-[12px] text-[var(--chat-muted)]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading conversation</div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center text-[12px] text-[var(--chat-muted)]">No messages yet.</div>
              ) : searchTerm && visibleMessages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center text-[12px] text-[var(--chat-muted)]">No messages match &quot;{searchQuery.trim()}&quot;.</div>
              ) : (
                <div className="space-y-4">
                  {groupMessages(visibleMessages).map((group) => {
                    // A teammate joining or leaving is a thread event, not
                    // something anyone said — a centered rule, never a row
                    // with an avatar and an author.
                    if (group.kind === "system") {
                      return (
                        <div key={group.key} className="chat-system-notice flex items-center gap-3 py-1 text-[11px]">
                          <span className="whitespace-nowrap">{group.messages[0].body}</span>
                        </div>
                      );
                    }

                    const isTeam = group.senderType !== "customer";
                    const isAi = group.senderType === "ai";

                    return (
                      <div key={group.key} className={`flex gap-3 ${isTeam ? "flex-row-reverse" : ""}`}>
                        {/* The AI wears the same face the visitor sees in the
                            widget — the avatar the workspace picked, not a
                            generic glyph — so an agent reading the thread
                            recognises it as the bot their customers meet. */}
                        {isAi && aiAvatarUrl ? (
                          <img
                            src={aiAvatarUrl}
                            alt={aiName}
                            title={aiName}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            title={isTeam ? (isAi ? aiName : name || "You") : customerName}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isTeam ? "chat-avatar-team" : "chat-avatar-customer"}`}
                          >
                            {isTeam ? (isAi ? aiName.charAt(0).toUpperCase() || "A" : initial) : customerInitials}
                          </span>
                        )}
                        <div className={`min-w-0 max-w-[76%] ${isTeam ? "text-right" : ""}`}>
                          <div className="space-y-1.5">
                            {group.messages.map((message) => (
                              <div key={message.id} className="space-y-1.5">
                                {message.attachmentUrl && (message.attachmentType === "image" || message.attachmentType === "gif") && (
                                  <img src={message.attachmentUrl} alt={message.attachmentName ?? ""} className={`max-h-52 w-auto rounded-2xl object-cover ${isTeam ? "ml-auto" : ""}`} />
                                )}
                                {message.attachmentUrl && message.attachmentType === "file" && (
                                  <a
                                    href={message.attachmentUrl}
                                    download={message.attachmentName ?? "file"}
                                    // An attachment still needs an edge to be
                                    // clickable, so it keeps a container even
                                    // where plain text does not.
                                    className={`inline-flex items-center gap-2 rounded-xl border border-[var(--chat-divider)] px-3 py-2 text-[12.5px] font-medium ${isTeam ? "ml-auto" : ""}`}
                                  >
                                    <Paperclip size={14} className="shrink-0" />
                                    <span className="max-w-[220px] truncate">{message.attachmentName ?? "Attachment"}</span>
                                  </a>
                                )}
                                {message.body && (
                                  // No bubble on either side: the avatar and
                                  // the author line already say who is
                                  // talking, so a filled panel behind every
                                  // sentence is decoration that makes long
                                  // answers harder to read, not easier. The
                                  // exact time lives on hover.
                                  <div
                                    title={new Date(message.createdAt).toLocaleString()}
                                    className={`chat-line text-left text-[13.5px] leading-[1.55] ${isTeam ? "chat-line-team" : "chat-line-customer"}`}
                                  >
                                    <MessageMarkdown text={message.body} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {/* One timestamp, under the run it belongs to. The
                              avatar already says who is speaking, so naming
                              them again above every group was the same fact
                              twice. */}
                          <p className="mt-1 text-[11px] text-[var(--chat-muted)]">
                            {formatTime(group.messages[group.messages.length - 1].createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {customerTyping && (
                    <div className="flex items-center gap-3">
                      <span className="chat-avatar-customer flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">{customerInitials}</span>
                      <div className="py-1">
                        <TypingDots color="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {conversation?.escalationSummary && !looksLikeTranscriptDump(conversation.escalationSummary) && (
                <div className="mt-7 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-customer-bg)] p-4">
                  <p className="text-xs font-semibold">Handoff notes</p>
                  {conversation.escalationReason && <p className="mt-2 text-[13px] font-medium">{conversation.escalationReason}</p>}
                  <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6">{conversation.escalationSummary}</p>
                </div>
              )}
              {summary ? (
                <div className="mt-7 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-customer-bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold"><Sparkles size={13} /> Summary</p>
                    <button type="button" onClick={() => setSummary(null)} aria-label="Dismiss summary" className="rounded-md p-1 text-[var(--chat-muted)] hover:bg-[var(--chat-divider)]">
                      <X size={13} />
                    </button>
                  </div>
                  <p className="mt-2 text-[13px] leading-6">{summary}</p>
                </div>
              ) : (
                <div className="mt-7 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    disabled={summarizing || messages.length === 0}
                    onClick={() => void summarizeConversation()}
                    className="flex items-center gap-2 rounded-full border border-[var(--chat-divider)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--chat-customer-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {summarizing ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {summarizing ? "Summarizing…" : "Summarize with AI"}
                  </button>
                  {summaryError && <p className="text-[11px] text-[#c0554f]">{summaryError}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="relative shrink-0 px-5 pb-4">
            {emojiOpen && (
              <div className="absolute bottom-full left-5 z-10 mb-2 w-[268px] rounded-xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] p-2 shadow-[0_16px_40px_-20px_rgba(15,18,22,0.45)]">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJI.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="rounded-lg p-1.5 text-[17px] leading-none hover:bg-[var(--chat-customer-bg)]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border-[3px] border-[var(--chat-team-bg)] bg-[var(--chat-team-bg)]">
              <div className="rounded-xl bg-[var(--chat-surface)]">
              <textarea
                value={draft}
                onChange={(event) => { setDraft(event.target.value); notifyTyping(); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Write your reply to the customer, press 'space' for AI, '/' for commands"
                className="h-[58px] w-full resize-none bg-transparent px-6 pb-1 pt-4 text-[13px] outline-none placeholder:text-[var(--chat-muted)]"
              />
              {/* Only actions with something behind them. The previous row
                  carried eleven icons — mention, participants, video, voice,
                  documents, an overflow menu — none of which were wired to
                  anything. A control that does nothing when clicked is worse
                  than an absent one: it teaches people the tool is broken. */}
              <div className="flex h-12 items-center gap-1 px-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    // Reset first: picking the same file twice in a row
                    // otherwise fires no change event at all.
                    event.target.value = "";
                    if (file) void attachFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach a file or image"
                  title="Attach a file or image"
                  className="p-1.5 opacity-70 hover:opacity-100"
                >
                  <Paperclip size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setEmojiOpen((open) => !open)}
                  aria-label="Insert emoji"
                  aria-expanded={emojiOpen}
                  title="Insert emoji"
                  className="p-1.5 opacity-70 hover:opacity-100"
                >
                  <Smile size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => void createTicket()}
                  aria-label="Create a ticket about this conversation"
                  title="Create a ticket"
                  className="p-1.5 opacity-70 hover:opacity-100"
                >
                  <TicketPlus size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setSecureOpen(true)}
                  aria-label="Ask the customer for something private"
                  title="Request private information"
                  className="p-1.5 opacity-70 hover:opacity-100"
                >
                  <Lock size={17} />
                </button>
                <span className="ml-auto" />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!draft.trim() || sending}
                  className="chat-action-primary ml-2 flex h-8 items-center overflow-hidden rounded-lg"
                  aria-label="Send message"
                >
                  <span className="flex h-full w-10 items-center justify-center">{sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={17} />}</span>
                  <span className="flex h-5 w-6 items-center justify-center border-l border-current/25"><ChevronDown size={13} /></span>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Below xl this same panel is what the Info button opens — a
          slide-over rather than a flex sibling, so it overlays the
          conversation instead of squeezing it. At xl+ it's always visible
          as a normal sidebar and the Info button that would toggle it is
          hidden, so detailsOpen never matters there. */}
      {detailsOpen && <div className="fixed inset-0 z-30 bg-black/30 xl:hidden" onClick={() => setDetailsOpen(false)} />}
      <aside
        className={`${detailsOpen ? "fixed inset-y-0 right-0 z-40 flex shadow-[-16px_0_40px_rgba(15,18,22,0.18)]" : "hidden"} w-[310px] shrink-0 flex-col bg-[var(--chat-surface)] xl:static xl:z-auto xl:flex xl:shadow-none`}
      >
        <div className="border-b border-[var(--chat-divider)] p-5">
          <div className="flex items-center gap-3">
            <span className="chat-avatar-customer relative flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold">
              {customerInitials}
              <span className="absolute -bottom-px -right-px h-4 w-4 rounded-full border-2 border-[var(--chat-surface)] bg-[#35b92c]" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-bold">{customerName}</h2>
              <p className="mt-1 text-[11px] font-medium text-[var(--chat-muted)]">Website visitor</p>
            </div>
          </div>
          {(conversation?.email || conversation?.phone || conversation?.topic) && (
            <div className="dashboard-contact-card mt-4 space-y-1.5 rounded-lg p-3 text-[12px]">
              {conversation?.topic && (
                <p><span className="font-semibold">Topic: </span>{conversation.topic}</p>
              )}
              {conversation?.email && (
                <p className="truncate"><span className="font-semibold">Email: </span>{conversation.email}</p>
              )}
              {conversation?.phone && (
                <p><span className="font-semibold">Phone: </span>{conversation.phone}</p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => void createTicket()}
            disabled={ticketState === "creating"}
            className="chat-action-primary mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold"
          >
            {ticketState === "creating" ? <LoaderCircle size={16} className="animate-spin" /> : <TicketPlus size={16} />}
            Create ticket
          </button>
          <button type="button" className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--chat-divider)] text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]">
            <UserRound size={16} />
            View customer profile
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DetailSection title="Location & device">
            {place || ip || device ? (
              <div className="space-y-3">
                {place && <DetailRow icon={<MapPin size={14} />} label="Location" value={place} />}
                {ip && <DetailRow icon={<Globe size={14} />} label="IP address" value={ip} />}
                {device && <DetailRow icon={<MonitorSmartphone size={14} />} label="Device" value={device} />}
                {conversation?.location?.seenAt && (
                  <p className="pt-1 text-[11px] text-[var(--chat-muted)]">
                    Last seen {new Date(conversation.location.seenAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              // Said plainly rather than shown as blanks: locally, and on any
              // deployment without a CDN resolving visitor geo, there is
              // genuinely nothing to show and a guess would be worse.
              <p className="text-[12px] leading-5 text-[var(--chat-muted)]">
                No location recorded for this visitor. Geo and IP come from the CDN in front of the
                app — locally, or without visitor location headers enabled, nothing is captured.
              </p>
            )}
          </DetailSection>
          <DetailSection title="Secure requests">
            <div className="space-y-3">
              <p className="text-[12px] leading-5 text-[var(--chat-muted)]">
                Ask for a password, key, or server detail without it landing in the chat history. The
                customer gets a single-use link; you get one look, then it is destroyed.
              </p>
              <SecureRequestForm onCreate={createSecureRequest} open={secureOpen} setOpen={setSecureOpen} />
              {secureRequests.map((request) => (
                <div key={request.id} className="rounded-lg border border-[var(--chat-divider)] p-3">
                  <p className="text-[12.5px] font-medium">{request.label}</p>
                  <p className="mt-1 text-[11px] text-[var(--chat-muted)]">
                    {request.status === "pending"
                      ? "Waiting for the customer"
                      : request.status === "submitted"
                        ? "Ready to open"
                        : request.status === "revealed"
                          ? `Opened${request.revealedAt ? ` ${new Date(request.revealedAt).toLocaleString()}` : ""} · destroyed`
                          : "Expired"}
                  </p>
                  {request.status === "submitted" && (
                    <button
                      type="button"
                      onClick={() => void revealSecret(request)}
                      className="chat-action-primary mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold"
                    >
                      <Eye size={13} /> Open once
                    </button>
                  )}
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="AI report">
            <div className="rounded-lg bg-[var(--chat-customer-bg)] p-3 leading-5">
              <div className="mb-1 flex items-center gap-2 font-semibold"><Sparkles size={15} /> Conversation summary</div>
              {/* This used to be a hardcoded "summaries appear here once the
                  AI has reviewed this conversation" — which never happened,
                  because nothing was bound to it. summarizeConversation()
                  already existed and worked; the section just wasn't wired
                  to it. Prefers the escalation summary the AI wrote when it
                  handed the thread over, since that one exists without
                  anyone having to ask for it. */}
              {summary ?? conversation?.escalationSummary ? (
                <p className="whitespace-pre-wrap">{summary ?? conversation?.escalationSummary}</p>
              ) : (
                <>
                  <p className="text-[var(--chat-muted)]">No summary yet.</p>
                  <button
                    type="button"
                    disabled={summarizing || messages.length === 0}
                    onClick={() => void summarizeConversation()}
                    className="mt-2 flex items-center gap-2 rounded-full border border-[var(--chat-divider)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--chat-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {summarizing ? <LoaderCircle size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {summarizing ? "Summarizing…" : "Summarize with AI"}
                  </button>
                  {summaryError && <p className="mt-1.5 text-[11px] text-[#c0554f]">{summaryError}</p>}
                </>
              )}
            </div>
          </DetailSection>
          <DetailSection title="Shared files" collapsed>
            {/* Was an empty shell. Every attachment already travels on the
                messages this component has loaded, so this needs no fetch —
                it just never read them. */}
            {(() => {
              const attachments = messages.filter((message) => message.attachmentUrl);
              if (!attachments.length) return <p className="text-[var(--chat-muted)]">Nothing shared in this conversation yet.</p>;
              return (
                <div className="space-y-2">
                  {attachments.map((message) => (
                    <a
                      key={message.id}
                      href={message.attachmentUrl ?? "#"}
                      download={message.attachmentName ?? "file"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 rounded-lg border border-[var(--chat-divider)] px-3 py-2 hover:bg-[var(--chat-customer-bg)]"
                    >
                      {message.attachmentType === "image" || message.attachmentType === "gif" ? (
                        <img src={message.attachmentUrl ?? ""} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                      ) : (
                        <Paperclip size={14} className="shrink-0 text-[var(--chat-muted)]" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[12.5px]">{message.attachmentName ?? "Attachment"}</span>
                    </a>
                  ))}
                </div>
              );
            })()}
          </DetailSection>
          <DetailSection title="Other conversations" collapsed />
        </div>
      </aside>
    </div>
  );
}

/**
 * Asks for one thing at a time. The label is what the customer sees, so it
 * has to be specific enough that they know what to paste — "your password" is
 * a worse prompt than "the SSH password for app-prod-01".
 */
function SecureRequestForm({
  onCreate,
  open,
  setOpen,
}: {
  onCreate: (label: string) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--chat-divider)] text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)]"
      >
        <Lock size={14} /> Request private info
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="e.g. SSH password for app-prod-01"
        maxLength={120}
        className="h-9 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-3 text-[12.5px] outline-none focus:border-[var(--chat-line-text)]"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!label.trim() || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onCreate(label.trim());
              setLabel("");
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
          className="chat-action-primary flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold"
        >
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Lock size={13} />} Send link
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setLabel(""); }}
          className="h-9 rounded-lg border border-[var(--chat-divider)] px-3 text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function DashboardClient({ name }: { name: string }) {
  return (
    <Suspense fallback={<div className="dashboard-conversation flex h-full items-center justify-center text-[12px] text-[var(--chat-muted)]">Loading…</div>}>
      <DashboardContent name={name} />
    </Suspense>
  );
}
