"use client";

import { ChatSkeleton } from "@/app/components/dashboard/DashboardSkeleton";
import { fetchConversations } from "@/app/lib/fetch-conversations";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Eye,
  Globe,
  Globe2,
  Inbox,
  Info,
  LayoutGrid,
  ListChecks,
  Loader2,
  LoaderCircle,
  Lock,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mail,
  Mic,
  MicOff,
  MonitorSmartphone,
  MoreHorizontal,
  Paperclip,
  Phone,
  PhoneOff,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  TicketPlus,
  UserRound,
  X,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/app/dashboard/settings/languages";
import { inboxListHref, parseInboxView, shortAge } from "@/app/components/dashboard/inbox-list-ui";
import { useAgentCall } from "@/app/dashboard/lib/use-agent-call";
import { formatTalkTime } from "@/lib/webrtc-call";
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
  /** The visitor left (Leave Chat, or 24 hours quiet) and can't see this thread any more. */
  visitorLeft?: boolean;
  /** A reply can still reach them by email: they have a verified address. */
  canEmailVisitor?: boolean;
  /** Proved this is really them (signed in, or confirmed a code) — not just a typed-in name/email. */
  verified?: boolean;
  location?: VisitorLocation;
  /** Pages of the customer's site the visitor was on while chatting, newest last. */
  visitorPages?: { path: string; title: string | null; at: string }[];
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

// How recently a visitor has to have been seen (Customer.lastSeenAt, bumped
// on widget activity) to count as "online" on their profile card. There's no
// live presence socket for visitors, so this is a proxy — long enough that
// the 2s conversation poll doesn't flicker it, short enough that it stops
// claiming "online" once someone's actually gone.
const VISITOR_ONLINE_WINDOW_MS = 2 * 60 * 1000;

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
    <section className="dashboard-detail-section border-b border-[var(--chat-divider)]">
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

