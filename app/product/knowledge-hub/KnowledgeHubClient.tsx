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
  ToggleLeft,
  ToggleRight,
  Link2,
} from "lucide-react";

export function KnowledgeHubClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>("all");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    saml_public: true,
    saml_ai: true,
    saml_copilot: true,
    webhook_public: true,
    webhook_ai: true,
    webhook_copilot: true,
    outage_public: false,
    outage_ai: false,
    outage_copilot: true,
  });

  const stats = [
    {
      value: "76%+",
      label: "Autonomous AI resolution rate",
      detail: "powered by verified vector-grounded articles",
    },
    {
      value: "15+",
      label: "Connected knowledge sources",
      detail: "Notion, Zendesk, Confluence, PDFs, and Web URLs",
    },
    {
      value: "< 50ms",
      label: "Vector retrieval latency",
      detail: "semantic chunk retrieval for live AI responses",
    },
    {
      value: "45+",
      label: "Languages indexed & translated",
      detail: "serve global customers in their native language",
    },
  ];

  const valuePillars = [
    {
      icon: BookOpen,
      title: "Content creation",
      description:
        "Author public Help Center articles, internal runbooks, and reusable conversation snippets directly in Elpino with a powerful, collaborative markdown editor.",
    },
    {
      icon: FolderOpen,
      title: "Content management",
      description:
        "Organize thousands of documents across custom folders and subfolders. Search and filter by source, author, update date, and AI availability status.",
    },
    {
      icon: Sparkles,
      title: "Content optimization",
      description:
        "Spot content gaps automatically from unresolved customer conversations. Review which articles drive the highest deflection and refine underperforming answers.",
    },
  ];

  const sourcesList = [
    {
      name: "Notion Workspaces",
      category: "Internal Wiki",
      status: "Synced · 420 pages",
      latency: "Real-time webhook sync",
      icon: FileText,
      color: "bg-black text-white",
    },
    {
      name: "Zendesk & Help Center",
      category: "Public Support",
      status: "Imported · 680 articles",
      latency: "Auto-synced hourly",
      icon: HelpCircle,
      color: "bg-[#428ce5] text-white",
    },
    {
      name: "Confluence & Jira",
      category: "Engineering Docs",
      status: "Connected · 185 spaces",
      latency: "Bi-directional sync",
      icon: Database,
      color: "bg-[#18c983] text-[#233d4d]",
    },
    {
      name: "PDF Manuals & Specs",
      category: "Static Documents",
      status: "Ingested · 80 PDFs",
      latency: "Chunked & embedded",
      icon: FileSpreadsheet,
      color: "bg-[#ff5600] text-white",
    },
    {
      name: "Public Web Sitemaps",
      category: "Website Crawl",
      status: "Active · 300 URLs",
      latency: "Weekly auto-crawl",
      icon: Globe,
      color: "bg-[#d9bef4] text-[#233d4d]",
    },
    {
      name: "Conversation Snippets",
      category: "Canned Macros",
      status: "Native · 140 snippets",
      latency: "Instant availability",
      icon: MessageSquare,
      color: "bg-[#fcbb00] text-black",
    },
  ];

  const articlesData = [
    {
      id: "saml",
      title: "Configuring SAML 2.0 & Okta SCIM Group Provisioning",
      category: "Authentication & Security",
      source: "Notion Wiki",
      resolutionRate: "99.2%",
      citations: "1,420 conversations",
      lastUpdated: "4 hours ago",
      publicAvailable: true,
      aiAgentAvailable: true,
      copilotAvailable: true,
    },
    {
      id: "webhook",
      title: "Webhook Delivery Retries, 429 Errors & Exponential Backoff",
      category: "Developer API",
      source: "docs.elpino.chat",
      resolutionRate: "97.8%",
      citations: "2,840 conversations",
      lastUpdated: "Yesterday",
      publicAvailable: true,
      aiAgentAvailable: true,
      copilotAvailable: true,
    },
    {
      id: "outage",
      title: "Internal Incident Playbook: Severity 0 Cloud Escalations",
      category: "Engineering Runbook",
      source: "Internal Confluence",
      resolutionRate: "Staff Only",
      citations: "48 internal handoffs",
      lastUpdated: "3 days ago",
      publicAvailable: false,
      aiAgentAvailable: false,
      copilotAvailable: true,
    },
    {
      id: "billing",
      title: "Enterprise Annual Contract Invoicing & Stripe Tax Compliance",
      category: "Billing & Finance",
      source: "Zendesk Import",
      resolutionRate: "94.5%",
      citations: "860 conversations",
      lastUpdated: "5 days ago",
      publicAvailable: true,
      aiAgentAvailable: true,
      copilotAvailable: true,
    },
  ];

  const simulatorScenarios = [
    {
      id: "sources",
      title: "Sync Sources in Minutes",
      icon: Database,
      badge: "Unified Ingestion",
      headline: "15+ native connectors that keep your data fresh",
      description:
        "Connect Notion, Confluence, Zendesk, Google Drive, and public documentation in minutes. Elpino extracts clean markdown, chunks text semantically, and generates high-dimensional embeddings.",
      preview: {
        syncStatus: "Sync Active · 1,480 total documents indexed",
        lastSync: "2 minutes ago",
        sourceCounts: [
          { name: "Notion Workspace", count: "420 pages", health: "100% Up to date" },
          { name: "Public Docs URL", count: "300 pages", health: "Crawled 6m ago" },
          { name: "Zendesk Guide", count: "680 articles", health: "Synced hourly" },
          { name: "Product PDFs", count: "80 documents", health: "All vector embeddings ready" },
        ],
      },
    },
    {
      id: "gaps",
      title: "AI Content Gap Detection",
      icon: Sparkles,
      badge: "Self-Optimizing",
      headline: "Know exactly what articles to write next",
      description:
        "Elpino analyzes conversations where your AI Agent had to escalate to a human. It groups unresolved questions into actionable content gap suggestions so your team can plug documentation holes.",
      preview: {
        gapAlert: "3 high-impact content gaps identified this week",
        gaps: [
          {
            topic: "How to export invoice receipts as consolidated CSV?",
            volume: "48 customer inquiries",
            suggestedAction: "Create 1 new snippet or article",
            impact: "Expected +3.4% AI resolution rate",
          },
          {
            topic: "Does Elpino support custom domain CNAME for EU residency?",
            volume: "32 customer inquiries",
            suggestedAction: "Update Trust Center & Compliance doc",
            impact: "Expected +2.1% AI resolution rate",
          },
        ],
      },
    },
    {
      id: "permissions",
      title: "Audience & AI Controls",
      icon: Lock,
      badge: "Permission Guardrails",
      headline: "Control exactly who sees what and which AI has access",
      description:
        "Never worry about sensitive internal credentials or unreleased roadmaps leaking to customers. Toggle access per article: Public Help Center, Autonomous AI Agent, or Copilot internal-only.",
      preview: {
        securityLevel: "Zero Data Leakage Guarantee",
        controls: [
          {
            doc: "Customer Pricing & Refund Terms",
            audience: "Public Customers",
            aiAccess: "Autonomous AI Agent + Copilot Enabled",
          },
          {
            doc: "Internal Database Migration Credentials",
            audience: "Staff Only",
            aiAccess: "Blocked from AI Agent · Copilot Restricted",
          },
          {
            doc: "Enterprise Custom Contract SLA Addendum",
            audience: "VIP Enterprise Tier Only",
            aiAccess: "Copilot Only (Assigned Teammate)",
          },
        ],
      },
    },
    {
      id: "multilingual",
      title: "Multilingual Vector Embeddings",
      icon: Globe,
      badge: "45+ Languages",
      headline: "Write once in English, serve customers worldwide",
      description:
        "Elpino’s vector embeddings map semantic concepts across languages. If a customer asks a question in Spanish, French, or Japanese, Elpino retrieves the English source document and generates an answer in the customer’s native language.",
      preview: {
        supportedLanguages: "45 languages supported with zero manual translation",
        example: {
          customerQuery: "¿Cómo configuro webhooks con reintentos exponenciales?",
          detectedLang: "Spanish (ES) · 99% Confidence",
          retrievedSource: "docs.elpino.chat/webhooks/retries (Original English Doc)",
          aiDeliveredAnswer:
            "¡Hola! Puedes habilitar el retroceso exponencial con fluctuación aleatoria en Configuración → Webhooks...",
        },
      },
    },
  ];

  const powerGrid = [
    {
      title: "Semantic Vector Chunking",
      description:
        "Cleans and divides articles into context-preserving 500-token chunks with overlap for exact paragraph citations.",
      icon: Database,
      badge: "Vectors",
    },
    {
      title: "Stale Content Warnings",
      description:
        "Automated alerts flag documentation that hasn't been reviewed in 90+ days or has dropping resolution rates.",
      icon: AlertCircle,
      badge: "Hygiene",
    },
    {
      title: "Instant Web URL Re-Crawl",
      description:
        "Trigger an immediate crawl of your documentation site whenever a major product update is shipped.",
      icon: RefreshCw,
      badge: "Instant Sync",
    },
    {
      title: "Full Version History",
      description:
        "Audit who changed what paragraph with complete revision logs and 1-click rollback capabilities.",
      icon: Clock,
      badge: "Revisions",
    },
    {
      title: "Granular Audience Gates",
      description:
        "Target articles to specific user segments based on Stripe ARR, subscription plan, or verified domain.",
      icon: ShieldCheck,
      badge: "Targeting",
    },
    {
      title: "Broken Link Detector",
      description:
        "Scans your knowledge base daily for 404 links, outdated image assets, and missing code snippets.",
      icon: Link2,
      badge: "Validation",
    },
    {
      title: "JSON-LD & SEO Schema",
      description:
        "Public Help Center articles auto-generate structured FAQ schema to rank higher on Google Search results.",
      icon: Search,
      badge: "SEO Ready",
    },
    {
      title: "Zero Model Training",
      description:
        "All uploaded documents are encrypted with AES-256 and never used to train public LLM models.",
      icon: Lock,
      badge: "SOC 2 Type II",
    },
  ];

  const faqs = [
    {
      q: "What is Elpino's Knowledge Hub?",
      a: "Knowledge Hub is Elpino's centralized knowledge management system for creating, managing, and optimizing all of your support content in one unified place. It brings every content source together—from synced platforms like Notion and Zendesk to native articles and snippets—so your knowledge base powers consistent, accurate answers across your autonomous AI Agent, Copilot in the inbox, and your public self-serve Help Center.",
    },
    {
      q: "How does Knowledge Hub improve the AI Agent's resolution rate?",
      a: "Better content means better answers. Knowledge Hub lets you review which articles perform best, fill content gaps identified from unresolved customer inquiries, and control exactly what the AI Agent and Copilot can use. With well-optimized, vector-embedded content, Elpino resolves 76% of support questions autonomously on average, with many teams reaching 85%+.",
    },
    {
      q: "Which content sources can I connect to my knowledge base?",
      a: "Knowledge Hub syncs and imports support content from external platforms including Notion, Zendesk, Guru, Confluence, Google Drive, public documentation URLs, and raw PDF manuals. You can also author new content directly in Elpino, including public Help Center articles, internal runbooks, and canned snippets.",
    },
    {
      q: "How do I manage support content at scale?",
      a: "Organize content with nested folders and subfolders, then search and filter by criteria like source, author, update date, or AI availability. You can also perform bulk actions to update AI availability, target audience, folder location, or languages across hundreds of documents at once.",
    },
    {
      q: "Can I control which content the AI Agent and Copilot use?",
      a: "Yes. You choose exactly which content can be used by the autonomous AI Agent, human teammates using Copilot, or the public Help Center. This ensures sensitive internal credentials, unreleased roadmap features, or internal runbooks stay completely confidential and safe.",
    },
    {
      q: "Does Knowledge Hub support multiple languages?",
      a: "Yes. Knowledge Hub supports content across 45 languages. Thanks to cross-lingual vector embeddings, the AI can retrieve information written in English and answer customer questions asked in Spanish, French, German, Japanese, or Portuguese naturally without requiring manual translation of your entire documentation.",
    },
    {
      q: "How do I get started with Knowledge Hub?",
      a: "Start a free 14-day trial to set up Knowledge Hub in under five minutes. Connect your existing documentation from Notion, Zendesk, or Confluence, upload your product PDFs, or paste your website URL to initiate an automated crawl. No credit card is required.",
    },
  ];

  const activeSim = simulatorScenarios[activeTab];

  const toggleHandler = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Intercom Knowledge Hub Architecture */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino Helpdesk · Central Knowledge Hub
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Centralize your content for{" "}
                <span className="italic text-[#ff5600]">AI and human support.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Create, manage, and optimize all of your support documentation in one unified system.
                Ground your autonomous AI Agent and Copilot in verified truth to deliver fast,
                consistent, and accurate customer answers.
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
                  <Check size={14} className="text-[#18c983]" /> 15+ native connectors
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Automatic vector chunking
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero model training
                </span>
              </div>
            </div>

            {/* Featured Mascot Picture Display */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[520px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  {/* Chrome top bar */}
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Vector Knowledge Engine
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      1,480 Chunks Grounded
                    </span>
                  </div>

                  {/* High quality mascot illustration */}
                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/help-center-sloth.png"
                      alt="Knowledge Hub Sloth Managing Docs"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  {/* Micro telemetry widgets */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        AI Grounding Match
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">99.4%</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Zero hallucinations</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Auto-Synced Sources
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">6 Platforms</div>
                      <div className="text-[11px] text-black/50">Notion, Zendesk, PDFs, URLs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Knowledge Hub Dashboard Console Mockup */}
          <div className="mt-16 sm:mt-20 overflow-hidden rounded-2xl border border-black/15 bg-[#17181c] text-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.45)]">
            {/* Top controls header */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#1f2026] px-6 py-4 text-xs gap-4">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="font-semibold text-white ml-2 text-sm">
                  Knowledge Hub · Unified Catalog
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  1,480 Active Articles
                </span>
              </div>

              {/* Search bar simulation */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  readOnly
                  value="Filter by title, tag, source, or AI status..."
                  className="w-full rounded-lg bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white/60 border border-white/10 focus:outline-none"
                />
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Sources (1,480)" },
                  { id: "notion", label: "Notion (420)" },
                  { id: "helpdesk", label: "Zendesk & Help Center (680)" },
                  { id: "urls", label: "Web Sitemaps (300)" },
                  { id: "pdfs", label: "PDFs (80)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveSourceFilter(f.id)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                      activeSourceFilter === f.id
                        ? "bg-[#ff5600] text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Table of articles with live AI toggles */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase bg-black/20">
                      <th className="py-3 px-4 font-semibold">Article &amp; Source</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">AI Resolution</th>
                      <th className="py-3 px-4 font-semibold">Citations</th>
                      <th className="py-3 px-4 font-semibold text-center">AI Agent</th>
                      <th className="py-3 px-4 font-semibold text-center">Copilot</th>
                      <th className="py-3 px-4 font-semibold text-center">Help Center</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/90">
                    {articlesData.map((art) => (
                      <tr key={art.id} className="hover:bg-white/5 transition">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white">{art.title}</div>
                          <div className="text-[11px] text-white/40 mt-0.5 flex items-center gap-2">
                            <span>{art.source}</span>
                            <span>•</span>
                            <span>Updated {art.lastUpdated}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                            {art.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-[#18c983]">
                          {art.resolutionRate}
                        </td>

                        <td className="py-4 px-4 text-white/60 text-xs">
                          {art.citations}
                        </td>

                        {/* Interactive Toggle: AI Agent */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleHandler(`${art.id}_ai`)}
                            className="inline-flex items-center justify-center transition"
                          >
                            {toggles[`${art.id}_ai`] !== false ? (
                              <span className="rounded-full bg-[#18c983]/20 text-[#18c983] border border-[#18c983]/40 px-2 py-0.5 text-[10px] font-bold">
                                ON
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/10 text-white/40 px-2 py-0.5 text-[10px]">
                                OFF
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Interactive Toggle: Copilot */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleHandler(`${art.id}_copilot`)}
                            className="inline-flex items-center justify-center transition"
                          >
                            {toggles[`${art.id}_copilot`] !== false ? (
                              <span className="rounded-full bg-[#428ce5]/20 text-[#428ce5] border border-[#428ce5]/40 px-2 py-0.5 text-[10px] font-bold">
                                ON
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/10 text-white/40 px-2 py-0.5 text-[10px]">
                                OFF
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Interactive Toggle: Public Help Center */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleHandler(`${art.id}_public`)}
                            className="inline-flex items-center justify-center transition"
                          >
                            {toggles[`${art.id}_public`] !== false ? (
                              <span className="rounded-full bg-[#ff5600]/20 text-[#ff5600] border border-[#ff5600]/40 px-2 py-0.5 text-[10px] font-bold">
                                PUBLIC
                              </span>
                            ) : (
                              <span className="rounded-full bg-white/10 text-white/40 px-2 py-0.5 text-[10px]">
                                INTERNAL
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom bulk actions footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-white/60 pt-2">
                <span>Selected: 4 articles · 1-click bulk availability controls enabled</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded bg-white/10 px-3 py-1.5 text-white hover:bg-white/20 transition font-medium"
                  >
                    Sync All Sources Now
                  </button>
                  <button
                    type="button"
                    className="rounded bg-[#ff5600] px-3.5 py-1.5 text-white hover:bg-white hover:text-black transition font-semibold"
                  >
                    + Create New Article
                  </button>
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

      {/* 3. THREE CORE PILLARS ("Create, manage, and optimize all of your content with one tool") */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Unified Knowledge Platform
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Create, manage, and optimize all of your content with one tool.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Fragmented wikis and outdated Notion pages lead to confused agents and bad AI answers.
              Elpino unifies every content asset into a single synchronized repository.
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

      {/* 4. BRING YOUR SOURCES TOGETHER (With Pictures!) */}
      <section className="border-b border-black/5 bg-[#f4f3ec] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-block rounded-full bg-[#ff5600]/10 border border-[#ff5600]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                Universal Connectors
              </span>

              <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                Bring your sources together.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-black/70 sm:text-lg">
                Sync existing documentation from platforms you already use, import static manuals,
                or author native Help Center articles with rich markdown.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#ff5600] text-white">
                      <RefreshCw size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Sync in minutes</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Native 1-click connectors to Notion, Zendesk, Confluence, Guru, and GitHub.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#428ce5] text-white">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Import existing content</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Upload PDFs, Markdown archives, and crawl public web documentation URLs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-black/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#18c983] text-white">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-black">Create new content</h3>
                      <p className="text-xs text-black/60 mt-0.5">
                        Author public help articles, internal runbooks, and reusable conversation snippets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot Illustration Spotlight */}
            <div className="relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/founders-sloth-v2.png"
                  alt="Connecting all Knowledge Sources"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sourcesList.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.name}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm hover:border-black/25 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${src.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-black/70">
                      {src.category}
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-black">{src.name}</h4>
                  <div className="mt-2 flex items-center justify-between text-xs text-black/60 pt-2 border-t border-black/5">
                    <span className="text-[#18c983] font-medium">{src.status}</span>
                    <span>{src.latency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ORGANIZE AND MANAGE AT SCALE (With Pictures) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Mascot Picture */}
            <div className="order-2 lg:order-1 relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-[#faf9f6] p-6 shadow-xl flex items-center justify-center">
                <Image
                  src="/images/about-sloth-crew.png"
                  alt="Organizing Knowledge Base at Scale"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                Scale &amp; Governance
              </span>
              <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                Organize and manage your content at scale.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
                As your product grows, your support documentation expands into hundreds of guides.
                Elpino keeps everything structured, searchable, and controlled.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ff5600] text-white mt-1">
                    <FolderOpen size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Nested content folders</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Group articles by product area, user tier, or internal team with clean hierarchies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#428ce5] text-white mt-1">
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Fast search &amp; filters</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Find any paragraph instantly by keyword, content source, author, or AI availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#18c983] text-white mt-1">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Powerful bulk actions</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Update AI availability, target audience, or languages across 100+ articles in one click.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#d9bef4] text-[#233d4d] mt-1">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-black">Audience targeting</h3>
                    <p className="text-sm text-black/65 mt-0.5">
                      Target specific docs to Enterprise VIPs, beta testers, or internal support staff only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. IMPROVE PERFORMANCE WITH CONTENT OPTIMIZED FOR AI (With Picture) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
                AI Performance Feedback Loop
              </span>
              <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
                Improve performance with content optimized for AI.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
                Your AI is only as good as the content behind it. Knowledge Hub tells you which
                articles drive high customer satisfaction, and highlights missing answers automatically.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-white p-6 border border-black/10 shadow-sm">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
                      Content Gap Detection
                    </span>
                    <span className="rounded bg-[#ff5600]/10 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                      Auto-Flagged
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-black">
                    Uncover what questions your AI couldn't answer
                  </h3>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    When a customer inquiry escalates to a human, Elpino flags the topic as an unaddressed
                    content gap. 1-click creates a draft article for your team to review.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 border border-black/10 shadow-sm">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#18c983]">
                      Granular Availability
                    </span>
                    <span className="rounded bg-[#18c983]/10 text-[#18c983] px-2 py-0.5 text-[10px] font-bold">
                      Zero Hallucinations
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-black">
                    Manage where each doc can be cited
                  </h3>
                  <p className="text-xs text-black/65 mt-1 leading-relaxed">
                    Decide whether a doc is cited by the autonomous AI Agent, suggested by Copilot to
                    human agents, or published to your public Help Center.
                  </p>
                </div>
              </div>
            </div>

            {/* Mascot Picture: Trust Sloth */}
            <div className="relative flex justify-center">
              <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/trust-sloth.png"
                  alt="AI Content Optimization & Accuracy"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE KNOWLEDGE HUB SIMULATOR ("Experience the Hub in Action") */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Test Drive
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience the Knowledge Hub in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through the live capability simulations below to see how Elpino syncs sources,
              detects content gaps, enforces permission guardrails, and indexes across 45+ languages.
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
            </div>

            {/* Simulated Live View */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Tab 0: Sources preview */}
              {activeSim.preview.sourceCounts && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="font-semibold text-white">{activeSim.preview.syncStatus}</span>
                    <span>Last completed: {activeSim.preview.lastSync}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeSim.preview.sourceCounts.map((s) => (
                      <div key={s.name} className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{s.name}</span>
                          <span className="text-[#18c983]">{s.health}</span>
                        </div>
                        <div className="text-xs text-white/50 mt-1">{s.count} indexed into vectors</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 1: Content Gaps preview */}
              {activeSim.preview.gaps && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#ff5600]/15 border border-[#ff5600]/30 p-4 text-xs text-[#ff5600] font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{activeSim.preview.gapAlert}</span>
                  </div>
                  <div className="space-y-3">
                    {activeSim.preview.gaps.map((g) => (
                      <div key={g.topic} className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">"{g.topic}"</div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {g.volume} · {g.suggestedAction}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-[#18c983]/20 text-[#18c983] px-3 py-1 text-xs font-bold">
                            {g.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Permissions preview */}
              {activeSim.preview.controls && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase text-white/40 tracking-wider">
                    {activeSim.preview.securityLevel}
                  </div>
                  {activeSim.preview.controls.map((c) => (
                    <div key={c.doc} className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{c.doc}</div>
                        <div className="text-xs text-white/50 mt-0.5">Target Audience: {c.audience}</div>
                      </div>
                      <div>
                        <span className="rounded bg-white/10 px-2.5 py-1 text-xs text-white/80 font-mono">
                          {c.aiAccess}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Multilingual preview */}
              {activeSim.preview.example && (
                <div className="space-y-4">
                  <div className="text-xs text-[#18c983] font-semibold flex items-center gap-2">
                    <Globe size={16} />
                    <span>{activeSim.preview.supportedLanguages}</span>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                    <div className="text-[11px] uppercase font-semibold text-white/40">
                      Customer Inbound Message ({activeSim.preview.example.detectedLang})
                    </div>
                    <div className="text-sm font-medium text-white italic">
                      "{activeSim.preview.example.customerQuery}"
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                    <div className="text-[11px] uppercase font-semibold text-white/40">
                      Retrieved Knowledge Doc (Grounding Source)
                    </div>
                    <div className="text-xs font-mono text-[#ff5600]">
                      {activeSim.preview.example.retrievedSource}
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-4 space-y-2">
                    <div className="text-[11px] uppercase font-semibold text-[#ff5600]">
                      AI Grounded Native Response Delivered to Customer
                    </div>
                    <div className="text-xs text-white/90 leading-relaxed">
                      {activeSim.preview.example.aiDeliveredAnswer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. OVER 60 IMPROVEMENTS (Grid Showcase) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Built for Support Operations
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Over 60 improvements to the helpdesk you use every day.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              The features you've been asking for and improvements you'll notice every single day.
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

      {/* 9. TESTIMONIAL SPOTLIGHT */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#ff5600]/10 text-[#ff5600] mb-8">
            <Sparkles size={24} />
          </div>

          <blockquote className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-snug tracking-[-0.02em] text-[#17181c]">
            “We consolidated four disparate wikis into Elpino’s Knowledge Hub. Our autonomous AI
            resolution rate immediately jumped from 44% to 78%, and our support agents now have
            complete faith in the Copilot suggestions.”
          </blockquote>

          <div className="mt-8">
            <div className="font-semibold text-base text-black">Avery Callahan</div>
            <div className="text-sm text-black/60">Head of Knowledge &amp; Enablement, FinScale Global</div>
          </div>
        </div>
      </section>

      {/* 10. FAQS ACCORDION (Matching Intercom's 7 Knowledge Hub questions) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              A central knowledge management system you can trust.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Everything you need to know about connecting sources, controlling AI availability, and managing content at scale.
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
            Centralize your support content today
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Better content means better answers.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect Notion, Zendesk, or your website URLs in
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
