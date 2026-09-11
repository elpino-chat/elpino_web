"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, CircleHelp, File as FileIcon, Home, LayoutGrid, Mic, MessageCircle, MessageSquarePlus, Paperclip, Search, Send, Smile, Square, X } from "lucide-react";
import MessageMarkdown from "@/app/components/MessageMarkdown";
import TypingDots from "@/app/components/TypingDots";

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
type StartResult = { allowed: boolean; visitorToken?: string; conversationId?: string; botName?: string; botAvatarUrl?: string | null; greetingLines?: string[]; removeBranding?: boolean; topic?: string | null; customerEmail?: string | null; messages?: WidgetMessage[]; error?: string };
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
const PRECHAT_BANNER = "#18181b";
const BG = "#18181b";
const BUBBLE = "#2a2a2e";
const BORDER = "#2c2c30";
const MUTED = "rgba(255,255,255,.55)";
const ICON_MUTED = "rgba(255,255,255,.85)";
const POLL_MS = 2000;
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

  useEffect(() => {
    if (!key || !hostname) { setDenied(true); setLoading(false); return; }
    setLoading(true);
    setLoadFailed(false);
    const storedToken = readVisitorToken(key);
    const controller = new AbortController();
    // Without this, a request that never resolves (dropped connection, dev
    // server hiccup, flaky network) leaves the widget stuck on the loading
    // spinner forever instead of ever surfacing an error to retry from.
    const timeout = window.setTimeout(() => controller.abort(), START_TIMEOUT_MS);
    fetch("/api/widget/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, hostname, visitorToken: storedToken }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: StartResult) => {
        if (!data.allowed) { setDenied(true); return; }
        setBotName(data.botName || "Elpino Support");
        setBotAvatarUrl(data.botAvatarUrl ?? null);
        setShowBranding(!data.removeBranding);
        if (Array.isArray(data.greetingLines) && data.greetingLines.length > 0) setGreetingLines(data.greetingLines);
        if (data.visitorToken) writeVisitorToken(key, data.visitorToken);

        // Gate the pre-chat form on the visitor's profile, not the
        // conversation — once this browser's visitor has a saved email, they
        // never see the form again, no matter how many new conversations
        // they start afterward.
        const knowsVisitor = Boolean(data.customerEmail);
        setPreChatNeeded(!knowsVisitor);
        if (data.visitorToken) setVisitorToken(data.visitorToken);

        // startFresh (the greeting-popup's "new chat" flow) deliberately
        // skips resuming — nothing is created server-side until the visitor
        // actually sends a message, so this just means "show an empty
        // thread" rather than requiring an extra API call.
        if (!startFresh) {
          if (data.conversationId) setConversationId(data.conversationId);
          setMessages(data.messages ?? []);
        }
      })
      .catch(() => setLoadFailed(true))
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hostname, retryCount]);

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
    const params = new URLSearchParams({ key, hostname, visitorToken });
    fetch(`/api/widget/conversations?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { conversations?: ConversationSummary[] }) => setRecent(data.conversations ?? []))
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
    try {
      const payloadAnswers: Record<string, string> = {};
      for (const field of preChatFields) {
        const raw = answers[field.id];
        if (!raw) continue;
        payloadAnswers[field.id] = field.type === "phone" ? `${COUNTRIES[formCountry].code} ${raw.trim()}` : raw.trim();
      }

      await fetch("/api/widget/prechat", {
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
      // Filling in the form doesn't create a conversation by itself — if the
      // visitor doesn't have one yet, remember the topic so it's applied
      // once they actually send their first message (see sendPayload).
      if (!conversationId) pendingTopicRef.current = payloadAnswers.topic ?? null;
      setPreChatNeeded(false);
      setTab("chat");
      setChatView("thread");
    } finally {
      setPreChatSubmitting(false);
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
    const params = new URLSearchParams({ key, hostname, visitorToken, conversationId });
    const poll = () => {
      fetch(`/api/widget/messages?${params.toString()}`)
        .then((response) => response.json())
        .then((data: { messages?: WidgetMessage[]; agentTyping?: boolean }) => {
          if (data.messages) setMessages(data.messages);
          setAgentTyping(!!data.agentTyping);
        })
        .catch(() => undefined);
    };
    poll();
    const interval = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(interval);
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
  }, [messages, tab, chatView, agentTyping]);

  async function sendPayload(body: string, attachment: Attachment | null) {
    if (sending || !visitorToken || (!body && !attachment)) return;
    setSending(true);
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
      const data = (await response.json()) as { conversationId?: string; greeting?: WidgetMessage | null; message?: WidgetMessage };
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
      setSending(false);
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
    return <div className="flex h-full items-center justify-center text-[12px] text-white/50" style={{ backgroundColor: BG }}>Loading…</div>;
  }
  if (denied) {
    return <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-white/50" style={{ backgroundColor: BG }}>This chat isn&apos;t available on this site.</div>;
  }
  if (loadFailed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: BG }}>
        <p className="text-[12px] text-white/50">Couldn&apos;t load chat. Check your connection and try again.</p>
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
      <div className="flex h-full flex-col text-white" style={{ backgroundColor: PRECHAT_BANNER }}>
        <div className="shrink-0 px-5 pb-7 pt-5">
          <button type="button" aria-label="Back to home" onClick={() => { setPreChatNeeded(false); setTab("home"); }} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <p className="mt-3 text-[17px] font-semibold leading-6">Please share a few details here so {botName} can connect you with the right person.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-6 text-[#1c1c1e]">
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
    <div className="flex h-full flex-col text-white" style={{ backgroundColor: BG }}>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "home" ? (
          <div className="flex h-full flex-col">
            <div className="px-5 pb-5 pt-7">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-[16px] font-bold" style={{ backgroundColor: ACCENT }}>
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
                        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2" style={{ backgroundColor: "#3a3a3f", ["--tw-ring-color" as string]: BG }}>
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
                className="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition hover:border-white/20"
                style={{ backgroundColor: BUBBLE, borderColor: BORDER }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: ACCENT }}><MessageSquarePlus size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-white">Start a new conversation</span>
                  <span className="block text-[11px]" style={{ color: MUTED }}>We typically reply in a few minutes</span>
                </span>
              </button>

              {conversationId && (
                <button
                  type="button"
                  onClick={() => openThread(conversationId)}
                  className="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition hover:border-white/20"
                  style={{ backgroundColor: BUBBLE, borderColor: BORDER }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: "#3a3a3f" }}><MessageCircle size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-white">Continue the conversation</span>
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
              <button type="button" aria-label="Close" onClick={closeWidget} className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10">
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
                    className="flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition hover:bg-white/5"
                    style={{ borderColor: BORDER }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white" style={{ backgroundColor: ACCENT }}>
                      {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : <LayoutGrid size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold text-white">{botName}</span>
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
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12.5px] font-semibold text-[#18181b] shadow-lg transition hover:bg-white/90"
              >
                Ask a question
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#18181b] text-white"><CircleHelp size={11} /></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2.5 border-b px-3 py-3" style={{ borderColor: BORDER }}>
              <button type="button" aria-label="Back to chats" onClick={openChatList} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/10"><ChevronLeft size={17} /></button>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold" style={{ backgroundColor: ACCENT }}>
                {botAvatarUrl ? <img src={botAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{botName}</p>
                <p className="truncate text-[10.5px]" style={{ color: MUTED }}>The team can also help</p>
              </div>
              <button type="button" aria-label="Close" onClick={closeWidget} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/10"><X size={16} /></button>
            </div>
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && !conversationId && (
                // Nothing is saved yet — this greeting is purely client-side
                // until the visitor's first reply actually creates the
                // conversation (see sendPayload), so a look-and-leave visit
                // never touches the database.
                greetingLines.map((line, index) => (
                  <div key={index} className="w-fit max-w-[90%] rounded-md border border-black/40 bg-white px-3.5 py-3 text-[13px] leading-5 text-[#18181b]">
                    {line}
                  </div>
                ))
              )}
              {messages.length === 0 && conversationId && (
                <div className="flex min-h-[120px] items-center justify-center text-[11.5px]" style={{ color: MUTED }}>Loading conversation…</div>
              )}
              {messages.map((message) => {
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
                return (
                  <div key={message.id} className={fromVisitor ? "flex justify-end" : ""}>
                    <div className="w-fit max-w-[85%] space-y-1.5">
                      {hasImage && (
                        <img src={message.attachmentUrl!} alt={message.attachmentName ?? ""} className="max-h-52 w-auto rounded-2xl object-cover" />
                      )}
                      {hasFile && (
                        <a
                          href={message.attachmentUrl!}
                          download={message.attachmentName ?? "file"}
                          className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-medium"
                          style={fromVisitor ? { backgroundColor: ACCENT, color: "#fff" } : { backgroundColor: BUBBLE, color: "#fff" }}
                        >
                          <FileIcon size={15} className="shrink-0" />
                          <span className="min-w-0 truncate">{message.attachmentName ?? "Attachment"}</span>
                        </a>
                      )}
                      {message.body && (
                        <div
                          className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-5"
                          style={fromVisitor ? { backgroundColor: ACCENT, color: "#fff" } : { backgroundColor: BUBBLE, color: "#fff" }}
                        >
                          <MessageMarkdown text={message.body} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {agentTyping && (
                <div className="flex items-center rounded-2xl px-3.5 py-3" style={{ backgroundColor: BUBBLE, width: "fit-content" }}>
                  <TypingDots color="rgba(255,255,255,.7)" />
                </div>
              )}
            </div>
            <div className="relative p-3">
              {activePanel === "emoji" && (
                <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl border p-2.5 shadow-2xl" style={{ borderColor: BORDER, backgroundColor: "#1f1f22" }}>
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>Emoji</p>
                    <button type="button" onClick={() => setActivePanel(null)} className="rounded-full p-1 hover:bg-white/10"><X size={13} /></button>
                  </div>
                  <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} className="rounded-lg p-1.5 text-[17px] leading-none hover:bg-white/10">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activePanel === "gif" && (
                <div className="absolute bottom-full left-3 right-3 mb-2 flex max-h-72 flex-col rounded-2xl border p-2.5 shadow-2xl" style={{ borderColor: BORDER, backgroundColor: "#1f1f22" }}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: BUBBLE }}>
                      <Search size={12} style={{ color: MUTED }} />
                      <input
                        value={gifQuery}
                        onChange={(event) => setGifQuery(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") void searchGifs(gifQuery); }}
                        placeholder="Search GIFs…"
                        className="min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/40"
                      />
                    </div>
                    <button type="button" onClick={() => setActivePanel(null)} className="rounded-full p-1 hover:bg-white/10"><X size={13} /></button>
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
                <div className="mb-2 flex items-center gap-2 rounded-xl border px-2.5 py-2" style={{ borderColor: BORDER, backgroundColor: "#1f1f22" }}>
                  {pendingAttachment.type === "image" ? (
                    <img src={pendingAttachment.url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: BUBBLE }}><FileIcon size={15} /></span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: MUTED }}>{pendingAttachment.name ?? "Attachment"}</span>
                  <button type="button" onClick={() => setPendingAttachment(null)} className="rounded-full p-1 hover:bg-white/10"><X size={13} /></button>
                </div>
              )}
              {attachError && <p className="mb-2 px-1 text-[11px] text-[#e5626a]">{attachError}</p>}

              <div className="rounded-xl border" style={{ borderColor: BORDER, backgroundColor: "#1f1f22" }}>
                <textarea
                  value={draft}
                  onChange={(event) => { setDraft(event.target.value); notifyTyping(); }}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                  placeholder="Write a message…"
                  rows={1}
                  className="h-[42px] w-full resize-none bg-transparent px-3.5 pb-1 pt-2.5 text-[13px] text-white outline-none placeholder:text-white/60"
                />
                <div className="flex h-10 items-center gap-0.5 px-1.5 pb-1">
                  <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
                  <button type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10" style={{ color: ICON_MUTED }}>
                    <Paperclip size={15} />
                  </button>
                  <button type="button" aria-label="Send a GIF" onClick={() => togglePanel("gif")} className="flex h-7 w-9 items-center justify-center rounded-full text-[9.5px] font-bold hover:bg-white/10" style={{ color: activePanel === "gif" ? ACCENT : ICON_MUTED }}>
                    GIF
                  </button>
                  <button type="button" aria-label="Emoji" onClick={() => togglePanel("emoji")} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10" style={{ color: activePanel === "emoji" ? ACCENT : ICON_MUTED }}>
                    <Smile size={15} />
                  </button>
                  {micSupported && (
                    <button
                      type="button"
                      aria-label={listening ? "Stop recording" : "Voice input"}
                      onClick={toggleMic}
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
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
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white transition disabled:opacity-40 ${micSupported ? "ml-1" : "ml-auto"}`}
                    style={{ backgroundColor: draft.trim() || pendingAttachment ? ACCENT : "rgba(255,255,255,.12)" }}
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTabBar && (
        <div className="flex shrink-0 items-center border-t" style={{ borderColor: BORDER }}>
          <button type="button" onClick={() => setTab("home")} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium" style={{ color: tab === "home" ? "#fff" : MUTED }}>
            <Home size={18} strokeWidth={tab === "home" ? 2.4 : 2} /> Home
          </button>
          <button type="button" onClick={openChatList} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium" style={{ color: tab === "chat" ? "#fff" : MUTED }}>
            <MessageCircle size={18} strokeWidth={tab === "chat" ? 2.4 : 2} /> Messages
          </button>
          <button type="button" disabled className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium opacity-50" style={{ color: MUTED }}>
            <CircleHelp size={18} /> Help
          </button>
        </div>
      )}
      {showBranding && (
        <a href="https://elpino.chat" target="_blank" rel="noreferrer" className="block shrink-0 border-t py-1.5 text-center text-[9.5px] font-medium transition hover:text-white/70" style={{ borderColor: BORDER, color: MUTED }}>
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
                style={{ borderColor: value === option ? PRECHAT_BANNER : "#c7cbd1" }}
              >
                {value === option && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRECHAT_BANNER }} />}
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
    <Suspense fallback={<div className="flex h-full items-center justify-center text-[12px] text-white/50" style={{ backgroundColor: BG }}>Loading…</div>}>
      <WidgetContent />
    </Suspense>
  );
}
