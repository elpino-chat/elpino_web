import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, HeartPulse, Laptop, MapPin, Rocket } from "lucide-react";
import { getRole, roles } from "../roles";
import { ApplicationForm } from "./ApplicationForm";
import { Reveal } from "@/app/components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export function generateStaticParams() {
  return roles.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) return {};

  return {
    title: `${role.title} | Careers at Elpino`,
    description: role.tagline,
    alternates: { canonical: `${SITE_URL}/careers/${role.slug}` },
    openGraph: {
      title: `${role.title} | Careers at Elpino`,
      description: role.tagline,
      url: `${SITE_URL}/careers/${role.slug}`,
      type: "website",
    },
  };
}

const perks = [
  { icon: Laptop, title: "Remote setup", body: "$4,000 home-office stipend, plus $1,000 annually for refreshes." },
  { icon: HeartPulse, title: "Health & flow", body: "Premium health, dental, and vision globally. Unlimited PTO, 3-week minimum." },
  { icon: Rocket, title: "Growth budget", body: "$5,000 a year for books, conferences, or courses." },
];

const hiringSteps = [
  { number: "01", title: "Deep dive", description: "A 45-minute conversation with a founder about your journey and why you build." },
  { number: "02", title: "Take-home task", description: "A real-world problem designed to take 4-6 hours. No trick questions." },
  { number: "03", title: "Pairing session", description: "Review your task with the team. We care how you think, not just the syntax." },
  { number: "04", title: "The offer", description: "We move fast: expect a decision within 48 hours of your final round." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#2F8CF0]">{children}</p>;
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-2xl font-medium tracking-[-0.04em] text-black sm:text-3xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </section>
    </Reveal>
  );
}

