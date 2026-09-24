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
  UserCheck,
  Bot,
  MessageSquare,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  UserRoundCheck,
  CornerDownRight,
  Headphones,
  FileText,
  HeartHandshake,
  Activity,
} from "lucide-react";

export function HumanEscalationsClient() {
  const [activeTrigger, setActiveTrigger] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simState, setSimState] = useState<"ai_triage" | "escalation_triggered" | "human_resolved">("escalation_triggered");

  const stats = [
    {
      value: "< 12s",
      label: "Average human escalation speed",
      detail: "Context pack generated and delivered to available specialist instantly",
    },
    {
      value: "0%",
      label: "Customer repetition required",
      detail: "Every single prior message, source check, and plan attribute is preserved",
    },
    {
      value: "96.4%",
      label: "Post-escalation customer satisfaction",
      detail: "Customers appreciate knowing immediately that an empathetic expert has taken over",
    },
    {
      value: "4.2x",
      label: "Faster agent resolution time",
      detail: "Pre-generated private AI summaries eliminate 3-5 minutes of thread reading",
    },
  ];

  const escalationTriggers = [
    {
      title: "Confidence Score Drop (< 85%)",
      badge: "Knowledge Boundary",
      description: "When the AI agent encounters an undocumented edge case or complex multi-step scenario, it bows out gracefully rather than hallucinating.",
      snippet: "Confidence: 0.74 • Reason: Custom webhook authentication payload syntax unverified in documentation.",
    },
    {
      title: "Sentiment & Frustration Spikes",
      badge: "Emotional Intelligence",
      description: "Real-time sentiment telemetry monitors punctuation, tone, and repeated queries. If agitation is detected, a senior human teammate is alerted instantly.",
      snippet: "Sentiment: -0.68 (Frustrated) • Alert: Triggered auto-routing to Tier-2 escalation pool.",
    },
    {
      title: "High-Value Enterprise VIP Accounts",
      badge: "Revenue Protection",
      description: "Accounts flagged with enterprise contracts ($25k+ ARR) bypass standard queues and are routed directly to dedicated customer success architects.",
      snippet: "Account: Acme Corp ($72k ARR) • Priority: P0 • Assigned: Sarah Jenkins (Lead CSM).",
    },
    {
      title: "Sensitive & Compliance Topics",
      badge: "Security & Legal",
      description: "Conversations mentioning terms like chargeback, GDPR erasure, breach, or legal counsel are immediately transferred to certified risk officers.",
      snippet: "Policy: Compliance-Guard • Action: Direct handoff to Legal & Privacy compliance desk.",
    },
  ];

  const pillars = [
    {
      icon: FileText,
      title: "The Zero-Repetition Context Pack",
      badge: "Intelligent Briefing",
      description:
        "The number one frustration for customers is repeating their issue after a transfer. Elpino automatically synthesizes a private 3-bullet executive summary for the incoming agent.",
      points: [
        "What the customer is trying to accomplish",
        "Exact steps and diagnostics already performed by the AI agent",
        "Direct links to relevant documentation, logs, and account subscription data",
        "Suggested next step and recommended one-click response draft",
      ],
      metric: "0 Context Loss",
      metricLabel: "Executive briefing guarantee",
    },
    {
      icon: Users,
      title: "Real-time Collision Avoidance & Presence",
      badge: "Team Coordination",
      description:
        "Ensure two teammates never step on each other's toes. Live presence indicators show who is actively reading or typing in a ticket with collision locking.",
      points: [
        "Live typing and viewing avatars right on the conversation header",
        "Soft-lock prevents accidental duplicate replies to the same customer",
        "Instant re-assignment if an agent becomes idle or steps away",
        "Internal private whispers allow teammates to collaborate without the customer seeing",
      ],
      metric: "100%",
      metricLabel: "Collision prevention rate",
    },
    {
      icon: HeartHandshake,
      title: "Empathetic, Transparent Customer Transitions",
      badge: "Customer Experience",
      description:
        "When an escalation happens, the customer is never left hanging. Clear, honest messaging informs them of the exact teammate stepping in, their role, and current queue position.",
      points: [
        "Warm intro message: 'I am looping in Sarah from our engineering team to review this with you.'",
        "Visible agent profile, photo, and timezone for genuine human connection",
        "Realistic estimated response time based on live staffing telemetry",
        "Option for customer to leave email or phone if they prefer an asynchronous followup",
      ],
      metric: "96.4%",
      metricLabel: "Customer satisfaction rating",
    },
    {
      icon: Activity,
      title: "Continuous Feedback Loop to Knowledge Ops",
      badge: "Knowledge Refinement",
      description:
        "Every single human escalation is a valuable learning opportunity. Elpino logs the gap and alerts your technical writers to update the knowledge base.",
      points: [
        "Automated clustering of handoff root causes in weekly reporting",
        "One-click 'Add to Knowledge Base' converts human agent solutions into verified AI docs",
        "Confidence drift tracking across product versions and feature updates",
        "Reduces future escalation volume for the same issue by up to 74%",
      ],
      metric: "-74%",
      metricLabel: "Repeat escalation deflection",
    },
  ];

  const faqs = [
    {
      q: "Can the human agent see what the AI said before they joined?",
      a: "Yes. The complete transcript—including timestamps, documents checked, customer sentiment, and verified identity tokens—is visible in the timeline. In addition, the AI provides a private internal note summarizing the entire thread so the agent doesn't need to read 20 messages.",
    },
    {
      q: "What happens if all human agents are offline or in different timezones?",
      a: "If an escalation occurs outside of business hours or when all teammates are at capacity, Elpino gracefully informs the customer of your team's operating hours, gathers their preferred contact method (email or SMS), and automatically creates a high-priority ticket in your inbox for the morning shift.",
    },
    {
      q: "Can human agents hand a conversation back to the AI after solving the complex part?",
      a: "Yes. A human agent can resolve the technical question, click 'Return to AI Co-pilot', and the AI agent resumes monitoring the conversation to answer any routine followup queries.",
    },
    {
      q: "How does Elpino handle confidential internal notes?",
      a: "Internal notes are highlighted with a distinct yellow/purple border and marked 'Whisper Note - Only visible to your team'. They are never sent to the customer-facing chat widget or external channels like WhatsApp or SMS.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(118,81,176,0.08),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(66,140,229,0.07),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7651b0]/30 bg-[#f4effb] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7651b0]">
                <UserRoundCheck size={14} className="text-[#7651b0]" />
                Seamless Human Escalation & Hand-off
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Know exactly when a person{" "}
                <span className="text-[#7651b0]">should step in.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#53616b] sm:text-xl">
                A handoff should feel like progress, never a restart. Elpino resolves the routine,
                detects when human empathy or specialist judgment is needed, and hands off the conversation
                with the full context already attached.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#17181c] px-7 text-sm font-semibold text-white transition hover:bg-[#7651b0]"
                >
                  Start free trial <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#f1edf7]"
                >
                  See handoff walkthrough
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#53616b]">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero customer repetition
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> AI-generated 3-bullet briefing
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Real-time collision locking
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Escalation Badge */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4effb] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#17181c] text-white">
                      <UserCheck size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Live Escalation Bridge</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7651b0]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#7651b0]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#7651b0]" />
                    Handoff in &lt; 12s
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/founders-sloth-v2.png"
                      alt="Elpino founder sloth managing human support escalations"
                      width={1145}
                      height={1374}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Handoff: Tier-2 Specialist</span>
                        <span className="text-[#18c983]">Online</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#7651b0]">
                        Customer never asked to repeat themselves. Full thread and diagnostics pre-loaded.
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>Agent: Marcus Vance</span>
                        <span className="font-bold text-[#18c983]">CSAT: 100%</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#7651b0]/20 bg-[#f4effb] p-3 text-xs text-[#7651b0]">
                      <span className="font-semibold">AI Whisper:</span> &ldquo;Customer tried clearing cookies on Safari 17. Issue is CORS header on /v1/auth. Draft response ready.&rdquo;
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
            Handoff Performance & Customer Trust
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-[#7651b0] pl-6">
                <p className="text-4xl font-normal tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Simulator: Live Escalation in Action */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f4effb] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7651b0]">
              <Sparkles size={13} />
              Interactive Handoff Console
            </span>
            <h2 className="mt-5 text-balance text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              See how a seamless handoff happens behind the scenes.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Switch between stages to experience how Elpino detects uncertainty, passes the baton to a human agent, and provides instant private briefings.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-black/10 bg-[#fbfbfa] p-5 shadow-xl sm:p-8 lg:p-10">
            {/* Stage Selector */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-b border-black/10 pb-6">
              <button
                onClick={() => setSimState("ai_triage")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simState === "ai_triage"
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <Bot size={15} /> 1. AI Routine Triage
              </button>
              <button
                onClick={() => setSimState("escalation_triggered")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simState === "escalation_triggered"
                    ? "bg-[#7651b0] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <AlertCircle size={15} /> 2. Escalation & AI Whisper Briefing
              </button>
              <button
                onClick={() => setSimState("human_resolved")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simState === "human_resolved"
                    ? "bg-[#18c983] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <UserCheck size={15} /> 3. Human Expert Takes Over
              </button>
            </div>

            {/* Interactive Viewport */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: Chat Window */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 pb-3 text-xs text-[#53616b]">
                  <span className="font-semibold text-[#17181c]">Customer: Alex Chen (VP Eng @ HyperFlow)</span>
                  <span className="rounded bg-[#428ce5]/10 px-2 py-0.5 font-semibold text-[#3569ad]">
                    Enterprise Plan ($48k ARR)
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Customer initial message */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#17181c] p-4 text-xs leading-relaxed text-white">
                      We&apos;re trying to set up mutual TLS for our enterprise webhook endpoint, but the certificates are rejecting with error code SSL_CTX_ERR_882.
                    </div>
                  </div>

                  {/* AI initial acknowledgment */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7651b0] text-xs font-bold text-white">
                      E
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#7651b0]/20 bg-[#f4effb] p-4 text-xs leading-relaxed text-[#17181c]">
                      {simState === "ai_triage" && (
                        <p>
                          I can help with standard webhook signing secrets. However, custom mutual TLS certificates require our infrastructure security team to register your intermediate CA root. Let me check our setup guides...
                        </p>
                      )}

                      {simState !== "ai_triage" && (
                        <div>
                          <p className="font-semibold text-[#7651b0]">
                            I am connecting you directly with Marcus Vance from our Infrastructure Security Engineering team.
                          </p>
                          <p className="mt-2 text-[#53616b]">
                            I have shared your mTLS certificate error (SSL_CTX_ERR_882) and your enterprise CA thumbprint with Marcus. He will step into this chat in just a moment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Human Agent joins */}
                  {simState === "human_resolved" && (
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#18c983] text-xs font-bold text-white">
                        M
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#18c983]/30 bg-[#eef7f1] p-4 text-xs leading-relaxed text-[#17181c]">
                        <p className="font-semibold text-[#168a5b]">Marcus Vance (Lead Security Engineer) joined</p>
                        <p className="mt-2 text-[#53616b]">
                          Hi Alex! I reviewed the AI briefing and your intermediate CA chain. We identified that the leaf cert is missing the serverAuth extendedKeyUsage extension.
                        </p>
                        <p className="mt-2 text-[#53616b]">
                          I just updated our ingress truststore to accept your root authority. Could you test the webhook dispatch again?
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Internal Agent Briefing (Whisper Note) */}
              <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#17181c] p-6 text-white shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#d9bef4]">
                      <Sparkles size={14} className="text-[#d9bef4]" />
                      Private AI Whisper Note (Internal Only)
                    </span>
                    <span className="rounded bg-[#ff5600]/20 px-2 py-0.5 font-mono text-[10px] text-[#ff5600]">
                      VIP Tier Escalation
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 font-mono text-xs">
                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#d9bef4] font-semibold">// Customer & Account Profile</span>
                      <p className="mt-1 text-white/90">Customer: Alex Chen (VP Engineering)</p>
                      <p className="text-white/70">Account: HyperFlow ($48,000 ARR • Dedicated SLA 15m)</p>
                      <p className="text-[#18c983]">Sentiment: Neutral (Calm, highly technical)</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#428ce5] font-semibold">// AI Synthesis of Core Issue</span>
                      <p className="mt-1 text-white/90">• Attempting custom mTLS webhook verification</p>
                      <p className="text-white/70">• Error: SSL_CTX_ERR_882 (certificate rejected at ingress)</p>
                      <p className="text-white/70">• Intermediate CA authority not present in cluster config</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-[#18c983] font-semibold">// Recommended Action for Human Agent</span>
                      <p className="mt-1 text-white/90">1. Verify tenant truststore in AWS KMS console</p>
                      <p className="text-white/70">2. Request updated PEM chain or whitelist CA thumbprint</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
                  <span className="font-semibold text-white">Efficiency gain:</span> Agent Marcus saved 4 minutes of back-and-forth diagnosis. First-touch resolution achieved.
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
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Human-in-the-Loop Architecture
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Engineered for respect, speed, and precision.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Support shouldn&apos;t feel like a standoff between robots and humans.
              Elpino makes the transition so smooth that customers feel genuinely cared for at every turn.
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
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f4effb] text-[#7651b0]">
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
                    <span className="text-xl font-bold tracking-tight text-[#7651b0]">{pillar.metric}</span>
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
              Everything you need to know about human escalations.
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
                      openFaq === index ? "rotate-180 text-[#7651b0]" : ""
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
                Deliver the gold standard of customer support
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Ready for handoffs that feel like pure relief?
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Give your customers immediate AI answers and seamless human escalation without losing a shred of context.
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
                Book team demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
