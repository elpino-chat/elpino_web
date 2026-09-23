import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Server,
  Layers,
  Database,
  Cpu,
  Globe,
  Award,
  Terminal,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Security Architecture & Technical Guide | Elpino",
  description:
    "Comprehensive technical security guide: AES-256 and TLS 1.3 encryption, tenant-isolated PostgreSQL, Zero Data Retention for LLM models, and prompt injection firewalls.",
  alternates: { canonical: `${SITE_URL}/security-guide` },
  openGraph: {
    title: "Security Architecture & Technical Guide | Elpino",
    description:
      "Deep dive into Elpino's security architecture, cryptographic safeguards, and AI model isolation.",
    url: `${SITE_URL}/security-guide`,
    type: "website",
  },
};

const wrap = "mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16";

const archLayers = [
  {
    layer: "01. Global Edge & Ingress",
    title: "Cloudflare Enterprise Perimeter",
    icon: Globe,
    details: [
      "Anycast DNS routing with automated DDoS mitigation capable of filtering multi-terabit attacks",
      "Web Application Firewall (WAF) inspecting for OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF)",
      "Strict TLS 1.3 cipher suite negotiation with HTTP Strict Transport Security (HSTS) preloaded",
      "Bot management and behavioral rate limiting preventing credential stuffing on login APIs",
    ],
  },
  {
    layer: "02. Application & API Gateway",
    title: "Stateless Microservices & Zero-Trust Auth",
    icon: Server,
    details: [
      "JWT and HMAC-SHA256 signature verification on all customer and webhook incoming requests",
      "SAML 2.0 and SCIM 2.0 directory sync with Okta, Microsoft Entra ID (Azure AD), and Google",
      "Fine-grained Role-Based Access Control (RBAC) enforced on every API route and mutation",
      "Immutable structured logging streaming to centralized SIEM clusters with zero PII retention",
    ],
  },
  {
    layer: "03. AI Inference & Guardrail Sandbox",
    title: "Isolated LLM Endpoints & ZDR Protocol",
    icon: Cpu,
    details: [
      "Zero Data Retention (ZDR) guarantee: prompts and completions are immediately purged post-inference",
      "Bidirectional prompt injection firewall detecting adversarial jailbreaks and instruction overrides",
      "Automated PII scrubber masking credit card numbers, SSNs, and health identifiers at edge ingestion",
      "Deterministic source verification requiring cited knowledge base chunks before reply generation",
    ],
  },
  {
    layer: "04. Database & Storage Tier",
    title: "PostgreSQL with Envelope Encryption",
    icon: Database,
    details: [
      "PostgreSQL clusters with Row-Level Security (RLS) policies guaranteeing strict tenant partition isolation",
      "Storage volumes encrypted at rest with AES-256-GCM using customer-isolated AWS KMS envelope keys",
      "Automated daily encrypted point-in-time recovery (PITR) backups with 30-day retention",
      "Optional EU-only data residency hosted in AWS Frankfurt (eu-central-1)",
    ],
  },
];

const techSpecs = [
  { spec: "Encryption in Transit", standard: "TLS 1.3 with ECDHE key exchange and AES-256-GCM / CHACHA20-POLY1305" },
  { spec: "Encryption at Rest", standard: "AES-256-GCM via AWS Key Management Service (KMS) with annual rotation" },
  { spec: "Authentication Standards", standard: "SAML 2.0, OpenID Connect (OIDC), SCIM 2.0, WebAuthn / FIDO2 MFA" },
  { spec: "AI Model Retraining", standard: "Strict ZERO. Customer data is contractually excluded from public LLM training" },
  { spec: "Webhook Integrity", standard: "HMAC-SHA256 timestamped signatures with replay attack protection" },
  { spec: "Compliance Audits", standard: "SOC 2 Type II certified annually; GDPR & CCPA compliant; ISO 27001 aligned" },
  { spec: "Data Residency", standard: "United States (AWS us-east-1) or European Union (AWS eu-central-1)" },
];

const incidentResponse = [
  { severity: "P0 - Critical", response: "< 15 minutes", criteria: "Security breach, unauthorized data access, or core service outage" },
  { severity: "P1 - High", response: "< 1 hour", criteria: "Degraded security control, suspected credential leak, or critical bug" },
  { severity: "P2 - Medium", response: "< 4 hours", criteria: "Non-critical vulnerability identified by automated scanning or researcher" },
  { severity: "P3 - Low", response: "< 24 hours", criteria: "Minor configuration recommendation or informational security inquiry" },
];

