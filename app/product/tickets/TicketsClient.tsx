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
  TicketCheck,
  KanbanSquare,
  UsersRound,
  ShieldAlert,
  Send,
  Workflow,
  Clock3,
} from "lucide-react";

export function TicketsClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "99.2%",
      label: "Enterprise SLA compliance",
      detail: "monitored by real-time countdown clocks",
    },
    {
      value: "4x",
      label: "Faster ticket handoffs",
      detail: "from frontline support to engineering and billing",
    },
    {
      value: "100%",
      label: "Bi-directional Linear & GitHub sync",
      detail: "automatic updates delivered when code is merged",
    },
    {
      value: "0",
      label: "Dropped customer context",
      detail: "original conversation stays attached to ticket",
    },
  ];

  const ticketPillars = [
    {
      icon: MessageSquare,
      title: "Customer Tickets",
      tag: "Frontline Continuity",
      badge: "Conversational",
      description:
        "Keep customers updated via chat, email, or Slack without forcing them into a clunky legacy ticket portal. Progress stays part of the original conversation.",
    },
    {
      icon: UsersRound,
      title: "Back-Office Tickets",
      tag: "Internal Escalations",
      badge: "Internal Handoff",
      description:
        "Escalate complex requests to finance, logistics, or compliance teams with private whisper notes, dedicated owners, and strict SLA countdowns.",
    },
    {
      icon: KanbanSquare,
      title: "Tracker Tickets",
      tag: "Engineering Bridge",
      badge: "Linear / GitHub",
      description:
        "Link bug reports directly to your development team's backlog. When engineering deploys the fix, Elpino notifies all affected customers automatically.",
    },
  ];

  const simulations = [
    {
      id: "customer",
      title: "Customer Frontline Ticket",
      icon: MessageSquare,
      badge: "Live Status Sync",
      ticketNumber: "#TK-10482",
      customer: "Amara Miller · DataPulse AI",
      subject: "Replacement hardware shipment has not arrived",
      status: "In Progress · SLA: 24m remaining",
      summary: "Order #10482 was shipped on May 14. Carrier transit delay detected in Chicago hub. Customer notified of tracking ETA.",
      actionText: "Send Customer Progress Update",
      privateNote: "Courier API confirms container cleared customs. Out for delivery tomorrow morning.",
    },
    {
      id: "backoffice",
      title: "Back-Office Finance Escalation",
      icon: UsersRound,
      badge: "Role-Based Routing",
      ticketNumber: "#TK-10519",
      customer: "Liam Vance · ApexTech ($58k ARR)",
      subject: "Custom European VAT reverse-charge invoice required",
      status: "Assigned to Finance · Waiting on Tax Certificate",
      summary: "Customer requested quarterly invoice adjustment with EU VAT reverse-charge documentation. Requires finance lead verification.",
      actionText: "Approve Invoice & Notify Customer",
      privateNote: "@finance VAT number EU82910482 verified active on VIES registry. Safe to generate credit note.",
    },
    {
      id: "tracker",
      title: "Engineering Bug Tracker Bridge",
      icon: KanbanSquare,
      badge: "Linear Sync Active",
      ticketNumber: "#TK-10640",
      customer: "David Chen · CloudScale (+14 affected users)",
      subject: "Webhook receiver returning 504 on checkout.session.completed",
      status: "Linked to Linear Issue #LIN-892 (PR Merged)",
      summary: "Transient TCP reset identified in US-East webhook dispatcher. Patch merged into main branch. Deploy completed at 14:22 UTC.",
      actionText: "Auto-Notify All 14 Affected Customers",
      privateNote: "Deploy verification passed in canary. Triggering automated resolution broadcast.",
    },
  ];

  const faqs = [
    {
      q: "How do tickets work alongside live chat conversations in Elpino?",
      a: "In Elpino, tickets and live chat exist on the same continuum. You can turn any live chat discussion or email thread into a structured ticket with one click. The ticket retains the entire conversational history, customer telemetry, and previous agent notes.",
    },
    {
      q: "How does bi-directional sync with Linear and GitHub work?",
      a: "When an agent links a customer ticket to a Linear or GitHub issue, Elpino tracks the status in real time. When developers update the sprint issue or merge the pull request, the customer ticket updates automatically and can trigger a broadcast notification to all affected customers.",
    },
    {
      q: "Can customers track their ticket status without logging into a portal?",
      a: "Yes. Customers receive real-time updates directly via email or live chat with a public tracking link that requires no cumbersome password logins.",
    },
    {
      q: "What are Back-office tickets?",
      a: "Back-office tickets are designed for internal escalations to specialized teams like legal, compliance, finance, or tier-3 engineering. They feature private whisper fields, role-based assignment, and custom approval gates hidden from the customer.",
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
              <TicketCheck size={13} className="text-[#ff5600]" />
              Elpino / Conversational Ticket Center
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Tickets that keep the{" "}
                <span className="italic text-[#ff5600]">conversation moving.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Turn complex questions into clear, trackable work without disconnecting your customer,
                your team, or the context they have already shared. Conversational tickets that bridge
                support, engineering, and finance.
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
                  Book tickets demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Bi-directional Linear sync
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> SLA countdown clocks
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Private whisper notes
                </span>
              </div>
            </div>

            {/* Mascot Picture Display: Contact Support Sloth */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Active Ticket Flow
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Context Preserved
                    </span>
                  </div>

                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/contact-support-sloth.png"
                      alt="Sloth Managing Support Tickets"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Linear Bug Sync
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">Bi-Directional</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Auto-updates on deploy</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        SLA Adherence
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">99.2%</div>
                      <div className="text-[11px] text-black/50">Contractual guarantee</div>
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

      {/* 3. THREE CORE TICKET PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Connected Workflows
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              From customer inquiry to resolved issue, without losing the thread.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              Support work shouldn't be siloed in isolated ticketing databases. Elpino unites customer
              threads, internal handoffs, and engineering bugs into one continuous record.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {ticketPillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-black/10 bg-[#faf9f6] p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#ff5600] text-white shadow-sm">
                    <Icon size={20} />
                  </div>
                  <span className="inline-block mt-6 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#ff5600]">
                    {p.badge}
                  </span>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-black">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TICKET SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Test Drive
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience conversational tickets in action.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through the live ticket scenarios below to see how Elpino manages customer
              progress updates, internal whisper handoffs, and engineering bug tracking.
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
                  <span>{activeSim.ticketNumber} · {activeSim.subject}</span>
                  <span className="rounded bg-[#ff5600]/20 text-[#ff5600] px-2 py-0.5 text-[10px] font-bold">
                    {activeSim.badge}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-0.5">Customer: {activeSim.customer}</div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSim.status}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Ticket Summary &amp; Status
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  {activeSim.summary}
                </p>
              </div>

              <div className="rounded-xl bg-[#fcbb00]/10 border border-[#fcbb00]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#fcbb00]">
                  <span className="flex items-center gap-1.5"><Lock size={13} /> Private Teammate Whisper Note</span>
                  <span className="text-[10px] text-white/40">Internal Only</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSim.privateNote}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                <span>Thread history synchronized across live chat &amp; email</span>
                <button
                  type="button"
                  className="rounded-full bg-[#ff5600] px-5 py-2 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  {activeSim.actionText}
                </button>
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
              Understanding Conversational Tickets.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Clear answers on handoffs, SLAs, Linear sync, and customer status portals.
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
            Conversational Ticketing
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Give complex support work a modern home.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day trial today. Connect your team with conversational tickets in
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
