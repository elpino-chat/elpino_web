"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, Check, Heart, Home, MapPin, Search, TrendingUp } from "lucide-react";
import { roles } from "./roles";

// Careers, in the site's quiet style: white pages with thin outlines, the values as cards that stack as you
// scroll, benefits in tabs, and every open role as a simple row. The words and data are unchanged.

function scrollToRoles() {
  document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" });
}

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

// ------------------------------------------------------------ data

const VALUES = [
  { id: "success-first", title: "Success First", tagline: "Shareholder & customer value driven by incredible execution.", description: "Our north star is customer and shareholder value. We believe we will create that through incredible work. And we believe we will achieve that through an unyielding, high-trust culture. We play to win the defining category of our generation.", note: "Focus on outcomes that genuinely matter. Everything else is distraction.", image: "/images/founders-sloth.png", alt: "Elpino team celebrating real milestones" },
  { id: "high-standards", title: "Incredibly High Standards", tagline: "Aspire to true greatness; demand the best of ourselves.", description: "We aspire to true greatness. We demand the very best of ourselves, and of those we work with. We aim for very-best-in-class work with everything we do, from distributed infra latency to every punctuation mark in our copy.", note: "Craft takes deliberation. We don't ship sloppiness.", image: "/slotpointing.png", alt: "Sloth inspecting every detail with precision" },
  { id: "open-mindedness", title: "Open Mindedness", tagline: "Independent thinkers who question conventions.", description: "We want independent thinkers. We will question the status quo in order to eliminate blind spots and increase our freedom to maneuver and innovate. The AI landscape reinvents itself monthly; dogmatism is fatal.", note: "Hold strong opinions loosely. Learn in public.", image: "/images/blog/learning-sloth.png", alt: "Sloth reading and absorbing fresh research" },
  { id: "resilience", title: "Resilience", tagline: "Rise above tension; adapt rapidly to ambitious goals.", description: "We will exhibit great maturity and rise above tension that disrupts our work and distracts us from our goals. We will show a high degree of adaptability and hunger for change. When things break or shift, we fix them calmly.", note: "Calm in high seas. When systems shake, we remain centered.", image: "/images/trust-sloth.png", alt: "Sloth standing resilient and steady" },
  { id: "impatience", title: "Impatience", tagline: "Move fast via smart work, automation, and tight loops.", description: "52 weeks is not a long amount of time. We need everything done today, this week, this month. We move fast via hard work and smart work. We automate the repetitive so humans can sprint on frontier breakthroughs.", note: "High speed doesn't mean frantic rush. It means zero drag.", image: "/images/busy-teams-sloth.png", alt: "Sloth flying across multi-monitor setup" },
  { id: "positive-optimistic", title: "Positive and Optimistic", tagline: "Bold optimism is the fuel for doing very hard things.", description: "Negativity and pessimism make all things harder. The opposite is how you achieve very hard things. We need people who are on board with and bullish about our vision, who bring high energy and relentless optimism to their teams.", note: "Good vibes make hard engineering problems solvable.", image: "/desk_avatar1.png", alt: "Pino radiating warmth and positive energy" },
  { id: "customer-obsessed", title: "Customer Obsessed", tagline: "Walk the walk: deliver magical support to our customers.", description: "Our purpose is to help our customers deliver incredible customer service to theirs. We must walk the walk and do that with our customers too. Every engineer talks to users; every product decision starts with real customer pain.", note: "Put on the headset. Understand what customers feel.", image: "/images/contact-support-sloth.png", alt: "Sloth listening attentively on customer support" },
];