export default function SecurityGuidePage() {
  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-[#111216] px-5 pb-16 pt-28 text-white sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(112,96,189,0.5),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(24,201,131,0.3),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#d9bef4]">
                <ShieldCheck size={14} className="text-[#d9bef4]" />
                Technical Security & Architecture Guide
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Security built for the conversations{" "}
                <span className="text-[#d9bef4]">you trust us with.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                Elpino brings AI, customer context, and your support team together with uncompromising architectural controls
                around data isolation, encryption, and model governance.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/trust"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
                >
                  Visit Trust Center <ArrowRight size={16} />
                </Link>
                <a
                  href="mailto:security@elpino.chat"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Contact InfoSec Team
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-white/60">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> SOC 2 Type II Certified
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero Model Retraining
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Row-Level Tenant Isolation
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Security Shield */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[#8d65b5]/40 bg-[#f3edfb] p-6 text-[#17181c] shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#7651b0] text-white">
                      <LockKeyhole size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Defense-in-Depth Engine</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    Hardened Production
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/trust-sloth.png"
                      alt="Elpino security guardian sloth with fortified security systems"
                      width={1145}
                      height={1374}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Cryptographic Enclave</span>
                        <span className="text-[#168a5b]">Active</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#7651b0]">
                        AES-256 KMS Key Rotation • Row-Level Security Enforced
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-[#53616b]">
                        <span>Zero Retention:</span>
                        <span className="font-bold text-[#168a5b]">Guaranteed</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#7651b0]/20 bg-[#faf7fd] p-3 text-xs text-[#7651b0]">
                      <span className="font-semibold">Security SLA:</span> 99.99% uptime with 24/7 autonomous intrusion detection and perimeter telemetry.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Tier Architectural Deep-Dive */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className={wrap}>
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              System Architecture
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Defense-in-depth across every layer of the stack.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              We design our infrastructure assuming zero trust. From cloud edge termination to the database storage volume,
              every request is authenticated, encrypted, and evaluated.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {archLayers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md sm:p-9"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f4effb] text-[#7651b0]">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-black/10 bg-[#fbfbfa] px-3 py-1 font-mono text-xs font-semibold text-[#53616b]">
                        {layer.layer}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-normal tracking-[-0.04em] text-[#17181c]">
                      {layer.title}
                    </h3>

                    <div className="mt-6 space-y-3 border-t border-black/5 pt-5">
                      {layer.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-3 text-xs leading-relaxed text-[#53616b]">
                          <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Specifications Table */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className={wrap}>
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Technical Standards
            </span>
            <h2 className="mt-4 text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Specification matrix for InfoSec review.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b]">
              A concise technical overview of the cryptographic primitives, authentication protocols,
              and compliance frameworks governing Elpino.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-black/10 bg-[#fbfbfa]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-[#17181c] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="px-6 py-4 font-semibold">Security Domain</th>
                  <th className="px-6 py-4 font-semibold">Implementation Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 bg-white">
                {techSpecs.map((item, i) => (
                  <tr key={i} className="hover:bg-[#fbfbfa]">
                    <td className="px-6 py-4 font-semibold text-[#17181c]">{item.spec}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#53616b]">{item.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Incident Response & Security SLAs */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className={wrap}>
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Incident Management
            </span>
            <h2 className="mt-4 text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Sustained 24/7 operational vigilance.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b]">
              Our Security Operations Center (SOC) operates continuous automated monitoring with contractual incident response SLAs.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {incidentResponse.map((tier, idx) => (
              <div key={idx} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <span className="inline-block rounded-full bg-[#17181c] px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                  {tier.severity}
                </span>
                <p className="mt-4 text-2xl font-bold tracking-tight text-[#7651b0]">{tier.response}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#53616b]">Max Target SLA</p>
                <p className="mt-4 text-xs leading-relaxed text-[#53616b] border-t border-black/5 pt-3">
                  {tier.criteria}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure & Contact */}
      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
                Responsible Vulnerability Disclosure
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Have a security question or disclosure?
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                We work collaboratively with security researchers and enterprise security officers.
                Reports are acknowledged within 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:security@elpino.chat"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
              >
                security@elpino.chat <ArrowUpRight size={16} />
              </a>
              <Link
                href="/security-policy"
                className="inline-flex min-h-13 items-center rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Read Disclosure Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
