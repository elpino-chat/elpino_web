import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Inbox, Users, Search, Filter, CheckCircle2, Clock, MessageSquare, Sparkles, Tag, ShieldCheck, CornerDownLeft, Send } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Shared Team Inbox",
  description: "Collaborative, lightning-fast shared inbox with real-time presence, tagging, and keyboard shortcuts.",
  alternates: { canonical: `${SITE_URL}/product/inbox` },
  openGraph: {
    title: "Shared Team Inbox | Elpino",
    description: "Collaborative, lightning-fast shared inbox with real-time presence, tagging, and keyboard shortcuts.",
    url: `${SITE_URL}/product/inbox`,
    type: "website",
  },
};

export default function InboxPage() {
  return (
    <ProductFeatureLayout
      showCategoryBadge={false}
      heroTheme="black"
      heroBackgroundImage="https://getrizly.com/images/heros/rizly-dawn-hero.webp"
      align="left"
      title="Maximize productivity with an"
      highlightedTitle="AI-enhanced Inbox"
      highlightGradient="from-white via-[#d9bef4] to-[#70a1ff]"
      description="Collaborate with your team seamlessly. View live visitor presence, assign conversation owners, and resolve customer discussions in record time with intelligent automation."
      heroPreview={
        <div
          className="relative flex h-[560px] w-full overflow-hidden rounded-md text-left shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)]"
          style={{ backgroundColor: "rgb(23, 24, 28)" }}
        >
          {/* Blue Left Icon Sidebar */}
          <div
            className="flex w-[68px] shrink-0 flex-col items-center gap-1 py-4"
            style={{ backgroundColor: "rgb(66, 140, 229)" }}
          >
            <span className="mb-3 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15">
              <img alt="" className="h-full w-full object-contain" src="/icon.png" />
            </span>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-grid3x3 text-white"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              <span className="text-[9px] text-white/80">Space</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg bg-white/20 py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-inbox text-white"
                aria-hidden="true"
              >
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
              <span className="text-[9px] text-white/80">Inbox</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chart-no-axes-column text-white"
                aria-hidden="true"
              >
                <path d="M5 21v-6" />
                <path d="M12 21V3" />
                <path d="M19 21V9" />
              </svg>
              <span className="text-[9px] text-white/80">Analytics</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users text-white"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span className="text-[9px] text-white/80">Contacts</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-book-open text-white"
                aria-hidden="true"
              >
                <path d="M12 5v16" />
                <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
              </svg>
              <span className="text-[9px] text-white/80">Knowledge</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plug text-white"
                aria-hidden="true"
              >
                <path d="M12 22v-5" />
                <path d="M15 8V2" />
                <path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z" />
                <path d="M9 8V2" />
              </svg>
              <span className="text-[9px] text-white/80">Connect</span>
            </div>
            <div className="flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-settings text-white"
                aria-hidden="true"
              >
                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-[9px] text-white/80">Settings</span>
            </div>
          </div>

          {/* Middle Column: Conversation List */}
          <div
            className="flex w-[230px] shrink-0 flex-col border-r"
            style={{ borderColor: "rgb(42, 44, 49)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-3 py-3"
              style={{ borderColor: "rgb(42, 44, 49)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search"
                aria-hidden="true"
                style={{ color: "rgb(138, 143, 152)" }}
              >
                <path d="m21 21-4.34-4.34" />
                <circle cx="11" cy="11" r="8" />
              </svg>
              <span className="text-[12.5px]" style={{ color: "rgb(138, 143, 152)" }}>
                Search conversations
              </span>
            </div>
            <div
              className="flex gap-4 border-b px-3 py-2 text-[11px] font-medium"
              style={{ borderColor: "rgb(42, 44, 49)", color: "rgb(138, 143, 152)" }}
            >
              <span style={{ color: "rgb(242, 243, 245)" }}>All</span>
              <span>Unread</span>
              <span>Resolved</span>
            </div>
            <div className="flex-1 space-y-0.5 overflow-hidden p-1.5">
              <div className="rounded-xl px-2.5 py-2.5 bg-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: "rgb(92, 102, 111)" }}
                    >
                      RD
                    </span>
                    <span
                      className="truncate text-[12.5px] font-semibold"
                      style={{ color: "rgb(242, 243, 245)" }}
                    >
                      Rahul Das
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px]" style={{ color: "rgb(111, 116, 124)" }}>
                    2m
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-9">
                  <span
                    className="min-w-0 flex-1 truncate text-[11px]"
                    style={{ color: "rgb(138, 143, 152)" }}
                  >
                    I tried to upgrade to Growth twice and the payment failed...
                  </span>
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                    style={{ backgroundColor: "rgb(66, 140, 229)" }}
                  >
                    2
                  </span>
                </div>
              </div>

              <div className="rounded-xl px-2.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: "rgb(92, 102, 111)" }}
                    >
                      MI
                    </span>
                    <span
                      className="truncate text-[12.5px] font-semibold"
                      style={{ color: "rgb(194, 198, 204)" }}
                    >
                      Meera Iyer
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px]" style={{ color: "rgb(111, 116, 124)" }}>
                    1h
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-9">
                  <span
                    className="min-w-0 flex-1 truncate text-[11px]"
                    style={{ color: "rgb(138, 143, 152)" }}
                  >
                    Can we move the team to annual billing halfway through?
                  </span>
                </div>
              </div>

              <div className="rounded-xl px-2.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: "rgb(92, 102, 111)" }}
                    >
                      TB
                    </span>
                    <span
                      className="truncate text-[12.5px] font-semibold"
                      style={{ color: "rgb(194, 198, 204)" }}
                    >
                      Tom Becker
                    </span>
                  </span>
                  <span className="shrink-0 text-[9px]" style={{ color: "rgb(111, 116, 124)" }}>
                    4h
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-9">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check"
                    aria-hidden="true"
                    style={{ color: "rgb(50, 168, 128)" }}
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span
                    className="min-w-0 flex-1 truncate text-[11px]"
                    style={{ color: "rgb(138, 143, 152)" }}
                  >
                    The chat widget isn&apos;t loading on our checkout page.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Thread */}
          <div className="flex flex-1 flex-col">
            <div
              className="flex items-center justify-between border-b px-5 py-3.5"
              style={{ borderColor: "rgb(42, 44, 49)" }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: "rgb(92, 102, 111)" }}
                >
                  RD
                </span>
                <span className="text-[13px] font-semibold text-white">Rahul Das</span>
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: "rgba(50, 168, 128, 0.133)",
                  color: "rgb(50, 168, 128)",
                }}
              >
                Resolved
              </span>
            </div>
            <div className="flex-1 space-y-4 overflow-hidden px-5 py-4">
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: "rgb(92, 102, 111)" }}
                >
                  RD
                </span>
                <p
                  className="max-w-[85%] text-[13.5px] leading-[1.55]"
                  style={{ color: "rgb(168, 173, 181)" }}
                >
                  I tried to upgrade to Growth twice and the payment failed both times — but I see two pending charges. Have I been billed?
                </p>
              </div>
              <div className="flex flex-row-reverse items-start gap-2.5">
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: "rgb(66, 140, 229)" }}
                >
                  <img alt="" className="h-full w-full object-contain" src="/icon.png" />
                </span>
                <p className="max-w-[85%] text-right text-[13.5px] leading-[1.55] text-white">
                  Good news — nothing was captured. Both attempts were declined by your bank, so you haven&apos;t been billed. The pending amounts release in 3–5 business days.
                </p>
              </div>
            </div>
            <div className="border-t px-5 py-3" style={{ borderColor: "rgb(42, 44, 49)" }}>
              <div
                className="flex h-10 items-center justify-between rounded-xl border px-3"
                style={{ borderColor: "rgb(42, 44, 49)" }}
              >
                <span className="text-[12.5px]" style={{ color: "rgb(111, 116, 124)" }}>
                  Write your reply…
                </span>
                <span
                  className="flex h-7 items-center rounded-lg px-3 text-[11.5px] font-semibold text-white"
                  style={{ backgroundColor: "rgb(66, 140, 229)" }}
                >
                  Send{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-send ml-1.5"
                    aria-hidden="true"
                  >
                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                    <path d="m21.854 2.147-10.94 10.939" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      features={[
        {
          title: "Real-Time Collaboration",
          description: "See when teammates are viewing or typing in a thread to prevent collision or duplicate responses.",
          icon: Users,
          badge: "Real-Time",
        },
        {
          title: "Lightning-Fast Search",
          description: "Find any past discussion, customer email, or order reference in milliseconds with instant indexing.",
          icon: Search,
        },
        {
          title: "Smart Views & Filters",
          description: "Organize conversations by unread, handed-off, resolved, VIP priority, or assigned teammate.",
          icon: Filter,
        },
        {
          title: "One-Click Resolution",
          description: "Mark tickets resolved with keyboard shortcuts and auto-archive completed customer discussions.",
          icon: CheckCircle2,
        },
        {
          title: "Customer Context Sidebar",
          description: "Inspect customer location, device info, conversation history, and linked Stripe subscriptions.",
          icon: Inbox,
        },
        {
          title: "SLA & Response Timing",
          description: "Track first-response latency and resolution times to maintain elite customer satisfaction.",
          icon: Clock,
        },
      ]}
      deepDiveTitle="Designed for zero backlog"
      deepDiveDescription="Clear tickets faster with purpose-built triage workflows and real-time collaboration."
      deepDiveItems={[
        {
          title: "Private Whisper Notes",
          description: "Tag teammates in private notes to solve complex problems together without customer visibility.",
          icon: MessageSquare,
          accentColor: "#168cff",
        },
        {
          title: "Smart Auto-Assignment",
          description: "Route tickets based on workload, language, skill set, or customer value automatically.",
          icon: ShieldCheck,
          accentColor: "#ff6038",
        },
        {
          title: "AI Response Copilot",
          description: "One-click responses generated from your knowledge base ready for agent review before sending.",
          icon: Sparkles,
          accentColor: "#8557e8",
        },
      ]}
      stats={[
        { value: "0ms", label: "Real-time sync latency" },
        { value: "100%", label: "Collision prevention" },
        { value: "Unlimited", label: "Teammate seats included" },
        { value: "4.9/5", label: "Agent satisfaction score" },
      ]}
      faqItems={[
        {
          q: "How many teammates can use the inbox simultaneously?",
          a: "All plans include unlimited seats. You can invite your entire company to collaborate on the shared inbox without paying per-seat penalties.",
        },
        {
          q: "Can we connect multiple customer email addresses?",
          a: "Yes. You can route support@, sales@, billing@, or custom addresses into separate or unified inbox views.",
        },
        {
          q: "Does the inbox work on mobile devices?",
          a: "Yes. The Elpino dashboard is fully responsive with real-time push alerts on mobile browsers.",
        },
      ]}
    />
  );
}
