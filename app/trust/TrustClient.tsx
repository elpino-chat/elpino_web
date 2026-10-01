"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Lock,
  FileText,
  KeyRound,
  Download,
  ExternalLink,
  Server,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Award,
  Globe,
  Database,
  Building,
} from "lucide-react";

export function TrustClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const securityBadges = [
    { title: "Private by design", desc: "Names, emails and payment details are swapped for placeholders before any AI model reads a conversation", icon: Lock },
    { title: "Never used to train", desc: "Your conversations and documents are never used to train AI models, whichever provider answers", icon: Eye },
    { title: "Verified first", desc: "Account tools only unlock once a customer has proved who they are, by signed token or email code", icon: KeyRound },
    { title: "Credentials encrypted", desc: "Keys and tokens you connect are encrypted before they are stored, and wiped when you disconnect", icon: Database },
  ];

  const complianceTabs = [
    {
      title: "Your data",
      badge: "Data handling",
      items: [
        { heading: "Scoped to your workspace", text: "Conversations, knowledge, customers and settings all belong to a workspace, and every lookup is scoped to it. Nothing crosses over by accident." },
        { heading: "Team-only stays team-only", text: "Notes marked team-only are filtered out before a conversation is ever shown to the visitor's widget." },
        { heading: "Short-lived things expire", text: "Verification codes, session credentials and secure-link content are expired and cleaned up automatically." },
        { heading: "Delete what you need to", text: "Deleting a workspace cancels its subscription and removes its records. People can leave a workspace, and an account can be deleted from Settings." },
      ],
    },
    {
      title: "The AI",
      badge: "AI safeguards",
      items: [
        { heading: "Real details never reach the model", text: "Names, emails, phone numbers, addresses and order or payment details are swapped for safe placeholders before the AI reads a conversation." },
        { heading: "Secrets are removed, not hidden", text: "Passwords, API keys, tokens and one-time codes are stripped out entirely before anything reaches a model." },
        { heading: "Messages are data, not instructions", text: "Customer messages, documents and tool results reach the model labelled as untrusted information, so instructions hidden inside them are not followed." },
        { heading: "A second opinion on every draft", text: "A separate check reviews each draft against the evidence the AI gathered. An unsupported claim is sent back for a rewrite." },
      ],
    },
    {
      title: "Access & identity",
      badge: "Who can do what",
      items: [
        { heading: "Passwords are hashed", text: "Your password is never kept in a form anyone could read back, and signed session tokens can't be forged or edited." },
        { heading: "Signed identity from your own site", text: "For logged-in customers, your server vouches for who they are with a short-lived signed credential, so the customer doesn't have to prove it again." },
        { heading: "Guests stay guests", text: "A typed name, email or payment reference never counts as proof of identity. Account tools stay locked until a customer is verified." },
        { heading: "Owners control the team", text: "Owners decide who can invite, can promote or remove members, and can revoke a workspace join link at any time." },
      ],
    },
    {
      title: "Systems",
      badge: "How it's run",
      items: [
        { heading: "Internal services aren't public", text: "Our backend services and database aren't exposed to the internet. Only a single hardened entry point is." },
        { heading: "Closed by default", text: "Every route requires proof it's an authorized internal call unless it's explicitly marked public." },
        { heading: "Rate limits that fail closed", text: "Public forms are rate limited across every server, and if the limiter can't be reached the request is refused." },
        { heading: "Signed payment webhooks", text: "Payment notifications are accepted only with a valid, verified signature, and a replayed one can never re-grant credit." },
      ],
    },
  ];

  const faqs = [
    {
      q: "Does Elpino use my conversations or knowledge to train AI models?",
      a: "No. Your conversations and documents are never used to train AI models, and the same privacy rules apply no matter which AI provider answers.",
    },
    {
      q: "Does Elpino hold a SOC 2 report or other certification?",
      a: "Not today. The Security guide describes the controls built into the product, and it describes how the platform is built rather than a certification. If that changes, this page will say so. If you need a security questionnaire answered, email security@elpino.chat.",
    },
    {
      q: "What does the AI actually see?",
      a: "Names, emails, phone numbers, addresses and payment details are replaced with placeholders before a model reads a conversation, and passwords, keys and one-time codes are removed entirely.",
    },
    {
      q: "How do I report a vulnerability?",
      a: "Email security@elpino.chat with the details and how to reproduce it. A person on the team reads every report.",
    },
    {
      q: "Can I delete my data?",
      a: "Yes. You can delete a workspace, which cancels its subscription and removes its records, or delete your account from Settings. The Privacy Policy sets the outer limit for full removal.",
    },
  ];

  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      {/* Hero */}
      <section className="px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="text-[14px] text-black/50">Trust Center</p>
            <h1 className="mt-4 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]">
              Helpful AI. <br />
              Uncompromising boundaries.
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">
              Your customers deserve answers they can trust. Your team deserves the controls to inspect,
              audit, and verify every single interaction.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#compliance-matrix" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">
                See the controls <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/security-guide" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">
                Read the security guide
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-black/60">
              {["Private details never reach the model", "Never used to train models", "Credentials encrypted at rest"].map((x) => (
                <span key={x} className="flex items-center gap-2"><Check size={14} strokeWidth={3} className="text-[#1aa37a]" /> {x}</span>
              ))}
            </div>
          </div>

          {/* Security enclave card */}
          <div className="animate-[elpino-focus_0.9s_ease-out_0.25s_both] overflow-hidden rounded-[10px] border border-black/40 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#11120f] text-white"><ShieldCheck size={14} /></span>
                <span className="text-[13px] font-medium">Security at a glance</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f5ee] px-2.5 py-0.5 text-[11px] font-medium text-[#0f7a5a]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#1aa37a]" />
                Private-data filter on
              </span>
            </div>
            <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
              <div className="relative h-60 w-48 shrink-0 rounded-xl bg-[#f4f4f2]">
                <Image src="/images/trust-sloth.png" alt="Elpino security guardian sloth ensuring compliance" width={1145} height={1374} priority className="h-full w-full object-contain" />
              </div>
              <div className="mt-4 w-full space-y-3 sm:mt-0">
                <div className="rounded-xl border border-black/15 p-4">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-medium">Every request checked</span>
                    <span className="text-[#0f7a5a]">Verified</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-5 text-black/55">Workspace scoped • Customer identity checked • Replies reviewed against evidence</p>
                  <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[11.5px] text-black/55">
                    <span>Names &amp; emails:</span>
                    <span className="font-medium text-[#0f7a5a]">swapped for references</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f4f4f2] p-3 text-[12.5px] leading-5 text-black/70">
                  <span className="font-medium text-[#11120f]">Privacy Pledge:</span> Your data belongs to you, and your conversations are never used to train models.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="px-5 pb-8 sm:px-8 lg:px-20">
        <div className="mx-auto grid max-w-[1500px] gap-px overflow-hidden rounded-[10px] border border-black/40 bg-black/15 sm:grid-cols-2 lg:grid-cols-4">
          {securityBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="bg-white p-7 transition-colors hover:bg-[#fafaf9]">
                <span className="flex size-11 items-center justify-center rounded-full bg-[#f4f4f2]"><Icon size={20} /></span>
                <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{badge.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-6 text-black/60">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Controls */}
      <section id="compliance-matrix" className="scroll-mt-20 px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="text-[14px] text-black/50">How it works</p>
            <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Inspect the controls.</h2>
            <p className="mt-5 text-lg leading-8 text-black/65">What we do to protect your data, how the AI is kept inside limits, and how access and systems are controlled. Each one is described in more detail in the security guide.</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {complianceTabs.map((tab, idx) => (
              <button key={idx} type="button" onClick={() => setActiveTab(idx)} aria-pressed={activeTab === idx} className={`rounded-full border px-5 py-2.5 text-[14.5px] font-medium transition ${activeTab === idx ? "border-[#11120f] bg-[#11120f] text-white" : "border-black/25 bg-white hover:border-black/60"}`}>
                {tab.title}
              </button>
            ))}
          </div>
          <p className="mt-5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-black/45">{complianceTabs[activeTab].badge}</p>

          <div key={activeTab} className="mt-4 grid gap-4 md:grid-cols-2" style={{ animation: "elpino-rv-deal .45s both" }}>
            {complianceTabs[activeTab].items.map((item, i) => (
              <div key={i} className="flex flex-col justify-between rounded-[10px] border border-black/40 bg-white p-7 transition-colors hover:bg-[#fafaf9] sm:p-8">
                <div>
                  <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#0f7a5a]">
                    <CheckCircle2 size={15} /> Active control
                  </div>
                  <h3 className="mt-3 text-2xl font-normal tracking-[-0.025em]">{item.heading}</h3>
                  <p className="mt-3 text-[16px] leading-7 text-black/65">{item.text}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-black/10 pt-4 text-[12px] text-black/50">
                  <Lock size={12} />
                  <span>Enforced continuously across all production environments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="text-[14px] text-black/50">Security questions</p>
            <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Need to know more? Ask us directly.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">
              We'd rather answer a hard question than hide behind a badge. Send us your security questionnaire or ask how any control works, and a person will reply.
            </p>
            <div className="mt-8 border-b border-black/15">
              {[
                "Vendor and security questionnaires",
                "How a specific control works",
                "Data deletion and privacy requests",
                "Reporting a vulnerability",
              ].map((doc) => (
                <div key={doc} className="flex items-center gap-3 border-t border-black/15 py-3.5 text-[16px]">
                  <FileText size={17} className="shrink-0 text-black/45" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-black/40 bg-[#f4f4f2] p-7 sm:p-9">
            <h3 className="text-2xl font-normal tracking-[-0.025em]">Email the security team</h3>
            <p className="mt-2 text-[14.5px] leading-6 text-black/60">A person reads every message. Include your company and what you need to review.</p>
            <a href="mailto:security@elpino.chat?subject=Security%20question" className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#11120f] text-[15px] font-medium text-white transition hover:opacity-85">
              security@elpino.chat <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <Link href="/security-guide" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-full border border-black/25 bg-white text-[15px] font-medium transition hover:border-black/60">Read the security guide</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Trust and security, answered.</h2>
          <div className="border-b border-black/20">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border-t border-black/20">
                  <h3>
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                      <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug tracking-[-0.015em]">{faq.q}</span>
                      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#11120f] bg-[#11120f] text-white" : "border-black/25"}`}>+</span>
                    </button>
                  </h3>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><p className="max-w-2xl pb-7 text-[17px] leading-7 text-black/65">{faq.a}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 pb-24 pt-4 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-[1500px] rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
          <p className="text-[14px] text-black/50">Security you can inspect</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">Questions about security?</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">Email the team, or read how each control works in the security guide.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/security-guide" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">
              Read the security guide <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="mailto:security@elpino.chat" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">security@elpino.chat</a>
          </div>
        </div>
      </section>
    </main>
  );
}
