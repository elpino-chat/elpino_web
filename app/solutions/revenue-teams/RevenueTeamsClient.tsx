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
  TrendingUp,
  DollarSign,
  Calendar,
  UserCheck,
  Target,
  BarChart3,
  Flame,
} from "lucide-react";

export function RevenueTeamsClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "78%",
      label: "of inbound B2B buyers purchase from the vendor that provides the first helpful response",
    },
    {
      value: "10x",
      label: "drop-off in buyer qualification rate when initial response latency exceeds 5 minutes",
    },
    {
      value: "3.4x",
      label: "higher inbound deal conversion rate when pricing questions receive immediate clarity",
    },
    {
      value: "< 300ms",
      label: "average response latency answering enterprise compliance, SLA, and pricing questions 24/7",
    },
  ];

  const pillars = [
    {
      tag: "Inbound Pipeline Acceleration",
      title: "Answer before buyer intent evaporates.",
      description:
        "High-intent buyers visit your site ready to purchase, but bounce when confronted by gatekept forms or 48-hour email delays. Elpino delivers immediate, transparent answers to complex pricing questions, feature comparisons, and deployment requirements—capturing buyer enthusiasm at peak momentum.",
      bulletPoints: [
        "Answers seat pricing, add-ons, and annual billing questions autonomously",
        "Captures verified business emails, company headcount, and budget timeline",
        "Zero generic robot scripts: grounded strictly in your real pricing model",
      ],
      image: "/images/revenue-sloth-v2.png",
      badge: "Zero-Latency Lead Conversion",
      statHighlight: {
        number: "3.4x",
        text: "inbound conversion velocity",
      },
    },
    {
      tag: "Live Customer Enrichment",
      title: "Know who you're talking to before you reply.",
      description:
        "Stop asking customers what plan they are on or what their account email is. Connect Stripe, Razorpay, or your internal CRM. When an account reaches out with expansion questions, Elpino surfaces their current MRR, subscription status, renewal date, and seat usage directly in the conversation.",
      bulletPoints: [
        "Live Stripe connector syncs invoice history, active tier, and payment status",
        "Identifies expansion triggers: flags accounts approaching seat or API limits",
        "Recognizes VIP accounts and immediately alerts their dedicated account manager",
      ],
      image: "/images/contact-support-sloth.png",
      badge: "Real-Time Stripe & CRM Sync",
      statHighlight: {
        number: "$42M+",
        text: "in pipeline conversation volume",
      },
    },
    {
      tag: "Zero-Friction AE Handoff",
      title: "Enterprise deals routed straight to your calendar.",
      description:
        "When a buyer mentions 50+ seats, custom SOC2 requirements, or annual invoicing, Elpino doesn't make them fill out an 8-field form. It qualifies their exact requirements in chat, offers an embedded calendar slot on your AE's calendar, and pings your team's Slack `#deals` channel with an executive brief.",
      bulletPoints: [
        "Embeds live booking calendar slots directly into the chat stream",
        "Posts real-time executive qualification summaries into Slack or CRM",
        "Preserves complete conversation history so sales reps jump in prepared",
      ],
      image: "/images/founders-sloth-v2.png",
      badge: "Automated Enterprise Routing",
      statHighlight: {
        number: "100%",
        text: "qualified leads booked in-session",
      },
    },
  ];

  const workflowSteps = [
    {
      title: "1. Instant Pricing & Tier Clarification",
      subtitle: "Transparent answers convert fence-sitters",
      content: {
        userQuery: "We have 35 engineers and need SSO SAML. How much does that cost annually vs monthly?",
        aiResponse:
          "For 35 seats on our Enterprise Tier with SSO SAML: It is $49/seat/mo billed annually ($20,580/yr, saving 20% compared to monthly). That includes dedicated SLA, audit logs, and priority support.",
        source: "Source: elpino.chat/pricing#enterprise-calculator",
        status: "Auto-Answered in 290ms · Pricing Verified",
      },
    },
    {
      title: "2. Autonomous Lead Qualification",
      subtitle: "Captures business email & requirements gracefully",
      content: {
        userQuery: "Can we get custom invoice billing with Net 30 terms?",
        aiResponse:
          "Yes, we offer Net 30 invoicing on annual Enterprise plans! What is your company name and work email so our account executive can send over our standard vendor packet?",
        source: "Rule: Enterprise Billing Qualification Rule #3",
        status: "Lead Qualified · Captured: sarah@vanguard.io",
      },
    },
    {
      title: "3. Live Stripe Account Enrichment",
      subtitle: "Instant visibility into customer account MRR",
      content: {
        userQuery: "Can we upgrade our current plan to unlock the developer API connectors?",
        aiResponse:
          "I see your workspace is currently on the Pro Tier ($149/mo) with 8 active seats. Upgrading to Business adds API connectors and prorates to $84 for the remainder of this cycle.",
        source: "Stripe Connector · Customer cus_821 · Active $149 MRR",
        status: "Verified Customer · Account Expansion Trigger",
      },
    },
    {
      title: "4. Direct AE Calendar Booking",
      subtitle: "Locks in demos without bouncing the buyer",
      content: {
        userQuery: "Can someone show us a 15-minute demo of the Slack escalation workflow?",
        aiResponse:
          "I've opened our AE Marcus's calendar directly below. Select any 15-minute slot that works for your schedule and your calendar invite will be sent immediately!",
        source: "Cal.com Integration · Marcus Vance (Enterprise AE)",
        status: "Demo Scheduled · Synced to HubSpot & Slack",
      },
    },
  ];

  const agents = [
    {
      name: "Lead Qualification Engine",
      role: "Buyer qualification & intent",
      description: "Detects company size, tech stack, and budget urgency to prioritize high-value opportunities.",
      icon: Target,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
    {
      name: "Pricing & ROI Consultant",
      role: "Tier and plan advisor",
      description: "Explains seat tiers, annual discounts, and ROI projections transparently in sub-second responses.",
      icon: DollarSign,
      accent: "bg-[#18c983]/10 text-[#18c983]",
    },
    {
      name: "Stripe Revenue Guard",
      role: "Live payment intelligence",
      description: "Pulls active plan, subscription tier, MRR, and renewal date the second an existing customer opens chat.",
      icon: CreditCard,
      accent: "bg-[#428ce5]/10 text-[#428ce5]",
    },
    {
      name: "Meeting Scheduler",
      role: "Zero-friction booking",
      description: "Embeds calendar booking slots directly into the chat stream when enterprise criteria are satisfied.",
      icon: Calendar,
      accent: "bg-[#7060bd]/10 text-[#7060bd]",
    },
    {
      name: "Slack Deal Pager",
      role: "Real-time AE alert",
      description: "Alerts sales reps in Slack `#deals` with full chat context, buyer tech stack, and intent score.",
      icon: Bell,
      accent: "bg-[#ff5600]/10 text-[#ff5600]",
    },
    {
      name: "Churn Defense Sentinel",
      role: "Retention & expansion",
      description: "Identifies at-risk customers, flags billing downgrade threats, and triggers proactive retention workflows.",
      icon: Flame,
      accent: "bg-[#233d4d]/10 text-[#233d4d]",
    },
  ];

  const faqs = [
    {
      q: "Can Elpino push qualified leads and chat transcripts to our CRM?",
      a: "Yes. Elpino integrates with HubSpot, Salesforce, Pipedrive, and webhook targets. When a visitor shares their email or books a demo, their contact info, company details, chat summary, and intent score sync to your CRM automatically.",
    },
    {
      q: "What happens if a buyer asks a custom enterprise question not covered in our docs?",
      a: "Elpino never invents pricing or promises non-existent features. If a buyer asks for custom MSA clauses, special discounts, or unreleased roadmap items, Elpino politely explains that an account executive will confirm the details and smoothly routes the conversation to your team.",
    },
    {
      q: "How does Elpino connect with Stripe or billing systems safely?",
      a: "Elpino connects using read-only API keys or secure webhook listeners. Customer payment details (credit card numbers, CVC) are never visible or handled by Elpino—only verified plan metadata, subscription status, and billing cycle dates are referenced for support and sales context.",
    },
    {
      q: "Can we restrict Elpino to only qualify leads on specific high-intent pages?",
      a: "Yes. You have granular control over where the widget appears and which prompts fire. For example, you can deploy proactive pricing guidance on `/pricing`, enterprise demo prompts on `/enterprise`, and pure technical support on `/docs`.",
    },
    {
      q: "How does live demo booking work inside the chat widget?",
      a: "Elpino integrates with Calendly, Cal.com, and Google Calendar. Qualified leads can pick an open slot right inside the chat window without leaving your website or opening new tabs, resulting in substantially higher demo completion rates.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Superhuman pattern */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff5600]/20 bg-[#ff5600]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino for Revenue Teams · Inbound Pipeline Acceleration
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Turn visitor questions into pipeline{" "}
                <span className="italic text-[#ff5600]">before intent cools.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Give high-intent buyers instant, verified answers to pricing and feature
                questions while they are on your site. Qualify leads autonomously and route
                enterprise deals directly to your calendar or Slack.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#ff5600] hover:text-white"
                >
                  Start converting visitors
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                >
                  Book a live demo
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 border-t border-black/10 pt-6 text-xs text-black/50 sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> $42M+ pipeline influenced
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> Stripe &amp; CRM integrated
                </span>
                <span className="flex items-center gap-1.5 font-medium text-black/80">
                  <Check size={16} className="text-[#18c983]" /> Instant Cal.com booking
                </span>
              </div>
            </div>

            {/* Hero Visual Mockup with Sloth Mascot & Floating Badges */}
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* Sloth mascot playfully perched on top */}
              <div className="pointer-events-none absolute -top-24 -right-10 z-20 w-44 sm:w-52 drop-shadow-2xl">
                <Image
                  src="/images/revenue-sloth-v2.png"
                  alt="Elpino Revenue Growth Sloth"
                  width={1145}
                  height={1374}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              {/* Floating Badge Top Left */}
              <div className="absolute -top-4 -left-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#ff5600]/15 text-[#ff5600]">
                  <TrendingUp size={15} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Conversion Up 3.4x</div>
                  <div className="text-[10px] text-black/50">Sub-second pricing responses</div>
                </div>
              </div>

              {/* Central Mock Conversation Window */}
              <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-400" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono text-xs font-semibold text-black/60">
                      elpino-revenue // buyer-session
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ff5600]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ff5600]">
                    ● Enterprise Lead Active
                  </span>
                </div>

                {/* Chat Stream */}
                <div className="mt-4 space-y-3.5">
                  {/* Visitor message */}
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f1f2ef] p-3.5 text-xs leading-relaxed text-black/80">
                    &quot;We have 45 seats and need SSO SAML + HIPAA BAA. How does pricing work?&quot;
                  </div>

                  {/* AI internal qualification pill */}
                  <div className="flex items-center gap-2 text-[10px] font-medium text-[#7060bd]">
                    <span className="flex size-4 items-center justify-center rounded-full bg-[#7060bd]/15">
                      ✦
                    </span>
                    <span>Elpino qualified: Enterprise Tier · 45 Seats · HIPAA Required</span>
                  </div>

                  {/* AI response */}
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#17181c] p-3.5 text-xs leading-relaxed text-white">
                    Our Enterprise Tier includes HIPAA BAA and SSO SAML at $49/seat/mo billed
                    annually. I can also connect you directly with our Enterprise Lead Jordan to
                    send our standard BAA package right now.
                  </div>

                  {/* Embedded booking action */}
                  <div className="ml-auto w-[88%] rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} /> Jordan&apos;s Calendar (Enterprise AE)
                      </span>
                      <span className="rounded bg-emerald-200/60 px-1.5 py-0.2 text-[9px]">
                        Available Today
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="cursor-pointer rounded-md bg-white px-2 py-1 text-[10px] font-medium text-black border border-black/10 hover:border-black">
                        Today 3:30 PM
                      </span>
                      <span className="cursor-pointer rounded-md bg-white px-2 py-1 text-[10px] font-medium text-black border border-black/10 hover:border-black">
                        Tomorrow 10:00 AM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/50">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Check size={12} /> Work email verified: sarah@acme.com
                  </span>
                  <span className="font-semibold text-black">Est. Pipeline: $26,460/yr</span>
                </div>
              </div>

              {/* Floating Badge Bottom Right */}
              <div className="absolute -bottom-4 -right-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Live Stripe Context</div>
                  <div className="text-[10px] text-black/50">ARR &amp; seat limits attached</div>
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
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              The Inbound Pipeline Plateau
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Buyer intent evaporates in minutes. Not days.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              When high-intent prospects have questions on pricing or compliance, traditional
              gatekept contact forms lose you deals before your sales team even opens the email.
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

      {/* 3. CORE PILLARS SECTION (Alternating Layout matching Superhuman) */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
              The Modern Revenue Engine
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#17181c]">
              Built for speed. Optimized for conversion.
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
                        <span className="text-xs font-medium text-emerald-600">● Live Pipeline</span>
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
                            <Sparkles size={14} /> Pipeline Intelligence
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-black/70">
                            Transparent pricing and instant responses build immediate buyer trust,
                            accelerating deal velocity across your entire funnel.
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
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Interactive Architecture
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              See how it all works together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-black/65 sm:text-lg">
              Click through the inbound conversion lifecycle to see how Elpino qualifies, enriches,
              and books meetings in real time.
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
                      ? "border-[#ff5600] bg-[#ff5600]/5 shadow-md"
                      : "border-black/10 bg-[#faf9f6] hover:border-black/25 hover:bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isActive ? "text-[#ff5600]" : "text-black/40"
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
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff5600] text-xs font-bold text-white">
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
                  Visitor Inquiry
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                  &quot;{workflowSteps[activeTab].content.userQuery}&quot;
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#ff5600]">
                  <Workflow size={14} />
                  <span>{workflowSteps[activeTab].content.source}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Elpino Real-Time Response
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-200">
                  {workflowSteps[activeTab].content.aiResponse}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Execution Latency: 290ms</span>
                  <span className="text-emerald-400">Pipeline Grounded &amp; Verified</span>
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
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Modular Revenue Intelligence
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
              Specialized AI agents for every stage of your sales funnel.
            </h2>
            <p className="mt-4 text-base text-black/65 sm:text-lg">
              Capture leads, calculate pricing, query live billing, and route qualified enterprise
              buyers to your calendar automatically.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="group relative rounded-2xl border border-black/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[#ff5600]/40 hover:shadow-xl"
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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ff5600]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
            Revenue Leader Spotlight
          </div>

          <blockquote className="mt-8 text-2xl font-normal leading-relaxed tracking-tight text-[#17181c] sm:text-3xl lg:text-4xl">
            &quot;In our first 30 days with Elpino, we booked 38 qualified enterprise demos directly
            from website chat. Before Elpino, buyers who had pricing questions waited 18 hours for an
            SDR reply and mostly disappeared.&quot;
          </blockquote>

          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="font-semibold text-black">Marcus Thorne</div>
            <div className="text-sm text-black/50">
              VP of Revenue &amp; Growth at LatticePulse ($8.5M ARR)
            </div>
            <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
              ✓ 3.4x inbound pipeline acceleration · $180k new ARR added
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION (matching Superhuman) */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Everything you need to know about Elpino for revenue teams.
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

      {/* 8. CLOSING BANNER matching Superhuman */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Stop Losing Inbound Pipeline
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Convert buyers while they&apos;re hot. Start today.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect your knowledge base and CRM in minutes with
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
