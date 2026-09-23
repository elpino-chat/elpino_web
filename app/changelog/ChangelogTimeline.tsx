"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, Sparkles, Filter, Calendar, Tag, ShieldCheck, Zap } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type ReleaseType = {
  version: string;
  date: string;
  shortDate: string;
  type: string;
  category: "all" | "ai" | "channels" | "integrations" | "security";
  title: string;
  text: string;
  highlights: string[];
  tone: "lavender" | "blue" | "sage" | "sand" | "coral" | "mint";
};

const releases: ReleaseType[] = [
  {
    version: "v2.4",
    date: "September 23, 2026",
    shortDate: "Sep 2026",
    type: "Omnichannel & Triage",
    category: "channels",
    title: "Omnichannel Support & Real-time Inbox Triage",
    text: "Unify every customer touchpoint into a single calm, high-velocity stream. WhatsApp Business, Instagram DMs, Email, Messenger, and live chat webhooks now resolve seamlessly with zero channel fragmentation.",
    highlights: [
      "Unified conversation inbox for WhatsApp, Instagram, Email & Web",
      "Active collision prevention locks prevent teammates from overlapping replies",
      "Priority triage tagging based on sentiment, ARR, and issue severity",
      "Full conversation history aggregated across all channels",
    ],
    tone: "coral",
  },
  {
    version: "v2.3",
    date: "September 08, 2026",
    shortDate: "Sep 2026",
    type: "Commerce & WISMO",
    category: "integrations",
    title: "Order Lookups & Live Courier API Synchronization",
    text: "Deflect 68% of 'Where is my order?' tickets with real-time webhooks connecting to FedEx, UPS, DHL, USPS, and Shopify Plus. Shoppers can track parcels, update shipping addresses prior to fulfillment, and generate QR code returns.",
    highlights: [
      "Live courier milestone decoding with 1.2s lookup latency",
      "Pre-dispatch address validation and warehouse WMS lock checks",
      "Self-service return & exchange authorization with drop-off QR codes",
      "Cryptographic HMAC and phone OTP verification protecting customer PII",
    ],
    tone: "blue",
  },
  {
    version: "v2.2",
    date: "August 24, 2026",
    shortDate: "Aug 2026",
    type: "AI Copilot 2.0",
    category: "ai",
    title: "Autonomous Copilot & Diagnostic Troubleshooting Console",
    text: "Supercharge your human support team. The Copilot now listens to customer problem statements, parses technical logs, searches knowledge docs in under 200ms, and generates verified response drafts with citations.",
    highlights: [
      "31% handle time reduction across all customer conversations",
      "Interactive diagnostic console testing complex API, billing, and auth scenarios",
      "Deterministic citation grounding: zero hallucinations guaranteed",
      "One-click response customization: adjust tone, expand technical depth, or translate",
    ],
    tone: "lavender",
  },
  {
    version: "v2.1",
    date: "August 10, 2026",
    shortDate: "Aug 2026",
    type: "Workflows & SLAs",
    category: "integrations",
    title: "Support Workflows & Visual Branching Engine",
    text: "Design intricate multi-condition routing trees without code. Automate ticket triage, enforce contractual enterprise SLA countdown timers, and trigger bi-directional webhooks to Linear and Slack.",
    highlights: [
      "Visual drag-and-drop support workflow canvas with multi-variable logic",
      "Live SLA countdown visualizer with alerts at 50% and 80% thresholds",
      "Bi-directional Linear, GitHub Issues & Jira synchronization",
      "Autonomous sentiment radar classifying tickets from -1.0 to +1.0",
    ],
    tone: "mint",
  },
  {
    version: "v2.0",
    date: "July 28, 2026",
    shortDate: "Jul 2026",
    type: "Visitor Intelligence",
    category: "channels",
    title: "Visitor Intelligence & Real-time Edge Telemetry",
    text: "Understand who is asking before you reply. Stream live page paths, dwell duration, rage click alerts, and reverse-IP B2B firmographic data directly into the support sidebar with zero page load penalty.",
    highlights: [
      "Real-time page breadcrumbs and rage click detection (< 40ms sync)",
      "B2B firmographic enrichment (company size, tech stack, funding)",
      "Live Stripe subscription data (ARR tier, renewal date, payment health)",
      "100% GDPR and CCPA compliant cookieless telemetry mode",
    ],
    tone: "sand",
  },
  {
    version: "v1.8",
    date: "July 01, 2026",
    shortDate: "Jul 2026",
    type: "AI Answers & Audit",
    category: "ai",
    title: "Clearer Answer Trails & Zero Retention Verification",
    text: "Every AI answer now carries a complete cryptographic trail of the knowledge snippets checked along the way, so your team can verify exactly which article or doc generated the response.",
    highlights: [
      "Source citation trail displayed beside every AI response",
      "Zero Data Retention (ZDR) guarantee verified for LLM inference",
      "Faster human review before triggering an escalation",
      "Confidence score breakdown with threshold controls",
    ],
    tone: "lavender",
  },
  {
    version: "v1.6",
    date: "June 24, 2026",
    shortDate: "Jun 2026",
    type: "Human Escalation",
    category: "channels",
    title: "Contextual Handoff & Internal Private Whispers",
    text: "When a conversation needs a person, Elpino transfers the full context bundle in under 12 seconds. Teammates collaborate behind the scenes using private whisper notes that customers never see.",
    highlights: [
      "AI-generated 3-bullet executive briefing for incoming human agents",
      "Zero customer repetition: entire message history preserved",
      "Private internal whisper notes with @mentions and Slack alerts",
      "Presence indicators showing who is actively viewing or typing",
    ],
    tone: "coral",
  },
  {
    version: "v1.4",
    date: "June 17, 2026",
    shortDate: "Jun 2026",
    type: "Knowledge Hub",
    category: "ai",
    title: "Smarter Content Readiness & Automated Crawler",
    text: "Bring your website pages, markdown documentation, PDFs, and Notion databases into your agent's verified brain with automated sync schedules and health diagnostics.",
    highlights: [
      "Automated web crawler with recurring re-index schedules",
      "Multi-format document parsing (PDF, Markdown, HTML, Notion, Confluence)",
      "Chunk preview and citation simulation before publishing",
      "Knowledge gap detection highlighting topics with missing answers",
    ],
    tone: "sage",
  },
  {
    version: "v1.2",
    date: "June 03, 2026",
    shortDate: "Jun 2026",
    type: "Enterprise Trust",
    category: "security",
    title: "SOC 2 Type II Certification & Okta SAML SSO",
    text: "Enterprise governance is now built into every workspace. Manage access with Okta, Azure AD, and Google Workspace, backed by AES-256-GCM encryption and independent AICPA compliance audits.",
    highlights: [
      "SOC 2 Type II independent audit report available",
      "SAML 2.0 and SCIM 2.0 directory synchronization",
      "PostgreSQL Row-Level Security tenant isolation",
      "Immutable SIEM audit log exports via real-time webhooks",
    ],
    tone: "blue",
  },
];