const BENEFITS = [
  { key: "health", icon: Heart, title: "Health & wellness", color: "#fc7b33", description: "Complete physical and mental care so you can operate at your peak.", perks: ["Comprehensive health, dental, and vision insurance for you and your dependents (100% premium covered)", "Employee Assistance Program with confidential mental health counseling whenever you need it", "Income protection & disability if illness or injury keeps you from work", "Life insurance coverage up to 4x your annual salary, at zero cost to you", "$200/month wellness stipend for fitness, therapy, gym, or massage"] },
  { key: "family", icon: Home, title: "Family & time off", color: "#3784ff", description: "We work hard, but life beyond the screen always comes first.", perks: ["Up to 26 weeks of fully paid leave for birthing parents", "12 weeks of fully paid parental leave for non-birthing parents", "Flexible vacation policy: take the time you need to recharge without counting days", "Work from home setup: $1,500 home-office budget + latest Apple M4 Max MacBook Pro", "Annual all-hands company offsites in world-class destinations (past: Lisbon, Kyoto)"] },
  { key: "money", icon: TrendingUp, title: "Financial future", color: "#7060bd", description: "Generous ownership and wealth-building for long-term partners.", perks: ["Meaningful equity ownership via stock grants / RSUs: your success is our success", "Highly competitive tier-1 cash compensation benchmarked against top Silicon Valley tech", "401(k) / pension matching program up to 5% with immediate vesting", "Commuter benefits and global co-working pass (WeWork All-Access anywhere)", "$3,000 annual continuous education, books, courses, and conference travel stipend"] },
];

const PILLARS = [
  { n: "01", title: "Small, Elite Squads", text: "We hire singular craftspeople. A team of 20 builders out-executes legacy orgs of 500." },
  { n: "02", title: "Uncompromising Craft", text: "We obsess over every transition, token latency, and customer moment." },
  { n: "03", title: "Calm Acceleration", text: "High speed through clarity and automation, never through burnout or chaos." },
];

const PROCESS = [
  { title: "Portfolio review", text: "We review your portfolio and the work you're proudest of.", color: "#3784ff" },
  { title: "A real conversation", text: "A high-signal architectural dialogue, not a quiz.", color: "#ffd84d", ink: true },
  { title: "Paid practical project", text: "You complete a paid project with the team, so you see how we work.", color: "#7060bd" },
];

// ------------------------------------------------------------ parts

// Scroll reveal: the wrapper is invisible until it enters the viewport, then plays one of the
// entrance animations in globals.css (up, drop, deal, pop). Each instance watches itself, so
// content that appears later (a filtered job list) reveals correctly too.
function Rv({ variant = "up", delay = 0, className, children }: { variant?: "up" | "drop" | "deal" | "pop" | "words"; delay?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} data-rv={variant} {...(seen ? { "data-in": "" } : {})} className={className} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

// A sentence that arrives one word at a time.
function Words({ text, className }: { text: string; className?: string }) {
  return (
    <Rv variant="words" className={className}>
      {text.split(" ").map((word, index) => (
        <span key={index}>
          <span className="w inline-block" style={{ ["--wd" as string]: `${index * 45}ms` }}>{word}</span>{" "}
        </span>
      ))}
    </Rv>
  );
}

// A number that counts up when it scrolls into view.
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setValue(to); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1000);
        setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref} className="tabular-nums">{value}</span>;
}

// One value as a full-width card. The cards are sticky, so as you scroll each new one slides up
// and stacks over the last, leaving the earlier ones peeking out as tabs.
function ValueCard({ value, index }: { value: (typeof VALUES)[number]; index: number }) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-black/40 bg-white">
      {/* the strip that stays visible once later cards stack over this one */}
      <header className="flex h-[46px] items-center justify-between border-b border-black/15 bg-[#f4f4f2] px-5 sm:px-8">
        <span className="text-[13px] font-medium">Value {String(index + 1).padStart(2, "0")} of {String(VALUES.length).padStart(2, "0")}</span>
        <span className="truncate pl-4 text-[13px] text-black/55">{value.title}</span>
      </header>
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
          <div>
            <h3 className="text-4xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-5xl">{value.title}</h3>
            <p className="mt-3 max-w-md text-lg leading-7 text-black/65">{value.tagline}</p>
            <p className="mt-6 max-w-xl text-[16px] leading-8 text-black/75">{value.description}</p>
          </div>
          <p className="w-fit max-w-md rounded-2xl rounded-bl-sm bg-[#f4f4f2] px-4 py-3 text-[15px] leading-6 text-[#11120f]">
            <span aria-hidden="true" className="mr-1.5">🦥</span>{value.note}
          </p>
        </div>
        <div className="relative isolate flex min-h-[220px] items-center justify-center overflow-hidden border-t border-black/15 bg-[#f4f4f2] lg:border-l lg:border-t-0">
          <span aria-hidden="true" className="absolute -bottom-10 -right-2 select-none text-[220px] font-semibold leading-none tracking-[-0.06em] text-black/[0.05] sm:text-[300px]">{String(index + 1).padStart(2, "0")}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.image} alt={value.alt} className="relative h-[230px] w-full max-w-[320px] animate-[elpino-float_6s_ease-in-out_infinite] object-contain p-4 sm:h-[300px]" style={{ animationDelay: `${index * 0.6}s` }} loading="lazy" />
        </div>
      </div>
    </article>
  );
}

