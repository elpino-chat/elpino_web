"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

type ReleaseType = {
  // Releases are versioned by date (year.month.day).
  version: string;
  date: string;
  shortDate: string;
  type: string;
  category: "all" | "ai" | "channels" | "integrations" | "security" | "workspace";
  title: string;
  text: string;
  highlights: string[];
  // Not shipped yet: shown on the map as an upcoming stop.
  upcoming?: boolean;
};

// Newest first. Everything except the one marked `upcoming` has shipped.
const releases: ReleaseType[] = [
  {
    version: "Next",
    date: "Planned for November 2026",
    shortDate: "Nov 2026",
    type: "Omnichannel & Triage",
    category: "channels",
    upcoming: true,
    title: "Omnichannel Support & Real-time Inbox Triage",
    text: "Coming in November. Bring every customer touchpoint into one calm inbox: WhatsApp Business, Instagram DMs, Email and Messenger alongside live chat.",
    highlights: [
      "One conversation inbox for WhatsApp, Instagram, Email and web chat",
      "Collision prevention so two teammates don't reply at the same time",
      "Priority triage tagging by sentiment and issue severity",
      "Full conversation history across every channel",
    ],
  },
  {
    version: "2026.09.27",
    date: "September 27, 2026",
    shortDate: "Sep 27",
    type: "Accounts & workspaces",
    category: "security",
    title: "Self-serve password reset, workspace join links and member roles",
    text: "A complete, safer way to manage a workspace's people: reset a forgotten password yourself, share one link that lets anyone join a workspace, and hand out or take back admin access without emailing support.",
    highlights: [
      "Forgot your password? A single-use, time-limited reset link is emailed to you, and resetting signs out every other session",
      "Turn on a standing join link per workspace so new teammates can join without an individual invite; regenerate it any time to revoke access already shared",
      "Owners can promote or demote members and remove them outright, with built-in protection against ever leaving a workspace with zero owners",
      "Pending invitations can now be declined, and seats they were holding are freed immediately",
    ],
  },
  {
    version: "2026.09.27",
    date: "September 27, 2026",
    shortDate: "Sep 27",
    type: "Localization",
    category: "workspace",
    title: "The marketing site is now fully translated into 24 languages",
    text: "Every Solutions page, along with Contact, now renders end-to-end in all 24 supported languages instead of falling back to English for large sections.",
    highlights: [
      "Solutions pages for developers, founders and busy support teams are translated top to bottom, including interactive demos and FAQs",
      "The Contact page's hero, desk picker, tracking timeline and resource library are now translated, not just the form",
      "Code, claim names, error codes and other literal API surface are deliberately left untranslated so nothing drifts from the real product behaviour",
      "Fixed a machine-translation bug where certain short sentences silently lost alignment with their source string in some languages",
    ],
  },
  {
    version: "2026.09.24",
    date: "September 24, 2026",
    shortDate: "Sep 24",
    type: "Human handoff",
    category: "channels",
    title: "Ask-first human handoff with a 90-second join window",
    text: "When the AI can't solve something itself, it now asks the customer before bringing in your team. Say yes, and everyone on the team is alerted at once.",
    highlights: [
      "The AI asks before connecting a customer to your team, and only hands off on a yes",
      "Every teammate gets a Join alert; the first to join takes the chat and everyone else's alert clears",
      "The widget shows a countdown, then the teammate's first name once they join",
      "If nobody joins in 90 seconds, a ticket is created and the customer gets an email with its number",
    ],
  },
  {
    version: "2026.09.24",
    date: "September 24, 2026",
    shortDate: "Sep 24",
    type: "Billing & AI payments",
    category: "workspace",
    title: "Credit-based plans, recurring seats and payment tools",
    text: "Pricing now follows what the AI does. Free covers 50 conversations, paid plans include a monthly AI credit, and the AI can sort out common payment questions for connected Stripe and Razorpay accounts.",
    highlights: [
      "Free is capped at 50 AI conversations; paid plans are metered by a monthly AI credit",
      "Extra seats are billed with your plan every month and can be removed at the next renewal",
      "The AI checks payment status, explains failed payments and sends a fresh payment link or receipt",
      "AI refunds are off by default: owners switch them on and set the amount and age limits",
    ],
  },
  {
    version: "2026.09.24",
    date: "September 24, 2026",
    shortDate: "Sep 24",
    type: "Chatbot controls",
    category: "workspace",
    title: "Chatbot reply language, page rules and workspace logo",
    text: "More control over how the chatbot behaves on your site, and a redesigned Settings area to manage it.",
    highlights: [
      "Auto-detect the reply language, or force one for every conversation",
      "Show or hide the chat widget on specific pages, with wildcard paths like /docs/*",
      "Upload your workspace logo in Settings",
      "A redesigned Settings area for the chatbot, workspace and billing",
    ],
  },
  {
    version: "2026.09.23",
    date: "September 23, 2026",
    shortDate: "Sep 23",
    type: "Identity verification",
    category: "security",
    title: "Identity verification",
    text: "Prove who your logged-in users are. Your site signs a token for each signed-in visitor, so Elpino knows who is chatting without asking them to prove it again.",
    highlights: [
      "Turn identity verification on from Settings and generate your secret",
      "Signed visitor tokens carry the user's name, email or ID",
      "Conversations now show whether the visitor is verified",
      "Verified visitors unlock account tools such as payment lookups and your connected systems",
    ],
  },
  {
    version: "2026.09.22",
    date: "September 22, 2026",
    shortDate: "Sep 22",
    type: "Security & billing fixes",
    category: "security",
    title: "Gateway hardening, billing fixes and real plan gates",
    text: "A round of fixes that close a trust gap in the API gateway and make billing and plan limits behave exactly as advertised.",
    highlights: [
      "Every non-public gateway route now requires an internal secret, so nothing trusts a bare account ID",
      "Analytics and customer profiles are now genuinely gated by plan",
      "Renewal webhooks can't replay and reset spent usage; auto-recharge is atomic and only credits captured payments",
      "Free workspaces roll their monthly allowance over correctly",
    ],
  },
  {
    version: "2026.09.20",
    date: "September 20, 2026",
    shortDate: "Sep 20",
    type: "Assistants & workflows",
    category: "ai",
    title: "More assistants and conversation workflows",
    text: "New ways to get help from the AI, and to keep your team's own notes and follow-ups tidy.",
    highlights: [
      "A documentation assistant that answers questions straight from your docs",
      "Team-only notes in a conversation that the customer never sees",
      "The AI reviews closed conversations and files a follow-up ticket when something is still owed",
      "Company size is captured at sign-up",
    ],
  },
  {
    version: "2026.09.16",
    date: "September 16, 2026",
    shortDate: "Sep 16",
    type: "Customer verification",
    category: "security",
    title: "Verify customers by email code, and look up their payments",
    text: "Visitors who aren't logged in can now prove who they are in the chat, which unlocks account help without a handoff.",
    highlights: [
      "The AI emails a 6-digit code to the address on the customer's account to verify them",
      "A correct code verifies the conversation for 12 hours; codes expire after 10 minutes and are rate limited",
      "Payment history, including failed charges, through Elpino's own MCP server",
      "Email a documented resource link to a customer, with replies kept short",
    ],
  },
  {
    version: "2026.09.15",
    date: "September 15, 2026",
    shortDate: "Sep 15",
    type: "Tools & MCP",
    category: "integrations",
    title: "Tools: MCP connectors and Elpino's own MCP server",
    text: "Connect your own systems and let the AI use them as tools, so it can answer from live data instead of only your documentation.",
    highlights: [
      "Connect a CRM, billing tool, booking system or internal API over MCP",
      "Admins approve each tool; tools that can change data are flagged and need a verified customer",
      "Tool results pass through the same privacy filter as everything else the AI sees",
      "Elpino's own MCP server lets the AI look up a signed-in customer's real subscription and usage",
      "Real Google sign-in through Firebase",
    ],
  },
  {
    version: "2026.09.15",
    date: "September 15, 2026",
    shortDate: "Sep 15",
    type: "Live widget",
    category: "channels",
    title: "A live widget with better-formatted replies",
    text: "The chat feels instant now, and answers are easier to read.",
    highlights: [
      "Replies stream into the widget the moment they're ready",
      "A conversational pre-chat asks for details naturally",
      "Multi-part answers use short paragraphs, bold key terms, lists and clickable links",
      "Contact details are asked for only at handoff, phone numbers are captured, and replies can be emailed to visitors who have left",
      "Message notifications with sound in the dashboard",
    ],
  },
  {
    version: "2026.09.14",
    date: "September 14, 2026",
    shortDate: "Sep 14",
    type: "Private data",
    category: "security",
    title: "Private data, kept private",
    text: "The AI works with real customer data without exposing it to the models behind it.",
    highlights: [
      "Customer identifiers are swapped for opaque references before any model sees them",
      "Secrets and personal data are redacted from prompts",
      "Payment tools return status facts only, never raw payment details",
      "Conversations involving private data are routed to a dedicated model",
    ],
  },
  {
    version: "2026.09.13",
    date: "September 13, 2026",
    shortDate: "Sep 13",
    type: "AI models & routing",
    category: "ai",
    title: "More models, specialist routing and a crawler that follows your links",
    text: "The AI got faster, more human, and better at finding answers on your own site.",
    highlights: [
      "DeepSeek and GLM added, with per-role model defaults",
      "Specialist routing: sales, support and technical questions each get the right instructions",
      "A knowledge crawler that follows links to build your knowledge base from your site",
      "Live busy-status updates for teammates, and clickable page links in replies",
    ],
  },
  {
    version: "2026.09.11",
    date: "September 11, 2026",
    shortDate: "Sep 11",
    type: "Credits, seats & translation",
    category: "workspace",
    title: "AI credits, seat bundles and translation",
    text: "The first version of workspace billing, plus tools for global teams.",
    highlights: [
      "Seat bundles and monthly AI credit grants",
      "Payment-backed AI credit top-ups with auto-recharge",
      "Dashboard language and on-demand translation of messages and replies",
      "Delete or leave a workspace, or delete your account",
    ],
  },
];

