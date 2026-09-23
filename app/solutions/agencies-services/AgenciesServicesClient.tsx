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
  Briefcase,
  Building,
  AtSign,
} from "lucide-react";

export function AgenciesServicesClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "100%",
      label: "Client account data isolation",
      detail: "multi-tenant workspaces with brand-specific knowledge bases",
    },
    {
      value: "72%",
      label: "Routine client questions answered 24/7",
      detail: "scope, deliverables, timeline, and asset request inquiries",
    },
    {
      value: "18 hrs",
      label: "Saved per account manager each week",
      detail: "redirected straight into client strategy and creative execution",
    },
    {
      value: "45s",
      label: "Median client first-reply speed",
      detail: "across shared Slack Connect channels and client portals",
    },
  ];

  const agencyPillars = [
    {
      icon: Layers,
      title: "Multi-brand workspace switching",
      tag: "Client Partitioning",
      badge: "Isolated Portals",
      description:
        "Manage multiple client accounts from a single agency dashboard. Switch between client workspaces with one keystroke, each equipped with custom knowledge docs and branding.",
    },
    {
      icon: MessageSquare,
      title: "Slack Connect & shared channels",
      tag: "Channel Fluidity",
      badge: "Client Collaboration",
      description:
        "Clients live in Slack. Elpino integrates into shared client channels, answering recurring process questions and drafting responses for account managers with 1 click.",
    },
    {
      icon: Users,
      title: "Prepared client handoffs",
      tag: "Zero Dropped Details",
      badge: "Account Leads",
      description:
        "When a client asks for a budget change or creative pivot, Elpino gathers contract history, deliverables status, and past notes before notifying the account director.",
    },
    {
      icon: ShieldCheck,
      title: "White-label client experience",
      tag: "Brand Protection",
      badge: "Custom Avatars",
      description:
        "Deploy the chat widget and Help Center under your agency's domain with custom colors, typography, logos, and tailored response voice.",
    },
  ];

  const simulations = [
    {
      id: "deliverables",
      title: "Project Deliverable & Milestone Status",
      icon: Briefcase,
      badge: "Milestone Tracking",
      client: "Sarah Lin · CMO at Velvet & Oak (Retainer Client)",
      query: "When can we expect the final Figma design tokens and brand guidelines export for Phase 2?",
      aiResponse:
        "Phase 2 brand guidelines and Figma tokens are scheduled for delivery this Thursday at 4 PM EST, as agreed in Milestone 2.2. You can preview the staging Figma link in your client portal under Assets → Brand Tokens.",
      citation: "Client Scope & Milestone Agreement · SOW-842 Active",
      status: "Resolved in 260ms · Timeline Confirmed",
    },
    {
      id: "scope",
      title: "Out-of-Scope Change Request Triage",
      icon: AlertCircle,
      badge: "Scope Protection",
      client: "Marcus Vance · VP Product at Apex Retail",
      query: "Can we add 3 additional animated 3D landing page renders to the current design sprint scope?",
      aiResponse:
        "3D animation renders are classified as add-on deliverables beyond the current Sprint 3 SOW. I have logged this request and prepared a change-order quote ($2,400) for Jordan, your Account Director, to review with you.",
      citation: "Master Services Agreement (MSA) · Clause 4.2 Out-of-Scope Addendum",
      status: "Escalated to Account Director · Quote Prepared",
    },
    {
      id: "slack",
      title: "Slack Connect Client Assistant",
      icon: MessageSquare,
      badge: "Slack VIP Channel",
      client: "Elena Rostova in #agency-velvet-connect",
      query: "@agency-bot How do we provide our Google Analytics 4 measurement ID for the tracking audit?",
      aiResponse:
        "You can securely share your GA4 Measurement ID (format: G-XXXXXXXXXX) directly in this thread or via your Client Onboarding Form at agency.io/onboard/velvet. Our analytics team will verify telemetry within 24 hours.",
      citation: "Client Onboarding SOP v3 · Analytics Audit Playbook",
      status: "Answered in Slack · SOP Canceled Duplicate Email",
    },
  ];

  const faqs = [
    {
      q: "Can our agency manage multiple client workspaces from one login?",
      a: "Yes. Elpino features multi-tenant agency management. You can switch between client organizations with one click while keeping client documentation, conversation threads, and customer data completely segregated and secure.",
    },
    {
      q: "Can we white-label the chat widget and Help Center for our clients?",
      a: "Yes. Growth and Enterprise agency plans support custom CNAME domains (e.g. support.youragency.com), custom CSS styling, custom bot avatars, and white-labeled email notification templates.",
    },
    {
      q: "Does Elpino work inside Slack Connect channels?",
      a: "Yes. Elpino can join shared Slack Connect channels with your clients. The AI can answer routine timeline and process questions automatically, or draft replies in internal threads for your account leads to approve.",
    },
    {
      q: "How does Elpino protect client confidentiality between different accounts?",
      a: "Each client workspace operates with its own isolated vector database and encryption keys. Information from Client A is never accessible or cited when answering inquiries for Client B.",
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
              <Briefcase size={13} className="text-[#ff5600]" />
              Solutions / Agencies &amp; Professional Services
            </span>
          </div>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                Exceptional client service,{" "}
                <span className="italic text-[#ff5600]">without a bigger inbox.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Give your clients fast, accurate answers about deliverables, timelines, and assets,
                while your creative and technical teams stay focused on high-value delivery.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5600] px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-black"
                >
                  Start agency trial
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-7 py-4 text-base font-medium text-black transition hover:bg-black/5"
                >
                  Book agency demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-black/60">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Multi-client workspace isolation
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Slack Connect integration
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Check size={14} className="text-[#18c983]" /> White-label ready
                </span>
              </div>
            </div>

            {/* Mascot Picture Display: Agencies Services Sloths */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4f3ec] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-[#ff5600]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/70">
                        Agency Operations Command
                      </span>
                    </div>
                    <span className="rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#18c983]">
                      Retainers Active
                    </span>
                  </div>

                  <div className="relative mt-4 h-64 w-full overflow-hidden rounded-2xl bg-white border border-black/5 p-2">
                    <Image
                      src="/images/agencies-services-sloths.png"
                      alt="Two Sloths Collaborating on Client Service"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        Time Saved / Week
                      </div>
                      <div className="text-xl font-bold text-[#ff5600] mt-0.5">18 Hours</div>
                      <div className="text-[11px] text-[#18c983] font-medium">Per account manager</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-black/5 shadow-sm">
                      <div className="text-[10px] font-semibold uppercase text-black/40">
                        First Reply Speed
                      </div>
                      <div className="text-xl font-bold text-black mt-0.5">45s</div>
                      <div className="text-[11px] text-black/50">Across Slack &amp; Email</div>
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

      {/* 3. FOUR CORE AGENCY PILLARS */}
      <section className="border-b border-black/5 bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              High-Touch Client Services
            </span>
            <h2 className="mt-3 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#17181c]">
              For the questions between the work.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65 sm:text-lg">
              The strongest client relationships are built on responsive, transparent communication.
              Keep clients informed about timelines and scope without pulling talent out of deep work.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {agencyPillars.map((p) => {
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

      {/* 4. INTERACTIVE AGENCY SIMULATOR */}
      <section className="border-b border-black/5 bg-[#17181c] py-20 text-white sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff5600]">
              Interactive Simulation
            </span>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">
              Experience agency client triage.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Click through client scenarios below to see how Elpino handles deliverable timelines,
              scope change requests, and shared Slack Connect channel discussions.
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
                <div className="text-xs text-white/50 mt-0.5">Client: {activeSim.client}</div>
              </div>

              <span className="rounded-full bg-[#18c983]/15 text-[#18c983] px-3 py-1 text-xs font-semibold">
                {activeSim.status}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
                <div className="text-[11px] uppercase font-semibold text-white/40">
                  Client Inquiry
                </div>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  "{activeSim.query}"
                </p>
              </div>

              <div className="rounded-xl bg-[#ff5600]/10 border border-[#ff5600]/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase font-semibold text-[#ff5600]">
                  <span>Agency AI Grounded Resolution</span>
                  <span className="font-mono text-white/40 text-[10px]">{activeSim.citation}</span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {activeSim.aiResponse}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/5">
                <span>Integrated with your agency SOWs, deliverables roadmap, and Slack</span>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff5600] px-4 py-1.5 text-white font-semibold text-xs hover:bg-white hover:text-black transition"
                >
                  Deploy for your agency →
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
              Built for agencies, consultancies, and studios.
            </h2>
            <p className="mt-4 text-base text-black/60">
              Clear answers on data isolation, white-labeling, Slack Connect, and client onboarding.
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
            Client Communication That Scales
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            Deliver 5-star client communication with zero burnout.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start your free 14-day agency trial today. Connect client Slack channels and project
            guidelines in minutes with zero credit card required.
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