// Where the visitor is on the customer's site: the page they are on now, and the
// few before it. Plain text only (the path and title come from the visitor's
// browser); the query string is never kept.
function VisitorPages({ pages }: { pages: { path: string; title: string | null; at: string }[] }) {
  const current = pages.at(-1);
  if (!current) return null;
  const earlier = pages.slice(0, -1).reverse();
  const at = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-[var(--chat-muted)]"><Globe size={14} /></span>
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--chat-muted)]">Currently on</span>
          <span className="mt-0.5 block break-all font-mono text-[12.5px]" title={current.path}>{current.path}</span>
          {current.title && <span className="mt-0.5 block break-words text-[11.5px] text-[var(--chat-muted)]">{current.title}</span>}
          <span className="mt-0.5 block text-[11px] text-[var(--chat-muted)]">Since {at(current.at)}</span>
        </span>
      </div>
      {earlier.length > 0 && (
        <div>
          <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--chat-muted)]">Before that</span>
          <ul className="mt-1.5 space-y-1.5">
            {earlier.map((page) => (
              <li key={`${page.path}-${page.at}`} className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="min-w-0 truncate font-mono" title={page.title ? `${page.path} — ${page.title}` : page.path}>{page.path}</span>
                <span className="shrink-0 text-[11px] text-[var(--chat-muted)]">{at(page.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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

// The AI's step lines above its replies, for the team only (the widget never sees them). Set to false to
// hide them and stop fetching them.
const SHOW_AI_STEPS = true;

// One AI turn as the activity route reports it: when it started and which steps it took.
type AiRun = { id: string; outcome: string; startedAt: string; steps: { tool: string; ok: boolean; note?: string }[] };
// The turn in progress right now: the steps so far, and the one still running (null while the model is thinking or writing).
type AiLive = { startedAt: string; running: string | null; steps: { tool: string; ok: boolean; note?: string }[] };

// What each step is called while it is still running.
const RUNNING_LABELS: Record<string, string> = {
  route_specialist: "Planning the next steps",
  replan: "Re-planning",
  search_knowledge: "Searching the knowledge base",
  read_knowledge: "Reading a knowledge article",
  read_official_page: "Reading the website",
  recall_conversation: "Looking back through this conversation",
  get_past_conversations: "Checking past conversations",
  find_payments: "Checking payment history",
  find_subscriptions: "Checking subscriptions",
  get_receipt: "Fetching a receipt",
  send_payment_link: "Sending a payment link",
  find_orders: "Looking up orders",
  save_lead: "Saving a sales lead",
  save_contact_info: "Saving contact details",
  send_resource_link: "Emailing a page to the customer",
  check_team_availability: "Checking who on the team is free",
  review_reply: "Checking the reply against its sources",
  handoff_check: "Checking whether a person is needed",
  escalate_to_human: "Handing the conversation to the team",
};
function runningLabel(tool: string | null, aiName: string) {
  if (!tool) return `${aiName} is thinking`;
  if (tool.startsWith("mcp_")) return "Checking a connected system";
  return RUNNING_LABELS[tool] ?? `${aiName} is working`;
}

// Plain-language names for the AI's steps. Anything not listed (the privacy filter, retries, token
// usage, the polish pass) is internal plumbing and is not shown to the team.
const STEP_LABELS: Record<string, string> = {
  route_specialist: "Understood the request",
  search_knowledge: "Searched the knowledge base",
  read_knowledge: "Read a knowledge article",
  read_official_page: "Read the website",
  recall_conversation: "Looked back through this conversation",
  get_past_conversations: "Checked past conversations",
  find_payments: "Checked payment history",
  find_subscriptions: "Checked subscriptions",
  get_receipt: "Fetched a receipt",
  send_payment_link: "Sent a payment link",
  refund_payment: "Refunded a payment",
  cancel_subscription: "Cancelled a subscription",
  find_orders: "Looked up orders",
  cancel_order: "Cancelled an order",
  update_shipping_address: "Updated the shipping address",
  save_lead: "Saved a sales lead",
  save_contact_info: "Saved contact details",
  send_resource_link: "Emailed a page to the customer",
  check_team_availability: "Checked who on the team is free",
  switch_specialist: "Switched specialist",
  upgrade_model: "Took a closer look",
  model_fallback: "Switched to the backup model",
  review_reply: "Checked the reply against its sources",
  handoff_check: "Checked whether a person is needed",
  escalate_to_human: "Handed the conversation to the team",
  replan: "Changed plan after a step failed",
  mark_resolved: "Closed the conversation as resolved",
};

function stepLabel(tool: string) {
  if (tool.startsWith("mcp_")) return "Checked a connected system";
  return STEP_LABELS[tool] ?? null;
}

// An icon for each kind of step, as Intercom shows beside Fin's activity lines.
function StepIcon({ tool }: { tool: string }) {
  if (tool === "search_knowledge" || tool === "read_knowledge") return <BookOpen size={13} className="shrink-0" />;
  if (tool === "read_official_page") return <Globe size={13} className="shrink-0" />;
  if (tool === "escalate_to_human" || tool === "check_team_availability" || tool === "switch_specialist") return <UserRound size={13} className="shrink-0" />;
  if (tool === "review_reply" || tool === "handoff_check") return <ShieldCheck size={13} className="shrink-0" />;
  if (tool === "mark_resolved") return <CheckCircle2 size={13} className="shrink-0" />;
  if (tool.startsWith("find_") || tool.startsWith("mcp_") || ["get_receipt", "get_past_conversations", "recall_conversation"].includes(tool)) return <ArrowLeftRight size={13} className="shrink-0" />;
  return <ListChecks size={13} className="shrink-0" />;
}

// One AI turn as quiet activity lines above the reply it led to, laid out like Intercom's Fin: a time,
// an icon and what happened. The router's reading of the request is the AI's "thoughts", which open
// and close. Repeats in a row collapse into one line with a count.
function AiSteps({ run, aiName, defaultOpen, trailing }: { run: AiRun; aiName: string; defaultOpen: boolean; trailing?: React.ReactNode }) {
  const [thoughtsOpen, setThoughtsOpen] = useState(defaultOpen);
  const routed = run.steps.find((step) => step.tool === "route_specialist");
  // A router that worked gives the AI's reading of the request; one that failed gives the reason instead.
  const thought = routed?.ok ? routed.note : undefined;
  const lines: { tool: string; label: string; ok: boolean; count: number; note?: string }[] = [];
  for (const step of run.steps) {
    // Only the main things: its thoughts, what it looked up and why it handed over. Model retries, the backup
    // model and a failed router are plumbing; they only matter as the reason for a handoff (added below).
    if (step.tool === "route_specialist" || step.tool === "model_fallback" || step.tool === "upgrade_model") continue;
    const label = stepLabel(step.tool);
    if (!label) continue;
    const last = lines.at(-1);
    if (last && last.label === label && last.ok === step.ok && !step.note && !last.note) last.count += 1;
    else lines.push({ tool: step.tool, label, ok: step.ok, count: 1, note: step.note });
  }
  // The turn ended in a handoff the AI never decided on: its model could not be reached.
  if (run.outcome === "escalated" && !run.steps.some((step) => step.tool === "escalate_to_human") && run.steps.some((step) => !step.ok)) {
    lines.push({ tool: "escalate_to_human", label: "Handed the conversation to the team", ok: true, count: 1, note: "The AI couldn't get an answer from its model, so a person needs to reply." });
  }
  if (!lines.length && !thought && !trailing) return null;
  const age = shortAge(run.startedAt);
  const time = <span className="w-9 shrink-0 whitespace-nowrap tabular-nums" title={new Date(run.startedAt).toLocaleString()}>{age}</span>;
  return (
    <div className="chat-ai-steps space-y-2 rounded-xl bg-black/5 px-3 py-2.5 text-[12.5px]">
      {thought && (
        <div>
          <button type="button" onClick={() => setThoughtsOpen((value) => !value)} aria-expanded={thoughtsOpen} className="flex items-center gap-3 text-left">
            {time}
            <LayoutGrid size={13} className="shrink-0" />
            <span>{aiName}&apos;s thoughts</span>
            {thoughtsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {thoughtsOpen && <p className="chat-ai-thought mt-1.5 whitespace-pre-line pl-[73px] leading-5">{thought}</p>}
        </div>
      )}
      {lines.map((line, index) => (
        <div key={index}>
          <div className="flex items-center gap-3">
            {time}
            <StepIcon tool={line.tool} />
            <span>{line.label}{line.count > 1 ? ` (×${line.count})` : ""}{line.ok ? "" : " — didn't work"}</span>
          </div>
          {/* Why a chat went to a person: the check's verdict and the AI's own reason. */}
          {line.note && <p className="chat-ai-thought mt-1 pl-[73px] leading-5">{line.tool === "escalate_to_human" ? `Reason: ${line.note}` : line.note}</p>}
        </div>
      ))}
      {trailing}
    </div>
  );
}

function DashboardContent({ name }: { name: string }) {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  // The list view this chat was opened from, so "back" returns to it.
  const inboxView = parseInboxView(searchParams.get("view"));
  const [conversation, setConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [translatingDraft, setTranslatingDraft] = useState(false);
  // What the composer held before the last "Translate" swap, so the small
  // "Undo" next to the result can put it back without the agent retyping.
  const [preTranslateDraft, setPreTranslateDraft] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  // Why the last reply didn't send. The draft is put back so nothing typed is lost.
  const [sendError, setSendError] = useState<string | null>(null);
  // A resolved conversation hides the reply composer by default — there's
  // nothing left to do until someone reopens it — but sending a message is
  // already how reopening works server-side (see resolveConversation's own
  // comment), so this only needs to reveal the same composer, not implement
  // a second way to reopen.
  const [wantsToReplyAfterResolve, setWantsToReplyAfterResolve] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [ticketState, setTicketState] = useState<"idle" | "creating">("idle");
  const [ticket, setTicket] = useState<CreatedTicket | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [myAccountId, setMyAccountId] = useState<string | null>(null);
  // Gates opening a secure request — reveal is owner-only server-side, and
  // showing "Open once" to someone it will just 403 for is exactly the kind
  // of dead control this file's own comments already warn against.
  const [myRole, setMyRole] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  // Translation cache, per message id — filled the first time "See
  // translation" is clicked, and never re-fetched after that unless the
  // conversation changes (a fresh mount clears it, same as `messages` does).
  // `null` means "already checked, and it's already in the workspace
  // language" — distinct from "not checked yet" (absent) so a second click
  // doesn't call the backend again just to find that out twice.
  const [translations, setTranslations] = useState<Record<string, { text: string | null; detectedLanguage: string }>>({});
  const [translating, setTranslating] = useState<Set<string>>(new Set());
  // Which cached translations are currently being shown in place of the
  // original — toggled per message by clicking the link again.
  const [showingTranslation, setShowingTranslation] = useState<Set<string>>(new Set());
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
  // Leaving is not reversible from the agent's side — the thread goes back
  // to the AI (or waits unassigned if it was escalated) and the customer
  // sees "<name> left the chat". Worth one confirmation, since the button
  // sits next to Resolve and the two do very different things.
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  // null = not checked yet, so the plain "pick a conversation" state never
  // flashes for a brand-new workspace before this resolves.
  const [hasAnyConversations, setHasAnyConversations] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingPingRef = useRef(0);
  // A voice call to the visitor's widget, placed from the header. The panel below follows it.
  const { call, start: startCall, hangUp, toggleMute, dismiss: dismissCall } = useAgentCall();
  const [calledName, setCalledName] = useState("");
  // The "call ended" notice clears itself.
  useEffect(() => {
    if (call.phase !== "ended") return;
    const timer = window.setTimeout(dismissCall, call.notice ? 7000 : 1500);
    return () => window.clearTimeout(timer);
  }, [call.phase, call.notice, dismissCall]);
  // What the AI did on each turn, shown above its replies. Turns are slower than messages, so this
  // polls less often than the thread itself.
  const [aiRuns, setAiRuns] = useState<AiRun[]>([]);
  const [aiLive, setAiLive] = useState<AiLive | null>(null);
  // The turn's steps arrive over the dashboard socket the moment they happen (see the "agent:progress" listener in the
  // header). This fetch only fills in what the socket cannot: the saved runs, and the state on first opening a thread
  // or after a missed message, so it runs at a relaxed pace.
  const aiBusyRef = useRef(false);
  useEffect(() => {
    setAiRuns([]);
    setAiLive(null);
    if (!conversationId || !SHOW_AI_STEPS) return;
    let cancelled = false;
    let timer: number | undefined;
    const load = () => fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/ai-steps`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { runs?: AiRun[]; live?: AiLive | null } | null) => {
        if (cancelled || !data) return;
        if (data.runs) setAiRuns(data.runs);
        setAiLive(data.live ?? null);
      })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) { window.clearTimeout(timer); timer = window.setTimeout(load, aiBusyRef.current ? 3000 : 8000); } });
    void load();
    // Pushed by the gateway: the steps so far and what is running, or done once the turn is saved.
    const onProgress = (event: Event) => {
      const progress = (event as CustomEvent<{ conversationId?: string; done?: boolean; startedAt?: string; running?: string | null; steps?: AiLive["steps"] }>).detail;
      if (cancelled || progress?.conversationId !== conversationId) return;
      if (progress.done) {
        setAiLive(null);
        // The run is saved by now: fetch it so its steps stay in place above the reply.
        void load();
        return;
      }
      setAiLive({ startedAt: progress.startedAt ?? new Date().toISOString(), running: progress.running ?? null, steps: progress.steps ?? [] });
    };
    window.addEventListener("elpino:ai-progress", onProgress);
    return () => { cancelled = true; window.clearTimeout(timer); window.removeEventListener("elpino:ai-progress", onProgress); };
  }, [conversationId]);

  // Only matters for the empty state (see the !conversationId branch below),
  // so it's skipped once something is actually open — no point re-asking
  // "does this workspace have any chats" while reading one.
  useEffect(() => {
    if (conversationId || hasAnyConversations !== null) return;
    let cancelled = false;
    fetchConversations()
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
    setTranslations({});
    setShowingTranslation(new Set());
    setPreTranslateDraft(null);
    setTranslateError(null);
    setWantsToReplyAfterResolve(false);

    function load() {
      Promise.all([
        fetchConversations().then((response) => (response.ok ? response.json() : { conversations: [] })),
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
    fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { organizations?: { id: string; role: string }[]; selectedOrganizationId?: string } | null) => {
        const organizations = data?.organizations ?? [];
        const selected = organizations.find((org) => org.id === data?.selectedOrganizationId) ?? organizations[0];
        setMyRole(selected?.role ?? null);
      })
      .catch(() => setMyRole(null));
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
    setPreTranslateDraft(null);
    setSendError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      // On failure the route answers { message: "<reason>" } — a string, not a
      // Message — so check the status before treating it as a sent reply.
      const data = (await response.json().catch(() => ({}))) as { message?: Message | string };
      if (response.ok && data.message && typeof data.message !== "string") {
        posthog.capture("conversation_reply_sent");
        setMessages((current) => [...current, data.message as Message]);
      } else {
        setDraft(body);
        setSendError(typeof data.message === "string" ? data.message : "Could not send this reply.");
      }
    } catch {
      setDraft(body);
      setSendError("Could not send this reply.");
    } finally {
      setSending(false);
    }
  }

  /**
   * "Translate" in the composer — the mirror of "See translation" on a
   * customer's message. Replaces the draft with a translation into whatever
   * language the customer last wrote in, so an agent can type their reply in
   * their own language and still send it in the customer's.
   */
  async function translateReplyDraft() {
    const text = draft.trim();
    if (!text || translatingDraft || !conversationId) return;
    setTranslatingDraft(true);
    setTranslateError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/translate-draft`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await response.json().catch(() => ({}))) as { translatedText?: string | null; targetLanguage?: string; message?: string };
      if (!response.ok) {
        // Was silently swallowed before — a customer-less conversation, a
        // model hiccup, anything failing here looked identical to a working
        // button that decided there was nothing to translate.
        setTranslateError(data.message ?? "Could not translate this reply.");
        return;
      }
      // A null translatedText means the customer already writes in the
      // workspace's language — the draft is correct as typed, nothing to
      // swap in, and no "Undo" is needed for a change that didn't happen.
      if (data.translatedText) {
        setPreTranslateDraft(text);
        setDraft(data.translatedText);
      } else {
        const languageLabel = SUPPORTED_LANGUAGES.find((item) => item.code === data.targetLanguage)?.name ?? "the customer's language";
        setTranslateError(`Already in ${languageLabel} — nothing to translate.`);
      }
    } catch {
      setTranslateError("Could not reach the translation service.");
    } finally {
      setTranslatingDraft(false);
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
      const data = (await response.json().catch(() => ({}))) as { message?: Message | string };
      if (response.ok && data.message && typeof data.message !== "string") {
        setMessages((current) => [...current, data.message as Message]);
        setDraft("");
      } else {
        setTicketError(typeof data.message === "string" ? data.message : "Could not attach that file.");
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
      posthog.capture("conversation_claimed");
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
      posthog.capture("conversation_resolved");
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

  /**
   * "See translation" under a customer message. Cached on the backend after
   * the first call, so toggling it back and forth — or another agent
   * opening the same thread — never re-spends on the model; this just flips
   * which text is shown once the cache is warm.
   */
  async function toggleTranslation(messageId: string) {
    if (showingTranslation.has(messageId)) {
      setShowingTranslation((current) => { const next = new Set(current); next.delete(messageId); return next; });
      return;
    }
    if (translations[messageId]) {
      // A null cached text means the model already checked and found this
      // message is in the workspace's own language — nothing to reveal, so
      // clicking again is a no-op rather than toggling on to show the exact
      // same text back under a "See original" label.
      if (translations[messageId].text) setShowingTranslation((current) => new Set(current).add(messageId));
      return;
    }
    if (!conversationId || translating.has(messageId)) return;
    setTranslating((current) => new Set(current).add(messageId));
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      const data = (await response.json().catch(() => ({}))) as { translatedBody?: string | null; detectedLanguage?: string; message?: string };
      if (!response.ok) return;
      setTranslations((current) => ({ ...current, [messageId]: { text: data.translatedBody ?? null, detectedLanguage: data.detectedLanguage ?? "" } }));
      // A message the model finds is already in the workspace's language has
      // nothing to show in its place — showing "the translation" would just
      // be the same text again, so the toggle stays off rather than
      // revealing a no-op.
      if (data.translatedBody) setShowingTranslation((current) => new Set(current).add(messageId));
    } finally {
      setTranslating((current) => { const next = new Set(current); next.delete(messageId); return next; });
    }
  }

  async function loadSecureRequests() {
    if (!conversationId) return;
    const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/secure`, { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { requests?: SecureRequest[] };
    setSecureRequests(data.requests ?? []);
  }

  async function createSecureRequest(label: string): Promise<{ ok: boolean; message?: string }> {
    if (!conversationId || !label.trim()) return { ok: false, message: "Open a conversation first." };
    const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/secure`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) return { ok: false, message: data.message ?? "Could not create the request." };
    await loadSecureRequests();
    return { ok: true };
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

  // Opens the ticket dialog rather than filing a ticket outright — clicking
  // "Ticket" used to POST immediately with no title/summary/destination
  // control, which is invisible the moment a workspace has more than one
  // project tool connected (which of them? which Asana project?) and gives
  // no chance to see or edit what's about to be filed.
  function openTicketDialog() {
    if (!conversationId) return;
    setTicketError(null);
    setTicketDialogOpen(true);
  }

  async function createTicket(input: { title: string; note: string; provider?: string; asanaProjectGid?: string; category: TicketCategory }) {
    if (!conversationId || ticketState === "creating") return;
    setTicketState("creating");
    setTicketError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/ticket`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as { ticket?: CreatedTicket; message?: string };
      if (!response.ok || !data.ticket) throw new Error(data.message ?? "Could not create the ticket.");
      posthog.capture("conversation_ticket_created", {
        provider: data.ticket.provider,
      });
      setTicket(data.ticket);
      setTicketDialogOpen(false);
    } catch (issue) {
      setTicketError(issue instanceof Error ? issue.message : "Could not create the ticket.");
    } finally {
      setTicketState("idle");
    }
  }

  // Hooks must run on every render, so these sit above the early returns below. Calling them after
  // `if (!conversationId) return …` changes the hook count when a chat is picked and React throws.
  // Who has taken this chat, learned live from the team-wide "joined" event
  // (it carries their first name, which the conversation itself doesn't).
  const [joinedBy, setJoinedBy] = useState<{ userId: string; name: string } | null>(null);
  useEffect(() => {
    setJoinedBy(null);
    const onJoined = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: string; userId?: string; name?: string }>).detail;
      if (!detail?.conversationId || detail.conversationId !== conversationId || !detail.userId) return;
      setJoinedBy({ userId: detail.userId, name: detail.name || "A teammate" });
      setConversation((current) => (current ? { ...current, assignedUserId: detail.userId!, handledBy: "human" } : current));
    };
    window.addEventListener("elpino:conversation-joined", onJoined);
    return () => window.removeEventListener("elpino:conversation-joined", onJoined);
  }, [conversationId]);

  // The call panel follows the call, not the open chat: it stays up when no chat is selected, so a call in
  // progress never disappears from view while it is still ringing or connecting.
  const callInProgress = call.phase !== "idle" && call.phase !== "ended";
  const callPanel = call.phase !== "idle" ? (
      <div role="status" aria-live="polite" className="fixed bottom-24 right-6 z-[90] flex w-[300px] items-center gap-3 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] p-3.5 shadow-[0_18px_48px_rgba(25,39,58,0.28)]">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${call.phase === "active" ? "bg-[#e6f5ec] text-[#1f8a4c]" : "bg-[var(--chat-customer-bg)]"}`}>
          <Phone size={17} className={call.phase === "ringing" || call.phase === "starting" ? "animate-pulse" : ""} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">{calledName || "Customer"}</p>
          <p className="truncate text-[12px] text-[var(--chat-muted)]">
            {call.phase === "starting" ? "Starting the call…"
              : call.phase === "ringing" ? "Ringing…"
              : call.phase === "connecting" ? "Connecting…"
              : call.phase === "active" ? `On a call · ${formatTalkTime(call.seconds)} · Recording`
              : call.notice ?? "Call ended"}
          </p>
        </div>
        {call.phase === "active" && (
          <button type="button" onClick={toggleMute} aria-pressed={call.muted} aria-label={call.muted ? "Unmute" : "Mute"} title={call.muted ? "Unmute" : "Mute"} className="chat-icon-btn">
            {call.muted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
        {callInProgress ? (
          <button type="button" onClick={hangUp} aria-label={call.phase === "ringing" || call.phase === "starting" ? "Cancel the call" : "End the call"} title={call.phase === "ringing" || call.phase === "starting" ? "Cancel the call" : "End the call"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d6453d] text-white hover:bg-[#bd3a33]">
            <PhoneOff size={16} />
          </button>
        ) : (
          <button type="button" onClick={dismissCall} aria-label="Dismiss" className="shrink-0 rounded-lg p-1.5 opacity-60 hover:opacity-100"><X size={15} /></button>
        )}
      </div>
  ) : null;

  if (!conversationId) {
    // A brand-new workspace with zero conversations anywhere gets a real
    // welcome instead of "pick a conversation" pointing at an empty list —
    // that instruction is only useful once there's something to pick.
    if (hasAnyConversations === false) {
      return (
        <>
        {callPanel}
        <div className="dashboard-page-surface dashboard-conversation iw-root flex h-full min-w-0 flex-col items-center justify-center px-8 text-center">
          <span className="iw-icon flex size-12 items-center justify-center rounded-xl"><MessageCircle size={22} /></span>
          <h1 className="iw-h mt-4 text-[20px] font-semibold tracking-[-0.02em]">No conversations yet</h1>
          <p className="iw-t mt-1.5 max-w-sm text-[14.5px] leading-6">Chats from your website will show up here.</p>
          <a href="/dashboard/connect" className="iw-btn mt-5 flex h-11 items-center rounded-full border px-6 text-[15px] font-medium transition">Connect your site</a>
        </div>
        </>
      );
    }

    return (
      <>
      {callPanel}
      <div className="dashboard-page-surface dashboard-conversation flex h-full min-w-0 flex-col items-center justify-center px-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--chat-customer-bg)] text-[var(--chat-customer-text)]"><MessageCircle size={22} /></span>
        <h1 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">Pick a conversation</h1>
        <p className="mt-1.5 max-w-sm text-[14.5px] leading-6 text-[var(--chat-muted)]">Select a chat from the list on the left to see the conversation.</p>
      </div>
      </>
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
  const isResolved = conversation?.status === "resolved";
  const visitorLeft = Boolean(conversation?.visitorLeft);
  // Calling needs the chat to be yours (the server checks the same) and the visitor to still be reachable.
  const canCall = isMine && !isResolved && !visitorLeft;
  // An automatic handoff stores a log of the thread, not a summary; that is no use as a report.
  const handoffSummary = conversation?.escalationSummary && !looksLikeTranscriptDump(conversation.escalationSummary) ? conversation.escalationSummary : null;
  // A visitor who left with no verified email can't receive a reply at all,
  // so there's no composer to offer.
  const showComposer = !isResolved || (wantsToReplyAfterResolve && (!visitorLeft || Boolean(conversation?.canEmailVisitor)));
  const place = formatPlace(conversation?.location);
  const device = formatDevice(conversation?.location?.userAgent);
  const ip = conversation?.location?.ip ?? null;
  // The green dot on the visitor's avatar used to be hardcoded on regardless
  // of anything real — every visitor showed "online" forever, including one
  // from a conversation that ended days ago. There's no live visitor
  // presence socket (unlike the teammate one above), only lastSeenAt, bumped
  // on widget activity — so "online" here means "seen very recently", not
  // "has the tab open right now". Close enough to be honest without a
  // heartbeat connection this product doesn't have yet.
  const visitorSeenAtMs = conversation?.location?.seenAt ? new Date(conversation.location.seenAt).getTime() : null;
  const visitorOnline = visitorSeenAtMs !== null && Date.now() - visitorSeenAtMs < VISITOR_ONLINE_WINDOW_MS;
  // Text-only, against what's already loaded — no reason to round-trip to
  // the server for a search over a few dozen messages already in memory.
  const searchTerm = searchQuery.trim().toLowerCase();
  const visibleMessages = searchTerm ? messages.filter((message) => message.body.toLowerCase().includes(searchTerm)) : messages;
  // The customer's last message is still waiting on the AI.
  const aiAwaiting = !searchTerm && SHOW_AI_STEPS && conversation?.handledBy !== "human" && !conversation?.assignedUserId && messages.at(-1)?.senderType === "customer";
  aiBusyRef.current = aiAwaiting || !!aiLive;

  return (
    <div id="dashboard-chat-interface" className="dashboard-page-surface dashboard-conversation flex h-full min-w-0">
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

      <section className="dashboard-chat-center flex min-w-0 flex-1 flex-col border-r border-[var(--chat-divider)] bg-[var(--chat-surface)]">
        <header className="dashboard-chat-header flex h-16 shrink-0 flex-nowrap items-center border-b border-[var(--chat-divider)] px-3 sm:px-5">
          {/* Only reachable on mobile, where the list and the open chat
              trade places instead of sitting side by side — this is what
              gets you back to it. */}
          <Link
            href={inboxListHref(inboxView)}
            aria-label="Back to conversations"
            className="-ml-1.5 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--chat-muted)] transition hover:bg-[var(--chat-customer-bg)] lg:hidden"
          >
            <ArrowLeft size={18} />
          </Link>
          {/* Just the name, as in Intercom: who they are and where they are live in the details panel. */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[18px] font-semibold tracking-[-0.01em]" title={customerName}>{customerName}</h1>
              {conversation?.verified && (
                <span title="Proved their identity — signed in, or confirmed with a code" className="flex shrink-0 items-center gap-1 rounded-full bg-[#edf7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e8a5c]">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {/* Joining is the act that takes a thread off the AI and puts a
                named person on it, so it is the primary thing to do from
                here until it has happened. */}
            {assignedElsewhere && joinedBy && joinedBy.userId === conversation?.assignedUserId && (
              <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-[#EEF8F2] px-2.5 py-1 text-[11.5px] font-semibold text-[#34845c] sm:inline-flex">
                <UserRound size={12} /> {joinedBy.name} joined
              </span>
            )}
            {/* A closed conversation (resolved, or closed after 24 quiet hours) has nothing to join; the
                Closed state below says so instead. */}
            {!isMine && !isResolved && (
              <button
                type="button"
                onClick={() => void joinConversation()}
                disabled={joining}
                title="Take this conversation and reply yourself"
                className="chat-icon-btn chat-pill-btn mr-0.5 whitespace-nowrap px-3 text-[13px] font-semibold"
              >
                {joining ? <LoaderCircle size={14} className="animate-spin" /> : <UserRound size={14} />}
                <span className="hidden sm:inline">{joining ? "Joining…" : assignedElsewhere ? "Take over" : "Join chat"}</span>
              </button>
            )}
            {/* Purely informational (not a control), so the first thing
                dropped when space is tight — the header's own "back to a
                full list" context already implies this on mobile. */}
            {isMine && !isResolved && (
              <span className="hidden h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--chat-divider)] px-3 text-[12px] font-semibold text-[var(--chat-muted)] 2xl:flex">
                <UserRound size={14} /> You&apos;re handling this
              </span>
            )}
            {/* Round icon actions, as in Intercom. Call and email only appear when the visitor gave a
                number or address to use, so none of these is a dead control. Search moves into the
                "..." menu below sm. */}
            <button
              type="button"
              onClick={() => setSearchOpen((open) => { if (open) setSearchQuery(""); return !open; })}
              aria-label="Search conversation"
              aria-pressed={searchOpen}
              title="Search this conversation"
              className="chat-icon-btn chat-icon-wide"
            >
              <Search size={15} />
            </button>
            <button type="button" onClick={openTicketDialog} aria-label="Create a ticket" title="Create a ticket" className="chat-icon-btn">
              <TicketPlus size={15} />
            </button>
            {canCall && (
              <button
                type="button"
                onClick={() => { setCalledName(customerName); void startCall(conversationId!); }}
                disabled={callInProgress}
                aria-label="Call the customer"
                title={callInProgress ? "A call is in progress" : "Call the customer through their chat widget"}
                className="chat-icon-btn disabled:opacity-50"
              >
                <Phone size={15} />
              </button>
            )}
            {conversation?.email && (
              <a href={`mailto:${conversation.email}`} aria-label={`Email ${conversation.email}`} title={`Email ${conversation.email}`} className="chat-icon-btn chat-icon-wide">
                <Mail size={15} />
              </a>
            )}
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-label="Conversation details"
              aria-pressed={detailsOpen}
              title="Customer details"
              className="chat-icon-btn"
            >
              <Info size={15} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-label="More actions"
                aria-pressed={moreOpen}
                className="chat-icon-btn"
              >
                <MoreHorizontal size={16} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] py-1 shadow-[0_16px_40px_-20px_rgba(15,18,22,0.45)]">
                    <button
                      type="button"
                      onClick={() => { setMoreOpen(false); setSearchOpen((open) => { if (open) setSearchQuery(""); return !open; }); }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] hover:bg-[var(--chat-customer-bg)] 2xl:hidden"
                    >
                      <Search size={15} /> {searchOpen ? "Close search" : "Search conversation"}
                    </button>
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
            {conversation?.assignedUserId && !isResolved && (
              <button
                type="button"
                disabled={unclaiming}
                onClick={() => setConfirmLeave(true)}
                title="Leave this chat — it goes back to the AI, unless it was escalated"
                className="chat-icon-btn chat-pill-btn whitespace-nowrap px-3 text-[13px] font-semibold disabled:opacity-60"
              >
                {unclaiming ? <LoaderCircle size={14} className="animate-spin" /> : <UserRound size={14} />}
                <span className="hidden sm:inline">Leave chat</span>
              </button>
            )}
            {confirmLeave && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]"
                role="presentation"
                onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmLeave(false); }}
              >
                <div role="dialog" aria-modal="true" aria-label="Leave this chat" className="w-full max-w-[420px] rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                  <h3 className="text-[17px] font-semibold">Leave this chat?</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[var(--chat-muted)]">
                    {/* escalationReason stands in for the backend's
                        escalatedAt, which isn't sent to this component —
                        escalate() sets both, so its presence means the same
                        thing: a human was asked for deliberately, and
                        unclaim() will leave it unassigned rather than
                        handing it back to the AI. */}
                    {conversation?.escalationReason
                      ? "The customer will see that you left, and the chat waits unassigned until another teammate picks it up. It will not go back to the AI, because a human was asked for."
                      : "The customer will see that you left, and the AI takes the conversation back over."}
                  </p>
                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmLeave(false)}
                      className="flex h-10 items-center rounded-lg border border-[var(--chat-divider)] px-4 text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]"
                    >
                      Stay
                    </button>
                    <button
                      type="button"
                      disabled={unclaiming}
                      onClick={() => { setConfirmLeave(false); void unclaimConversation(); }}
                      className="chat-action-primary flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold disabled:opacity-60"
                    >
                      {unclaiming ? <LoaderCircle size={15} className="animate-spin" /> : null}
                      Leave chat
                    </button>
                  </div>
                </div>
              </div>
            )}
            <SecureRequestDialog open={secureOpen} onClose={() => setSecureOpen(false)} onCreate={createSecureRequest} />
            {callPanel}
            <TicketDialog
              open={ticketDialogOpen}
              onClose={() => setTicketDialogOpen(false)}
              conversationId={conversationId}
              busy={ticketState === "creating"}
              error={ticketError}
              onCreate={createTicket}
            />
            {/* Once closed there is nothing left to do from the header, so a plain status takes the place of
                both Join and Resolve. Replying after closing stays available from the thread itself. */}
            {isResolved ? (
              <span title="This conversation is closed" className="ml-2 flex h-9 items-center gap-1.5 rounded-lg border border-[var(--chat-divider)] px-2.5 text-[12.5px] font-semibold text-[var(--chat-muted)] sm:px-3.5">
                <CheckCircle2 size={15} />
                <span className="hidden sm:inline">Closed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void resolveConversation()}
                disabled={resolving}
                title="Close this conversation as resolved"
                className="chat-action-primary ml-1.5 flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold disabled:opacity-50 sm:px-3.5"
              >
                {resolving ? <LoaderCircle size={14} className="animate-spin" /> : <Inbox size={14} />}
                <span className="hidden sm:inline">{resolving ? "Closing…" : "Close"}</span>
              </button>
            )}
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
          <div ref={scrollRef} className="dashboard-message-scroll flex-1 overflow-y-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto mt-6 max-w-[820px]">
              {loading ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center text-[12px] text-[var(--chat-muted)]">No messages yet.</div>
              ) : searchTerm && visibleMessages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center text-[12px] text-[var(--chat-muted)]">No messages match &quot;{searchQuery.trim()}&quot;.</div>
              ) : (
                <div className="space-y-4">
                  {groupMessages(visibleMessages).map((group, groupIndex, groups) => {
                    // Each AI turn's steps go above the first message posted after the turn began: the
                    // reply or handoff notice it produced. Hidden while searching the thread.
                    const startOf = (run: AiRun) => new Date(run.startedAt).getTime();
                    const after = (message: { createdAt: string }, run: AiRun) => new Date(message.createdAt).getTime() > startOf(run);
                    const runsHere = searchTerm ? [] : aiRuns.filter((run) => {
                      const target = groups.findIndex((candidate) => candidate.messages.some((message) => after(message, run)));
                      return target === groupIndex;
                    }).sort((a, b) => startOf(a) - startOf(b));
                    const latestRunId = aiRuns.reduce<AiRun | null>((latest, run) => (!latest || startOf(run) > startOf(latest) ? run : latest), null)?.id;
                    const steps = runsHere.map((run) => <AiSteps key={run.id} run={run} aiName={aiName} defaultOpen={run.id === latestRunId} />);
                    // A teammate joining or leaving is a thread event, not
                    // something anyone said — a centered rule, never a row
                    // with an avatar and an author.
                    if (group.kind === "system") {
                      return (
                        <div key={group.key} className="space-y-4">
                          {steps}
                          <div className="chat-system-notice flex items-center gap-3 py-1 text-[11px]">
                            <span className="whitespace-nowrap">{group.messages[0].body}</span>
                          </div>
                          {/* A call recording: team only, played straight from the thread. */}
                          {group.messages[0].attachmentType === "audio" && group.messages[0].attachmentUrl && (
                            <audio controls preload="none" src={group.messages[0].attachmentUrl} className="mx-auto block h-9 w-full max-w-[360px]">
                              <a href={group.messages[0].attachmentUrl}>Download the recording</a>
                            </audio>
                          )}
                        </div>
                      );
                    }

                    const isTeam = group.senderType !== "customer";
                    const isAi = group.senderType === "ai";

                    return (
                      <div key={group.key} className="space-y-4">
                      {steps}
                      <div className={`flex items-end gap-2 ${isTeam ? "flex-row-reverse" : ""}`}>
                        {/* The AI wears the same face the visitor sees in the
                            widget — the avatar the workspace picked, not a
                            generic glyph — so an agent reading the thread
                            recognises it as the bot their customers meet. */}
                        {isAi && aiAvatarUrl ? (
                          <img
                            src={aiAvatarUrl}
                            alt={aiName}
                            title={aiName}
                            className="mb-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span
                            title={isTeam ? (isAi ? aiName : name || "You") : customerName}
                            className={`mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${isTeam ? "chat-avatar-team" : "chat-avatar-customer"}`}
                          >
                            {isTeam ? (isAi ? aiName.charAt(0).toUpperCase() || "A" : initial) : customerInitials}
                          </span>
                        )}
                        <div className={`min-w-0 ${isTeam ? "max-w-[88%] text-right" : "max-w-[70%]"}`}>
                          <div className="space-y-1.5">
                            {group.messages.map((message, messageIndex) => (
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
                                    className={`chat-line chat-bubble text-left text-[13.5px] leading-[1.55] ${isTeam ? "chat-line-team" : "chat-line-customer"}`}
                                  >
                                    <MessageMarkdown
                                      text={showingTranslation.has(message.id) ? translations[message.id]?.text ?? message.body : message.body}
                                    />
                                    {/* The time sits inside the last bubble of a run, as in Intercom, with a customer
                                        message's on-demand translation beside it (never fetched until clicked). */}
                                    {(messageIndex === group.messages.length - 1 || !isTeam) && (
                                      <span className={`chat-bubble-time mt-1.5 flex items-center gap-1.5 text-[11px] ${isTeam ? "justify-end" : ""}`}>
                                        {messageIndex === group.messages.length - 1 && (
                                          <span className="flex items-center gap-1">
                                            {!isTeam && <MessageSquare size={11} className="shrink-0" />}
                                            {shortAge(message.createdAt)}
                                          </span>
                                        )}
                                        {!isTeam && (() => {
                                          const cached = translations[message.id];
                                          const alreadyMatches = cached && !cached.text;
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => void toggleTranslation(message.id)}
                                              disabled={translating.has(message.id) || alreadyMatches}
                                              className="flex items-center gap-1 font-medium hover:underline disabled:cursor-default disabled:no-underline"
                                            >
                                              {messageIndex === group.messages.length - 1 && <span aria-hidden="true">·</span>}
                                              <Globe2 size={11} />
                                              {translating.has(message.id) ? "Translating…" : alreadyMatches ? `Already in ${cached.detectedLanguage || "your language"}` : showingTranslation.has(message.id) ? "See original" : "See translation"}
                                            </button>
                                          );
                                        })()}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {/* One timestamp, under the run it belongs to. The
                              avatar already says who is speaking, so naming
                              them again above every group was the same fact
                              twice. */}
                          {!group.messages[group.messages.length - 1].body && (
                            <p className="mt-1 text-[11px] text-[var(--chat-muted)]">
                              {formatTime(group.messages[group.messages.length - 1].createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      </div>
                    );
                  })}
                  {/* The turn in progress: steps appear as they finish and a spinner marks the one still running. The
                      saved run (above the reply) takes over when the turn ends. */}
                  {(aiAwaiting || aiLive) && (
                    <AiSteps
                      run={{ id: "live", outcome: "running", startedAt: aiLive?.startedAt ?? new Date().toISOString(), steps: aiLive?.steps ?? [] }}
                      aiName={aiName}
                      defaultOpen
                      trailing={aiAwaiting ? (
                        <div className="flex items-center gap-3">
                          <span className="w-9 shrink-0" />
                          <Loader2 size={13} className="shrink-0 animate-spin" />
                          <span>{runningLabel(aiLive?.running ?? null, aiName)}…</span>
                        </div>
                      ) : undefined}
                    />
                  )}
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

              {/* The AI's handoff notes as Intercom's yellow summary card. An automatic handoff (an outage,
                  a spent budget) has no written summary, only a log of the thread, so only its reason shows. */}
              {(conversation?.escalationReason || handoffSummary) && (
                <div className="mt-4 flex items-end justify-end gap-2">
                  <div className="chat-summary-card max-w-[88%] rounded-2xl px-4 py-3.5 text-left">
                    <p className="flex items-center gap-2 text-[13px] font-semibold">
                      <span className="chat-ai-chip rounded px-1 py-px text-[9px] font-bold leading-3">AI</span>
                      Summary
                    </p>
                    {conversation?.escalationReason && <p className="mt-2 text-[13px] font-medium">{conversation.escalationReason}</p>}
                    {handoffSummary && <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6">{handoffSummary}</p>}
                  </div>
                  <img src={aiAvatarUrl} alt={aiName} title={aiName} className="mb-0.5 h-6 w-6 shrink-0 rounded-full object-cover" />
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
              ) : conversation?.assignedUserId ? (
                // Offered once a teammate has joined: until then the AI is handling the chat and the
                // handoff notes above already say what happened.
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
              ) : null}
            </div>
          </div>

          <div className="relative shrink-0 px-5 pb-4">
            {/* An open chat is replied to only by whoever has joined it: sending used to join silently (the
                server still treats a reply as a join), which let anyone type into a chat the AI or a teammate
                was handling. No reply box until you have joined (Join chat / Take over in the header). */}
            {!isResolved && !isMine ? null : !showComposer ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-customer-bg)] px-4 py-3.5">
                <span className="flex items-center gap-2 text-[13px] text-[var(--chat-muted)]">
                  <CheckCircle2 size={15} className="shrink-0 text-[#35b92c]" />
                  {!visitorLeft
                    ? "This conversation is resolved."
                    : conversation?.canEmailVisitor
                      ? "The visitor left this chat. A reply can only reach them by email."
                      : "The visitor left this chat and has no verified email, so a reply can't reach them."}
                </span>
                {(!visitorLeft || conversation?.canEmailVisitor) && (
                  <button
                    type="button"
                    onClick={() => setWantsToReplyAfterResolve(true)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--chat-divider)] px-3 text-[12.5px] font-semibold hover:bg-[var(--chat-surface)]"
                  >
                    {visitorLeft ? "Reply by email" : "Reply anyway"}
                  </button>
                )}
              </div>
            ) : (
            <>
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
            <div className="dashboard-reply-composer overflow-hidden rounded-xl border border-[var(--chat-divider)] bg-[var(--chat-surface)]">
              <div className="rounded-xl bg-[var(--chat-surface)]">
              <textarea
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setPreTranslateDraft(null); notifyTyping(); }}
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
                  onClick={openTicketDialog}
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
                <button
                  type="button"
                  onClick={() => void translateReplyDraft()}
                  disabled={!draft.trim() || translatingDraft}
                  aria-label="Translate this reply into the customer's language"
                  title={draft.trim() ? "Translate into the customer's language" : "Type a reply first"}
                  className="p-1.5 opacity-70 hover:opacity-100 disabled:cursor-default disabled:opacity-30"
                >
                  {translatingDraft ? <LoaderCircle size={17} className="animate-spin" /> : <Globe2 size={17} />}
                </button>
                {preTranslateDraft && (
                  <button
                    type="button"
                    onClick={() => { setDraft(preTranslateDraft); setPreTranslateDraft(null); }}
                    className="text-[11px] font-medium text-[var(--chat-muted)] underline decoration-dotted underline-offset-2 hover:text-[var(--chat-text,inherit)]"
                  >
                    Undo translate
                  </button>
                )}
                {translateError && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#c0554f]">
                    {translateError}
                    <button type="button" onClick={() => setTranslateError(null)} className="underline hover:no-underline">Dismiss</button>
                  </span>
                )}
                {sendError && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#c0554f]">
                    {sendError}
                    <button type="button" onClick={() => setSendError(null)} className="underline hover:no-underline">Dismiss</button>
                  </span>
                )}
                {visitorLeft && !sendError && (
                  <span className="text-[11px] font-medium text-[var(--chat-muted)]">The visitor left. This reply will be emailed to them.</span>
                )}
                <span className="ml-auto" />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!draft.trim() || sending}
                  className="chat-action-primary ml-2 flex h-8 items-center overflow-hidden rounded-lg"
                  aria-label="Send message"
                  title="Send message"
                >
                  <span className="flex h-full w-10 items-center justify-center">{sending ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={17} />}</span>
                  <span className="flex h-5 w-6 items-center justify-center border-l border-current/25" title="More send options"><ChevronDown size={13} /></span>
                </button>
              </div>
              </div>
            </div>
            </>
            )}
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
        id="dashboard-customer-details"
        className={`${detailsOpen ? "fixed inset-y-0 right-0 z-40 flex w-full shadow-[-16px_0_40px_rgba(15,18,22,0.18)] sm:w-[340px] xl:static xl:z-auto xl:w-[340px] xl:shadow-none" : "hidden"} shrink-0 flex-col border-l border-[var(--chat-divider)] bg-[var(--chat-surface)]`}
      >
        <div className="border-b border-[var(--chat-divider)] p-5">
          <div className="flex items-center gap-3">
            {/* Full-bleed below sm means the backdrop underneath isn't
                reachable to close this — needs its own explicit close. */}
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              aria-label="Close details"
              className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--chat-muted)] transition hover:bg-[var(--chat-customer-bg)]"
            >
              <X size={18} />
            </button>
            <span className="chat-avatar-customer relative flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold">
              {customerInitials}
              <span
                title={visitorOnline ? "Active in the last couple of minutes" : "Not currently active"}
                className={`absolute -bottom-px -right-px h-4 w-4 rounded-full border-2 border-[var(--chat-surface)] ${visitorOnline ? "bg-[#35b92c]" : "bg-[var(--chat-muted)]"}`}
              />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[17px] font-bold">{customerName}</h2>
                {conversation?.verified && (
                  <span title="Proved their identity — signed in, or confirmed with a code" className="flex shrink-0 items-center gap-1 rounded-full bg-[#edf7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e8a5c]">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-medium text-[var(--chat-muted)]">Website visitor · {visitorOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
          {(conversation?.email || conversation?.phone || conversation?.topic) && (
            <div className="dashboard-contact-card mt-4 space-y-2 rounded-lg p-3 text-[12px]">
              {conversation?.topic && (
                <p className="flex items-center justify-between gap-3"><span className="text-[var(--chat-muted)]">Topic</span><span className="truncate font-medium">{conversation.topic}</span></p>
              )}
              {conversation?.email && (
                <p className="flex items-center justify-between gap-3"><span className="text-[var(--chat-muted)]">Email</span><span className="truncate font-medium">{conversation.email}</span></p>
              )}
              {conversation?.phone && (
                <p className="flex items-center justify-between gap-3"><span className="text-[var(--chat-muted)]">Phone</span><span className="font-medium">{conversation.phone}</span></p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={openTicketDialog}
            disabled={ticketState === "creating"}
            className="chat-action-primary mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold"
          >
            {ticketState === "creating" ? <LoaderCircle size={16} className="animate-spin" /> : <TicketPlus size={16} />}
            Create ticket
          </button>
          <a href="/dashboard/contacts" className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--chat-divider)] text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]">
            <UserRound size={16} />
            View customer profile
          </a>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {!!conversation?.visitorPages?.length && (
            <DetailSection title="Visitor's page">
              <VisitorPages pages={conversation.visitorPages} />
            </DetailSection>
          )}
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
              <p className="text-[12px] leading-5 text-[var(--chat-muted)]">No location or device details were recorded for this visitor.</p>
            )}
          </DetailSection>
          <DetailSection title="Secure requests">
            <div className="space-y-3">
              <p className="text-[12px] leading-5 text-[var(--chat-muted)]">Request private information through a secure, single-use link.</p>
              <button
                type="button"
                onClick={() => setSecureOpen(true)}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--chat-divider)] text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)]"
              >
                <Lock size={14} /> Request private info
              </button>
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
                    myRole === "owner" ? (
                      <button
                        type="button"
                        onClick={() => void revealSecret(request)}
                        className="chat-action-primary mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold"
                      >
                        <Eye size={13} /> Open once
                      </button>
                    ) : (
                      <p className="mt-2 text-[11px] text-[var(--chat-muted)]">Only the workspace owner can open this.</p>
                    )
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
              {summary ?? handoffSummary ? (
                <p className="whitespace-pre-wrap">{summary ?? handoffSummary}</p>
              ) : (
                <>
                  <p className="text-[var(--chat-muted)]">No summary yet.</p>
                  <button
                    type="button"
                    disabled={summarizing || messages.length === 0}
                    onClick={() => void summarizeConversation()}
                    className="mt-2 flex items-center gap-2 rounded-full border border-[var(--chat-divider)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--chat-surface)] disabled:cursor-not-allowed disabled:opacity-50"
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
/**
 * Centered, not tucked in the details sidebar — the sidebar is collapsible
 * and can be scrolled past or hidden on a narrow screen, so a request
 * triggered from the composer or the "..." menu used to land in a form the
 * agent might never see open. A modal is reachable from wherever the click
 * came from.
 */
function SecureRequestDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (label: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function close() {
    onClose();
    setLabel("");
    setError(null);
  }

  async function submit() {
    if (!label.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onCreate(label.trim());
      if (!result.ok) {
        setError(result.message ?? "Could not create the request.");
        return;
      }
      close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div role="dialog" aria-modal="true" aria-label="Request private information" className="w-full max-w-[420px] rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[17px] font-semibold"><Lock size={16} /> Request private info</h3>
            <p className="mt-2 text-[13px] leading-6 text-[var(--chat-muted)]">
              Ask for a password, key, or server detail without it landing in the chat history. The customer gets a single-use link; you get one look, then it is destroyed.
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="shrink-0 rounded-lg p-1.5 opacity-60 hover:bg-[var(--chat-customer-bg)] hover:opacity-100">
            <X size={16} />
          </button>
        </div>

        <input
          autoFocus
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") void submit(); }}
          placeholder="e.g. SSH password for app-prod-01"
          maxLength={120}
          className="mt-5 h-11 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-3 text-[13px] outline-none focus:border-[var(--chat-line-text)]"
        />
        {error && <p role="alert" className="mt-2 text-[12px] text-[#c0554f]">{error}</p>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={close} className="flex h-10 items-center rounded-lg border border-[var(--chat-divider)] px-4 text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!label.trim() || busy}
            onClick={() => void submit()}
            className="chat-action-primary flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Lock size={13} />} Send link
          </button>
        </div>
      </div>
    </div>
  );
}

type TicketDraftProvider = { provider: "trello" | "asana"; label: string; detail: string | null };
type TicketDraft = {
  providers: TicketDraftProvider[];
  asanaProjects: { gid: string; name: string }[];
  suggestedTitle: string;
  suggestedNote: string;
  suggestedCategory?: TicketCategory;
};
type TicketCategory = "billing" | "sales" | "technical" | "support";
const TICKET_CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "billing", label: "Billing" },
  { value: "sales", label: "Sales" },
  { value: "technical", label: "Technical" },
  { value: "support", label: "Support" },
];
type ExistingTicket = { provider: string; id: string; url: string | null; title: string; createdAt: string };

function TicketDialog({
  open,
  onClose,
  conversationId,
  busy,
  error,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  busy: boolean;
  error: string | null;
  onCreate: (input: { title: string; note: string; provider?: string; asanaProjectGid?: string; category: TicketCategory }) => Promise<void>;
}) {
  // "list" shows what's already been filed for this conversation, so
  // clicking "Ticket" a second time doesn't just reopen a blank form as if
  // nothing had happened yet — "create" is the actual filing form, reached
  // either because nothing exists yet or because "Create another ticket"
  // was clicked from the list.
  const [mode, setMode] = useState<"checking" | "list" | "create">("checking");
  const [existingTickets, setExistingTickets] = useState<ExistingTicket[]>([]);
  const [draft, setDraft] = useState<TicketDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [provider, setProvider] = useState<string>("");
  const [asanaProjectGid, setAsanaProjectGid] = useState<string>("");
  const [category, setCategory] = useState<TicketCategory>("support");

  // Checked fresh each time the dialog opens: whatever was already filed for
  // this conversation, since another agent could have filed one since the
  // last time this tab looked.
  useEffect(() => {
    if (!open || !conversationId) return;
    let cancelled = false;
    setMode("checking");
    setExistingTickets([]);
    setDraft(null);
    setLoadError(null);
    fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/ticket`)
      .then(async (response) => {
        const data = (await response.json()) as { tickets?: ExistingTicket[] };
        if (cancelled) return;
        const tickets = data.tickets ?? [];
        setExistingTickets(tickets);
        setMode(tickets.length > 0 ? "list" : "create");
      })
      .catch(() => {
        if (!cancelled) setMode("create");
      });
    return () => {
      cancelled = true;
    };
  }, [open, conversationId]);

  // Fetched on demand rather than alongside the existing-tickets check: an
  // AI-drafted title/summary costs real inference money (see ticketDraft in
  // agent.service.ts), so it should only be requested when someone is
  // actually about to file a ticket, not every time the dialog merely opens
  // to show what already exists.
  useEffect(() => {
    if (mode !== "create" || !conversationId) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setDraft(null);
    fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/ticket/draft`, { method: "POST" })
      .then(async (response) => {
        const data = (await response.json()) as TicketDraft & { message?: string };
        if (cancelled) return;
        if (!response.ok) throw new Error(data.message ?? "Could not prepare the ticket.");
        setDraft(data);
        setTitle(data.suggestedTitle ?? "");
        setNote(data.suggestedNote ?? "");
        // The ticket is always kept in Elpino; a connected tool gets a copy by default, and "" means don't send.
        setProvider(data.providers[0]?.provider ?? "");
        setAsanaProjectGid("");
        setCategory(data.suggestedCategory ?? "support");
      })
      .catch((issue: unknown) => {
        if (!cancelled) setLoadError(issue instanceof Error ? issue.message : "Could not prepare the ticket.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, conversationId]);

  if (!open) return null;

  async function submit() {
    if (!title.trim() || busy) return;
    await onCreate({
      title: title.trim(),
      note: note.trim(),
      provider: provider || undefined,
      asanaProjectGid: provider === "asana" && asanaProjectGid ? asanaProjectGid : undefined,
      category,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-label="Create ticket" className="w-full max-w-[480px] rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-2 text-[17px] font-semibold"><TicketPlus size={16} /> {mode === "list" ? "Tickets for this conversation" : "Create ticket"}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1.5 opacity-60 hover:bg-[var(--chat-customer-bg)] hover:opacity-100">
            <X size={16} />
          </button>
        </div>

        {mode === "checking" ? (
          <div className="mt-6 flex items-center justify-center gap-2 py-8 text-[13px] text-[var(--chat-muted)]">
            <LoaderCircle size={16} className="animate-spin" /> Checking for existing tickets…
          </div>
        ) : mode === "list" ? (
          <div className="mt-4 space-y-3.5">
            <div className="space-y-2">
              {existingTickets.map((t) => (
                <a
                  key={`${t.provider}:${t.id}`}
                  href={t.url ?? undefined}
                  target={t.url ? "_blank" : undefined}
                  rel={t.url ? "noreferrer" : undefined}
                  className={`block rounded-lg border border-[var(--chat-divider)] p-3 ${t.url ? "hover:bg-[var(--chat-customer-bg)]" : "cursor-default"}`}
                >
                  <p className="text-[12.5px] font-medium">{t.title}</p>
                  <p className="mt-1 text-[11px] text-[var(--chat-muted)]">
                    {t.provider === "asana" ? "Elpino + Asana" : t.provider === "trello" ? "Elpino + Trello" : "Elpino"} · {new Date(t.createdAt).toLocaleString()}
                  </p>
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMode("create")}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--chat-divider)] text-[12.5px] font-semibold hover:bg-[var(--chat-customer-bg)]"
            >
              <TicketPlus size={14} /> Create another ticket
            </button>
          </div>
        ) : loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 py-8 text-[13px] text-[var(--chat-muted)]">
            <LoaderCircle size={16} className="animate-spin" /> Summarizing this conversation…
          </div>
        ) : loadError ? (
          <p role="alert" className="mt-4 text-[13px] leading-5 text-[#c0554f]">{loadError}</p>
        ) : draft ? (
          <div className="mt-4 space-y-3.5">
            <label className="block text-[12.5px] font-semibold">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TicketCategory)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-2.5 text-[13px] font-normal outline-none focus:border-[var(--chat-line-text)]"
              >
                {TICKET_CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {/* Every ticket is kept in Elpino and worked from Inbox → Tickets; a connected tool can get a copy. */}
            {draft.providers.length > 0 && (
              <label className="block text-[12.5px] font-semibold">
                Also send to
                <select
                  value={provider}
                  onChange={(event) => { setProvider(event.target.value); setAsanaProjectGid(""); }}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-2.5 text-[13px] font-normal outline-none focus:border-[var(--chat-line-text)]"
                >
                  {draft.providers.map((option) => (
                    <option key={option.provider} value={option.provider}>
                      {option.label}{option.detail ? ` — ${option.detail}` : ""}
                    </option>
                  ))}
                  <option value="">Don&apos;t send (keep it in Elpino only)</option>
                </select>
              </label>
            )}
            {provider === "asana" && draft.asanaProjects.length > 0 && (
              <label className="block text-[12.5px] font-semibold">
                Project
                <select
                  value={asanaProjectGid}
                  onChange={(event) => setAsanaProjectGid(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-2.5 text-[13px] font-normal outline-none focus:border-[var(--chat-line-text)]"
                >
                  <option value="">No project — just the workspace</option>
                  {draft.asanaProjects.map((p) => (
                    <option key={p.gid} value={p.gid}>{p.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-[12.5px] font-semibold">
              Heading
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--chat-divider)] bg-transparent px-3 text-[13px] font-normal outline-none focus:border-[var(--chat-line-text)]"
              />
            </label>
            <label className="block text-[12.5px] font-semibold">
              Details <span className="font-normal text-[var(--chat-muted)]">(AI-summarized — edit freely)</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={5}
                className="mt-1.5 w-full resize-none rounded-lg border border-[var(--chat-divider)] bg-transparent px-3 py-2 text-[13px] font-normal leading-5 outline-none focus:border-[var(--chat-line-text)]"
              />
            </label>
            <p className="text-[11.5px] leading-4 text-[var(--chat-muted)]">
              Saved in Inbox → Tickets. Customer name, email, and topic are attached automatically.
            </p>
          </div>
        ) : null}

        {error && <p role="alert" className="mt-3 text-[12px] text-[#c0554f]">{error}</p>}

        {mode === "create" && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="flex h-10 items-center rounded-lg border border-[var(--chat-divider)] px-4 text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft || !title.trim() || busy}
            onClick={() => void submit()}
            className="chat-action-primary flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <TicketPlus size={13} />} Create ticket
          </button>
        </div>
        )}
      </div>
    </div>
  );
}

export function DashboardClient({ name }: { name: string }) {
  return (
    <Suspense fallback={<div className="dashboard-conversation h-full"><ChatSkeleton withHeader /></div>}>
      <DashboardContent name={name} />
    </Suspense>
  );
}