// The very first days, before the line had a name.
const foundations = [
  ["Day one", "Elpino begins", "The first release: an AI support agent, an embeddable chat widget, a shared inbox with team presence, a knowledge base and billing, in one platform.", "Sep 10, 2026"],
  ["Knowledge", "Better ingestion", "Tables survive chunking, and a failed crawl now says why it failed instead of showing one generic error.", "Sep 10, 2026"],
  ["Ops", "Ready to ship", "An explicit CORS allowlist, a hardened container runtime, a deploy script, environment templates and CI.", "Sep 10, 2026"],
];

// The four categories are four lines on a map. Each release is a station on one of them.
const LINES: Record<Exclude<ReleaseType["category"], "all">, { label: string; color: string }> = {
  ai: { label: "AI & Copilot", color: "#0078f4" },
  channels: { label: "Channels & Inbound", color: "#fc7b33" },
  integrations: { label: "Integrations & APIs", color: "#7060bd" },
  security: { label: "Security & Trust", color: "#1aa37a" },
  workspace: { label: "Billing & Workspace", color: "#d9508a" },
};


export function ChangelogTimeline() {
  const [filter, setFilter] = useState<"all" | Exclude<ReleaseType["category"], "all">>("all");
  const listRef = useRef<HTMLDivElement>(null);
  const [trainTop, setTrainTop] = useState(0);
  const [passed, setPassed] = useState(-1);

  const visible = useMemo(() => releases.filter((release) => filter === "all" || release.category === filter), [filter]);
  const shipped = useMemo(() => releases.filter((release) => !release.upcoming), []);
  const upcoming = useMemo(() => releases.filter((release) => release.upcoming), []);
  const counts = useMemo(() => {
    const result: Record<string, number> = { all: shipped.length };
    for (const release of shipped) result[release.category] = (result[release.category] ?? 0) + 1;
    return result;
  }, [shipped]);
  // The hero board and the "Latest" tag refer to what has actually shipped.
  const latest = shipped[0];

  // The train follows the scroll; a station lights once the train has reached it.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const centre = window.innerHeight * 0.5;
      setTrainTop(Math.min(rect.height, Math.max(0, centre - rect.top)));
      let last = -1;
      list.querySelectorAll<HTMLElement>("[data-station]").forEach((el, index) => {
        if (el.getBoundingClientRect().top + 90 < centre) last = index;
      });
      setPassed(last);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [filter]);

  return (
    <main className="overflow-x-clip bg-white text-[#11120f]">
      {/* Hero */}
      <section className="px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto grid max-w-[1500px] items-end gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="text-[14px] text-black/50">Changelog</p>
            <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]">
              A little better,<br />
              every single release.
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">
              A living record of the improvements, architecture upgrades and new capabilities we ship to make customer support better.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5 text-[13.5px]">
              <span className="rounded-full bg-[#11120f] px-3.5 py-1.5 font-medium text-white">{shipped.length} releases</span>
              {upcoming.length > 0 && <span className="rounded-full border border-dashed border-black/40 bg-white px-3.5 py-1.5">{upcoming.length} coming in November</span>}
              <span className="rounded-full border border-black/25 bg-white px-3.5 py-1.5">{Object.keys(LINES).length} lines</span>
              <span className="rounded-full border border-black/25 bg-white px-3.5 py-1.5">Since {foundations[0][3].replace(/ \d+,/, "")}</span>
            </div>
          </div>

          {/* Latest release */}
          <a href="#line" className="group relative animate-[elpino-focus_0.9s_ease-out_0.3s_both] rounded-[10px] bg-[#11120f] p-6 text-white transition-opacity duration-300 hover:opacity-95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/changelog-sloth.png" alt="" className="absolute -right-3 -top-5 h-14 w-14 rounded-full border border-black/15 bg-white object-cover object-top" />
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">Latest release</p>
            <p className="mt-3 font-mono text-4xl font-medium tracking-[-0.03em]">{latest.version}</p>
            <p className="mt-2 text-lg leading-6 text-white/90">{latest.type}</p>
            <p className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 font-mono text-[12px] uppercase tracking-[0.06em] text-white/55">
              {latest.shortDate}
              <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
            </p>
            {upcoming[0] && (
              <p className="mt-3 rounded-lg border border-dashed border-white/35 px-3 py-2 text-[13px] leading-5 text-white/80">
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-white/55">Next · {upcoming[0].shortDate}</span><br />
                {upcoming[0].type}
              </p>
            )}
          </a>
        </div>
      </section>

      {/* The line map */}
      <section id="line" className="scroll-mt-16 bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="max-w-2xl">
            <p className="text-[14px] text-black/50">Release timeline</p>
            <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Follow the line.</h2>
            <p className="mt-4 text-base leading-7 text-black/60">Every feature, API connector, and security advancement in chronological order. Pick a line to see only its stops.</p>
          </Rv>

          {/* Line picker */}
          <div className="mt-10 flex flex-wrap gap-2.5" role="group" aria-label="Filter releases by line">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={`inline-flex items-center gap-2 rounded-full border border-black/25 px-4 py-2 text-[14px] font-medium transition hover:border-black/60 ${filter === "all" ? "border-[#11120f] bg-[#11120f] text-white" : "bg-white"}`}>
              All lines <span className="rounded-full bg-white/25 px-1.5 font-mono text-[11px]">{counts.all}</span>
            </button>
            {(Object.keys(LINES) as (keyof typeof LINES)[]).map((key) => {
              const on = filter === key;
              return (
                <button key={key} type="button" aria-pressed={on} onClick={() => setFilter(key)} className={`inline-flex items-center gap-2 rounded-full border border-black/25 px-4 py-2 text-[14px] font-medium transition hover:border-black/60 ${on ? "border-[#11120f] bg-[#11120f] text-white" : "bg-white"}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: LINES[key].color }} />
                  {LINES[key].label} <span className={`rounded-full px-1.5 font-mono text-[11px] ${on ? "bg-white/25" : "bg-black/10"}`}>{counts[key] ?? 0}</span>
                </button>
              );
            })}
          </div>

          <div ref={listRef} className="relative mt-16">
            {/* the track: dashes flow downward, and the fill shows how far the train has come */}
            <div aria-hidden="true" className="absolute inset-y-0 left-[15px] w-[2px] -translate-x-1/2 rounded-full bg-black/15 md:left-1/2" />
            <div aria-hidden="true" className="absolute left-[15px] top-0 w-[2px] -translate-x-1/2 rounded-full bg-[#0078f4] md:left-1/2" style={{ height: trainTop }} />
            {/* the train */}
            <div aria-hidden="true" className="absolute left-[15px] z-20 -translate-x-1/2 -translate-y-1/2 transition-[top] duration-200 ease-out md:left-1/2" style={{ top: trainTop }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/changelog-sloth.png" alt="" className="h-12 w-12 rounded-full border border-black/20 bg-white object-cover object-top shadow-[0_4px_14px_rgba(15,23,42,0.15)]" />
            </div>

            <ol className="relative">
              {visible.map((release, index) => {
                const line = LINES[release.category as keyof typeof LINES];
                const soon = Boolean(release.upcoming);
                const lit = index <= passed && !soon;
                const current = index === passed && !soon;
                const cardLeft = index % 2 === 1;
                return (
                  <li key={`${release.version}-${release.title}`} data-station className="relative grid gap-x-16 pb-14 last:pb-0 md:grid-cols-2 md:pb-20">
                    {/* the station */}
                    <span aria-hidden="true" className="absolute left-[15px] top-8 z-10 -translate-x-1/2 md:left-1/2">
                      {current && <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: line.color }} />}
                      <span className={`relative flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] font-medium transition-colors duration-500 ${soon ? "border-dashed border-black/40 bg-white text-black/50" : lit ? "border-transparent text-white" : "border-black/25 bg-white text-black/40"}`} style={lit ? { background: line.color } : undefined}>{soon ? "…" : lit ? "✓" : ""}</span>
                    </span>

                    {/* date sticker */}
                    <Rv variant="pop" className={`pl-14 pt-4 md:pl-0 md:pt-4 ${cardLeft ? "md:order-2 md:pl-14" : "md:order-1 md:pr-14 md:text-right"}`}>
                      <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em]" style={{ color: line.color }}>{soon ? "Next stop" : release.version}</p>
                      <p className="mt-1 text-4xl font-normal tracking-[-0.04em] text-black/85 sm:text-5xl">{release.shortDate}</p>
                      <p className="mt-1 text-sm text-black/45">{release.date}</p>
                      {soon && <span className="mt-3 inline-flex rounded-full border border-dashed border-black/40 bg-white px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider">Coming in November</span>}
                      {!soon && release.version === latest.version && <span className="mt-3 inline-flex rounded-full bg-[#0078f4] px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white">Latest</span>}
                    </Rv>

                    {/* the release */}
                    <Rv variant="up" className={`pl-14 pt-6 md:pl-0 md:pt-0 ${cardLeft ? "md:order-1 md:pr-14" : "md:order-2 md:pl-14"}`}>
                      <article className={`group overflow-hidden rounded-[10px] border border-black/40 bg-white transition-colors duration-300 hover:bg-[#fafaf9] ${soon ? "border-dashed" : ""}`}>
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/15 px-6 py-3.5">
                          <span className="inline-flex items-center gap-2 text-[13px] font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ background: line.color }} />{release.type}</span>
                          <span className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-black/45">{soon ? "Coming in November" : line.label}</span>
                        </header>
                        <div className="p-6 sm:p-8">
                          <h3 className="text-2xl font-normal leading-[1.1] tracking-[-0.03em] sm:text-[30px]">{release.title}</h3>
                          <p className="mt-3 text-[15px] leading-7 text-black/60">{release.text}</p>
                          <div className="mt-6 rounded-xl bg-[#f4f4f2] p-5">
                            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-black/45">{soon ? "What's planned" : "Key enhancements"}</p>
                            <ul className="mt-3 space-y-2.5">
                              {release.highlights.map((highlight, i) => (
                                <li key={highlight} className="rv-item flex items-start gap-3 text-[14.5px] leading-6 text-black/75" style={{ ["--id" as string]: `${300 + i * 110}ms` }}>
                                  <span className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full" style={{ background: `${line.color}1f`, color: line.color }}>
                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 6 8.5 13.5 4 9" /></svg>
                                  </span>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </article>
                    </Rv>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Earlier chapters: the terminus */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="max-w-2xl">
            <p className="text-[14px] text-black/50">Earlier chapters</p>
            <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Where the line began.</h2>
            <p className="mt-4 text-base leading-7 text-black/60">The first days, and what everything above was built on.</p>
          </Rv>
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div aria-hidden="true" className="absolute left-0 right-0 top-[15px] hidden h-px bg-black/20 md:block" />
            {foundations.map(([version, title, text, date], index) => (
              <Rv key={version} variant="deal" delay={index * 130} className="relative pt-10">
                <span aria-hidden="true" className="absolute left-6 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-black/25 bg-white font-mono text-[11px] font-medium" style={{ color: ["#0078f4", "#1aa37a", "#7060bd"][index] }}>{index === 0 ? "★" : ""}</span>
                <article className="h-full rounded-[10px] border border-black/40 bg-white p-7 transition-colors duration-300 hover:bg-[#fafaf9]">
                  <span className="font-mono text-sm font-medium text-black/45">{version}</span>
                  <h3 className="mt-3 text-2xl font-normal tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 min-h-[72px] text-[14.5px] leading-6 text-black/60">{text}</p>
                  <time className="mt-5 block border-t border-black/10 pt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-black/45">{date}</time>
                </article>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* Request a stop */}
      <section className="bg-white px-5 pb-24 pt-4 sm:px-8 lg:px-20">
        <Rv className="mx-auto max-w-[1500px]">
          <div className="rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
            <p className="text-[14px] text-black/50">Help shape what&apos;s next</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">Have an idea for a better customer conversation?</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">We ship multiple times a week and work closely with support teams. Tell us which integrations or workflows would help yours.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">
                Submit feature request <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link href="/signup" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">Try Elpino free</Link>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
