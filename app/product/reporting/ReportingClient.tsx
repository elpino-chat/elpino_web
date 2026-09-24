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
  LineChart,
  PieChart,
  Gauge,
  Calendar,
  Filter,
  Download,
  Users,
  Eye,
  SlidersHorizontal,
  FolderOpen,
  Lock,
  Star,
  CheckCircle2,
  FileSpreadsheet,
  Split,
  Database,
  Search,
  Globe,
  Tag,
  Laptop,
  Flame,
  Award,
  Share2,
} from "lucide-react";

export function ReportingClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeReportCategory, setActiveReportCategory] = useState<number>(0);

  const stats = [
    {
      value: "76.4%",
      label: "AI autonomous resolution rate",
      detail: "resolved end-to-end without human intervention",
    },
    {
      value: "38s",
      label: "Median first response time",
      detail: "down from 18 minutes across live chat and email",
    },
    {
      value: "4.92 / 5",
      label: "Average customer CSAT",
      detail: "based on 12,400+ verified post-chat customer ratings",
    },
    {
      value: "10+",
      label: "Configurable chart visualizations",
      detail: "drag-and-drop dashboards with deep CSV & API exports",
    },
  ];

  const valuePillars = [
    {
      icon: Layers,
      title: "Move faster with templates",
      description:
        "Make data-driven decisions faster with 12 pre-built reports expertly curated to cover all of your support operations, from first response times to team capacity.",
    },
    {
      icon: SlidersHorizontal,
      title: "Make every report your own",
      description:
        "Configure custom dashboards with 10 flexible chart types, multi-metric scorecards, drag-and-drop layouts, and goal targets that help your team spot trends.",
    },
    {
      icon: TrendingUp,
      title: "Deeper, actionable insights",
      description:
        "Drill directly from high-level charts into individual underlying customer conversations, apply advanced filters, and compare time periods to discover emerging issues.",
    },
  ];

  const readyMadeReports = [
    {
      id: "holistic",
      tag: "Holistic Support Overview",
      title: "AI and human support together in one unified report",
      subtitle: "See your entire support ecosystem at a single glance",
      description:
        "Analyze total conversation volume, channel distribution, and performance metrics across both your autonomous AI agent and human support team. Uncover what drives satisfaction and where tickets get escalated.",
      bullets: [
        "Track total conversation volume split between AI deflection and human inbox",
        "Monitor median first response time (FRT) and time to resolution (TTR)",
        "Identify high-traffic hours and plan team shift schedules accordingly",
      ],
      image: "/images/customer-growth-illustration.png",
      badge: "Pre-Built Dashboard · Core Overview",
      kpis: [
        { label: "Total Volume", value: "14,820", trend: "+12.4% MoM" },
        { label: "AI Deflection", value: "76.4%", trend: "11,322 resolved" },
        { label: "Escalated to Human", value: "23.6%", trend: "3,498 tickets" },
        { label: "Median First Response", value: "38 seconds", trend: "-45% wait time" },
      ],
    },
    {
      id: "teammates",
      tag: "Teammate Performance",
      title: "Coach your team and optimize workload with granular metrics",
      subtitle: "Empower support managers with transparent team telemetry",
      description:
        "View individual agent capacity, resolution volume, customer satisfaction ratings, active handling time, and AI Copilot adoption. Recognize top performers and identify teammates who need coaching.",
      bullets: [
        "Leaderboards sorted by ticket throughput, CSAT ratings, and speed",
        "Track AI Copilot draft acceptance rates and edit percentages per teammate",
        "Monitor active online hours and ticket concurrency to prevent burnout",
      ],
      image: "/images/busy-teams-sloth-v2.png",
      badge: "Team Telemetry & Leaderboards",
      kpis: [
        { label: "Top Performer CSAT", value: "99.4%", trend: "Jordan Miller (428 tickets)" },
        { label: "Average Handle Time", value: "4m 12s", trend: "-28% with Copilot" },
        { label: "Copilot Adoption", value: "88.6%", trend: "Drafts approved with 1 click" },
        { label: "SLA Compliance", value: "99.1%", trend: "0 breached P0 tickets" },
      ],
    },
    {
      id: "topics",
      tag: "Conversation Topics & Sentiment",
      title: "Understand what customers are asking with automated AI clustering",
      subtitle: "Zero manual tagging required",
      description:
        "Elpino’s AI automatically clusters incoming customer messages into semantic topics, sentiment categories, and product areas. Spot emerging bugs, billing confusion, and feature requests before they escalate.",
      bullets: [
        "Uncover spiking topics and recurring user friction points in real time",
        "Track sentiment shifts by customer subscription tier and ARR",
        "Feed customer feedback directly to product and engineering roadmaps",
      ],
      image: "/images/founders-sloth-v2.png",
      badge: "Semantic AI Topic Clustering",
      kpis: [
        { label: "Top Spiking Topic", value: "Webhook 429 Errors", trend: "+34% this week" },
        { label: "Billing & Invoices", value: "24.8%", trend: "92% AI resolved" },
        { label: "SAML / SSO Inquiries", value: "18.2%", trend: "Enterprise segment" },
        { label: "Overall Sentiment", value: "94% Positive", trend: "Stable" },
      ],
    },
  ];

  const customizationFeatures = [
    {
      tag: "10 Chart Visualizations",
      title: "A rich chart library for every metric",
      description:
        "Build the exact visualizations you need: KPI scorecards, area charts, bar graphs, donut splits, heatmaps, multi-metric tables, combo charts, and SLA distribution curves.",
      icon: BarChart3,
      badge: "10 Chart Types",
      color: "bg-[#ff5600]/10 text-[#ff5600] border-[#ff5600]/20",
    },
    {
      tag: "Drag-and-Drop Layouts",
      title: "Fully customizable report canvases",
      description:
        "Arrange widgets with drag-and-drop ease, resize charts to emphasize key indicators, set target goals to track quarterly OKRs, and pin critical boards to your sidebar.",
      icon: SlidersHorizontal,
      badge: "Flexible Canvas",
      color: "bg-[#428ce5]/10 text-[#428ce5] border-[#428ce5]/20",
    },
    {
      tag: "Advanced Formula Metrics",
      title: "Custom calculations tailored to your business",
      description:
        "Combine custom ticket attributes, user MRR segments, and CRM fields to create bespoke metrics like Cost Per Resolved Ticket or VIP Response Latency.",
      icon: Gauge,
      badge: "Custom Formulas",
      color: "bg-[#18c983]/10 text-[#18c983] border-[#18c983]/20",
    },
  ];

  const drillDownFeatures = [
    {
      title: "Chart drill-in to underlying conversations",
      description:
        "See a sudden spike in negative CSAT or a dip in first response time? Click directly on that data point on the chart to instantly open the exact list of customer conversations.",
      icon: Search,
      tag: "1-Click Drill-In",
    },
    {
      title: "Granular multi-attribute filters",
      description:
        "Filter any report by channel, teammate, customer tier (Enterprise vs Free), country, language, sentiment score, or custom Stripe attributes.",
      icon: Filter,
      tag: "Multi-Attribute",
    },
    {
      title: "Time period & benchmark comparisons",
      description:
        "Overlay this week against last week, or compare year-over-year performance to quantify the exact business impact of deploying AI automations.",
      icon: Calendar,
      tag: "Time Travel",
    },
  ];

  const governanceFeatures = [
    {
      title: "Export data with ease",
      description:
        "Download one-click CSV reports or leverage bulk REST API webhooks to pipe support telemetry directly into Snowflake, BigQuery, or Tableau.",
      icon: Download,
      image: "/images/trust-sloth.png",
      badge: "CSV & Data Warehouse Sync",
    },
    {
      title: "Granular access control",
      description:
        "Assign role-based viewing and editing permissions. Ensure sensitive financial and customer ARR metrics are only accessible to leadership.",
      icon: Lock,
      image: "/images/agencies-services-sloths.png",
      badge: "Role-Based Permissions",
    },
    {
      title: "Folders & pinned dashboards",
      description:
        "Keep your reports organized in custom team folders. Pin daily operational dashboards to your workspace header for instant access.",
      icon: FolderOpen,
      image: "/images/about-sloth-crew.png",
      badge: "Team Organization",
    },
  ];

  const simulatorScenarios = [
    {
      id: "overview",
      title: "Unified AI + Human Overview",
      icon: Layers,
      summary: "Combined telemetry showing volume deflection, response times, and channel breakdown.",
      data: {
        totalTickets: "14,820",
        aiResolved: "11,322 (76.4%)",
        humanHandled: "3,498 (23.6%)",
        avgFirstResponse: "38s (AI) / 4m 12s (Human)",
        csat: "4.92 / 5.0 (97.8% positive)",
      },
      chartRows: [
        { label: "Website Live Chat Widget", ai: 84, human: 16, volume: "8,420 tickets" },
        { label: "Support Email (support@)", ai: 68, human: 32, volume: "4,150 tickets" },
        { label: "Slack Connect Channels", ai: 72, human: 28, volume: "1,450 tickets" },
        { label: "WhatsApp & Telegram Bot", ai: 89, human: 11, volume: "800 tickets" },
      ],
    },
    {
      id: "teammates",
      title: "Teammate Performance Leaderboard",
      icon: Users,
      summary: "Individual agent resolution throughput, handle time, and AI Copilot adoption.",
      data: {
        totalTickets: "3,498",
        aiResolved: "N/A (Human Queue)",
        humanHandled: "100%",
        avgFirstResponse: "3m 48s",
        csat: "4.95 / 5.0",
      },
      agentRows: [
        {
          name: "Jordan Miller",
          role: "Senior Escalations",
          resolved: 428,
          csat: "99.4%",
          handleTime: "3m 42s",
          copilotRate: "92%",
          status: "Top Performer",
        },
        {
          name: "Alex Chen",
          role: "Platform Engineer",
          resolved: 382,
          csat: "98.8%",
          handleTime: "4m 10s",
          copilotRate: "89%",
          status: "Fastest Response",
        },
        {
          name: "Sarah Jenkins",
          role: "Customer Success",
          resolved: 345,
          csat: "98.2%",
          handleTime: "4m 35s",
          copilotRate: "86%",
          status: "High Volume",
        },
        {
          name: "David Vance",
          role: "Billing Specialist",
          resolved: 310,
          csat: "97.6%",
          handleTime: "5m 02s",
          copilotRate: "84%",
          status: "Complex Queries",
        },
      ],
    },
    {
      id: "topics",
      title: "AI Topic Clustering & Trends",
      icon: Sparkles,
      summary: "Semantic classification of incoming customer discussions with weekly velocity.",
      data: {
        totalTickets: "14,820",
        aiResolved: "100% Categorized",
        humanHandled: "Self-Organizing",
        avgFirstResponse: "Instant",
        csat: "Sentiment: 94% Positive",
      },
      topicRows: [
        {
          topic: "Webhook 429 & Retry Timeouts",
          share: "34.2%",
          trend: "+42% spike",
          trendColor: "text-[#ff5600]",
          aiRate: "88%",
          sentiment: "Neutral",
        },
        {
          topic: "Subscription Billing & Upgrades",
          share: "26.4%",
          trend: "+6% steady",
          trendColor: "text-[#18c983]",
          aiRate: "94%",
          sentiment: "Positive",
        },
        {
          topic: "Okta SAML / SCIM Provisioning",
          share: "21.6%",
          trend: "+14% MoM",
          trendColor: "text-[#428ce5]",
          aiRate: "78%",
          sentiment: "Neutral",
        },
        {
          topic: "Custom Branding & CSS Overrides",
          share: "17.8%",
          trend: "-8% drop",
          trendColor: "text-black/50",
          aiRate: "96%",
          sentiment: "Positive",
        },
      ],
    },
    {
      id: "csat",
      title: "CSAT & SLA Breach Telemetry",
      icon: ShieldCheck,
      summary: "Customer rating distributions and enterprise contractual SLA adherence tracking.",
      data: {
        totalTickets: "14,820",
        aiResolved: "99.4% within SLA",
        humanHandled: "98.8% within SLA",
        avgFirstResponse: "38s global avg",
        csat: "4.92 / 5.0 (97.8% 5-Star)",
      },
      slaRows: [
        { tier: "Enterprise VIP (Target: < 15m)", achieved: "99.8%", avgTime: "1m 45s", breaches: 0 },
        { tier: "Growth Tier (Target: < 1h)", achieved: "99.2%", avgTime: "8m 12s", breaches: 2 },
        { tier: "Starter Tier (Target: < 4h)", achieved: "99.5%", avgTime: "14m 30s", breaches: 4 },
        { tier: "Trial Accounts (Target: < 24h)", achieved: "100%", avgTime: "22m 10s", breaches: 0 },
      ],
    },
  ];

  const powerGrid = [
    {
      title: "Peak Contact Heatmaps",
      description:
        "Visualize customer inquiry volume by hour of day and day of week to allocate staffing perfectly.",
      icon: Clock,
      badge: "Heatmap",
    },
    {
      title: "Automated Executive Digests",
      description:
        "Schedule weekly PDF or Slack summaries of core KPIs delivered straight to leadership every Monday.",
      icon: FileSpreadsheet,
      badge: "Scheduled",
    },
    {
      title: "Multi-Brand Segmentation",
      description:
        "Compare resolution performance across multiple domains, subsidiary brands, and product lines.",
      icon: Split,
      badge: "Multi-Brand",
    },
    {
      title: "Custom SLA Policy Rules",
      description:
        "Configure strict response and resolution thresholds based on customer MRR or ticket priority.",
      icon: Award,
      badge: "SLA Guard",
    },
    {
      title: "Churn Risk Early Warnings",
      description:
        "AI identifies dissatisfied enterprise accounts based on conversation sentiment before they cancel.",
      icon: Flame,
      badge: "Retention",
    },
    {
      title: "Resolution Cost Calculator",
      description:
        "Measure exact financial savings from AI ticket deflection compared to manual agent staffing costs.",
      icon: TrendingUp,
      badge: "ROI Analytics",
    },
    {
      title: "TV Kiosk Display Mode",
      description:
        "Full-screen high-contrast live dashboard designed to project team performance onto office monitors.",
      icon: Laptop,
      badge: "Live Kiosk",
    },
    {
      title: "Raw Telemetry & Webhooks",
      description:
        "Stream granular conversation events in real time to your company's data lake via event webhooks.",
      icon: Database,
      badge: "Event Stream",
    },
  ];

  const faqs = [
    {
      q: "What is reporting and analytics in Elpino?",
      a: "Elpino's reporting and analytics suite lets you monitor, analyze, and optimize your entire support operation in one place. Track human and AI support together with pre-built reports, build custom dashboards with your own charts and filters, and follow real-time performance metrics like resolution rate, response time, and CSAT.",
    },
    {
      q: "What reports does Elpino include out of the box?",
      a: "Elpino comes with 12 pre-built reports, curated to cover common support use cases. They include a holistic support overview that shows human and AI support in a single report, a teammate performance report for first response times, resolution rates, and CSAT, and a conversation topics report that surfaces what customers are contacting you about.",
    },
    {
      q: "Can I build custom reports and dashboards?",
      a: "Yes. The report builder lets you create custom reports and dashboards with up to ten chart types, including KPI, column, bar, donut, line, area, heatmap, table, combo, and multi-metric charts. Every layout is fully customizable, so you can drag, drop, and resize charts, set targets to track progress, and apply advanced filters with custom attributes.",
    },
    {
      q: "How does Elpino report on AI and human support together?",
      a: "The holistic support overview brings human and AI support into a single report, so you can analyze volume distribution, uncover low-satisfaction drivers, and track key metrics like resolution rate, response time, and CSAT across both your autonomous AI agent and your team in the Inbox.",
    },
    {
      q: "How do I track CSAT and customer satisfaction?",
      a: "CSAT is built into Elpino's reports, so you can track customer satisfaction alongside resolution rate and response time, then drill into the conversations behind low-satisfaction scores to understand what's driving them. You can also compare CSAT across time periods to spot changes in trends.",
    },
    {
      q: "How do I see what customers are contacting us about?",
      a: "The conversation topics report uses AI to organize conversations by topic automatically, so you can track tags, peak activity periods, and your most common customer issues without manual tagging. Use it to spot emerging trends and prioritize product improvements.",
    },
    {
      q: "How do I export my support data?",
      a: "You can export your data with one-click CSV downloads, or use bulk API access to connect Elpino reporting directly to your data warehouse (Snowflake, BigQuery) and visualization tools (Tableau, Looker, Metabase).",
    },
    {
      q: "Who can view or edit reports, and how do I stay organized?",
      a: "Reporting includes customizable role-based access levels, from full editing to view-only, so you control who sees and changes each report. Keep everything organized with custom team folders, and favorite the reports you check most often for instant access.",
    },
  ];

  const activeCategory = readyMadeReports[activeReportCategory];
  const activeSim = simulatorScenarios[activeTab];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#ff5600]/20 selection:text-[#ff5600]">
      {/* 1. HERO SECTION matching Intercom Reporting Architecture */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black/75">
              <Sparkles size={13} className="text-[#ff5600]" />
              Elpino Helpdesk · AI Reporting &amp; Analytics
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Get instant insights with{" "}
                <span className="italic text-[#ff5600]">AI reporting and analysis.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Monitor, analyze, and optimize your entire support operation in one place. Track
                human and AI performance together, build custom metric dashboards, and uncover
                what customers care about most.
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
                  Book reporting demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 12 pre-built templates
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Real-time telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> 1-click CSV &amp; API export
                </span>
              </div>
            </div>

            {/* Featured Hero Visual using Customer Growth Illustration */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[540px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  {/* Chrome top bar */}
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Executive Operations Pulse
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Live Sync Active
                    </span>
                  </div>

                  {/* High quality illustration */}
                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/customer-growth-illustration.png"
                      alt="Customer Growth Analytics and Reporting"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  {/* Micro telemetry widgets */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        AI Deflection
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">76.4%</div>
                      <div className="text-[11px] text-[#18c983] font-medium">↑ 4.2% vs last month</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Overall CSAT
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">4.92 / 5</div>
                      <div className="text-[11px] text-black/50">97.8% positive feedback</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live Analytics Dashboard Console */}
          <div className="mt-16 sm:mt-20 overflow-hidden rounded-2xl border border-black/15 bg-[#17181c] text-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.45)]">
            {/* Header controls bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#1f2026] px-6 py-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="font-semibold text-white ml-2 text-sm">
                  Support Performance &amp; AI Analytics
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  Dashboard #12 · Default
                </span>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1.5 rounded-lg bg-black/40 p-1 border border-white/10">
                {["7d", "30d", "90d", "YTD"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeRange(t)}
                    className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                      timeRange === t ? "bg-[#ff5600] text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* 4 Top KPI Scorecards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                    Total Volume
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">14,820</div>
                  <div className="text-xs text-[#18c983] mt-1 font-medium">↑ 12.4% vs previous</div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                    AI Autonomous Deflection
                  </div>
                  <div className="text-2xl font-bold text-[#ff5600] mt-1">76.4%</div>
                  <div className="text-xs text-white/60 mt-1">11,322 resolved by AI</div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                    Median First Response
                  </div>
                  <div className="text-2xl font-bold text-[#428ce5] mt-1">38s</div>
                  <div className="text-xs text-[#18c983] mt-1 font-medium">-45% faster wait time</div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                    Customer CSAT
                  </div>
                  <div className="text-2xl font-bold text-[#18c983] mt-1">4.92 / 5</div>
                  <div className="text-xs text-white/60 mt-1">97.8% positive ratings</div>
                </div>
              </div>

              {/* 2 Big Chart Containers */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart 1: Volume Breakdown Area Curve (2 Cols) */}
                <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div>
                      <div className="font-semibold text-sm text-white">
                        AI Deflection vs Human Escalation Volume
                      </div>
                      <div className="text-xs text-white/50">Daily distribution over past 30 days</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-[#ff5600]">
                        <span className="size-2.5 rounded-full bg-[#ff5600]" /> AI Resolved (76%)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#428ce5]">
                        <span className="size-2.5 rounded-full bg-[#428ce5]" /> Human Escalated (24%)
                      </span>
                    </div>
                  </div>

                  {/* Simulated Visual Area Graph */}
                  <div className="h-44 w-full flex items-end gap-2 pt-4 px-2">
                    {[42, 55, 68, 74, 82, 79, 85, 90, 88, 92, 95, 91, 88, 94, 98, 95, 92, 96, 99, 94, 91, 95, 98, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-[#ff5600]/40 to-[#ff5600] group-hover:from-[#ff5600] group-hover:to-white transition"
                        />
                        <div
                          style={{ height: `${Math.max(10, 100 - h)}%` }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-[#428ce5]/30 to-[#428ce5]/80"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/40 pt-3 border-t border-white/5">
                    <span>Day 1</span>
                    <span>Day 10</span>
                    <span>Day 20</span>
                    <span>Day 30 (Today)</span>
                  </div>
                </div>

                {/* Chart 2: Topic Clusters & Semantic Breakdown */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div className="font-semibold text-sm text-white">Top Inbound Topics</div>
                      <span className="text-[10px] text-white/50 font-mono">Semantic AI</span>
                    </div>

                    <div className="space-y-3 mt-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                          <span>Webhook 429 &amp; Rate Limits</span>
                          <span className="font-bold text-[#ff5600]">34.2%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#ff5600] rounded-full" style={{ width: "34.2%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                          <span>Billing &amp; Subscription Upgrades</span>
                          <span className="font-bold text-[#18c983]">26.4%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#18c983] rounded-full" style={{ width: "26.4%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                          <span>Okta SAML / SCIM Provisioning</span>
                          <span className="font-bold text-[#428ce5]">21.6%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#428ce5] rounded-full" style={{ width: "21.6%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                          <span>Brand Styling &amp; Custom CSS</span>
                          <span className="font-bold text-[#d9bef4]">17.8%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-[#d9bef4] rounded-full" style={{ width: "17.8%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 mt-4 text-[11px] text-white/50 flex items-center justify-between">
                    <span>14,820 conversations categorized</span>
                    <span className="text-[#ff5600] font-semibold cursor-pointer hover:underline">
                      Explore Topics →
                    </span>
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
                <div className="text-xs leading-relaxed text-black/60">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS ("Pre-built reports, faster insights, better decisions") */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Operational Intelligence
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Pre-built reports, faster insights, better decisions.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Stop stitching together spreadsheets and SQL queries. Elpino gives support leaders
              curated templates, full customization, and 1-click drill-downs into real conversations.
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

      {/* 4. READY-MADE REPORTS SHOWCASE (With Pictures!) */}
      <section className="border-b border-black/5 bg-[#f4f3ec] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full bg-[#ff5600]/10 border border-[#ff5600]/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Turnkey Dashboards
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Get insights faster with ready-made reports.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65 sm:text-lg">
              Launch enterprise-grade dashboards on day one. Explore the 3 primary report suites
              built directly into your Elpino workspace.
            </p>
          </div>

          {/* Interactive Category Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {readyMadeReports.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveReportCategory(idx)}
                className={`rounded-full px-6 py-3 text-xs sm:text-sm font-semibold transition-all ${
                  activeReportCategory === idx
                    ? "bg-[#17181c] text-white shadow-xl scale-105"
                    : "bg-white/80 text-black/70 hover:bg-white hover:text-black border border-black/10"
                }`}
              >
                {r.tag}
              </button>
            ))}
          </div>

          {/* Active Report Showcase Box */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white p-6 sm:p-10 lg:p-12 shadow-xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <span className="inline-block rounded-full border border-black/10 bg-[#faf9f6] px-3.5 py-1 text-xs font-semibold text-[#ff5600]">
                  {activeCategory.badge}
                </span>

                <h3 className="mt-4 text-2xl sm:text-3xl font-medium tracking-tight text-[#17181c]">
                  {activeCategory.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-black/50">
                  {activeCategory.subtitle}
                </p>

                <p className="mt-4 text-base leading-relaxed text-black/70">
                  {activeCategory.description}
                </p>

                <div className="mt-6 space-y-3">
                  {activeCategory.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2.5 text-sm text-black/80">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#18c983]" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Scorecards */}
                <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-black/10">
                  {activeCategory.kpis.map((kpi) => (
                    <div key={kpi.label} className="rounded-xl bg-[#faf9f6] p-3 border border-black/5">
                      <div className="text-[11px] font-semibold text-black/50 uppercase">
                        {kpi.label}
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">{kpi.value}</div>
                      <div className="text-xs text-[#ff5600] font-medium">{kpi.trend}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Picture Display with Mascot Illustration */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-[480px] overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-xl flex items-center justify-center">
                  <Image
                    src={activeCategory.image}
                    alt={activeCategory.title}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEEP CUSTOMIZATION & 10 CHART TYPES */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Flexible Report Builder
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Make every report your own with deep customization.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Every support organization has unique KPIs. Build custom views with 10 chart types,
              drag-and-drop cards, and calculated metrics without technical setup.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {customizationFeatures.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.tag}
                  className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${c.color}`}
                    >
                      {c.badge}
                    </span>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-black/10 flex items-center gap-2 text-xs font-semibold text-black/70">
                    <Icon size={16} className="text-[#ff5600]" />
                    <span>Included in all Growth &amp; Enterprise plans</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Sloth Picture Spotlight */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-black/10 bg-[#17181c] text-white p-8 sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
                  Executive Revenue &amp; Cost Analysis
                </span>
                <h3 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  Quantify the exact dollar value of AI resolution.
                </h3>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                  Measure cost-per-ticket deflection against human staffing expenses. Track enterprise
                  ARR protected, renewal sentiment scores, and upsell opportunities generated by
                  support conversations.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="rounded-xl bg-white/10 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold">
                      Estimated Cost Savings
                    </div>
                    <div className="text-xl font-bold text-[#18c983] mt-1">$42,800 / mo</div>
                    <div className="text-[11px] text-white/60">Based on 11,322 AI deflections</div>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase font-semibold">
                      VIP Pipeline Protected
                    </div>
                    <div className="text-xl font-bold text-[#ff5600] mt-1">$1.4M ARR</div>
                    <div className="text-[11px] text-white/60">0 breached SLA tickets</div>
                  </div>
                </div>
              </div>

              <div className="relative flex justify-center">
                <div className="relative h-60 w-full max-w-[340px]">
                  <Image
                    src="/images/revenue-sloth-v2.png"
                    alt="Revenue Analytics Sloth"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEE THE DETAILS BEHIND THE DATA (Drill-Ins & Filters) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Deep Investigation
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              See the details behind the data.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Charts shouldn't be dead ends. In Elpino, every data point connects straight back to
              the customer interactions that generated it.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {drillDownFeatures.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#ff5600] text-white">
                    <Icon size={20} />
                  </div>
                  <span className="inline-block mt-4 rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-black/70">
                    {d.tag}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-black">{d.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">
                    {d.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE REPORT SIMULATOR ("Experience Reporting in Action") */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Simulator
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience Elpino Reporting in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through the live reporting views below to test-drive real-time operational
              telemetry, agent leaderboards, semantic topic clusters, and SLA adherence.
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
                  <span>{activeSim.title}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    Live Telemetry
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">{activeSim.summary}</div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                  CSAT: {activeSim.data.csat}
                </span>
                <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 font-semibold">
                  Volume: {activeSim.data.totalTickets}
                </span>
              </div>
            </div>

            {/* Simulated Table / Graph Views */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Tab 0: Channel distribution bars */}
              {activeSim.chartRows && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase text-white/40 tracking-wider">
                    Channel Deflection &amp; Volume Breakdown
                  </div>
                  {activeSim.chartRows.map((row) => (
                    <div key={row.label} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-semibold text-white">{row.label}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-[#ff5600] font-semibold">{row.ai}% AI Resolved</span>
                          <span className="text-[#428ce5] font-semibold">{row.human}% Human</span>
                          <span className="text-white/40">{row.volume}</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                        <div style={{ width: `${row.ai}%` }} className="bg-[#ff5600] h-full" />
                        <div style={{ width: `${row.human}%` }} className="bg-[#428ce5] h-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 1: Agent Leaderboard */}
              {activeSim.agentRows && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-[11px] uppercase">
                        <th className="pb-3 font-semibold">Teammate</th>
                        <th className="pb-3 font-semibold">Resolved</th>
                        <th className="pb-3 font-semibold">CSAT Score</th>
                        <th className="pb-3 font-semibold">Handle Time</th>
                        <th className="pb-3 font-semibold">Copilot Approval</th>
                        <th className="pb-3 font-semibold">Recognition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/90">
                      {activeSim.agentRows.map((agent) => (
                        <tr key={agent.name} className="hover:bg-white/5 transition">
                          <td className="py-3.5 font-semibold text-white flex items-center gap-2">
                            <div className="size-7 rounded-full bg-[#ff5600] flex items-center justify-center font-bold text-xs text-white">
                              {agent.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <div>{agent.name}</div>
                              <div className="text-[10px] text-white/40 font-normal">{agent.role}</div>
                            </div>
                          </td>
                          <td className="py-3.5 font-bold text-white">{agent.resolved}</td>
                          <td className="py-3.5 text-[#18c983] font-bold">{agent.csat}</td>
                          <td className="py-3.5">{agent.handleTime}</td>
                          <td className="py-3.5 text-[#ff5600] font-semibold">{agent.copilotRate}</td>
                          <td className="py-3.5">
                            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/80">
                              {agent.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Topic Clusters */}
              {activeSim.topicRows && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeSim.topicRows.map((t) => (
                    <div key={t.topic} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{t.topic}</span>
                        <span className={`font-bold ${t.trendColor}`}>{t.trend}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
                        <span>Share: {t.share}</span>
                        <span>AI Deflection: {t.aiRate}</span>
                        <span className="text-[#18c983]">Sentiment: {t.sentiment}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: SLA Telemetry */}
              {activeSim.slaRows && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase text-white/40 tracking-wider">
                    Contractual SLA Compliance by Customer Segment
                  </div>
                  {activeSim.slaRows.map((sla) => (
                    <div key={sla.tier} className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{sla.tier}</div>
                        <div className="text-xs text-white/50 mt-0.5">Average wait time: {sla.avgTime}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#18c983]">{sla.achieved} Compliant</div>
                          <div className="text-[10px] text-white/40">{sla.breaches} breaches in 30 days</div>
                        </div>
                        <span className="size-3 rounded-full bg-[#18c983] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. DATA GOVERNANCE & ACCESS CONTROL (With Pictures) */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Enterprise Data Security
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Organize, export, and control access to all your data.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Manage telemetry at scale. Export with 1 click, synchronize with your cloud data
              warehouse, and enforce strict role-based access for your team.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {governanceFeatures.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.title}
                  className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden rounded-xl bg-white border border-black/5 p-2 mb-6">
                      <Image
                        src={g.image}
                        alt={g.title}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-[#ff5600] text-white">
                        <Icon size={16} />
                      </div>
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-black/70">
                        {g.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">
                      {g.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">
                      {g.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. OVER 60 IMPROVEMENTS (Grid Showcase) */}
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

      {/* 10. TESTIMONIAL SPOTLIGHT */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#ff5600]/10 text-[#ff5600] mb-8">
            <Sparkles size={24} />
          </div>

          <blockquote className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-snug tracking-[-0.02em] text-[#17181c]">
            “Elpino's unified reporting finally gave our leadership total clarity. We track our
            AI deflection alongside human agent response times in a single dashboard, and we’ve
            spotted product bugs days before they impacted churn.”
          </blockquote>

          <div className="mt-8">
            <div className="font-semibold text-base text-black">Morgan Sterling</div>
            <div className="text-sm text-black/60">VP of Support Operations, CloudScale Global</div>
          </div>
        </div>
      </section>

      {/* 11. FAQS ACCORDION (Matching Intercom's 8 Reporting questions) */}
      <section className="border-b border-black/5 bg-[#faf9f6] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              Spot gaps and refine your support with smarter reporting.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Everything you need to know about Elpino's reporting, dashboards, CSAT tracking, and data exports.
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

      {/* 12. HIGH-IMPACT CLOSING BANNER */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Turn insights into action. Get started today.
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Uncover the stories behind your support data.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect live chat, support email, and Slack in
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
