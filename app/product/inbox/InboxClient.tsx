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
  Command,
  Flame,
  UserCheck,
  CornerDownLeft,
  AlertCircle,
  Tag,
  AtSign,
  Undo2,
  Maximize2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

export function InboxClient() {
  const [copilotTab, setCopilotTab] = useState<number>(0);
  const [simulatorTab, setSimulatorTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [composerSent, setComposerSent] = useState<boolean>(false);

  const stats = [
    {
      value: "31%",
      label: "Faster ticket resolution",
      detail: "with AI Copilot auto-drafting responses",
    },
    {
      value: "74%",
      label: "Routine tickets deflected",
      detail: "resolved autonomously before human escalation",
    },
    {
      value: "< 280ms",
      label: "Sub-second navigation",
      detail: "sub-second keyboard shortcuts & ticket switching",
    },
    {
      value: "45+",
      label: "Languages translated",
      detail: "seamless multi-lingual communication on the fly",
    },
  ];

  const valuePillars = [
    {
      icon: Bot,
      title: "An AI assistant for every agent",
      description:
        "Copilot generates instant replies grounded in your knowledge base, troubleshoots complex bugs, and summarizes ticket histories so agents focus on high-touch conversations.",
    },
    {
      icon: Zap,
      title: "Fast, modern, and fully configurable",
      description:
        "Engineered for pure speed with keyboard-first shortcuts, custom queue filters, split views, and configurable statuses tailored to your team's exact workflow.",
    },
    {
      icon: Users,
      title: "A central hub for easy collaboration",
      description:
        "Connect support, engineering, and product into one calm workspace with live collision locks, private internal whisper notes, and bi-directional Linear sync.",
    },
  ];

  const copilotFeatures = [
    {
      id: "troubleshoot",
      tag: "Agent Guidance",
      title: "Expert troubleshooting and guided triage",
      subtitle: "Stop digging through outdated wiki pages",
      description:
        "When a customer runs into an edge-case bug, Copilot reviews system documentation and past tickets to guide your agent step-by-step through the diagnosis.",
      points: [
        "Recommends specific API parameters and diagnostic curl commands",
        "Checks production status and ongoing incident alerts in real time",
        "Generates actionable remediation steps ready to share with the customer",
      ],
      previewBadge: "Interactive Copilot Assistant",
      customerMessage:
        "Our billing webhook returned HTTP 429 and dropped the customer.subscription.created payload. What is the retry timeout?",
      aiDraft:
        "Elpino retries failed webhooks using exponential backoff with jitter (5 attempts over 24 hours: 1m, 5m, 30m, 2h, 8h). You can also replay the dropped event immediately from Settings → Webhooks → Failed Payloads.",
      citation: "docs.elpino.chat/webhooks/retry-policy",
      confidence: "98% Confidence · Grounded",
    },
    {
      id: "history",
      tag: "Conversation Intelligence",
      title: "The best answers mined from past resolutions",
      subtitle: "Learn from top-performing support agents",
      description:
        "Copilot indexes past highly-rated conversations. When a recurring inquiry arises, it synthesizes the phrasing that previously earned 5-star CSAT ratings.",
      points: [
        "Only incorporates conversations with 5-star CSAT and confirmed resolutions",
        "Configurable date ranges and teammate filtering guardrails",
        "Adapts tone and brand voice automatically to match company guidelines",
      ],
      previewBadge: "Historical Intelligence Engine",
      customerMessage:
        "Can we invite 25 external auditors with read-only access without paying for 25 full seats?",
      aiDraft:
        "Yes! Elpino includes unlimited Read-Only Auditor seats at no extra charge on Growth and Enterprise tiers. You can invite your auditors under Workspace Settings → Members → Assign Role: Auditor.",
      citation: "Mined from 42 resolved billing threads (CSAT: 100%)",
      confidence: "99% Confidence · Verified",
    },
    {
      id: "sources",
      tag: "Multi-Source Grounding",
      title: "Trusted answers from any knowledge source",
      subtitle: "Zero hallucinations, verifiable citations",
      description:
        "Connect Notion, Google Docs, Confluence, GitHub readmes, and Linear issues. Copilot cross-references sources and provides explicit citations for every sentence.",
      points: [
        "Live sync with Notion, Linear, Confluence, and internal repositories",
        "Every claim links back to the source document and authoring timestamp",
        "Automatic warning when internal documentation hasn't been updated in 90+ days",
      ],
      previewBadge: "Knowledge Grounding Matrix",
      customerMessage:
        "Do you support SOC 2 Type II compliance and HIPAA Business Associate Agreements (BAAs)?",
      aiDraft:
        "Yes. Elpino is SOC 2 Type II certified and we sign standard BAAs on Enterprise annual plans. You can download our latest audit report from our Trust Center or request a counter-signed BAA directly.",
      citation: "elpino.chat/trust-center · Last audited Jan 2026",
      confidence: "100% Policy Grounded",
    },
    {
      id: "oversight",
      tag: "Manager Oversight",
      title: "Deep insights, guardrails, and complete oversight",
      subtitle: "Full visibility into AI adoption and accuracy",
      description:
        "Set strict confidence thresholds before Copilot can draft an answer. Review agent edit rates, source utilization, and audit logs from a centralized dashboard.",
      points: [
        "Set custom confidence thresholds (e.g. require 95%+ to display drafts)",
        "Granular permission controls on which internal teams access sensitive data",
        "Audit trail logs every AI draft suggestion and agent modification",
      ],
      previewBadge: "Oversight & Governance Suite",
      customerMessage:
        "Manager Telemetry: Agent Copilot Adoption Report for Support & Success Teams",
      aiDraft:
        "Weekly Summary: 1,420 AI suggestions generated · 88.4% accepted without edits · Average handle time decreased by 2m 14s per ticket · Zero hallucinations reported.",
      citation: "Analytics → Team Copilot Telemetry (Past 7 Days)",
      confidence: "Audit Grade · Enterprise Ready",
    },
  ];

  const ticketTypes = [
    {
      tag: "Customer Tickets",
      title: "Keep customers informed across email & chat",
      description:
        "Designed for frontline support. Customers receive real-time status updates via live chat or email without needing to remember a portal login.",
      features: [
        "Continuous chat-to-email thread continuity",
        "Public status tracking links with real-time ETA",
        "Automated customer confirmation and satisfaction survey",
      ],
      badge: "Frontline",
      color: "bg-[#ff5600]/10 text-[#ff5600] border-[#ff5600]/20",
    },
    {
      tag: "Back-office Tickets",
      title: "Handoff complex workflows to specialized teams",
      description:
        "Escalate legal, finance, logistics, or security requests to internal teams with private notes, SLA countdowns, and audit logs.",
      features: [
        "Private internal fields hidden from customer view",
        "Role-based ticket routing to finance or security leads",
        "Custom approval gates before releasing high-value actions",
      ],
      badge: "Escalation",
      color: "bg-[#428ce5]/10 text-[#428ce5] border-[#428ce5]/20",
    },
    {
      tag: "Tracker Tickets",
      title: "Link customer tickets to Linear and GitHub issues",
      description:
        "Connect bug reports directly to your engineering sprint backlog. When a developer merges the fix, Elpino notifies affected customers automatically.",
      features: [
        "Bi-directional sync with Linear, Jira, and GitHub",
        "Auto-resolves customer tickets when PR is merged",
        "Impact clustering to identify widespread outages instantly",
      ],
      badge: "Engineering Bridge",
      color: "bg-[#18c983]/10 text-[#18c983] border-[#18c983]/20",
    },
  ];

  const simulatorScenarios = [
    {
      id: "copilot",
      title: "AI Copilot Draft Review",
      icon: Sparkles,
      customer: "Elena Rostova",
      company: "DataPulse AI (Enterprise Tier)",
      badge: "Inbound Live Chat",
      avatar: "ER",
      avatarColor: "bg-[#d9bef4] text-[#233d4d]",
      message:
        "Hi! We want to enforce SAML SSO via Okta for our 180 team members. Does your platform support SCIM group mapping?",
      copilotSuggest: {
        text: "Yes! Elpino supports SAML 2.0 and automated SCIM 2.0 provisioning via Okta, Azure AD, and Google Workspace. You can configure group role mappings under Settings → Authentication → SCIM.",
        source: "docs.elpino.chat/security/saml-scim",
        confidence: "99% Grounded",
      },
      actionText: "Accept & Send (Tab)",
      secondaryAction: "Edit with Copilot (E)",
      sidebarData: {
        arr: "$24,000 / yr",
        plan: "Enterprise Annual",
        sla: "Resolution due in 38m",
        recentTickets: "2 open · 14 resolved",
        assignee: "You (Assigned)",
      },
    },
    {
      id: "collision",
      title: "Real-Time Collision Lock",
      icon: ShieldCheck,
      customer: "David Chen",
      company: "CloudScale Inc.",
      badge: "Priority Support Email",
      avatar: "DC",
      avatarColor: "bg-[#428ce5] text-white",
      message:
        "Urgent: We are migrating our production database at 8 PM EST today. Can you temporarily increase our API rate limits?",
      collisionNotice: {
        agent: "Alex Rivera (Platform Lead)",
        status: "Alex is currently replying to this customer...",
        lockDetail: "Reply composer locked to avoid duplicate messages",
      },
      actionText: "Reply Locked by Teammate",
      secondaryAction: "View Alex's Live Draft",
      sidebarData: {
        arr: "$48,000 / yr",
        plan: "Dedicated Infrastructure",
        sla: "Response due in 12m (P0)",
        recentTickets: "1 open · 32 resolved",
        assignee: "Alex Rivera",
      },
    },
    {
      id: "whisper",
      title: "Internal Teammate Whisper Notes",
      icon: Users,
      customer: "Marcus Vance",
      company: "Stripe Partner Team",
      badge: "Slack Connect Channel",
      avatar: "MV",
      avatarColor: "bg-[#ff5600] text-white",
      message:
        "@elpino Our webhook receiver is experiencing payload drops on order.fulfillment_ready events.",
      whisperNote: {
        author: "Sarah Jenkins (DevOps)",
        text: "@jordan I checked our edge log metrics—Apex cluster had a transient TCP reset 6 mins ago. The patch is deployed and queue is draining now. Safe to inform Marcus.",
        time: "Just now · Only visible to your team",
      },
      actionText: "Reply to Customer via Slack",
      secondaryAction: "Add Private Note (@)",
      sidebarData: {
        arr: "Partner Tier",
        plan: "Slack Connect VIP",
        sla: "Within SLA (< 15m)",
        recentTickets: "0 open · 48 resolved",
        assignee: "Jordan Miller",
      },
    },
    {
      id: "multilingual",
      title: "Multilingual Auto-Translation",
      icon: Globe,
      customer: "Kenji Sato",
      company: "Tokyo FinTech Labs",
      badge: "Web Chat (Japan)",
      avatar: "KS",
      avatarColor: "bg-[#18c983] text-[#233d4d]",
      message:
        "こんにちは。請求書払いで年次契約を締結したいのですが、見積書（Quote）を発行していただけますか？",
      translationNote: {
        detected: "Japanese detected · Auto-translated to English",
        englishText:
          '"Hello. We would like to sign an annual contract via invoice payment. Could you issue a formal price quote?"',
      },
      copilotSuggest: {
        text: "こんにちは佐藤様！はい、年次契約の見積書（Quote）をPDFで即時発行可能です。貴社の請求先詳細をこちらでお伺いできますでしょうか。(Drafted in native Japanese)",
        source: "Billing Guidelines · Enterprise Invoicing",
        confidence: "99% High Accuracy Translation",
      },
      actionText: "Send Japanese Reply",
      secondaryAction: "View English Back-Translation",
      sidebarData: {
        arr: "¥3,600,000 / yr",
        plan: "International Growth",
        sla: "Response due in 45m",
        recentTickets: "1 open · 8 resolved",
        assignee: "Global Triage Team",
      },
    },
  ];

  const powerGrid = [
    {
      title: "Command Palette (Cmd+K)",
      description:
        "Execute any support action in milliseconds. Assign teammates, change priority, insert macros, or snooze conversations without touching your mouse.",
      icon: Command,
      shortcut: "⌘K",
    },
    {
      title: "SLA Countdown Clocks",
      description:
        "Real-time countdown badges turn amber and red as resolution targets approach, guaranteeing you never breach enterprise contract agreements.",
      icon: Clock,
      shortcut: "SLA",
    },
    {
      title: "Channel Fluidity",
      description:
        "Switch seamlessly between live web chat, email, Slack Connect, and WhatsApp in the exact same conversation thread with full continuity.",
      icon: Split,
      shortcut: "C",
    },
    {
      title: "Configurable Split Views",
      description:
        "Create custom team queues by customer tier, language, priority, or channel. Save personal views with one click.",
      icon: SlidersHorizontal,
      shortcut: "V",
    },
    {
      title: "5-Second Undo Send Buffer",
      description:
        "Accidentally hit send too soon? Elpino holds outgoing messages in a configurable 5-second buffer so you can cancel or amend typos.",
      icon: Undo2,
      shortcut: "⌘Z",
    },
    {
      title: "Smart Re-Open Snoozing",
      description:
        "Snooze conversations until tomorrow morning, next week, or until the customer opens an email or triggers an app event.",
      icon: Bell,
      shortcut: "S",
    },
    {
      title: "Rich Media & Replay Links",
      description:
        "Inspect customer console logs, network payloads, user environment telemetry, and session replay timestamps right inside the thread.",
      icon: Laptop,
      shortcut: "D",
    },
    {
      title: "Multi-Step Macro Actions",
      description:
        "Automate repetitive 5-step triage processes into a single macro: tag conversation, assign to tier 2, apply canned reply, and snooze for 24h.",
      icon: Workflow,
      shortcut: "M",
    },
  ];

  const faqs = [
    {
      q: "What is the Elpino Inbox?",
      a: "The Elpino Inbox is a shared, AI-enhanced collaborative helpdesk workspace built for modern customer service and support teams. It brings together all customer communication channels (live chat, email, Slack Connect, WhatsApp) into one unified interface engineered for speed, real-time presence, keyboard navigation, and AI Copilot assistance.",
    },
    {
      q: "How does Copilot help support agents work faster?",
      a: "Copilot acts as a personal AI assistant for every agent. It reads the customer's question, reviews your approved knowledge base, past 5-star resolved conversations, and system documentation, and drafts an accurate, grounded reply in seconds. Agents can review, adjust, or send the draft with a single keystroke (Tab), cutting average handle time by up to 31%.",
    },
    {
      q: "Which channels can agents manage from one shared inbox?",
      a: "Agents can manage website live chat, support email (Gmail, Outlook, custom domains), Slack Connect customer channels, WhatsApp Business, Telegram, and Discord. You can switch between channels seamlessly without losing conversation context or creating duplicate tickets.",
    },
    {
      q: "Can agents support customers in other languages?",
      a: "Yes. Elpino features real-time bidirectional translation across 45+ languages. When an international customer messages your team in Japanese, French, or German, the inbox automatically translates the message into English for your agent and translates the agent's response back into the customer's native language with natural nuances.",
    },
    {
      q: "How does real-time collision detection prevent duplicate replies?",
      a: "When any teammate opens or starts typing in a conversation, Elpino displays a live presence indicator and soft lock ring. Teammates can see who is currently viewing or replying to the ticket in real time, preventing awkward duplicate answers, conflicting resolutions, or redundant work.",
    },
    {
      q: "How do tickets work alongside live chat conversations?",
      a: "Every conversation in Elpino can effortlessly transition into a structured ticket. You can manage frontline customer tickets (which keep customers updated via chat and email), back-office tickets (internal escalations with private whisper notes), and tracker tickets (linked to Linear or GitHub issues with automatic customer notification upon release).",
    },
    {
      q: "Does the Inbox integrate with tools like Stripe, Salesforce, and Linear?",
      a: "Yes. Elpino integrates natively with Stripe (displaying live MRR, subscription tier, and refund history), Linear & GitHub (linking bug issues directly to customer conversations), Salesforce and HubSpot (syncing account owners and deal stages), and Slack (alerting teams to VIP escalations).",
    },
    {
      q: "Can managers track team performance and SLAs from the Inbox?",
      a: "Absolutely. Managers have access to real-time dashboards tracking queue health, first-response time (FRT), mean time to resolution (MTTR), SLA compliance percentages, Copilot draft acceptance rates, and individual agent productivity metrics.",
    },
  ];

  const activeCopilot = copilotFeatures[copilotTab];
  const activeSim = simulatorScenarios[simulatorTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Intercom Inbox Architecture */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino Helpdesk · Shared Team Inbox
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Maximize productivity with an{" "}
                <span className="italic text-[#ff5600]">AI-enhanced Inbox.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Work smarter and collaborate faster with Elpino’s configurable, shared inbox.
                Designed for lightning speed, real-time presence, keyboard-first navigation, and
                instant AI Copilot assistance.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-black"
                >
                  Start free trial
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 text-base font-medium text-black transition hover:bg-black/5"
                >
                  Book interactive demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 14-day free trial
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 5-minute setup
                </span>
              </div>
            </div>

            {/* Mascot & Companion visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/60">
                        Live Inbox Telemetry
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      <span className="size-1.5 rounded-full bg-[#18c983] animate-pulse" />
                      All Systems Operational
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#428ce5]/10 text-[#428ce5]">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-black">Active Conversations</div>
                          <div className="text-[11px] text-black/50">Across chat, email & Slack</div>
                        </div>
                      </div>
                      <span className="text-base font-bold text-black">18 Open</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#ff5600]/10 text-[#ff5600]">
                          <Bot size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-black">Copilot Auto-Draft Rate</div>
                          <div className="text-[11px] text-black/50">1-click agent approvals</div>
                        </div>
                      </div>
                      <span className="text-base font-bold text-[#ff5600]">88.4%</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#18c983]/10 text-[#18c983]">
                          <Clock size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-black">Average First Response</div>
                          <div className="text-[11px] text-black/50">Target SLA: &lt; 2 minutes</div>
                        </div>
                      </div>
                      <span className="text-base font-bold text-[#18c983]">42 seconds</span>
                    </div>
                  </div>

                  {/* Sloth Mascot preview */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative h-44 w-full">
                      <Image
                        src="/images/busy-teams-sloth.png"
                        alt="Elpino Inbox Mascot"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-black/50 mt-1">
                    "Work at high velocity without the chaos."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Realistic Multi-Pane Inbox Console Mockup */}
          <div className="mt-16 sm:mt-20 overflow-hidden rounded-2xl border border-black/15 bg-[#17181c] text-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.45)]">
            {/* Top window chrome */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#1f2026] px-5 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 font-mono text-[11px] text-white/50">
                  app.elpino.chat/inbox/team-priority
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-white/60">
                <span className="rounded bg-white/10 px-2 py-0.5">⌘K Command Bar</span>
                <span className="rounded bg-white/10 px-2 py-0.5">E Resolve</span>
                <span className="rounded bg-white/10 px-2 py-0.5">Tab Accept Draft</span>
              </div>
            </div>

            {/* 3-Pane Layout */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[200px_320px_1fr_260px] min-h-[540px]">
              {/* Pane 1: Left Navigation Rail */}
              <div className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-[#131417] p-3 text-xs">
                <div className="space-y-1">
                  <div className="mb-4 flex items-center gap-2 px-2 py-1.5 font-bold tracking-tight text-white">
                    <div className="size-6 rounded-md bg-[#ff5600] flex items-center justify-center font-bold text-[11px]">
                      E
                    </div>
                    <span>Elpino Workspace</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-white/15 px-3 py-2 text-white font-medium">
                    <span className="flex items-center gap-2">
                      <Inbox size={15} className="text-[#ff5600]" /> Inbox
                    </span>
                    <span className="rounded-full bg-[#ff5600] px-1.5 py-0.2 text-[10px] font-bold">12</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition">
                    <span className="flex items-center gap-2">
                      <UserCheck size={15} /> Assigned to me
                    </span>
                    <span className="text-[10px] text-white/40">4</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition">
                    <span className="flex items-center gap-2">
                      <Flame size={15} className="text-[#ff5600]" /> VIP Priority
                    </span>
                    <span className="text-[10px] text-white/40">2</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white transition">
                    <span className="flex items-center gap-2">
                      <Hash size={15} /> Slack Connect
                    </span>
                    <span className="text-[10px] text-white/40">5</span>
                  </div>

                  <div className="pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 px-3">
                    Channels
                  </div>

                  <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/60 hover:bg-white/5 text-[11px]">
                    <MessageSquare size={13} className="text-[#18c983]" /> Web Chat (Active)
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/60 hover:bg-white/5 text-[11px]">
                    <Mail size={13} className="text-[#428ce5]" /> support@elpino.chat
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 px-2 text-[11px] text-white/70">
                    <div className="size-2 rounded-full bg-[#18c983]" />
                    <span>Jordan Miller (Online)</span>
                  </div>
                </div>
              </div>

              {/* Pane 2: Ticket Queue List */}
              <div className="hidden md:flex flex-col border-r border-white/10 bg-[#18191f]">
                <div className="p-3 border-b border-white/10">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                    <input
                      type="text"
                      readOnly
                      value="Filter by status, tag, user..."
                      className="w-full rounded-lg bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white/60 border border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 divide-y divide-white/5 overflow-y-auto">
                  {/* Selected Active Ticket */}
                  <div className="border-l-2 border-[#ff5600] bg-white/10 p-3.5 transition cursor-pointer">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">Liam Vance</span>
                      <span className="text-white/40">2m ago</span>
                    </div>
                    <div className="text-xs font-medium text-white/90 mt-1 truncate">
                      Production webhook returning 429 errors
                    </div>
                    <div className="text-[11px] text-white/50 mt-1 line-clamp-1">
                      Does Elpino automatically retry with exponential backoff?
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="rounded bg-[#ff5600]/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#ff5600]">
                        VIP Escalation
                      </span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/70">
                        Live Chat
                      </span>
                    </div>
                  </div>

                  {/* Other Queue Tickets */}
                  <div className="p-3.5 opacity-60 hover:opacity-100 transition cursor-pointer">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">Elena Rostova</span>
                      <span className="text-white/40">14m ago</span>
                    </div>
                    <div className="text-xs font-medium text-white/80 mt-1 truncate">
                      SCIM provisioning Okta group sync
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="rounded bg-[#428ce5]/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#428ce5]">
                        Enterprise
                      </span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/70">
                        Email
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 opacity-60 hover:opacity-100 transition cursor-pointer">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">David Chen</span>
                      <span className="text-white/40">38m ago</span>
                    </div>
                    <div className="text-xs font-medium text-white/80 mt-1 truncate">
                      SOC 2 Type II compliance report download
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="rounded bg-[#18c983]/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#18c983]">
                        Resolved by Copilot
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pane 3: Active Conversation Thread & Copilot composer */}
              <div className="flex flex-col bg-[#1c1d24]">
                {/* Thread Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Liam Vance</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                        ApexTech Inc.
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50">
                      Website Live Chat · Ticket #8924 · Assigned to Jordan Miller
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#18c983]/20 border border-[#18c983]/30 px-2.5 py-1 text-[10px] font-semibold text-[#18c983]">
                      SLA: 38m remaining
                    </span>
                  </div>
                </div>

                {/* Collision Warning Banner */}
                <div className="flex items-center gap-2 bg-[#ff5600]/15 border-b border-[#ff5600]/30 px-5 py-2 text-xs text-[#ff5600]">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>
                    <strong>Alex Chen</strong> is currently viewing this conversation · Collision lock enabled
                  </span>
                </div>

                {/* Message Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {/* Customer query */}
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-[#428ce5] flex items-center justify-center font-bold text-xs shrink-0">
                      LV
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-white/10 p-4 text-xs text-white/90 max-w-lg leading-relaxed border border-white/5">
                      <div className="font-semibold text-white mb-1">Liam Vance</div>
                      Hey team, we're seeing HTTP 429 rate limit errors when our webhook consumer acknowledges large batch deliveries in production. Does Elpino support automated retry backoff, or do we need to trigger manual replays?
                    </div>
                  </div>

                  {/* AI Copilot Suggestion Box */}
                  <div className="rounded-xl border border-[#ff5600]/30 bg-[#ff5600]/5 p-4 ml-11">
                    <div className="flex items-center justify-between border-b border-[#ff5600]/20 pb-2 mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5600]">
                        <Sparkles size={14} />
                        Elpino Copilot Suggested Reply
                      </div>
                      <span className="text-[10px] font-mono text-[#ff5600]/80 bg-[#ff5600]/10 px-2 py-0.5 rounded">
                        98% Match · Grounded in Docs
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-white/90">
                      Yes! Elpino implements automated exponential backoff with randomized jitter across 5 retry attempts over a 24-hour window (1m, 5m, 30m, 2h, and 8h). You can also manually replay dropped batches at any time under Settings → Webhooks → Failed Deliveries.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-white/40 flex items-center gap-1 font-mono text-[10px]">
                        <FileText size={11} /> Source: docs.elpino.chat/webhooks/retries
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setComposerSent(true)}
                          className="rounded bg-[#ff5600] px-3 py-1 font-semibold text-white text-[11px] hover:bg-white hover:text-black transition"
                        >
                          {composerSent ? "Draft Accepted ✓" : "Accept & Send [Tab]"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composer footer */}
                <div className="border-t border-white/10 p-3 bg-[#17181c]">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs text-white/50 flex items-center justify-between">
                    <span>{composerSent ? "Draft queued for transmission (Undo in 5s)..." : "Press Tab to insert Copilot draft, or type reply..."}</span>
                    <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
                      <span>⌘Enter to send</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pane 4: Customer Telemetry Sidebar */}
              <div className="hidden lg:flex flex-col border-l border-white/10 bg-[#131417] p-4 text-xs space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Customer Profile
                  </div>
                  <div className="mt-2 font-semibold text-sm text-white">ApexTech Inc.</div>
                  <div className="text-white/50 text-[11px]">San Francisco, CA</div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold">Stripe ARR</div>
                    <div className="text-sm font-bold text-[#18c983] mt-0.5">$58,000 / yr</div>
                    <div className="text-[10px] text-white/50 mt-0.5">Enterprise Tier · Active</div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold">Tech Telemetry</div>
                    <div className="text-white/80 text-[11px] mt-1 space-y-1">
                      <div>SDK: Node.js v20.11</div>
                      <div>Framework: Next.js 16</div>
                      <div>Region: us-east-1</div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold">Current URL</div>
                    <div className="text-[#428ce5] text-[11px] mt-1 truncate">
                      apextech.io/settings/webhooks
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                    Linear Bug Sync
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/70">
                    <span>#LIN-482 (Webhook concurrency)</span>
                    <span className="text-[#18c983]">In Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & PROOF BANNER */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-14 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.value} className="space-y-1 text-center sm:text-left">
                <div className="text-3xl font-medium tracking-tight text-[#ff5600] sm:text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-black">{stat.label}</div>
                <div className="text-xs leading-relaxed text-black/60">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS ("Fast, modern, and built for collaboration") */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              The Next Generation Helpdesk
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Fast, modern, and built for true collaboration.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Legacy support software is bloated, clunky, and slow. Elpino is designed from the
              ground up for sub-second execution, keyboard workflows, and frictionless teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {valuePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative rounded-2xl border border-black/10 bg-[#faf9f6] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-black/25 hover:shadow-xl"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white border border-black/10 text-[#ff5600] shadow-sm transition group-hover:scale-105 group-hover:bg-[#ff5600] group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#17181c]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-black/65">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COPILOT DEEP DIVE ("Increase agent efficiency by 31% with Copilot") */}
      <section className="border-b border-black/5 bg-[#f4f3ec] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-[#ff5600]/10 border border-[#ff5600]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              AI Copilot Engine
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Increase agent efficiency by 31% with Copilot.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65 sm:text-lg">
              Give every support agent a personal AI assistant that drafts instant responses,
              troubleshoots complex bugs, and verifies source citations before sending.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {copilotFeatures.map((f, idx) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCopilotTab(idx)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  copilotTab === idx
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white/80 text-black/70 hover:bg-white hover:text-black border border-black/10"
                }`}
              >
                {f.tag}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content Display */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white p-6 sm:p-10 lg:p-12 shadow-xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
                  {activeCopilot.tag}
                </span>
                <h3 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight text-[#17181c]">
                  {activeCopilot.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-black/50">
                  {activeCopilot.subtitle}
                </p>
                <p className="mt-4 text-base leading-relaxed text-black/70">
                  {activeCopilot.description}
                </p>

                <div className="mt-6 space-y-3">
                  {activeCopilot.points.map((pt) => (
                    <div key={pt} className="flex items-start gap-2.5 text-sm text-black/80">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#18c983]" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Preview Simulator Card */}
              <div className="rounded-2xl border border-black/10 bg-[#17181c] text-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#ff5600]">
                    <Sparkles size={14} />
                    {activeCopilot.previewBadge}
                  </span>
                  <span className="rounded-full bg-[#18c983]/20 px-2.5 py-0.5 text-[10px] font-mono text-[#18c983]">
                    {activeCopilot.confidence}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white/10 p-3.5 text-xs text-white/90 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold mb-1">
                      Customer Inquiry
                    </div>
                    {activeCopilot.customerMessage}
                  </div>

                  <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-4 text-xs text-white/90">
                    <div className="flex items-center justify-between text-[10px] text-[#ff5600] font-semibold mb-1">
                      <span>Elpino Copilot Draft</span>
                      <span>Verified Citation</span>
                    </div>
                    <p className="leading-relaxed">{activeCopilot.aiDraft}</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-white/40 font-mono">
                      <FileText size={11} /> {activeCopilot.citation}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/60">
                  <span>1-click agent approval ready</span>
                  <button
                    type="button"
                    className="rounded bg-[#ff5600] px-4 py-1.5 font-semibold text-white text-xs hover:bg-white hover:text-black transition"
                  >
                    Insert Draft (Tab)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODERN DESIGN & SPEED TOOLS (Bento Grid) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Sub-Second Execution
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Designed for speed. Engineered for zero friction.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Every detail is tuned for velocity. Support agents switch tickets, insert macros, and
              resolve customer inquiries without reaching for their mouse.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Bento Card 1: Keyboard-First */}
            <div className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition">
              <div className="flex size-11 items-center justify-center rounded-xl bg-black text-white">
                <Command size={20} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-black">Keyboard-first control</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">
                Fly through your ticket queue using intuitive vim-inspired hotkeys. Press `E` to
                archive, `R` to reply, `S` to snooze, and `⌘K` for instant command lookup.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                <span className="rounded bg-black/10 px-2 py-1 font-semibold text-black">⌘K Search</span>
                <span className="rounded bg-black/10 px-2 py-1 font-semibold text-black">E Resolve</span>
                <span className="rounded bg-black/10 px-2 py-1 font-semibold text-black">R Reply</span>
                <span className="rounded bg-black/10 px-2 py-1 font-semibold text-black">S Snooze</span>
              </div>
            </div>

            {/* Bento Card 2: Real-Time Collision Prevention */}
            <div className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#ff5600] text-white">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-black">Live collision prevention</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">
                Never double-reply to a customer again. Visual presence rings and typing indicators
                warn teammates immediately when someone else opens or edits a conversation.
              </p>
              <div className="mt-6 rounded-xl border border-[#ff5600]/20 bg-[#ff5600]/5 p-3 text-xs text-[#ff5600]">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="size-2 rounded-full bg-[#ff5600] animate-ping" />
                  Alex is typing a response...
                </div>
              </div>
            </div>

            {/* Bento Card 3: Deep Telemetry Sidebar */}
            <div className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition md:col-span-2 lg:col-span-1">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#428ce5] text-white">
                <CreditCard size={20} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-black">Deep customer context</h3>
              <p className="mt-2 text-sm leading-relaxed text-black/65">
                Inspect Stripe MRR, subscription tier, current page URL, browser console errors, and
                Linear engineering issues without switching browser tabs.
              </p>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-white border border-black/10 p-3 text-xs">
                <span className="font-semibold text-black">Stripe MRR: $4,200</span>
                <span className="rounded bg-[#18c983]/15 px-2 py-0.5 font-bold text-[#18c983]">
                  Paid · Enterprise
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TICKETS THAT CONTINUE THE CONVERSATION */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Unified Ticket Architecture
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Tickets that continue the conversation.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Say goodbye to cold, robotic ticket numbers. In Elpino, tickets live naturally within
              the conversation thread so customers feel cared for and teams stay in sync.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {ticketTypes.map((t) => (
              <div
                key={t.tag}
                className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-8 shadow-sm transition hover:shadow-lg"
              >
                <div>
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${t.color}`}
                  >
                    {t.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">
                    {t.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">
                    {t.description}
                  </p>
                  <div className="mt-6 space-y-2.5">
                    {t.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-black/80">
                        <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE INBOX SIMULATOR ("Experience the Inbox in Action") */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Test Drive
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience the Inbox in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through real-world support scenarios below to see how Elpino handles AI
              drafts, collision locks, internal whisper notes, and multilingual inquiries.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {simulatorScenarios.map((sim, idx) => {
              const Icon = sim.icon;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setSimulatorTab(idx)}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
                    simulatorTab === idx
                      ? "bg-[#ff5600] text-white shadow-xl scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {sim.title}
                </button>
              );
            })}
          </div>

          {/* Simulator Console */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#1c1d24] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#131417] px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-full font-bold text-sm ${activeSim.avatarColor}`}
                >
                  {activeSim.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {activeSim.customer}
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70 font-normal">
                      {activeSim.badge}
                    </span>
                  </div>
                  <div className="text-xs text-white/50">{activeSim.company}</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                  {activeSim.sidebarData.sla}
                </span>
                <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 font-semibold">
                  {activeSim.sidebarData.arr}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px]">
              {/* Message pane */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Customer inbound query */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-sm text-white/90">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                    Inbound Customer Query
                  </div>
                  <p className="leading-relaxed">{activeSim.message}</p>
                </div>

                {/* Multilingual detected banner if present */}
                {activeSim.translationNote && (
                  <div className="flex items-center gap-2 rounded-xl bg-[#428ce5]/10 border border-[#428ce5]/30 p-3.5 text-xs text-[#428ce5]">
                    <Globe size={16} className="shrink-0" />
                    <div>
                      <strong>{activeSim.translationNote.detected}</strong>
                      <p className="text-white/80 mt-0.5 italic">
                        {activeSim.translationNote.englishText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Collision Lock banner if present */}
                {activeSim.collisionNotice && (
                  <div className="rounded-xl bg-[#ff5600]/15 border border-[#ff5600]/30 p-4 text-xs text-[#ff5600] space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <ShieldCheck size={16} />
                      {activeSim.collisionNotice.status}
                    </div>
                    <p className="text-white/70">{activeSim.collisionNotice.lockDetail}</p>
                  </div>
                )}

                {/* Internal Whisper Note if present */}
                {activeSim.whisperNote && (
                  <div className="rounded-xl bg-[#fcbb00]/10 border border-[#fcbb00]/30 p-4 text-xs text-[#fcbb00] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Lock size={13} /> Internal Teammate Whisper Note
                      </span>
                      <span className="text-[10px] text-white/40">{activeSim.whisperNote.time}</span>
                    </div>
                    <p className="text-white/90 leading-relaxed">{activeSim.whisperNote.text}</p>
                  </div>
                )}

                {/* AI Copilot Suggestion if present */}
                {activeSim.copilotSuggest && (
                  <div className="rounded-2xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 text-sm text-white/90 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#ff5600]/20 pb-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-[#ff5600]">
                        <Sparkles size={14} /> Elpino Copilot Draft
                      </span>
                      <span className="text-[10px] font-mono text-[#ff5600] bg-[#ff5600]/10 px-2 py-0.5 rounded">
                        {activeSim.copilotSuggest.confidence}
                      </span>
                    </div>
                    <p className="leading-relaxed">{activeSim.copilotSuggest.text}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
                      <span className="flex items-center gap-1 text-[11px] font-mono">
                        <FileText size={12} /> {activeSim.copilotSuggest.source}
                      </span>
                    </div>
                  </div>
                )}

                {/* Interactive action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    className="rounded-full bg-[#ff5600] px-6 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-white hover:text-black transition"
                  >
                    {activeSim.actionText}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    {activeSim.secondaryAction}
                  </button>
                </div>
              </div>

              {/* Sidebar data */}
              <div className="border-t lg:border-t-0 lg:border-l border-white/10 bg-[#131417] p-6 text-xs space-y-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Contextual Telemetry
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Annual Contract Value</div>
                    <div className="text-base font-bold text-[#18c983] mt-1">
                      {activeSim.sidebarData.arr}
                    </div>
                    <div className="text-white/60 text-[11px] mt-0.5">{activeSim.sidebarData.plan}</div>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">SLA Target</div>
                    <div className="text-white/90 font-medium text-xs mt-1">
                      {activeSim.sidebarData.sla}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Ticket History</div>
                    <div className="text-white/90 text-xs mt-1">
                      {activeSim.sidebarData.recentTickets}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase">Assigned Teammate</div>
                    <div className="text-white/90 text-xs mt-1 font-semibold flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-[#18c983]" />
                      {activeSim.sidebarData.assignee}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. OVER 60 IMPROVEMENTS (Grid Showcase) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Built for Support Professionals
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Over 60 improvements to the helpdesk you use every day.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              From power-user hotkeys to granular multi-brand queues, Elpino eliminates every
              point of friction that slows your team down.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {powerGrid.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="rounded-2xl border border-black/10 bg-[#faf9f6] p-6 shadow-sm hover:border-black/25 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-black/10 text-[#ff5600]">
                      <Icon size={18} />
                    </div>
                    <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-black/70">
                      {tool.shortcut}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-black">{tool.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-black/65">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIAL SPOTLIGHT */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#ff5600]/10 text-[#ff5600] mb-8">
            <Sparkles size={24} />
          </div>

          <blockquote className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-snug tracking-[-0.02em] text-[#17181c]">
            “Switching our 40-person support team to Elpino Inbox eliminated duplicate customer
            replies overnight. Copilot drafts 70% of our daily tickets, and our median first-reply
            time dropped from 22 minutes to under 45 seconds.”
          </blockquote>

          <div className="mt-8">
            <div className="font-semibold text-base text-black">Claire Sinclair</div>
            <div className="text-sm text-black/60">VP of Customer Experience, HyperScale SaaS</div>
          </div>
        </div>
      </section>

      {/* 10. FAQS ACCORDION (Matching Intercom's 8 inbox questions) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              The Inbox for more efficient agents and better service.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Everything you need to know about the Elpino Inbox, AI Copilot, and omnichannel triage.
            </p>
          </div>

          <div className="mt-14 divide-y divide-black/10 border-y border-black/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-lg font-semibold text-[#17181c] transition hover:text-[#ff5600]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 transition-transform duration-200 ${
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

      {/* 11. HIGH-IMPACT CLOSING BANNER */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Start Delivering Faster Support Today
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            The inbox built for speed, collaboration, and AI.
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
