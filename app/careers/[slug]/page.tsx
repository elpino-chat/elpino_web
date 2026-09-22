import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, Check, Clock, HeartPulse, Laptop, MapPin, Rocket } from "lucide-react";
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
  { number: "04", title: "The offer", description: "We move fast — expect a decision within 48 hours of your final round." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#6c48a0]">{children}</p>;
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{title}</h2>
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
  // than guessing at a city — every listing here really is remote (see the
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
    <main className="overflow-hidden bg-[#f6f4ef] font-[family-name:var(--font-rethink-sans)] text-[#233d4d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />

      <section className="relative overflow-hidden bg-[#233d4d] px-5 pt-28 pb-16 text-white sm:px-8 sm:pt-36 sm:pb-24">
        <div aria-hidden="true" className="absolute -left-28 bottom-0 size-96 rounded-full bg-[#18c983]/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 -top-16 size-[32rem] rounded-full bg-[#8d65b5]/40 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative mx-auto max-w-[1440px]">
          <Link href="/careers" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/55 transition hover:text-[#d9bef4]">
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
            Back to careers
          </Link>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <Reveal>
              <div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/75"><Briefcase size={13} />{role.category}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/75"><MapPin size={13} />{role.location}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/75"><Clock size={13} />{role.employmentType}</span>
                </div>
                <h1 className="mt-7 max-w-3xl text-[clamp(2.8rem,5.5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.065em]">{role.title}</h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">{role.tagline}</p>
                <a href="#apply" className="group mt-9 inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-[#233d4d] transition hover:bg-[#d9bef4]">
                  Apply for this role <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]">
                <div aria-hidden="true" className="absolute inset-8 rounded-full bg-[#d9bef4]/25 blur-3xl" />
                <Image src={role.sloth.src} alt={role.sloth.alt} width={role.sloth.width} height={role.sloth.height} priority sizes="(min-width: 1024px) 30vw, 80vw" className="relative h-auto w-full drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)]" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1fr_400px] lg:gap-20">
          <div className="min-w-0 max-w-3xl space-y-16 sm:space-y-20">
            <Section eyebrow="Overview" title="The role.">
              <p className="text-lg leading-8 text-[#53616b]">{role.overview}</p>
            </Section>

            <Section eyebrow="What you'll do" title="Your craft.">
              <ul className="space-y-4">
                {role.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e7ddf3]"><Check size={13} className="text-[#7651b0]" strokeWidth={3} /></span>
                    <span className="text-base leading-7 text-[#3c4a52]">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section eyebrow="Requirements" title="What we're looking for.">
              <ul className="space-y-4">
                {role.requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-[11px] size-2 shrink-0 rounded-full bg-[#233d4d]" />
                    <span className="text-base leading-7 text-[#3c4a52]">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section eyebrow="Nice to have" title="Bonus points.">
              <ul className="space-y-4">
                {role.niceToHaves.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-[9px] size-2 shrink-0 rounded-full border-2 border-[#7651b0]/60" />
                    <span className="text-base leading-7 text-[#53616b]">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section eyebrow="Your first 90 days" title="How you'll ramp.">
              <div className="grid gap-4 sm:grid-cols-3">
                {role.ninetyDayPlan.map((milestone) => (
                  <article key={milestone.period} className="rounded-[1.5rem] border border-[#233d4d]/12 bg-white p-6 sm:p-7">
                    <span className="inline-flex rounded-full bg-[#e7ddf3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#5c416f]">{milestone.period}</span>
                    <p className="mt-4 text-sm leading-6 text-[#53616b]">{milestone.goal}</p>
                  </article>
                ))}
              </div>
            </Section>

            <Section eyebrow="What you'll get" title="Support for your best work.">
              <div className="grid gap-4 sm:grid-cols-3">
                {perks.map(({ icon: Icon, title, body }) => (
                  <article key={title} className="rounded-[1.5rem] border border-[#233d4d]/12 bg-white p-6 sm:p-7">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f1eefa] text-[#7651b0]"><Icon size={19} strokeWidth={1.8} /></span>
                    <h3 className="mt-5 text-lg font-medium tracking-[-0.03em]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#53616b]">{body}</p>
                  </article>
                ))}
              </div>
            </Section>

            <Section eyebrow="Our hiring process" title="Four steps, no maze.">
              <ol className="divide-y divide-[#233d4d]/10">
                {hiringSteps.map((step) => (
                  <li key={step.number} className="flex items-start gap-5 py-5 first:pt-0 last:pb-0">
                    <span className="shrink-0 font-geist-mono text-sm font-semibold text-[#7651b0]">{step.number}</span>
                    <div>
                      <h3 className="text-base font-semibold tracking-[-0.02em]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#53616b]">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Reveal>
              <blockquote className="rounded-[2rem] bg-[#233d4d] p-8 text-white sm:p-10">
                <p className="font-[family-name:var(--font-instrument-serif)] text-2xl italic leading-snug text-[#d9bef4] sm:text-3xl">
                  “We hire builders, not order-takers. You own your features from architectural design to production monitoring.”
                </p>
                <footer className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">— The Elpino team</footer>
              </blockquote>
            </Reveal>
          </div>

          <div id="apply" className="h-fit scroll-mt-28 lg:sticky lg:top-[calc(var(--elpino-header-h,64px)+2rem)]">
            <Reveal delay={0.1}>
              <ApplicationForm roleTitle={role.title} />
              <p className="mt-6 text-center text-xs text-[#71808a]">
                By applying, you agree to our{" "}
                <Link href="/privacy" className="font-semibold text-[#233d4d] underline underline-offset-4 transition hover:text-[#7651b0]">Candidate Privacy Policy</Link>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {otherRoles.length > 0 && (
        <section className="border-t border-[#233d4d]/10 bg-white px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1440px]">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Eyebrow>Other open roles</Eyebrow>
                  <h2 className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Find your place.</h2>
                </div>
                <Link href="/careers" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#233d4d]">
                  All roles <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {otherRoles.map((other, index) => (
                <Reveal key={other.slug} delay={Math.min(index * 0.06, 0.24)}>
                  <Link href={`/careers/${other.slug}`} className="group flex h-full flex-col justify-between rounded-[1.5rem] border border-[#233d4d]/12 bg-[#fbfaf7] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#7651b0]/40 hover:bg-white hover:shadow-[0_30px_60px_-42px_rgba(23,24,28,0.55)] sm:p-8">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.11em] text-[#6c48a0]">{other.category} · {other.location}</p>
                      <h3 className="mt-3 text-xl font-medium tracking-[-0.03em]">{other.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5d6872]">{other.tagline}</p>
                    </div>
                    <span className="mt-6 inline-flex size-10 items-center justify-center rounded-full border border-[#233d4d]/20 transition group-hover:bg-[#233d4d] group-hover:text-white"><ArrowRight size={16} /></span>
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
