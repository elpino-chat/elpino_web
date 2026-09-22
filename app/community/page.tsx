import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NewsletterSignup } from "./newsletter-form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Community",
  description: "A quiet corner of the internet for teams building better customer support with Elpino.",
  alternates: { canonical: `${SITE_URL}/community` },
  openGraph: {
    title: "Community | Elpino",
    description: "Meet the people helping shape Elpino, one thoughtful conversation at a time.",
    url: `${SITE_URL}/community`,
    type: "website",
  },
};

const channels = [
  { number: "01", eyebrow: "Keep up", title: "See what’s new", description: "A running record of every feature, fix, and small improvement we put into the hands of our customers.", cta: "Visit changelog", href: "/changelog" },
  { number: "02", eyebrow: "Have a say", title: "Talk to the team", description: "Share a rough edge, a workflow wish, or a question. The people making Elpino are on the other end.", cta: "Start a conversation", href: "/contact" },
  { number: "03", eyebrow: "Build alongside us", title: "Join the journey", description: "We’re a small, curious team making customer support feel more human. Come make a meaningful dent with us.", cta: "Explore open roles", href: "/careers" },
];

export default function CommunityPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#fbfaf8] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      <section className="relative border-b border-black/10 px-5 pb-14 pt-28 sm:px-8 md:pb-20 md:pt-36 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(217,190,244,0.8),transparent_24rem),radial-gradient(circle_at_10%_85%,rgba(221,239,234,0.9),transparent_28rem)]" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.8fr)] lg:gap-16">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7060bd]"><span className="h-px w-8 bg-[#7060bd]" />The Elpino community</p>
            <h1 className="mt-7 text-balance text-5xl font-normal leading-[0.98] tracking-[-0.06em] sm:text-6xl md:text-7xl">Better support is a team sport.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60 sm:text-xl">A growing group of thoughtful people making every customer conversation a little easier, clearer, and more human.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full bg-[#17181c] px-6 text-sm font-medium text-white transition hover:bg-[#7060bd]">Say hello <span className="ml-2 text-base">↗</span></Link>
              <Link href="/changelog" className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white/60 px-6 text-sm font-medium transition hover:border-black hover:bg-white">What we’re building</Link>
            </div>
            <p className="mt-10 text-sm text-black/45">Slow, thoughtful progress. Made with the people who use it.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[600px] lg:justify-self-end">
            <div className="absolute -inset-3 -rotate-3 rounded-[2rem] bg-[#d9bef4]/70" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-black/10 bg-[#e8e6d9] p-2 shadow-[0_24px_60px_rgba(35,61,77,0.16)]">
              <Image src="/images/community-sloths.png" alt="Three sloths gathered around a laptop and tea, working together" width={1448} height={1086} priority className="aspect-[4/3] w-full rounded-[1.25rem] object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium shadow-sm sm:left-6">Good ideas travel in groups ✦</div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 text-[#17181c] sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-2xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#233d4d]">Find your way in</p><h2 className="mt-4 text-4xl font-normal leading-tight tracking-[-0.05em] sm:text-5xl">A few good places to start.</h2></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-black/10 bg-black/10 md:grid-cols-3">
            {channels.map((channel) => (
              <Link key={channel.title} href={channel.href} className="group flex min-h-[310px] flex-col bg-[#fbfaf8] p-7 transition-colors hover:bg-[#233d4d] sm:p-8">
                <div className="flex items-start justify-between"><p className="text-xs font-medium text-black/40 transition-colors group-hover:text-white/45">{channel.number}</p><span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition group-hover:rotate-45 group-hover:border-white/25 group-hover:text-white">↗</span></div>
                <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#233d4d] transition-colors group-hover:text-[#d9bef4]">{channel.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] transition-colors group-hover:text-white">{channel.title}</h3>
                <p className="mt-3 max-w-sm flex-1 text-sm leading-6 text-black/55 transition-colors group-hover:text-white/65">{channel.description}</p>
                <span className="mt-7 text-sm font-medium transition-colors group-hover:text-[#d9bef4]">{channel.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#428ce5]/40 bg-[#edf7ff] px-5 py-16 text-[#17181c] sm:px-8 md:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div className="max-w-xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#233d4d]">From the campfire</p><h2 className="mt-4 text-4xl font-normal leading-tight tracking-[-0.05em] sm:text-5xl">The occasional note worth opening.</h2><p className="mt-5 text-base leading-7 text-black/60">Product news, useful support ideas, and the small lessons that shape what we build next. No noise, just the good stuff.</p></div>
          <div className="w-full lg:w-[430px]"><NewsletterSignup /></div>
        </div>
      </section>

      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 md:py-28 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9bef4]">Your voice belongs here</p><h2 className="mt-5 text-balance text-4xl font-normal leading-[1.02] tracking-[-0.055em] sm:text-5xl md:text-6xl">Tell us what would make your day easier.</h2></div>
          <Link href="/contact" className="inline-flex h-[3.25rem] shrink-0 items-center justify-center rounded-full bg-[#d9bef4] px-7 text-sm font-medium text-[#17181c] transition hover:bg-white">Share your idea <span className="ml-2 text-base">↗</span></Link>
        </div>
      </section>
    </div>
  );
}
