"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ExternalLink, File as FileIcon, LayoutGrid, Maximize2, MessageCircle, MessageSquarePlus, Minimize2, House, MessageSquare, LogOut, MoreHorizontal, Paperclip, Plus, Search, SendHorizontal, Smile, ThumbsDown, ThumbsUp, Volume2, VolumeX, X } from "lucide-react";
import ArticleMarkdown, { prepareArticle } from "@/app/components/ArticleMarkdown";
import MessageMarkdown from "@/app/components/MessageMarkdown";
import TypingDots from "@/app/components/TypingDots";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { playMessageChime, primeOnFirstInteraction } from "@/lib/notification-sound";
import { CallOverlay } from "./CallOverlay";
import { useWidgetCall } from "./use-widget-call";

type Attachment = { url: string; type: "image" | "file" | "gif"; name?: string };
type WidgetMessage = {
  id: string;
  senderType: string;
  senderId: string | null;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
};
/** An article in the Help tab. `id` identifies the whole article, not one stored chunk of it. */
type HelpArticle = { id: string; title: string; snippet: string; sourceUrl: string | null };
type HelpArticleBody = { id: string; title: string; content: string; sourceUrl: string | null; createdAt?: string };
type MessageGroup =
  | { kind: "system"; message: WidgetMessage }
  | { kind: "thread"; fromVisitor: boolean; messages: WidgetMessage[] };
type StartResult = { logoUrl?: string | null; suggestions?: string[]; allowed: boolean; visitorToken?: string; conversationId?: string; botName?: string; botAvatarUrl?: string | null; greetingLines?: string[]; removeBranding?: boolean; topic?: string | null; customerName?: string | null; customerEmail?: string | null; customerPhone?: string | null; contactCollection?: "chat" | "off"; identified?: boolean; identityError?: string; messages?: WidgetMessage[]; error?: string };
type ConversationSummary = { id: string; status: string; topic?: string | null; preview: string; time: string };
// "home" is the greeting/start screen — no separate top-level tab for it (see
// `tab` below), just the Chat tab's own default view when there's nothing to
// resume. Matches Crisp/Intercom: land in an existing conversation, or greet.
type ChatView = "home" | "list" | "thread";
type ContactField = "email" | "name" | "phone";
// The question shown above the field, worded as the AI would ask it; the placeholder is only an example of the answer.
const CONTACT_PROMPTS: Record<ContactField, { label: string; placeholder: string; type: string }> = {
  email: { label: "What's your email, just in case we get disconnected?", placeholder: "you@example.com", type: "email" },
  name: { label: "May I know your name?", placeholder: "Your name", type: "text" },
  phone: { label: "What's the best phone number to reach you, just in case we get disconnected?", placeholder: "+1 555 123 4567", type: "tel" },
};
type GifResult = { id: string; url: string; preview: string };
type TeamMember = { id: string; name: string | null; avatarUrl: string | null; online: boolean };
type PreChatField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio";
  required: boolean;
  options?: string[];
  placeholder?: string;
  multiple?: boolean;
};