const foundations = [
  ["v1.0", "The Modern Support Workspace", "AI answers, shared omnichannel inbox, and contextual human handoff in one unified canvas.", "May 2026"],
  ["v0.8", "Knowledge That Works", "Vector embeddings, hybrid BM25 semantic retrieval, and citation verification for support agents.", "Mar 2026"],
  ["v0.5", "Conversations, Connected", "Lightweight embeddable chat widget with real-time WebSocket connection to the support dashboard.", "Jan 2026"],
];

const tones = {
  lavender: "border-[#d9c8f0] bg-[#f4effb] text-[#694d8b]",
  blue: "border-[#bdd8ef] bg-[#edf7ff] text-[#356887]",
  sage: "border-[#c9dbbf] bg-[#f1f7ed] text-[#496447]",
  sand: "border-[#f0d5b7] bg-[#fff3e5] text-[#956840]",
  coral: "border-[#ffd8c5] bg-[#fff0e8] text-[#b4542c]",
  mint: "border-[#d8f0e5] bg-[#edf6f0] text-[#28745a]",
};

export function ChangelogTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [timelineHeight, setTimelineHeight] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const measure = () => setTimelineHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedFilter]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 12%", "end 55%"] });
  const beamHeight = useTransform(scrollYProgress, [0, 1], [0, timelineHeight]);
  const beamOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const filteredReleases = releases.filter(
    (rel) => selectedFilter === "all" || rel.category === selectedFilter
  );

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-[#17181c]/10 bg-[#f2f4ed] px-5 pb-20 pt-28 sm:px-8 md:pb-28 md:pt-36 lg:px-16">
        <div aria-hidden className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(35,61,77,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div aria-hidden className="absolute -right-40 top-0 size-[36rem] rounded-full bg-[#e4d8f3]/65 blur-3xl" />
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-6xl"
        >
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c416f]">
            <span className="h-px w-8 bg-current" /> Continuous Innovation & Releases
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-7xl">
                A little better, <br />
                <span className="text-[#7651b0]">every single release.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#4b504b] sm:text-xl">
                A living record of the high-velocity improvements, architecture upgrades, and new capabilities we ship
                to empower world-class customer support.
              </p>
            </div>
            <div className="relative min-h-44 rounded-3xl border border-[#17181c]/10 bg-white/80 p-6 shadow-[0_20px_55px_-40px_rgba(23,24,28,0.65)] backdrop-blur-sm">
              <Image
                src="/images/changelog-sloth.png"
                alt="Elpino changelog mascot celebrating updates"
                width={1214}
                height={1295}
                className="pointer-events-none absolute -right-8 -top-24 w-36 rotate-6 drop-shadow-xl"
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7651b0]">Latest Release</p>
              <p className="mt-2 text-xs font-bold text-[#18c983]">v2.4 • September 2026</p>
              <p className="mt-1 max-w-[13rem] text-lg font-medium tracking-tight">Omnichannel Triage</p>
              <a
                href="#latest"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#293f4e] hover:text-[#7651b0]"
              >
                Explore updates <ArrowDownRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-black/10 bg-white py-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#53616b]">
              <Filter size={14} className="text-[#7651b0]" /> Filter by Category:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All Releases", val: "all" },
                { label: "AI & Copilot", val: "ai" },
                { label: "Channels & Inbound", val: "channels" },
                { label: "Integrations & APIs", val: "integrations" },
                { label: "Security & Trust", val: "security" },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setSelectedFilter(f.val)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    selectedFilter === f.val
                      ? "bg-[#17181c] text-white shadow-sm"
                      : "bg-[#fbfbfa] text-[#53616b] hover:bg-[#f1edf7] hover:text-[#17181c]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="latest" className="scroll-mt-[calc(var(--elpino-header-h,64px)+1.5rem)] px-5 py-20 sm:px-8 md:py-28 lg:px-16">
        <div ref={containerRef} className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl md:mb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7651b0]">Release Timeline</p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">Follow the thread.</h2>
            <p className="mt-4 text-base leading-7 text-black/60">
              Every feature, API connector, and security advancement in chronological order.
            </p>
          </div>

          <div ref={timelineRef} className="relative">
            {filteredReleases.map((release, index) => (
              <div key={release.title} className="flex justify-start pt-10 first:pt-0 md:gap-10 md:pt-28">
                {/* Sticky Date/Version on Left */}
                <div className="sticky top-[calc(var(--elpino-header-h,64px)+6.5rem)] z-30 flex h-fit w-full max-w-xs items-start self-start lg:max-w-sm">
                  <div aria-hidden className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-[#faf9f6]">
                    <div className="size-4 rounded-full border border-[#cbb2ee] bg-[#e9dcf8] shadow-[0_0_0_3px_rgba(250,249,246,1)]" />
                  </div>
                  <div className="hidden pl-20 md:block">
                    <span className="font-mono text-xs font-bold text-[#7651b0]">{release.version}</span>
                    <h3 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[#17181c]/70 lg:text-4xl">
                      {release.shortDate}
                    </h3>
                    <p className="mt-1 text-xs text-black/45">{release.date}</p>
                    {index === 0 && (
                      <span className="mt-3 inline-flex rounded-full bg-[#18c983] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Release Card on Right */}
                <div className="relative w-full pl-20 pr-2 md:pl-4 md:pr-6 lg:pr-10">
                  <div className="mb-4 md:hidden">
                    <span className="font-mono text-xs font-bold text-[#7651b0]">{release.version}</span>
                    <h3 className="text-2xl font-semibold tracking-[-0.045em] text-[#17181c]/80">{release.shortDate}</h3>
                    <p className="mt-0.5 text-xs text-black/45">{release.date}</p>
                    {index === 0 && (
                      <span className="mt-2 inline-flex rounded-full bg-[#18c983] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Latest
                      </span>
                    )}
                  </div>

                  <motion.article
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-[46rem] rounded-3xl border border-[#17181c]/10 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-9"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          tones[release.tone]
                        }`}
                      >
                        {release.type}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#53616b]">{release.version}</span>
                    </div>

                    <h4 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#17181c] sm:text-3xl">
                      {release.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-[#53616b] sm:text-base">{release.text}</p>

                    <div className="mt-6 rounded-2xl border border-black/5 bg-[#faf9f6] p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#7651b0]">Key Enhancements</p>
                      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {release.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#53616b]">
                            <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" strokeWidth={2.5} />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.article>
                </div>
              </div>
            ))}

            {/* Glowing Timeline Line */}
            <div
              aria-hidden
              style={{ height: timelineHeight }}
              className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,rgba(27,44,53,0),rgba(27,44,53,0.15)_6%,rgba(27,44,53,0.15)_94%,rgba(27,44,53,0))]"
            >
              <motion.div
                style={{ height: reducedMotion ? timelineHeight : beamHeight, opacity: reducedMotion ? 1 : beamOpacity }}
                className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-[linear-gradient(to_top,#7651b0_0%,#428ce5_20%,rgba(66,140,229,0)_80%)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Earlier Chapters / Foundation Releases */}
      <section className="border-y border-[#17181c]/10 bg-[#eef6eb] px-5 py-20 sm:px-8 md:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#496447]">Earlier Chapters</p>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="text-4xl font-medium tracking-[-0.055em] sm:text-5xl">The foundational architecture.</h2>
            <p className="max-w-sm text-sm leading-6 text-black/60">
              The seminal architectural decisions that shaped the calm, reliable workspace Elpino is today.
            </p>
          </div>
          <div className="mt-12 grid border-l border-t border-[#17181c]/10 md:grid-cols-3">
            {foundations.map(([version, title, text, date]) => (
              <article key={version} className="border-b border-r border-[#17181c]/10 bg-white/60 p-7 sm:p-8">
                <span className="font-mono text-sm font-bold text-[#7651b0]">{version}</span>
                <h3 className="mt-4 text-xl font-medium tracking-tight text-[#17181c]">{title}</h3>
                <p className="mt-3 min-h-14 text-xs leading-relaxed text-[#53616b]">{text}</p>
                <time className="mt-6 block font-mono text-[11px] font-semibold uppercase tracking-wider text-black/40">
                  {date}
                </time>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Help Shape What's Next / Feedback CTA */}
      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">
              <Sparkles size={14} /> Help shape what&apos;s next
            </p>
            <h2 className="mt-5 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.06em] sm:text-5xl">
              Have an idea for a better customer conversation?
            </h2>
            <p className="mt-5 text-base leading-7 text-white/60">
              We ship multiple times a week and collaborate closely with modern support teams.
              Tell us what integrations or workflows would unlock magic for your team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#d9bef4] px-6 text-sm font-semibold text-[#17181c] transition hover:bg-white"
            >
              Submit feature request <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium transition hover:border-white hover:bg-white/10"
            >
              Try Elpino free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
