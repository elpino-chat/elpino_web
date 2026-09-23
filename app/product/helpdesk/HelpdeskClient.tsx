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
  TrendingUp,
  BarChart3,
  Search,
  Database,
  FileText,
  Globe,
  RefreshCw,
  Lock,
  FolderOpen,
  SlidersHorizontal,
  Share2,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Laptop,
  Flame,
  Award,
  Filter,
  FileSpreadsheet,
  Split,
  BookOpen,
  FileCode,
  Tag,
  Headphones,
  Mail,
  Hash,
  Send,
  Workflow,
  Command,
  Undo2,
  Bell,
  Smartphone,
  CreditCard,
  PhoneCall,
  Radio,
  ExternalLink,
} from "lucide-react";

export function HelpdeskClient() {
  const [activeSimTab, setActiveSimTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "76%+",
      label: "Autonomous AI resolution rate",
      detail: "resolved end-to-end with zero human agent touch",
    },
    {
      value: "31%",
      label: "Faster handle time with Copilot",
      detail: "instant drafted replies grounded in knowledge docs",
    },
    {
      value: "42s",
      label: "Median first response time",
      detail: "across web live chat, email, and Slack Connect",
    },
    {
      value: "98%",
      label: "Customer CSAT rating",
      detail: "calculated from 15,000+ verified post-chat surveys",
    },
  ];

  const efficiencyPillars = [
    {
      icon: Zap,
      title: "Productivity",
      tag: "Autonomous AI & Copilot",
      description:
        "Equip your team with an autonomous AI agent that resolves routine inquiries instantly, and give every human operator an intelligent Copilot that drafts verified answers in one keystroke.",
      color: "bg-[#ff5600] text-white",
      badge: "Core AI",
    },
    {
      icon: Laptop,
      title: "Usability",
      tag: "Sub-Second Speed",
      description:
        "Modern, friction-free helpdesk software built for pure velocity. Navigate queues with keyboard shortcuts, prevent duplicate replies with live collision locks, and customize split views.",
      color: "bg-[#428ce5] text-white",
      badge: "Keyboard-First",
    },
    {
      icon: Bell,
      title: "Outbound",
      tag: "Proactive Deflection",
      description:
        "Prevent support tickets before they ever get created. Deliver proactive status banners, onboarding checklists, and targeted feature tips directly inside your web application.",
      color: "bg-[#18c983] text-[#233d4d]",
      badge: "Deflection",
    },
  ];

  const modulesList = [
    {
      id: "inbox",
      name: "Shared Team Inbox",
      href: "/product/inbox",
      icon: MessageSquare,
      badge: "Speed & Presence",
      color: "bg-[#ff5600] text-white",
      description:
        "Lightning-fast collaborative workspace featuring live teammate collision detection, private whisper notes, and sub-second queue filtering.",
    },
    {
      id: "copilot",
      name: "AI Copilot",
      href: "/product/copilot",
      icon: Bot,
      badge: "Personal Assistant",
      color: "bg-[#d9bef4] text-[#233d4d]",
      description:
        "Gives every human support agent a personal AI assistant that drafts instant replies, troubleshoots complex bugs, and cites approved docs.",
    },
    {
      id: "tickets",
      name: "Conversational Tickets",
      href: "/product/tickets",
      icon: Workflow,
      badge: "Teamwork",
      color: "bg-[#428ce5] text-white",
      description:
        "Frontline customer tickets, internal back-office escalations, and tracker issues synced bi-directionally with Linear and GitHub.",
    },
    {
      id: "channels",
      name: "Omnichannel Connectors",
      href: "/product/channels",
      icon: Split,
      badge: "Fluidity",
      color: "bg-[#18c983] text-[#233d4d]",
      description:
        "Meet customers where they are: website live chat, support email, Slack Connect, WhatsApp Business, and Telegram in one interface.",
    },
    {
      id: "knowledge-hub",
      name: "Knowledge Hub",
      href: "/product/knowledge-hub",
      icon: Database,
      badge: "Verified Truth",
      color: "bg-black text-white",
      description:
        "Centralized vector repository syncing Notion, Zendesk, Confluence, and PDFs to power verified answers across AI and humans.",
    },
    {
      id: "reporting",
      name: "Reporting & Analytics",
      href: "/product/reporting",
      icon: BarChart3,
      badge: "Live Telemetry",
      color: "bg-[#ff5600] text-white",
      description:
        "Monitor human and AI performance together with 12 pre-built dashboards, 10 chart types, CSAT tracking, and 1-click drill-downs.",
    },
    {
      id: "help-center",
      name: "Public Help Center",
      href: "/product/help-center",
      icon: HelpCircle,
      badge: "Self-Serve",
      color: "bg-[#fcbb00] text-black",
      description:
        "SEO-optimized, multi-brand customer knowledge base with instant semantic search and multilingual translation across 45+ languages.",
    },
    {
      id: "outbound",
      name: "Outbound & Proactive",
      href: "/product/outbound",
      icon: Send,
      badge: "Ticket Deflection",
      color: "bg-[#428ce5] text-white",
      description:
        "Broadcast incident banners, onboarding tours, and targeted app notifications that answer questions before tickets are opened.",
    },
    {
      id: "ai-agent",
      name: "Autonomous AI Agent",
      href: "/product/ai-agent",
      icon: Sparkles,
      badge: "24/7 Deflection",
      color: "bg-[#18c983] text-[#233d4d]",
      description:
        "Autonomously handles routine tier-1 questions with verified citations and gracefully hands off complex inquiries to humans with full context.",
    },
  ];

  const simulatorScenarios = [
    {
      id: "autonomous",
      title: "Autonomous AI Resolution",
      icon: Sparkles,
      badge: "76% Instant Deflection",
      headline: "AI resolves routine customer inquiries end-to-end",
      description:
        "A customer asks a detailed question on your website live chat. Elpino searches approved knowledge docs, verifies the answer, and delivers a complete resolution in 240ms.",
      preview: {
        channel: "Website Live Chat · Customer Online",
        customer: "Sarah Jenkins · Frontend Architect",
        query: "How do I configure custom webhook endpoints with exponential retry backoff in production?",
        aiResponse:
          "Yes! Elpino implements automated exponential backoff with jitter across 5 retry attempts over 24 hours (1m, 5m, 30m, 2h, and 8h). You can also replay failed webhook payloads directly from Settings → Webhooks.",
        source: "docs.elpino.chat/api/webhooks/retries",
        status: "Auto-Resolved in 240ms · 5-Star Customer Rating",
      },
    },
    {
      id: "copilot",
      title: "Copilot-Assisted Human Handoff",
      icon: Bot,
      badge: "1-Click Agent Approvals",
      headline: "Human agents resolve complex issues with zero delay",
      description:
        "When an inquiry involves sensitive contract terms or account-specific changes, Elpino routes the thread to an agent while Copilot pre-drafts the response.",
      preview: {
        channel: "Support Email · Priority Enterprise Queue",
        customer: "Marcus Vance · VP Infrastructure at ApexTech",
        query: "We need our custom BAA countersigned and our SOC 2 Type II audit package for tomorrow's audit.",
        aiResponse:
          "Copilot prepared the standard NDA & SOC 2 Type II compliance package, retrieved ApexTech's $64,000/yr enterprise agreement, and drafted a reply ready for Jordan's 1-click approval.",
        source: "Enterprise Legal Vault · Policy v2.4",
        status: "Assigned to Jordan · Handled in 45 seconds",
      },
    },
    {
      id: "continuity",
      title: "Cross-Channel Continuity",
      icon: Split,
      badge: "Zero Dropped Threads",
      headline: "Seamless transition across chat, email, and Slack",
      description:
        "A customer starts a chat on your website, but closes their laptop. Elpino detects the disconnect and routes the reply straight to their verified email inbox without losing thread history.",
      preview: {
        channel: "Web Chat ➔ Support Email Fallback",
        customer: "Elena Rostova · Mobile Buyer",
        query: "Can you confirm if our remaining monthly resolution credits roll over on the Growth plan?",
        aiResponse:
          "Customer went offline from chat widget. Elpino automatically delivered the answer via email: 'Yes! Your 50 monthly resolutions roll over automatically.' When Elena replies to the email, the thread stays unified.",
        source: "Billing Policies · Cross-Channel Dispatcher",
        status: "Delivered to elena@datapulse.io · Thread Preserved",
      },
    },
    {
      id: "proactive",
      title: "Proactive Outbound Deflection",
      icon: Bell,
      badge: "Pre-Emptive Support",
      headline: "Prevent hundreds of incoming tickets before they happen",
      description:
        "Deploying an infrastructure upgrade? Publish a proactive banner inside the live chat widget and web app to notify affected users in advance.",
      preview: {
        channel: "In-App Announcement Banner & Chat Widget Alert",
        customer: "All Active European Users",
        query: "Scheduled Database Maintenance: EU-West Cluster (Saturday 2 AM - 3 AM UTC)",
        aiResponse:
          "Proactive alert shown to 4,200 active European dashboard users with estimated completion ETA and live status page link. Result: Zero incoming tickets filed regarding cluster latency.",
        source: "Outbound Engine · Geo-Targeted Broadcast",
        status: "280 Support Tickets Prevented",
      },
    },
  ];

  const powerGrid = [
    {
      title: "Real-Time Collision Locks",
      description:
        "Visual presence indicators and typing locks ensure teammates never double-reply to the same customer inquiry.",
      icon: ShieldCheck,
      badge: "Collision Shield",
    },
    {
      title: "Keyboard-First Command Bar (Cmd+K)",
      description:
        "Fly through your queue at the speed of thought. Assign owners, insert macros, snooze, and resolve tickets instantly.",
      icon: Command,
      badge: "⌘K Speed",
    },
    {
      title: "Contractual SLA Countdown Clocks",
      description:
        "Visual countdown timers turn amber and red to guarantee enterprise support agreements are never breached.",
      icon: Clock,
      badge: "SLA Guard",
    },
    {
      title: "5-Second Undo Send Buffer",
      description:
        "Accidentally sent an email with a typo? Elpino holds outgoing messages in a grace period so you can amend drafts.",
      icon: Undo2,
      badge: "Undo Send",
    },
    {
      title: "Internal Whisper Notes",
      description:
        "Collaborate with engineering and finance using private `@mention` notes hidden from customer view.",
      icon: Lock,
      badge: "Private Notes",
    },
    {
      title: "Deep CRM & Stripe Telemetry",
      description:
        "Inspect customer MRR, lifetime spend, renewal dates, and browser console errors right in the conversation sidebar.",
      icon: CreditCard,
      badge: "Context Sidebar",
    },
    {
      title: "Multilingual Auto-Translation",
      description:
        "Support customers in 45+ languages without hiring native speakers. Incoming queries and outgoing replies translate in real time.",
      icon: Globe,
      badge: "45+ Languages",
    },
    {
      title: "Linear & GitHub Issue Bridge",
      description:
        "Turn customer bug reports into engineering sprint issues with 1 click, and auto-notify customers when code is deployed.",
      icon: Workflow,
      badge: "Dev Sync",
    },
  ];

  const faqs = [
    {
      q: "What makes Elpino Helpdesk different from legacy support tools?",
      a: "Legacy tools like Zendesk were built twenty years ago for human-only ticket queues. They bolted AI on top as an afterthought, resulting in clunky workflows and surprise per-seat fees. Elpino was built from the ground up as an AI-native support platform. It seamlessly blends autonomous AI resolution (deflecting up to 76% of routine tickets) with a lightning-fast, keyboard-driven inbox for human agents, priced around successful resolutions rather than penalizing team headcount.",
    },
    {
      q: "How do the autonomous AI Agent and human Inbox work together?",
      a: "Elpino provides a unified continuum of care. The autonomous AI Agent acts as your frontline operator 24/7, answering routine questions with verified citations from your Knowledge Hub. When an inquiry is nuanced, ambiguous, or requires human judgment, Elpino escalates the ticket to your human team in the Inbox with complete thread history, customer telemetry, and a Copilot-drafted response ready for 1-click approval.",
    },
    {
      q: "Can we migrate our existing tickets, articles, and macros from Zendesk or Intercom?",
      a: "Yes. Elpino features 1-click migration connectors for Zendesk, Intercom, and Freshdesk. You can automatically import your Help Center articles, canned response macros, and customer contact histories in under 10 minutes with zero downtime.",
    },
    {
      q: "What channels are supported out of the box?",
      a: "Elpino supports website live chat (with our modern, lightweight widget), support email (Gmail, Microsoft 365, or custom MX domains), Slack Connect shared customer channels, WhatsApp Business, Telegram, and Discord—all unified into a single collaborative inbox.",
    },
    {
      q: "How does resolution-based pricing work compared to per-seat pricing?",
      a: "Traditional helpdesk software charges you for every support seat, which discourages you from giving engineering, product, or finance teammates access to customer conversations. Elpino offers unlimited teammate seats on Growth and Enterprise plans, aligning pricing with value: you only pay when our AI successfully resolves an inquiry without human intervention.",
    },
    {
      q: "Is our customer and company data safe with Elpino's AI?",
      a: "Yes. Elpino is SOC 2 Type II certified. All customer conversations and knowledge base documents are encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain strict zero-retention data agreements with foundational model providers: your proprietary data is never used to train generalized AI models.",
    },
    {
      q: "How fast can our team get up and running?",
      a: "Most teams are up and running in under 15 minutes. Connecting your website live chat takes one lightweight script tag, your support email forwards with a standard rule, and your Knowledge Hub syncs with Notion, Zendesk, or website URLs with 1-click authorization.",
    },
  ];

  const activeSim = simulatorScenarios[activeSimTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Next-Gen Helpdesk Architecture */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino / AI Customer Support Helpdesk
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                The next-gen Helpdesk{" "}
                <span className="italic text-[#ff5600]">designed for efficiency.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                The only all-in-one AI support platform that unifies an autonomous AI Agent, an AI
                Copilot for human agents, an ultra-fast shared inbox, omnichannel connectors,
                tickets, and proactive outbound messaging.
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
                  <Check size={14} className="text-[#18c983]" /> Unlimited teammate seats
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 15-minute setup
                </span>
              </div>
            </div>

            {/* Featured Hero Visual using empathetic Support Mascot Picture */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  {/* Top indicator bar */}
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Unified Helpdesk Console
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Connected Ecosystem
                    </span>
                  </div>

                  {/* Mascot Picture Display */}
                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/contact-support-sloth.png"
                      alt="Empathetic Support Mascot"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  {/* Micro telemetry widgets */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Autonomous AI Deflection
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">76.4%</div>
                      <div className="text-[11px] text-[#18c983] font-medium">11,322 resolved</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        First Response Time
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">42 seconds</div>
                      <div className="text-[11px] text-black/50">Across all channels</div>
                    </div>
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
                <div className="text-xs leading-relaxed text-black/65">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE CORE EFFICIENCY PILLARS ("How Helpdesk drives efficiency") */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              The Efficiency Flywheel
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              How Elpino Helpdesk drives unprecedented efficiency.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Designed from the foundation to eliminate friction for both customers and support
              teams through unified AI, sub-second speed, and proactive outbound communication.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {efficiencyPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative rounded-2xl border border-black/10 bg-[#faf9f6] p-8 transition-all duration-200 hover:-translate-y-1 hover:border-black/25 hover:shadow-xl"
                >
                  <div className={`flex size-12 items-center justify-center rounded-xl ${pillar.color} shadow-sm transition group-hover:scale-105`}>
                    <Icon size={24} />
                  </div>

                  <span className="inline-block mt-6 text-xs font-mono font-semibold uppercase tracking-wider text-[#ff5600]">
                    {pillar.tag}
                  </span>

                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#17181c]">
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

      {/* 4. SECTION 1: AI TOOLS THAT MAXIMIZE PRODUCTIVITY (With Picture) */}
      <section className="border-b border-black/5 bg-[#f4f3ec] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-block rounded-full bg-[#ff5600]/10 border border-[#ff5600]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                AI-Native Operations
              </span>

              <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                AI tools that maximize team productivity.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-black/70 sm:text-lg">
                Transform everyday support operations. Enable autonomous deflection without losing
                empathy, and equip human agents with instant, citation-verified drafts.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#ff5600] text-white">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">An AI assistant for every agent</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Copilot generates answers grounded in your Knowledge Hub ready for 1-click agent approval.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#428ce5] text-white">
                      <Workflow size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Automate repetitive triage tasks</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Intelligent routing rules, automatic queue tagging, and multi-step canned macros.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#18c983] text-white">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Support every customer, in every language</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Real-time bidirectional auto-translation across 45+ languages on the fly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot Picture Display: Busy Teams Sloth */}
            <div className="relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/busy-teams-sloth-v2.png"
                  alt="AI Productivity Sloth"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2: MODERN SOFTWARE THAT'S FAST AND FRICTION-FREE (With Picture) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Mascot Picture: Founders Sloth */}
            <div className="order-2 lg:order-1 relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-[#faf9f6] p-6 shadow-xl flex items-center justify-center">
                <Image
                  src="/images/founders-sloth-v2.png"
                  alt="Modern Fast Helpdesk Software"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                Sub-Second Speed
              </span>
              <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                Modern software that's fast and friction-free.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
                Say goodbye to bloated enterprise ticket portals that take 10 seconds to load.
                Elpino executes commands in sub-280ms so agents stay in their flow state.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ff5600] text-white mt-1">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Instant insight with pre-built reporting</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      12 turnkey reports track AI deflection, first response time, and agent capacity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#428ce5] text-white mt-1">
                    <Workflow size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Ticketing designed for teamwork</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Conversational customer tickets, internal back-office handoffs, and Linear bug sync.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#18c983] text-white mt-1">
                    <Database size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Integrate with your existing tools</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Live sync with Stripe, Salesforce, HubSpot, Linear, Jira, and Slack.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: OUTBOUND MESSAGING THAT REDUCES SUPPORT VOLUME (With Picture) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                Proactive Support
              </span>
              <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                Outbound messaging that reduces support volume.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
                The best customer support is the issue that never had to be reported. Broadcast
                scheduled maintenance notices, onboarding walkthroughs, and proactive tips.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-white p-6 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5600] uppercase mb-1">
                    <Flame size={14} /> Onboard customers faster
                  </div>
                  <h3 className="text-base font-semibold text-black">Interactive product tours &amp; checklists</h3>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Guide new signups through initial configuration before they run into roadblocks.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#428ce5] uppercase mb-1">
                    <AlertCircle size={14} /> Stay ahead of known issues
                  </div>
                  <h3 className="text-base font-semibold text-black">Pre-emptive outage &amp; incident alerts</h3>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Pin notices in your live chat widget to prevent hundreds of duplicate inquiries during downtime.
                  </p>
                </div>
              </div>
            </div>

            {/* Mascot Picture: Agencies Services Sloths */}
            <div className="relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/agencies-services-sloths.png"
                  alt="Proactive Outbound Sloth Crew"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE 9 CORE HELPDESK MODULES (Module Navigator Grid) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-[#ff5600]/10 border border-[#ff5600]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Complete Platform Architecture
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Every tool your support team needs in one platform.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65 sm:text-lg">
              Explore the 9 tightly integrated modules that power Elpino's next-generation helpdesk.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modulesList.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-black/25 hover:shadow-xl hover:bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex size-11 items-center justify-center rounded-xl ${mod.color} shadow-sm transition group-hover:scale-110`}>
                        <Icon size={20} />
                      </div>
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-black/70">
                        {mod.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-black group-hover:text-[#ff5600] transition flex items-center justify-between">
                      <span>{mod.name}</span>
                      <ArrowUpRight size={17} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-black/65">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-black/5 flex items-center text-xs font-semibold text-[#ff5600]">
                    <span>Explore module →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE HELPDESK PLATFORM SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Test Drive
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience the next-gen Helpdesk in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through the live operational scenarios below to see how Elpino handles autonomous
              deflection, Copilot handoffs, channel continuity, and proactive notifications.
            </p>
          </div>

          {/* Simulator Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {simulatorScenarios.map((sim, idx) => {
              const Icon = sim.icon;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setActiveSimTab(idx)}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
                    activeSimTab === idx
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

          {/* Simulator Console Container */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#1c1d24] shadow-2xl">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#131417] px-6 py-4 gap-4">
              <div>
                <div className="text-base font-semibold text-white flex items-center gap-2">
                  <span>{activeSim.headline}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    {activeSim.badge}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">{activeSim.description}</div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSim.preview.status}
              </span>
            </div>

            {/* Simulated Live View */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-white/40 pb-2 border-b border-white/5">
                <span>Channel: {activeSim.preview.channel}</span>
                <span>User: {activeSim.preview.customer}</span>
              </div>

              {/* Customer inbound message */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Customer Inquiry
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "{activeSim.preview.query}"
                </p>
              </div>

              {/* AI Delivered Resolution */}
              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Elpino System Resolution</span>
                  <span className="font-mono text-white/40">{activeSim.preview.source}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSim.preview.aiResponse}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2">
                <span>Audit trail logged with verified policy citations</span>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff5600] px-4 py-1.5 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  Test in Sandbox →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. OVER 60 IMPROVEMENTS (Power Grid) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Built for Modern Support Teams
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Over 60 improvements to the helpdesk you use every day.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              The velocity features you've been wishing your helpdesk had, engineered into every interaction.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {powerGrid.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:border-black/25 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#faf9f6] border border-black/10 text-[#ff5600]">
                      <Icon size={18} />
                    </div>
                    <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-black/70">
                      {tool.badge}
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

      {/* 10. TESTIMONIAL SPOTLIGHT */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#ff5600]/10 text-[#ff5600] mb-8">
            <Sparkles size={24} />
          </div>

          <blockquote className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-snug tracking-[-0.02em] text-[#17181c]">
            “Switching to Elpino Helpdesk slashed our ticket backlog by 80% within our first month.
            The autonomous AI resolves our routine billing and webhook questions instantly, and our
            human agents resolve escalated tickets in under two minutes.”
          </blockquote>

          <div className="mt-8">
            <div className="font-semibold text-base text-black">Julian Vance</div>
            <div className="text-sm text-black/60">VP of Customer Experience, NextGen Cloud Solutions</div>
          </div>
        </div>
      </section>

      {/* 11. FAQS ACCORDION */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Everything you need to know about Elpino Helpdesk.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Clear answers on AI deflection, migration, channels, security, and resolution-based pricing.
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

      {/* 12. HIGH-IMPACT CLOSING BANNER */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Experience the next-gen Helpdesk today
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Support that works at the speed of your product.
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
