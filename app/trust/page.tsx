import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Trust & Security",
  description: "How Elpino protects customer data, handles AI uncertainty, and keeps your team in control.",
  alternates: { canonical: `${SITE_URL}/trust` },
  openGraph: {
    title: "Trust & Security | Elpino",
    description: "How Elpino protects customer data and keeps your team in control.",
    url: `${SITE_URL}/trust`,
    type: "website",
  },
};

const foundations = [
  ["Encrypted by default", "Data is encrypted at rest with AES-256 and in transit with TLS 1.3. Integration credentials are used server-side only."],
  ["Your data stays yours", "Your workspace data is used to provide your Elpino experience—not to train models for other customers."],
  ["Useful access, clear limits", "Payment connections are read-only, so Elpino can surface order context without changing records."],
];

const controls = [
  ["Answer trail", "Review the knowledge checked behind an AI response, right alongside the customer conversation."],
  ["Human handoff", "When the AI is not the right fit, it passes the conversation to your team instead of making something up."],
  ["Verified identity", "Use short-lived, server-signed tokens to verify customers before showing account-specific information."],
  ["Secure requests", "Collect sensitive information through a secure one-time request when a conversation calls for it."],
];

export default function TrustPage() {
  return (
    <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      <section className="relative overflow-hidden bg-[#111216] px-5 pb-20 pt-28 text-white sm:px-8 md:pb-28 md:pt-36 lg:px-16">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(112,96,189,0.78),transparent_28rem),radial-gradient(circle_at_12%_88%,rgba(66,140,229,0.44),transparent_29rem)]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end lg:gap-20">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]"><span className="h-px w-8 bg-[#d9bef4]" />Trust at Elpino</p>
            <h1 className="mt-7 text-balance text-5xl font-normal leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-7xl">Helpful AI.<br /><span className="text-[#d9bef4]">Clear boundaries.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">Your customers deserve answers they can trust. Your team deserves the controls to understand, review, and take over every conversation.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/security-guide" className="inline-flex h-12 items-center justify-center rounded-md bg-[#fe9238] px-6 text-sm font-semibold text-black transition hover:bg-white">Read security guide →</Link><Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 text-sm font-medium transition hover:border-white hover:bg-white hover:text-black">Talk to our team</Link></div>
          </div>
          <div className="relative">
            <Image src="/images/trust-sloth.png" alt="" width={1145} height={1374} className="pointer-events-none absolute -right-16 -top-28 z-10 h-auto w-44 rotate-6 drop-shadow-2xl sm:w-52" />
            <div className="relative overflow-hidden rounded-xl border border-[#428ce5] bg-[#edf7ff] p-3 text-[#17181c] shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-5">
            <div className="rounded-lg bg-white p-5 sm:p-7"><div className="flex items-center justify-between border-b border-black/10 pb-4 text-xs"><span className="font-medium">AI answer review</span><span className="rounded-full bg-[#e8f4eb] px-2.5 py-1 text-[10px] text-[#37744f]">Ready to review</span></div><div className="mt-6 flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eee5fa] text-[#765a99]">✦</span><div><p className="text-sm font-medium">Answer grounded in your knowledge</p><p className="mt-1 text-xs leading-5 text-black/50">Sources are kept close to the response so your team can understand what the AI checked.</p></div></div><div className="mt-6 rounded-xl border border-[#d7e4f1] bg-[#f6faff] p-4"><p className="text-[10px] font-medium uppercase tracking-wider text-[#527b97]">When confidence is low</p><p className="mt-2 text-sm leading-6">The conversation is handed to your team with the customer’s context attached.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#428ce5] px-5 py-7 text-white sm:px-8 lg:px-16"><div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-10 gap-y-3 text-sm"><span className="font-medium">Protected customer data.</span><span className="text-white/70">Reviewable AI responses.</span><span className="text-white/70">People stay in the loop.</span></div></section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-16"><div className="mx-auto max-w-[1400px]"><div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7060bd]">Built on good defaults</p><h2 className="mt-4 text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">Security should not be a special setting.</h2></div><p className="max-w-xl text-base leading-7 text-black/60">The basics are part of the product: protect credentials, limit access, and make it easy to see how a customer answer came together.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{foundations.map(([title, text], index) => <article key={title} className="rounded-xl border border-black/10 bg-[#fbfbfa] p-7"><span className="flex size-10 items-center justify-center rounded-lg bg-[#eee5fa] text-sm text-[#7060bd]">{["⌁", "◌", "↗"][index]}</span><h3 className="mt-9 text-2xl font-medium tracking-[-0.04em]">{title}</h3><p className="mt-4 text-sm leading-7 text-black/55">{text}</p></article>)}</div></div></section>

      <section className="bg-[#fff1e3] px-5 py-20 sm:px-8 md:py-28 lg:px-16"><div className="mx-auto max-w-[1400px]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#956840]">Controls that keep you close</p><div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">Know what happened.<br />Stay in charge of what’s next.</h2><p className="max-w-sm text-sm leading-7 text-[#76634f]">The best automation does not make your team disappear. It gives them a clearer place to step in.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#dfc7b1] bg-[#dfc7b1] md:grid-cols-2">{controls.map(([title, text], index) => <article key={title} className="bg-[#fff1e3] p-7 sm:p-8"><span className="text-sm font-medium text-[#b56e36]">0{index + 1}</span><h3 className="mt-7 text-2xl font-medium tracking-[-0.04em]">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-[#76634f]">{text}</p></article>)}</div></div></section>

      <section className="bg-[#111216] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16"><div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">Identity, without exposure</p><h2 className="mt-5 text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">Verify customers before revealing customer-specific information.</h2><p className="mt-6 max-w-lg text-base leading-7 text-white/65">Elpino can accept a short-lived token signed by your own server, so your customer’s identity can be verified without sending your workspace secret to the browser.</p><Link href="/docs/identity-verification" className="mt-8 inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-sm font-medium transition hover:bg-white hover:text-black">Explore identity verification ↗</Link></div><div className="rounded-xl border border-[#428ce5] bg-[#edf7ff] p-3 text-[#17181c] sm:p-5"><div className="rounded-lg bg-white p-5 sm:p-7"><p className="text-xs font-medium">Your server</p><div className="my-5 flex items-center gap-3 text-xs text-[#527b97]"><span className="h-px flex-1 bg-[#cbdceb]" /><span className="rounded-full bg-[#428ce5] px-3 py-1.5 text-white">short-lived signed token</span><span className="h-px flex-1 bg-[#cbdceb]" /></div><div className="rounded-xl bg-[#eee5fa] p-4"><p className="text-sm font-medium">Verified customer</p><p className="mt-1 text-xs leading-5 text-black/55">Elpino can safely unlock the account context your team needs to help.</p></div><p className="mt-5 text-[10px] leading-5 text-[#628099]">Your workspace secret stays on your server.</p></div></div></div></section>

      <section className="bg-[#428ce5] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16"><div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">More questions? Good.</p><h2 className="mt-5 text-balance text-4xl font-normal leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl">Trust is something you should be able to inspect.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">Read the full security guide, or send our team the questions that matter to yours.</p></div><div className="flex flex-wrap gap-3"><Link href="/security-guide" className="inline-flex h-12 items-center justify-center rounded-md bg-[#fe9238] px-6 text-sm font-semibold text-black transition hover:bg-white">Security guide →</Link><Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-6 text-sm font-medium transition hover:bg-white hover:text-black">Contact us</Link></div></div></section>
    </div>
  );
}
