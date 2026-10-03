import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { competitors } from "./data";
import { BLUE, GREEN, PillLink, SectionHead, Stamp, YELLOW, innerClass, sectionClass } from "./ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Compare Elpino with Zendesk, Crisp, Intercom and Tidio",
  description:
    "Honest side-by-side comparisons of Elpino with Zendesk, Crisp, Intercom and Tidio: pricing, AI agent, inbox, channels and security, including where each one is stronger.",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare Elpino with other helpdesks",
    description: "Pricing, AI agent, inbox, channels and security compared side by side, with honest notes on where each tool is stronger.",
    url: `${SITE_URL}/compare`,
    type: "website",
  },
};

const principles = [
  { color: GREEN, title: "Only what we can verify", body: "Competitor details come from their public pricing pages and are dated on each page. Where we could not confirm something, the table says so instead of guessing." },
  { color: YELLOW, title: "Credit where it is due", body: "Elpino is website chat first and omnichannel is still coming. Where a competitor is stronger, such as phone, messaging apps or enterprise routing, we say it." },
  { color: BLUE, title: "Real numbers, stated plainly", body: "Prices are list prices in US dollars, with the assumptions shown. They are a guide, not a quote, and not always like-for-like." },
];

export default function CompareIndexPage() {
  return (
    <main className="bg-white text-[#11120f]">
      <BreadcrumbJsonLd trail={[{ name: "Compare", path: "/compare" }]} />

      <section className="px-5 pb-12 pt-16 sm:px-8 lg:px-20 lg:pb-16 lg:pt-24">
        <div className={innerClass}>
          <Stamp color={BLUE}>Compare</Stamp>
          <h1 className="mt-6 max-w-4xl text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">How Elpino compares</h1>
          <p className="mt-7 max-w-3xl text-[19px] leading-8 text-black/70">
            Choosing a helpdesk is a big decision, so we put Elpino next to the tools you are probably weighing. Each page covers pricing, the AI agent, the inbox, channels, integrations and security, and says plainly where the other tool is the better fit.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <PillLink href="/signup">Start free, no card</PillLink>
            <PillLink href="/pricing" variant="light">
              See Elpino pricing
            </PillLink>
          </div>
        </div>
      </section>

      <section className={`bg-[#faf9f6] ${sectionClass}`}>
        <div className={innerClass}>
          <SectionHead eyebrow="Pick a comparison" color={GREEN} title={<>Elpino against&hellip;</>} />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {competitors.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className="group flex h-full flex-col rounded-[10px] border border-black/40 bg-white p-7 transition hover:border-black">
                  <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/45">Comparison</span>
                  <span className="mt-3 text-3xl font-normal tracking-[-0.03em]">Elpino vs {c.name}</span>
                  <span className="mt-4 text-[16px] leading-7 text-black/65">{c.oneLiner}</span>
                  <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium">
                    Read the comparison <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={innerClass}>
          <SectionHead eyebrow="How we compare" color={YELLOW} title={<>Fair by design</>} />
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {principles.map((p) => (
              <li key={p.title} className="rounded-[10px] border border-black/40 p-7">
                <span aria-hidden="true" className="block size-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-3 text-[16px] leading-7 text-black/65">{p.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-3xl text-[13px] leading-6 text-black/50">
            Product names are trademarks of their owners. Elpino is not affiliated with or endorsed by any company named here. If you spot something out of date,{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-black/80">
              tell us
            </Link>{" "}
            and we will fix it.
          </p>
        </div>
      </section>
    </main>
  );
}
