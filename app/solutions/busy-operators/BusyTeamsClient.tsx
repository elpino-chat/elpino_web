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
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Search,
} from "lucide-react";

export function BusyTeamsClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "76%",
      label: "of incoming support tickets are repetitive questions already answered in existing docs",
    },
    {
      value: "4.8 hrs",
      label: "wasted per operator each day tab-switching between helpdesks, CRM, and internal wikis",
    },
    {
      value: "89%",
      label: "autonomous tier-1 resolution rate with verified citations and zero hallucinated answers",
    },
    {
      value: "< 30s",
      label: "median first-contact resolution time around the clock without adding weekend shifts",
    },
  ];

  const pillars = [
    {
      tag: "Unified Workspace",
      title: "One calm inbox. Zero tab gymnastics.",
      description:
        "Support teams waste hours jumping between Zendesk, Slack, Linear, and internal documentation just to assemble customer context. Elpino unites every website chat, email thread, and teammate note into a single calm command center. Collision detection ensures nobody replies to the same customer twice.",
      bulletPoints: [
        "Real-time collision detection stops duplicate responses before they happen",
        "Internal teammate mentions (@teammate) keep customer-facing chat clean",
        "Universal search across past conversations, help docs, and customer orders",
      ],
      image: "/images/busy-teams-sloth-v2.png",
      badge: "Inbox Zero Without Burnout",
      statHighlight: {
        number: "4.8 hrs",
        text: "saved daily per support specialist",
      },
    },
    {
      tag: "Autonomous Deflection",
      title: "Answers with real citations. Not robot gibberish.",
      description:
        "Traditional support bots frustrate customers with rigid decision trees and unhelpful 'I did not understand that' loops. Elpino continuously indexes your living documentation, API specs, and Notion guides. When a customer asks a question, it synthesizes an accurate, contextual answer in 300 milliseconds—backed by exact reference links.",
      bulletPoints: [
        "Cites exact documentation paragraphs so customers can self-serve deeper",
        "Understands technical screenshots, error codes, and edge-case phrasing",
        "Refuses to guess—guaranteed confidence guardrails prevent hallucinations",
      ],
      image: "/images/help-center-sloth.png",
      badge: "89% Autonomous Deflection",
      statHighlight: {
        number: "89%",
        text: "first-contact tickets resolved instantly",
      },
    },
    {
      tag: "Contextual Handoff",
      title: "Handoff without the customer repeating themselves.",
      description:
        "Nothing frustrates a customer more than explaining their problem all over again when transferred to a human. When an issue requires empathy, custom exceptions, or engineering investigation, Elpino transfers the thread with a 3-bullet AI brief, customer plan tier, and attempted troubleshooting steps.",
      bulletPoints: [
        "Delivers a 3-bullet executive summary directly to the assigned operator",
        "Routes high-priority VIPs or angry sentiments straight to tier-2 engineers",
        "Seamless Slack & Linear bi-directional sync keeps engineering aligned",
      ],
      image: "/images/about-sloth-crew.png",
      badge: "Zero-Friction Human Escalation",
      statHighlight: {
        number: "100%",
        text: "context preserved on every handoff",
      },
    },
  ];

  const workflowSteps = [
    {
      title: "1. Autonomous Queue Triage",
      subtitle: "Instant deflection for repeat inquiries",
      content: {
        userQuery: "How do I invite our contractor to our workspace with read-only billing access?",
        aiResponse:
          "To invite a teammate with read-only billing permissions: Navigate to Settings → Team → 'Invite Member', enter their email, and select the 'Billing Auditor' role preset.",
        source: "Source: help.elpino.chat/roles-and-permissions#billing-auditor",
        status: "Auto-Resolved in 280ms · No Human Needed",
      },
    },
    {
      title: "2. Intelligent Teammate Routing",
      subtitle: "Complex bugs routed to the right specialist",
      content: {
        userQuery: "Webhook endpoint returning 504 Gateway Timeout on checkout.session.completed events.",
        aiResponse:
          "I've flagged this webhook timeout to our developer support queue with your payload logs and endpoint URL. Jordan (Integration Lead) is reviewing this thread.",
        source: "Routed to: Engineering / Webhooks Queue · Priority: High",
        status: "Assigned to Jordan · AI Summary Attached",
      },
    },
    {
      title: "3. AI Copilot Drafts for Operators",
      subtitle: "Operators review AI-prepared replies in 1 click",
      content: {
        userQuery: "We were charged twice during our plan upgrade yesterday. Can you refund the duplicate?",
        aiResponse:
          "I located the duplicate charge of $149 from yesterday at 14:22 UTC. A full refund has been initiated to your card ending in 4242 and will post within 3-5 business days.",
        source: "Stripe Connector · Invoice #inv_9821 verified",
        status: "AI Draft Ready for Operator 1-Click Approval",
      },
    },
    {
      title: "4. Knowledge Gap Auto-Detection",
      subtitle: "Self-healing documentation from customer questions",
      content: {
        userQuery: "Can we export customer chat transcripts to AWS S3 buckets automatically?",
        aiResponse:
          "We support S3 audit sync via our Enterprise Webhooks connector! (Note: 14 customers asked about this topic this week. Elpino created draft doc: /docs/s3-transcript-export).",
        source: "Knowledge Sentinel · Auto-created Draft Article #42",
        status: "Knowledge Gap Flagged to Docs Team",
      },
    },
  ];

  const agents = [
    {
      name: "Queue Triage Sentinel",
      role: "Auto-categorization & priority",
      description: "Tags incoming tickets, identifies sentiment urgency, and assigns routing rules in 200ms.",
      icon: Inbox,
      accent: "bg-[#428ce5]/10 text-[#428ce5]",
    },
    {
      name: "Autonomous Deflector",
      role: "Tier-1 ticket resolution",
      description: "Resolves 85%+ of repetitive how-to, setup, and billing queries with verified documentation citations.",
      icon: Bot,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
    {
      name: "Collision Guard",
      role: "Duplicate prevention",
      description: "Prevents operators from stepping on each other's toes with live typing and viewing locks.",
      icon: ShieldCheck,
      accent: "bg-[#18c983]/10 text-[#18c983]",
    },
    {
      name: "Context Briefing Copilot",
      role: "Handoff summarizer",
      description: "Generates instant 3-point bullet summaries for operators when conversations require human intervention.",
      icon: Sparkles,
      accent: "bg-[#7060bd]/10 text-[#7060bd]",
    },
    {
      name: "Knowledge Gap Finder",
      role: "Continuous documentation",
      description: "Monitors search queries to uncover missing articles and auto-generates doc drafts for your team.",
      icon: Search,
      accent: "bg-[#233d4d]/10 text-[#233d4d]",
    },
    {
      name: "Sentiment Escalator",
      role: "Churn risk prevention",
      description: "Detects frustrated customers, urgent SLA risks, and VIP tiers to alert support leads in real time.",
      icon: Bell,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
  ];

  const faqs = [
    {
      q: "How does Elpino prevent multiple operators from replying to the same customer?",
      a: "Elpino features real-time collision detection. As soon as an operator opens a conversation or starts drafting a response, active presence badges and typing locks notify everyone else on the team, eliminating duplicate replies and awkward customer experiences.",
    },
    {
      q: "Will Elpino replace my human support team or make them obsolete?",
      a: "No—Elpino empowers your support team to do their best work. By autonomously deflecting the 75%+ routine repetitive questions (password resets, billing dates, basic settings), your human operators can dedicate their energy to nuanced inquiries, VIP accounts, and high-value customer relationships without burning out.",
    },
    {
      q: "What documentation sources can Elpino index for answers?",
      a: "Elpino connects with public URLs, Notion workspaces, GitBook, Zendesk Help Centers, Intercom Articles, Confluence, and markdown repositories. It automatically re-indexes whenever you publish updates so your support AI never gives outdated answers.",
    },
    {
      q: "Can our support operators use Elpino as an internal drafting copilot?",
      a: "Yes! In addition to customer-facing autonomous mode, operators can use Elpino inside the shared inbox to generate contextual reply drafts, adjust tone (friendly, concise, technical), summarize long threads, or translate customer messages into 30+ languages.",
    },
    {
      q: "How long does onboarding and rollout take for a busy team?",
      a: "Most teams are up and running in under 15 minutes. Connect your documentation sources, configure your routing rules, invite your team, and drop the lightweight widget code into your website or web app. No complex training datasets or lengthy consultancy needed.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#428ce5]/20 selection:text-[#428ce5]">
      {/* 1. HERO SECTION matching Superhuman pattern */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#428ce5]/20 bg-[#428ce5]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#428ce5]">
              <Sparkles size={13} className="text-[#428ce5]" />
              Elpino for Busy Teams · Calm Support Operations
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                The queue keeps moving.{" "}
                <span className="italic text-[#428ce5]">So can your team.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Stop drowning in ticket backlogs. Elpino resolves repetitive questions
                instantly from your knowledge base, triages complex inquiries, and hands off to
                your operators with complete customer backstory.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#428ce5] hover:text-white"
                >
                  Start free trial
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                >
                  Explore the workspace
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-black/10 pt-6 text-xs text-black/50 sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> 50 free resolutions/mo
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> No credit card needed
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> 5-minute setup
                </span>
              </div>
            </div>

            {/* Hero Visual Mockup with Sloth Mascot & Floating Badges */}
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* Sloth mascot playfully perched on top */}
              <div className="pointer-events-none absolute -top-24 -right-10 z-20 w-44 sm:w-52 drop-shadow-2xl">
                <Image
                  src="/images/busy-teams-sloth-v2.png"
                  alt="Elpino Calm Support Sloth"
                  width={1024}
                  height={1536}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              {/* Floating Badge Top Left */}
              <div className="absolute -top-4 -left-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#428ce5]/15 text-[#428ce5]">
                  <TrendingDown size={15} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Backlog Down 68%</div>
                  <div className="text-[10px] text-black/50">Average 22s first response</div>
                </div>
              </div>

              {/* Central Mock Inbox Window */}
              <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-400" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-xs font-semibold text-black/60">
                      elpino-shared-inbox // live-queue
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ● Queue Calm
                  </span>
                </div>

                {/* Queue items */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          AI
                        </span>
                        <span className="text-xs font-semibold text-black">Maya Johnson</span>
                        <span className="rounded bg-black/5 px-1.5 py-0.5 text-[9px] text-black/50">
                          Pro Plan
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600">
                        Resolved in 280ms
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/70">
                      &quot;How do I invite teammates with read-only billing permissions?&quot;
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-700">
                      <Check size={12} /> Cites docs.elpino.chat/roles-and-permissions
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#428ce5]/20 text-[10px] font-bold text-[#428ce5]">
                          AL
                        </span>
                        <span className="text-xs font-semibold text-black">Alex Lee · VP Product</span>
                      </div>
                      <span className="rounded-full bg-[#428ce5]/10 px-2 py-0.5 text-[10px] font-medium text-[#428ce5]">
                        Jordan is replying...
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/70">
                      &quot;Need assistance configuring SSO SAML for Okta before security review.&quot;
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-black/50">
                      <span className="flex items-center gap-1 text-[#428ce5]">
                        <ShieldCheck size={12} /> Collision lock: Jordan viewing
                      </span>
                      <span>1m ago</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                          SK
                        </span>
                        <span className="text-xs font-semibold text-black">Sam Kim · Developer</span>
                      </div>
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/60">
                        Copilot Draft Ready
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-black/70">
                      &quot;Where do I generate webhook HMAC secrets for custom endpoints?&quot;
                    </p>
                    <div className="mt-2 text-[10px] text-black/50">
                      AI prepared draft with code sample · 1-click send
                    </div>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/50">
                  <span>3 active operators online</span>
                  <span className="font-medium text-[#428ce5]">0 unassigned tickets</span>
                </div>
              </div>

              {/* Floating Badge Bottom Right */}
              <div className="absolute -bottom-4 -right-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <Check size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">89% Deflected Autonomously</div>
                  <div className="text-[10px] text-black/50">Zero manual triage required</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REALITY CHECK / STATS PLATEAU SECTION (matching Superhuman) */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#428ce5]">
              The Support Queue Reality Check
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              High ticket volume shouldn&apos;t mean burned-out operators.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              When support volume scales, traditional helpdesks force you into a vicious cycle of
              hiring more headcount just to copy-paste the same answers all day.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#428ce5]/40 hover:bg-white hover:shadow-lg"
              >
                <div className="text-4xl font-semibold tracking-tight text-[#428ce5] sm:text-5xl">
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

      {/* 3. CORE PILLARS SECTION (Alternating Layout matching Superhuman) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
              The Elpino Standard
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#17181c]">
              Built for speed. Engineered for calm.
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
                    <span className="inline-block rounded-full bg-[#428ce5]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#428ce5]">
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
                      <div className="text-2xl font-bold text-[#428ce5]">
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
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#428ce5]">
                            <Sparkles size={14} /> Elpino Autonomous Assist
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-black/70">
                            Continuous knowledge grounding ensures your operators never send
                            outdated, inaccurate, or unverified information to customers.
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

      {/* 4. INTERACTIVE TABBED WORKFLOW DEMO (Superhuman "See How It Works") */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#428ce5]">
              Interactive Architecture
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              See how it all works together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/65 sm:text-lg">
              Click through the support lifecycle to see how Elpino triages, deflects, and routes
              threads in real time.
            </p>
          </div>

          {/* Tabs header */}
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveTab(idx)}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-[#428ce5] bg-[#428ce5]/5 shadow-md"
                      : "border-black/10 bg-[#faf9f6] hover:border-black/25 hover:bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isActive ? "text-[#428ce5]" : "text-black/40"
                    }`}
                  >
                    Step 0{idx + 1}
                  </span>
                  <span className="mt-2 font-medium text-base text-black">{step.title}</span>
                  <span className="mt-1 text-xs text-black/55">{step.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Preview Display */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-[#17181c] p-6 text-white shadow-2xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#428ce5] text-xs font-bold text-white">
                  0{activeTab + 1}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {workflowSteps[activeTab].title}
                  </h4>
                  <p className="text-xs text-white/50">{workflowSteps[activeTab].subtitle}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {workflowSteps[activeTab].content.status}
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Incoming Customer Query
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                  &quot;{workflowSteps[activeTab].content.userQuery}&quot;
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#428ce5]">
                  <Workflow size={14} />
                  <span>{workflowSteps[activeTab].content.source}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Elpino Autonomous Output
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-200">
                  {workflowSteps[activeTab].content.aiResponse}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Execution Latency: 280ms</span>
                  <span className="text-emerald-400">Verified via Knowledge Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SPECIALIZED MODULAR AI AGENTS GRID (matching Superhuman) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#428ce5]">
              Modular Support Intelligence
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              Specialized AI agents for every tier of your support operation.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              One general bot cannot handle every scenario. Elpino activates focused micro-agents
              engineered for triage, deflection, collision defense, and continuous knowledge
              updates.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="group relative rounded-2xl border border-black/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[#428ce5]/40 hover:shadow-xl"
                >
                  <div
                    className={`inline-flex size-12 items-center justify-center rounded-xl ${agent.accent}`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-black">
                    {agent.name}
                  </h3>
                  <div className="mt-1 text-xs font-medium text-black/50">{agent.role}</div>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">
                    {agent.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIAL SPOTLIGHT (matching Superhuman) */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#428ce5]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#428ce5]">
            Customer Spotlight
          </div>

          <blockquote className="mt-8 text-2xl font-normal leading-relaxed tracking-tight text-[#17181c] sm:text-3xl lg:text-4xl">
            &quot;Our support team was answering the same 20 questions hundreds of times a week.
            Within 48 hours of deploying Elpino, our first-response time dropped from 45 minutes
            down to 25 seconds, and operator burnout completely evaporated.&quot;
          </blockquote>

          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="font-semibold text-black">Elena Rostova</div>
            <div className="text-sm text-black/50">
              Head of Customer Experience at HyperScale Cloud (1,400+ B2B Accounts)
            </div>
            <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
              ✓ 71% tickets deflected · $64k/yr support overhead saved
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION (matching Superhuman) */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#428ce5]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Everything you need to know about Elpino for busy teams.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-lg font-medium text-black transition hover:text-[#428ce5]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-black/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#428ce5]" : ""
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

      {/* 8. CLOSING BANNER matching Superhuman */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Calm Support Operations
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Give your operators their sanity back. Start deflecting today.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect your knowledge base in minutes with
            zero credit card required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#428ce5] px-8 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:bg-white hover:text-black"
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
