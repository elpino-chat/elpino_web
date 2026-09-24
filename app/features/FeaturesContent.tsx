"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCheck,
  Clock3,
  FileText,
  Gauge,
  Globe,
  Headphones,
  Inbox,
  LockKeyhole,
  MessagesSquare,
  MoonStar,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  Zap,
} from "lucide-react";

const heroScenarios = [
  {
    id: "ai-answer",
    tabLabel: "AI Instant Answer",
    icon: Sparkles,
    badgeColor: "bg-[#168cff]/15 text-[#168cff] border-[#168cff]/30",
    customer: {
      name: "Rahul Das",
      initials: "RD",
      question: "I tried to upgrade to Growth twice and the payment failed — have I been billed?",
      time: "Just now",
    },
    system: {
      status: "AI Verified Answer",
      source: "Billing & Subscriptions Guide · v3.2",
      reply: "Good news — nothing was captured. Both attempts were declined by your bank, so you haven't been charged. The temporary pre-authorization holds will release within 3–5 business days.",
      time: "Replied in 1.4s",
      verified: true,
    },
  },
  {
    id: "human-handoff",
    tabLabel: "Smart Human Handoff",
    icon: Users,
    badgeColor: "bg-[#8557e8]/15 text-[#8557e8] border-[#8557e8]/30",
    customer: {
      name: "Meera Iyer",
      initials: "MI",
      question: "Can we transfer our annual workspace subscription to our new holding company entity?",
      time: "2m ago",
    },
    system: {
      status: "Handed off to Support Team",
      source: "Escalation Rule: Enterprise entity transfer requires team approval",
      reply: "Hi Meera! I've connected you with our billing team. Teammate Alex Lee has picked up your thread with all account history attached.",
      time: "Escalated instantly",
      verified: true,
      agentName: "Alex Lee (Support Lead)",
    },
  },
  {
    id: "visitor-context",
    tabLabel: "Visitor Intelligence",
    icon: Globe,
    badgeColor: "bg-[#ff6038]/15 text-[#ff6038] border-[#ff6038]/30",
    customer: {
      name: "Sam Rivera",
      initials: "SR",
      question: "The checkout coupon code SUMMER26 isn't applying on the annual tier.",
      time: "1m ago",
    },
    system: {
      status: "Context Enriched",
      source: "Live Telemetry & Cart Session",
      reply: "Hi Sam! I see you are on our Pricing page from London, UK. The SUMMER26 discount applies automatically on checkout with code verified.",
      time: "Live Session Attached",
      metadata: [
        "Location: London, UK",
        "Device: macOS · Chrome 128",
        "Active URL: /pricing#annual",
        "Cart Value: $290/yr",
      ],
    },
  },
];

