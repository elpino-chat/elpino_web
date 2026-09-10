import {
  CheckCheck,
  FileText,
  Funnel,
  Globe,
  Grid3x3,
  Inbox,
  MessageSquareHeart,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { ConversationPreview } from "./ConversationPreview";

/**
 * A static, non-interactive replica of the real dashboard (icon rail, chat
 * list, conversation, contact panel) for the marketing hero. It mirrors the
 * shipped UI's layout and content but hardcodes everything — nothing here
 * talks to the API, and it is deliberately clipped by the hero's overflow so
 * it reads as the product "peeking up" from the bottom of the fold.
 */

const railItems = [
  { label: "Inbox", icon: Inbox, active: true },
  { label: "AI Assist", icon: MessageSquareHeart, badge: "5" },
  { label: "Visitors", icon: Globe },
  { label: "Contacts", icon: Users },
  { label: "Knowledge", icon: FileText },
  { label: "Connect", icon: Grid3x3 },
  { label: "Settings", icon: Settings },
];

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
    active: false,
    snippet: "Can we move the team to annual billing halfway through the month?",
  },
  {
    name: "Tom Becker",
    initials: "TB",
    color: "#3f8f6b",
    time: "4h",
    resolved: false,
    active: false,
    snippet: "The chat widget isn't loading on our checkout page since this morning.",
  },
  {
    name: "Sana Qureshi",
    initials: "SQ",
    color: "#8d6bbf",
    time: "Yesterday",
    resolved: true,
    active: false,
    snippet: "Added — your knowledge base now covers the returns policy articles.",
  },
  {
    name: "Luis Ortega",
    initials: "LO",
    color: "#b8823a",
    time: "Yesterday",
    resolved: true,
    active: false,
    snippet: "Refund for the duplicate charge is on its way back to your card.",
  },
];

export function HeroDashboardPreview({ showRail = true }: { showRail?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-full overflow-hidden rounded-t-2xl border-4 border-b-0 border-white bg-[#0F1113] text-left shadow-[0_-8px_60px_-15px_rgba(0,0,0,0.55)]">
      <div className="flex h-[560px] min-h-0">
        {/* Icon rail */}
        {showRail && (
          <aside className="m-1.5 hidden w-[80px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#16191c] text-white sm:flex">
            <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-2.5">
              {railItems.map(({ label, icon: Icon, active, badge }) => (
                <span
                  key={label}
                  className={`flex w-full flex-col items-center justify-center rounded-xl py-[7px] text-center ${
                    active ? "border border-white/10 bg-white/[0.08]" : ""
                  }`}
                >
                  <span className="relative mb-1">
                    <Icon size={22} strokeWidth={1.7} className={active ? "text-white" : "text-white/80"} />
                    {badge && (
                      <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#16191c] bg-[#27895d] px-0.5 text-[8px] font-bold text-white">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className={`text-[11px] leading-4 ${active ? "font-semibold text-white" : "font-medium text-white/80"}`}>
                    {label}
                  </span>
                </span>
              ))}
            </nav>
          </aside>
        )}

        {/* Chat list */}
        <aside className="my-1.5 hidden w-[290px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111417] lg:flex">
          <div className="border-b border-white/10 px-3 py-3">
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-white">Chats</h3>
            <p className="mt-0.5 text-[13px] text-white/80">5 customer conversations</p>
            <div className="mt-3 flex h-9 items-center rounded-lg border border-white/10 px-3 text-white/80">
              <Search size={16} className="shrink-0" />
              <span className="flex-1 px-2 text-[12px]">Search conversations</span>
              <Funnel size={14} />
            </div>
            <div className="mt-2 flex gap-1">
              {filterTabs.map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${
                    i === 0 ? "bg-white/10 text-white" : "text-white/80"
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
                className={`flex items-start gap-3 rounded-xl px-2.5 py-3 ${chat.active ? "bg-white/[0.06]" : ""}`}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ backgroundColor: chat.color }}
                >
                  {chat.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white">{chat.name}</span>
                    <span className="shrink-0 text-[9px] text-white/80">{chat.time}</span>
                  </span>
                  <span className="mt-1 flex items-start gap-1.5">
                    {chat.resolved ? (
                      <CheckCheck size={13} className="mt-0.5 shrink-0 text-[#32a880]" />
                    ) : (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7060BD]" />
                    )}
                    <span className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-4 text-white/80">
                      {chat.snippet}
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </aside>

        <ConversationPreview />
      </div>
    </div>
  );
}
