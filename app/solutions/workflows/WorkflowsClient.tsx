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
  GitBranch,
  Clock,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Bot,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Workflow as WorkflowIcon,
  Play,
  Share2,
  SlidersHorizontal,
  Bell,
  Split,
  Terminal,
  Cpu,
  RefreshCw,
} from "lucide-react";

export function WorkflowsClient() {
  const [activeWorkflow, setActiveWorkflow] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState(3);

  const stats = [
    {
      value: "94%",
      label: "Faster ticket triage & assignment",
      detail: "Automated routing based on customer tier, language, sentiment, and ARR",
    },
    {
      value: "100%",
      label: "SLA compliance on priority tiers",
      detail: "Proactive warnings alert managers before a critical response window expires",
    },
    {
      value: "18,500+",
      label: "Repetitive steps automated monthly",
      detail: "Tags, notifications, macros, and webhook syncs executed autonomously",
    },
    {
      value: "0",
      label: "Misrouted customer conversations",
      detail: "Deterministic semantic intent models ensure tickets reach the exact specialist",
    },
  ];

  const workflowTemplates = [
    {
      name: "VIP Enterprise SLA Escalation",
      trigger: "Customer with ARR > $50,000 opens new ticket",
      condition: "Wait time > 4 mins OR Sentiment == 'Frustrated'",
      action: "Assign to Lead CSM, page #enterprise-oncall on Slack, bump priority to P0",
      badge: "Revenue Protection",
      color: "border-[#428ce5] text-[#3569ad] bg-[#edf3fa]",
    },
    {
      name: "Smart Billing Dispute & Refund Guard",
      trigger: "Message matches [refund, chargeback, invoice dispute]",
      condition: "Verified Stripe invoice balance < $150 & churn risk == 'Low'",
      action: "Auto-issue store credit voucher, tag [finance-approved], notify billing agent",
      badge: "Financial Ops",
      color: "border-[#18c983] text-[#168a5b] bg-[#eef7f1]",
    },
    {
      name: "Dev Bug Tracker & Linear Bridge",
      trigger: "Customer reports 500 error or API rate limit",
      condition: "Console stack trace or reproduction steps detected",
      action: "Create Linear bug ticket, link thread, auto-reply with status page tracker",
      badge: "Engineering",
      color: "border-[#7651b0] text-[#7651b0] bg-[#f4effb]",
    },
  ];

  const pillars = [
    {
      icon: GitBranch,
      title: "Visual branching logic with zero code complexity",
      badge: "Visual Flow Builder",
      description:
        "Design intricate multi-step triage trees using intuitive if/then triggers, customer profile attributes, sentiment thresholds, and operating hours without touching a line of code.",
      points: [
        "Multi-variable branching: customer ARR, subscription plan, device OS, language",
        "Natural language intent classifiers powered by fine-tuned LLMs",
        "Business hour schedules: routing rules adapt automatically to off-hours & holidays",
        "Fallback and catch-all rules preventing tickets from ever getting lost in limbo",
      ],
      metric: "< 5 mins",
      metricLabel: "Average workflow build time",
    },
    {
      icon: Clock,
      title: "SLA escalation trees & proactive countdown monitors",
      badge: "SLA Governance",
      description:
        "Never breach an enterprise agreement again. Set granular response and resolution targets by customer tier, with automated escalations triggered at 50% and 80% thresholds.",
      points: [
        "Live SLA countdown visualizer on every inbox ticket header",
        "Multi-stage escalation ladders: email alert → Slack channel ping → PagerDuty page",
        "Automatic team re-assignment when an agent goes offline or inactive",
        "Executive SLA breach post-mortem analytics and compliance reporting",
      ],
      metric: "99.8%",
      metricLabel: "SLA adherence rate",
    },
    {
      icon: Bot,
      title: "Autonomous tagging, classification & sentiment radar",
      badge: "AI Categorization",
      description:
        "Eliminate manual ticket categorization. Elpino inspects incoming customer text, attachments, and historical interactions to instantly attach relevant operational tags.",
      points: [
        "Real-time sentiment scoring from -1.0 (angry) to +1.0 (delighted)",
        "Automated taxonomies: feature requests, bug reports, churn risk, praise",
        "Custom tag inheritance syncing directly with Zendesk, HubSpot, and Salesforce",
        "Dynamic custom field population from chat conversation transcripts",
      ],
      metric: "18,500+",
      metricLabel: "Monthly manual tags saved",
    },
    {
      icon: Cpu,
      title: "Bi-directional webhooks and external event orchestrations",
      badge: "API & Webhooks",
      description:
        "Support doesn't happen in a vacuum. Trigger automated backend actions across your stack whenever a customer hits a specific point in their journey.",
      points: [
        "Trigger workflows from Stripe charge failures or Segment telemetry events",
        "Execute outbound REST webhooks to your internal API with HMAC signing",
        "Native bi-directional syncing with Linear, GitHub Issues, Jira, and Slack",
        "Automated database record updates when conversations are marked resolved",
      ],
      metric: "100%",
      metricLabel: "API uptime guarantee",
    },
  ];

  const faqs = [
    {
      q: "Can workflows run alongside human agents without interfering?",
      a: "Yes. Workflows can run in background mode (applying tags, setting priority, alerting Slack channels) without sending any customer-facing messages, or in automated mode where they send immediate acknowledgments, route conversations, or trigger self-service modules.",
    },
    {
      q: "How does Elpino prevent endless loops or conflicting rules?",
      a: "Elpino includes a built-in static analysis engine that checks for circular logic, duplicate triggers, and race conditions before you publish any workflow. In addition, execution caps prevent any single conversation from triggering more than a defined threshold of actions.",
    },
    {
      q: "Can we route tickets based on agent skills and current workload?",
      a: "Yes. Elpino supports round-robin routing, skill-based routing (e.g. Spanish-fluent agents, billing specialists, tier-3 engineers), and capacity-based load balancing that only routes to agents currently active with fewer than their assigned concurrent conversation limit.",
    },
    {
      q: "Can we trigger workflows from external systems like Stripe or Datadog?",
      a: "Absolutely. Elpino provides incoming webhook endpoints. For example, if Stripe reports an invoice payment failure, Elpino can initiate a proactive conversational outreach to the account owner with a secure payment update link.",
    },
  ];

  const runSimulation = () => {
    setIsRunningSim(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 700);
    setTimeout(() => {
      setSimStep(3);
      setIsRunningSim(false);
    }, 1400);
  };

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(24,201,131,0.07),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(118,81,176,0.08),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#18c983]/30 bg-[#eef7f1] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#168a5b]">
                <WorkflowIcon size={14} className="text-[#168a5b]" />
                Intelligent Support Orchestration
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Make the repeatable parts of support{" "}
                <span className="text-[#168a5b]">run themselves.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#53616b] sm:text-xl">
                Build dependable, multi-condition workflows for triage, SLA escalations, and cross-team routing.
                Eliminate thousands of hours of manual busywork while keeping your team in complete control.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#17181c] px-7 text-sm font-semibold text-white transition hover:bg-[#168a5b]"
                >
                  Build your first workflow <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#f1edf7]"
                >
                  Book orchestration demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#53616b]">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Visual drag-and-drop builder
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Enterprise SLA countdown timers
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Slack, Linear & Webhook triggers
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Workflow Tree */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4effb] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#17181c] text-white">
                      <GitBranch size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Live Workflow Monitor</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    Engine Active • 312 Rules Running
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/busy-teams-sloth-v2.png"
                      alt="Elpino productivity sloth orchestrating support workflows"
                      width={1145}
                      height={1374}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Trigger: Payment_Failed</span>
                        <span className="text-[#168a5b]">Handled 2s ago</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#7651b0]">
                        Action: VIP account flagged • Slack ping sent to #csm-pod • In-app alert created
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>SLA: 4m target</span>
                        <span className="font-bold text-[#168a5b]">Met in 12s</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#18c983]/30 bg-[#eef7f1] p-3 text-xs text-[#168a5b]">
                      <span className="font-semibold">Automation health:</span> 99.98% execution reliability across 42,000 weekly events.
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
            Proven Operational Scale & Acceleration
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-[#18c983] pl-6">
                <p className="text-4xl font-normal tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workflow Execution Simulator */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#eef7f1] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#168a5b]">
              <Sparkles size={13} />
              Live Workflow Simulator
            </span>
            <h2 className="mt-5 text-balance text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Watch a multi-condition rule execute in milliseconds.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Select one of our standard enterprise workflows to see how conditions evaluate and automated actions cascade across your stack.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-black/10 bg-[#fbfbfa] p-5 shadow-xl sm:p-8 lg:p-10">
            {/* Template Selector */}
            <div className="grid gap-4 md:grid-cols-3">
              {workflowTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveWorkflow(idx);
                    runSimulation();
                  }}
                  className={`rounded-2xl border p-5 text-left transition ${
                    activeWorkflow === idx
                      ? "border-[#17181c] bg-white shadow-md ring-2 ring-[#17181c]/10"
                      : "border-black/10 bg-white/70 hover:bg-white"
                  }`}
                >
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${template.color}`}>
                    {template.badge}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#17181c]">{template.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#53616b]">
                    <strong>Trigger:</strong> {template.trigger}
                  </p>
                </button>
              ))}
            </div>

            {/* Execution Ladder Visualizer */}
            <div className="mt-8 rounded-2xl border border-black/10 bg-[#17181c] p-6 text-white shadow-inner sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#18c983]/20 text-[#18c983]">
                    <GitBranch size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{workflowTemplates[activeWorkflow].name}</p>
                    <p className="text-xs text-white/50">Execution engine: v2.4 (Distributed)</p>
                  </div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isRunningSim}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#18c983] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#13744c] disabled:opacity-50"
                >
                  <Play size={13} />
                  {isRunningSim ? "Evaluating Pipeline..." : "Re-run Test Simulation"}
                </button>
              </div>

              {/* Steps progression */}
              <div className="mt-8 space-y-6">
                {/* Step 1: Event Ingestion */}
                <div className={`flex items-start gap-4 transition-opacity duration-300 ${simStep >= 1 ? "opacity-100" : "opacity-30"}`}>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    1
                  </div>
                  <div className="w-full rounded-xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#18c983]">Step 1: Event Detected</p>
                    <p className="mt-1 text-sm font-mono text-white/90">{workflowTemplates[activeWorkflow].trigger}</p>
                    <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-white/60">
                      Payload parsed • HMAC signature verified • Timestamp: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Step 2: Conditional Evaluation */}
                <div className={`flex items-start gap-4 transition-opacity duration-300 ${simStep >= 2 ? "opacity-100" : "opacity-30"}`}>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    2
                  </div>
                  <div className="w-full rounded-xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#428ce5]">Step 2: Logic Branch Evaluation</p>
                    <p className="mt-1 text-sm font-mono text-white/90">{workflowTemplates[activeWorkflow].condition}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[#18c983]">
                      <CheckCircle2 size={13} />
                      <span>Condition matched: TRUE (Confidence: 0.99)</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Cascaded Execution */}
                <div className={`flex items-start gap-4 transition-opacity duration-300 ${simStep >= 3 ? "opacity-100" : "opacity-30"}`}>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    3
                  </div>
                  <div className="w-full rounded-xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#d9bef4]">Step 3: Cascading Actions Dispatched</p>
                    <p className="mt-1 text-sm font-mono text-white/90">{workflowTemplates[activeWorkflow].action}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono">
                      <span className="rounded bg-[#18c983]/20 px-2 py-1 text-[#18c983]">Slack Webhook HTTP 200</span>
                      <span className="rounded bg-[#428ce5]/20 px-2 py-1 text-[#428ce5]">CRM Attribute Synchronized</span>
                      <span className="rounded bg-[#d9bef4]/20 px-2 py-1 text-[#d9bef4]">SLA Countdown Initialized (4:00)</span>
                    </div>
                  </div>
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
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#168a5b]">
              Workflow Architecture
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Power and precision at every branch.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Designed for modern support organizations that require enterprise-grade reliability,
              comprehensive auditing, and zero latency overhead.
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
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef7f1] text-[#168a5b]">
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
                    <span className="text-xl font-bold tracking-tight text-[#168a5b]">{pillar.metric}</span>
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
              Everything you need to know about Elpino Workflows.
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
                      openFaq === index ? "rotate-180 text-[#168a5b]" : ""
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
                Ready to transform support operations?
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Start automating routine support workflows today.
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Build your first rule in 5 minutes with our visual editor or choose from 25+ battle-tested templates.
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
                Talk to automation specialist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
