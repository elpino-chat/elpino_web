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
} from "lucide-react";

export function FoundersClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "82%",
      label: "of founder interruptions come from repetitive questions already answered in docs",
    },
    {
      value: "85%",
      label: "first-contact autonomous resolution rate across routine customer conversations",
    },
    {
      value: "< 45s",
      label: "median answer speed 24/7 without hiring an outsourced frontline support team",
    },
    {
      value: "14 hrs",
      label: "saved per founder each week, redirected straight back into shipping product",
    },
  ];

  const pillars = [
    {
      tag: "Focus Preservation",
      title: "AI that shows up so you can stay in product mode",
      description:
        "Most customer tools force you into a separate tabbed inbox all day. Elpino ingests your docs, syncs with your website, and handles frontline triage quietly in the background. When a VIP lead or complex bug arrives, it pings your Slack or Telegram with full context.",
      bulletPoints: [
        "Resolves repetitive setup, pricing, and FAQ queries instantly",
        "Hands off to you only when human judgment is genuinely required",
        "No tab-hopping: manage triage from Slack or your unified dashboard",
      ],
      image: "/images/founders-sloth-v2.png",
      imageAlt: "Founders staying in deep focus while Elpino handles customer triage",
      chip: "Deep Work Protected",
    },
    {
      tag: "Absolute Grounding",
      title: "Built on your actual product truth, not a blank prompt",
      description:
        "Generic AI tools hallucinate and guess. Elpino indexes your live documentation, GitHub issues, help centers, and API schemas. Every answer is strictly grounded in your verified company knowledge, with direct citations so customers trust every reply.",
      bulletPoints: [
        "Continuous crawl of your docs, Notion pages, and URLs",
        "Configurable confidence guardrails prevent speculative answers",
        "Cites exact documentation paragraphs for transparency",
      ],
      image: "/images/about-sloth-crew.png",
      imageAlt: "Grounded AI customer operator powered by company knowledge",
      chip: "0% Hallucination Policy",
    },
    {
      tag: "Revenue Intelligence",
      title: "Turn customer questions into closed deals before intent cools",
      description:
        "When an interested buyer asks about enterprise pricing, integrations, or security compliance at 11 PM on a Sunday, Elpino provides definitive, accurate answers in seconds, collects their email, and stages high-intent sales conversations for you.",
      bulletPoints: [
        "Captures verified leads with pre-chat qualification",
        "Connects with Stripe to verify customer subscription status instantly",
        "Never lets a high-value customer wait hours for basic answers",
      ],
      image: "/images/revenue-sloth-v2.png",
      imageAlt: "Capturing high-intent buyers and speeding up revenue cycles",
      chip: "Instant Buyer Conversion",
    },
  ];

  const demoTabs = [
    {
      title: "1. Instant Knowledge Resolution",
      subtitle: "Customer asks complex setup question",
      content: {
        userQuery: "How do I verify customer identity using JWT tokens with your chat widget?",
        aiResponse:
          "To verify customer identity, generate an HMAC-SHA256 token on your backend using your workspace identity secret, then pass userHash and email to elpino.identify().",
        source: "Source: docs.elpino.chat/identity-verification",
        status: "Auto-Resolved · 380ms",
      },
    },
    {
      title: "2. Intelligent Founder Escalation",
      subtitle: "VIP customer needs custom contract term",
      content: {
        userQuery: "We're a team of 45 looking for HIPAA BAA and annual invoicing. Can we talk to the founder?",
        aiResponse:
          "I've flagged this conversation directly to our founder team with your workspace details and contract request. Jagdeep will follow up within 20 minutes!",
        source: "Trigger: Tier-1 Enterprise Handoff Rule",
        status: "Escalated to Slack #founders",
      },
    },
    {
      title: "3. Real-Time Stripe Context",
      subtitle: "Instant billing and subscription lookup",
      content: {
        userQuery: "Can I add 3 more operator seats before my next renewal date?",
        aiResponse:
          "Yes! You are currently on the Pro Tier. Additional seats prorate at $29/seat. I can send an update link to your billing email right now.",
        source: "Stripe Connector · Customer ID: cus_8912",
        status: "Verified Customer · Active Plan",
      },
    },
    {
      title: "4. Auto-Updating Knowledge",
      subtitle: "Ship code, docs sync automatically",
      content: {
        userQuery: "Does Elpino support Claude 3.7 Sonnet for reasoning?",
        aiResponse:
          "Yes! Claude 3.7 Sonnet reasoning models are supported as of yesterday's changelog update with sub-second response streaming.",
        source: "Auto-synced from /changelog (Indexed 2 hours ago)",
        status: "Knowledge Live & Verified",
      },
    },
  ];

  const agents = [
    {
      name: "Frontline Operator",
      role: "Frontline triage & answers",
      description: "Answers 80%+ of incoming inquiries using real documentation in 400ms.",
      icon: Bot,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
    {
      name: "Founder Pager",
      role: "Smart escalation",
      description: "Routes urgent bugs, security inquiries, and high-value buyers to Slack or SMS.",
      icon: Bell,
      accent: "bg-[#7651b0]/10 text-[#7651b0]",
    },
    {
      name: "Stripe Billing Guard",
      role: "Payment intelligence",
      description: "Pulls subscription tier, invoice history, and credit usage in real time.",
      icon: CreditCard,
      accent: "bg-[#18c983]/10 text-[#18c983]",
    },
    {
      name: "Knowledge Crawler",
      role: "Continuous sync",
      description: "Crawls documentation, API specs, and release notes whenever you push updates.",
      icon: Workflow,
      accent: "bg-[#233d4d]/10 text-[#233d4d]",
    },
    {
      name: "Lead Qualifier",
      role: "Buyer conversion",
      description: "Collects verified emails, company size, and use-cases from high-intent visitors.",
      icon: Zap,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
    {
      name: "Zero-Hallucination Guard",
      role: "Strict verification",
      description: "Refuses to guess. When confidence is below threshold, hands off smoothly.",
      icon: ShieldCheck,
      accent: "bg-[#18c983]/10 text-[#18c983]",
    },
  ];

  const faqs = [
    {
      q: "How is Elpino different from generic chatbot widgets?",
      a: "Generic chatbots require manual 'if-this-then-that' decision trees or use disconnected prompts that hallucinate. Elpino is an autonomous customer agent that deeply indexes your real knowledge base, connects with your live customer data (Stripe, CRM), and hands off to you with full conversational memory the moment human judgment is required.",
    },
    {
      q: "How fast can I set up Elpino as a solo founder or small team?",
      a: "Under 5 minutes. Paste your website URL or documentation link to start instant indexing, copy one script tag into your website or React app, and Elpino begins answering customer queries immediately.",
    },
    {
      q: "How does Elpino know when to answer vs when to alert me?",
      a: "You configure simple confidence thresholds and keyword rules. Routine setup, feature questions, and documentation queries are answered autonomously. Custom pricing, refund requests, security questions, or explicit requests for a human immediately notify your team in Slack, Telegram, or email.",
    },
    {
      q: "Will Elpino ever make up answers or hallucinate to my customers?",
      a: "No. Elpino enforces strict grounding policies. If an answer cannot be verified with high confidence from your ingested documentation and past approved answers, the agent politely states it will check with the founding team and creates a ticket.",
    },
    {
      q: "Can I connect Stripe to handle billing questions without exposing sensitive credentials?",
      a: "Yes. The Elpino Stripe connector operates through secure, restricted-scope OAuth tokens. It allows the agent to check invoice status, active plan tiers, and billing dates without ever storing or exposing raw card numbers or payout secrets.",
    },
    {
      q: "What happens when our startup scales and we hire our first support lead?",
      a: "Elpino transitions seamlessly. You can invite your new support teammate with one click, assign conversation routing rules, and grant them access to the shared inbox. Your historical knowledge and approved answers are already indexed and ready to assist them from day one.",
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-white font-[family-name:var(--font-rethink-sans)] text-[#111] antialiased">
      {/* 1. HERO SECTION matching Superhuman */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32">
        {/* Subtle warm mesh gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#fff4ec] via-[#faf7f2] to-[#f4f3ec] opacity-80 blur-3xl"
        />

        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/75 shadow-xs">
              <span className="size-2 rounded-full bg-[#ff5600] animate-pulse" />
              <span>Elpino for Founders · Automation with Human Craft</span>
            </div>

            {/* Display Headline */}
            <h1 className="mt-8 text-[clamp(2.75rem,6vw,5.5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#0c1017]">
              The AI customer operator that keeps you building.
            </h1>

            {/* Subhead */}
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-black/65 sm:text-xl md:leading-8">
              Resolve 85% of customer questions autonomously from your real knowledge base,
              capture high-intent buyers around the clock, and protect your calendar from
              support chaos.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-black px-8 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#ff5600] hover:shadow-lg active:scale-95"
              >
                Start free trial
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-medium text-black transition hover:border-black hover:bg-black/5"
              >
                Book a founder demo
              </Link>
            </div>

            {/* Trust badge */}
            <p className="mt-12 text-xs font-medium uppercase tracking-[0.14em] text-black/45">
              Trusted by 500+ high-velocity founders & fast-growing startups
            </p>
          </div>

          {/* Hero Visual Card with Mascot */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-black/10 bg-[#faf9f6] p-4 shadow-xl sm:p-8 lg:p-10">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#f5effb] shadow-inner">
              <Image
                src="/images/founders-sloth-v2.png"
                alt="Elpino founder dashboard and customer operator in action"
                fill
                priority
                className="object-contain p-5 transition-transform duration-700 hover:scale-[1.02] sm:p-8"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Floating UI Badges */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-[#18c983] animate-ping" />
                  <span className="text-sm font-semibold tracking-tight">
                    Elpino Agent Active · Autonomous Resolution: 88.4%
                  </span>
                </div>
                <div className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-medium backdrop-blur-md">
                  Grounded in /docs & Stripe live context
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE DATA PLATEAU SECTION matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-[#faf9f6] py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              The Founder Dilemma
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#0c1017]">
              Founders have hit an AI support plateau.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65 sm:text-lg">
              Generic chatbots promise automation, but lack deep business context, hallucinate answers,
              and dump half-broken tickets back into your personal inbox. Here is what builders
              experience before switching to Elpino:
            </p>
          </div>

          {/* 4 Stats Grid matching Superhuman's big numbers */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-8 shadow-xs transition hover:border-black/30 hover:shadow-md"
              >
                <div className="text-5xl font-semibold tracking-tight text-black sm:text-6xl">
                  {stat.value}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-black/65">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE PROPOSITION PILLARS matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Built for Velocity
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#0c1017]">
              Everything a founder needs to run calm, world-class support.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              Connect your documentation, billing, and communication channels into one
              autonomous operator that represents your company with extreme craft.
            </p>
          </div>

          <div className="mt-16 space-y-16 sm:space-y-24">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-16 ${
                  i % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Text column */}
                <div className={`space-y-6 lg:col-span-6 ${i % 2 === 1 ? "lg:col-start-7" : ""}`}>
                  <span className="inline-block rounded-full bg-[#f4f3ec] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-black/75">
                    {pillar.tag}
                  </span>
                  <h3 className="text-3xl font-medium tracking-tight text-black sm:text-4xl">
                    {pillar.title}
                  </h3>
                  <p className="text-base leading-relaxed text-black/70 sm:text-lg">
                    {pillar.description}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {pillar.bulletPoints.map((pt, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-black/80">
                        <Check size={16} className="mt-1 shrink-0 text-[#ff5600]" strokeWidth={2.5} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual column */}
                <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-black/10 bg-[#faf9f6] p-4 shadow-md sm:p-6">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#f5effb] shadow-inner">
                      <Image
                        src={pillar.image}
                        alt={pillar.imageAlt}
                        fill
                        className="object-contain p-5 transition-transform duration-700 hover:scale-[1.03] sm:p-7"
                      />
                      <div className="absolute top-4 left-4 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow-xs backdrop-blur-md">
                        {pillar.chip}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TABBED WORKFLOW DEMO matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-[#faf9f6] py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Interactive Preview
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#0c1017]">
              See how it all works together for your startup.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              Click through the stages of customer interaction to see how Elpino balances
              autonomous speed with high-touch human escalation.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mt-12 flex flex-wrap gap-2 border-b border-black/10 pb-4">
            {demoTabs.map((tab, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                  activeTab === idx
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-black/70 hover:bg-black/5 hover:text-black border border-black/10"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Active Tab Preview Window */}
          <div className="mt-8 rounded-3xl border border-black/15 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 text-xs font-medium text-black/50">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#18c983]" />
                {demoTabs[activeTab].subtitle}
              </span>
              <span className="rounded-full bg-[#f4f3ec] px-3 py-1 font-mono text-[11px] font-semibold text-black">
                {demoTabs[activeTab].content.status}
              </span>
            </div>

            <div className="mt-8 space-y-6">
              {/* User Query message */}
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold">
                  User
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-[#faf9f6] p-4 text-sm font-medium text-black sm:text-base sm:p-5 max-w-2xl border border-black/5">
                  &ldquo;{demoTabs[activeTab].content.userQuery}&rdquo;
                </div>
              </div>

              {/* AI Agent Response */}
              <div className="flex items-start gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ff5600] text-xs font-bold text-white">
                  🦥
                </div>
                <div className="space-y-3 max-w-2xl">
                  <div className="rounded-2xl rounded-tl-xs bg-[#f4f7f5] p-4 text-sm leading-relaxed text-[#1b2b24] sm:text-base sm:p-5 border border-[#18c983]/20 shadow-xs">
                    {demoTabs[activeTab].content.aiResponse}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-3 py-1 font-mono text-xs text-black/60">
                    <Sparkles size={12} className="text-[#ff5600]" />
                    {demoTabs[activeTab].content.source}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SPECIALIZED AGENTS GRID matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Modular Intelligence
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#0c1017]">
              The right AI operator for every founder task.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              First-party autonomous agents that handle triage, resolution, payment sync, and
              verification without requiring engineering maintenance.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-[#faf9f6] p-8 transition hover:border-black/30 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className={`flex size-12 items-center justify-center rounded-2xl ${agent.accent}`}>
                      <Icon size={22} />
                    </div>
                    <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-black/40">
                      {agent.role}
                    </div>
                    <h3 className="mt-1 text-2xl font-semibold text-black">
                      {agent.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">
                      {agent.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FOUNDER TESTIMONIAL SPOTLIGHT matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-[#070b14] py-20 text-white sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Founder Stories
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-white">
              Don&apos;t take it from us.
            </h2>

            <blockquote className="mt-10 text-2xl font-normal leading-relaxed tracking-tight text-white/90 sm:text-3xl md:text-4xl">
              &ldquo;Before Elpino, I spent 3 hours every morning answering the exact same 10 setup
              questions across email and web chat. Now Elpino resolves 85% of them autonomously with
              zero hallucinations, and I only see the conversations that truly need my judgment.&rdquo;
            </blockquote>

            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              <p className="text-base font-semibold text-white">Alex Rodriguez</p>
              <p className="text-sm text-white/60">Founder & CEO · HyperScale Cloud</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs text-[#ff5600]">
                <span>Resolved 12,400+ inquiries autonomously</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS matching Superhuman */}
      <section className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Founder FAQs
            </span>
            <h2 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#0c1017]">
              Frequently asked questions.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between text-left group"
                  >
                    <span className="text-xl font-medium tracking-tight text-black transition group-hover:text-[#ff5600] sm:text-2xl">
                      {faq.q}
                    </span>
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-black text-white" : "group-hover:border-black"
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
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
            Stop Tab-Hopping. Start Outperforming.
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Give every customer a helpful answer while you keep building.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect your knowledge base in minutes with
            zero credit card required.
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
