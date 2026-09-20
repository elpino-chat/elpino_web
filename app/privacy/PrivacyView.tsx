"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Cpu,
  Database,
  KeyRound,
  FileText,
  Search,
  Cookie,
  Scale,
  Mail,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Server,
  Zap,
  Globe2,
  CheckCircle2,
  HelpCircle,
  Clock,
  DownloadCloud,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";

interface AiProvider {
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  role: string;
  dataShared: string;
  trainingPolicy: string;
  location: string;
}

const AI_PROVIDERS: AiProvider[] = [
  {
    name: "OpenAI",
    tagline: "GPT-4o & Reasoning Architecture",
    badge: "Primary / Reasoning",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    role: "Multilingual translation, conversational memory, draft generation, and teammate summarization.",
    dataShared: "Relevant conversation snippets and knowledge base context needed to complete prompt execution.",
    trainingPolicy: "Zero training on API customer data under enterprise data privacy agreements.",
    location: "United States (Global low-latency edge)",
  },
  {
    name: "Anthropic",
    tagline: "Claude 3.5 Sonnet & Haiku Models",
    badge: "High-Nuance Support",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    role: "Complex document analysis, nuanced empathy-driven customer responses, and multi-turn ticket resolutions.",
    dataShared: "Scoped customer inquiry text and matching knowledge base documentation snippets.",
    trainingPolicy: "Zero training on commercial API customer content.",
    location: "United States",
  },
  {
    name: "xAI",
    tagline: "Grok High-Speed Reasoning Engines",
    badge: "Real-Time Fallback & Reasoning",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
    role: "Real-time query processing, dynamic decision trees, and intelligent multi-model failover support.",
    dataShared: "Task-specific customer message text stripped of unnecessary personal identifiers.",
    trainingPolicy: "Commercial API terms protecting input/output confidentiality.",
    location: "United States",
  },
  {
    name: "DeepSeek",
    tagline: "High-Efficiency Logic & Inference",
    badge: "Automated Routing & Logic",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300",
    role: "Rapid intent classification, routine query resolution, and cost-efficient structured triage.",
    dataShared: "Anonymized user question context required for instant resolution synthesis.",
    trainingPolicy: "Commercial inference API calls with strict task-scoped prompt boundaries.",
    location: "Regional / API Edge Endpoints",
  },
  {
    name: "GLM / Zhipu AI",
    tagline: "Specialized Multilingual & Regional Models",
    badge: "Multilingual Intelligence",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
    role: "Localized Asian language understanding, cross-regional translations, and specialized dialect handling.",
    dataShared: "Regional conversation query inputs and localized knowledge base segments.",
    trainingPolicy: "Enterprise API privacy terms with zero unauthorized data mining.",
    location: "Asia-Pacific Regional Edge",
  },
  {
    name: "Nomic AI",
    tagline: "High-Dimensional Vector Embeddings",
    badge: "Semantic Search Embeddings",
    badgeColor: "bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300",
    role: "Creating numerical embeddings from your uploaded help docs, articles, and macros to power instant vector search.",
    dataShared: "Knowledge base text chunks to generate embedding matrices.",
    trainingPolicy: "Zero model training on vectorized customer workspace content.",
    location: "United States",
  },
];

const SECTIONS = [
  { id: "principles", title: "Core Privacy Principles", icon: ShieldCheck },
  { id: "data-we-collect", title: "1. Data We Collect", icon: Database },
  { id: "how-we-use-it", title: "2. How We Use Your Data", icon: Cpu },
  { id: "ai-processing", title: "3. Third-Party AI Providers", icon: Sparkles },
  { id: "google-user-data", title: "4. Google Sign-In & API Data", icon: KeyRound },
  { id: "storage-security", title: "5. Storage, Encryption & Security", icon: Lock },
  { id: "retention-deletion", title: "6. Retention, Export & Deletion", icon: Trash2 },
  { id: "sharing", title: "7. When We Share Data", icon: Layers },
  { id: "cookies-analytics", title: "8. Cookies & Telemetry", icon: Cookie },
  { id: "your-rights", title: "9. Your Rights & Global Compliance", icon: Scale },
  { id: "changes-contact", title: "10. Policy Changes & Contact", icon: Mail },
];