export default async function CareerRolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) notFound();

  const otherRoles = roles.filter((r) => r.slug !== role.slug);

  // Google's job rich results (the dedicated job-search UI, not just a blue
  // link) key off this exact shape. jobLocationType: TELECOMMUTE plus no
  // jobLocation is the documented way to mark a fully remote role rather
  // than guessing at a city: every listing here really is remote (see the
  // "Remote setup" section below).
  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: [role.overview, "Responsibilities: " + role.responsibilities.join(" "), "Requirements: " + role.requirements.join(" ")].join(" "),
    identifier: {
      "@type": "PropertyValue",
      name: "Elpino",
      value: role.slug,
    },
    datePosted: role.datePosted,
    employmentType: role.employmentType === "Full-time" ? "FULL_TIME" : role.employmentType.toUpperCase().replace(/[\s-]+/g, "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: "Elpino",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/elpino.png`,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "Anywhere" },
    directApply: true,
  };

  return (
    <main className="overflow-hidden bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#e4ecf7] via-[#ece3fa] to-white px-5 pt-10 pb-16 text-black sm:px-8 sm:pb-20">
        <div className="relative mx-auto max-w-[1440px]">
          <Link href="/careers" className="group inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to all jobs
          </Link>
          <Reveal>
            <div className="mx-auto mt-8 max-w-4xl text-center sm:mt-12">
              <h1 className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-black">{role.title}</h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-black/70">
                <span>{role.category}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} />{role.location}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_400px] lg:gap-20">
          <div className="min-w-0 w-full space-y-16 sm:space-y-20">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-6 border-b border-black/10 pb-4">
                <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#8B5CF6] border-b-2 border-[#8B5CF6] pb-4 -mb-4">
                  Description
                </span>
                <a href="#apply" className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-[#8B5CF6]">
                  Apply for this job
                </a>
              </div>
            </Reveal>

            <Section eyebrow="Overview" title="The role.">
              <p className="text-lg leading-8 text-black/65">{role.overview}</p>
            </Section>

            <Section eyebrow="What you'll do" title="Your craft.">
              <ul className="space-y-4">
                {role.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FE]"><Check size={13} className="text-[#2F8CF0]" strokeWidth={3} /></span>
                    <span className="text-base leading-7 text-black/75">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section eyebrow="Requirements" title="What we're looking for.">
              <ul className="space-y-4">
                {role.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-[11px] size-2 shrink-0 rounded-full bg-black" />
                    <span className="text-base leading-7 text-black/75">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section eyebrow="Nice to have" title="Bonus points.">
              <ul className="space-y-4">
                {role.niceToHaves.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-[9px] size-2 shrink-0 rounded-full border-2 border-[#2F8CF0]/60" />
                    <span className="text-base leading-7 text-black/65">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <div id="apply" className="h-fit self-start scroll-mt-28 lg:sticky lg:top-[calc(var(--elpino-header-h,64px)+2rem)]">
            <Reveal delay={0.1}>
              <ApplicationForm roleTitle={role.title} />
              <p className="mt-6 text-center text-xs text-black/50">
                By applying, you agree to our{" "}
                <Link href="/privacy" className="font-semibold text-black underline underline-offset-4 transition hover:text-[#2F8CF0]">Candidate Privacy Policy</Link>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-[1440px] space-y-16 sm:space-y-20">
          <Section eyebrow="Your first 90 days" title="How you'll ramp.">
            <div className="grid gap-4 sm:grid-cols-3">
              {role.ninetyDayPlan.map((milestone) => (
                <article key={milestone.period} className="rounded-2xl border border-black/10 bg-transparent p-6 sm:p-7">
                  <span className="inline-flex rounded-full bg-[#EAF2FE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#2F8CF0]">{milestone.period}</span>
                  <p className="mt-4 text-sm leading-6 text-black/65">{milestone.goal}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section eyebrow="What you'll get" title="Support for your best work.">
            <div className="grid gap-4 sm:grid-cols-3">
              {perks.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-black/10 bg-transparent p-6 sm:p-7">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#EAF2FE] text-[#2F8CF0]"><Icon size={19} strokeWidth={1.8} /></span>
                  <h3 className="mt-5 text-lg font-medium tracking-[-0.03em] text-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">{body}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section eyebrow="Our hiring process" title="Four steps, no maze.">
            <ol className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {hiringSteps.map((step) => (
                <li key={step.number} className="border-t border-black/10 pt-5">
                  <span className="shrink-0 font-mono text-sm font-semibold text-[#2F8CF0]">{step.number}</span>
                  <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-black">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-black/65">{step.description}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Reveal>
            <blockquote className="rounded-2xl bg-[#241013] p-8 text-white sm:p-10">
              <p className="max-w-3xl text-xl font-normal leading-snug tracking-[-0.02em] sm:text-2xl">
                &ldquo;We hire builders, not order-takers. You own your features from architectural design to production monitoring.&rdquo;
              </p>
              <footer className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">The Elpino team</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {otherRoles.length > 0 && (
        <section className="border-t border-black/10 bg-[#faf9f6] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1440px]">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Eyebrow>Other open roles</Eyebrow>
                  <h2 className="text-3xl font-medium tracking-[-0.05em] text-black sm:text-4xl">Find your place.</h2>
                </div>
                <Link href="/careers" className="group inline-flex items-center gap-2 text-sm font-semibold text-black">
                  All roles <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {otherRoles.map((other, index) => (
                <Reveal key={other.slug} delay={Math.min(index * 0.06, 0.24)}>
                  <Link href={`/careers/${other.slug}`} className="group flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#2F8CF0]/50 hover:shadow-[0_30px_60px_-42px_rgba(23,24,28,0.35)] sm:p-8">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.11em] text-[#2F8CF0]">{other.category} · {other.location}</p>
                      <h3 className="mt-3 text-xl font-medium tracking-[-0.03em] text-black">{other.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/65">{other.tagline}</p>
                    </div>
                    <span className="mt-6 inline-flex size-10 items-center justify-center rounded-full border border-black/15 transition group-hover:bg-black group-hover:text-white"><ArrowRight size={16} /></span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
