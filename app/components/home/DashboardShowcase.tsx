import Image from "next/image";
import {
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  CircleHelp,
  Funnel,
  Home,
  Lock,
  Mic,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Smile,
  SmilePlus,
  Sparkles,
  TicketPlus,
  X,
} from "lucide-react";

// Exact palette from the real embeddable widget (app/widget/page.tsx) — dark
// surface, blue accent — so this popup reads as the actual product.
const ACCENT = "#428ce5";
const POPUP_BG = "#18181b";
const BUBBLE = "#2a2a2e";
const POPUP_BORDER = "#2c2c30";

const filterTabs = ["All", "Unread", "Read", "Resolved"];

const recentChats = [
  {
    name: "Rahul Das",
    initials: "RD",
    color: "#c0634d",
    time: "Sep 7",
    resolved: true,
    active: true,
    snippet: "Good news — nothing was captured. Both attempts were declined by your bank.",
  },
  {
    name: "Meera Iyer",
    initials: "MI",
    color: "#4a7bc0",
    time: "2h",
    resolved: false,
    snippet: "Can we move the team to annual billing halfway through the month?",
  },
  {
    name: "Tom Becker",
    initials: "TB",
    color: "#3f8f6b",
    time: "4h",
    resolved: false,
    snippet: "The chat widget isn't loading on our checkout page since this morning.",
  },
  {
    name: "Sana Qureshi",
    initials: "SQ",
    color: "#8d6bbf",
    time: "Yesterday",
    resolved: true,
    snippet: "Added — your knowledge base now covers the returns policy articles.",
  },
];

