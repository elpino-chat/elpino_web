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
  ScanSearch,
  Eye,
  TrendingUp,
  BarChart3,
  Globe,
  Building2,
  Clock,
  MousePointer,
  ArrowUpRight,
  Compass,
  Layers,
  Activity,
  Users,
  CreditCard,
  Laptop,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Radar,
} from "lucide-react";

export function VisitorIntelligenceClient() {
  const [activePersona, setActivePersona] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "3.2x",
      label: "Higher inbound sales conversion",
      detail: "Proactive routing triggers when high-intent enterprise accounts are detected",
    },
    {
      value: "48%",
      label: "Faster time to resolution",
      detail: "Eliminates 'What page are you on and what plan do you have?' questioning",
    },
    {
      value: "< 40ms",
      label: "Telemetry stream latency",
      detail: "Real-time presence and journey events streamed with zero page load penalty",
    },
    {
      value: "100%",
      label: "GDPR & CCPA compliant",
      detail: "Strict IP anonymization and cookieless tracking modes for European privacy",
    },
  ];

  const personas = [
    {
      name: "High-Intent Enterprise Prospect",
      company: "Apex Cloud Infrastructure",
      badge: "Sales Acceleration",
      badgeColor: "border-[#428ce5] text-[#3569ad] bg-[#edf3fa]",
      dwellTime: "4m 18s on /pricing/enterprise",
      intentScore: "98 / 100 (Extremely High)",
      enrichment: "450 employees • $120M ARR • Tech stack: AWS, Snowflake, Datadog",
      currentAction: "Adjusting enterprise seat slider (500+ seats)",
      suggestedIntervention:
        "Proactively trigger high-touch prompt: 'Hi there! Looking to deploy Elpino across 500+ seats? Our Enterprise Solutions Architect is online to answer SLA and custom VPC questions.'",
    },
    {
      name: "Frustrated Self-Serve User",
      company: "VentureCraft Studio",
      badge: "Churn Prevention",
      badgeColor: "border-[#ff5600] text-[#ff5600] bg-[#fff0e8]",
      dwellTime: "1m 45s on /settings/billing",
      intentScore: "Rage Click Detected (3 clicks on payment retry)",
      enrichment: "12 team members • Pro Plan ($199/mo) • Customer for 8 months",
      currentAction: "Stripe error 402 card declined modal open",
      suggestedIntervention:
        "Whisper intervention: 'We noticed your card update ran into a 3D-Secure timeout. Would you like a temporary 7-day grace extension while you check with your bank?'",
    },
    {
      name: "Returning Developer VIP",
      company: "Kinetix Robotics",
      badge: "Technical Fluency",
      badgeColor: "border-[#18c983] text-[#168a5b] bg-[#eef7f1]",
      dwellTime: "6m 12s on /docs/api/webhooks",
      intentScore: "85 / 100 (Developer Integration)",
      enrichment: "85 employees • Growth Tier • 1.4M API requests this month",
      currentAction: "Testing webhook signature verification code snippet in Python",
      suggestedIntervention:
        "Contextual assist: 'Need sample HMAC-SHA256 Python verification code? Here is our open source FastAPI middleware example.'",
    },
  ];

  const pillars = [
    {
      icon: Activity,
      title: "Real-time Journey & Live Breadcrumbs",
      badge: "Real-time Telemetry",
      description:
        "Watch visitor navigation as it happens. Support reps see the exact sequence of pages visited, dwell duration, and previous interaction history before sending their first reply.",
      points: [
        "Live page path: Referrer → Blog post → Feature page → Pricing calculator",
        "Rage click & frustration triggers: automatic flags when users repeatedly click unresponsive elements",
        "Console error capture: automatically surfaces 404s and 500 API exceptions",
        "UTM and attribution tracking: Google Ads, LinkedIn campaigns, and partner referrals",
      ],
      metric: "< 40ms",
      metricLabel: "Live telemetry sync speed",
    },
    {
      icon: Building2,
      title: "Automated B2B Firmographic Enrichment",
      badge: "Data Enrichment",
      description:
        "Turn anonymous website visitors into rich B2B company profiles. Elpino integrates with Clearbit, Apollo, and reverse-IP lookups to reveal corporate identity instantly.",
      points: [
        "Identify company name, industry vertical, headquarters, and employee headcount",
        "Estimate annual revenue range and recent venture funding rounds",
        "Detect client-side tech stack: frontend framework, analytics tools, CRM",
        "Zero setup: automated domain resolution without asking for email forms",
      ],
      metric: "82%",
      metricLabel: "B2B domain match rate",
    },
    {
      icon: CreditCard,
      title: "Live CRM & Stripe Subscription Context",
      badge: "Account Synchronization",
      description:
        "Never ask a customer what plan they are on. Elpino pulls live subscription data from Stripe, HubSpot, Salesforce, and Segment directly into the support sidebar.",
      points: [
        "Current subscription tier, monthly ARR, contract renewal date, and billing health",
        "Account owner, designated Customer Success Manager, and open sales deals",
        "Lifetime support ticket volume and historical CSAT ratings",
        "Custom workspace metadata: user role (Admin, Member, Billing Owner)",
      ],
      metric: "100%",
      metricLabel: "Real-time data synchronization",
    },
    {
      icon: ShieldCheck,
      title: "Zero-Trust Privacy & Cookieless Tracking",
      badge: "Privacy Governance",
      description:
        "Enterprise intelligence built with privacy by design. Meet strict European GDPR, UK DPA, and California CCPA regulations without sacrificing actionable context.",
      points: [
        "IP masking and hashing before telemetry hits storage clusters",
        "Cookieless mode supported for privacy-first European deployments",
        "Automatic masking of sensitive form fields (passwords, credit cards, SSNs)",
        "Configurable data retention windows (7, 30, or 90 days)",
      ],
      metric: "SOC 2 Type II",
      metricLabel: "Enterprise privacy certified",
    },
  ];

  const faqs = [
    {
      q: "Does Visitor Intelligence slow down our website page load speeds?",
      a: "No. The Elpino telemetry script is asynchronous, lightweight (< 14KB gzipped), and delivered via global Cloudflare edge CDN. It has zero impact on Core Web Vitals, First Contentful Paint (FCP), or SEO scores.",
    },
    {
      q: "How does Elpino respect GDPR and user privacy?",
      a: "Elpino complies strictly with GDPR, CCPA, and ePrivacy regulations. Telemetry can run in cookieless mode, IP addresses are anonymized before storage, and visitors can easily opt-out via your existing cookie consent banners (OneTrust, Cookiebot).",
    },
    {
      q: "Can we trigger automated proactive chat messages based on visitor dwell time?",
      a: "Yes. For example, if an enterprise prospect spends more than 90 seconds on your Enterprise Pricing page or toggles the volume slider to 100k+ events, Elpino can trigger a personalized, low-friction welcome message.",
    },
    {
      q: "How does the system link anonymous browsing to an authenticated user?",
      a: "When a visitor logs in to your web application, your app sends an identity token to Elpino. Elpino immediately stitches their previous anonymous pre-login browsing path to their authenticated user profile.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(66,140,229,0.08),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(24,201,131,0.06),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#428ce5]/20 bg-[#edf3fa] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3569ad]">
                <Radar size={14} className="text-[#3569ad]" />
                Real-Time Behavioral Telemetry
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                A better conversation starts with{" "}
                <span className="text-[#3569ad]">better context.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#53616b] sm:text-xl">
                Give your team a clear, real-time view of who is asking, what they have seen, and what they need next.
                Turn anonymous website visits into rich customer stories without asking repetitive clarifying questions.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#17181c] px-7 text-sm font-semibold text-white transition hover:bg-[#3569ad]"
                >
                  Start free trial <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#f1edf7]"
                >
                  Book intelligence demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#53616b]">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Reverse-IP company enrichment
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Live page breadcrumb & rage click alerts
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 100% GDPR cookieless mode
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Radar Visualizer */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4effb] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#17181c] text-white">
                      <ScanSearch size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Live Visitor Telemetry</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    Telemetry Active • 40ms sync
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/customer-growth-illustration.png"
                      alt="Elpino customer growth illustration showing visitor intelligence"
                      width={1200}
                      height={1200}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Visitor: CloudScale Systems</span>
                        <span className="text-[#3569ad]">San Francisco, CA</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#168a5b]">
                        Intent: 94% • Reading Enterprise Security SLA • 650 employees
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>Dwell: 3m 42s</span>
                        <span className="font-bold text-[#7651b0]">Paging Sales AE</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#428ce5]/20 bg-[#edf3fa] p-3 text-xs text-[#3569ad]">
                      <span className="font-semibold">Insight:</span> Visitor arrived from LinkedIn Ads &apos;SOC2_Fintech&apos;. High conversion likelihood.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-black/10 bg-[#17181c] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
            Data-Driven Support & Revenue Impact
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-[#428ce5] pl-6">
                <p className="text-4xl font-normal tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Simulator: Live Visitor Radar Console */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#edf3fa] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3569ad]">
              <Sparkles size={13} />
              Interactive Telemetry Radar
            </span>
            <h2 className="mt-5 text-balance text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Inspect how visitor context illuminates the conversation.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Select a visitor persona to see how real-time behavioral telemetry, B2B firmographic enrichment, and account history empower your team.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-black/10 bg-[#fbfbfa] p-5 shadow-xl sm:p-8 lg:p-10">
            {/* Persona Switcher */}
            <div className="grid gap-4 md:grid-cols-3">
              {personas.map((persona, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePersona(idx)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    activePersona === idx
                      ? "border-[#17181c] bg-white shadow-md ring-2 ring-[#17181c]/10"
                      : "border-black/10 bg-white/70 hover:bg-white"
                  }`}
                >
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${persona.badgeColor}`}>
                    {persona.badge}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#17181c]">{persona.company}</h3>
                  <p className="mt-1 text-xs text-[#53616b]">{persona.name}</p>
                </button>
              ))}
            </div>

            {/* Telemetry Visualizer Card */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: What the Agent Sees in the Sidebar */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#53616b]">
                    Live Telemetry Sidebar
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#18c983]">
                    <span className="size-2 rounded-full bg-[#18c983]" />
                    Real-time Active Session
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#17181c]">{personas[activePersona].company}</span>
                      <span className="font-mono text-[#53616b]">{personas[activePersona].dwellTime}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#53616b]">
                      <strong>Enriched Profile:</strong> {personas[activePersona].enrichment}
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                    <p className="text-xs font-semibold text-[#7651b0]">Current In-Session Telemetry:</p>
                    <p className="mt-1 text-xs text-[#17181c]">{personas[activePersona].currentAction}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] font-medium text-[#53616b]">
                      <span>Intent Classification:</span>
                      <span className="font-bold text-[#3569ad]">{personas[activePersona].intentScore}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#428ce5]/20 bg-[#edf3fa] p-4 text-xs">
                    <p className="font-semibold text-[#3569ad]">Suggested Proactive Intervention:</p>
                    <p className="mt-1 text-[#53616b]">{personas[activePersona].suggestedIntervention}</p>
                  </div>
                </div>
              </div>

              {/* Right: Technical Ingestion Stream */}
              <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#17181c] p-6 text-white shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-[#d9bef4]">Edge Telemetry Stream</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70">
                      WebSocket wss://live.elpino.chat
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 font-mono text-xs">
                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// Reverse-IP Domain Match</span>
                      <p className="mt-1 text-[#18c983]">domain: &quot;{personas[activePersona].company.toLowerCase().replace(/\s+/g, "")}.com&quot;</p>
                      <p className="text-white/70">confidence: 0.96</p>
                      <p className="text-white/70">security_compliance: &quot;GDPR_Anonymized&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// Real-time Behavior Metrics</span>
                      <p className="mt-1 text-[#428ce5]">dwell_seconds: 258</p>
                      <p className="text-white/70">rage_click_frequency: 0</p>
                      <p className="text-white/70">viewport: &quot;1920x1080 (Desktop)&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// Routing Action</span>
                      <p className="mt-1 text-[#d9bef4]">auto_route: &quot;VIP_POD_US_WEST&quot;</p>
                      <p className="text-white/70">sla_threshold: &quot;15 seconds&quot;</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
                  <span className="font-semibold text-white">Impact:</span> Agent knows the complete story before typing a single keystroke.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Architectural Pillars */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#3569ad]">
              Architecture & Telemetry
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Engineered for lightning-fast insights and rock-solid privacy.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Support teams that understand the full customer context resolve tickets twice as fast with twice the customer satisfaction.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md sm:p-9"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#edf3fa] text-[#3569ad]">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-black/10 bg-[#fbfbfa] px-3 py-1 text-xs font-semibold text-[#53616b]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-normal tracking-[-0.04em] text-[#17181c]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#53616b]">
                      {pillar.description}
                    </p>

                    <div className="mt-6 space-y-2.5 border-t border-black/5 pt-5">
                      {pillar.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#53616b]">
                          <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="text-xs font-medium text-[#53616b]">{pillar.metricLabel}</span>
                    <span className="text-xl font-bold tracking-tight text-[#3569ad]">{pillar.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive FAQs */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] sm:text-5xl">
              Everything you need to know about Visitor Intelligence.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 rounded-2xl border border-black/10 bg-[#fbfbfa]">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 transition hover:bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="text-base font-semibold text-[#17181c]">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-[#53616b] transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-[#3569ad]" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm leading-relaxed text-[#53616b]">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
                See the full picture on every conversation
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Ready to empower your team with actionable context?
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Install our lightweight telemetry snippet in under 60 seconds or integrate with Google Tag Manager.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Book product tour
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
