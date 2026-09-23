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
  Terminal,
  Code2,
  Workflow,
  CreditCard,
  Building2,
} from "lucide-react";

export function SaaSSoftwareClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "84%",
      label: "Routine developer & setup questions deflected",
      detail: "resolved autonomously with API docs and SDK references",
    },
    {
      value: "3.4x",
      label: "Faster time-to-first-value for new workspaces",
      detail: "guided onboarding walkthroughs for API keys and integrations",
    },
    {
      value: "99.4%",
      label: "Enterprise SLA compliance",
      detail: "for priority accounts ($24k+ ARR) monitored with live timers",
    },
    {
      value: "0",
      label: "Engineering hours wasted on duplicate bug reports",
      detail: "bi-directional Linear and GitHub issue cluster deduplication",
    },
  ];

  const pillars = [
    {
      icon: Terminal,
      title: "Developer & API triage that speaks code",
      tag: "Technical Fluency",
      badge: "API & SDKs",
      description:
        "Elpino understands REST endpoints, curl payloads, webhook signatures, and SDK parameters. When developers encounter HTTP 429 or 504 errors, Elpino explains retry policies with executable code snippets.",
    },
    {
      icon: CreditCard,
      title: "Self-serve billing, upgrades, and seat management",
      tag: "Revenue Acceleration",
      badge: "Stripe Sync",
      description:
        "Connect your Stripe account. Customers can query invoice histories, generate EU VAT receipts, upgrade subscription tiers, and purchase additional seats without waiting on finance.",
    },
    {
      icon: Workflow,
      title: "Bi-directional bridge to Linear and GitHub",
      tag: "Engineering Alignment",
      badge: "Bug Tracking",
      description:
        "Turn customer bug reports into sprint issues in 1 click. When engineering merges a pull request or marks an issue done in Linear, Elpino notifies all affected customers automatically.",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise compliance & security on autopilot",
      tag: "Procurement Speed",
      badge: "SOC 2 & BAA",
      description:
        "Answer procurement questions instantly. Ground the AI in your SOC 2 Type II audit report, GDPR terms, data residency specs, and Okta SAML/SCIM provisioning guides.",
    },
  ];

  const simulations = [
    {
      id: "api",
      title: "API Webhook Triage",
      icon: Terminal,
      badge: "API Specialist",
      customer: "David Chen · Lead Backend Eng at CloudScale",
      query: "Our consumer endpoint is receiving duplicate checkout.session.completed webhooks. Does your platform send idempotency headers?",
      aiResponse:
        "Yes! Every Elpino webhook payload includes the 'Elpino-Signature' and 'Elpino-Event-Id' headers in the HTTP request. We recommend caching the Event-Id with a 24-hour TTL in Redis to enforce idempotency on your webhook handler.",
      citation: "docs.elpino.chat/api/webhooks#idempotency",
      status: "Resolved in 280ms · Code Snippet Delivered",
    },
    {
      id: "okta",
      title: "Enterprise SAML / SCIM SSO",
      icon: Lock,
      badge: "Security & Identity",
      customer: "Elena Rostova · IT Director at DataPulse (Enterprise)",
      query: "How do we enforce mandatory Okta SAML SSO and automated SCIM group deprovisioning for our 180 seats?",
      aiResponse:
        "You can configure Okta SSO in 3 steps: 1) Go to Workspace Settings → Authentication → SAML 2.0; 2) Paste your Okta Metadata XML URL; 3) Generate a SCIM 2.0 Bearer Token to map user roles automatically to groups.",
      citation: "Trust Center · Enterprise Security Playbook v2.4",
      status: "Resolved in 310ms · Documentation Attached",
    },
    {
      id: "billing",
      title: "Self-Serve Plan Upgrade",
      icon: CreditCard,
      badge: "Stripe Integration",
      customer: "Marcus Vance · Stripe Partner Team",
      query: "We want to upgrade from Growth to Enterprise Annual with 10 additional seats. Can you send a prorated checkout link?",
      aiResponse:
        "I've calculated your prorated credit from your remaining Growth cycle. Here is your secure 1-tap Stripe checkout link to activate Enterprise Annual with 10 additional seats: buy.stripe.com/elpino-enterprise-cust9824.",
      citation: "Stripe Connector · cus_9824 Active",
      status: "Checkout Link Generated in 350ms",
    },
    {
      id: "linear",
      title: "Bug Triage & Linear Bridge",
      icon: Workflow,
      badge: "Linear Issue Bridge",
      customer: "Liam Vance · ApexTech",
      query: "We're seeing intermittent 502 Bad Gateway errors when querying the /v1/analytics/realtime endpoint with date filters.",
      aiResponse:
        "Elpino parsed your payload diagnostics, verified query latency on US-East, linked the conversation to Linear issue #LIN-892, and notified engineering. You will be alerted automatically when the hotfix is merged.",
      citation: "Linear Connector · Linear Issue #LIN-892 Created",
      status: "Linear Bug Synced · Engineering Notified",
    },
  ];

  const faqs = [
    {
      q: "How does Elpino handle technical SaaS documentation?",
      a: "Elpino ingests your public developer documentation, API specifications (OpenAPI/Swagger), GitHub readmes, and changelog posts. It breaks documentation down into semantic vector chunks so it can quote exact parameter names, headers, and code snippets.",
    },
    {
      q: "Can Elpino interact directly with our product database or Stripe?",
      a: "Yes. Through our secure integration connectors and webhooks, Elpino can verify customer subscription tiers, check account provisioning statuses, generate prorated upgrade links, and inspect order records in real time.",
    },
    {
      q: "How does the Linear and GitHub integration prevent duplicate bug tickets?",
      a: "When multiple customers report the same bug, Elpino clusters the conversations semantically and attaches them all to a single Linear issue rather than flooding your engineering team with 20 duplicate tickets.",
    },
    {
      q: "Can we configure custom SLA policies for our high-ARR enterprise accounts?",
      a: "Yes. You can define distinct SLA countdown policies based on customer ARR, subscription tier, or custom tags. Enterprise tickets can be routed directly to senior technical leads with sub-15 minute response targets.",
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
              <Building2 size={13} className="text-[#ff5600]" />
              Solutions / SaaS &amp; Software Teams
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Support that knows your software as well as{" "}
                <span className="italic text-[#ff5600]">your best engineer.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Elpino turns your developer docs, API specs, and product guides into fast, technical
                customer support. Resolve 84% of setup and API questions autonomously while keeping
                your engineering team focused on shipping code.
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
                  Book SaaS demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Native Linear &amp; GitHub sync
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Live Stripe MRR telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 14-day free trial
                </span>
              </div>
            </div>

            {/* Mascot Picture Display: Founders Sloth */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        SaaS Support Intelligence
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Developer Ready
                    </span>
                  </div>

                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/founders-sloth-v2.png"
                      alt="SaaS Founder and Engineer Sloth"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Developer Deflection
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">84%</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Resolved via API docs</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Linear Bridge
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">Automated</div>
                      <div className="text-[11px] text-black/50">Zero manual bug logging</div>
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

      {/* 3. FOUR CORE SAAS PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Built for High-Growth Software
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Every customer moment handled with precision.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              From onboarding developers and debugging webhooks to converting trials and retaining
              enterprise VIP accounts, Elpino accelerates every stage of the SaaS customer lifecycle.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => {
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

      {/* 4. INTERACTIVE SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Simulation
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience SaaS support in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through real-world software scenarios below to see how Elpino handles webhook
              idempotency, Okta SCIM sync, 1-tap Stripe checkout links, and Linear bug sync.
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
                  <span>{activeSim.title}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    {activeSim.badge}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">User: {activeSim.customer}</div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSim.status}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Customer Query
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "{activeSim.query}"
                </p>
              </div>

              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Elpino Grounded Resolution</span>
                  <span className="font-mono text-white/40 text-[10px]">{activeSim.citation}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSim.aiResponse}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                <span>Integrated with Stripe, Linear, and your developer docs</span>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff5600] px-4 py-1.5 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  Test in your SaaS workspace →
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
              Support built for modern SaaS architectures.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Technical details on API docs, Linear deduplication, Stripe billing, and enterprise SLAs.
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
            Accelerate Your SaaS Growth
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Supercharge support. Keep developers coding.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect Stripe, Linear, and your documentation in
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
