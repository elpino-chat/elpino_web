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
  BookOpenCheck,
  ClipboardCheck,
  UserRoundCheck,
  MessageSquareText,
  FileSearch,
  CircleAlert,
  Headphones,
  Scale,
} from "lucide-react";

export function AiAgentClient() {
  const [activeSim, setActiveSim] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "76%+",
      label: "Autonomous resolution rate",
      detail: "resolved end-to-end with zero human agent escalation",
    },
    {
      value: "< 240ms",
      label: "Vector retrieval & response latency",
      detail: "instant answers with verified policy citations",
    },
    {
      value: "99.4%",
      label: "Answer factual accuracy",
      detail: "grounded strictly in your approved Knowledge Hub",
    },
    {
      value: "0%",
      label: "Model training on your data",
      detail: "enterprise privacy with zero data retention agreements",
    },
  ];

  const agentPillars = [
    {
      icon: BookOpenCheck,
      title: "Grounded in verified truth",
      tag: "Zero Hallucinations",
      description:
        "The AI Agent only answers using the documentation, help center articles, Notion pages, and PDF manuals you approve. If it cannot verify a claim, it escalates.",
      badge: "Knowledge Grounded",
    },
    {
      icon: ClipboardCheck,
      title: "Guided by operational guardrails",
      tag: "Deterministic Rules",
      description:
        "Define exact boundaries for refunds, plan upgrades, and sensitive account access. The AI executes actions within approved limits and requests human sign-off for exceptions.",
      badge: "Strict Guardrails",
    },
    {
      icon: UserRoundCheck,
      title: "Graceful teammate escalation",
      tag: "Continuous Context",
      description:
        "When an issue requires human empathy, specialized judgment, or custom billing changes, Elpino routes the thread to your human inbox with a complete summary.",
      badge: "Zero Dropped Threads",
    },
    {
      icon: Scale,
      title: "Resolution-based pricing",
      tag: "Value Aligned",
      description:
        "Stop paying for unused agent seats. Elpino aligns incentives: you only pay when the AI successfully and completely resolves a customer's inquiry.",
      badge: "Pay for Results",
    },
  ];

  const simulations = [
    {
      id: "policy",
      title: "Policy & Account Actions",
      icon: BookOpenCheck,
      query: "Can I update the delivery address for order #ELP-8924? It has not shipped yet.",
      category: "Order Fulfillment · High Confidence (99%)",
      reasoning: "Matched Delivery & Shipping Policy v3.2. Order status checked via Shopify connector: Status: Unfulfilled.",
      aiResponse:
        "Yes! Since order #ELP-8924 is still unfulfilled at our fulfillment center, I can update the destination. Please reply with your updated shipping address and postal code, and I will confirm the modification immediately.",
      citation: "docs.elpino.chat/fulfillment/address-changes",
      status: "Resolved in 210ms · Grounded in Policy",
    },
    {
      id: "api",
      title: "Technical API & Webhook Inquiries",
      icon: Database,
      query: "Does Elpino support automated retry backoff when our webhook consumer returns HTTP 429?",
      category: "Developer Documentation · High Confidence (98%)",
      reasoning: "Retrieved webhook retry specification. Exponential backoff with jitter confirmed across 5 retry attempts.",
      aiResponse:
        "Yes! Elpino implements automated exponential backoff with randomized jitter across 5 retry attempts over 24 hours (1m, 5m, 30m, 2h, and 8h). You can also replay failed payloads manually from Settings → Webhooks.",
      citation: "docs.elpino.chat/api/webhooks#retries",
      status: "Resolved in 260ms · API Spec Verified",
    },
    {
      id: "escalate",
      title: "Intelligent Human Handoff",
      icon: UserRoundCheck,
      query: "Our enterprise contract expires in 3 days and we need custom wire invoice terms for our European subsidiary.",
      category: "Enterprise Finance & Legal · Escalation Triggered",
      reasoning: "Inquiry involves custom enterprise contractual terms ($50k+ ARR). Triggering graceful handoff to Jordan (Finance Lead).",
      aiResponse:
        "I'm connecting you directly with Jordan Miller from our Enterprise Billing team. I've attached your current contract history and European subsidiary details so you won't need to repeat yourself.",
      citation: "Internal Routing Rule: Enterprise Contract Renewals > $20k ARR",
      status: "Handed off to Jordan in 14s · Full Context Attached",
    },
    {
      id: "multilingual",
      title: "Multilingual Resolution",
      icon: Globe,
      query: "こんにちは。SAML SSO の設定を行いたいのですが、OktaのSCIMグループ同期に対応していますか？",
      category: "International Support (Japanese) · High Confidence",
      reasoning: "Detected Japanese query. Retrieved English documentation on SAML 2.0 / SCIM 2.0 Okta integration and formulated native response.",
      aiResponse:
        "こんにちは！はい、ElpinoはSAML 2.0およびOkta SCIM 2.0グループ同期にネイティブ対応しています。[設定] → [認証] → [SCIM] からOktaプロビジョニングトークンを発行していただけます。(Grounded in Security Docs)",
      citation: "docs.elpino.chat/security/saml-scim",
      status: "Auto-Translated & Resolved in 310ms",
    },
  ];

  const faqs = [
    {
      q: "How does the Elpino AI Agent avoid hallucinations?",
      a: "Elpino uses deterministic retrieval-augmented generation (RAG) tied strictly to your approved Knowledge Hub. Before generating a response, the AI agent retrieves exact text paragraphs, validates confidence thresholds (typically 95%+), and refuses to invent facts. If the answer cannot be verified with explicit citations, the AI gracefully escalates to a human teammate.",
    },
    {
      q: "What content can the AI Agent use to answer customer questions?",
      a: "The AI Agent connects to Notion workspaces, Zendesk help centers, Confluence docs, public web sitemaps, uploaded PDF manuals, and canned snippet macros. You have granular control over which specific documents the AI Agent is allowed to cite.",
    },
    {
      q: "How does the AI Agent know when to hand off to a human?",
      a: "You define clear handoff criteria based on customer sentiment, inquiry topic (e.g. legal disputes, billing cancellations, enterprise custom pricing), customer ARR tier, or when the AI's confidence score drops below your set threshold.",
    },
    {
      q: "Is our proprietary data used to train generalized AI models?",
      a: "No. Elpino maintains strict zero-retention enterprise agreements with foundational model providers. Your support conversations, customer metadata, and internal knowledge docs are never used to train public LLMs.",
    },
    {
      q: "How does resolution-based pricing work?",
      a: "Unlike legacy platforms that penalize you with expensive per-seat charges, Elpino offers unlimited teammate seats. You only pay when our AI Agent successfully and completely resolves a customer's inquiry without human intervention.",
    },
  ];

  const activeSimulation = simulations[activeSim];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino / Autonomous AI Customer Agent
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                The AI customer support agent that knows when to help—
                <span className="italic text-[#ff5600]">and when to hand off.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Elpino turns the knowledge and rules you already trust into fast, grounded customer
                conversations. Resolve 76%+ of incoming tickets autonomously, with clear operational
                boundaries and human teammates ready for the exceptions.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-black"
                >
                  Deploy AI Agent free
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
                  <Check size={14} className="text-[#18c983]" /> Pay per resolution, not per seat
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero model training
                </span>
              </div>
            </div>

            {/* Featured Picture Display: Founders Sloth */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Autonomous AI Core
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      76.4% Autonomous Deflection
                    </span>
                  </div>

                  <div className="relative mt-4 h-[340px] w-full overflow-hidden rounded-2xl border border-black/5 bg-white sm:h-[420px]">
                    <Image
                      src="/images/founders-sloth-v2.png"
                      alt="Elpino AI Agent In Action"
                      fill
                      className="object-cover object-center"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Response Latency
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">240ms</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Sub-second execution</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Citation Ledger
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">100% Grounded</div>
                      <div className="text-[11px] text-black/50">Verified source links</div>
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

      {/* 3. FOUR CORE AI AGENT PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Careful Support Engineering
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              More than a bot. A dependable first line of defense.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Generic chatbot tools make wild guesses and embarrass your brand. Elpino AI Agent
              operates under strict mathematical grounding and proven business logic.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {agentPillars.map((p) => {
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
                    {p.tag}
                  </span>

                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-black">
                    {p.title}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-black/65">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE AI AGENT SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Live Simulation
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Watch the AI Agent reason in real time.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through operational customer scenarios to see how Elpino matches policy docs,
              verifies API specs, translates across languages, and escalates edge cases.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {simulations.map((sim, idx) => {
              const Icon = sim.icon;
              return (
                <button
                  key={sim.id}
                  type="button"
                  onClick={() => setActiveSim(idx)}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
                    activeSim === idx
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
                    {activeSimulation.category}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  Internal Reasoning Engine: {activeSimulation.reasoning}
                </div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSimulation.status}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Inbound Customer Inquiry
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "{activeSimulation.query}"
                </p>
              </div>

              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Elpino Autonomous Resolution</span>
                  <span className="font-mono text-white/40 text-[10px]">{activeSimulation.citation}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSimulation.aiResponse}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                <span>Verified against approved Knowledge Hub documentation</span>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff5600] px-4 py-1.5 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  Deploy in your workspace →
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
              Understanding the Elpino AI Agent.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Clear technical details on hallucinations, security, guardrails, and resolution pricing.
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
            Autonomous Customer Support
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Give customers answers in seconds, not hours.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect live chat, support email, and your knowledge
            docs in minutes with zero credit card required.
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
