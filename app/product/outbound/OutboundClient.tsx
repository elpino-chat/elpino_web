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
  BellRing,
  MousePointer2,
  Send,
  Globe2,
  Radio,
  Target,
} from "lucide-react";

export function OutboundClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "42%",
      label: "Support volume deflected",
      detail: "proactive messages answer questions before tickets are opened",
    },
    {
      value: "3.2x",
      label: "Faster new user activation",
      detail: "contextual in-app onboarding walkthroughs and checklists",
    },
    {
      value: "100%",
      label: "Audience targeting accuracy",
      detail: "triggered by page URL, subscription tier, and custom events",
    },
    {
      value: "< 5m",
      label: "Campaign deployment time",
      detail: "publish banners and notifications with zero engineering sprints",
    },
  ];

  const outboundPillars = [
    {
      icon: MousePointer2,
      title: "Contextual in-product tours",
      tag: "Onboarding Velocity",
      badge: "In-App Guidance",
      description:
        "Guide new customers through core setup steps directly inside your application. Highlight features, link docs, and celebrate activation milestones.",
    },
    {
      icon: BellRing,
      title: "Pre-emptive incident notices",
      tag: "Downtime Deflection",
      badge: "Incident Banners",
      description:
        "Broadcast scheduled maintenance, API status notices, and known bugs inside your chat widget to prevent hundreds of duplicate inquiries during outages.",
    },
    {
      icon: Target,
      title: "Smart event-driven triggers",
      tag: "Precision Targeting",
      badge: "Targeted Rules",
      description:
        "Trigger messages based on specific user actions: a stalled checkout page, an unconfigured webhook, or approaching plan usage limits.",
    },
  ];

  const simulations = [
    {
      id: "maintenance",
      title: "Pre-Emptive Outage Notice",
      icon: BellRing,
      badge: "320 Tickets Prevented",
      type: "Site-Wide Broadcast Banner",
      targetAudience: "All Active European Users",
      trigger: "Detected regional latency spike on EU-Central database cluster",
      headline: "Scheduled Database Maintenance: EU-Central (02:00 - 02:45 UTC)",
      messageText:
        "Our engineering team is applying a zero-downtime hotfix to cluster eu-central-1. Real-time metrics remain available on our public status page. Chat support remains online.",
      outcome: "320 inbound tickets prevented · Status page views increased by 440%",
    },
    {
      id: "onboarding",
      title: "Product Activation Checklist",
      icon: MousePointer2,
      badge: "3.4x Faster Onboarding",
      type: "Interactive In-App Tour",
      targetAudience: "New Trial Users (Day 1 - Day 3)",
      trigger: "User viewed /settings/api-keys without generating token",
      headline: "Ready to send your first test API payload?",
      messageText:
        "Hey Alex! Generating your development API key takes 30 seconds. Here is our 1-click Quickstart guide with pre-filled curl commands for your workspace.",
      outcome: "Trial-to-paid activation improved by 28% · Zero configuration support tickets",
    },
    {
      id: "upgrade",
      title: "Plan Usage & Quota Alert",
      icon: Zap,
      badge: "Proactive Retention",
      type: "Targeted Widget Notification",
      targetAudience: "Growth Tier Customers at > 90% Quota",
      trigger: "Account consumed 4,600 of 5,000 monthly resolution credits",
      headline: "Approaching monthly resolution capacity",
      messageText:
        "Your team has resolved 4,600 customer inquiries this month! Enable automatic credit auto-recharge to ensure uninterrupted 24/7 AI coverage with zero overage penalties.",
      outcome: "96% of enterprise accounts auto-upgraded without billing disputes",
    },
  ];

  const faqs = [
    {
      q: "What is proactive outbound messaging in Elpino?",
      a: "Elpino Outbound lets your team deliver timely, targeted messages to users inside your web application and chat widget. Instead of waiting for customers to encounter roadblocks and submit support tickets, you proactively share maintenance alerts, onboarding tips, and product updates.",
    },
    {
      q: "How does proactive messaging reduce support ticket volume?",
      a: "By addressing known issues and common onboarding questions before the customer has to ask, you eliminate the primary drivers of repetitive tickets. For example, broadcasting a brief banner about scheduled maintenance prevents hundreds of duplicate 'is the site down?' tickets.",
    },
    {
      q: "Can we target outbound messages to specific customer segments?",
      a: "Yes. You can target messages by user attributes (e.g. Enterprise plan vs Free trial), current page URL, country/language, lifetime spend, or custom product events triggered via JavaScript or webhooks.",
    },
    {
      q: "Are outbound messages delivered via email or in-app?",
      a: "Both. You can configure in-app widget banners, slide-out tooltips, or automated follow-up emails if a customer does not open the in-app notice within a set timeframe.",
    },
  ];

  const activeSim = simulations[activeTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Send size={13} className="text-[#ff5600]" />
              Elpino / Proactive Outbound Messaging
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Support customers{" "}
                <span className="italic text-[#ff5600]">before they need to ask.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Share the right guidance, product updates, and maintenance notices at the exact moment
                they matter—before a customer has to open a conversation. Deflect repetitive ticket
                spikes by 42%+.
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
                  Book outbound demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 42% ticket deflection
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero code setup
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Granular audience targeting
                </span>
              </div>
            </div>

            {/* Mascot Picture Display: Agencies & Outbound Sloth Crew */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Proactive Outbound Engine
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Deflection Active
                    </span>
                  </div>

                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/agencies-services-sloths.png"
                      alt="Proactive Messaging Sloth Crew"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Tickets Prevented
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">42% Drop</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Fewer incoming spikes</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Targeting Precision
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">100%</div>
                      <div className="text-[11px] text-black/50">Custom audience triggers</div>
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

      {/* 3. THREE CORE OUTBOUND PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Pre-Emptive Support
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Get ahead of the questions you already know are coming.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Use customer context and behavioral signals to make every message helpful. Onboard
              faster, resolve friction in real time, and broadcast notices before tickets arrive.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {outboundPillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#ff5600] text-white shadow-sm">
                    <Icon size={20} />
                  </div>
                  <span className="inline-block mt-6 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#ff5600]">
                    {p.badge}
                  </span>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE OUTBOUND SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Campaigns
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience proactive messaging in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through operational outbound scenarios below to see how Elpino prevents tickets
              during outages, guides product setup, and communicates quota limits.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {simulations.map((sim, idx) => {
              const Icon = sim.icon;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === idx
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

          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#1c1d24] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#131417] px-6 py-4 gap-4">
              <div>
                <div className="text-base font-semibold text-white flex items-center gap-2">
                  <span>{activeSim.type}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    {activeSim.badge}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">Audience: {activeSim.targetAudience}</div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSim.outcome}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Behavioral Trigger Signal
                </div>
                <p className="text-xs text-white/70 font-mono">
                  {activeSim.trigger}
                </p>
              </div>

              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Proactive Message Delivered</span>
                  <span className="text-white/40 text-[10px]">In-App &amp; Chat Widget</span>
                </div>
                <div className="font-semibold text-white text-sm">{activeSim.headline}</div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSim.messageText}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                <span>Direct delivery via lightweight widget script</span>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff5600] px-4 py-1.5 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  Create outbound campaign →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQS ACCORDION */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Understanding Outbound Deflection.
            </h2>
            <p className="mt-4 text-base text-black/60">
              How proactive messages work, audience segmentation, and ticket reduction metrics.
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

      {/* 6. HIGH-IMPACT CLOSING BANNER */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Proactive Customer Communication
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Help customers before a ticket is ever opened.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Deploy proactive announcements and onboarding guides
            in minutes with zero engineering overhead.
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
