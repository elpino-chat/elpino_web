"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, ChevronDown, ChevronLeft, CircleHelp, File as FileIcon, Home, LayoutGrid, Mic, MessageCircle, MessageSquarePlus, Paperclip, Search, Smile, Square, Volume2, VolumeX, X } from "lucide-react";
import MessageMarkdown from "@/app/components/MessageMarkdown";
import TypingDots from "@/app/components/TypingDots";
import { playMessageChime, primeOnFirstInteraction } from "@/lib/notification-sound";

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
type StartResult = { allowed: boolean; visitorToken?: string; conversationId?: string; botName?: string; botAvatarUrl?: string | null; greetingLines?: string[]; removeBranding?: boolean; topic?: string | null; customerEmail?: string | null; identified?: boolean; identityError?: string; messages?: WidgetMessage[]; error?: string };
type ConversationSummary = { id: string; status: string; topic?: string | null; preview: string; time: string };
type ChatView = "list" | "thread";
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

const DEFAULT_PRECHAT_FIELDS: PreChatField[] = [
  { id: "name", label: "Name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "phone", label: "Phone", type: "phone", required: true },
  {
    id: "topic",
    label: "What are you looking for today?",
    type: "select",
    required: true,
    options: ["General question", "Billing", "Technical support", "Cloud migration", "I want a quote"],
  },
];

const ACCENT = "#428ce5";
// Ink: the widget's primary text/icon color on its light surface. A few
// interactive accents (the pre-chat radio dot) key off ACCENT instead so
// they read as "selected", not just "text".
const INK = "#18181b";
const BG = "#f6f7f8";
const SURFACE = "#ffffff";
// Neutral chip background — the customer's own reply bubble uses ACCENT
// instead; this is for everything else that needs a soft fill (attachment
// preview, disabled composer state, the typing indicator).
const BUBBLE = "#eef1f4";
const BORDER = "#e4e6ea";
const MUTED = "rgba(24,24,27,.55)";
const ICON_MUTED = "rgba(24,24,27,.62)";
const POLL_MS = 2000;
// Same http->ws origin swap as app/tag.js/route.ts's gatewayWsOrigin() — kept
// separate since that one runs server-side and this runs in the browser.
// Missing the NODE_ENV fallback here meant local dev pointed this socket at
// production (wss://api.elpino.chat) instead of the local gateway, so it
// silently never connected and the widget fell back to poll-only — no
// word-by-word reveal, even though the feature worked once deployed.
const GATEWAY_WS_ORIGIN = (
  process.env.NEXT_PUBLIC_GATEWAY_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat")
).replace(/^http/, "ws");
const REVEAL_MS_PER_WORD = 45;
const TEAM_POLL_MS = 15000;
const START_TIMEOUT_MS = 12000;
const TYPING_PING_MS = 2000;
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
// Giphy's well-known public "beta" test key — fine for demo-scale traffic,
// rate-limited; swap for a real key before any real production usage.
const GIPHY_KEY = "dc6zaTOxFJmzC";
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

function WidgetContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key")?.trim() ?? "";
  const hostname = searchParams.get("host")?.trim() ?? "";
  const startFresh = searchParams.get("new") === "1";

  const [tab, setTab] = useState<"home" | "chat">(startFresh ? "chat" : "home");
  const [chatView, setChatView] = useState<ChatView>("thread");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [botName, setBotName] = useState("Elpino Support");
  const [botAvatarUrl, setBotAvatarUrl] = useState<string | null>(null);
  const [greetingLines, setGreetingLines] = useState<string[]>(["Hi there 👋", "How can I help you today?"]);
  // Paid plans drop the badge. Starts true so a slow or failed config load
  // shows it rather than silently white-labelling a Free workspace.
  const [showBranding, setShowBranding] = useState(true);
  const [visitorToken, setVisitorToken] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
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
  const [preChatFields, setPreChatFields] = useState<PreChatField[]>(DEFAULT_PRECHAT_FIELDS);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formCountry, setFormCountry] = useState(0);
  const pendingTopicRef = useRef<string | null>(null);

  function setAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const discardSession = useCallback((options: { keepDraft?: boolean } = {}) => {
    const oldToken = activeVisitorRef.current;
    activeVisitorRef.current = "";
    sessionEpochRef.current += 1;
    if (oldToken.startsWith("ws_")) {
      void fetch("/api/widget/logout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken: oldToken }), keepalive: true }).catch(() => undefined);
    }
    clearVisitorToken(key);
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
  function announceReplies(count: number) {
    if (panelOpenRef.current && !document.hidden) return;
    if (soundOnRef.current) playMessageChime();
    // A count only, never message content: the host page is a different site.
    window.parent.postMessage({ type: "elpino:unread", count }, "*");
  }

  // Word-by-word reveal for a message pushed live over /rt/widget: the text
  // itself was already generated and safety-reviewed before it ever reached
  // the widget, so this is purely a client-side typing effect, not a token
  // stream from the model. See the WebSocket effect below for where it's
  // triggered, and revealMap for how the render picks it up.
  const [revealMap, setRevealMap] = useState<Record<string, string>>({});
  const revealTimersRef = useRef<Map<string, number>>(new Map());
  function revealWordByWord(id: string, full: string) {
    const existing = revealTimersRef.current.get(id);
    if (existing) window.clearTimeout(existing);
    const words = full.split(/(\s+)/);
    let shown = 0;
    setRevealMap((prev) => ({ ...prev, [id]: "" }));
    const step = () => {
      shown++;
      let partial = words.slice(0, shown).join("");
      // Close a half-revealed **bold** so it renders bold mid-reveal instead of flashing raw asterisks.
      if ((partial.match(/\*\*/g)?.length ?? 0) % 2 === 1) partial += "**";
      setRevealMap((prev) => (prev[id] === undefined ? prev : { ...prev, [id]: partial }));
      if (shown < words.length) {
        revealTimersRef.current.set(id, window.setTimeout(step, REVEAL_MS_PER_WORD));
      } else {
        revealTimersRef.current.delete(id);
        setRevealMap((prev) => {
          if (prev[id] === undefined) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    };
    step();
  }
  useEffect(() => {
    return () => {
      for (const timer of revealTimersRef.current.values()) window.clearTimeout(timer);
    };
  }, []);

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
          // Logged in, logged out or switched user after the chat started.
          // The draft is kept here and cleared once the new session reports a
          // different account (see accountRefRef in the start effect).
          silentRefreshRef.current = false;
          discardSession({ keepDraft: true });
          setRetryCount((count) => count + 1);
        }
      } else if (data.type === "elpino:panel") {
        panelOpenRef.current = Boolean((data as { open?: unknown }).open);
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
        setShowBranding(!data.removeBranding);
        if (Array.isArray(data.greetingLines) && data.greetingLines.length > 0) setGreetingLines(data.greetingLines);
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
          // Cleared as well as set: a restart after login, logout or a user
          // switch must not keep showing the previous person's thread.
          setConversationId(data.conversationId ?? "");
          setMessages(data.messages ?? []);
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
        if (data.allowed && Array.isArray(data.fields) && data.fields.length > 0) setPreChatFields(data.fields);
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

  function openChatList() {
    setTab("chat");
    setChatView("list");
    loadRecent();
  }

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
    if (!conversationId || !visitorToken || tab !== "chat" || chatView !== "thread") return;
    let cancelled = false;
    const epoch = sessionEpochRef.current;
    const poll = () => {
      fetch("/api/widget/messages/read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, hostname, visitorToken, conversationId }) })
        .then((response) => response.json())
        .then((data: { messages?: WidgetMessage[]; agentTyping?: boolean; error?: string }) => {
          if (cancelled || epoch !== sessionEpochRef.current) return;
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
            if (replies.length) announceReplies(replies.length);
            setMessages(data.messages);
          }
          setAgentTyping(!!data.agentTyping);
        })
        .catch(() => undefined);
    };
    poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [conversationId, visitorToken, tab, chatView, key, hostname, discardSession]);

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
        let data: { type?: string; message?: WidgetMessage };
        try {
          data = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if (data.type !== "message" || !data.message || data.message.id === undefined) return;
        const message = data.message;
        if (seenMessageIdsRef.current.has(message.id)) return;
        seenMessageIdsRef.current.add(message.id);
        const isReply = message.senderType === "agent" || message.senderType === "ai";
        setMessages((prev) => (prev.some((existing) => existing.id === message.id) ? prev : [...prev, message]));
        if (isReply) {
          revealWordByWord(message.id, message.body);
          announceReplies(1);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, tab, chatView, agentTyping, revealMap]);

  async function sendPayload(body: string, attachment: Attachment | null) {
    if (sending || !visitorToken || (!body && !attachment)) return;
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
      const data = (await response.json()) as { conversationId?: string; greeting?: WidgetMessage | null; message?: WidgetMessage; error?: string };
      if (epoch !== sessionEpochRef.current) return;
      if (data.error) {
        // Not sent: give the text back rather than losing it. If the session
        // ended, restart (keeping the draft) and ask the page for a fresh token.
        if (body) setDraft(body);
        if (attachment) setPendingAttachment(attachment);
        if (activeVisitorRef.current.startsWith("ws_")) {
          identityTokenRef.current = null;
          discardSession({ keepDraft: true });
          setRetryCount((count) => count + 1);
          window.parent.postMessage({ type: "elpino:identity-refresh" }, "*");
        }
        return;
      }
      if (data.conversationId && data.conversationId !== conversationId) {
        // This message just created the conversation — sync up so polling,
        // typing pings, etc. start targeting the real id.
        setConversationId(data.conversationId);
        pendingTopicRef.current = null;
        const opening = [data.greeting, data.message].filter((item): item is WidgetMessage => !!item);
        setMessages(opening);
      } else if (data.message) {
        setMessages((current) => [...current, data.message as WidgetMessage]);
      }
    } finally {
      if (epoch === sessionEpochRef.current) setSending(false);
    }
  }

  async function sendMessage() {
    const body = draft.trim();
    const attachment = pendingAttachment;
    if (!body && !attachment) return;
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
  // A small real team still reads as "just us" — pad the apparent headcount
  // to a random total strictly between 5 and 12 (i.e. 6-11), stable for the
  // life of this mount so it doesn't visibly change while someone's looking
  // at it. Real teams already at or above that size just show their true
  // count instead of a padded one.
  const paddedTeamTotal = useMemo(() => Math.floor(Math.random() * 6) + 6, []);
  // The Home/Chat tab bar only makes sense as a top-level switcher — once
  // you're inside an actual conversation it just eats vertical space, so it
  // only renders for the two "browsing" screens (Home, Recent list).
  const showTabBar = !(tab === "chat" && chatView === "thread");

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

  if (preChatNeeded) {
    const canSubmit = preChatCanSubmit() && !preChatSubmitting;
    return (
      <div className="flex h-full flex-col" style={{ backgroundColor: BG, color: INK }}>
        <div className="shrink-0 px-5 pb-6 pt-5">
          <button type="button" aria-label="Back to home" onClick={() => { setPreChatNeeded(false); setTab("home"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5">
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

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: BG, color: INK }}>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "home" ? (
          <div className="flex h-full flex-col">
            <div className="px-5 pb-5 pt-7">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-[16px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
              </span>
              <h1 className="mt-4 text-[19px] font-semibold leading-6">{greetingLines[0]}</h1>
              {greetingLines.length > 1 && (
                <p className="mt-1.5 text-[13px] leading-5" style={{ color: MUTED }}>{greetingLines.slice(1).join(" ")}</p>
              )}

              {team.length > 0 && (() => {
                const avatarsShown = Math.min(team.length, 4);
                const displayTotal = Math.max(team.length, paddedTeamTotal);
                const badgeCount = displayTotal - avatarsShown;
                return (
                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="flex -space-x-2.5">
                      {team.slice(0, avatarsShown).map((member) => (
                        <span key={member.id} className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white ring-2" style={{ backgroundColor: ACCENT, borderColor: BG, ["--tw-ring-color" as string]: BG }}>
                          {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : (member.name?.trim().charAt(0).toUpperCase() || "?")}
                          {member.online && <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full ring-2" style={{ backgroundColor: "#3ecf6a", ["--tw-ring-color" as string]: BG }} />}
                        </span>
                      ))}
                      {badgeCount > 0 && (
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-2" style={{ backgroundColor: BUBBLE, color: INK, ["--tw-ring-color" as string]: BG }}>
                          +{badgeCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px]" style={{ color: MUTED }}>People here to help you</p>
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-4 pt-0">
              <button
                type="button"
                onClick={startNewChat}
                className="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left shadow-sm transition hover:border-[#c7cbd1]"
                style={{ backgroundColor: SURFACE, borderColor: BORDER }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}><MessageSquarePlus size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">Start a new conversation</span>
                  <span className="block text-[11px]" style={{ color: MUTED }}>We typically reply in a few minutes</span>
                </span>
              </button>

              {conversationId && (
                <button
                  type="button"
                  onClick={() => openThread(conversationId)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left shadow-sm transition hover:border-[#c7cbd1]"
                  style={{ backgroundColor: SURFACE, borderColor: BORDER }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: BUBBLE, color: INK }}><MessageCircle size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold">Continue the conversation</span>
                    <span className="block truncate text-[11px]" style={{ color: MUTED }}>{messages[messages.length - 1]?.body || "Pick up where you left off"}</span>
                  </span>
                </button>
              )}

              <button type="button" onClick={openChatList} className="w-full py-1 text-center text-[11.5px] font-semibold" style={{ color: ACCENT }}>
                View past conversations
              </button>
            </div>
          </div>
        ) : chatView === "list" ? (
          <div className="flex h-full flex-col">
            <div className="relative flex items-center justify-center border-b px-4 py-4" style={{ borderColor: BORDER }}>
              <p className="text-[15px] font-semibold">Messages</p>
              <button type="button" aria-label="Close" onClick={closeWidget} className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5">
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {recentLoading ? (
                <p className="px-4 py-6 text-[11.5px]" style={{ color: MUTED }}>Loading…</p>
              ) : recent.length === 0 ? (
                <p className="px-4 py-6 text-[11.5px]" style={{ color: MUTED }}>No past conversations yet.</p>
              ) : (
                recent.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openThread(conversation.id)}
                    className="flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition hover:bg-black/[0.03]"
                    style={{ borderColor: BORDER }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white" style={{ backgroundColor: ACCENT }}>
                      {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : <LayoutGrid size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">{botName}</span>
                        <span className="shrink-0 text-[10.5px]" style={{ color: MUTED }}>{formatTime(conversation.time)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] leading-4" style={{ color: MUTED }}>{conversation.preview || "New conversation"}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="flex shrink-0 justify-center px-4 pb-4 pt-2">
              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12.5px] font-semibold shadow-sm transition hover:bg-black/[0.02]"
                style={{ backgroundColor: SURFACE, borderColor: BORDER, color: INK }}
              >
                Ask a question
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-white" style={{ backgroundColor: INK }}><CircleHelp size={11} /></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-1.5 border-b px-2.5 py-2.5" style={{ borderColor: BORDER, backgroundColor: BG }}>
              <button type="button" aria-label="Back to chats" onClick={openChatList} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><ChevronLeft size={17} /></button>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full py-1 pl-1 pr-3 shadow-sm" style={{ backgroundColor: SURFACE }}>
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                  {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                  <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full ring-2" style={{ backgroundColor: "#3ecf6a", ["--tw-ring-color" as string]: SURFACE }} />
                </span>
                <p className="truncate text-[12.5px] font-semibold">{botName}</p>
              </div>
              <button type="button" aria-label={soundOn ? "Mute sound for new replies" : "Turn on sound for new replies"} aria-pressed={!soundOn} title={soundOn ? "Sound on for new replies" : "Sound off"} onClick={toggleSound} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5">{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
              <button type="button" aria-label="Close" onClick={closeWidget} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><X size={16} /></button>
            </div>
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && !conversationId && (
                // Nothing is saved yet — this greeting is purely client-side
                // until the visitor's first reply actually creates the
                // conversation (see sendPayload), so a look-and-leave visit
                // never touches the database.
                greetingLines.map((line, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {index === 0 && (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                        {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                    )}
                    <div className={`w-fit max-w-[90%] text-[13.5px] leading-6 ${index > 0 ? "ml-8" : ""}`} style={{ color: INK }}>
                      {line}
                    </div>
                  </div>
                ))
              )}
              {messages.length === 0 && conversationId && (
                <div className="flex min-h-[120px] items-center justify-center text-[11.5px]" style={{ color: MUTED }}>Loading conversation…</div>
              )}
              {messages.map((message, index) => {
                // A teammate joining or leaving the chat. Centered and quiet:
                // it is a thing that happened to the conversation, not a
                // message from anyone, so it must not read as one.
                if (message.senderType === "system") {
                  return (
                    <div key={message.id} className="flex items-center gap-2 py-0.5">
                      <span className="h-px flex-1" style={{ backgroundColor: BORDER }} />
                      <span className="whitespace-nowrap text-[11px]" style={{ color: MUTED }}>{message.body}</span>
                      <span className="h-px flex-1" style={{ backgroundColor: BORDER }} />
                    </div>
                  );
                }

                const fromVisitor = message.senderType === "customer";
                const hasImage = message.attachmentUrl && (message.attachmentType === "image" || message.attachmentType === "gif");
                const hasFile = message.attachmentUrl && message.attachmentType === "file";
                // Who's actually talking: the AI, or — once a teammate has
                // taken over — that teammate by name. Shown once per run of
                // consecutive messages from the same sender, not on every
                // line, so a human mid-conversation doesn't read as the AI.
                const previous = messages[index - 1];
                const continuesSameSender = previous?.senderType === message.senderType && previous?.senderId === message.senderId;
                const senderName = message.senderType === "ai" ? botName : team.find((member) => member.id === message.senderId)?.name?.trim() || "Support team";
                const displayBody = revealMap[message.id] ?? message.body;

                const bubble = (
                  <div className="w-fit max-w-[85%] space-y-1.5">
                    {hasImage && (
                      <img src={message.attachmentUrl!} alt={message.attachmentName ?? ""} className="max-h-52 w-auto rounded-2xl object-cover" />
                    )}
                    {hasFile && (
                      <a
                        href={message.attachmentUrl!}
                        download={message.attachmentName ?? "file"}
                        className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-medium"
                        style={fromVisitor ? { backgroundColor: ACCENT, color: "#fff" } : { backgroundColor: BUBBLE, color: INK }}
                      >
                        <FileIcon size={15} className="shrink-0" />
                        <span className="min-w-0 truncate">{message.attachmentName ?? "Attachment"}</span>
                      </a>
                    )}
                    {message.body && (
                      fromVisitor ? (
                        <div className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-5" style={{ backgroundColor: ACCENT, color: "#fff" }}>
                          <MessageMarkdown text={displayBody} />
                        </div>
                      ) : (
                        <div className="px-0.5 text-[13.5px] leading-6" style={{ color: INK }}>
                          <MessageMarkdown text={displayBody} />
                        </div>
                      )
                    )}
                  </div>
                );

                if (fromVisitor) {
                  return <div key={message.id} className="flex justify-end">{bubble}</div>;
                }
                return (
                  <div key={message.id} className="flex flex-col gap-1">
                    {!continuesSameSender && (
                      <p className="pl-8 text-[10.5px]" style={{ color: MUTED }}>
                        <span className="font-semibold" style={{ color: INK }}>{senderName}</span>
                        {" · "}{formatTime(message.createdAt)}
                      </p>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                        {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                      {bubble}
                    </div>
                  </div>
                );
              })}
              {agentTyping && (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: ACCENT }}>
                    {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                  </span>
                  <div className="flex items-center rounded-2xl px-3.5 py-3" style={{ backgroundColor: BUBBLE, width: "fit-content" }}>
                    <TypingDots color="rgba(24,24,27,.45)" />
                  </div>
                </div>
              )}
            </div>
            <div className="relative p-3">
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

              <div className="rounded-[26px] border shadow-sm" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
                <textarea
                  value={draft}
                  onChange={(event) => { setDraft(event.target.value); notifyTyping(); }}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                  placeholder="Write a message…"
                  rows={1}
                  className="h-[42px] w-full resize-none bg-transparent px-4 pb-1 pt-2.5 text-[13px] outline-none placeholder:text-[#9aa0a6]"
                  style={{ color: INK }}
                />
                <div className="flex h-10 items-center gap-0.5 px-1.5 pb-1">
                  <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
                  <button type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5" style={{ color: ICON_MUTED }}>
                    <Paperclip size={15} />
                  </button>
                  <button type="button" aria-label="Send a GIF" onClick={() => togglePanel("gif")} className="flex h-7 w-9 items-center justify-center rounded-full text-[9.5px] font-bold hover:bg-black/5" style={{ color: activePanel === "gif" ? ACCENT : ICON_MUTED }}>
                    GIF
                  </button>
                  <button type="button" aria-label="Emoji" onClick={() => togglePanel("emoji")} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5" style={{ color: activePanel === "emoji" ? ACCENT : ICON_MUTED }}>
                    <Smile size={15} />
                  </button>
                  {micSupported && (
                    <button
                      type="button"
                      aria-label={listening ? "Stop recording" : "Voice input"}
                      onClick={toggleMic}
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5"
                      style={{ color: listening ? "#e5626a" : ICON_MUTED }}
                    >
                      {listening ? <Square size={13} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={(!draft.trim() && !pendingAttachment) || sending}
                    aria-label="Send"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition disabled:opacity-100 ${micSupported ? "ml-1" : "ml-auto"}`}
                    style={{ backgroundColor: draft.trim() || pendingAttachment ? ACCENT : BUBBLE, color: draft.trim() || pendingAttachment ? "#fff" : ICON_MUTED }}
                  >
                    <ArrowUp size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTabBar && (
        <div className="flex shrink-0 items-center border-t" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
          <button type="button" onClick={() => setTab("home")} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium" style={{ color: tab === "home" ? INK : MUTED }}>
            <Home size={18} strokeWidth={tab === "home" ? 2.4 : 2} /> Home
          </button>
          <button type="button" onClick={openChatList} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium" style={{ color: tab === "chat" ? INK : MUTED }}>
            <MessageCircle size={18} strokeWidth={tab === "chat" ? 2.4 : 2} /> Messages
          </button>
          <button type="button" disabled className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium opacity-50" style={{ color: MUTED }}>
            <CircleHelp size={18} /> Help
          </button>
        </div>
      )}
      {showBranding && (
        <a href="https://elpino.chat" target="_blank" rel="noreferrer" className="block shrink-0 border-t py-1.5 text-center text-[9.5px] font-medium transition hover:text-[#18181b]" style={{ borderColor: BORDER, color: MUTED, backgroundColor: SURFACE }}>
          Powered by Elpino
        </a>
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
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 hover:bg-[#f7f8f9]">
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
            <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 hover:bg-[#f7f8f9]">
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
