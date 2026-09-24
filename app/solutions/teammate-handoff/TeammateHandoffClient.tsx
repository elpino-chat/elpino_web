"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  MessagesSquare,
  Users,
  MessageSquare,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Share2,
  AtSign,
  Send,
  Eye,
  Bell,
  Code2,
  Building,
} from "lucide-react";

export function TeammateHandoffClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simNote, setSimNote] = useState("@billing-ops verified customer payment was charged twice via Stripe. Need a refund of $149 processed.");
  const [noteSent, setNoteSent] = useState(false);

  const stats = [
    {
      value: "72%",
      label: "Reduction in cross-team ping-pong",
      detail: "Unified threads eliminate disjointed email chains and lost context",
    },
    {
      value: "4.1x",
      label: "Faster resolution on complex tickets",
      detail: "Support, Engineering, and Billing collaborate in real time with private whispers",
    },
    {
      value: "100%",
      label: "Internal note privacy guarantee",
      detail: "Whisper notes are cryptographically partitioned from customer-facing streams",
    },
    {
      value: "0",
      label: "Accidental double-replies",
      detail: "Real-time collision detection locks tickets when a teammate is typing",
    },
  ];

  const collaborationPods = [
    {
      pod: "Support ↔ Engineering",
      badge: "Linear & GitHub Bridge",
      description: "Link customer bug reports directly to dev issues. When engineers ship the fix, the customer ticket updates automatically.",
      avatarColor: "bg-[#7651b0]",
      example: "Linear issue #ENG-489 linked • Auto-closes when PR merges to main",
    },
    {
      pod: "Support ↔ Finance & Billing",
      badge: "Stripe & Invoicing",
      description: "Request refunds, custom invoicing, or VAT updates directly in the ticket with pre-populated Stripe charge IDs.",
      avatarColor: "bg-[#18c983]",
      example: "Stripe Charge ch_3M8x linked • 1-click refund authorization",
    },
    {
      pod: "Support ↔ Sales & CSM",
      badge: "HubSpot & Salesforce",
      description: "Loop in Account Executives whenever an expansion opportunity or high-value contract renewal is detected.",
      avatarColor: "bg-[#428ce5]",
      example: "High expansion signal: customer asked for 250 enterprise seats",
    },
  ];

  const pillars = [
    {
      icon: AtSign,
      title: "Private Whisper Notes with @Mentions",
      badge: "Internal Chat",
      description:
        "Discuss tricky edge cases directly inside the conversation thread. Tag teammates or whole pods (e.g. @billing, @security) without the customer seeing a single backstage word.",
      points: [
        "Distinct visual container and padlock indicator prevents accidental customer leakage",
        "Instant desktop, mobile, and Slack notifications for tagged colleagues",
        "Supports rich markdown, file attachments, and terminal logs",
        "Permanent internal audit history maintained for compliance reviews",
      ],
      metric: "< 2 min",
      metricLabel: "Internal teammate response time",
    },
    {
      icon: Eye,
      title: "Live Collision Detection & Active Typing Avatars",
      badge: "Conflict Prevention",
      description:
        "Never send conflicting replies to the same customer. Real-time presence indicators show exactly who has the ticket open, who is reviewing, and who is drafting a response.",
      points: [
        "Visual presence indicators display avatar bubbles at the top of the conversation",
        "Active draft locks warn colleagues if another agent is already responding",
        "Draft recovery preserves replies in progress if an agent loses network connection",
        "Smooth ticket takeovers with one-click 'Hand conversation to me' protocol",
      ],
      metric: "100%",
      metricLabel: "Collision prevention rate",
    },
    {
      icon: GitPullRequest,
      title: "Bi-directional Linear, Jira & GitHub Bridge",
      badge: "DevOps Alignment",
      description:
        "Bridge the gap between customer support tickets and product development backlogs. Create, link, and track engineering bugs without leaving the inbox.",
      points: [
        "1-click issue creation in Linear, Jira, or GitHub Issues with customer repro steps pre-filled",
        "Live status sync: 'In Progress', 'In Review', 'Fixed in Staging', 'Deployed to Production'",
        "Automated notification fires to customer the instant the deployment completes",
        "Bi-directional comment syncing preserves engineering discussions",
      ],
      metric: "4.1x",
      metricLabel: "Faster engineering turnaround",
    },
    {
      icon: Users,
      title: "Team Inboxes, Pod Routing & Watchers",
      badge: "Ownership Governance",
      description:
        "Eliminate ambiguous accountability. Organize your team into dedicated pods (Tier-1, Tier-2, Billing, Enterprise CSM) with primary assignees and secondary watchers.",
      points: [
        "Primary assignee owns the conversation outcome and SLA timer",
        "Secondary watchers receive updates without cluttering their personal assigned inbox",
        "Smart load-balancing routes tickets based on current concurrent active threads",
        "Automated reassignment if an assigned agent goes offline or exceeds their shift",
      ],
      metric: "0",
      metricLabel: "Dropped or orphaned tickets",
    },
  ];

  const faqs = [
    {
      q: "Can customers ever see our internal private whisper notes?",
      a: "Never. Whisper notes are stored in a dedicated database column with strict role-based access control (RBAC). They are never transmitted over customer WebSocket channels, email dispatch pipelines, or public APIs.",
    },
    {
      q: "Does tagging a teammate send them an alert if they aren't logged into Elpino?",
      a: "Yes. When you @mention a teammate or user group (e.g. @billing-ops), Elpino immediately dispatches a Slack ping, desktop push alert, and email notification with a deep-link directly to the conversation.",
    },
    {
      q: "How does the Linear / Jira integration handle bug status changes?",
      a: "When an engineer marks a linked Linear issue 'Done' or merges the pull request on GitHub, Elpino automatically adds a private note to the support ticket informing the support agent that the fix is live in production.",
    },
    {
      q: "Can multiple teammates work on the same ticket together?",
      a: "Yes. Multiple teammates can view a ticket simultaneously, leave internal whispers, and collaborate. Our collision detection locks the customer-facing input field so only one person can send a reply at any given second.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,86,0,0.07),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(118,81,176,0.07),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5600]/30 bg-[#fff0e8] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#b4542c]">
                <MessagesSquare size={14} className="text-[#b4542c]" />
                Cross-Functional Support Collaboration
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Hand conversations to teammates{" "}
                <span className="text-[#b4542c]">without losing the thread.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#53616b] sm:text-xl">
                Break down the silos between Support, Engineering, Billing, and Sales.
                Collaborate in real time using private whisper notes, live collision detection,
                and seamless Linear & GitHub issue synchronization.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#17181c] px-7 text-sm font-semibold text-white transition hover:bg-[#b4542c]"
                >
                  Start free trial <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#f1edf7]"
                >
                  Book collaboration demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#53616b]">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Private whispers & @mentions
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Linear, Jira & GitHub bi-directional sync
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Live collision avoidance locking
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Pod Visualizer */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4effb] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#17181c] text-white">
                      <Users size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Cross-Pod Resolution Team</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    3 Teammates Active
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/about-sloth-crew.png"
                      alt="Elpino sloth crew collaborating on customer solutions"
                      width={1200}
                      height={1200}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Ticket #40291 • Billing Dispute</span>
                        <span className="text-[#b4542c]">Assigned: Maya S.</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#7651b0]">
                        Whisper: &ldquo;@dave-billing confirmed $149 refund processed in Stripe. Ready for customer reply.&rdquo;
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>Watching: 2 pods</span>
                        <span className="font-bold text-[#168a5b]">0 collision conflicts</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#ff5600]/20 bg-[#fff0e8] p-3 text-xs text-[#b4542c]">
                      <span className="font-semibold">Team synergy:</span> Resolved in 6 minutes without customer ever being passed between 3 different agents.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-black/10 bg-[#17181c] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
            Team Productivity & Collaboration Speed
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-[#b4542c] pl-6">
                <p className="text-4xl font-normal tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Simulator: Cross-Team Collaboration Console */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fff0e8] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#b4542c]">
              <Sparkles size={13} />
              Interactive Collaboration Console
            </span>
            <h2 className="mt-5 text-balance text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Collaborate backstage. Present one unified voice.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Test how internal private whispers, @mentions, and external issue links keep your entire team aligned without bewildering the customer.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-black/10 bg-[#fbfbfa] p-5 shadow-xl sm:p-8 lg:p-10">
            {/* Pod selector */}
            <div className="grid gap-4 md:grid-cols-3">
              {collaborationPods.map((pod, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx);
                    setNoteSent(false);
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    activeTab === idx
                      ? "border-[#17181c] bg-white shadow-md ring-2 ring-[#17181c]/10"
                      : "border-black/10 bg-white/70 hover:bg-white"
                  }`}
                >
                  <span className="inline-flex rounded-full border border-black/10 bg-[#faf9f6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#53616b]">
                    {pod.badge}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#17181c]">{pod.pod}</h3>
                  <p className="mt-1 text-xs text-[#53616b]">{pod.example}</p>
                </button>
              ))}
            </div>

            {/* Interactive Workspace */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: Internal Whisper Thread View */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#b4542c]/10 px-2 py-0.5 text-xs font-semibold text-[#b4542c]">
                      🔒 Internal Whisper Mode
                    </span>
                    <span className="text-xs text-[#53616b]">Customer will NOT see this note</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-[#18c983]">
                    <span className="size-2 rounded-full bg-[#18c983]" />
                    Presence: 2 viewing
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Previous agent message */}
                  <div className="rounded-xl border border-[#b4542c]/20 bg-[#fff9f6] p-4 text-xs leading-relaxed text-[#17181c]">
                    <div className="flex items-center justify-between font-semibold text-[#b4542c]">
                      <span>Maya S. (Support Lead)</span>
                      <span className="text-[11px] font-normal text-[#53616b]">2 mins ago</span>
                    </div>
                    <p className="mt-1 text-[#53616b]">
                      Customer is asking for an immediate credit for the invoice discrepancy. @billing-ops can you check the Stripe webhook for subscription sub_19482?
                    </p>
                  </div>

                  {/* Sent note confirmation */}
                  {noteSent && (
                    <div className="rounded-xl border border-[#18c983]/30 bg-[#eef7f1] p-4 text-xs leading-relaxed text-[#17181c]">
                      <div className="flex items-center justify-between font-semibold text-[#168a5b]">
                        <span>Dave K. (Billing Ops)</span>
                        <span className="text-[11px] font-normal text-[#53616b]">Just now</span>
                      </div>
                      <p className="mt-1 text-[#53616b]">{simNote}</p>
                      <span className="mt-2 inline-block rounded bg-[#18c983]/20 px-2 py-0.5 text-[10px] font-semibold text-[#168a5b]">
                        ✓ Stripe refund executed • Slack alert sent to #finance-audit
                      </span>
                    </div>
                  )}

                  {/* Input form for whisper note */}
                  {!noteSent && (
                    <div className="mt-4 rounded-xl border border-black/15 bg-white p-3.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#53616b]">
                        <AtSign size={13} className="text-[#b4542c]" /> Tag Teammate or Pod:
                      </div>
                      <textarea
                        value={simNote}
                        onChange={(e) => setSimNote(e.target.value)}
                        rows={2}
                        className="mt-2 w-full resize-none rounded-lg border border-black/10 p-2.5 text-xs text-[#17181c] focus:border-[#b4542c] focus:outline-none"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-[#53616b]">Only teammates in your workspace can see this</span>
                        <button
                          onClick={() => setNoteSent(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#b4542c] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#964220]"
                        >
                          <Send size={13} /> Post Internal Whisper
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Cross-App Sync Hub */}
              <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#17181c] p-6 text-white shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-[#d9bef4]">Connected Tool Ecosystem</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70">
                      Sync Status: OK
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 font-mono text-xs">
                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#18c983] font-semibold">// Stripe Invoicing Bridge</span>
                      <p className="mt-1 text-white/90">customer_id: &quot;cus_94821&quot;</p>
                      <p className="text-white/70">invoice_status: &quot;PAID_DUPLICATE&quot;</p>
                      <p className="text-white/70">action: &quot;REFUND_AUTHORIZED&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#428ce5] font-semibold">// Slack Cross-Channel Ping</span>
                      <p className="mt-1 text-white/90">channel: #billing-ops</p>
                      <p className="text-white/70">notification: &quot;@dave-billing mentioned in ticket #40291&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#d9bef4] font-semibold">// Linear Issue Link</span>
                      <p className="mt-1 text-white/90">issue: &quot;ENG-489 - Duplicate charge webhook retry bug&quot;</p>
                      <p className="text-white/70">assignee: &quot;Alex (Backend Team)&quot;</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
                  <span className="font-semibold text-white">Impact:</span> 0 duplicate responses sent. Customer problem solved seamlessly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Architectural Pillars */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#b4542c]">
              Collaboration Architecture
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Built for speed, clarity, and accountability.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Support teams that solve problems together deliver unforgettable customer experiences.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md sm:p-9"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#b4542c]">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-black/10 bg-[#fbfbfa] px-3 py-1 text-xs font-semibold text-[#53616b]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-normal tracking-[-0.04em] text-[#17181c]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#53616b]">
                      {pillar.description}
                    </p>

                    <div className="mt-6 space-y-2.5 border-t border-black/5 pt-5">
                      {pillar.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#53616b]">
                          <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="text-xs font-medium text-[#53616b]">{pillar.metricLabel}</span>
                    <span className="text-xl font-bold tracking-tight text-[#b4542c]">{pillar.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive FAQs */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] sm:text-5xl">
              Everything you need to know about Teammate Handoff.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 rounded-2xl border border-black/10 bg-[#fbfbfa]">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 transition hover:bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="text-base font-semibold text-[#17181c]">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-[#53616b] transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-[#b4542c]" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm leading-relaxed text-[#53616b]">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
                Bring your entire team into sync
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Ready for effortless team handoffs?
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Keep conversations moving with private whispers, Linear issue links, and conflict-free collaboration.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Schedule team demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