const featureCards = [
  {
    id: "ai-engine",
    eyebrow: "Core Intelligence",
    title: "Instant AI answers\nfrom your verified docs",
    description:
      "Elpino searches your uploaded help articles, FAQs, and web documentation before crafting every answer. Every response is grounded in your approved content.",
    icon: Sparkles,
    accent: "#168cff",
    previewType: "chat",
    previewData: {
      question: "How do I invite my teammates?",
      answer: "Open Settings → Team and select Invite teammate. Enter their email address to send an instant workspace invite.",
      source: "Team Setup Guide · Section 2",
    },
  },
  {
    id: "shared-inbox",
    eyebrow: "Collaboration",
    title: "One shared inbox\nfor your entire team",
    description:
      "Bring all customer conversations into a single unified dashboard. Teammates can assign threads, review AI draft suggestions, and reply in real time.",
    icon: Inbox,
    accent: "#ff6038",
    previewType: "inbox",
    previewData: {
      threads: [
        { name: "Rahul Das", preview: "Payment authorization hold query", tag: "AI Resolved", color: "#168cff" },
        { name: "Meera Iyer", preview: "Enterprise transfer request", tag: "With Alex", color: "#8557e8" },
        { name: "Sam Rivera", preview: "Checkout discount code inquiry", tag: "Live", color: "#ff6038" },
      ],
    },
  },
  {
    id: "human-handoff",
    eyebrow: "Zero Risk Escalation",
    title: "AI knows when to bring\nyour people into the loop",
    description:
      "When a question requires human judgment or custom discretion, Elpino transfers the thread with full historical context. Handing a conversation over never costs extra.",
    icon: Users,
    accent: "#8557e8",
    previewType: "handoff",
    previewData: {
      step1: "Customer query submitted",
      step2: "Confidence evaluation & policy check",
      step3: "Seamless teammate takeover with full thread",
    },
  },
  {
    id: "audit-trail",
    eyebrow: "Transparency",
    title: "Verified answer ledger\nbehind every single reply",
    description:
      "Every answer Elpino generates keeps an immutable audit trail: the exact policy version referenced, knowledge source document, and timestamp.",
    icon: BookOpenCheck,
    accent: "#32a880",
    previewType: "audit",
    previewData: {
      policy: "Refund & Cancellation Policy · v3.2",
      source: "Billing Knowledge Base",
      timestamp: "Today · 10:42:08 UTC",
    },
  },
  {
    id: "knowledge-sync",
    eyebrow: "Dynamic Grounding",
    title: "Multi-source knowledge\nready in seconds",
    description:
      "Connect your public documentation, Notion pages, and PDF product manuals. High-dimensional vector search retrieves exact context chunks in milliseconds.",
    icon: BookOpen,
    accent: "#fe9238",
    previewType: "sources",
    previewData: {
      sources: ["Help Center Articles", "Website Documentation", "Uploaded PDFs & Guides"],
    },
  },
  {
    id: "visitor-intel",
    eyebrow: "Customer Intelligence",
    title: "Real-time context\nalongside every ticket",
    description:
      "See visitor geolocation, current page path, browser environment, and past conversation history so your agents can provide personal, high-speed help.",
    icon: Globe,
    accent: "#168cff",
    previewType: "intel",
    previewData: {
      tags: ["London, UK", "Desktop · Chrome", "Page: /checkout", "Returning Customer"],
    },
  },
];

const stats = [
  {
    value: "1,000+",
    label: "Conversations resolved",
    heading: "Fewer tickets in the queue",
    description: "Every question Elpino safely answers never becomes a backlog item for your team.",
    icon: MessagesSquare,
    accent: "#ff6038",
  },
  {
    value: "<5s",
    label: "Average response time",
    heading: "Speed customers notice",
    description: "No hold music or queue delays — answers arrive while the visitor is still on page.",
    icon: Clock3,
    accent: "#168cff",
  },
  {
    value: "24/7",
    label: "Continuous coverage",
    heading: "Support that never sleeps",
    description: "Nights, weekends, and global time zones — your support remains active and compliant.",
    icon: MoonStar,
    accent: "#8557e8",
  },
];

const safeguards = [
  { icon: BookOpenCheck, title: "Grounded Answers", detail: "Only replies using your verified knowledge docs" },
  { icon: UserRoundCheck, title: "Zero-Risk Handoff", detail: "Uncertain or sensitive questions escalate to humans" },
  { icon: Gauge, title: "Resolution Quotas", detail: "Hard caps ensure zero surprise overage fees" },
  { icon: LockKeyhole, title: "Data Minimization", detail: "Encrypted transmission with no public model training" },
  { icon: ShieldCheck, title: "Answer Audit Trail", detail: "Sources and policies stay permanently reviewable" },
];

