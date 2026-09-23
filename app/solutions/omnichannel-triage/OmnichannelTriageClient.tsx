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
  Bot,
  MessageSquare,
  Clock,
  Layers,
  ArrowUpRight,
  Terminal,
  Cpu,
  CreditCard,
  Bell,
  Code2,
  Workflow,
  Users,
  Inbox,
  Share2,
  Mail,
  Hash,
  Send,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  SlidersHorizontal,
  Split,
  Laptop,
} from "lucide-react";

export function OmnichannelTriageClient() {
  const [activeChannelTab, setActiveChannelTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "5.4",
      label: "average communication channels monitored across chat, email, Slack, and social tools",
    },
    {
      value: "71%",
      label: "of ticket delays caused by context-switching between disjointed browser tabs and apps",
    },
    {
      value: "91%",
      label: "autonomous tier-1 triage and deflection accuracy with verified documentation citations",
    },
    {
      value: "< 300ms",
      label: "median classification and routing latency across all incoming webhooks and message streams",
    },
  ];

  const pillars = [
    {
      tag: "Universal Convergence",
      title: "Every channel unified into one calm, synchronized stream.",
      description:
        "Modern customers reach out wherever it is convenient for them: website chat, support emails, Slack Connect channels, or mobile messaging. Elpino ingests all inbound streams into a single command center. Teammates collaborate without jumping through 14 different browser tabs.",
      bulletPoints: [
        "Eliminate fragmented queues across Zendesk, Slack, Gmail, and Discord",
        "Universal search across every channel history, order data, and internal docs",
        "Collision detection prevents multiple teammates from answering the same user",
      ],
      image: "/images/contact-support-sloth.png",
      badge: "Unified Ingestion Engine",
      statHighlight: {
        number: "5 into 1",
        text: "channels consolidated into a single workspace",
      },
    },
    {
      tag: "Autonomous Classification",
      title: "Categorized and prioritized in 300ms before you open the tab.",
      description:
        "Manual triage is slow, prone to human error, and burns out operators. Elpino analyzes incoming messages the moment they arrive—detecting sentiment, urgency, customer account value, and issue category. Urgent outages trigger instant alerts; routine setup questions are deflated automatically.",
      bulletPoints: [
        "Detects customer intent: Bug, Billing, How-To, Feature Request, or Security",
        "High-priority VIP accounts bypass routine queues and route directly to leads",
        "Grounded AI drafts responses using your live documentation in real time",
      ],
      image: "/images/help-center-sloth.png",
      badge: "300ms Intent Engine",
      statHighlight: {
        number: "91%",
        text: "triage accuracy without manual tagging",
      },
    },
    {
      tag: "Cross-Channel Continuity",
      title: "Start on web chat. Finish over email without restarting.",
      description:
        "Nothing annoys customers more than having a chat conversation drop because they closed their laptop. When a visitor leaves your website before a complex issue is resolved, Elpino smoothly transitions the thread to their email with the full backstory intact.",
      bulletPoints: [
        "Automatically routes replies to email when a customer disconnects from live chat",
        "Customers reply directly from their email client; conversation syncs back into the ticket",
        "Preserves complete conversation history and debug telemetry across handoffs",
      ],
      image: "/images/busy-teams-sloth.png",
      badge: "Zero-Drop Continuity",
      statHighlight: {
        number: "100%",
        text: "thread context preserved across channel shifts",
      },
    },
  ];

  const channelSimulations = [
    {
      id: "web-chat",
      name: "Website Live Chat",
      icon: MessageSquare,
      badge: "Widget Stream",
      color: "bg-[#18c983]/15 text-[#18c983]",
      user: "Sarah Jenkins · Product Designer",
      query: "Can we connect our workspace to custom webhooks for automated user provisioning?",
      triageTag: "Feature & API How-To · High Confidence",
      triageStatus: "Auto-Resolved in 260ms",
      aiReply:
        "Yes! Elpino provides automated provisioning webhooks under Settings → Integrations → Webhooks. You can listen to user.created and user.invited events directly.",
      source: "Source: docs.elpino.chat/api/webhooks#provisioning",
      nextAction: "Resolved · No Operator Intervention Needed",
    },
    {
      id: "email",
      name: "Support Email (Gmail / Outlook)",
      icon: Mail,
      badge: "Email Pipeline",
      color: "bg-[#428ce5]/15 text-[#428ce5]",
      user: "David Chen · VP Engineering at CloudScale",
      query:
        "Urgent: We need a signed SOC2 Type II report and custom BAA before our enterprise procurement deadline tomorrow.",
      triageTag: "Enterprise Security & Legal · Priority: P0",
      triageStatus: "Routed to Jordan (Security Lead)",
      aiReply:
        "AI prepared executive brief with CloudScale's $36k ARR contract history and notified Jordan in Slack #security-urgent with the standard NDA & SOC2 package attached.",
      source: "Internal Policy · Enterprise Security Playbook",
      nextAction: "Assigned to Jordan · Slack Alert Sent",
    },
    {
      id: "slack",
      name: "Slack Connect & Channels",
      icon: Hash,
      badge: "Slack Connect",
      color: "bg-[#7060bd]/15 text-[#7060bd]",
      user: "Marcus Vance · Stripe Partner Team",
      query: "@elpino Webhook endpoint returning 504 Gateway Timeout on checkout.session.completed payload.",
      triageTag: "Production Incident · Webhook Failure",
      triageStatus: "Auto-Created Linear Issue #LIN-892",
      aiReply:
        "Elpino extracted the error stack trace, confirmed latency spike on US-East endpoint, created Linear issue with payload diagnostics, and posted an acknowledgment thread in Slack.",
      source: "Linear Connector · Incident Dispatcher",
      nextAction: "Linear Issue #LIN-892 Synced · Engineering Notified",
    },
    {
      id: "messaging",
      name: "Telegram & Messaging",
      icon: Send,
      badge: "Direct Messaging",
      color: "bg-[#ff5600]/15 text-[#ff5600]",
      user: "Elena Rostova · Mobile App User",
      query: "How do I upgrade our team plan from mobile without losing our current remaining credits?",
      triageTag: "Billing Upgrade · Stripe Account cus_821",
      triageStatus: "1-Tap Checkout Link Generated",
      aiReply:
        "Your remaining 50 monthly resolutions will roll over automatically! Here is your secure 1-tap checkout link with prorated billing applied: buy.stripe.com/elpino-growth.",
      source: "Stripe Connector · cus_821 Active",
      nextAction: "1-Tap Link Sent · Stripe Event Monitored",
    },
  ];

  const connectors = [
    {
      title: "Live Chat Widget",
      detail: "Lightweight, customizable chat widget embeddable via 1 line of script on any site.",
      icon: MessageSquare,
      badge: "Native",
    },
    {
      title: "Gmail & Google Workspace",
      detail: "Two-way email synchronization with automated classification and tone-matched draft replies.",
      icon: Mail,
      badge: "Direct Sync",
    },
    {
      title: "Microsoft 365 & Outlook",
      detail: "Enterprise email pipeline supporting shared mailboxes, OAuth security, and distribution lists.",
      icon: Inbox,
      badge: "Enterprise",
    },
    {
      title: "Slack & Slack Connect",
      detail: "Manage customer handoffs, VIP alerts, and internal escalations without leaving Slack.",
      icon: Hash,
      badge: "Bi-Directional",
    },
    {
      title: "Telegram Bot & Groups",
      detail: "Instant triage and 1-tap operator approvals right from your mobile Telegram app.",
      icon: Send,
      badge: "Mobile Speed",
    },
    {
      title: "Discord Community Support",
      detail: "Monitor developer support channels, answer syntax questions, and defuse community noise.",
      icon: Laptop,
      badge: "Developer",
    },
    {
      title: "Linear & GitHub Bridge",
      detail: "Convert customer bug reports into actionable engineering tickets with full diagnostic logs.",
      icon: Workflow,
      badge: "DevOps",
    },
    {
      title: "Custom Webhooks & REST API",
      detail: "Stream events to internal databases, custom CRMs, and proprietary backends effortlessly.",
      icon: Terminal,
      badge: "API First",
    },
  ];

  const faqs = [
    {
      q: "How does Elpino prevent multiple operators from replying to the same customer across channels?",
      a: "Elpino features real-time cross-channel collision detection. Whether an inquiry arrives via live chat, an email forward, or a Slack channel, active operator presence indicators and typing locks ensure everyone knows who is handling the thread, completely eliminating duplicate responses.",
    },
    {
      q: "What happens if a customer starts a conversation on web chat and leaves before it is resolved?",
      a: "If a visitor closes their browser tab or navigates away, Elpino's cross-channel continuity engine automatically forwards the complete resolution to their verified email address. When the customer replies to that email, their message flows right back into the same unified thread.",
    },
    {
      q: "Can we set custom triage rules for VIP accounts, specific keywords, or languages?",
      a: "Yes. You have granular control over triage logic. You can route conversations by customer MRR tier, language, keywords (e.g. 'refund', 'security', 'HIPAA', 'outage'), or specific channel sources directly to dedicated teammates or Slack channels.",
    },
    {
      q: "How does Elpino filter out marketing newsletters, automated bouncebacks, and spam emails?",
      a: "Elpino employs an intelligent noise filter that detects out-of-office autoreplies, marketing newsletters, and unsolicited cold emails. These messages are automatically tagged as 'Noise' and archived, keeping your primary queue clean and focused on real customers.",
    },
    {
      q: "How long does it take to connect our existing channels?",
      a: "Most channels take less than 2 minutes to connect. The web chat widget requires pasting one script tag, email setup uses standard forwarding or OAuth, and Slack/Telegram connect with 1-click authorization. No complex engineering or webhook maintenance required.",
    },
  ];

  const activeChannel = channelSimulations[activeChannelTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino / Omnichannel Triage · Unified Communication Pipeline
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                One inbox for every channel.{" "}
                <span className="italic text-[#ff5600]">Already triaged.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Stop jumping between live chat, Gmail, Slack, and Discord. Elpino unifies every
                inbound customer stream, classifies urgency and intent in 300ms, and routes
                conversations with full backstory to the right teammate.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#ff5600] hover:text-white"
                >
                  Start free triage
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                >
                  Explore connected channels
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-black/10 pt-6 text-xs text-black/50 sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> Zero dropped threads
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> Real-time channel sync
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> 50 free resolutions/mo
                </span>
              </div>
            </div>

            {/* Hero Visual Mockup with Sloth Mascot & Multi-Channel Console */}
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* Sloth mascot playfully perched on top */}
              <div className="pointer-events-none absolute -top-24 -right-10 z-20 w-44 sm:w-52 drop-shadow-2xl">
                <Image
                  src="/images/contact-support-sloth.png"
                  alt="Elpino Omnichannel Triage Sloth"
                  width={1234}
                  height={1275}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              {/* Floating Badge Top Left */}
              <div className="absolute -top-4 -left-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#ff5600]/15 text-[#ff5600]">
                  <Split size={15} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Unified Omnichannel Feed</div>
                  <div className="text-[10px] text-black/50">Chat · Email · Slack · Mobile</div>
                </div>
              </div>

              {/* Central Mock Triage Window */}
              <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-400" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-xs font-semibold text-black/60">
                      elpino-triage // live-multi-stream
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ● 4 Channels Synchronized
                  </span>
                </div>

                {/* Queue items showing distinct channel icons */}
                <div className="mt-4 space-y-3">
                  {/* Item 1: Web Chat */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#18c983]/20 text-[11px] text-[#18c983]">
                          <MessageSquare size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">Website Widget</span>
                        <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] text-black/60">
                          Setup FAQ
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700">
                        Auto-Resolved · 260ms
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/75">
                      &quot;How do I invite teammates with read-only billing permissions?&quot;
                    </p>
                  </div>

                  {/* Item 2: Email */}
                  <div className="rounded-xl border border-[#428ce5]/20 bg-[#428ce5]/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#428ce5]/20 text-[11px] text-[#428ce5]">
                          <Mail size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">help@company.com</span>
                        <span className="rounded bg-[#ff5600]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#ff5600]">
                          Urgent P0
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-[#428ce5]">
                        Assigned to Jordan
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/75">
                      &quot;Need signed SOC2 Type II report before tomorrow&apos;s procurement call.&quot;
                    </p>
                  </div>

                  {/* Item 3: Slack Connect */}
                  <div className="rounded-xl border border-[#7060bd]/20 bg-[#7060bd]/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#7060bd]/20 text-[11px] text-[#7060bd]">
                          <Hash size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">#partner-stripe</span>
                        <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] text-black/60">
                          Bug Report
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-[#7060bd]">
                        Linear #892 Created
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/75">
                      &quot;Webhook returning 504 on checkout.session.completed payload.&quot;
                    </p>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/50">
                  <span>0 unclassified threads</span>
                  <span className="font-medium text-[#ff5600]">Average Latency: 290ms</span>
                </div>
              </div>

              {/* Floating Badge Bottom Right */}
              <div className="absolute -bottom-4 -right-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Smart Spam Filtering</div>
                  <div className="text-[10px] text-black/50">Out-of-office &amp; noise silenced</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REALITY CHECK / STATS PLATEAU SECTION */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              The Multi-Channel Reality Check
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              More communication channels shouldn&apos;t mean more chaos.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              When teams add support email, Slack Connect, and live chat, inquiries end up scattered
              across tabs. Customers wait hours for replies and context gets lost in the cracks.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#ff5600]/40 hover:bg-white hover:shadow-lg"
              >
                <div className="text-4xl font-semibold tracking-tight text-[#ff5600] sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-black/70 sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE PILLARS SECTION (Alternating Layout) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
              The Elpino Triage Standard
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#17181c]">
              Built for speed. Structured for clarity.
            </h2>
          </div>

          <div className="mt-20 space-y-24 sm:space-y-32">
            {pillars.map((pillar, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={pillar.title}
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                    isEven ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  <div className={isEven ? "lg:col-start-2" : ""}>
                    <span className="inline-block rounded-full bg-[#ff5600]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                      {pillar.tag}
                    </span>

                    <h3 className="mt-4 text-3xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
                      {pillar.title}
                    </h3>

                    <p className="mt-6 text-base leading-relaxed text-black/70 sm:text-lg">
                      {pillar.description}
                    </p>

                    <div className="mt-8 space-y-3.5">
                      {pillar.bulletPoints.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={13} />
                          </div>
                          <span className="text-sm font-medium text-black/80 sm:text-base">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="text-2xl font-bold text-[#ff5600]">
                        {pillar.statHighlight.number}
                      </div>
                      <div className="text-xs text-black/60 sm:text-sm">
                        {pillar.statHighlight.text}
                      </div>
                    </div>
                  </div>

                  {/* Visual card */}
                  <div className={`relative ${isEven ? "lg:col-start-1" : ""}`}>
                    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
                      <div className="flex items-center justify-between border-b border-black/10 pb-4">
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                          {pillar.badge}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">● Live Preview</span>
                      </div>

                      <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
                        <div className="relative w-48 sm:w-56 drop-shadow-md">
                          <Image
                            src={pillar.image}
                            alt={pillar.title}
                            width={500}
                            height={500}
                            className="h-auto w-full object-contain"
                          />
                        </div>
                        <div className="mt-6 w-full rounded-2xl border border-black/10 bg-[#faf9f6] p-4 text-left">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5600]">
                            <Sparkles size={14} /> Omnichannel Intelligence
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-black/70">
                            Every message is automatically ingested, normalized, and classified
                            regardless of whether it originated from live chat, email, or Slack.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE CHANNEL SIMULATOR */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Interactive Channel Architecture
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              See Omnichannel Triage in action
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/65 sm:text-lg">
              Click through different inbound channels to see how Elpino receives, classifies, and
              dispatches each message in sub-second time.
            </p>
          </div>

          {/* Channel Tabs */}
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {channelSimulations.map((channel, idx) => {
              const Icon = channel.icon;
              const isActive = activeChannelTab === idx;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelTab(idx)}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-[#ff5600] bg-[#ff5600]/5 shadow-md"
                      : "border-black/10 bg-[#faf9f6] hover:border-black/25 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex size-8 items-center justify-center rounded-lg ${channel.color}`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                      Channel 0{idx + 1}
                    </span>
                  </div>
                  <span className="mt-3 font-medium text-base text-black">{channel.name}</span>
                  <span className="mt-1 text-xs text-black/55">{channel.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Active Channel Preview Display */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-[#17181c] p-6 text-white shadow-2xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff5600] text-xs font-bold text-white">
                  0{activeChannelTab + 1}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-white">{activeChannel.name}</h4>
                  <p className="text-xs text-white/50">{activeChannel.user}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {activeChannel.triageStatus}
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/40">
                  <span>Inbound Message Payload</span>
                  <span className="text-[#ff5600] font-mono lowercase">{activeChannel.badge}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                  &quot;{activeChannel.query}&quot;
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#ff5600]">
                  <Workflow size={14} />
                  <span>{activeChannel.triageTag}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Autonomous Triage &amp; Resolution
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-200">
                  {activeChannel.aiReply}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Source: {activeChannel.source}</span>
                  <span className="text-emerald-400 font-medium">Verified Triage Action</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CHANNEL CONNECTOR ECOSYSTEM GRID */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Unified Connectors
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              Every customer channel connected in minutes.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              Elpino provides first-party connectors for your website, email, team collaboration,
              and internal ticketing platforms.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {connectors.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative rounded-2xl border border-black/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[#ff5600]/40 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex size-11 items-center justify-center rounded-xl bg-black/5 text-[#17181c] group-hover:bg-[#ff5600] group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-medium text-black/60">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/65">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIAL SPOTLIGHT */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ff5600]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
            Customer Spotlight
          </div>

          <blockquote className="mt-8 text-2xl font-normal leading-relaxed tracking-tight text-[#17181c] sm:text-3xl lg:text-4xl">
            &quot;We used to miss Slack Connect inquiries while our team was busy checking Gmail,
            and live chat inquiries dropped when buyers closed their laptops. With Elpino
            Omnichannel Triage, every single inbound channel is organized in one calm stream.&quot;
          </blockquote>

          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="font-semibold text-black">Julian Thorne</div>
            <div className="text-sm text-black/50">
              VP of Customer Operations at Veloce Data (950+ Accounts)
            </div>
            <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
              ✓ 74% backlog reduction · Zero dropped customer threads
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Everything you need to know about Omnichannel Triage.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-lg font-medium text-black transition hover:text-[#ff5600]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-black/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#ff5600]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-4 pr-12 text-base leading-relaxed text-black/70 animate-in fade-in duration-200">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CLOSING BANNER */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Unified Customer Pipeline
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Unify your channels. Triage in seconds.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect your live chat, Gmail, and Slack channels in
            under five minutes with zero credit card required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:bg-white hover:text-black"
            >
              Start free triage
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-base font-medium text-white transition hover:bg-white/20"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
