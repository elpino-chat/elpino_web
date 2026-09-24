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
  Globe,
  SlidersHorizontal,
  Split,
  Laptop,
  CheckCircle2,
  PhoneCall,
  Smartphone,
  Eye,
  FileText,
  Lock,
} from "lucide-react";

export function ChannelsClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const overviewBenefits = [
    {
      icon: Eye,
      title: "Get complete oversight",
      description:
        "Manage all your customer channels in a single unified workspace for total visibility into every touchpoint, response SLA, and conversation thread.",
    },
    {
      icon: CheckCircle2,
      title: "Consistent, high-quality service",
      description:
        "Maintain a consistent, personalized, and grounded customer experience with unified AI knowledge whether someone emails, chats, or DMs your team.",
    },
    {
      icon: Smartphone,
      title: "Modernize your support",
      description:
        "Meet your customers on the channels that suit them best—from web live chat and email to Slack Connect, WhatsApp, Telegram, and Discord.",
    },
  ];

  const channelDeepDives = [
    {
      id: "live-chat",
      tag: "Live Chat",
      title: "Live chat with a best-in-class Messenger",
      description:
        "Deliver live chat support that is personalized, contextual, and on-brand across your web application and marketing website.",
      bullets: [
        {
          title: "Fully customizable",
          detail: "Tailor colors, fonts, launcher styles, and custom avatars to reflect your unique brand identity.",
        },
        {
          title: "Self-serve enabled",
          detail: "AI searches your approved documentation and resolves customer questions before creating a ticket.",
        },
        {
          title: "Multi-brand & multilingual",
          detail: "Deploy across multiple domains with automatic real-time translation across 30+ languages.",
        },
      ],
      image: "/images/contact-support-sloth.png",
      badge: "In-App & Web Messenger",
      preview: {
        channel: "Live Chat Widget",
        customer: "Sarah Jenkins · Online",
        message: "Can we configure custom webhook events when an invoice payment succeeds?",
        resolution: "Yes! Navigate to Settings → Integrations → Webhooks and enable the invoice.payment_succeeded event listener.",
        source: "docs.elpino.chat/api/webhooks",
        latency: "280ms",
      },
    },
    {
      id: "email",
      tag: "Email Pipeline",
      title: "On-brand email support from your inbox to theirs",
      description:
        "Forward your existing support email (help@, support@, sales@), configure custom signatures, and manage every customer thread in one connected inbox.",
      bullets: [
        {
          title: "Ensure every email is on-brand",
          detail: "Support multiple custom domains, assign company logos, and preserve SPF/DKIM email deliverability.",
        },
        {
          title: "Continue the conversation",
          detail: "Move conversations from live chat to email when visitors disconnect, without losing a single message.",
        },
        {
          title: "AI Copilot draft replies",
          detail: "Operators review AI-generated responses grounded in customer account context with 1-click approval.",
        },
      ],
      image: "/images/help-center-sloth.png",
      badge: "Two-Way Email Support",
      preview: {
        channel: "support@company.com",
        customer: "David Chen · VP Engineering",
        message: "Urgent: We need a signed SOC2 Type II report and BAA before tomorrow's audit.",
        resolution: "SOC2 Type II report and standard BAA agreement attached. Flagged to Jordan (Security Lead) in Slack #security-urgent.",
        source: "Internal Knowledge · Enterprise Security Playbook",
        latency: "Prepared in 400ms",
      },
    },
    {
      id: "slack",
      tag: "Slack Connect & Internal",
      title: "Collaborate where your team already works",
      description:
        "Bridge the gap between customer support, engineering, and sales. Manage Slack Connect customer channels and internal escalations without switching apps.",
      bullets: [
        {
          title: "Native Slack Connect sync",
          detail: "Inbound messages in shared Slack customer channels flow directly into your Elpino inbox.",
        },
        {
          title: "1-Click teammate escalation",
          detail: "Ping engineers or account executives with a 3-bullet AI brief and live customer plan tier.",
        },
        {
          title: "Issue tracker synchronization",
          detail: "Convert customer bug reports into actionable Linear or GitHub tickets with diagnostic logs attached.",
        },
      ],
      image: "/images/busy-teams-sloth.png",
      badge: "Bi-Directional Slack Bridge",
      preview: {
        channel: "#partner-stripe-connect",
        customer: "Marcus Vance · Stripe Partner Team",
        message: "@elpino Webhook endpoint returning 504 on checkout.session.completed payload.",
        resolution: "Linear Issue #LIN-892 created with stack trace and US-East latency diagnostics. On-call paged.",
        source: "Linear Connector · Incident Dispatcher",
        latency: "Paging triggered in 180ms",
      },
    },
    {
      id: "messaging",
      tag: "Mobile Messaging",
      title: "Global support is just a message away",
      description:
        "Meet customers on the world's most accessible mobile messaging apps. Manage Telegram, WhatsApp, and Discord from the same unified inbox.",
      bullets: [
        {
          title: "Unified mobile inbox",
          detail: "Receive, triage, and reply to WhatsApp business and Telegram bot messages in real time.",
        },
        {
          title: "Rich media & diagnostics",
          detail: "Exchange screenshots, error videos, PDFs, and voice notes without platform restrictions.",
        },
        {
          title: "1-Tap interactive actions",
          detail: "Send secure payment links, appointment bookings, and delivery updates directly in chat.",
        },
      ],
      image: "/images/founders-sloth.png",
      badge: "WhatsApp · Telegram · Discord",
      preview: {
        channel: "WhatsApp & Telegram API",
        customer: "Elena Rostova · Mobile Buyer",
        message: "How do I upgrade our team plan from mobile without losing our current remaining credits?",
        resolution: "Your 50 monthly credits roll over automatically! Here is your secure 1-tap Stripe upgrade link: buy.stripe.com/elpino-growth.",
        source: "Stripe Connector · cus_821 Active",
        latency: "Link delivered in 310ms",
      },
    },
  ];

  const channelSimulations = [
    {
      id: "web",
      name: "Website Live Chat",
      icon: MessageSquare,
      badge: "Widget Ingestion",
      color: "bg-[#18c983]/15 text-[#18c983]",
      user: "Sarah Jenkins · Product Designer",
      query: "Can we connect our workspace to custom webhooks for automated user provisioning?",
      triageTag: "Feature & API How-To · High Confidence (98%)",
      triageStatus: "Auto-Resolved in 260ms",
      aiReply:
        "Yes! Elpino provides automated provisioning webhooks under Settings → Integrations → Webhooks. You can listen to user.created and user.invited events directly.",
      source: "Source: docs.elpino.chat/api/webhooks#provisioning",
      statusDetail: "Resolved · No Human Escalation Required",
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
      source: "Internal Knowledge · Enterprise Security Playbook",
      statusDetail: "Assigned to Jordan · Slack Alert Sent",
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
      statusDetail: "Linear Issue #LIN-892 Synced · Engineering Notified",
    },
    {
      id: "messaging",
      name: "WhatsApp & Telegram",
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
      statusDetail: "1-Tap Link Sent · Stripe Event Monitored",
    },
  ];

  const featuresGrid = [
    {
      title: "Real-time collision detection",
      description: "Live typing locks and presence indicators ensure no two teammates reply to the same customer across channels.",
      icon: ShieldCheck,
    },
    {
      title: "Cross-channel continuity",
      description: "Seamlessly transition live chat visitors to email when they close their browser without dropping conversation history.",
      icon: Split,
    },
    {
      title: "Smart noise & spam filtering",
      description: "Automatic filtering of out-of-office autoreplies, marketing spam, and delivery failure notices.",
      icon: SlidersHorizontal,
    },
    {
      title: "Native multi-language translation",
      description: "Automatically translate inbound inquiries and outbound drafts across 30+ languages in real time.",
      icon: Globe,
    },
    {
      title: "Live customer data enrichment",
      description: "View Stripe subscription tier, lifetime spend, renewal dates, and browser telemetry alongside every message.",
      icon: CreditCard,
    },
    {
      title: "Linear & GitHub issue bridge",
      description: "One-click conversion of customer conversations into engineering bug tickets with full stack traces.",
      icon: Workflow,
    },
    {
      title: "Custom priority routing rules",
      description: "Route high-value enterprise accounts, billing disputes, or security topics to dedicated specialists.",
      icon: Bell,
    },
    {
      title: "Unified audit trail & metrics",
      description: "Track first-response times, resolution rates, and customer satisfaction ratings across all channels in one dashboard.",
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      q: "How does Elpino handle customers switching between live chat and email?",
      a: "Elpino features native cross-channel continuity. If a customer starts a conversation in your website live chat and closes their browser tab, Elpino automatically routes the reply to their verified email address. When the customer responds to that email, the message syncs straight back into the existing thread.",
    },
    {
      q: "Can we connect multiple email domains and brand inboxes?",
      a: "Yes. You can connect multiple email domains (e.g. support@acme.com, billing@acme.com, help@subsidiary.com), configure custom signatures, assign unique logos, and maintain DKIM/SPF deliverability standards for each brand.",
    },
    {
      q: "How does Slack Connect integration work with Elpino?",
      a: "Elpino connects with your Slack workspace so that messages in shared Slack customer channels flow directly into your unified support inbox. Teammates can reply directly from Slack or from the Elpino dashboard without creating disjointed threads.",
    },
    {
      q: "Does Elpino's AI agent answer customer questions across all channels?",
      a: "Yes. Elpino's autonomous AI agent is channel-agnostic. Whether a customer asks a question on your website live chat, forwards an email, or messages your Telegram bot, the AI searches your approved documentation and provides grounded, verified answers with source citations.",
    },
    {
      q: "How long does it take to connect our existing support channels?",
      a: "Connecting channels takes under five minutes. The web chat widget requires pasting one lightweight script tag, email connects via standard inbox forwarding or OAuth, and Slack and Telegram connect with one-click authorization.",
    },
  ];

  const activeSimulation = channelSimulations[activeTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Intercom Omnichannel style */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino / Omnichannel Support &amp; Connectors
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Meet your customers{" "}
                <span className="italic text-[#ff5600]">wherever they are.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Manage all your support channels and customer conversations—from live chat and
                email to Slack Connect, WhatsApp, Telegram, and Discord—in one connected
                omnichannel platform.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#ff5600] hover:text-white"
                >
                  Start free trial
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                >
                  View live demo
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-black/10 pt-6 text-xs text-black/50 sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> Free 14-day trial
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> 5-minute setup
                </span>
              </div>
            </div>

            {/* Hero Visual Mockup with Sloth Mascot & Multi-Channel Feed */}
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* Sloth mascot playfully perched on top */}
              <div className="pointer-events-none absolute -top-24 -right-10 z-20 w-44 sm:w-52 drop-shadow-2xl">
                <Image
                  src="/images/contact-support-sloth.png"
                  alt="Elpino Omnichannel Support Sloth"
                  width={1234}
                  height={1275}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              {/* Floating Badge Top Left */}
              <div className="absolute -top-4 -left-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#ff5600]/15 text-[#ff5600]">
                  <Layers size={15} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">All Channels Unified</div>
                  <div className="text-[10px] text-black/50">Chat · Email · Slack · Mobile</div>
                </div>
              </div>

              {/* Central Mock Ingestion Window */}
              <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-400" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-xs font-semibold text-black/60">
                      elpino-omnichannel // connected-streams
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ● 5 Channels Live
                  </span>
                </div>

                {/* Multi-channel items */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#18c983]/20 text-[11px] text-[#18c983]">
                          <MessageSquare size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">Website Messenger</span>
                        <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] text-black/60">
                          Live Chat
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700">
                        Resolved in 260ms
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/75">
                      &quot;Can we configure custom webhook events when an invoice payment succeeds?&quot;
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#428ce5]/20 bg-[#428ce5]/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#428ce5]/20 text-[11px] text-[#428ce5]">
                          <Mail size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">support@company.com</span>
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

                  <div className="rounded-xl border border-[#7060bd]/20 bg-[#7060bd]/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-lg bg-[#7060bd]/20 text-[11px] text-[#7060bd]">
                          <Hash size={13} />
                        </span>
                        <span className="text-xs font-semibold text-black">#partner-stripe-connect</span>
                        <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] text-black/60">
                          Slack Connect
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-[#7060bd]">
                        Linear #892 Synced
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/75">
                      &quot;Webhook returning 504 on checkout.session.completed payload.&quot;
                    </p>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/50">
                  <span>Zero dropped customer threads</span>
                  <span className="font-medium text-[#ff5600]">Unified Inbox Active</span>
                </div>
              </div>

              {/* Floating Badge Bottom Right */}
              <div className="absolute -bottom-4 -right-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <Check size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Cross-Channel Continuity</div>
                  <div className="text-[10px] text-black/50">Chat moves to email automatically</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW BENEFITS: Centralize all channels in one connected platform (Intercom style) */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              The Connected Platform
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Centralize all your channels in one connected platform.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              Deliver fast, contextual, and grounded support whether your customers prefer live
              chat, email, Slack Connect, WhatsApp, or Telegram.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {overviewBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 transition duration-200 hover:-translate-y-1 hover:border-[#ff5600]/40 hover:bg-white hover:shadow-lg"
                >
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-black/5 text-[#ff5600]">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-black">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DEEP DIVE CHANNEL SECTIONS (matching Intercom's deep dives) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
              Channel Capabilities
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#17181c]">
              Built for speed. Unified across every touchpoint.
            </h2>
          </div>

          <div className="mt-20 space-y-24 sm:space-y-32">
            {channelDeepDives.map((deepDive, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={deepDive.id}
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                    isEven ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  <div className={isEven ? "lg:col-start-2" : ""}>
                    <span className="inline-block rounded-full bg-[#ff5600]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                      {deepDive.tag}
                    </span>

                    <h3 className="mt-4 text-3xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
                      {deepDive.title}
                    </h3>

                    <p className="mt-6 text-base leading-relaxed text-black/70 sm:text-lg">
                      {deepDive.description}
                    </p>

                    <div className="mt-8 space-y-5">
                      {deepDive.bullets.map((bullet) => (
                        <div key={bullet.title} className="flex items-start gap-3">
                          <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={13} />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-black">
                              {bullet.title}
                            </div>
                            <div className="mt-1 text-sm text-black/65">{bullet.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channel Visual Preview Card */}
                  <div className={`relative ${isEven ? "lg:col-start-1" : ""}`}>
                    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-xl">
                      <div className="flex items-center justify-between border-b border-black/10 pb-4">
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                          {deepDive.badge}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">● Live Preview</span>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                            {deepDive.preview.channel}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-black">
                            {deepDive.preview.customer}
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-black/75">
                            &quot;{deepDive.preview.message}&quot;
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-800">
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-[#ff5600]" /> Elpino Unified Reply
                            </span>
                            <span className="text-emerald-700">{deepDive.preview.latency}</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-emerald-950">
                            {deepDive.preview.resolution}
                          </p>
                          <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-emerald-800">
                            <Workflow size={11} /> {deepDive.preview.source}
                          </div>
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
              Interactive Architecture
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              See how every channel works together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/65 sm:text-lg">
              Click through different incoming channels to preview how Elpino normalizes, classifies,
              and resolves conversations in real time.
            </p>
          </div>

          {/* Channel Tabs */}
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {channelSimulations.map((channel, idx) => {
              const Icon = channel.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveTab(idx)}
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
                  0{activeTab + 1}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-white">{activeSimulation.name}</h4>
                  <p className="text-xs text-white/50">{activeSimulation.user}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {activeSimulation.triageStatus}
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/40">
                  <span>Inbound Customer Message</span>
                  <span className="text-[#ff5600] font-mono lowercase">
                    {activeSimulation.badge}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                  &quot;{activeSimulation.query}&quot;
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#ff5600]">
                  <Workflow size={14} />
                  <span>{activeSimulation.triageTag}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Unified Elpino Resolution
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-200">
                  {activeSimulation.aiReply}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{activeSimulation.source}</span>
                  <span className="text-emerald-400 font-medium">Verified Grounded Reply</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EFFORTLESS OMNICHANNEL IMPROVEMENTS GRID (Intercom 60 improvements style) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Effortless Omnichannel
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              Built-in features your team will notice every day.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              From collision defense to real-time translation, Elpino eliminates the operational
              friction of running support across multiple communication tools.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuresGrid.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-black/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[#ff5600]/40 hover:shadow-xl"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-black/5 text-[#ff5600]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-black">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/65">
                    {feature.description}
                  </p>
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
            &quot;We used to manage Zendesk for emails, Intercom for website chat, and shared Slack
            channels for enterprise buyers. Consolidating all of them into Elpino cut our response
            time by 68% and completely eliminated dropped customer threads.&quot;
          </blockquote>

          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="font-semibold text-black">Julian Thorne</div>
            <div className="text-sm text-black/50">
              VP of Customer Experience at Veloce Data (950+ Accounts)
            </div>
            <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
              ✓ 68% response time improvement · Zero dropped threads
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
              Everything you need to know about Elpino channels.
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

      {/* 8. CLOSING BANNER (matching Intercom's closing CTA) */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Start Delivering Omnichannel Support Today
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Unify your channels. Elevate every conversation.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect live chat, support email, and Slack in
            minutes with zero credit card required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:bg-white hover:text-black"
            >
              Start free trial
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