export function FeaturesContent() {
  const [activeScenario, setActiveScenario] = useState(0);
  const reduced = useReducedMotion();
  const scenario = heroScenarios[activeScenario];

  return (
    <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#17191c]">
      {/* 1. HERO SECTION (DARK ELEGANT HOME STYLE) */}
      <section className="relative overflow-hidden bg-black pb-20 pt-16 font-[family-name:var(--font-rethink-sans)] text-white sm:pb-28 sm:pt-24 lg:pt-28">
        {/* Top Announcement Ribbon */}
        <div className="mx-auto flex max-w-7xl justify-center px-5">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff7958] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6038]" />
            </span>
            <span>The Elpino Support Engine — Built for answers, not seats</span>
            <ArrowRight size={13} className="text-white/60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Hero Headlines */}
        <div className="mx-auto max-w-4xl px-5 pt-10 text-center sm:px-8">
          <h1 className="text-[clamp(2.7rem,5.5vw,5.5rem)] font-normal leading-[1.02] tracking-[-0.04em] text-white">
            Built to answer. <br />
            <span className="text-[#58a9ff]">Designed to escalate.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[50ch] text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            AI answers from your knowledge base in seconds, a shared team inbox, and automatic human handoff the moment a question needs a person.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-md bg-[#fe9238] px-7 text-[15px] font-semibold text-black transition duration-200 hover:brightness-95 active:translate-y-px"
            >
              Start for free <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#interactive-demo"
              className="inline-flex h-12 min-h-12 items-center justify-center rounded-md border border-white/30 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              Explore workspace demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/45">50 AI conversations free each month · No credit card required</p>
        </div>

        {/* 2. INTERACTIVE WORKSPACE CANVAS */}
        <div id="interactive-demo" className="relative mx-auto mt-14 max-w-6xl px-5 sm:px-8">
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_25%_20%,#fc7b33_0%,transparent_55%),radial-gradient(circle_at_75%_30%,#7060bd_0%,transparent_55%),radial-gradient(circle_at_50%_90%,#428ce5_0%,transparent_50%)] opacity-40 blur-3xl"
          />

          {/* Tab Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {heroScenarios.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeScenario === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveScenario(idx)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      isActive
                        ? "border-white bg-white text-black shadow-sm"
                        : "border-white/15 bg-white/5 text-white/75 hover:border-white/40 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-[#ff6038]" : "text-white/60"} />
                    {item.tabLabel}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-medium text-white/40">Interactive Product Preview</span>
          </div>

          {/* Interactive Coded Frame */}
          <div
            className="relative overflow-hidden rounded-2xl border border-[#2a2c31] text-left shadow-[0_35px_90px_rgba(0,0,0,0.6)]"
            style={{ backgroundColor: "#17181c" }}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-[#2a2c31] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#5c666f] text-[10px] font-bold text-white">
                  {scenario.customer.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{scenario.customer.name}</p>
                  <p className="text-[11px] text-[#8a8f98]">Live Chat Widget · {scenario.customer.time}</p>
                </div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${scenario.badgeColor}`}>
                {scenario.system.status}
              </span>
            </div>

            {/* Conversation Body */}
            <div className="min-h-[290px] p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scenario.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Customer Message */}
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#5c666f] text-[10px] font-bold text-white">
                      {scenario.customer.initials}
                    </span>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#22252a] px-5 py-3.5 text-sm leading-relaxed text-[#c6cbce]">
                      {scenario.customer.question}
                    </div>
                  </div>

                  {/* System/AI Response */}
                  <div className="flex flex-row-reverse items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#428ce5]">
                      <Image src="/icon.png" alt="" width={28} height={28} className="h-full w-full object-contain" />
                    </span>
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#1e2738] border border-[#168cff]/20 px-5 py-3.5 text-sm leading-relaxed text-white">
                      <p>{scenario.system.reply}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5 text-[11px] text-[#8ac5ff]">
                        <BookOpenCheck size={13} />
                        <span>{scenario.system.source}</span>
                        <span className="ml-auto text-[10px] text-white/50">{scenario.system.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Chips if available */}
                  {scenario.system.metadata && (
                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                      {scenario.system.metadata.map((meta) => (
                        <span key={meta} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/70">
                          {meta}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="border-t border-[#2a2c31] px-5 py-3.5">
              <div className="flex items-center justify-between rounded-xl border border-[#2a2c31] bg-[#111215] px-4 py-2.5 text-xs text-[#8a8f98]">
                <span>Write a response or assign thread…</span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#428ce5] text-white">
                  <Send size={13} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIX CORE CAPABILITIES GRID (EDITORIAL CLEAN WHITE) */}
      <section className="bg-[#fffdfa] px-5 py-24 sm:px-8 sm:py-32 lg:px-[4.2vw]">
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6038]">
              <span className="h-px w-6 bg-[#ff6038]" /> The Complete Toolkit <span className="h-px w-6 bg-[#ff6038]" />
            </div>
            <h2 className="mx-auto mt-4 max-w-[900px] text-[clamp(2.6rem,5vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.055em]">
              Everything your AI and team need. <br />
              <span className="text-[#168cff]">In one unified workspace.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[620px] text-base leading-7 text-[#17191c]/60 sm:text-lg">
              No disconnected widgets or complex ticketing pipelines. From first visitor greeting to full human resolution, Elpino keeps context together.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#17191c]/10 bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#17191c]/25 hover:shadow-lg sm:p-8"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#17191c]/45">{card.eyebrow}</span>
                      <span
                        className="flex size-10 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                        style={{ backgroundColor: card.accent }}
                      >
                        <Icon size={19} />
                      </span>
                    </div>

                    <h3 className="mt-6 whitespace-pre-line text-2xl font-semibold leading-tight tracking-tight text-[#17191c]">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#17191c]/60">{card.description}</p>
                  </div>

                  {/* Coded Mini Preview inside each card */}
                  <div className="mt-8 rounded-xl border border-[#17191c]/8 bg-[#f9fafb] p-4 text-xs">
                    {card.previewType === "chat" && card.previewData && (
                      <div className="space-y-2">
                        <div className="rounded-lg bg-white p-2.5 shadow-2xs border border-[#17191c]/5 text-[11px] font-medium text-[#17191c]">
                          &ldquo;{card.previewData.question}&rdquo;
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                          <CheckCheck size={12} /> {card.previewData.source}
                        </div>
                      </div>
                    )}

                    {card.previewType === "inbox" && card.previewData && (
                      <div className="space-y-1.5">
                        {card.previewData.threads?.map((th) => (
                          <div key={th.name} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-[#17191c]/5 text-[11px]">
                            <span className="font-semibold text-[#17191c] truncate">{th.name}</span>
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ color: th.color, backgroundColor: `${th.color}15` }}>
                              {th.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {card.previewType === "handoff" && (
                      <div className="space-y-1.5 text-[11px] text-[#17191c]/75">
                        <div className="flex items-center gap-2">
                          <span className="flex size-4 items-center justify-center rounded-full bg-[#8557e8] text-[9px] text-white">1</span>
                          <span>Inquiry submitted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex size-4 items-center justify-center rounded-full bg-[#8557e8] text-[9px] text-white">2</span>
                          <span>Reasoning & policy evaluation</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 font-medium">
                          <Check size={12} />
                          <span>Teammate picks up with context</span>
                        </div>
                      </div>
                    )}

                    {card.previewType === "audit" && card.previewData && (
                      <div className="space-y-1.5 text-[10px] text-[#17191c]/70">
                        <div className="flex items-center justify-between border-b border-[#17191c]/5 pb-1">
                          <span className="text-[#17191c]/40">Policy</span>
                          <span className="font-semibold text-[#17191c]">{card.previewData.policy}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#17191c]/40">Status</span>
                          <span className="font-semibold text-emerald-600">Verified & Logged</span>
                        </div>
                      </div>
                    )}

                    {card.previewType === "sources" && card.previewData && (
                      <div className="flex flex-wrap gap-1.5">
                        {card.previewData.sources?.map((src) => (
                          <span key={src} className="rounded-md border border-[#17191c]/10 bg-white px-2 py-1 text-[10px] font-medium text-[#17191c]/80">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {card.previewType === "intel" && card.previewData && (
                      <div className="flex flex-wrap gap-1.5">
                        {card.previewData.tags?.map((tag) => (
                          <span key={tag} className="rounded-md bg-[#168cff]/10 text-[#168cff] px-2 py-1 text-[10px] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. ANSWER RECORD & AUDIT LEDGER (EDITORIAL WARM BACKGROUND) */}
      <section className="relative overflow-hidden bg-[#f7f5f0] px-5 py-24 sm:px-8 sm:py-32 lg:px-[4.2vw]">
        <div aria-hidden="true" className="absolute -left-40 bottom-[-18rem] size-[34rem] rounded-full bg-[#8557e8]/12 blur-[110px]" />
        <div aria-hidden="true" className="absolute -right-36 top-[-15rem] size-[38rem] rounded-full bg-[#168cff]/12 blur-[120px]" />

        <div className="relative mx-auto max-w-[1500px]">
          <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 xl:gap-28">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-8 bg-[#ff6038]" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff7958]">Answer Integrity</p>
              </div>
              <h2 className="max-w-[780px] text-[clamp(2.8rem,5.5vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.06em]">
                Numbers your team can <span className="text-[#58a9ff]">stand behind.</span>
              </h2>
              <p className="mt-8 max-w-[55ch] text-base leading-7 text-[#17191c]/65 sm:text-lg sm:leading-8">
                Every reply Elpino sends is logged against an approved policy, a knowledge source, and a timestamp — so when someone asks &ldquo;why did it say that?&rdquo;, the verified trail is already sitting in the conversation.
              </p>
              <Link
                href="/signup"
                className="group mt-9 inline-flex min-h-13 items-center gap-4 rounded-full bg-[#17191c] py-3 pl-6 pr-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#ff6038]"
              >
                Start for free
                <span className="flex size-8 items-center justify-center rounded-full bg-[#151713] text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            </div>

            {/* Answer Record Ledger Card */}
            <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
              <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-[#168cff]/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[26px] border border-[#17191c]/10 bg-white shadow-[0_30px_90px_rgba(32,39,55,0.14)]">
                <div className="flex items-center justify-between border-b border-[#17191c]/8 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#ff6038] text-white">
                      <ShieldCheck size={18} strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#17191c]">Answer record</p>
                      <p className="text-[11px] text-[#17191c]/45">Conversation #1048</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#168cff]/30 bg-[#168cff]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8ac5ff]">
                    <span className="size-1.5 rounded-full bg-[#168cff] shadow-[0_0_10px_#168cff]" />
                    Verified
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="rounded-2xl rounded-bl-sm bg-[#f0f2f5] px-4 py-3.5 text-sm leading-6 text-[#17191c]/75">
                    How long do I have to request a refund?
                  </div>
                  <div className="ml-7 mt-3 rounded-2xl rounded-br-sm bg-[#f3f0e8] px-4 py-3.5 text-sm leading-6 text-[#20231f] sm:ml-12">
                    You can request a refund within 30 days of your purchase. I can connect you with our team if you need assistance processing one.
                  </div>

                  <div className="relative mt-7 pl-5 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-[#17191c]/10">
                    {[
                      { icon: ShieldCheck, label: "Policy", value: "Refund policy · v3.2" },
                      { icon: BookOpenCheck, label: "Source", value: "Billing & refunds doc" },
                      { icon: Clock3, label: "Answered", value: "Today · 10:42:08 UTC" },
                    ].map((item) => (
                      <div key={item.label} className="relative flex items-center gap-3 py-2.5">
                        <span className="absolute -left-5 size-[11px] rounded-full border-2 border-white bg-[#ff6038]" />
                        <item.icon size={16} className="shrink-0 text-[#17191c]/40" />
                        <span className="w-[60px] text-[11px] uppercase tracking-[0.1em] text-[#17191c]/40">{item.label}</span>
                        <span className="truncate text-xs font-medium text-[#17191c]/80 sm:text-sm">{item.value}</span>
                        <Check size={14} className="ml-auto shrink-0 text-[#168cff]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-24 grid gap-14 md:grid-cols-3 md:gap-9 lg:mt-32 lg:gap-16">
            {stats.map((stat, index) => (
              <article
                key={stat.label}
                className={`group relative min-h-[280px] ${index === 1 ? "md:translate-y-12" : index === 2 ? "md:translate-y-6" : ""}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -left-6 top-3 size-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
                  style={{ backgroundColor: stat.accent }}
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-5 border-t border-[#17191c]/15 pt-6">
                    <div>
                      <p className="text-[clamp(3.5rem,6.5vw,6.5rem)] font-medium leading-none tracking-[-0.075em]" style={{ color: stat.accent }}>
                        {stat.value}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#17191c]/45">{stat.label}</p>
                    </div>
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#151713] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                      style={{ backgroundColor: stat.accent }}
                    >
                      <stat.icon size={19} />
                    </span>
                  </div>
                  <div className="mt-auto pt-10">
                    <h3 className="text-xl font-medium leading-tight tracking-tight sm:text-2xl">{stat.heading}</h3>
                    <p className="mt-3 max-w-[36ch] text-sm leading-6 text-[#17191c]/60">{stat.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SAFEGUARDS SECTION */}
      <section className="border-t border-[#17191c]/10 bg-[#f4f1eb] px-5 py-24 sm:px-8 sm:py-32 lg:px-[4.2vw]">
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8557e8]">Built into every conversation</p>
            <h2 className="mx-auto mt-4 max-w-[900px] text-[clamp(2.6rem,4.8vw,5rem)] font-medium leading-[0.96] tracking-[-0.055em]">
              Support that stays <span className="text-[#ff6038]">inside the lines.</span>
            </h2>
          </div>
          <div className="mt-16 grid gap-x-10 gap-y-12 border-t border-[#17191c]/14 pt-8 sm:grid-cols-2 lg:grid-cols-5">
            {safeguards.map((item, index) => (
              <div key={item.title} className="flex min-h-[180px] flex-col">
                <item.icon size={25} strokeWidth={1.7} style={{ color: ["#ff6038", "#168cff", "#8557e8", "#ff6038", "#168cff"][index] }} />
                <div className="mt-auto pt-8">
                  <h3 className="text-lg font-medium text-[#17191c]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#17191c]/55">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="relative overflow-hidden bg-[#edf3ff] px-5 py-24 text-center text-[#17191c] sm:px-8 sm:py-32">
        <div aria-hidden="true" className="absolute left-[18%] top-[-8rem] size-72 rounded-full bg-[#8557e8]/20 blur-[90px]" />
        <div aria-hidden="true" className="absolute bottom-[-10rem] right-[18%] size-80 rounded-full bg-[#ff6038]/18 blur-[100px]" />
        <div className="relative mx-auto max-w-[920px]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8557e8]">Start with your next question</p>
          <h2 className="mt-4 text-[clamp(3rem,6vw,6.4rem)] font-medium leading-[0.92] tracking-[-0.065em]">
            Turn support questions into <span className="text-[#168cff]">resolved conversations.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-base leading-7 text-[#17191c]/60 sm:text-lg">
            Bring your knowledge docs, connect the chat widget, and let Elpino handle your first 50 AI conversations free.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex min-h-13 items-center gap-4 rounded-full bg-[#ff6038] py-3 pl-7 pr-3 text-sm font-semibold text-white transition hover:bg-[#e84b25]"
            >
              Start for free
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#ff6038] transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-13 items-center rounded-full border border-[#17191c]/20 px-7 text-sm font-semibold transition hover:border-[#17191c]"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#17191c]/45">No credit card required · Two seats included</p>
        </div>
      </section>
    </div>
  );
}