export function PrivacyView() {
  const [activeSection, setActiveSection] = useState("principles");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copySectionUrl = (id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/privacy#${id}`;
      navigator.clipboard.writeText(url);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) return AI_PROVIDERS;
    const q = searchQuery.toLowerCase();
    return AI_PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.trainingPolicy.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#fafaf8] font-[family-name:var(--font-rethink-sans)] text-[#20251d]">
      {/* Background Subtle Gradient & Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:24px_24px] opacity-25"
      />

      {/* HERO SECTION */}
      <header className="relative border-b border-[#cfd9c8]/70 bg-gradient-to-b from-[#eef3e9] via-[#e9efe4] to-[#fafaf8] pb-16 pt-20 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#758269]/30 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#4d5e41] shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#75955a] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5b7a40]"></span>
                </span>
                Privacy & Data Governance
              </div>

              {/* Title */}
              <h1 className="mt-6 text-4xl font-medium tracking-tight text-[#1c221a] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.05]">
                Privacy Policy
              </h1>

              {/* Description */}
              <p className="mt-5 text-lg leading-relaxed text-[#505c4a] sm:text-xl sm:leading-8">
                How Elpino collects, processes, encrypts, and safeguards your customer conversations, workspace files, and AI interactions. We are committed to complete transparency, strict data minimization, and <strong>zero public AI model training</strong> on your proprietary data.
              </p>
            </div>

            {/* Quick Metadata Card */}
            <div className="w-full shrink-0 rounded-2xl border border-[#d2decb] bg-white/80 p-5 shadow-xs backdrop-blur-md md:w-72">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#697960]">Document Meta</p>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between border-b border-[#edf3e9] pb-2 text-[#4b5745]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-[#738d5e]" /> Last Updated
                  </span>
                  <span className="font-medium text-[#20251d]">September 19, 2026</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#edf3e9] pb-2 text-[#4b5745]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Shield className="h-3.5 w-3.5 text-[#738d5e]" /> Standard
                  </span>
                  <span className="rounded bg-[#eaf1e5] px-2 py-0.5 text-xs font-semibold text-[#425536]">
                    GDPR & CCPA
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[#4b5745]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5 text-[#738d5e]" /> Inquiries
                  </span>
                  <a href="mailto:hello@elpino.chat" className="font-medium text-[#465b38] underline underline-offset-2 hover:text-[#2d3d23]">
                    hello@elpino.chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 4 CORE PRINCIPLES SUMMARY CARDS */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#d3dfcc] bg-white/90 p-5 shadow-xs transition hover:border-[#8fab76] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efe1] text-[#4d6639]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-base font-semibold text-[#20251d]">No AI Training</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5a6854]">
                We never use your customer inquiries, replies, or uploaded documents to train or tune generalized public AI models.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d3dfcc] bg-white/90 p-5 shadow-xs transition hover:border-[#8fab76] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efe1] text-[#4d6639]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-base font-semibold text-[#20251d]">Enterprise Encryption</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5a6854]">
                AES-256-GCM encryption at rest for authentication tokens and database secrets. All transport is secured via TLS 1.3.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d3dfcc] bg-white/90 p-5 shadow-xs transition hover:border-[#8fab76] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efe1] text-[#4d6639]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-base font-semibold text-[#20251d]">Encrypted AI Routing</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5a6854]">
                Queries route securely to vetted AI providers (OpenAI, Anthropic Claude, xAI, DeepSeek, GLM, Nomic) under zero-retention enterprise APIs.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d3dfcc] bg-white/90 p-5 shadow-xs transition hover:border-[#8fab76] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efe1] text-[#4d6639]">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-base font-semibold text-[#20251d]">You Own Your Data</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5a6854]">
                Export full chat archives and knowledge vectors anytime. 1-click workspace deletion permanently purges all active records.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA WITH SIDEBAR */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16 lg:px-10">
        {/* Mobile Section Jump Bar */}
        <div className="mb-8 rounded-2xl border border-[#d2ded0] bg-white/95 p-3 shadow-xs lg:hidden">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6a7c61]">Quick Jump</span>
            <span className="text-xs text-[#829377]">{SECTIONS.length} Sections</span>
          </div>
          <div className="flex snap-x gap-2 overflow-x-auto pb-1">
            {SECTIONS.map((sec, idx) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  activeSection === sec.id
                    ? "border-[#77985c] bg-[#eef5e9] text-[#253919]"
                    : "border-[#d8e2d4] bg-white text-[#4f5c49] hover:border-[#a1b894]"
                }`}
              >
                <span className="text-[10px] text-[#7d936f]">{String(idx + 1).padStart(2, "0")}</span>
                <span>{sec.title.split(". ")[1] || sec.title}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16">
          {/* DESKTOP STICKY SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8f74]" />
                <input
                  type="text"
                  placeholder="Search policy & AI providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#d1dec9] bg-white/90 py-2.5 pl-10 pr-3.5 text-xs text-[#20251d] shadow-2xs placeholder:text-[#889980] focus:border-[#719256] focus:outline-none focus:ring-2 focus:ring-[#85a869]/20"
                />
              </div>

              {/* Table of Contents Nav */}
              <nav aria-label="Table of contents" className="rounded-2xl border border-[#d2dfcb] bg-white/80 p-4 shadow-xs backdrop-blur-md">
                <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#697b60]">Contents</p>
                <ol className="mt-3 space-y-1">
                  {SECTIONS.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={() => setActiveSection(section.id)}
                          className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all duration-150 ${
                            isActive
                              ? "bg-[#e8f1e2] font-semibold text-[#1f3114]"
                              : "text-[#586751] hover:bg-[#f3f7ef] hover:text-[#20251d]"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#5c7a42]" : "text-[#87997f] group-hover:text-[#5c7a42]"}`} />
                            <span className="truncate">{section.title}</span>
                          </span>
                          <span className={`text-[10px] font-mono ${isActive ? "text-[#5c7a42]" : "text-[#97a890]"}`}>
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              {/* Need Help Card */}
              <div className="rounded-2xl border border-[#d3dfcc] bg-[#f0f6eb]/80 p-4 text-xs text-[#4c5c44]">
                <div className="flex items-center gap-2 font-semibold text-[#24331a]">
                  <HelpCircle className="h-4 w-4 text-[#608044]" />
                  <span>Privacy Inquiries</span>
                </div>
                <p className="mt-1.5 leading-relaxed text-[#5a6b52]">
                  Need a custom Data Processing Addendum (DPA) or regional hosting?
                </p>
                <a
                  href="mailto:hello@elpino.chat"
                  className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#3b5327] underline underline-offset-4 hover:text-[#213214]"
                >
                  Contact Security Team <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLES */}
          <div className="min-w-0 space-y-16">
            {/* SECTION: PRINCIPLES */}
            <article id="principles" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">Our Privacy Commitment</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("principles")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                  title="Copy link to section"
                >
                  {copiedSection === "principles" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  At <strong>Elpino</strong>, we build intelligent customer support infrastructure that allows businesses to automate resolutions, organize conversations, and empower support teams with AI. We believe enterprise AI must be built on unwavering transparency, uncompromising security, and clear boundaries.
                </p>
                <p>
                  This Privacy Policy outlines how Elpino collects, uses, encrypts, and retains your data across <code className="rounded bg-[#f0f5ec] px-1.5 py-0.5 text-xs text-[#344627]">elpino.chat</code>, the Elpino dashboard, our embeddable chat widget, our API endpoints, and our connected workflow integrations.
                </p>
                <div className="rounded-2xl border border-[#cfe0c7] bg-[#f5faf0] p-4 text-sm text-[#3b4c30]">
                  <strong>Key Takeaway:</strong> We only access what you explicitly connect. We use it solely to run the platform for you, we never sell your data, and we <strong>never allow your proprietary conversations or uploaded documents to be used to train generalized AI models.</strong>
                </div>
              </div>
            </article>

            {/* SECTION 1: DATA WE COLLECT */}
            <article id="data-we-collect" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Database className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">1. Data We Collect</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("data-we-collect")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "data-we-collect" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-[#515f4a]">
                We only collect data that is strictly required to provide real-time AI assistance, conversational handoffs, and workspace collaboration:
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">A</span>
                    <span>Account & Identity Data</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    Your name, work email address, team membership, profile avatar, and authentication credentials. Passwords are encrypted with salted one-way hashes; OAuth sign-ins store zero password data.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">B</span>
                    <span>Customer Conversation Data</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    Inbound and outbound messages sent through the Elpino chat widget, connected inboxes, visitor profile tags (name, email submitted by visitor), thread status, handoff logs, and conversation attachments.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">C</span>
                    <span>Knowledge Base & Business Docs</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    Help center articles, FAQs, uploaded policy documents, macros, canned responses, and custom instructions you configure to ground the AI in your company&apos;s verified knowledge.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">D</span>
                    <span>Connected Integration Data</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    When you link connectors (Google, Slack, Stripe, Razorpay, etc.), we access only the specific scopes you authorize (e.g., payment status verification or notification dispatch).
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">E</span>
                    <span>Telemetry & Metered AI Usage</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    AI resolution counts, token usage, latency metrics, handoff trigger rates, system audit logs, and security telemetry needed for billing, rate limits, and abuse prevention.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dbe6d6] bg-[#fcfdfa] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#27371f]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f1e2] text-xs font-bold text-[#4c6738]">F</span>
                    <span>Payment & Billing Records</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5a6a53]">
                    Handled securely via our PCI-DSS certified payment processor (Razorpay). Elpino never sees or stores full credit card numbers; we retain only subscription tier, billing period, and invoice identifiers.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 2: HOW WE USE IT */}
            <article id="how-we-use-it" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">2. How We Use Your Data</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("how-we-use-it")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "how-we-use-it" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>We process workspace and customer information exclusively to deliver, maintain, and secure the Elpino platform:</p>

                <ul className="space-y-2.5 pl-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Instant AI Auto-Resolutions:</strong> Synthesizing immediate, grounded answers to visitor queries based strictly on your uploaded knowledge base and approved canned macros.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Human Teammate Handoffs:</strong> Gracefully escalating ambiguous inquiries, payment edge cases, or sensitive conversations directly to your human agents.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Copilot & Draft Generation:</strong> Generating proposed replies and conversation summaries in the team inbox for human review prior to sending.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Intelligent Inbox Triage:</strong> Categorizing, tagging, priority-scoring, and routing customer tickets across departments.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Usage Metering & Security:</strong> Auditing resolution consumption against plan quotas, detecting spam/DDoS attempts, and debugging service anomalies.</span>
                  </li>
                </ul>

                <div className="mt-6 rounded-2xl border border-red-200/80 bg-red-50/40 p-5 text-sm text-[#4d2828]">
                  <h4 className="font-semibold text-red-900">What We NEVER Do</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-red-950/80">
                    <li>We <strong>do not sell, rent, or monetize</strong> your or your customers&apos; personal data to any third party or data broker.</li>
                    <li>We <strong>do not serve third-party ads</strong> or conduct behavioural cross-site ad profiling.</li>
                    <li>We <strong>do not use your data</strong> to determine consumer creditworthiness, loans, or insurance eligibility.</li>
                    <li>We <strong>do not train public base foundation models</strong> using your proprietary support discussions.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 3: AI PROCESSING & THIRD-PARTY PROVIDERS */}
            <article id="ai-processing" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">3. Third-Party AI Providers & Processing</h2>
                    <p className="mt-0.5 text-xs text-[#6e8065]">Multi-model architecture, encrypted transmission, and zero-training guarantees</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("ai-processing")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "ai-processing" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  To answer questions, summarize long customer discussions, draft teammate recommendations, and index knowledge bases for fast semantic retrieval, relevant content snippets (such as the customer’s immediate message or relevant knowledge base articles) are transmitted over encrypted connections (<code className="rounded bg-[#edf4e8] px-1.5 py-0.5 text-xs font-mono text-[#324524]">TLS 1.3</code>) to vetted third-party large language model (LLM) and vector embedding providers.
                </p>

                <p>
                  Elpino employs a high-performance <strong>multi-model architecture</strong>. Depending on task complexity, language, latency requirements, and workspace configuration, prompts and context snippets may be processed by the following enterprise AI providers under strict commercial API terms:
                </p>

                {/* PROVIDER CARDS GRID */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.name}
                      className="flex flex-col justify-between rounded-2xl border border-[#d9e5d4] bg-[#fafcf8] p-5 shadow-2xs transition hover:border-[#86a66e] hover:bg-white"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-lg font-bold text-[#1f281b]">{provider.name}</span>
                            <p className="text-xs font-medium text-[#6c7d64]">{provider.tagline}</p>
                          </div>
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${provider.badgeColor}`}>
                            {provider.badge}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-[#505f48]">
                          <div>
                            <span className="font-semibold text-[#293623]">Primary Role: </span>
                            {provider.role}
                          </div>
                          <div>
                            <span className="font-semibold text-[#293623]">Data Scoped: </span>
                            {provider.dataShared}
                          </div>
                          <div>
                            <span className="font-semibold text-[#293623]">Training Policy: </span>
                            <span className="font-medium text-emerald-800 dark:text-emerald-300">{provider.trainingPolicy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[#eaf0e6] pt-3 text-[11px] text-[#7d8f76]">
                        <span className="font-medium">Region:</span> {provider.location}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI GUARANTEES */}
                <div className="mt-6 rounded-2xl border border-[#cce0c2] bg-[#f4f9f0] p-5 text-sm text-[#3b4c30]">
                  <h4 className="flex items-center gap-2 font-bold text-[#233519]">
                    <ShieldCheck className="h-4 w-4 text-[#597a3f]" />
                    AI Data Protection & Prompt Boundary Rules
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#4e6043]">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a8d4e]" />
                      <span><strong>Zero AI Training:</strong> Data submitted via enterprise API integrations is not used by OpenAI, Anthropic, xAI, DeepSeek, GLM, Nomic, or Elpino to train, retrain, or improve generalized public AI models.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a8d4e]" />
                      <span><strong>Task-Specific Data Scoping:</strong> No AI provider receives your entire database or full conversation history. Prompts only include the specific inquiry and matching knowledge base snippets required to answer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a8d4e]" />
                      <span><strong>PII & Payment Protection:</strong> Customer sensitive payment identifiers and passwords are never packaged into prompt payloads sent to AI models.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a8d4e]" />
                      <span><strong>Regional Routing & Custom LLM Endpoints:</strong> If your enterprise has specific regulatory mandates requiring dedicated sovereign LLM hosting or custom private endpoints, contact <a href="mailto:hello@elpino.chat" className="font-semibold underline hover:text-[#20251d]">hello@elpino.chat</a>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* SECTION 4: GOOGLE USER DATA */}
            <article id="google-user-data" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">4. Google Sign-In & API Data</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("google-user-data")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "google-user-data" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  If you choose to sign in to Elpino with your Google account, Elpino&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#3b5429] underline underline-offset-4 hover:text-[#233519]"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the <strong>Limited Use</strong> requirements:
                </p>

                <div className="rounded-2xl border border-[#d7e4d2] bg-[#fafcf9] p-5 text-sm space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#597b41]" />
                    <p className="text-xs leading-relaxed text-[#4f5f48]">
                      <strong>Google Identity Data:</strong> We access only basic Google profile information (name, email address, profile picture) to authenticate your session and label your workspace account.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#597b41]" />
                    <p className="text-xs leading-relaxed text-[#4f5f48]">
                      <strong>No Advertising or Brokering:</strong> Google user data is strictly used for authentication and service provision. It is never used for serving ads, never sold to data brokers, and never transferred to third parties except as required for security or legal compliance.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#597b41]" />
                    <p className="text-xs leading-relaxed text-[#4f5f48]">
                      <strong>Instant Revocation:</strong> You can revoke Elpino&apos;s Google OAuth access at any time through the Elpino Settings dashboard or via your{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#3b5429] underline hover:text-[#1e2e14]"
                      >
                        Google Account Permissions Manager
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 5: STORAGE & SECURITY */}
            <article id="storage-security" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">5. Storage, Encryption & Security Architecture</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("storage-security")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "storage-security" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>We treat your customer communications and credentials with defense-in-depth security measures:</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#d8e4d3] bg-[#f9fbf8] p-4 text-xs">
                    <div className="font-semibold text-[#27381e] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#5e7e45]" /> AES-256-GCM Encryption at Rest
                    </div>
                    <p className="mt-1 text-[#5c6c55]">Integration access tokens, OAuth refresh credentials, and workspace secrets are encrypted using AES-256-GCM.</p>
                  </div>

                  <div className="rounded-2xl border border-[#d8e4d3] bg-[#f9fbf8] p-4 text-xs">
                    <div className="font-semibold text-[#27381e] flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-[#5e7e45]" /> TLS 1.3 Transport Security
                    </div>
                    <p className="mt-1 text-[#5c6c55]">All web traffic, API calls, and webhook dispatches move over encrypted modern TLS connections.</p>
                  </div>

                  <div className="rounded-2xl border border-[#d8e4d3] bg-[#f9fbf8] p-4 text-xs">
                    <div className="font-semibold text-[#27381e] flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#5e7e45]" /> Zero Employee Snooping
                    </div>
                    <p className="mt-1 text-[#5c6c55]">Elpino personnel do not inspect your customer conversation text unless explicitly authorized by you for support diagnostics.</p>
                  </div>

                  <div className="rounded-2xl border border-[#d8e4d3] bg-[#f9fbf8] p-4 text-xs">
                    <div className="font-semibold text-[#27381e] flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-[#5e7e45]" /> Rapid Incident Notification
                    </div>
                    <p className="mt-1 text-[#5c6c55]">In the event of a verified security incident impacting your workspace data, we notify affected admins without undue delay.</p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 6: RETENTION & DELETION */}
            <article id="retention-deletion" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">6. Retention, Export & Permanent Deletion</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("retention-deletion")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "retention-deletion" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  You have complete lifecycle control over your data. We retain active workspace data for as long as your account remains active.
                </p>

                <div className="rounded-2xl border border-[#d4e2cf] bg-[#fafcf9] p-5 space-y-4 text-xs text-[#506049]">
                  <div>
                    <h4 className="font-bold text-[#23351a]">Disconnecting Integrations</h4>
                    <p className="mt-1 leading-relaxed">
                      When you disconnect a connector (e.g., Slack, Google, Stripe), stored OAuth access tokens and credentials are wiped immediately from our servers.
                    </p>
                  </div>
                  <div className="border-t border-[#ebf2e7] pt-3">
                    <h4 className="font-bold text-[#23351a]">1-Click Workspace Deletion</h4>
                    <p className="mt-1 leading-relaxed">
                      You can delete your entire workspace from Dashboard Settings. This cancels subscriptions, disconnects live widgets, purges knowledge base vectors, and deletes active message records within 30 days.
                    </p>
                  </div>
                  <div className="border-t border-[#ebf2e7] pt-3">
                    <h4 className="font-bold text-[#23351a]">Data Portability & Export</h4>
                    <p className="mt-1 leading-relaxed">
                      You can request a full JSON / CSV data archive of your customer conversation transcripts and knowledge base content at any time by emailing <a href="mailto:hello@elpino.chat" className="font-semibold text-[#3b5428] underline">hello@elpino.chat</a>.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 7: SHARING & SUBPROCESSORS */}
            <article id="sharing" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">7. When We Share Data & Subprocessors</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("sharing")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "sharing" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>We only share data with third parties in the following limited circumstances:</p>

                <ul className="space-y-2.5 pl-2 text-xs text-[#505f48]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Infrastructure & Hosting Providers:</strong> Secure cloud infrastructure (AWS/Vercel/Google Cloud) and database storage bound by strict Data Processing Agreements.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Enterprise AI Providers:</strong> Scoped prompt execution via OpenAI, Anthropic Claude, xAI, DeepSeek, GLM, and Nomic vector embeddings as detailed in Section 3.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Payment Processors:</strong> Razorpay for subscription lifecycle and PCI-compliant invoicing.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#608044]" />
                    <span><strong>Legal Compliance:</strong> When strictly required to comply with a valid court order, subpoena, or applicable regulatory law.</span>
                  </li>
                </ul>
              </div>
            </article>

            {/* SECTION 8: COOKIES & ANALYTICS */}
            <article id="cookies-analytics" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">8. Cookies & Telemetry</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("cookies-analytics")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "cookies-analytics" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  Elpino uses a minimal approach to cookies:
                </p>
                <div className="space-y-3 text-xs text-[#52624a]">
                  <div className="rounded-xl border border-[#d8e4d3] bg-[#fafcf8] p-4">
                    <strong className="text-[#26371d]">Essential Session Cookies:</strong> We set an essential cookie strictly to maintain your authenticated login state and keep you logged into your dashboard.
                  </div>
                  <div className="rounded-xl border border-[#d8e4d3] bg-[#fafcf8] p-4">
                    <strong className="text-[#26371d]">Optional Analytics:</strong> If you explicitly click &ldquo;Accept All&rdquo; on our cookie consent banner, aggregated analytics (Google Analytics & Microsoft Clarity) help us understand page performance and UI friction. Neither loads if you choose &ldquo;Reject All&rdquo;.
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 9: YOUR RIGHTS */}
            <article id="your-rights" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">9. Your Rights & Global Privacy Compliance</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("your-rights")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "your-rights" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  Regardless of location, we afford all customers robust privacy controls compliant with GDPR, CCPA/CPRA, and global standards:
                </p>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-[#dce6d7] bg-[#fcfdfa] p-3.5">
                    <strong className="text-[#27381e]">Right to Access:</strong> Request a complete copy of personal records held by Elpino.
                  </div>
                  <div className="rounded-xl border border-[#dce6d7] bg-[#fcfdfa] p-3.5">
                    <strong className="text-[#27381e]">Right to Rectification:</strong> Correct inaccurate or outdated account profiles directly.
                  </div>
                  <div className="rounded-xl border border-[#dce6d7] bg-[#fcfdfa] p-3.5">
                    <strong className="text-[#27381e]">Right to Erasure (&ldquo;Forget Me&rdquo;):</strong> Permanently wipe customer conversation history and records.
                  </div>
                  <div className="rounded-xl border border-[#dce6d7] bg-[#fcfdfa] p-3.5">
                    <strong className="text-[#27381e]">Right to Restrict Processing:</strong> Opt out of AI assistance or automated suggestion workflows anytime.
                  </div>
                </div>

                <p className="pt-2 text-xs text-[#5f7057]">
                  To exercise any of these rights, email us at <a href="mailto:hello@elpino.chat" className="font-semibold text-[#374f26] underline">hello@elpino.chat</a>. We acknowledge and act on verified privacy requests within <strong>30 calendar days</strong>.
                </p>
              </div>
            </article>

            {/* SECTION 10: CHANGES & CONTACT */}
            <article id="changes-contact" className="scroll-mt-32 rounded-3xl border border-[#d6e2cf] bg-white p-7 shadow-xs sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e6eee0] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1e3] text-[#4d6a36]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#20251d]">10. Changes to This Policy & Contact Information</h2>
                </div>
                <button
                  type="button"
                  onClick={() => copySectionUrl("changes-contact")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#dce6d6] px-2.5 py-1 text-xs font-medium text-[#64755c] hover:bg-[#f3f7ef]"
                >
                  {copiedSection === "changes-contact" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#515f4a]">
                <p>
                  As we introduce new capabilities, connectors, and model integrations, we may update this Privacy Policy. For material modifications, we will notify registered workspace owners via email or an in-app banner at least 14 days prior to the changes taking effect.
                </p>

                {/* Direct Contact Banner */}
                <div className="mt-8 rounded-2xl border border-[#cde0c5] bg-gradient-to-r from-[#eef6e9] to-[#e4eedf] p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5f7450]">Data Protection Office</p>
                      <h3 className="mt-1 text-xl font-semibold text-[#1e2a16]">Have a question or need a signed DPA?</h3>
                      <p className="mt-1 text-xs text-[#52634a]">Our security and compliance team answers every inquiry promptly.</p>
                    </div>

                    <a
                      href="mailto:hello@elpino.chat"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#20281c] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d532a]"
                    >
                      <Mail className="h-4 w-4" />
                      hello@elpino.chat
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
