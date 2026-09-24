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
  const [artifactRequested, setArtifactRequested] = useState<string | null>(null);

  const securityBadges = [
    { title: "SOC 2 Type II", desc: "Audited annually by independent AICPA-accredited firm", icon: Award },
    { title: "Zero Data Retention", desc: "Your data is never used to train public or foundation AI models", icon: Lock },
    { title: "GDPR & CCPA", desc: "Full European & California privacy compliance with standard DPA", icon: Globe },
    { title: "HIPAA Compliant", desc: "Business Associate Agreements (BAA) available for healthcare", icon: ShieldCheck },
  ];

  const complianceTabs = [
    {
      title: "Data Protection & Encryption",
      badge: "Cryptographic Architecture",
      items: [
        {
          heading: "AES-256-GCM & TLS 1.3",
          text: "All customer data is encrypted in transit using TLS 1.3 with modern cipher suites. Data at rest is encrypted using AES-256-GCM with customer-specific KMS keys.",
        },
        {
          heading: "Tenant-Isolated Partitions",
          text: "Each workspace operates within logically isolated database partitions with row-level security (RLS) policies enforced at the PostgreSQL engine layer.",
        },
        {
          heading: "Automated PII Redaction",
          text: "Before messages reach language models, our edge redaction engine detects and scrubs credit card numbers, social security numbers, and sensitive health identifiers.",
        },
        {
          heading: "Ephemeral Storage Guarantees",
          text: "Uploaded documents and parsed support knowledge bases can be configured with automated time-to-live (TTL) expiration schedules.",
        },
      ],
    },
    {
      title: "AI Safety & Guardrails",
      badge: "Inference Governance",
      items: [
        {
          heading: "Zero Model Retraining (ZDR)",
          text: "We hold enterprise zero-retention agreements with our foundation model infrastructure providers. Your prompts, customer transcripts, and company data are strictly discarded after inference.",
        },
        {
          heading: "Prompt Injection Firewalls",
          text: "Real-time semantic filtering inspects incoming user queries to intercept and neutralize adversarial jailbreak attempts, delimiter hijacking, and system prompt leakage.",
        },
        {
          heading: "Deterministic Grounding & Citations",
          text: "Elpino requires language models to provide verified source citations for facts. If no supporting document exists, the system automatically triggers a human escalation.",
        },
        {
          heading: "Explainable Answer Audit Trails",
          text: "Every AI-generated reply maintains a timestamped audit log detailing the exact documents, snippets, confidence scores, and tokens evaluated during generation.",
        },
      ],
    },
    {
      title: "Enterprise Access & Governance",
      badge: "Identity & RBAC",
      items: [
        {
          heading: "SAML 2.0 & Okta / Azure AD SSO",
          text: "Seamlessly integrate with Okta, Microsoft Entra ID (Azure AD), Google Workspace, and OneLogin with mandatory Multi-Factor Authentication (MFA).",
        },
        {
          heading: "SCIM 2.0 User Provisioning",
          text: "Automate user onboarding and instant deprovisioning from your central identity provider to prevent orphaned accounts.",
        },
        {
          heading: "Granular Role-Based Access Control",
          text: "Enforce precise permission boundaries with roles including Super Admin, Security Officer, Support Team Lead, Frontline Agent, and Read-Only Auditor.",
        },
        {
          heading: "Immutable SIEM Audit Exports",
          text: "Stream workspace security events, sign-in attempts, and permission changes directly into Splunk, Datadog, or AWS S3 via real-time syslog webhooks.",
        },
      ],
    },
    {
      title: "Subprocessors & Infrastructure",
      badge: "Supply Chain Transparency",
      items: [
        {
          heading: "Amazon Web Services (AWS)",
          text: "Cloud infrastructure host (US-East and EU-Central regions available). Certified ISO 27001, SOC 2, and FedRAMP.",
        },
        {
          heading: "Cloudflare",
          text: "Global Edge Network, DDoS mitigation, Web Application Firewall (WAF), and edge SSL termination.",
        },
        {
          heading: "Private LLM Endpoints",
          text: "Dedicated enterprise model deployments hosted within isolated private VPCs with zero data sharing.",
        },
        {
          heading: "Supabase & PostgreSQL Enterprise",
          text: "Fully managed PostgreSQL instances with encrypted automated daily backups and multi-AZ failover.",
        },
      ],
    },
  ];

  const faqs = [
    {
      q: "Does Elpino use my customer conversations or company knowledge to train AI models?",
      a: "No. Absolutely not. Elpino maintains strict Zero Data Retention (ZDR) and Zero Model Retraining guarantees across all model providers. Your data is used exclusively to answer queries in your own private workspace and is never fed back into public training datasets.",
    },
    {
      q: "How can I obtain a copy of Elpino's SOC 2 Type II report?",
      a: "Our SOC 2 Type II compliance report, along with our latest penetration test executive summary, is available to customers and prospective enterprise clients under mutual NDA. You can request access using the artifact form below or by contacting security@elpino.chat.",
    },
    {
      q: "Can we host customer data within European Union data centers?",
      a: "Yes. For European customers with strict data residency requirements under GDPR, Elpino offers EU-based data residency with all database clusters, KMS keys, and inference endpoints restricted to AWS Frankfurt (eu-central-1).",
    },
    {
      q: "What is your vulnerability disclosure and bug bounty policy?",
      a: "We welcome responsible disclosures from security researchers. If you discover a potential vulnerability, please report it directly to security@elpino.chat. We commit to acknowledging receipt within 24 hours and providing regular remediation status updates.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111216] px-5 pb-20 pt-28 text-white sm:px-8 sm:pb-28 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(112,96,189,0.7),transparent_32rem),radial-gradient(circle_at_12%_88%,rgba(66,140,229,0.4),transparent_30rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#d9bef4]">
                <ShieldCheck size={14} className="text-[#d9bef4]" />
                Enterprise Trust & Compliance Center
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Helpful AI. <br />
                <span className="text-[#d9bef4]">Uncompromising boundaries.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                Your customers deserve answers they can trust. Your team deserves the enterprise controls to inspect,
                audit, and verify every single interaction.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#compliance-matrix"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#fe9238] px-7 text-sm font-semibold text-black transition hover:bg-white"
                >
                  Explore compliance matrix <ArrowRight size={16} />
                </a>
                <Link
                  href="/security-guide"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Read technical security guide
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-white/60">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> SOC 2 Type II Certified
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero Model Retraining Guarantee
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> AES-256 & TLS 1.3 Encryption
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Security Shield Visualizer */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[#8d65b5]/40 bg-[#f3edfb] p-6 text-[#17181c] shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#7651b0] text-white">
                      <ShieldCheck size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Enterprise Security Enclave</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    Zero Retention Active
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/trust-sloth.png"
                      alt="Elpino security guardian sloth ensuring compliance"
                      width={1145}
                      height={1374}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Cryptographic Verification</span>
                        <span className="text-[#168a5b]">Verified Clean</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#7651b0]">
                        Tenant isolated • Customer HMAC token verified • Citations strictly grounded
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>PII Redactor:</span>
                        <span className="font-bold text-[#168a5b]">0 sensitive leaks</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#7651b0]/20 bg-[#faf7fd] p-3 text-xs text-[#7651b0]">
                      <span className="font-semibold">Privacy Pledge:</span> Your data belongs exclusively to you. Never sold, never shared, never used for training.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Badges Banner */}
      <section className="border-b border-black/10 bg-white py-14">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {securityBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/10 bg-[#fbfbfa] p-6 transition hover:shadow-md"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#eee5fa] text-[#7651b0]">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#17181c]">{badge.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#53616b]">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Compliance Matrix Tabs */}
      <section id="compliance-matrix" className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Defense in Depth
            </span>
            <h2 className="mt-4 text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Inspect our security controls in detail.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Explore how we safeguard customer data at rest, in transit, during AI inference, and across our cloud infrastructure.
            </p>
          </div>

          {/* Matrix Tabs */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-b border-black/10 pb-6">
            {complianceTabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === idx
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Tab Content Grid */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {complianceTabs[activeTab].items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md sm:p-9"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7651b0]">
                    <CheckCircle2 size={15} className="text-[#18c983]" />
                    <span>Active Control</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-[#17181c]">{item.heading}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#53616b]">{item.text}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-black/5 pt-4 text-[11px] text-[#53616b]">
                  <Lock size={12} className="text-[#7651b0]" />
                  <span>Enforced continuously across all production environments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Artifacts Request Portal */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
                Compliance Documentation
              </span>
              <h2 className="mt-4 text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
                Request our security packet & audit reports.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#53616b]">
                We make it easy for your InfoSec, Legal, and Compliance teams to evaluate Elpino.
                Our comprehensive compliance binder includes third-party audit reports, data flow diagrams, and standardized DPAs.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "SOC 2 Type II Independent Audit Report (AICPA)",
                  "External Penetration Test Executive Summary",
                  "Standard Data Processing Addendum (DPA) with EU SCCs",
                  "HIPAA Business Associate Agreement (BAA) Template",
                  "Comprehensive Subprocessor Directory & SLA Disclosures",
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#17181c]">
                    <FileText size={16} className="text-[#7651b0]" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Card */}
            <div className="rounded-3xl border border-black/10 bg-[#fbfbfa] p-7 shadow-xl sm:p-9">
              <h3 className="text-xl font-semibold text-[#17181c]">Request Security Packet</h3>
              <p className="mt-1 text-xs text-[#53616b]">
                Enter your work email and our security operations team will grant access within 4 business hours.
              </p>

              {artifactRequested ? (
                <div className="mt-6 rounded-2xl bg-[#e8f6ed] p-6 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-[#18c983]" />
                  <p className="mt-2 text-sm font-semibold text-[#168a5b]">Request Received!</p>
                  <p className="mt-1 text-xs text-[#53616b]">
                    We have dispatched the mutual NDA and document access portal to {artifactRequested}.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
                    if (emailInput.value) setArtifactRequested(emailInput.value);
                  }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#53616b]">
                      Work Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm focus:border-[#7651b0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#53616b]">
                      Company Name
                    </label>
                    <input
                      name="company"
                      type="text"
                      required
                      placeholder="Acme Corp"
                      className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm focus:border-[#7651b0] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17181c] py-3.5 text-sm font-semibold text-white transition hover:bg-[#7651b0]"
                  >
                    Request Security Artifacts <ArrowRight size={16} />
                  </button>
                  <p className="text-center text-[11px] text-[#53616b]">
                    Protected under Elpino Mutual NDA. Delivered securely via DocuSign.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive FAQs */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] sm:text-5xl">
              Enterprise Trust & Compliance FAQ
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 transition hover:bg-[#fbfbfa]">
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
                Enterprise Security You Can Inspect
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Ready to review our security controls?
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Our security and compliance team is available to complete vendor questionnaires and support enterprise audits.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
              >
                Schedule security review <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:security@elpino.chat"
                className="inline-flex min-h-13 items-center rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                security@elpino.chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
