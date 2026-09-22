import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Revenue Teams",
  description: "Turn every customer question into a clearer path to revenue with Elpino.",
  alternates: { canonical: `${SITE_URL}/solutions/revenue` },
  openGraph: {
    title: "For Revenue Teams | Elpino",
    description: "Turn every customer question into a clearer path to revenue with Elpino.",
    url: `${SITE_URL}/solutions/revenue`,
    type: "website",
  },
};

const benefits = [
  ["Answer before intent cools", "Give buyers helpful answers from your real pricing, product, and policy knowledge while they are still on your site."],
  ["Bring the right person in", "When a conversation needs a teammate, the handoff arrives with the customer’s question, context, and the page they came from."],
  ["Keep payment context close", "Connect Stripe or Razorpay so your team can answer order and billing questions without asking customers to repeat themselves."],
];

const steps = [
  ["01", "A customer asks", "A question arrives in the chat widget, right at the moment a buyer needs clarity."],
  ["02", "Elpino finds the answer", "Your knowledge base gives the AI a helpful, accurate starting point."],
  ["03", "Your team takes the lead", "Complex sales, renewals, and account questions land in one shared inbox with their context attached."],
];

export default function RevenueTeamsPage() {
  return (
    <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      <section className="relative overflow-hidden bg-[#fff1e3] px-5 pb-20 pt-28 text-[#17181c] sm:px-8 md:pb-28 md:pt-36 lg:px-16">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_13%_88%,rgba(254,146,56,0.22),transparent_30rem),radial-gradient(circle_at_86%_24%,rgba(217,190,244,0.58),transparent_28rem)]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[minmax(0,0.98fr)_minmax(400px,0.8fr)] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#956840]"><span className="h-px w-8 bg-[#956840]" />Elpino for revenue teams</p>
            <h1 className="mt-7 text-balance text-5xl font-normal leading-[0.96] tracking-[-0.065em] sm:text-6xl md:text-7xl">Every customer question is a chance to <span className="text-[#b56e36]">keep momentum.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60 sm:text-xl">Elpino gives customers a helpful answer in seconds, then brings your team in with the full story when a conversation needs a human touch.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-[#17181c] px-6 text-sm font-medium text-white transition hover:bg-[#fe9238] hover:text-black">Start free <span className="ml-2 text-base">→</span></Link>
              <Link href="/features" className="inline-flex h-12 items-center justify-center rounded-full border border-black/20 bg-white/55 px-6 text-sm font-medium transition hover:bg-white">Explore the workspace</Link>
            </div>
            <p className="mt-5 text-xs text-black/45">No card required. Your first 50 AI resolutions are free.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,#fc7b33_0%,transparent_65%)] opacity-40 blur-2xl" />
            <Image src="/images/revenue-sloth.png" alt="" width={1145} height={1374} className="pointer-events-none absolute -right-20 -top-28 z-10 h-auto w-44 -rotate-6 drop-shadow-2xl sm:-right-24 sm:w-52" />
            <div className="relative overflow-hidden rounded-xl border border-[#428ce5] bg-[#edf7ff] p-3 text-[#17181c] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-5">
              <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
                <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 text-xs"><span className="font-medium">Website conversation</span><span className="rounded-full bg-[#e8f4eb] px-2.5 py-1 text-[10px] text-[#37744f]">AI answered</span></div>
                <div className="space-y-5 px-5 py-6">
                  <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-[#f1f2ef] px-4 py-3 text-sm leading-6">Can I switch to annual billing after we start?</div>
                  <div className="flex items-center gap-2 text-[10px] text-[#806698]"><span className="flex size-5 items-center justify-center rounded-full bg-[#eee5fa]">✦</span>Elpino checked: Billing &amp; plans</div>
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-[#eee5fa] px-4 py-3 text-sm leading-6">Yes — you can switch at any time. We’ll apply a prorated credit for your remaining monthly time.</div>
                  <div className="ml-auto rounded-lg border border-[#d6e3f1] bg-[#f5faff] px-3 py-2 text-right text-[10px] text-[#527b97]">Helpful answer sent in seconds</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[#17181c] px-4 py-3 text-xs text-white"><span>Customer confidence, kept moving.</span><span className="text-[#d9bef4]">Live support ↗</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#428ce5] px-5 py-7 text-white sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-10 gap-y-4 text-sm"><span className="font-medium">Less waiting for customers.</span><span className="text-white/70">More context for your team.</span><span className="text-white/70">A smoother path to yes.</span></div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7060bd]">Revenue-support, together</p><h2 className="mt-4 text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">Make it easier to choose you.</h2></div><p className="max-w-xl text-base leading-7 text-black/60">The difference between a question and a conversion is often just a clear, timely answer. Elpino makes sure that answer is close at hand.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {benefits.map(([title, text], index) => <article key={title} className="flex min-h-[280px] flex-col rounded-xl border border-black/10 bg-[#fbfbfa] p-7"><span className="flex size-9 items-center justify-center rounded-lg bg-[#eee5fa] text-sm text-[#7060bd]">0{index + 1}</span><h3 className="mt-9 text-2xl font-medium tracking-[-0.04em]">{title}</h3><p className="mt-4 text-sm leading-7 text-black/55">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#fff1e3] px-5 py-20 sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#956840]">How it works</p>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">A better answer is only the beginning.</h2><p className="max-w-sm text-sm leading-7 text-[#76634f]">Elpino keeps the routine moving, so your revenue team can spend their time where judgment really matters.</p></div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">{steps.map(([number, title, text]) => <article key={number} className="relative rounded-xl border border-[#dfc7b1] bg-white/65 p-7"><span className="text-sm font-medium text-[#b56e36]">{number}</span><div className="my-8 h-px bg-[#dfc7b1]" /><h3 className="text-2xl font-medium tracking-[-0.04em]">{title}</h3><p className="mt-4 text-sm leading-7 text-[#76634f]">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#111216] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">Your tools, in the conversation</p><h2 className="mt-5 text-4xl font-normal leading-[1.03] tracking-[-0.055em] sm:text-5xl">Support that knows enough to be useful.</h2><p className="mt-6 max-w-lg text-base leading-7 text-white/65">Connect the systems that hold useful customer context. Elpino can help your team answer billing and order questions with less back-and-forth.</p><Link href="/integrations" className="mt-8 inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-sm font-medium transition hover:bg-white hover:text-black">See integrations <span className="ml-2">↗</span></Link></div>
          <div className="rounded-xl border border-[#428ce5] bg-[#edf7ff] p-3 text-[#17181c] sm:p-5"><div className="rounded-lg bg-white p-5 sm:p-7"><div className="flex items-center justify-between border-b border-black/10 pb-4 text-xs"><span className="font-medium">Customer context</span><span className="text-[#527b97]">Order lookup ready</span></div><div className="mt-6 rounded-xl bg-[#eee5fa] p-4 text-sm leading-6">“Could you check whether order #2048 has shipped?”</div><div className="my-5 flex items-center gap-3 rounded-xl border border-[#d7e4f1] bg-[#f6faff] p-4"><span className="flex size-10 items-center justify-center rounded-lg bg-[#428ce5] text-white">S</span><div><strong className="block text-sm">Stripe connected</strong><span className="mt-1 block text-[10px] text-[#628099]">Payment context available to your team</span></div><span className="ml-auto text-[#309368]">✓</span></div><p className="text-sm leading-7">The conversation stays in one place, with the context your teammate needs to help.</p></div></div>
        </div>
      </section>

      <section className="bg-[#428ce5] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">Keep every good conversation going</p><h2 className="mt-5 text-balance text-4xl font-normal leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl">Give your customers a helpful next step.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">Start with your knowledge, then bring your team in when it matters.</p></div><div className="flex flex-wrap gap-3"><Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-md bg-[#fe9238] px-6 text-sm font-semibold text-black transition hover:bg-white">Start free →</Link><Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-6 text-sm font-medium transition hover:bg-white hover:text-black">Talk to us</Link></div></div>
      </section>
    </div>
  );
}