export function DashboardShowcase() {
  return (
    <div className="relative mt-10 rounded-[16px] bg-[#f5f4ef] p-16 sm:mt-14">
      <Image
        src="/slotpointing.png"
        alt=""
        aria-hidden="true"
        width={480}
        height={480}
        quality={100}
        className="pointer-events-none absolute bottom-0 left-0 hidden h-auto w-32 select-none sm:block sm:w-40 lg:w-48"
      />

      {/* White-theme dashboard mockup */}
      <div className="mx-auto w-full max-w-full overflow-hidden rounded-2xl border border-black/10 bg-white text-left shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]">
        <div className="flex h-[560px] min-h-0">
          {/* Chat list */}
          <aside className="hidden w-[290px] shrink-0 flex-col overflow-hidden border-r border-black/10 lg:flex">
            <div className="border-b border-black/10 px-3 py-3">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#171e16]">Chats</h3>
              <p className="mt-0.5 text-[13px] text-black/50">5 customer conversations</p>
              <div className="mt-3 flex h-9 items-center rounded-lg border border-black/10 px-3 text-black/45">
                <Search size={16} className="shrink-0" />
                <span className="flex-1 px-2 text-[12px]">Search conversations</span>
                <Funnel size={14} />
              </div>
              <div className="mt-2 flex gap-1">
                {filterTabs.map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${
                      i === 0 ? "bg-black/5 text-[#171e16]" : "text-black/45"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-1 p-2">
              {recentChats.map((chat) => (
                <div
                  key={chat.name}
                  className={`flex items-start gap-3 rounded-xl px-2.5 py-3 ${chat.active ? "bg-black/[0.04]" : ""}`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ backgroundColor: chat.color }}
                  >
                    {chat.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#171e16]">{chat.name}</span>
                      <span className="shrink-0 text-[9px] text-black/40">{chat.time}</span>
                    </span>
                    <span className="mt-1 flex items-start gap-1.5">
                      {chat.resolved ? (
                        <CheckCheck size={13} className="mt-0.5 shrink-0 text-[#1c9a6c]" />
                      ) : (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7060BD]" />
                      )}
                      <span className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-4 text-black/50">
                        {chat.snippet}
                      </span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Conversation */}
          <section className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[58px] shrink-0 items-center border-b border-black/10 px-4">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#c0634d] text-xs font-bold text-white">
                RD
                <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-white bg-[#35b92c]" />
              </span>
              <div className="ml-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold text-[#171e16]">Rahul Das</span>
                  <span className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] font-semibold text-black/60">
                    RESOLVED
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-black/50">Customer support</p>
              </div>
              <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
                <span className="flex h-9 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-[12.5px] font-semibold text-[#171e16]">
                  <TicketPlus size={15} /> Ticket
                </span>
                <span className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#171e16] px-4 text-[13px] font-semibold text-white">
                  <CircleCheck size={15} /> Resolved
                </span>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-5 py-5">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c0634d] text-[10px] font-bold text-white">
                  RD
                </span>
                <div className="max-w-[76%]">
                  <div className="rounded-2xl bg-black/[0.04] px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-[#171e16]">
                    I tried to upgrade to Growth twice and the payment failed both times — but I can see two pending
                    charges on my card. Have I been billed?
                  </div>
                  <p className="mt-1 text-[11px] text-black/40">11:25 PM</p>
                </div>
              </div>

              <div className="flex flex-row-reverse gap-3">
                <details open className="group/audit w-[76%]">
                  <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/45 [&::-webkit-details-marker]:hidden">
                    Thinking
                    <ChevronDown
                      size={14}
                      className="ml-auto shrink-0 transition-transform duration-200 group-open/audit:rotate-180"
                    />
                  </summary>
                  <p className="mt-1.5 border-l border-black/15 pl-3 text-[12px] leading-5 text-black/55">
                    Checking Stripe for rahul.das@example.com — two payment intents in the last hour, both{" "}
                    <span className="text-[#171e16]">card_declined</span>, no successful charges. Those pending
                    amounts are authorisation holds, not captures.
                  </p>
                </details>
              </div>

              <div className="flex flex-row-reverse gap-3">
                <div className="max-w-[76%]">
                  <div className="mb-1 flex items-center justify-end gap-1 text-[10.5px] font-medium text-[#7f44c1]">
                    <Sparkles size={11} /> Sent by Elpino AI
                  </div>
                  <div className="text-[13.5px] leading-[1.55] text-[#171e16]">
                    Good news — nothing was captured. Both attempts were declined by your bank, so you haven&apos;t
                    been billed. The two pending amounts are authorisation holds and your bank releases them in 3–5
                    business days. You&apos;re still on Starter — want me to send a fresh payment link?
                  </div>
                  <p className="mt-1 text-right text-[11px] text-black/40">11:25 PM</p>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-5 pb-4">
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                <div className="rounded-xl bg-white">
                  <p className="px-5 pb-1 pt-4 text-[13px] text-black/45">
                    Write your reply to the customer, press &apos;space&apos; for AI, &apos;/&apos; for commands
                  </p>
                  <div className="flex h-12 items-center gap-3 px-4 text-black/45">
                    <Paperclip size={17} />
                    <SmilePlus size={17} />
                    <TicketPlus size={17} />
                    <Lock size={17} />
                    <span className="ml-auto flex h-8 items-center overflow-hidden rounded-lg bg-[#171e16] text-white">
                      <span className="flex h-full w-10 items-center justify-center">
                        <Send size={17} />
                      </span>
                      <span className="flex h-5 w-6 items-center justify-center border-l border-white/25">
                        <ChevronDown size={13} />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Floating popup, matching the real widget's chat-thread screen */}
      <div
        className="absolute bottom-4 right-4 z-10 hidden h-[440px] w-[320px] flex-col overflow-hidden rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] sm:right-8 sm:flex"
        style={{ backgroundColor: POPUP_BG }}
      >
        <header className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: POPUP_BORDER }}>
          <ChevronLeft size={15} className="text-white/60" />
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            E
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-white">Elpino Support</p>
            <p className="truncate text-[9.5px] text-white/50">The team can also help</p>
          </div>
          <X size={14} className="text-white/60" />
        </header>

        <div className="flex-1 space-y-2.5 overflow-hidden p-3">
          <div className="flex justify-end">
            <div
              className="w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[11.5px] leading-4 text-white"
              style={{ backgroundColor: ACCENT }}
            >
              How can I cancel my subscription?
            </div>
          </div>
          <div className="w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[11.5px] leading-4 text-white" style={{ backgroundColor: BUBBLE }}>
            You can cancel anytime from Settings → Billing. Want me to open that page?
          </div>
        </div>

        <div className="shrink-0 p-2.5">
          <div className="rounded-xl border" style={{ borderColor: POPUP_BORDER, backgroundColor: "#1f1f22" }}>
            <p className="px-3 pb-1 pt-2 text-[11px] text-white/40">Write a message…</p>
            <div className="flex h-8 items-center gap-1 px-1.5 pb-1 text-white/70">
              <Paperclip size={13} />
              <Smile size={13} />
              <Mic size={13} className="ml-auto" />
              <span
                className="ml-1 flex size-6 items-center justify-center rounded-lg"
                style={{ backgroundColor: ACCENT }}
              >
                <Send size={12} className="text-white" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom tab bar, matching the real widget's Home/Messages/Help nav */}
        <div className="flex items-center border-t" style={{ borderColor: POPUP_BORDER }}>
          <span className="flex flex-1 flex-col items-center gap-1 py-2 text-[9px] font-medium text-white/50">
            <Home size={15} />
            Home
          </span>
          <span className="flex flex-1 flex-col items-center gap-1 py-2 text-[9px] font-medium text-white">
            <MessageCircle size={15} strokeWidth={2.4} />
            Messages
          </span>
          <span className="flex flex-1 flex-col items-center gap-1 py-2 text-[9px] font-medium text-white/30">
            <CircleHelp size={15} />
            Help
          </span>
        </div>
        <p className="border-t py-1 text-center text-[9px] text-white/40" style={{ borderColor: POPUP_BORDER }}>
          Powered by Elpino
        </p>
      </div>
    </div>
  );
}
