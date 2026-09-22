import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, Check, Grid3x3, Inbox, Plug, Search, Send, Settings, Users } from "lucide-react";
import { GoogleIcon } from "@/app/components/auth/AuthShared";

// Colors and shapes lifted from the real dashboard (dashboard-client.tsx,
// Sidebar.tsx, HomePanel.tsx) — a coded still frame of the actual product,
// not a stock screenshot or an invented redesign.
const railItems = [
  { label: "Space", icon: Grid3x3 },
  { label: "Inbox", icon: Inbox, active: true },
  { label: "Analytics", icon: BarChart2 },
  { label: "Contacts", icon: Users },
  { label: "Knowledge", icon: BookOpen },
  { label: "Connect", icon: Plug },
  { label: "Settings", icon: Settings },
];

const conversations = [
  { name: "Rahul Das", time: "2m", preview: "I tried to upgrade to Growth twice and the payment failed...", unread: 2, active: true },
  { name: "Meera Iyer", time: "1h", preview: "Can we move the team to annual billing halfway through?", resolved: false },
  { name: "Tom Becker", time: "4h", preview: "The chat widget isn't loading on our checkout page.", resolved: true },
];

export function HomeHero() {
  return (
    <section className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-black">


      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-6 pt-8 text-center sm:px-8 sm:pt-12 lg:pt-16">
        <h1 className="elpino-hero-enter elpino-hero-enter-1 w-full text-[63px] font-normal leading-none tracking-[-0.02em] text-black sm:text-[75px]">
          AI support that actually answers, backed by a team when it can&apos;t
        </h1>
        <p className="elpino-hero-enter elpino-hero-enter-2 mt-6 w-full max-w-4xl text-center text-lg font-light not-italic leading-7 text-black/65 sm:text-xl">
          One shared inbox, a knowledge base your AI actually reads from, and a clean handoff to your team the moment a conversation needs a human.
        </p>

        {/* Both funnel into the real signup flow (AuthFlow), which already
            offers Google as one of its options — the actual OAuth popup
            needs client-side Firebase, not something this page does. */}
        <div className="elpino-hero-enter elpino-hero-enter-2 mt-8 flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-md bg-[#111310] px-6 text-[16px] font-normal text-white transition hover:bg-black/90 sm:h-11"
          >
            View demo
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#111310] bg-white px-6 text-[16px] font-normal text-[#111310] transition duration-200 hover:bg-[#fafafa] active:translate-y-px sm:h-11"
          >
            Start free trial
          </Link>
        </div>
        <p className="elpino-hero-enter elpino-hero-enter-2 mt-5 flex items-center justify-center gap-2 text-[14.5px] font-light text-[#4a4f56]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#111310]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          14 day free trial. No credit card required.
        </p>

        {/* The actual dashboard shared inbox (dashboard-client.tsx / Sidebar.tsx
            / HomePanel.tsx), reproduced as a coded still frame: same icon
            rail, same list-row shape, and same "no chat bubbles in the
            dashboard thread" rule the real app uses — not a redesign of it. */}
        <div className="elpino-hero-enter elpino-hero-enter-4 relative mt-14 w-full max-w-7xl">
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_25%_20%,#fc7b33_0%,transparent_55%),radial-gradient(circle_at_75%_30%,#7060bd_0%,transparent_55%),radial-gradient(circle_at_50%_90%,#428ce5_0%,transparent_50%)] opacity-50 blur-3xl"
          />
          <div className="relative flex h-[560px] w-full overflow-hidden rounded-md text-left shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)]" style={{ backgroundColor: "#17181c" }}>
            {/* Icon rail */}
            <div className="flex w-[68px] shrink-0 flex-col items-center gap-1 py-4" style={{ backgroundColor: "#428ce5" }}>
              <span className="mb-3 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15">
                <img src="/icon.png" alt="" className="h-full w-full object-contain" />
              </span>
              {railItems.map(({ label, icon: Icon, active }) => (
                <div key={label} className={`flex w-full flex-col items-center gap-0.5 rounded-lg py-1.5 ${active ? "bg-white/20" : ""}`}>
                  <Icon size={18} aria-hidden="true" className="text-white" />
                  <span className="text-[9px] text-white/80">{label}</span>
                </div>
              ))}
            </div>

            {/* Conversation list */}
            <div className="flex w-[230px] shrink-0 flex-col border-r" style={{ borderColor: "#2a2c31" }}>
              <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "#2a2c31" }}>
                <Search size={14} aria-hidden="true" style={{ color: "#8a8f98" }} />
                <span className="text-[12.5px]" style={{ color: "#8a8f98" }}>Search conversations</span>
              </div>
              <div className="flex gap-4 border-b px-3 py-2 text-[11px] font-medium" style={{ borderColor: "#2a2c31", color: "#8a8f98" }}>
                <span style={{ color: "#f2f3f5" }}>All</span>
                <span>Unread</span>
                <span>Resolved</span>
              </div>
              <div className="flex-1 space-y-0.5 overflow-hidden p-1.5">
                {conversations.map(({ name, time, preview, unread, resolved, active }) => (
                  <div key={name} className={`rounded-xl px-2.5 py-2.5 ${active ? "bg-white/[0.06]" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 truncate">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "#5c666f" }}>
                          {name.split(" ").map((p) => p[0]).join("")}
                        </span>
                        <span className="truncate text-[12.5px] font-semibold" style={{ color: unread ? "#f2f3f5" : "#c2c6cc" }}>{name}</span>
                      </span>
                      <span className="shrink-0 text-[9px]" style={{ color: "#6f747c" }}>{time}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 pl-9">
                      {resolved && <Check size={11} aria-hidden="true" style={{ color: "#32a880" }} />}
                      <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: "#8a8f98" }}>{preview}</span>
                      {unread ? (
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: "#428ce5" }}>{unread}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thread panel — no bubbles: plain text, right-aligned for the
                team/AI reply, left-aligned for the customer. */}
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "#2a2c31" }}>
                <span className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "#5c666f" }}>RD</span>
                  <span className="text-[13px] font-semibold text-white">Rahul Das</span>
                </span>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: "#32a88022", color: "#32a880" }}>Resolved</span>
              </div>
              <div className="flex-1 space-y-4 overflow-hidden px-5 py-4">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: "#5c666f" }}>RD</span>
                  <p className="max-w-[85%] text-[13.5px] leading-[1.55]" style={{ color: "#a8adb5" }}>
                    I tried to upgrade to Growth twice and the payment failed both times &mdash; but I see two pending charges. Have I been billed?
                  </p>
                </div>
                <div className="flex flex-row-reverse items-start gap-2.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: "#428ce5" }}>
                    <img src="/icon.png" alt="" className="h-full w-full object-contain" />
                  </span>
                  <p className="max-w-[85%] text-right text-[13.5px] leading-[1.55] text-white">
                    Good news &mdash; nothing was captured. Both attempts were declined by your bank, so you haven&apos;t been billed. The pending amounts release in 3&ndash;5 business days.
                  </p>
                </div>
              </div>
              <div className="border-t px-5 py-3" style={{ borderColor: "#2a2c31" }}>
                <div className="flex h-10 items-center justify-between rounded-xl border px-3" style={{ borderColor: "#2a2c31" }}>
                  <span className="text-[12.5px]" style={{ color: "#6f747c" }}>Write your reply&hellip;</span>
                  <span className="flex h-7 items-center rounded-lg px-3 text-[11.5px] font-semibold text-white" style={{ backgroundColor: "#428ce5" }}>
                    Send <Send size={12} aria-hidden="true" className="ml-1.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
