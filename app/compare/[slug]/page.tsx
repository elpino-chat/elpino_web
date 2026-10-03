import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { competitorBySlug, competitors } from "../data";
import { BLUE, CostTable, ElpinoOnly, FeatureTable, GlanceTable, GREEN, PillLink, SectionHead, Stamp, Verdict, YELLOW, innerClass, sectionClass } from "../ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

// Only the competitors listed in data.ts exist; anything else is a 404 rather than a runtime error.
export const dynamicParams = false;

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = competitorBySlug(slug);
  if (!c) return {};
  const title = `Elpino vs ${c.name}: features, pricing and AI compared`;
  const url = `${SITE_URL}/compare/${c.slug}`;
  return {
    title,
    description: c.description,
    alternates: { canonical: url },
    openGraph: { title, description: c.description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description: c.description },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = competitorBySlug(slug);
  if (!c) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const others = competitors.filter((o) => o.slug !== c.slug);

  return (
    <main className="bg-white text-[#11120f]">
      <BreadcrumbJsonLd
        trail={[
          { name: "Compare", path: "/compare" },
          { name: `Elpino vs ${c.name}`, path: `/compare/${c.slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />

      {/* ---------------------------------------------------------- hero */}
      <section className="px-5 pb-12 pt-16 sm:px-8 lg:px-20 lg:pb-16 lg:pt-24">
        <div className={innerClass}>
          <nav aria-label="Breadcrumb" className="text-[14px] text-black/55">
            <Link href="/compare" className="underline-offset-4 hover:underline">
              Compare
            </Link>
            <span aria-hidden="true"> / </span>
            <span>Elpino vs {c.name}</span>
          </nav>
          <div className="mt-6">
            <Stamp color={BLUE}>Comparison</Stamp>
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Elpino vs {c.name}
          </h1>
          <p className="mt-7 max-w-3xl text-[19px] leading-8 text-black/70">{c.tldr}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <PillLink href="/signup">Start free, no card</PillLink>
            <PillLink href="/pricing" variant="light">
              See Elpino pricing
            </PillLink>
          </div>
          <p className="mt-6 text-[14px] text-black/50">
            {c.name} details checked against its public pricing page in {c.verified}.{" "}
            <a href={c.pricingUrl} target="_blank" rel="nofollow noopener noreferrer" className="underline underline-offset-4 hover:text-black/80">
              See {c.name} pricing
            </a>
            .
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- verdict */}
      <section className={`bg-[#faf9f6] ${sectionClass}`}>
        <div className={innerClass}>
          <SectionHead eyebrow="The short version" color={YELLOW} title={<>Who should pick which</>} sub="No tool is right for everyone. Here is an honest read of where each one fits." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Verdict title="Choose Elpino if" color={GREEN} items={c.chooseElpino} />
            <Verdict title={`Choose ${c.name} if`} color={BLUE} items={c.chooseThem} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- at a glance */}
      <section className={sectionClass}>
        <div className={innerClass}>
          <SectionHead eyebrow="At a glance" color={BLUE} title={<>Elpino and {c.name}, side by side</>} />
          <div className="mt-12">
            <GlanceTable rows={c.glance} themName={c.name} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- categories */}
      <section className={`bg-[#faf9f6] ${sectionClass}`}>
        <div className={innerClass}>
          <SectionHead
            eyebrow="Feature by feature"
            color={GREEN}
            title={<>The detail, by category</>}
            sub={`The tables hold only what we could verify on ${c.name}'s public pages. Anything we could not confirm sits in a separate "Also in Elpino" box, so we never guess. A green mark shows who is ahead on that row.`}
          />
          <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2.5">
            {c.categories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="rounded-full border border-black/25 bg-white px-4 py-1.5 text-[14px] text-black/70 transition hover:border-black/60 hover:text-black">
                {cat.title}
              </a>
            ))}
          </nav>
          <div className="mt-12 space-y-16">
            {c.categories.map((cat) => (
              <div key={cat.id} id={cat.id} className="scroll-mt-24">
                <h3 className="text-3xl font-normal tracking-[-0.03em]">{cat.title}</h3>
                <p className="mt-3 max-w-2xl text-[17px] leading-7 text-black/60">{cat.intro}</p>
                {cat.rows.some((r) => r.them !== null) && (
                  <div className="mt-6">
                    <FeatureTable rows={cat.rows.filter((r) => r.them !== null)} themName={c.name} />
                  </div>
                )}
                <div className="mt-6">
                  <ElpinoOnly rows={cat.rows.filter((r) => r.them === null)} themName={c.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- cost */}
      <section className={sectionClass}>
        <div className={innerClass}>
          <SectionHead eyebrow="Cost" color={YELLOW} title={<>{c.cost.title}</>} sub={c.cost.intro} />
          <div className="mt-12">
            <CostTable rows={c.cost.rows} themName={c.name} />
          </div>
          <p className="mt-5 max-w-3xl text-[14px] leading-6 text-black/55">{c.cost.note}</p>
        </div>
      </section>

      {/* ---------------------------------------------------------- switching */}
      <section className="bg-[#11120f] px-5 py-16 text-white sm:px-8 lg:px-20 lg:py-24">
        <div className={innerClass}>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 text-[12.5px] font-medium text-white/80">
              <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: YELLOW }} />
              Trying Elpino
            </span>
            <h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Moving over from {c.name}</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">You do not have to switch in one go. Start on the free plan and run both side by side.</p>
          </div>
          <ol className="mt-12 grid gap-5 lg:grid-cols-2">
            {c.switching.map((step, i) => (
              <li key={step} className="flex gap-4 rounded-[10px] border border-white/25 p-6">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[14px] font-medium text-[#11120f]">{i + 1}</span>
                <span className="text-[16px] leading-7 text-white/85">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/signup" className="inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-8 text-[15px] font-medium text-[#11120f] transition hover:opacity-85">
              Start free
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- faq */}
      <section className={sectionClass}>
        <div className={innerClass}>
          <SectionHead eyebrow="Questions" color={BLUE} title={<>Elpino vs {c.name}: FAQ</>} />
          <div className="mt-12 divide-y divide-black/15 rounded-[10px] border border-black/30">
            {c.faqs.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[18px] font-medium">
                  {f.q}
                  <span aria-hidden="true" className="text-2xl font-normal text-black/40 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-[16px] leading-7 text-black/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- more + disclaimer */}
      <section className="bg-[#faf9f6] px-5 pb-20 pt-14 sm:px-8 lg:px-20">
        <div className={innerClass}>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50">More comparisons</h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/compare/${o.slug}`} className="inline-flex rounded-full border border-black/30 bg-white px-5 py-2 text-[15px] transition hover:border-black/70">
                  Elpino vs {o.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/compare" className="inline-flex rounded-full border border-black/30 bg-white px-5 py-2 text-[15px] transition hover:border-black/70">
                All comparisons
              </Link>
            </li>
          </ul>
          <p className="mt-10 max-w-3xl text-[13px] leading-6 text-black/50">
            {c.name} is a trademark of its owner. Elpino is not affiliated with or endorsed by {c.name}. This comparison is based on {c.name}&apos;s public website as of {c.verified}, in US dollars, and excludes taxes and regional pricing. Products change, so please confirm current details on{" "}
            <a href={c.website} target="_blank" rel="nofollow noopener noreferrer" className="underline underline-offset-2 hover:text-black/80">
              {c.name}&apos;s site
            </a>
            . If something here is out of date,{" "}
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