const ACCENT = "#428ce5";
// Ink: the widget's primary text/icon color on its light surface. A few
// interactive accents (the pre-chat radio dot) key off ACCENT instead so
// they read as "selected", not just "text".
// The widget is light: these are its palette. Anything colour-specific added to this page belongs here or in a token like these.
const INK = "#18181b";
const BG = "#f7f7f8";
const SURFACE = "#ffffff";
// Neutral chip background — the customer's own reply bubble uses ACCENT
// instead; this is for everything else that needs a soft fill (attachment
// preview, disabled composer state, the typing indicator).
const BUBBLE = "#eef1f4";
const BORDER = "#e4e6ea";
const MUTED = "rgba(24,24,27,.55)";
const ICON_MUTED = "rgba(24,24,27,.62)";
// The message box toolbar icons (attach, emoji, GIF).
const COMPOSER_ICON = "rgba(24,24,27,0.72)";
const POLL_MS = 2000;
// "Just now", "5 minutes ago", "1 hour ago" — same wording as the launcher popup in app/tag.js/route.ts.
function timeAgo(then: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
// Same http->ws origin swap as app/tag.js/route.ts's gatewayWsOrigin() — kept
// separate since that one runs server-side and this runs in the browser.
// Missing the NODE_ENV fallback here meant local dev pointed this socket at
// production (wss://api.elpino.chat) instead of the local gateway, so it
// silently never connected and the widget fell back to poll-only — no
// word-by-word reveal, even though the feature worked once deployed.
const GATEWAY_WS_ORIGIN = (
  process.env.NEXT_PUBLIC_GATEWAY_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat")
).replace(/^http/, "ws");
const TEAM_POLL_MS = 15000;
const START_TIMEOUT_MS = 12000;
const TYPING_PING_MS = 2000;
// Longest the send button stays locked waiting for a reply.
const REPLY_WAIT_MAX_MS = 60000;
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
// Giphy's well-known public "beta" test key — fine for demo-scale traffic,
// rate-limited; swap for a real key before any real production usage.
// Giphy retired its shared demo key (it now answers 403 "BANNED"), so GIF search needs the workspace
// operator's own key (free at developers.giphy.com). Giphy keys are meant to ship in the browser and are
// rate limited per key. Without one the GIF button is hidden rather than opening an empty picker.
const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY?.trim() ?? "";
const EMOJI = [
  "😀","😂","🥰","😍","😊","🙂","😉","😢","😭","😮","😅","🙏","👍","👎","👏","🙌","🤝","💪","🔥","✨",
  "🎉","❤️","💙","💯","👀","🤔","😴","😎","🥳","😇","🙃","😬","😱","🤗","👋","✅","❌","⚡","⭐","💡",
];
const COUNTRIES = [
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇦🇪", code: "+971", name: "UAE" },
  { flag: "🇸🇬", code: "+65", name: "Singapore" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
];

// Per visitor and site: whether new replies make a sound.
function soundKey(publicKey: string) {
  return `elpino_sound_${publicKey}`;
}

function storageKey(publicKey: string) {
  return `elpino_visitor_${publicKey}`;
}

// The widget runs as a cross-site iframe, so storage here is third-party:
// Chrome partitions it (reads come back empty), but Firefox with strict
// tracking protection throws SecurityError outright. An unguarded read threw
// before the start fetch was ever issued, leaving the widget on its loading
// spinner forever. Degrading to "no stored token" just means the visitor is
// treated as new rather than resuming — the chat itself still works.
function readVisitorToken(publicKey: string): string | undefined {
  try {
    return window.localStorage.getItem(storageKey(publicKey)) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeVisitorToken(publicKey: string, token: string) {
  try {
    window.localStorage.setItem(storageKey(publicKey), token);
  } catch {
    // Storage blocked — the token stays in memory for this session only.
  }
}

function clearVisitorToken(publicKey: string) {
  try {
    window.localStorage.removeItem(storageKey(publicKey));
  } catch {
    // Storage blocked — nothing was stored to clear.
  }
}

// How long the widget waits for the host page to hand over a signed identity
// before starting anonymously. Short, because an older loader never answers.
const IDENTITY_WAIT_MS = 800;

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = new Date().toDateString() === date.toDateString();
  return isToday ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// "now", "2m", "3h", "1d": the short age shown beside the recent message on the home screen.
function compactAgo(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.floor((now - then) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// Help centre collections, taken from the article's URL: https://site.com/customer-stories/acme belongs to
// "Customer stories". Pages directly under the domain, and articles written in the dashboard, are "General".
const GENERAL_COLLECTION = "General";
function collectionOf(article: { sourceUrl: string | null }): string {
  try {
    const segments = new URL(article.sourceUrl ?? "").pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const name = decodeURIComponent(segments[0]).replace(/[-_]+/g, " ").trim();
      if (name) return name.charAt(0).toUpperCase() + name.slice(1);
    }
  } catch {
    // no usable URL
  }
  return GENERAL_COLLECTION;
}

// The website this widget is on, top-left of the home screen (the AI has its own avatar next to the team's): the
// workspace's logo if it set one, else the site's own favicon, else the first letter of its domain.
function SiteMark({ logoUrl, hostname }: { logoUrl: string | null; hostname: string }) {
  const [failed, setFailed] = useState(false);
  const source = logoUrl || (hostname ? `https://${hostname}/favicon.ico` : "");
  const letter = (hostname.replace(/^www\./, "").charAt(0) || "?").toUpperCase();
  return (
    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-[#11120f] bg-white text-[15px] font-bold text-[#11120f]">
      {source && !failed ? <img src={source} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain p-1" /> : letter}
    </span>
  );
}

function WidgetContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key")?.trim() ?? "";
  const hostname = searchParams.get("host")?.trim() ?? "";
  const startFresh = searchParams.get("new") === "1";
  // Where the visitor was on the previous page, handed over by the loader
  // (see VIEW_KEY in tag.js), so moving around the site doesn't drop them
  // back on Home.
  const restoredTab = searchParams.get("tab") === "chat" ? "chat" : searchParams.get("tab") === "help" ? "help" : null;
  const restoredChatView = searchParams.get("view") === "list" ? "list" : "thread";
  const restoredConversationRef = useRef(startFresh ? null : searchParams.get("conversation"));

  const [tab, setTab] = useState<"chat" | "help">(restoredTab ?? "chat");
  // No restored view to go on: land straight in the thread, same as
  // startFresh — a brand-new visitor sees the greeting rendered as the
  // thread's first bubble (see "messages.length === 0 && !conversationId"
  // below), not a separate card screen. Crisp/Intercom don't have a distinct
  // Home either. Nothing sets chatView to "home" anymore, but the ChatView
  // value and its render branch are left in place rather than torn out.
  const [chatView, setChatView] = useState<ChatView>(startFresh ? "thread" : restoredTab === "chat" ? restoredChatView : "thread");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // The page of the customer's site this visitor is on, as reported by the tag
  // (path and title only). Forwarded to the backend so a teammate sees it in the inbox.
  const sitePageRef = useRef<{ path: string; title: string } | null>(null);
  const [sitePageVersion, setSitePageVersion] = useState(0);
  const [botName, setBotName] = useState("Elpino Support");
  const [botAvatarUrl, setBotAvatarUrl] = useState<string | null>(null);
  const [greetingLines, setGreetingLines] = useState<string[]>(["Hi there 👋", "How can I help you today?"]);
  // Questions other visitors like this one keep asking, offered as tap-to-send chips in a new chat.
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // The workspace's own logo, for the home screen; null falls back to the website's favicon.
  const [siteLogoUrl, setSiteLogoUrl] = useState<string | null>(null);
  // First name of an identified visitor (ElpinoTag.identify()/getIdentityToken
  // on the host page), so the greeting can say "Hi Alex" instead of the
  // generic "Hi there" — null for an anonymous visitor, or one the site
  // identified without a real name on file yet ("Website visitor").
  const [greetingName, setGreetingName] = useState<string | null>(null);
  // First name for the home screen ("Hello Jagdeep."): any real name on file, or one just given in the chat.
  const [homeName, setHomeName] = useState<string | null>(null);
  // Paid plans drop the badge. Starts true so a slow or failed config load
  // shows it rather than silently white-labelling a Free workspace.
  const [showBranding, setShowBranding] = useState(true);
  const [visitorToken, setVisitorToken] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [replyPreview, setReplyPreview] = useState<WidgetMessage | null>(null);
  const [draft, setDraft] = useState("");
  // Step-by-step contact form that takes over the message box when the AI
  // asks for an email "in case we get disconnected". The server decides when
  // (contactAsk on the message poll); this only walks the missing fields.
  const [contactFields, setContactFields] = useState<ContactField[] | null>(null);
  const [contactStep, setContactStep] = useState(0);
  const [contactValue, setContactValue] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  // The AI message whose question the visitor has answered or skipped. A new question is a new message, so it
  // shows its own field again.
  const [contactDoneFor, setContactDoneFor] = useState("");
  const [contactAskId, setContactAskId] = useState("");
  // A short confirmation shown once a detail is saved ("Nice to meet you, Jagdeep."); null when there is none.
  const [contactThanks, setContactThanks] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  // The AI's reply while it is being written (already approved, only its wording is still changing). The saved
  // message replaces it; the backend can also take it back, and a stream that goes quiet is dropped.
  const [streamingReply, setStreamingReply] = useState<{ streamId: string; seq: number; text: string } | null>(null);
  // While a reply is being written the visitor can keep typing but not send: a second message
  // mid-turn starts a second, overlapping answer. The block lifts by itself after a while so a
  // reply that never arrives can never leave the chat stuck.
  const [replyWaitExpired, setReplyWaitExpired] = useState(false);
  useEffect(() => {
    setReplyWaitExpired(false);
    if (!agentTyping) return;
    const timer = window.setTimeout(() => setReplyWaitExpired(true), REPLY_WAIT_MAX_MS);
    return () => window.clearTimeout(timer);
  }, [agentTyping]);
  const sendBlockedByReply = agentTyping && !replyWaitExpired;
  // First name of the teammate who joined; the header shows them instead of the AI.
  const [agentName, setAgentName] = useState<string | null>(null);
  // Ms-epoch deadline while the team is notified and nobody has joined yet.
  const [joinDeadline, setJoinDeadline] = useState<number | null>(null);
  const [joinNow, setJoinNow] = useState(() => Date.now());
  // Drives the "5 minutes ago" labels under the assistant's replies so they keep counting while the chat is open.
  const [clock, setClock] = useState(() => Date.now());
  const [greetedAt] = useState(() => Date.now());
  // Message times are the server's; the visitor's own clock can be minutes off. The poll reports the server's
  // current time, so ages are measured against that instead. 0 until the first poll answers.
  const [serverOffset, setServerOffset] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  const [sending, setSending] = useState(false);
  const [recent, setRecent] = useState<ConversationSummary[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentLoading, setRecentLoading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const [activePanel, setActivePanel] = useState<"emoji" | "gif" | null>(null);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [preChatNeeded, setPreChatNeeded] = useState(false);
  const [preChatSubmitting, setPreChatSubmitting] = useState(false);
  const [preChatFields, setPreChatFields] = useState<PreChatField[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formCountry, setFormCountry] = useState(0);
  const pendingTopicRef = useRef<string | null>(null);

  function setAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  // The message box grows with what is typed (up to its max-height) and shrinks back after sending.
  useEffect(() => {
    const box = composerRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${Math.min(box.scrollHeight, 132)}px`;
  }, [draft]);
  const recognitionRef = useRef<any>(null);

  // Signed identity from the host page (ElpinoTag.identify). The loader hands
  // it over by postMessage, never in this iframe's URL, where it would end up
  // in logs and referrers. The session start below waits for it, so a
  // logged-in visitor is not started as an anonymous one first.
  const identityTokenRef = useRef<string | null>(null);
  const activeVisitorRef = useRef("");
  const sessionEpochRef = useRef(0);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  // keepDraft: the session merely lapsed and the same person is about to be
  // signed back in, so what they were typing survives. Logout and account
  // switches clear everything.
  // keepVisitorToken: a fresh identity token arrived that *might* verify to
  // someone new, but hasn't been checked yet — don't throw away this
  // browser's anonymous history on a guess. The start() response that
  // follows already does the right thing once it actually knows: it clears
  // the stored token itself if the visitor turns out to be identified, and
  // otherwise leaves it alone. Without this, a host page that mints a new
  // (structurally different, even if equally unverified) token on every
  // fetch — e.g. our own dashboard session backing elpino.chat's widget
  // tag — wipes the anonymous visitor's saved token, and with it every past
  // conversation, on essentially every identity refresh.
  const discardSession = useCallback((options: { keepDraft?: boolean; keepVisitorToken?: boolean } = {}) => {
    const oldToken = activeVisitorRef.current;
    activeVisitorRef.current = "";
    sessionEpochRef.current += 1;
    if (oldToken.startsWith("ws_")) {
      void fetch("/api/widget/logout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken: oldToken }), keepalive: true }).catch(() => undefined);
    }
    if (!options.keepVisitorToken) clearVisitorToken(key);
    setVisitorToken("");
    setConversationId("");
    setMessages([]);
    setRecent([]);
    if (!options.keepDraft) {
      setAnswers({});
      setDraft("");
      setPendingAttachment(null);
      pendingTopicRef.current = null;
    }
    setAgentTyping(false);
    setSending(false);
    setPreChatSubmitting(false);
    setActivePanel(null);
    setAttachError("");
    setSessionExpiresAt(null);
  }, [key, hostname]);
  // Which account the current session belongs to (an opaque value from the
  // server), so a refresh can tell "same person, new session" from a switch.
  const accountRefRef = useRef<string | null>(null);
  // Set while the page is asked for a fresh token ahead of the session's hard
  // cap; the token that comes back replaces the session without touching the UI.
  const silentRefreshRef = useRef(false);

  // New-reply alerts: a soft sound, plus an unread count the loader shows on
  // the launcher and in the page title, whenever the visitor is not looking.
  // panelOpenRef comes from the loader; the iframe cannot tell on its own
  // whether it is hidden behind a closed launcher.
  const panelOpenRef = useRef(true);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const seenConversationRef = useRef("");
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  useEffect(() => {
    primeOnFirstInteraction();
    try {
      const on = window.localStorage.getItem(soundKey(key)) !== "off";
      soundOnRef.current = on;
      setSoundOn(on);
    } catch {
      // Storage blocked: the default (on) stands for this session.
    }
  }, [key]);
  function toggleSound() {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    try { window.localStorage.setItem(soundKey(key), next ? "on" : "off"); } catch { /* remembered for this session only */ }
  }
  // The iframe itself can't resize its own dimensions — the loader (tag.js)
  // owns the fixed positioning and size. This just tells it to swap between
  // the normal panel and a fullscreen one; see the elpino:maximize handler
  // there for the actual CSS swap.
  const [isMaximized, setIsMaximized] = useState(false);
  function toggleMaximize() {
    const next = !isMaximized;
    setIsMaximized(next);
    window.parent.postMessage({ type: "elpino:maximize", maximized: next }, "*");
  }

  // "Did we help you?" — shown by "End chat" in the conversation's menu. One screen, not a
  // confirm-then-rate sequence: picking a thumb is optional, "Leave Chat" resolves the
  // conversation and submits whatever rating (if any) was picked in a single step.
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [ratingChoice, setRatingChoice] = useState<1 | -1 | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Where "leaving" actually lands. The X button and the browser/phone back
  // button close the whole panel; the in-thread "Back to chats" arrow
  // doesn't close anything, it just returns to the list — but it's
  // abandoning the same active conversation, so it deserves the same
  // question. A ref since it's only read once the flow finishes, never
  // rendered.
  const leaveTargetRef = useRef<"close" | "list">("close");
  // Back and close only navigate: the conversation stays open, and the visitor can return to it from Home or
  // Messages. Ending it is a deliberate action, endChat, from the menu in the conversation header.
  function requestLeave(target: "close" | "list" = "close") {
    if (leaveOpen) return;
    if (target === "list") openChatList();
    else closeWidget();
  }
  function endChat() {
    if (leaveOpen) return;
    leaveTargetRef.current = "list";
    setLeaveOpen(true);
  }
  function goBack() {
    setLeaveOpen(false);
    setRatingChoice(null);
  }
  async function leaveChat() {
    setLeaving(true);
    // Best-effort: the visitor is leaving either way, so a failed request
    // (offline, a dropped connection) must not block the close/navigate
    // that follows.
    try {
      await fetch("/api/widget/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, hostname, visitorToken, conversationId }),
      });
      if (ratingChoice) {
        await fetch("/api/widget/rate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, hostname, visitorToken, conversationId, rating: ratingChoice }),
        });
      }
    } catch { /* the conversation just stays open/unrated on the team's side */ }
    // Reset first: closing hides the iframe rather than unmounting it, and
    // "list" doesn't hide anything at all — either way this screen has to
    // be told to go away itself, or it just sits there on top of whatever
    // comes next (the chat list, or the same stale screen on reopen).
    setLeaving(false);
    setLeaveOpen(false);
    setRatingChoice(null);
    // The conversation is over for this visitor: forget it here too, so the
    // thread, Home's "Continue the conversation" card and the list entry
    // can't lead back into it. The server hides it from the list as well.
    const left = conversationId;
    setConversationId("");
    setMessages([]);
    setRecent((items) => items.filter((item) => item.id !== left));
    if (leaveTargetRef.current === "list") openChatList();
    else closeWidget();
  }
  // The panel always reopens fresh on the next visit — carrying a stale
  // "leave chat?" prompt across sessions would be confusing.
  useEffect(() => {
    if (leaveOpen) { setLeaveOpen(false); setRatingChoice(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // The browser/phone Back button is caught by the loader (tag.js), on the
  // host page — the iframe can't see that navigation on its own, so the
  // loader re-arms its history marker and tells us instead of closing
  // outright. Re-subscribed on every dependency requestLeave reads, so it
  // always acts on the current conversation rather than a stale one.
  useEffect(() => {
    function onBackPressed(event: MessageEvent) {
      if (event.source !== window.parent || !event.data || typeof event.data !== "object") return;
      try { if (new URL(event.origin).hostname !== hostname) return; } catch { return; }
      if ((event.data as { type?: unknown }).type !== "elpino:back-pressed") return;
      requestLeave();
    }
    window.addEventListener("message", onBackPressed);
    return () => window.removeEventListener("message", onBackPressed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostname, tab, chatView, conversationId, messages, leaveOpen]);

  function announceReplies(count: number, latestReply?: WidgetMessage) {
    if (panelOpenRef.current && !document.hidden) return;
    if (latestReply) setReplyPreview(latestReply);
    if (soundOnRef.current) playMessageChime();
    // A count only, never message content: the host page is a different site.
    window.parent.postMessage({ type: "elpino:unread", count }, "*");
  }

  const identityReadyRef = useRef(false);
  const rejectedIdentityRef = useRef<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);

  useEffect(() => {
    function markReady() {
      identityReadyRef.current = true;
      setIdentityReady(true);
    }
    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent || !event.data || typeof event.data !== "object") return;
      try { if (new URL(event.origin).hostname !== hostname) return; } catch { return; }
      const data = event.data as { type?: unknown; token?: unknown };
      if (data.type === "elpino:identity") {
        const token = typeof data.token === "string" && data.token ? data.token : null;
        const restart = identityReadyRef.current && token !== identityTokenRef.current;
        identityTokenRef.current = token;
        if (!identityReadyRef.current) markReady();
        if (restart && token && silentRefreshRef.current && activeVisitorRef.current.startsWith("ws_")) {
          // The token asked for ahead of the session cap: swap quietly.
          silentRefreshRef.current = false;
          void refreshSilently(token);
        } else if (restart) {
          // Logged in, logged out or switched user after the chat started —
          // or just a fresh token for the same not-yet-verified visitor; the
          // start() call below is what actually finds out which. The draft
          // is kept here and cleared once the new session reports a
          // different account (see accountRefRef in the start effect); the
          // anonymous visitor token is kept for the same reason — the start
          // effect already clears it itself if this token turns out to
          // verify to someone.
          silentRefreshRef.current = false;
          discardSession({ keepDraft: true, keepVisitorToken: true });
          setRetryCount((count) => count + 1);
        }
      } else if (data.type === "elpino:panel") {
        const isOpen = Boolean((data as { open?: unknown }).open);
        panelOpenRef.current = isOpen;
        if (isOpen) setReplyPreview(null);
        // Closing always restores the normal size on the loader's side
        // (see tag.js) — mirror that here so reopening doesn't show
        // "Restore size" for a panel that's already back to normal.
        if (!isOpen) setIsMaximized(false);
      } else if (data.type === "elpino:page") {
        const page = event.data as { path?: unknown; title?: unknown };
        if (typeof page.path === "string" && page.path.startsWith("/")) {
          sitePageRef.current = { path: page.path.slice(0, 300), title: typeof page.title === "string" ? page.title.slice(0, 160) : "" };
          setSitePageVersion((version) => version + 1);
        }
      } else if (data.type === "elpino:logout") {
        // Forget this browser's session entirely, so the next person on it
        // cannot resume the signed-out user's conversations.
        identityTokenRef.current = null;
        discardSession();
        if (!identityReadyRef.current) markReady();
        setRetryCount((count) => count + 1);
      }
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "elpino:widget-ready" }, "*");
    const fallback = window.setTimeout(() => { if (!identityReadyRef.current) markReady(); }, IDENTITY_WAIT_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(fallback);
    };
  }, [key, hostname, discardSession]);

  useEffect(() => {
    if (!sessionExpiresAt) return;
    // A few minutes before the hard cap, ask the page for a fresh token; when
    // it arrives the session is swapped without clearing anything.
    const REFRESH_LEAD_MS = 3 * 60 * 1000;
    const refreshTimer = window.setTimeout(() => {
      silentRefreshRef.current = true;
      window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
    }, Math.max(0, sessionExpiresAt - REFRESH_LEAD_MS - Date.now()));
    // Reached the cap without a fresh token: restart, keeping the draft.
    const expire = () => {
      identityTokenRef.current = null;
      discardSession({ keepDraft: true });
      setRetryCount((count) => count + 1);
      window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
    };
    const timer = window.setTimeout(expire, Math.max(0, sessionExpiresAt - Date.now()));
    const onFocus = () => { if (Date.now() >= sessionExpiresAt) expire(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearTimeout(refreshTimer);
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [sessionExpiresAt, discardSession]);

  function retireSession(token: string) {
    if (!token.startsWith("ws_")) return;
    void fetch("/api/widget/logout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken: token }), keepalive: true }).catch(() => undefined);
  }

  // Exchanges a fresh token for a new session for the same account while the
  // current one is still valid. Messages, draft and attachment stay as they
  // are; the server has already moved open conversations to the new session.
  async function refreshSilently(token: string) {
    const epoch = sessionEpochRef.current;
    const previous = activeVisitorRef.current;
    try {
      const response = await fetch("/api/widget/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, hostname, identityToken: token }),
      });
      const data = (await response.json()) as StartResult & { sessionExpiresAt?: number | null; accountRef?: string };
      const fresh = data.allowed && data.identified && data.visitorToken?.startsWith("ws_") ? data.visitorToken : null;
      if (epoch !== sessionEpochRef.current || activeVisitorRef.current !== previous) {
        // Logged out or switched while this was in flight: never adopt it.
        if (fresh) retireSession(fresh);
        return;
      }
      if (!fresh || data.accountRef !== accountRefRef.current) {
        // Refused, or a different account: a full restart decides what to show.
        if (fresh) retireSession(fresh);
        discardSession();
        setRetryCount((count) => count + 1);
        return;
      }
      activeVisitorRef.current = fresh;
      setVisitorToken(fresh);
      setSessionExpiresAt(data.sessionExpiresAt ?? null);
      retireSession(previous);
    } catch {
      // Network trouble: keep the current session, which is still valid. The
      // hard cap falls back to a normal restart.
    }
  }

  useEffect(() => {
    if (!key || !hostname) { setDenied(true); setLoading(false); return; }
    if (!identityReady) return;
    setLoading(true);
    setLoadFailed(false);
    const storedToken = readVisitorToken(key);
    const controller = new AbortController();
    const epoch = sessionEpochRef.current;
    // Without this, a request that never resolves (dropped connection, dev
    // server hiccup, flaky network) leaves the widget stuck on the loading
    // spinner forever instead of ever surfacing an error to retry from.
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, START_TIMEOUT_MS);
    fetch("/api/widget/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, hostname, visitorToken: storedToken, identityToken: identityTokenRef.current ?? undefined }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: StartResult & { sessionExpiresAt?: number | null; accountRef?: string }) => {
        if (controller.signal.aborted || epoch !== sessionEpochRef.current) {
          if (data.visitorToken?.startsWith("ws_")) void fetch("/api/widget/logout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken: data.visitorToken }), keepalive: true }).catch(() => undefined);
          return;
        }
        if (!data.allowed) {
          if (data.identityError) {
            console.warn(`[Elpino] Identity token was not accepted: ${data.identityError}`);
            const rejected = identityTokenRef.current;
            if (rejectedIdentityRef.current !== rejected) {
              rejectedIdentityRef.current = rejected;
              window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
            }
            // Chat anonymously rather than showing an error. A single-use
            // token rendered into the page is refused once its session has
            // ended; a fresh token from the page signs the visitor back in.
            identityTokenRef.current = null;
            setRetryCount((count) => count + 1);
          } else setDenied(true);
          return;
        }
        setDenied(false);
        // For the site's developer: why ElpinoTag.identify() did not sign
        // the visitor in (expired, bad_signature, not_configured…).
        if (data.identityError) console.warn(`[Elpino] Identity token was not accepted: ${data.identityError}`);
        setBotName(data.botName || "Elpino Support");
        setBotAvatarUrl(data.botAvatarUrl ?? null);
        setSiteLogoUrl(data.logoUrl ?? null);
        setShowBranding(!data.removeBranding);
        const realName = data.identified && data.customerName && data.customerName !== "Website visitor" ? data.customerName.trim().split(/\s+/)[0] : null;
        setGreetingName(realName || null);
        setHomeName(data.customerName && data.customerName !== "Website visitor" ? data.customerName.trim().split(/\s+/)[0] : null);
        if (Array.isArray(data.greetingLines) && data.greetingLines.length > 0) setGreetingLines(data.greetingLines);
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 3) : []);
        activeVisitorRef.current = data.visitorToken ?? "";
        // A different person than before (after an expiry that kept the
        // draft): nothing typed for the previous account carries over.
        if (accountRefRef.current && data.accountRef !== accountRefRef.current) {
          setDraft("");
          setAnswers({});
          setPendingAttachment(null);
          pendingTopicRef.current = null;
        }
        accountRefRef.current = data.accountRef ?? null;
        setSessionExpiresAt(data.sessionExpiresAt ?? null);
        if (data.identified) clearVisitorToken(key);
        else if (data.visitorToken) writeVisitorToken(key, data.visitorToken);

        // The blocking pre-chat form is retired in favor of a conversational
        // ask — the AI requests name/email in its own greeting (see
        // widget.service.ts identity()'s needsContact line) instead of
        // gating the whole widget behind a form. preChatNeeded stays wired
        // up (PreChatFieldInput, submitPreChat) for a workspace that still
        // wants it, but nothing here flips it on anymore.
        if (data.visitorToken) setVisitorToken(data.visitorToken);

        // startFresh (the greeting-popup's "new chat" flow) deliberately
        // skips resuming — nothing is created server-side until the visitor
        // actually sends a message, so this just means "show an empty
        // thread" rather than requiring an extra API call.
        if (!startFresh) {
          // The thread open on the previous page, if it isn't the one the
          // server resumed (an older thread opened from the list, say). Used
          // once: a restart after login, logout or a user switch resumes
          // whatever the server says, never a previous person's thread. The
          // poll below loads its messages, and drops it if it has ended or
          // isn't this visitor's.
          const restored = restoredConversationRef.current;
          restoredConversationRef.current = null;
          if (restored && restored !== data.conversationId) {
            setConversationId(restored);
            setMessages([]);
          } else {
            // Cleared as well as set: a restart after login, logout or a user
            // switch must not keep showing the previous person's thread.
            setConversationId(data.conversationId ?? "");
            setMessages(data.messages ?? []);
          }
        }
      })
      .catch(() => { if ((!controller.signal.aborted || timedOut) && epoch === sessionEpochRef.current) setLoadFailed(true); })
      .finally(() => {
        window.clearTimeout(timeout);
        if (epoch === sessionEpochRef.current) setLoading(false);
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hostname, retryCount, identityReady]);

  useEffect(() => {
    if (!key || !hostname) return;
    const params = new URLSearchParams({ key, hostname });
    fetch(`/api/widget/prechat-fields?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { allowed?: boolean; fields?: PreChatField[] }) => {
        if (data.allowed && Array.isArray(data.fields)) setPreChatFields(data.fields);
      })
      .catch(() => undefined);
  }, [key, hostname]);

  useEffect(() => {
    if (!key || !hostname) return;
    const params = new URLSearchParams({ key, hostname });
    let cancelled = false;
    function loadTeam() {
      fetch(`/api/widget/team?${params.toString()}`)
        .then((response) => response.json())
        .then((data: { allowed?: boolean; members?: TeamMember[]; onlineCount?: number }) => {
          if (cancelled || !data.allowed) return;
          setTeam(data.members ?? []);
          setOnlineCount(data.onlineCount ?? 0);
        })
        .catch(() => undefined);
    }
    loadTeam();
    // A one-time fetch left "online" frozen at whatever it was on page
    // load — a teammate closing their tab never updated a visitor's
    // already-open widget. Polling is what makes this actually live.
    const interval = window.setInterval(loadTeam, TEAM_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [key, hostname]);

  function loadRecent() {
    if (!visitorToken) return;
    setRecentLoading(true);
    const epoch = sessionEpochRef.current;
    fetch("/api/widget/conversations/list", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken }) })
      .then((response) => response.json())
      .then((data: { conversations?: ConversationSummary[]; allowed?: boolean }) => {
        if (epoch !== sessionEpochRef.current) return;
        if (data.allowed === false && activeVisitorRef.current.startsWith("ws_")) {
          identityTokenRef.current = null;
          discardSession({ keepDraft: true });
          setRetryCount((count) => count + 1);
          window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
          return;
        }
        setRecent(data.conversations ?? []);
      })
      .catch(() => setRecent([]))
      .finally(() => setRecentLoading(false));
  }

  useEffect(() => {
    if (tab === "chat" && chatView === "home" && visitorToken && !loading) loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, chatView, visitorToken, loading]);

  function openChatList() {
    setTab("chat");
    setChatView("list");
    loadRecent();
  }

  // Tell the loader where the visitor is, so the next page on the site opens
  // here too (see VIEW_KEY in tag.js). Held back until the session has
  // loaded: before that, the empty starting conversation would overwrite the
  // one being carried over.
  useEffect(() => {
    if (loading) return;
    window.parent.postMessage({ type: "elpino:view", tab, chatView, conversationId }, "*");
  }, [loading, tab, chatView, conversationId]);

  // Carried over onto the chat list: it needs loading, which normally
  // happens when the visitor taps into it.
  const restoreListRef = useRef(restoredTab === "chat" && restoredChatView === "list");

  // ---- Help tab: articles the workspace marked visible to visitors, scoped
  // to this site. Listed once when the tab is first opened; searched as the
  // visitor types, debounced so each keystroke isn't a request.
  const [helpArticles, setHelpArticles] = useState<HelpArticle[] | null>(null);
  const [helpQuery, setHelpQuery] = useState("");
  const [helpCollection, setHelpCollection] = useState<string | null>(null);
  const [helpResults, setHelpResults] = useState<HelpArticle[] | null>(null);
  const [helpSearching, setHelpSearching] = useState(false);
  const [openArticle, setOpenArticle] = useState<HelpArticleBody | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);

  useEffect(() => {
    if (helpArticles !== null || !key || !hostname) return;
    const params = new URLSearchParams({ key, hostname });
    fetch(`/api/widget/help/articles?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { articles?: HelpArticle[] }) => setHelpArticles(data.articles ?? []))
      .catch(() => setHelpArticles([]));
  }, [helpArticles, key, hostname]);

  useEffect(() => {
    const query = helpQuery.trim();
    if (query.length < 2) { setHelpResults(null); setHelpSearching(false); return; }
    setHelpSearching(true);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ key, hostname, q: query });
      fetch(`/api/widget/help/search?${params.toString()}`)
        .then((response) => response.json())
        .then((data: { articles?: HelpArticle[] }) => { if (!cancelled) setHelpResults(data.articles ?? []); })
        .catch(() => { if (!cancelled) setHelpResults([]); })
        .finally(() => { if (!cancelled) setHelpSearching(false); });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [helpQuery, key, hostname]);

  function openHelpArticle(id: string) {
    setArticleLoading(true);
    const params = new URLSearchParams({ key, hostname, id });
    fetch(`/api/widget/help/article?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { article?: HelpArticleBody }) => setOpenArticle(data.article ?? null))
      .catch(() => setOpenArticle(null))
      .finally(() => setArticleLoading(false));
  }

  // "Still need help?" — a fresh chat that starts from the article they
  // just read, so they don't have to explain what they were looking at.
  function askAboutArticle(article: HelpArticleBody) {
    setOpenArticle(null);
    startNewChat();
    setDraft(`About "${article.title}": `);
  }
  useEffect(() => {
    if (!restoreListRef.current || loading || !visitorToken) return;
    restoreListRef.current = false;
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, visitorToken]);

  function openThread(id: string) {
    setConversationId(id);
    setChatView("thread");
    setTab("chat");
  }

  function preChatCanSubmit() {
    return preChatFields.every((field) => {
      if (!field.required) return true;
      const value = answers[field.id];
      return field.type === "checkbox" && !field.multiple ? value === "true" : Boolean(value?.trim());
    });
  }

  async function submitPreChat() {
    if (preChatSubmitting || !visitorToken || !preChatCanSubmit()) return;
    setPreChatSubmitting(true);
    const epoch = sessionEpochRef.current;
    try {
      const payloadAnswers: Record<string, string> = {};
      for (const field of preChatFields) {
        const raw = answers[field.id];
        if (!raw) continue;
        payloadAnswers[field.id] = field.type === "phone" ? `${COUNTRIES[formCountry].code} ${raw.trim()}` : raw.trim();
      }

      const response = await fetch("/api/widget/prechat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          hostname,
          visitorToken,
          conversationId: conversationId || undefined,
          answers: payloadAnswers,
        }),
      });
      if (epoch !== sessionEpochRef.current || !response.ok) return;
      const result = await response.json();
      if (!result.allowed || epoch !== sessionEpochRef.current) return;
      // Filling in the form doesn't create a conversation by itself — if the
      // visitor doesn't have one yet, remember the topic so it's applied
      // once they actually send their first message (see sendPayload).
      if (!conversationId) pendingTopicRef.current = payloadAnswers.topic ?? null;
      setPreChatNeeded(false);
      setTab("chat");
      setChatView("thread");
    } finally {
      if (epoch === sessionEpochRef.current) setPreChatSubmitting(false);
    }
  }

  function closeWidget() {
    window.parent.postMessage({ type: "elpino:close" }, "*");
  }

  // Abandons the resumed conversation (if any) so the next message starts a
  // fresh thread — nothing is created here; see sendPayload for where a
  // conversation actually gets written once the visitor sends something.
  function startNewChat() {
    setConversationId("");
    setMessages([]);
    setChatView("thread");
    setTab("chat");
  }

  useEffect(() => {
    if (joinDeadline === null) return;
    setJoinNow(Date.now());
    const timer = window.setInterval(() => setJoinNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [joinDeadline]);

  useEffect(() => {
    if (!conversationId || !visitorToken || tab !== "chat" || chatView !== "thread") return;
    let cancelled = false;
    const epoch = sessionEpochRef.current;
    const poll = () => {
      fetch("/api/widget/messages/read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken, conversationId }) })
        .then((response) => response.json())
        .then((data: { messages?: WidgetMessage[]; agentTyping?: boolean; agent?: { name?: string } | null; joinDeadlineAt?: string | null; serverNow?: string; error?: string; ended?: boolean; contactAsk?: { fields?: ContactField[]; askId?: string } | null }) => {
          if (cancelled || epoch !== sessionEpochRef.current) return;
          // Left with Leave Chat (in another tab, say): drop the thread and go
          // back to the list rather than treating it as a broken session.
          if (data.ended) {
            setConversationId("");
            setMessages([]);
            openChatList();
            return;
          }
          // Not this visitor's thread (a carried-over thread from before they
          // signed out, say). A signed-in session handles this below by
          // refreshing; an anonymous one would otherwise sit on an empty
          // thread forever.
          if (data.error && !activeVisitorRef.current.startsWith("ws_")) {
            setConversationId("");
            setMessages([]);
            openChatList();
            return;
          }
          if (data.error && activeVisitorRef.current.startsWith("ws_")) {
            identityTokenRef.current = null;
            discardSession({ keepDraft: true });
            setRetryCount((count) => count + 1);
            window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
            return;
          }
          if (data.messages) {
            // Only replies that arrive while this thread is already being
            // watched count as new; opening or restoring a thread is silent.
            const watching = seenConversationRef.current === conversationId;
            const replies = watching
              ? data.messages.filter((message) => !seenMessageIdsRef.current.has(message.id) && (message.senderType === "agent" || message.senderType === "ai"))
              : [];
            if (!watching) {
              seenMessageIdsRef.current = new Set();
              seenConversationRef.current = conversationId;
            }
            for (const message of data.messages) seenMessageIdsRef.current.add(message.id);
            if (replies.length) announceReplies(replies.length, replies[replies.length - 1]);
            const polled = data.messages;
            // A reply that reached the thread by polling also ends any stream.
            if (polled.length && polled[polled.length - 1].senderType !== "customer") setStreamingReply(null);
            // A poll that left before a reply was saved returns without it, while the live socket has already
            // shown it: keep such a just-arrived message instead of making it vanish until the next poll.
            setMessages((prev) => {
              const known = new Set(polled.map((message) => message.id));
              const recent = Date.now() - 15_000;
              const arrived = prev.filter((message) => !known.has(message.id) && Date.parse(message.createdAt) > recent);
              return arrived.length ? [...polled, ...arrived] : polled;
            });
          }
          setAgentTyping(!!data.agentTyping);
          setAgentName(data.agent?.name?.trim() || null);
          // Convert the server's deadline into this device's clock so a wrong
          // local time can't shorten or stretch the countdown.
          if (data.serverNow) {
            const serverNow = Date.parse(data.serverNow);
            if (!Number.isNaN(serverNow)) setServerOffset(serverNow - Date.now());
          }
          if (data.joinDeadlineAt && data.serverNow) {
            setJoinDeadline(Date.now() + (Date.parse(data.joinDeadlineAt) - Date.parse(data.serverNow)));
          } else {
            setJoinDeadline(null);
          }
          const fields = data.contactAsk?.fields?.filter((field): field is ContactField => field in CONTACT_PROMPTS) ?? [];
          // The newest AI message decides: while it is asking for a detail, the message box becomes a field for it.
          setContactFields(fields.length ? fields : null);
          setContactAskId(fields.length ? data.contactAsk?.askId ?? "" : "");
        })
        .catch(() => undefined);
    };
    poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [conversationId, visitorToken, tab, chatView, key, hostname, discardSession]);

  // A voice call from the team. Its own socket, open for the whole conversation (not just while the thread is
  // on screen), so the phone rings whichever tab the visitor is on; the loader is asked to open the panel.
  const widgetCall = useWidgetCall({
    gatewayWsOrigin: GATEWAY_WS_ORIGIN,
    siteKey: key,
    hostname,
    visitorToken,
    conversationId,
    onRing: () => window.parent.postMessage({ type: "elpino:open" }, "*"),
  });

  // Live push for the instant a reply is approved and saved — see
  // apps/gateway/src/realtime/realtime.service.ts's /rt/widget channel. The
  // poll above still runs alongside this as the reliability fallback (socket
  // drop, gateway restart, etc.), so a message is never lost, only possibly
  // duplicated — seenMessageIdsRef dedupes either way.
  useEffect(() => {
    if (!conversationId || !visitorToken || tab !== "chat" || chatView !== "thread") return;
    let closed = false;
    let socket: WebSocket | null = null;
    let reconnectDelay = 1000;
    let reconnectTimer: number | null = null;
    const epoch = sessionEpochRef.current;

    function connect() {
      if (closed) return;
      const params = new URLSearchParams({ key, hostname, visitorToken, conversationId });
      socket = new WebSocket(`${GATEWAY_WS_ORIGIN}/rt/widget?${params.toString()}`);
      socket.onopen = () => { reconnectDelay = 1000; };
      socket.onmessage = (event) => {
        if (closed || epoch !== sessionEpochRef.current) return;
        let data: { type?: string; message?: WidgetMessage; update?: { streamId?: unknown; seq?: unknown; text?: unknown; state?: unknown } };
        try {
          data = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if (data.type === "reply_stream" && data.update && typeof data.update.streamId === "string" && typeof data.update.seq === "number") {
          const { streamId, seq, text, state } = data.update as { streamId: string; seq: number; text?: unknown; state?: unknown };
          setStreamingReply((current) => {
            if (state === "discard") return current?.streamId === streamId ? null : current;
            if (typeof text !== "string" || !text.trim()) return current;
            // Updates can arrive out of order: only a newer one counts.
            if (current?.streamId === streamId && current.seq >= seq) return current;
            return { streamId, seq, text };
          });
          if (state !== "discard") setAgentTyping(false);
          return;
        }
        if (data.type !== "message" || !data.message || data.message.id === undefined) return;
        const message = data.message;
        if (seenMessageIdsRef.current.has(message.id)) return;
        seenMessageIdsRef.current.add(message.id);
        const isReply = message.senderType === "agent" || message.senderType === "ai";
        setMessages((prev) => (prev.some((existing) => existing.id === message.id) ? prev : [...prev, message]));
        if (isReply) {
          // The saved reply takes the place of the text that was streaming.
          setStreamingReply(null);
          // The reply is the definitive end of "typing" — don't wait for the
          // next poll (up to POLL_MS later) to clear it, or the dots sit
          // there under a reply that's already on screen.
          setAgentTyping(false);
          announceReplies(1, message);
        }
      };
      socket.onclose = (event) => {
        if (closed || event.code >= 4000) return;
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      };
      socket.onerror = () => socket?.close();
    }
    connect();
    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [conversationId, visitorToken, tab, chatView, key, hostname]);

  // Report the visitor's current page once there is a conversation, and again when
  // it changes. Debounced so a burst of navigations sends one request.
  useEffect(() => {
    const page = sitePageRef.current;
    if (!page || !conversationId || !visitorToken) return;
    const timer = window.setTimeout(() => {
      fetch("/api/widget/page", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, hostname, visitorToken, conversationId, path: page.path, title: page.title }),
      }).catch(() => undefined);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [sitePageVersion, conversationId, visitorToken, key, hostname]);

  const lastTypingPingRef = useRef(0);
  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingPingRef.current < TYPING_PING_MS) return;
    lastTypingPingRef.current = now;
    if (!conversationId || !visitorToken) return;
    fetch("/api/widget/typing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, hostname, visitorToken, conversationId }),
    }).catch(() => undefined);
  }

  // Stick-to-bottom, not force-to-bottom: a poll or a live-pushed reply
  // shouldn't yank someone back down while they're reading older messages.
  // Only follows new content when they were already at the bottom.
  const stickToBottomRef = useRef(true);
  function handleThreadScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }
  // A different thread, or a stream nothing has updated for a while (the reply arrives by polling anyway).
  useEffect(() => { setStreamingReply(null); }, [conversationId]);
  useEffect(() => {
    if (!streamingReply) return;
    const timer = window.setTimeout(() => setStreamingReply(null), 20_000);
    return () => window.clearTimeout(timer);
  }, [streamingReply]);
  useEffect(() => {
    // Opening a thread (new conversation, switching back to it, or the
    // panel reopening) always starts at the bottom regardless of where a
    // previous scroll position left off.
    stickToBottomRef.current = true;
  }, [conversationId, chatView]);
  useEffect(() => {
    if (stickToBottomRef.current) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, tab, chatView, agentTyping, contactFields, contactAskId, contactDoneFor, streamingReply?.text]);

  async function sendPayload(body: string, attachment: Attachment | null, options?: { restoreDraft?: boolean }): Promise<boolean> {
    if (sending || !visitorToken || (!body && !attachment)) return false;
    const restoreDraft = options?.restoreDraft !== false;
    // Sending a message is the visitor's own action — it should always
    // carry the view down to it, even if they'd scrolled up to read back.
    stickToBottomRef.current = true;
    setSending(true);
    const epoch = sessionEpochRef.current;
    try {
      const response = await fetch("/api/widget/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          hostname,
          visitorToken,
          conversationId: conversationId || undefined,
          body,
          attachment: attachment ?? undefined,
          // Only meaningful the first time — postMessage() applies this at
          // conversation-creation time and ignores it otherwise.
          topic: conversationId ? undefined : pendingTopicRef.current ?? undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { conversationId?: string; greeting?: WidgetMessage | null; message?: WidgetMessage; error?: string };
      if (epoch !== sessionEpochRef.current) return false;
      // A server error body ({"statusCode":500,"message":"Internal server error"}) has a `message` too, but it is a
      // string, not a chat message. Only an object with an id is one; anything else is a failed send.
      const sentMessage = data.message && typeof data.message === "object" && typeof data.message.id === "string" ? data.message : null;
      if (!data.error && (!response.ok || !sentMessage)) {
        if (body && restoreDraft) setDraft(body);
        if (attachment) setPendingAttachment(attachment);
        setAttachError("Couldn't send that. Please try again.");
        return false;
      }
      if (data.error) {
        // Not sent: give the text back rather than losing it. If the session
        // ended, restart (keeping the draft) and ask the page for a fresh token.
        if (body && restoreDraft) setDraft(body);
        if (attachment) setPendingAttachment(attachment);
        if (activeVisitorRef.current.startsWith("ws_")) {
          identityTokenRef.current = null;
          discardSession({ keepDraft: true });
          setRetryCount((count) => count + 1);
          window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
        }
        return false;
      }
      if (data.conversationId && data.conversationId !== conversationId) {
        // This message just created the conversation — sync up so polling,
        // typing pings, etc. start targeting the real id.
        setConversationId(data.conversationId);
        pendingTopicRef.current = null;
        const opening = [data.greeting, sentMessage].filter((item): item is WidgetMessage => !!item);
        setMessages(opening);
      } else if (sentMessage) {
        setMessages((current) => [...current, sentMessage]);
      }
      return true;
    } finally {
      if (epoch === sessionEpochRef.current) setSending(false);
    }
  }

  const contactActive = Boolean(contactFields?.length) && contactDoneFor !== contactAskId && Boolean(conversationId);
  const contactField = contactActive ? contactFields![contactStep] : undefined;

  useEffect(() => {
    setContactFields(null);
    setContactAskId("");
    setContactDoneFor("");
    setContactStep(0);
    setContactValue("");
    setContactError("");
    setContactThanks(null);
  }, [conversationId]);

  useEffect(() => {
    if (!contactThanks) return;
    const timer = window.setTimeout(() => setContactThanks(null), 5000);
    return () => window.clearTimeout(timer);
  }, [contactThanks]);

  function finishContact(note: string | null = null) {
    setContactDoneFor(contactAskId);
    setContactFields(null);
    setContactStep(0);
    setContactValue("");
    setContactError("");
    setContactThanks(note);
  }

  async function submitContactStep() {
    if (!contactField || contactSaving) return;
    const value = contactValue.trim();
    if (!value) return;
    if (contactField === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setContactError("That doesn't look like an email address."); return; }
    if (contactField === "phone") {
      const digits = value.replace(/\D/g, "").length;
      if (digits < 10 || digits > 15) { setContactError("Enter a phone number with country code."); return; }
    }
    setContactSaving(true);
    try {
      // Saved to the customer's record and handed to the AI as a hidden message: an email, number or name typed
      // into the field doesn't appear as a bubble in the visitor's chat.
      const response = await fetch("/api/widget/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, hostname, visitorToken, conversationId: conversationId || undefined, [contactField]: value }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; aiWillReply?: boolean };
      if (!response.ok || data.error) { setContactError("Couldn't save that. Try again or skip."); return; }
      if (contactField === "name") setHomeName(value.split(/\s+/)[0]);
      if (data.aiWillReply) {
        // The AI answers it like any reply (greeting them by name and carrying on with their question), so the
        // typing dots show straight away instead of after the next poll, and no separate note is needed.
        setAgentTyping(true);
        finishContact();
      } else {
        // Nobody is answering right now (the team has the conversation): just confirm it was saved.
        finishContact(
          contactField === "name" ? `Nice to meet you, ${value.split(/\s+/)[0]}.`
            : contactField === "email" ? "Thanks. We'll use that email to reach you."
            : "Thanks. We'll use that number to reach you.",
        );
      }
    } catch {
      setContactError("Couldn't save that. Try again or skip.");
    } finally {
      setContactSaving(false);
    }
  }

  // Skipping dismisses just this question; the normal message box comes back and the AI won't ask again.
  function skipContactStep() {
    finishContact();
  }

  async function sendMessage() {
    const body = draft.trim();
    const attachment = pendingAttachment;
    if (!body && !attachment) return;
    if (sendBlockedByReply) return;
    setDraft("");
    setPendingAttachment(null);
    await sendPayload(body, attachment);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAttachError("");
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError("File is too large (max 4MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPendingAttachment({ url, type: file.type.startsWith("image/") ? "image" : "file", name: file.name });
    };
    reader.onerror = () => setAttachError("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  function togglePanel(panel: "emoji" | "gif") {
    setActivePanel((current) => (current === panel ? null : panel));
    if (panel === "gif" && gifResults.length === 0) void searchGifs("");
  }

  async function searchGifs(query: string) {
    setGifLoading(true);
    try {
      const endpoint = query.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=15&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=15&rating=g`;
      const response = await fetch(endpoint);
      const data = await response.json();
      const results: GifResult[] = (data.data ?? []).map((item: any) => ({
        id: item.id,
        url: item.images?.fixed_height?.url ?? item.images?.original?.url,
        preview: item.images?.fixed_height_small?.url ?? item.images?.fixed_height?.url,
      }));
      setGifResults(results.filter((item) => item.url));
    } catch {
      setGifResults([]);
    } finally {
      setGifLoading(false);
    }
  }

  async function pickGif(gif: GifResult) {
    setActivePanel(null);
    await sendPayload("", { url: gif.url, type: "gif" });
  }

  function insertEmoji(emoji: string) {
    setDraft((current) => current + emoji);
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setMicSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    const baseDraft = draft ? `${draft} ` : "";
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setDraft(baseDraft + transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  const initial = useMemo(() => (botName.trim() || "R").charAt(0).toUpperCase(), [botName]);
  // The salutation ("Hi there 👋") is swapped for the identified visitor's first
  // name and the rest of the workspace's own greeting copy is left untouched.
  // Kept identical to personalizedGreeting in workspace-service, which saves the
  // same lines as real messages: a greeting is one message, so only its leading
  // "Hi there" changes; an older several-line greeting swaps its whole first line.
  const displayGreetingLines = useMemo(() => {
    const salutation = /^Hi there(?:\s*👋)?/u;
    let lines = greetingLines;
    if (greetingName) {
      if (greetingLines.length > 1) lines = [`Hi ${greetingName} 👋`, ...greetingLines.slice(1)];
      else if (greetingLines.length === 1 && salutation.test(greetingLines[0])) lines = [greetingLines[0].replace(salutation, `Hi ${greetingName} 👋`)];
    }
    // One message, the same as the launcher popup: a greeting stored as several lines is joined.
    return [lines.join(" ")];
  }, [greetingLines, greetingName]);
  // Consecutive messages from the same sender are one item in the thread
  // list, not one each — otherwise every bubble, even ones seconds apart
  // from the same reply, gets the full inter-group gap meant to separate
  // one sender/exchange from the next.
  const messageGroups = useMemo(() => {
    const groups: MessageGroup[] = [];
    for (const message of messages) {
      if (message.senderType === "system") {
        groups.push({ kind: "system", message });
        continue;
      }
      const last = groups[groups.length - 1];
      const lastMessage = last?.kind === "thread" ? last.messages[last.messages.length - 1] : null;
      if (last?.kind === "thread" && lastMessage?.senderType === message.senderType && lastMessage?.senderId === message.senderId) {
        last.messages.push(message);
      } else {
        groups.push({ kind: "thread", fromVisitor: message.senderType === "customer", messages: [message] });
      }
    }
    return groups;
  }, [messages]);
  // A small real team still reads as "just us" — pad the apparent headcount
  // to a random total strictly between 5 and 12 (i.e. 6-11), stable for the
  // life of this mount so it doesn't visibly change while someone's looking
  // at it. Real teams already at or above that size just show their true
  // count instead of a padded one.
  const paddedTeamTotal = useMemo(() => Math.floor(Math.random() * 6) + 6, []);

  // The opening greeting of a new chat shows typing dots for a beat and then appears whole, instead of being
  // on screen the instant the chat opens, which read as canned. Client-side only: it is the same text the
  // server saves as the first message once the visitor sends something.
  const greetingText = displayGreetingLines[0] ?? "";
  const showingGreeting = !loading && tab === "chat" && chatView === "thread" && messages.length === 0 && !conversationId;
  const [greetingReady, setGreetingReady] = useState(false);
  useEffect(() => {
    setGreetingReady(false);
    if (!showingGreeting || !greetingText) return;
    const timer = window.setTimeout(() => setGreetingReady(true), 900);
    return () => window.clearTimeout(timer);
  }, [showingGreeting, greetingText]);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-[12px]" style={{ backgroundColor: BG, color: MUTED }}>Loading…</div>;
  }
  if (denied) {
    return <div className="flex h-full items-center justify-center px-6 text-center text-[12px]" style={{ backgroundColor: BG, color: MUTED }}>This chat isn&apos;t available on this site.</div>;
  }
  if (loadFailed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: BG }}>
        <p className="text-[12px]" style={{ color: MUTED }}>Couldn&apos;t load chat. Check your connection and try again.</p>
        <button
          type="button"
          onClick={() => { setLoadFailed(false); setRetryCount((count) => count + 1); }}
          className="rounded-full px-4 py-2 text-[12px] font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (replyPreview && !panelOpenRef.current) {
    return (
      <div className="h-full bg-transparent p-1">
        <div
          className="group relative flex h-full cursor-pointer items-start gap-3 overflow-hidden rounded-[16px] border bg-white px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: BORDER, color: INK }}
          role="button"
          tabIndex={0}
          aria-label="Open new support reply"
          onClick={() => window.parent.postMessage({ type: "elpino:open" }, "*")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") window.parent.postMessage({ type: "elpino:open" }, "*");
          }}
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
            {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
          </span>
          <div className="min-w-0 flex-1 pr-7">
            <p className="text-[12px] font-semibold leading-5">{botName}</p>
            <p className="line-clamp-3 text-[13px] leading-[18px]" style={{ color: "rgba(24,24,27,.76)" }}>
              {replyPreview.body || "Sent you a new reply"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss reply preview"
            className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
            onClick={(event) => {
              event.stopPropagation();
              setReplyPreview(null);
              window.parent.postMessage({ type: "elpino:preview-dismiss" }, "*");
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (preChatNeeded) {
    const canSubmit = preChatCanSubmit() && !preChatSubmitting;
    return (
      <div className="flex h-full flex-col" style={{ backgroundColor: BG, color: INK }}>
        <div className="shrink-0 px-5 pb-6 pt-5">
          <button type="button" aria-label="Back to home" onClick={() => { setPreChatNeeded(false); setTab("chat"); setChatView("thread"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
            <ChevronLeft size={20} />
          </button>
          <p className="mt-3 text-[17px] font-semibold leading-6">Please share a few details here so {botName} can connect you with the right person.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-t-[28px] px-5 pb-6 pt-6 shadow-[0_-1px_0_rgba(16,24,40,.04)]" style={{ backgroundColor: SURFACE, color: "#1c1c1e" }}>
          <form className="space-y-3.5" onSubmit={(event) => { event.preventDefault(); void submitPreChat(); }}>
            {preChatFields.map((field) => (
              <PreChatFieldInput
                key={field.id}
                field={field}
                value={answers[field.id] ?? ""}
                onChange={(value) => setAnswer(field.id, value)}
                formCountry={formCountry}
                setFormCountry={setFormCountry}
              />
            ))}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold text-white transition disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >
              {preChatSubmitting ? "Starting…" : "Start conversation"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Home, Messages and Help show the tab bar; a conversation and a help article need the room.
  // While the team has been notified and nobody has joined (the countdown), the AI is not answering: a detail the
  // team still needs is asked for in the field, and otherwise the message box is locked until they join or the
  // countdown ends, so nothing can be typed into a void.
  const teamWaiting = joinDeadline !== null && joinDeadline > joinNow;
  const composerLocked = sendBlockedByReply || teamWaiting;
  // The AI message the open question belongs to; a question raised by the wait itself has none.
  const contactAskedMessage = messages.find((message) => message.id === contactAskId);

  const showTabBar = !preChatNeeded && ((tab === "chat" && (chatView === "home" || chatView === "list")) || (tab === "help" && !openArticle && !articleLoading));

  return (
    <div className="relative flex h-full flex-col" style={{ backgroundColor: BG, color: INK, colorScheme: "light" }}>
      {widgetCall.call && (
        <CallOverlay
          call={widgetCall.call}
          avatarUrl={botAvatarUrl}
          accent={ACCENT}
          onAccept={() => void widgetCall.accept()}
          onDecline={widgetCall.decline}
          onHangUp={widgetCall.hangUp}
          onToggleMute={widgetCall.toggleMute}
          onDismiss={widgetCall.dismiss}
        />
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "chat" && chatView === "home" ? (
          <div className="flex h-full flex-col">
            <div className="px-5 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <SiteMark key={siteLogoUrl ?? hostname} logoUrl={siteLogoUrl} hostname={hostname} />
                <div className="flex items-center gap-3">
                  {/* The AI agent first, then the people on the team: "AI Agent and team can help". */}
                  <div className="flex -space-x-2.5" aria-label="The AI agent and the team are here to help you">
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white ring-2" style={{ backgroundColor: ACCENT, ["--tw-ring-color" as string]: BG }} title={botName}>
                      {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                    </span>
                    {team.slice(0, 2).map((member) => (
                      <span key={member.id} className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white ring-2" style={{ backgroundColor: "#6b7280", ["--tw-ring-color" as string]: BG }}>
                        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : (member.name?.trim().charAt(0).toUpperCase() || "?")}
                        {member.online && <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full ring-2" style={{ backgroundColor: "#3ecf6a", ["--tw-ring-color" as string]: BG }} />}
                      </span>
                    ))}
                  </div>
                  <button type="button" aria-label="Close" onClick={() => requestLeave()} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <h1 className="mt-12 text-[26px] font-semibold leading-[32px] tracking-[-0.01em]">
                <span className="block" style={{ color: MUTED }}>{`Hello${homeName ? ` ${homeName}` : ""}.`}</span>
                <span className="block">How can we help?</span>
              </h1>
              <p className="mt-3 text-[13.5px] leading-5" style={{ color: MUTED }}>Our team will reach out to you within 24 hours.</p>
            </div>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-4 pt-0">
              <button
                type="button"
                onClick={startNewChat}
                // Same look as the pricing page: a solid ink border and no shadow, on white.
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-[#11120f] p-4 text-left"
                style={{ backgroundColor: "#ffffff" }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[#11120f]">Ask a question</span>
                  <span className="mt-0.5 block text-[12px] text-[#11120f]/70">AI Agent and team can help</span>
                </span>
                <SendHorizontal size={18} className="shrink-0 text-[#11120f]" />
              </button>

              {(() => {
                // The latest conversation, if there is one: the list when it has loaded, otherwise the open thread.
                const latest = recent[0];
                const target = latest?.id ?? conversationId;
                if (!target) return null;
                const preview = latest ? latest.preview : messages[messages.length - 1]?.body;
                const ago = latest ? compactAgo(latest.time, clock + serverOffset) : "";
                return (
                  <button
                    type="button"
                    onClick={() => openThread(target)}
                    className="w-full cursor-pointer rounded-2xl border-2 border-[#11120f] p-4 text-left text-[#11120f]"
                    style={{ backgroundColor: "#fff8ec" }}
                  >
                    <span className="block text-[14px] font-semibold">Recent message</span>
                    <span className="mt-2.5 flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                        {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-medium">{botName}</span>
                          {ago && <span className="shrink-0 text-[12px]" style={{ color: MUTED }}>{ago}</span>}
                        </span>
                        <span className="block truncate text-[12.5px]" style={{ color: MUTED }}>{preview || "Pick up where you left off"}</span>
                      </span>
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        ) : tab === "help" ? (
          <div className="flex h-full flex-col">
            {openArticle || articleLoading ? (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3" style={{ borderColor: BORDER }}>
                  <button type="button" aria-label="Back to help" onClick={() => { setOpenArticle(null); setArticleLoading(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5">
                    <ChevronLeft size={19} />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{openArticle?.title ?? "Help"}</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  {articleLoading || !openArticle ? (
                    <p className="text-[12px]" style={{ color: MUTED }}>Loading…</p>
                  ) : (
                    <>
                      {(() => {
                        const { summary, body, headings } = prepareArticle(openArticle.content);
                        return (
                          <>
                            <h2 className="text-[26px] font-semibold leading-8 tracking-[-0.01em]">{openArticle.title}</h2>
                            {summary && <p className="mt-2 text-[14.5px] leading-6" style={{ color: MUTED }}>{summary}</p>}
                            {openArticle.createdAt && !Number.isNaN(Date.parse(openArticle.createdAt)) && (
                              <p className="mt-3 text-[12px]" style={{ color: MUTED }}>
                                {new Date(openArticle.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                              </p>
                            )}
                            {headings.length > 1 && (
                              <details className="group mt-4 rounded-lg border" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13.5px] [&::-webkit-details-marker]:hidden">
                                  Table of contents
                                  <ChevronDown size={16} className="transition group-open:rotate-180" />
                                </summary>
                                <ul className="border-t px-4 py-2" style={{ borderColor: BORDER }}>
                                  {headings.map((heading) => (
                                    <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? 12 : 0 }}>
                                      <button
                                        type="button"
                                        onClick={() => document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                        className="w-full py-1.5 text-left text-[13px] hover:underline"
                                      >
                                        {heading.text}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                            <div className="mt-4" style={{ color: INK }}>
                              <ArticleMarkdown text={body} />
                            </div>
                          </>
                        );
                      })()}
                      {openArticle.sourceUrl && /^https?:\/\//i.test(openArticle.sourceUrl) && (
                        <a href={openArticle.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: ACCENT }}>
                          View original page <ExternalLink size={13} />
                        </a>
                      )}
                    </>
                  )}
                </div>
                {openArticle && !articleLoading && (
                  <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                    <p className="text-[12px]" style={{ color: MUTED }}>Still need help?</p>
                    <button type="button" onClick={() => askAboutArticle(openArticle)} className="mt-2 w-full rounded-full py-2.5 text-[13px] font-semibold text-white" style={{ backgroundColor: ACCENT }}>
                      Ask {botName}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="relative flex shrink-0 items-center justify-center border-b px-4 py-4" style={{ borderColor: BORDER }}>
                  <p className="text-[15px] font-semibold">Help</p>
                  <button type="button" aria-label="Close" onClick={() => requestLeave()} className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5">
                    <X size={16} />
                  </button>
                </div>
                <div className="shrink-0 px-4 pt-3">
                  <div className="flex items-center gap-2 rounded-full px-3.5 py-2.5" style={{ backgroundColor: BUBBLE }}>
                    <Search size={14} style={{ color: MUTED }} />
                    <input
                      value={helpQuery}
                      onChange={(event) => setHelpQuery(event.target.value)}
                      placeholder="Search for help"
                      maxLength={100}
                      className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9aa0a6]"
                      style={{ color: INK }}
                    />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                  {(() => {
                    const searching = helpQuery.trim().length >= 2;
                    const shown = searching ? helpResults : helpArticles;
                    if (shown === null || (searching && helpSearching)) {
                      return <p className="px-3 py-6 text-[11.5px]" style={{ color: MUTED }}>Loading…</p>;
                    }
                    if (shown.length === 0) {
                      return (
                        <div className="px-3 py-6">
                          <p className="text-[12px]" style={{ color: MUTED }}>{searching ? "No articles match that." : "No help articles yet."}</p>
                          <button type="button" onClick={() => { startNewChat(); if (searching) setDraft(helpQuery.trim()); }} className="mt-3 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white" style={{ backgroundColor: ACCENT }}>
                            Ask {botName} instead
                          </button>
                        </div>
                      );
                    }
                    // Group by collection only when there is more than one; a single group reads better as a plain list.
                    const groups = new Map<string, HelpArticle[]>();
                    for (const article of helpArticles ?? []) {
                      const name = collectionOf(article);
                      groups.set(name, [...(groups.get(name) ?? []), article]);
                    }
                    const names = [...groups.keys()].sort((x, y) => (x === GENERAL_COLLECTION ? 1 : 0) - (y === GENERAL_COLLECTION ? 1 : 0));
                    const grouped = !searching && names.length > 1;
                    if (grouped && helpCollection === null) {
                      return names.map((name) => {
                        const count = groups.get(name)!.length;
                        return (
                          <button key={name} type="button" onClick={() => setHelpCollection(name)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition hover:bg-black/[0.035]">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-semibold">{name}</span>
                              <span className="mt-0.5 block text-[12px]" style={{ color: MUTED }}>{count} {count === 1 ? "article" : "articles"}</span>
                            </span>
                            <ChevronRight size={15} className="shrink-0" style={{ color: MUTED }} />
                          </button>
                        );
                      });
                    }
                    const list = grouped && helpCollection !== null ? groups.get(helpCollection) ?? [] : shown;
                    return (
                      <>
                        {grouped && helpCollection !== null && (
                          <button type="button" onClick={() => setHelpCollection(null)} className="mb-1 flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold">
                            <ChevronLeft size={16} />
                            {helpCollection}
                          </button>
                        )}
                        {list.map((article) => (
                          <button key={article.id} type="button" onClick={() => openHelpArticle(article.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-black/[0.035]">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-semibold">{article.title}</span>
                              <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-4" style={{ color: MUTED }}>{article.snippet}</span>
                            </span>
                            <ChevronRight size={15} className="shrink-0" style={{ color: MUTED }} />
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        ) : chatView === "list" ? (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-[20px] font-semibold leading-7">Messages</h2>
              <button type="button" aria-label="Close" onClick={() => requestLeave()} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-3">
              {recentLoading && recent.length === 0 ? (
                // Placeholders while the list loads, in the shape of the cards that will replace them.
                [0, 1].map((placeholder) => (
                  <div key={placeholder} className="flex animate-pulse items-center gap-3 rounded-xl border p-3" style={{ borderColor: BORDER }}>
                    <span className="h-9 w-9 shrink-0 rounded-full bg-black/[0.07]" />
                    <span className="min-w-0 flex-1 space-y-2">
                      <span className="block h-3 w-1/3 rounded bg-black/[0.07]" />
                      <span className="block h-3 w-3/4 rounded bg-black/[0.05]" />
                    </span>
                  </div>
                ))
              ) : recent.length === 0 ? (
                <div className="rounded-xl border border-dashed px-5 py-8 text-center" style={{ borderColor: "rgba(24,24,27,.3)" }}>
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd84d] text-[#11120f]">
                    <MessageSquare size={18} />
                  </span>
                  <p className="mt-3 text-[14px] font-semibold">No messages yet</p>
                  <p className="mt-1 text-[12.5px] leading-5" style={{ color: MUTED }}>Start a conversation and it will show up here.</p>
                </div>
              ) : (
                recent.map((conversation) => {
                  const resolved = conversation.status === "resolved";
                  const label = conversation.topic?.trim() || (resolved ? "Resolved" : "");
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openThread(conversation.id)}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 text-left"
                      style={{ borderColor: BORDER }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                        {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold">{botName}</span>
                          <span className="shrink-0 text-[11.5px]" style={{ color: MUTED }}>{compactAgo(conversation.time, clock + serverOffset)}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] leading-5" style={{ color: MUTED }}>{conversation.preview || "New conversation"}</span>
                        {label && (
                          <span className="mt-1.5 inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10.5px] font-medium text-[#11120f]" style={{ backgroundColor: resolved && !conversation.topic ? "#f1f1ee" : "#ffe680" }}>
                            {label}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex shrink-0 justify-center px-4 pb-3 pt-1">
              <button
                type="button"
                onClick={startNewChat}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#11120f] bg-white px-5 text-[13px] font-semibold text-[#11120f]"
              >
                <CircleHelp size={15} />
                Ask a question
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="relative flex shrink-0 items-center justify-between px-3 py-2" style={{ backgroundColor: BG }}>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Back to chats" onClick={() => requestLeave("list")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.07] transition hover:bg-black/[0.12]"><ChevronLeft size={19} /></button>
                <div className="relative flex max-w-[220px] flex-col items-start gap-0.5 py-0.5">
                  <h2 className="min-w-0 truncate text-[14px] font-bold leading-5" style={{ color: INK }}>{agentName ?? botName}</h2>
                  <p className="min-w-0 text-[11.5px] leading-4" style={{ color: MUTED }}>{agentName ? "Support team" : "AI Assistant"}</p>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                  <PopoverTrigger aria-label="More options" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.07] transition hover:bg-black/[0.12]">
                    <MoreHorizontal size={20} />
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={6} className="w-52 p-1.5">
                    <button type="button" onClick={toggleSound} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium hover:bg-black/5">
                      {soundOn ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      {soundOn ? "Mute notifications" : "Unmute notifications"}
                    </button>
                    <button type="button" onClick={toggleMaximize} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium hover:bg-black/5">
                      {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      {isMaximized ? "Restore size" : "Maximize"}
                    </button>
                    {/* Only a chat that has actually started can be ended. */}
                    {conversationId && messages.some((message) => message.senderType !== "system") && (
                      <button type="button" onClick={() => { setMoreOpen(false); endChat(); }} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium hover:bg-black/5">
                        <LogOut size={16} />
                        End chat
                      </button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div ref={scrollRef} onScroll={handleThreadScroll} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-5 pt-4">
              {messages.length === 0 && !conversationId && (
                // Nothing is saved yet — this greeting is purely client-side
                // until the visitor's first reply actually creates the
                // conversation (see sendPayload), so a look-and-leave visit
                // never touches the database.
                // A single group, one child of the space-y-5 thread — the
                // 20px gap there is for spacing between message groups, not
                // between these lines of the same greeting. Grouped tight
                // together here the way consecutive same-sender messages
                // are further down.
                <div className="space-y-1">
                  {displayGreetingLines.map((line, index) => (
                    <div key={index} className="w-fit max-w-[85%] space-y-1">
                      {!greetingReady ? (
                        <div className="flex w-fit items-center rounded-2xl px-3.5 py-3.5" style={{ backgroundColor: BUBBLE }} aria-label="Typing">
                          <TypingDots color="rgba(24,24,27,.45)" />
                        </div>
                      ) : (
                        <>
                          <div className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-6" style={{ backgroundColor: BUBBLE, color: INK }}>
                            {line}
                          </div>
                          <p className="px-1 text-[11px] leading-4" style={{ color: MUTED }}>AI agent · {timeAgo(greetedAt, clock)}</p>
                        </>
                      )}
                    </div>
                  ))}
                  {greetingReady && !sending && draft.trim() === "" && suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3" role="group" aria-label="Suggested questions">
                      {suggestions.map((question) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() => void sendPayload(question, null)}
                          className="rounded-full border px-3.5 py-2 text-left text-[13px] transition hover:bg-black/[0.04]"
                          style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {messages.length === 0 && conversationId && (
                <div className="flex min-h-[120px] items-center justify-center text-[11.5px]" style={{ color: MUTED }}>Loading conversation…</div>
              )}
              {messageGroups.map((group) => {
                // A teammate joining or leaving the chat. Centered and quiet:
                // it is a thing that happened to the conversation, not a
                // message from anyone, so it must not read as one.
                if (group.kind === "system") {
                  const message = group.message;
                  return (
                    <div key={message.id} className="flex items-center gap-2 py-0.5">
                      <span className="h-px flex-1" style={{ backgroundColor: BORDER }} />
                      <span className="whitespace-nowrap text-[11px]" style={{ color: MUTED }}>{message.body}</span>
                      <span className="h-px flex-1" style={{ backgroundColor: BORDER }} />
                    </div>
                  );
                }

                // One run of consecutive messages from the same sender is a
                // single item in the thread's own space-y-5 list, so that
                // 20px gap only ever falls *between* runs — a sender switch,
                // a visitor reply, a pause long enough to be a new group.
                // Bubbles within the run sit almost touching (gap-0.5): the gap is for a change of sender.
                const { fromVisitor, messages: groupMessages } = group;
                const first = groupMessages[0];

                return (
                  <div key={first.id} className="flex flex-col gap-0.5">
                    {groupMessages.map((message, messageIndex) => {
                      const hasImage = message.attachmentUrl && (message.attachmentType === "image" || message.attachmentType === "gif");
                      const hasFile = message.attachmentUrl && message.attachmentType === "file";
                      const displayBody = message.body;

                      const bubble = (
                        <div className="w-fit max-w-[85%] space-y-1">
                          {hasImage && (
                            <img src={message.attachmentUrl!} alt={message.attachmentName ?? ""} className="max-h-52 w-auto rounded-2xl object-cover" />
                          )}
                          {hasFile && (
                            <a
                              href={message.attachmentUrl!}
                              download={message.attachmentName ?? "file"}
                              className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-medium"
                              style={fromVisitor ? { backgroundColor: "transparent", border: `1px solid ${BORDER}`, color: INK } : { backgroundColor: BUBBLE, color: INK }}
                            >
                              <FileIcon size={15} className="shrink-0" />
                              <span className="min-w-0 truncate">{message.attachmentName ?? "Attachment"}</span>
                            </a>
                          )}
                          {message.body && (
                            fromVisitor ? (
                              // No background: the visitor's own words sit on the plain widget, right-aligned.
                              <div className="px-0.5 py-1 text-[13px] leading-5" style={{ color: INK }}>
                                <MessageMarkdown text={displayBody} />
                              </div>
                            ) : (
                              <div className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-6" style={{ backgroundColor: BUBBLE, color: INK }}>
                                <MessageMarkdown text={displayBody} />
                              </div>
                            )
                          )}
                          {!fromVisitor && messageIndex === groupMessages.length - 1 && !(contactActive && message.id === contactAskId) && (
                            <p className="px-1 text-[11px] leading-4" style={{ color: MUTED }}>
                              {/* So a visitor can tell an AI answer from a teammate's: "AI agent" vs the person's name. */}
                              {message.senderType === "ai" ? "AI agent" : `${agentName ?? "Support team"} · Support team`} · {timeAgo(Date.parse(message.createdAt) || clock + serverOffset, clock + serverOffset)}
                            </p>
                          )}
                        </div>
                      );

                      if (fromVisitor) {
                        return <div key={message.id} className="flex justify-end">{bubble}</div>;
                      }
                      return (
                        <div key={message.id} className="flex items-start">
                          {bubble}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {joinDeadline !== null && (() => {
                const remaining = Math.max(0, Math.ceil((joinDeadline - joinNow) / 1000));
                return (
                  <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                    <span className="flex h-7 min-w-[46px] items-center justify-center rounded-full px-2 text-[12px] font-semibold tabular-nums text-white" style={{ backgroundColor: ACCENT }}>
                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
                    </span>
                    <p className="text-[11.5px] leading-4" style={{ color: MUTED }}>
                      {remaining > 0 ? "We've notified the team. Someone should join any moment." : "Still checking with the team…"}
                    </p>
                  </div>
                );
              })()}
              {contactActive && contactField && (
                // The answer to the AI's question above, in the conversation itself, like a reply. The message
                // box below stays usable, so typing there instead is simply not answering.
                <div className="w-full max-w-[85%]">
                  {!contactAskedMessage && <p className="mb-1.5 px-1 text-[13.5px] leading-5">{CONTACT_PROMPTS[contactField].label}</p>}
                  <div className="flex items-center rounded-md border py-1.5 pl-3 pr-2" style={{ borderColor: contactError ? "#e5626a" : "rgba(24,24,27,0.28)", backgroundColor: SURFACE }}>
                    <input
                      key={contactField}
                      autoFocus
                      type={CONTACT_PROMPTS[contactField].type}
                      value={contactValue}
                      onChange={(event) => { setContactValue(event.target.value); setContactError(""); }}
                      onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void submitContactStep(); } }}
                      placeholder={CONTACT_PROMPTS[contactField].placeholder}
                      aria-label={CONTACT_PROMPTS[contactField].label}
                      autoComplete={contactField === "email" ? "email" : contactField === "phone" ? "tel" : "name"}
                      className="h-8 min-w-0 flex-1 bg-transparent px-1 text-[14px] outline-none placeholder:text-[#777b82]"
                      style={{ color: INK }}
                    />
                    <button
                      type="button"
                      onClick={() => void submitContactStep()}
                      disabled={!contactValue.trim() || contactSaving}
                      aria-label="Send"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition disabled:opacity-100"
                      style={{ backgroundColor: contactValue.trim() ? ACCENT : "#eceef0", color: contactValue.trim() ? "#fff" : "#b5b8bd" }}
                    >
                      <ArrowUp size={15} strokeWidth={2.2} />
                    </button>
                  </div>
                  {contactError && <p className="mt-1.5 px-1 text-[11px] text-[#e5626a]">{contactError}</p>}
                  {/* The attribution that would sit under the question, moved below the field so the two read as one block. */}
                  <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] leading-4" style={{ color: MUTED }}>
                    <span>{contactAskedMessage ? `AI agent · ${timeAgo(Date.parse(contactAskedMessage.createdAt) || clock + serverOffset, clock + serverOffset)}` : "For the team"}</span>
                    <button type="button" onClick={skipContactStep} className="underline underline-offset-2 hover:opacity-80">Skip</button>
                  </div>
                </div>
              )}
              {streamingReply && (
                <div className="flex items-end">
                  <div className="w-fit max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-6" style={{ backgroundColor: BUBBLE, color: INK }} aria-live="polite">
                    <MessageMarkdown text={streamingReply.text} />
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse rounded-full" style={{ backgroundColor: MUTED }} aria-hidden="true" />
                  </div>
                </div>
              )}
              {agentTyping && !streamingReply && (
                <div className="flex items-center">
                  <div className="flex items-center rounded-2xl px-3.5 py-3" style={{ backgroundColor: BUBBLE, width: "fit-content" }}>
                    <TypingDots color="rgba(24,24,27,.45)" />
                  </div>
                </div>
              )}
            </div>
            <div className="relative px-5 pb-3 pt-2">
              {activePanel === "emoji" && (
                <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border p-2.5 shadow-xl" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>Emoji</p>
                    <button type="button" onClick={() => setActivePanel(null)} className="rounded-full p-1 hover:bg-black/5"><X size={13} /></button>
                  </div>
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="rounded-lg p-1.5 text-[17px] leading-none hover:bg-black/5">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activePanel === "gif" && (
                <div className="absolute bottom-full left-3 right-3 mb-2 flex max-h-72 flex-col rounded-2xl border p-2.5 shadow-xl" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: BUBBLE }}>
                      <Search size={12} style={{ color: MUTED }} />
                      <input
                        value={gifQuery}
                        onChange={(event) => setGifQuery(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") void searchGifs(gifQuery); }}
                        placeholder="Search GIFs…"
                        className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#9aa0a6]"
                        style={{ color: INK }}
                      />
                    </div>
                    <button type="button" onClick={() => setActivePanel(null)} className="rounded-full p-1 hover:bg-black/5"><X size={13} /></button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {gifLoading ? (
                      <p className="py-6 text-center text-[11.5px]" style={{ color: MUTED }}>Loading…</p>
                    ) : gifResults.length === 0 ? (
                      <p className="py-6 text-center text-[11.5px]" style={{ color: MUTED }}>No GIFs found.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {gifResults.map((gif) => (
                          <button key={gif.id} type="button" onClick={() => void pickGif(gif)} className="overflow-hidden rounded-lg">
                            <img src={gif.preview} alt="" className="h-16 w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pendingAttachment && (
                <div className="mb-2 flex items-center gap-2 rounded-xl border px-2.5 py-2" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                  {pendingAttachment.type === "image" ? (
                    <img src={pendingAttachment.url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: BUBBLE, color: INK }}><FileIcon size={15} /></span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: MUTED }}>{pendingAttachment.name ?? "Attachment"}</span>
                  <button type="button" onClick={() => setPendingAttachment(null)} className="rounded-full p-1 hover:bg-black/5"><X size={13} /></button>
                </div>
              )}
              {attachError && <p className="mb-2 px-1 text-[11px] text-[#e5626a]">{attachError}</p>}
              {contactThanks && !contactActive && (
                <p className="mb-2 px-1 text-[12.5px]" style={{ color: MUTED }}>{contactThanks}</p>
              )}

              {/* While the AI is asking for a detail, the answer field in the conversation is the only input. */}
              {!(contactActive && contactField) && (
              // While the AI is replying the box is dimmed and inert, not just quietly refusing to send.
              <div
                aria-disabled={composerLocked}
                className={`rounded-[24px] border px-3 pb-2.5 pt-3 shadow-[0_3px_12px_rgba(15,23,42,.10)] transition-opacity duration-200 ${composerLocked ? "pointer-events-none select-none opacity-55" : ""}`}
                style={{ borderColor: "rgba(24,24,27,0.28)", backgroundColor: SURFACE }}
              >
                <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
                <textarea
                  ref={composerRef}
                  disabled={composerLocked}
                  value={draft}
                  onChange={(event) => { setDraft(event.target.value); notifyTyping(); }}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                  placeholder={sendBlockedByReply ? `${botName.trim() || "Elpino"} is replying…` : teamWaiting ? "The team will join any moment…" : "Ask anything…"}
                  rows={1}
                  className="block max-h-[132px] min-h-[24px] w-full resize-none bg-transparent px-1 text-[14px] leading-6 outline-none placeholder:text-[#777b82]"
                  style={{ color: INK }}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5" style={{ color: COMPOSER_ICON }}>
                      <Paperclip size={16} strokeWidth={1.8} />
                    </button>
                    <button type="button" aria-label="Emoji" onClick={() => togglePanel("emoji")} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5" style={{ color: activePanel === "emoji" ? ACCENT : COMPOSER_ICON }}>
                      <Smile size={17} strokeWidth={1.8} />
                    </button>
                    {GIPHY_KEY && <button type="button" aria-label="GIF" aria-pressed={activePanel === "gif"} onClick={() => togglePanel("gif")} className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5" style={{ color: activePanel === "gif" ? ACCENT : COMPOSER_ICON }}>
                      <span className="flex h-[15px] items-center rounded-[4px] border-[1.5px] px-[3px] text-[8px] font-extrabold leading-none tracking-tight">GIF</span>
                    </button>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={(!draft.trim() && !pendingAttachment) || sending || composerLocked}
                    aria-label="Send"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition disabled:opacity-100"
                    style={{ backgroundColor: (draft.trim() || pendingAttachment) && !composerLocked ? ACCENT : "#eceef0", color: (draft.trim() || pendingAttachment) && !composerLocked ? "#fff" : "#b5b8bd" }}
                  >
                    <ArrowUp size={15} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Home, Messages and Help. Not shown inside a conversation, where the message box needs the room,
          or while reading a help article. */}
      {showTabBar && (
        <nav aria-label="Widget sections" className="flex shrink-0 border-t-2 border-[#11120f]" style={{ backgroundColor: SURFACE }}>
          {([
            { id: "home", label: "Home", Icon: House, active: tab === "chat" && chatView === "home", go: () => { setTab("chat"); setChatView("home"); } },
            { id: "messages", label: "Messages", Icon: MessageSquare, active: tab === "chat" && chatView === "list", go: openChatList },
            { id: "help", label: "Help", Icon: CircleHelp, active: tab === "help", go: () => setTab("help") },
          ]).filter(({ id }) => id !== "help" || tab === "help" || (helpArticles?.length ?? 0) > 0).map(({ id, label, Icon, active, go }) => (
            <button
              key={id}
              type="button"
              onClick={go}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition hover:opacity-80"
              style={{ color: active ? INK : MUTED, fontWeight: active ? 600 : 400 }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          ))}
        </nav>
      )}

      {showBranding && (
        <a href="https://elpino.chat" target="_blank" rel="noreferrer" className="block shrink-0 pb-2 pt-0 text-center text-[10px] font-medium transition hover:text-[#18181b]" style={{ color: MUTED, backgroundColor: showTabBar ? SURFACE : BG }}>
          Powered by <span className="underline underline-offset-2">elpino.chat</span>
        </a>
      )}
      {leaveOpen && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center" style={{ backgroundColor: SURFACE, color: INK }}>
          <p className="text-[19px] font-bold leading-6">Did we help you?</p>
          <p className="mt-1.5 text-[13px] leading-5" style={{ color: MUTED }}>Your feedback matters</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setRatingChoice(1)}
              aria-label="Good"
              aria-pressed={ratingChoice === 1}
              className="flex h-14 w-14 items-center justify-center rounded-full transition"
              style={{ backgroundColor: ratingChoice === 1 ? ACCENT : BUBBLE }}
            >
              <ThumbsUp size={22} color={ratingChoice === 1 ? "#fff" : INK} />
            </button>
            <button
              type="button"
              onClick={() => setRatingChoice(-1)}
              aria-label="Not good"
              aria-pressed={ratingChoice === -1}
              className="flex h-14 w-14 items-center justify-center rounded-full transition"
              style={{ backgroundColor: ratingChoice === -1 ? ACCENT : BUBBLE }}
            >
              <ThumbsDown size={22} color={ratingChoice === -1 ? "#fff" : INK} />
            </button>
          </div>
          <div className="mt-8 flex w-full items-center gap-3">
            <button type="button" onClick={goBack} className="flex-1 text-[14px] font-bold" style={{ color: ACCENT }}>
              Go Back
            </button>
            <button
              type="button"
              disabled={leaving}
              onClick={() => void leaveChat()}
              className="flex-[1.4] rounded-full py-3 text-[14px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: ACCENT }}
            >
              {leaving ? "Leaving…" : "Leave Chat"}
            </button>
          </div>
          <p className="mt-4 text-[11.5px] leading-4" style={{ color: MUTED }}>
            Leaving the chat will end this session. If you need to chat with us again, we&apos;ll have a record of your chat history.
          </p>
        </div>
      )}
    </div>
  );
}

function PreChatFieldInput({
  field,
  value,
  onChange,
  formCountry,
  setFormCountry,
}: {
  field: PreChatField;
  value: string;
  onChange: (value: string) => void;
  formCountry: number;
  setFormCountry: (index: number) => void;
}) {
  if (field.type === "phone") {
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[11.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <div className="flex items-stretch overflow-hidden rounded-full border border-[#e1e3e6] focus-within:border-[#18181b]">
          <div className="relative shrink-0 border-r border-[#e1e3e6]">
            <select
              value={formCountry}
              onChange={(event) => setFormCountry(Number(event.target.value))}
              className="h-full appearance-none bg-transparent py-3 pl-4 pr-7 text-[13px] text-[#1c1c1e] outline-none"
            >
              {COUNTRIES.map((country, index) => (
                <option key={country.name} value={index}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          </div>
          <input
            type="tel"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder || "555 000 0000"}
            required={field.required}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[13px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6]"
          />
        </div>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[11.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={3}
          className="w-full resize-none rounded-2xl border border-[#e1e3e6] px-4 py-3 text-[13px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6] focus:border-[#18181b]"
        />
      </label>
    );
  }

  if (field.type === "select") {
    const options = field.options ?? [];
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[11.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <div className="relative">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            className="w-full appearance-none rounded-full border border-[#e1e3e6] bg-transparent px-4 py-3 pr-9 text-[13px] text-[#1c1c1e] outline-none focus:border-[#18181b]"
          >
            <option value="" disabled>{field.placeholder || "Choose an option"}</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
        </div>
      </label>
    );
  }

  if (field.type === "radio") {
    const options = field.options ?? [];
    return (
      <div>
        <p className="mb-2 text-[13px] font-bold">{field.label}</p>
        <div className="space-y-0.5">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 hover:bg-black/[0.03]">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                style={{ borderColor: value === option ? ACCENT : "#c7cbd1" }}
              >
                {value === option && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />}
              </span>
              <input type="radio" name={field.id} value={option} checked={value === option} onChange={() => onChange(option)} className="sr-only" />
              <span className="text-[13px]">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox" && field.multiple) {
    const options = field.options ?? [];
    const selected = value ? value.split(",") : [];
    const toggleOption = (option: string) => {
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
      onChange(next.join(","));
    };
    return (
      <div>
        <p className="mb-2 text-[13px] font-bold">{field.label}</p>
        <div className="space-y-0.5">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 hover:bg-black/[0.03]">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} className="h-4 w-4 shrink-0 rounded border-[#c7cbd1]" />
              <span className="text-[13px]">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(event.target.checked ? "true" : "")}
          required={field.required}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#c7cbd1]"
        />
        <span className="text-[13px] text-[#1c1c1e]">{field.label}</span>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block px-1 text-[11.5px] font-semibold text-[#4a4f57]">{field.label}</span>
      <input
        type={field.type === "email" ? "email" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className="w-full rounded-full border border-[#e1e3e6] px-4 py-3 text-[13px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6] focus:border-[#18181b]"
      />
    </label>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-[12px]" style={{ backgroundColor: BG, color: MUTED }}>Loading…</div>}>
      <WidgetContent />
    </Suspense>
  );
}
