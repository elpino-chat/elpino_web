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
  Command,
  Languages,
  UserCheck,
  Tag,
  CornerDownLeft,
} from "lucide-react";

export function CopilotClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "31%",
      label: "Faster ticket handle time",
      detail: "instant drafted replies grounded in knowledge docs",
    },
    {
      value: "88.6%",
      label: "Copilot draft acceptance rate",
      detail: "approved by human support operators without edits",
    },
    {
      value: "2m 14s",
      label: "Time saved per conversation",
      detail: "no more digging through outdated wiki pages",
    },
    {
      value: "45+",
      label: "Languages translated live",
      detail: "real-time drafting in the customer's native language",
    },
  ];

  const valuePillars = [
    {
      icon: Sparkles,
      title: "Start with a verified draft",
      description:
        "Copilot reviews customer inquiry details, queries your Knowledge Hub, and pre-populates the composer with a polite, accurate, citation-backed draft ready for 1-click approval.",
      badge: "1-Click Draft",
    },
    {
      icon: Clock,
      title: "Instant thread summarization",
      description:
        "Stepping into a 30-message ticket thread? Copilot synthesizes the issue into 3 bullet points: what happened, what was tried, and what next action is required.",
      badge: "Catch Up Instantly",
    },
    {
      icon: Search,
      title: "Contextual telemetry sidebar",
      description:
        "Surface customer MRR, lifetime spend, active plan tier, browser console errors, and Linear engineering bug status without switching browser tabs.",
      badge: "Zero Tab Switching",
    },
    {
      icon: UserCheck,
      title: "Keeps human agents in control",
      description:
        "Every AI suggestion is a starting point. Your teammate can edit the text, change tone, add internal whisper notes, or take an alternative path.",
      badge: "Human Judgment",
    },
  ];

  const simulations = [
    {
      id: "billing",
      title: "Billing Dispute Triage",
      icon: Sparkles,
      customer: "Amara Miller · DataPulse AI ($3,800/mo)",
      query: "Hi, I was charged twice for our annual workspace subscription. Can you verify what happened?",
      copilotBadge: "Confidence: 99% · 2 Sources Checked",
      copilotDraft:
        "I’m sorry for the confusion, Amara! I checked your Stripe billing ledger: one charge was a temporary authorization hold that drops off within 24 hours, and the other is your active annual invoice. I will monitor it and follow up if the pending hold doesn't release automatically.",
      citation: "Stripe Connector · cus_9824 Active · Billing Policy v2.1",
      action: "Accept & Send [Tab]",
      secondary: "Adjust Tone (Casual / Formal)",
    },
    {
      id: "diagnostics",
      title: "API Error Troubleshooting",
      icon: Database,
      customer: "David Chen · VP Engineering at CloudScale",
      query: "Our webhook endpoint returned HTTP 504 on invoice.payment_succeeded. Does your system automatically retry?",
      copilotBadge: "Confidence: 98% · API Docs Grounded",
      copilotDraft:
        "Yes! Elpino implements exponential backoff with randomized jitter across 5 retry attempts over 24 hours (1m, 5m, 30m, 2h, and 8h). You can also replay the dropped webhook payload directly under Settings → Webhooks → Failed Payloads.",
      citation: "docs.elpino.chat/api/webhooks#retry-policy",
      action: "Insert Draft (Tab)",
      secondary: "Include Diagnostic Curl Command",
    },
    {
      id: "summary",
      title: "Long Thread Summarization",
      icon: Clock,
      customer: "Marcus Vance · Stripe Partner Team",
      query: "[Thread with 22 messages across 3 days regarding Okta SAML 2.0 SCIM integration]",
      copilotBadge: "Copilot Synthesis Engine",
      copilotDraft:
        "Summary: Customer needs automated SCIM 2.0 user deprovisioning via Okta. Teammate Sarah provided initial credentials, but customer encountered '401 Unauthorized' on token refresh. Recommended Action: Generate a fresh SCIM bearer token under Security → Tokens.",
      citation: "Synthesized from 22 customer messages",
      action: "Post Private Whisper Note",
      secondary: "Reply to Customer",
    },
    {
      id: "multilingual",
      title: "Multilingual Communication",
      icon: Globe,
      customer: "Kenji Sato · Tokyo FinTech",
      query: "請求書払いで年次契約を締結したいのですが、見積書（Quote）を発行していただけますか？",
      copilotBadge: "Auto-Translated from Japanese",
      copilotDraft:
        "こんにちは佐藤様！はい、年次契約の見積書（Quote）をPDFで即時発行可能です。貴社の請求先住所とお支払い担当者様のメールアドレスをお知らせいただけますでしょうか。(Drafted in native Japanese)",
      citation: "Billing Guidelines · Enterprise Invoicing",
      action: "Send Japanese Response",
      secondary: "View English Back-Translation",
    },
  ];

  const faqs = [
    {
      q: "What is Elpino Copilot?",
      a: "Elpino Copilot is an AI assistant embedded directly inside your team's shared support inbox. It reads incoming customer questions, surfaces relevant knowledge base documentation and customer telemetry, and pre-drafts accurate answers for human agents to review and send with a single keystroke (Tab).",
    },
    {
      q: "How does Copilot reduce average handle time?",
      a: "Support agents typically spend 40% of their time searching internal wikis, copying boilerplate text, and looking up customer account records. Copilot eliminates this busywork by automatically drafting the response and surfacing billing/tech context alongside the conversation.",
    },
    {
      q: "Can agents edit Copilot's suggested replies?",
      a: "Yes. Every Copilot suggestion is fully editable. Agents can modify the wording, adjust the tone (formal, empathetic, concise), or discard the draft entirely.",
    },
    {
      q: "Does Copilot learn from past high-rated conversations?",
      a: "Yes. Copilot indexes previous conversations that earned 5-star customer CSAT ratings. When a recurring question arises, Copilot replicates the phrasing and solution that previously delighted customers.",
    },
  ];

  const activeSimulation = simulations[activeTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino / AI Agent Copilot
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                A better answer,{" "}
                <span className="italic text-[#ff5600]">ready when your team is.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Give every support teammate a practical AI partner that surfaces customer context,
                drafts thoughtful replies grounded in your Knowledge Hub, and leaves the final call
                with a human.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-black"
                >
                  Start with Copilot free
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 text-base font-medium text-black transition hover:bg-black/5"
                >
                  Book team demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 31% faster handle time
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 1-click Tab approvals
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero model training
                </span>
              </div>
            </div>

            {/* Picture Display: Busy Teams Sloth */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Copilot Live Assistant
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Draft Ready (Tab)
                    </span>
                  </div>

                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/busy-teams-sloth-v2.png"
                      alt="Support Teammate Copilot Sloth"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Handle Time Saved
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">31% Faster</div>
                      <div className="text-[11px] text-[#18c983] font-medium">-2m 14s per ticket</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Draft Acceptance
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">88.6%</div>
                      <div className="text-[11px] text-black/50">Approved without edits</div>
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

      {/* 3. VALUE PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Empowered Human Agents
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Give agents less searching and more time to solve.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Copilot brings all the relevant knowledge, past tickets, and account telemetry directly
              into the conversation composer so agents can deliver empathetic, accurate assistance.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valuePillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-black/25 hover:shadow-xl hover:bg-white"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#ff5600] text-white shadow-sm">
                    <Icon size={20} />
                  </div>
                  <span className="inline-block mt-5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#ff5600]">
                    {p.badge}
                  </span>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-black">{p.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-black/65">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE COPILOT SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Test Drive
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience Copilot inside the inbox.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through real-world support interactions below to see how Copilot assists human
              agents with billing disputes, API troubleshooting, thread summarization, and translation.
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
                  <span>{activeSimulation.title}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    {activeSimulation.copilotBadge}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">Customer: {activeSimulation.customer}</div>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 font-mono">
                Press [Tab] to Approve
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Incoming Customer Message
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "{activeSimulation.query}"
                </p>
              </div>

              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Copilot Suggested Draft</span>
                  <span className="font-mono text-white/40 text-[10px]">{activeSimulation.citation}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSimulation.copilotDraft}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5 text-xs text-white/60">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-[#ff5600] px-5 py-2 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                  >
                    {activeSimulation.action}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10 transition text-xs"
                  >
                    {activeSimulation.secondary}
                  </button>
                </div>
                <span className="font-mono text-[11px]">Human teammate in full control</span>
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
              Everything you need to know about Elpino Copilot.
            </h2>
            <p className="mt-4 text-base text-black/60">
              How Copilot works, accuracy guardrails, and teammate approval workflows.
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
            AI Assistant for Human Operators
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Give your agents superhuman support speed.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Equip your team with Elpino Copilot in minutes with
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