// A job as a simple row: the role on the left, where and when beneath it, a link on the right.
function JobRow({ role }: { role: (typeof roles)[number] }) {
  return (
    <Link href={`/careers/${role.slug}`} className="group flex flex-col gap-5 rounded-[10px] border border-black/40 bg-white p-6 transition-colors hover:bg-[#fafaf9] sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="min-w-0">
        <span className="rounded-full bg-[#f4f4f2] px-3 py-1 text-[12.5px] font-medium text-black/65">{role.category}</span>
        <h3 className="mt-3 text-2xl font-normal leading-[1.1] tracking-[-0.03em] sm:text-3xl">{role.title}</h3>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-black/60">{role.tagline}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] text-black/55">
          <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{role.location}</span>
          <span>{role.employmentType}</span>
          <span>Posted {fmtDate(role.datePosted)}</span>
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-[#0078f4] underline decoration-1 underline-offset-4">
        View &amp; apply <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

// ------------------------------------------------------------ page

export function CareersView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState(0);

  const categories = useMemo(() => ["All", ...Array.from(new Set(roles.map((role) => role.category)))], []);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return roles.filter((role) => (category === "All" || role.category === category)
      && (!q || role.title.toLowerCase().includes(q) || role.tagline.toLowerCase().includes(q) || role.category.toLowerCase().includes(q)));
  }, [query, category]);

  const locations = Array.from(new Set(roles.map((role) => role.location))).join(" · ");
  const types = Array.from(new Set(roles.map((role) => role.employmentType))).join(" · ");
  const benefit = BENEFITS[tab];

  return (
    <div className="bg-white text-[#11120f]">
      {/* Hero */}
      <section className="bg-white px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <div>
            <h1 className="animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Defining the AI era of customer experience
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
              AI agents that resolve support end-to-end, with craft, trust, and calm precision built into every conversation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={scrollToRoles} className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-7 text-[15px] font-medium text-white transition hover:opacity-85">
                Open roles <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
              </button>
              <a href="#who-we-are" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-7 text-[15px] font-medium transition hover:border-black/60">Learn about our culture</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              <span className="rounded-full bg-[#0078f4] px-3.5 py-1.5 font-medium text-white"><CountUp to={roles.length} /> open roles</span>
              <span className="rounded-full border border-black/25 bg-white px-3.5 py-1.5 text-black/70">{locations}</span>
              <span className="rounded-full border border-black/25 bg-white px-3.5 py-1.5 text-black/70">{types}</span>
            </div>
          </div>

          <div aria-hidden="true" className="hidden animate-[elpino-focus_0.9s_ease-out_0.25s_both] lg:block">
            <div className="flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[10px] border border-black/25 bg-[#f4f4f2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/busy-teams-sloth-v2.png" alt="" className="h-[92%] w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section id="who-we-are" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px] border-t border-black/20 pt-16">
          <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Who we are</h2></Rv>
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Rv variant="up" className="self-start lg:sticky lg:top-28"><div className="rounded-[10px] bg-[#f4f4f2] p-8 sm:p-10">
              <p className="text-[13px] font-medium text-black/55">A note from the team</p>
              <p className="mt-4 text-[26px] font-medium leading-[1.25] tracking-[-0.025em] sm:text-[32px]">
                Honestly? We&apos;re a little lazy. That&apos;s why we built AI agents that answer instantly at 3am, so we don&apos;t have to. Call it laziness. Haha.
              </p>
            </div></Rv>
            <div className="space-y-6">
              {[
                { body: <><b className="text-[#11120f]">Support sucks when it&apos;s slow, robotic, or both.</b> So we built agents that actually resolve things: instantly, calmly, correctly, instead of shuffling tickets around. No chatbot theater, no &ldquo;let me transfer you.&rdquo; Just answers.</> },
                { body: <>Every company with customers has this problem, and it&apos;s worth trillions to fix. We&apos;re not chasing another AI trend. We want to build something people genuinely love using, the way you talk about the handful of tools you actually enjoy opening.</> },
                { body: <>That takes an unusually high bar. Not &ldquo;we work hard&rdquo; high, but &ldquo;we sweat the details nobody else would bother with&rdquo; high. Do that for long enough, alongside people who push you, and you end up building a career (and a company) worth talking about for years after.</> },
              ].map((note, i) => (
                <Rv key={i} variant="up" delay={(i + 1) * 120}><div className="border-t border-black/20 pt-6 text-[17px] leading-8 text-black/70">
                  {note.body}
                </div></Rv>
              ))}
              <p className="text-base leading-7 text-black/55">If you want to help write the story of this era instead of just reading about it, we&apos;d love to talk.</p>
              <button type="button" onClick={scrollToRoles} className="group inline-flex items-center gap-2.5 text-[15px] font-medium text-[#0078f4] underline decoration-1 underline-offset-4 hover:opacity-80">
                Explore all open roles <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white px-5 py-4 sm:px-8 lg:px-20 lg:py-8">
        <div className="mx-auto max-w-[1500px]">
          <Rv><div className="relative isolate overflow-hidden rounded-[10px] bg-[#11120f] p-8 text-white sm:p-14">
            <span aria-hidden="true" className="absolute right-8 top-2 select-none text-[180px] font-semibold leading-none text-white/[0.07] sm:text-[260px]">&rdquo;</span>
            <p className="text-[13px] font-medium text-white/60">From our CEO &amp; co-founder</p>
            <Words className="relative mt-6 max-w-3xl text-3xl font-normal leading-[1.15] tracking-[-0.03em] sm:text-5xl" text="“I don’t believe in job titles. I just love to build things people love, and help the people building them with me.”" />
            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {PILLARS.map((pillar, index) => (
                <Rv key={pillar.n} variant="up" delay={index * 120}><div className="h-full rounded-[10px] border border-white/20 p-5 text-white transition-colors hover:border-white/50">
                  <span className="text-[13px] font-medium text-[#0078f4]">Pillar {pillar.n}</span>
                  <h3 className="mt-2 text-xl font-medium tracking-[-0.02em]">{pillar.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-white/60">{pillar.text}</p>
                </div></Rv>
              ))}
            </div>
          </div></Rv>
        </div>
      </section>

      {/* Values: a stack of cards that pile up as you scroll */}
      <section id="values" className="bg-white px-5 pb-8 pt-20 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="max-w-2xl">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Seven values. Stack them up.</h2>
            <p className="mt-4 text-base leading-7 text-black/60">Keep scrolling: each value lands on top of the last.</p>
          </Rv>
          <div className="mt-12 pb-24">
            {VALUES.map((value, index) => (
              <div key={value.id} className="sticky mb-10" style={{ top: `${20 + index * 46}px`, zIndex: index + 1 }}>
                <Rv variant="up"><ValueCard value={value} index={index} /></Rv>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits: tabs */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px] border-t border-black/20 pt-16">
          <Rv className="max-w-2xl">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Benefits to support your best work.</h2>
            <p className="mt-4 text-base leading-7 text-black/60">We want the work to be challenging, but not punishing. The benefits are designed to make space for both monumental ambition and a peaceful life.</p>
          </Rv>

          <div role="tablist" aria-label="Benefit categories" className="mt-10 inline-flex flex-wrap gap-2">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon;
              const on = tab === index;
              return (
                <button key={item.key} type="button" role="tab" aria-selected={on} onClick={() => setTab(index)} className={`inline-flex h-12 items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-colors ${on ? "border-[#11120f] bg-[#11120f] text-white" : "border-black/25 bg-white text-[#11120f] hover:border-black/60"}`}>
                  <Icon size={17} /> {item.title}
                </button>
              );
            })}
          </div>

          <div key={benefit.key} role="tabpanel" className="mt-6 grid animate-[elpino-focus_0.5s_ease-out_both] overflow-hidden rounded-[10px] border border-black/40 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col justify-between bg-[#f4f4f2] p-8 sm:p-10">
              <benefit.icon size={40} strokeWidth={1.6} className="text-[#0078f4]" />
              <div className="mt-16">
                <h3 className="text-4xl font-medium tracking-[-0.03em]">{benefit.title}</h3>
                <p className="mt-3 max-w-sm text-[17px] leading-7 text-black/65">{benefit.description}</p>
              </div>
            </div>
            <ul className="divide-y divide-black/10 bg-white">
              {benefit.perks.map((perk, index) => (
                <li key={perk} className="flex animate-[elpino-focus_0.55s_ease-out_both] items-start gap-4 px-6 py-4 text-[15.5px] leading-7 text-black/75 transition-colors hover:bg-[#fafaf9] sm:px-8" style={{ animationDelay: `${index * 80}ms` }}>
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1aa37a] text-white"><Check size={13} strokeWidth={3.5} aria-hidden="true" /></span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How we hire */}
      <section className="bg-[#11120f] px-5 py-20 text-white sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Rv>
            <p className="text-[13px] font-medium text-white/55">Interviewing with respect</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">No 7-round hazing rituals.</h2>
          </Rv>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PROCESS.map((step, index) => (
              <Rv key={step.title} variant="up" delay={index * 140} className="relative"><div className="h-full rounded-[10px] border border-white/20 p-6 sm:p-8">
                <span className="grid size-9 place-items-center rounded-full bg-[#0078f4] text-[14px] font-semibold text-white">{index + 1}</span>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-white/60">{step.text}</p>
              </div></Rv>
            ))}
          </div>
          <Rv variant="up" className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[10px] border border-white/20 p-6">
              <h3 className="text-lg font-medium">Why the sloth ethos?</h3>
              <p className="mt-2 text-[15px] leading-6 text-white/60">Sloths never rush bad code. We don&apos;t believe in frenzy or hustle-theater. We believe in calm minds building resilient, automated systems that run smoothly 24/7.</p>
            </div>
            <div className="rounded-[10px] border border-white/20 p-6">
              <h3 className="text-lg font-medium">100% async &amp; remote friendly</h3>
              <p className="mt-2 text-[15px] leading-6 text-white/60">Our team spans 6 global hubs and countless remote home-offices. We rely on clear writing, small PRs, and protected focus blocks over back-to-back meetings.</p>
            </div>
          </Rv>
        </div>
      </section>

      {/* Open roles */}
      <section id="open-roles" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Rv className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">Find your next role.</h2>
            <p className="max-w-sm text-base leading-7 text-black/60">We are looking for exceptional craftspeople, systems thinkers, and AI pioneers. All roles offer tier-1 equity, top health care, and remote flexibility.</p>
          </Rv>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <label className="flex h-12 min-w-[260px] flex-1 items-center gap-3 rounded-[10px] border border-black/40 bg-white px-5 transition-colors focus-within:border-[#0078f4]">
              <Search size={17} className="text-black/45" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by role title, skill, or keyword..." aria-label="Search open roles" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/40" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by team">
            {categories.map((item) => (
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-1.5 text-[14px] transition-colors ${category === item ? "border-[#11120f] bg-[#11120f] text-white" : "border-black/25 bg-white text-[#11120f] hover:border-black/60"}`}>{item}</button>
            ))}
          </div>

          <p className="mt-6 text-[13px] text-black/50" role="status">{filtered.length} {filtered.length === 1 ? "open role" : "open roles"}</p>
          <div className="mt-4 space-y-4">
            {filtered.length ? (
              filtered.map((role, position) => <Rv key={role.slug} variant="up" delay={(position % 3) * 80}><JobRow role={role} /></Rv>)
            ) : (
              <div className="rounded-[10px] border border-dashed border-black/30 py-16 text-center text-black/55">
                <p className="text-lg">No open roles found matching your search.</p>
                <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-4 inline-flex rounded-full border border-black/30 bg-white px-5 py-2 text-sm font-medium text-[#11120f] transition hover:border-black/70">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-white px-5 pb-24 sm:px-8 lg:px-20">
        <Rv className="mx-auto max-w-[1500px]"><div className="rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
          <p className="text-[13px] font-medium text-black/55">The next chapter starts now</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">Now is the time. Take your career to the next level.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/60">Join an elite team building autonomous AI customer agents that will define this era of computing.</p>
          <button type="button" onClick={scrollToRoles} className="group mt-8 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">
            Find your next role <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div></Rv>
      </section>
    </div>
  );
}
