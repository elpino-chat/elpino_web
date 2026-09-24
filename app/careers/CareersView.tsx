"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, Heart, Home, MapPin, Search, TrendingUp } from "lucide-react";
import { roles } from "./roles";

// Careers, in Elpino's own style: a sloth swinging from a rope up top, culture
// pinned to a board, values as holographic trading cards, and every open role
// as a boarding pass. Content comes from the previous page, unchanged, except
// where noted in comments.

const INK = "#11120f";
const STICKERS = ["#3784ff", "#ffd84d", "#7060bd", "#fc7b33", "#1aa37a", "#d9508a"];

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

function Eyebrow({ children, color }: { children: string; color: string }) {
  return <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color }}>{children}</p>;
}

function Tape({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`absolute h-6 w-20 bg-[#ffd84d]/85 ${className}`} />;
}

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
const STACK_COLOURS = [
  { bg: "#3784ff", fg: "#ffffff" },
  { bg: "#ffd84d", fg: "#11120f" },
  { bg: "#7060bd", fg: "#ffffff" },
  { bg: "#fc7b33", fg: "#ffffff" },
  { bg: "#1aa37a", fg: "#ffffff" },
  { bg: "#d9508a", fg: "#ffffff" },
  { bg: "#11120f", fg: "#fff8ec" },
];

function ValueCard({ value, index }: { value: (typeof VALUES)[number]; index: number }) {
  const { bg, fg } = STACK_COLOURS[index % STACK_COLOURS.length];
  return (
    <article className="overflow-hidden rounded-[28px] border-2 border-[#11120f]" style={{ background: bg, color: fg }}>
      {/* the strip that stays visible once later cards stack over this one */}
      <header className="flex h-[46px] items-center justify-between border-b-2 border-[#11120f] px-5 sm:px-8">
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em]">Value {String(index + 1).padStart(2, "0")} of {String(VALUES.length).padStart(2, "0")}</span>
        <span className="truncate pl-4 font-mono text-[12px] uppercase tracking-[0.1em] opacity-80">{value.title}</span>
      </header>
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
          <div>
            <h3 className="text-4xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-6xl">{value.title}</h3>
            <p className="mt-3 max-w-md text-lg leading-7 opacity-85">{value.tagline}</p>
            <p className="mt-6 max-w-xl text-[16px] leading-8 opacity-90">{value.description}</p>
          </div>
          <p className="w-fit max-w-md rounded-2xl rounded-bl-sm border-2 border-[#11120f] bg-[#fff8ec] px-4 py-3 text-[15px] leading-6 text-[#11120f]">
            <span aria-hidden="true" className="mr-1.5">🦥</span>{value.note}
          </p>
        </div>
        <div className="relative isolate flex min-h-[220px] items-center justify-center overflow-hidden border-t-2 border-[#11120f] bg-[#fff8ec] lg:border-l-2 lg:border-t-0">
          <span aria-hidden="true" className="absolute -bottom-10 -right-2 select-none text-[220px] font-semibold leading-none tracking-[-0.06em] text-black/[0.06] sm:text-[300px]">{String(index + 1).padStart(2, "0")}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.image} alt={value.alt} className="relative h-[230px] w-full max-w-[320px] animate-[elpino-float_6s_ease-in-out_infinite] object-contain p-4 sm:h-[300px]" style={{ animationDelay: `${index * 0.6}s` }} loading="lazy" />
        </div>
      </div>
    </article>
  );
}

// A job as a boarding pass: details on the left, a tear-off stub on the right.
function BoardingPass({ role, index }: { role: (typeof roles)[number]; index: number }) {
  const colour = STICKERS[index % STICKERS.length];
  const dark = colour !== "#ffd84d";
  return (
    <Link href={`/careers/${role.slug}`} className="group relative block rounded-[22px] border-2 border-[#11120f] bg-white transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.4deg]">
      <div className="grid sm:grid-cols-[1fr_auto]">
        <div className="min-w-0 p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-[#11120f] px-3 py-0.5 text-[12px] font-bold" style={{ background: colour, color: dark ? "#fff" : INK }}>{role.category}</span>
            <span className="font-mono text-[11.5px] uppercase tracking-[0.1em] text-black/45">Flight EL-{String(index + 1).padStart(3, "0")}</span>
          </div>
          <h3 className="mt-4 text-3xl font-normal leading-[1.05] tracking-[-0.035em] sm:text-4xl">{role.title}</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-black/60">{role.tagline}</p>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-dashed border-black/15 pt-4 text-sm">
            <div><dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-black/40">Gate</dt><dd className="mt-1 flex items-center gap-1 font-semibold"><MapPin size={13} />{role.location}</dd></div>
            <div><dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-black/40">Class</dt><dd className="mt-1 font-semibold">{role.employmentType}</dd></div>
            <div><dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-black/40">Posted</dt><dd className="mt-1 font-semibold">{fmtDate(role.datePosted)}</dd></div>
          </dl>
        </div>

        {/* perforation with its two notches */}
        <div aria-hidden="true" className="relative hidden w-0 border-l-2 border-dashed border-[#11120f]/50 sm:block">
          <span className="absolute -left-[15px] -top-[17px] h-7 w-7 rounded-full border-2 border-[#11120f] bg-white [clip-path:inset(50%_0_0_0)]" />
          <span className="absolute -bottom-[17px] -left-[15px] h-7 w-7 rounded-full border-2 border-[#11120f] bg-white [clip-path:inset(0_0_50%_0)]" />
        </div>
        <div aria-hidden="true" className="h-0 border-t-2 border-dashed border-[#11120f]/50 sm:hidden" />

        {/* the stub */}
        <div className="flex origin-top-left items-center justify-between gap-5 rounded-b-[20px] bg-[#fff8ec] p-6 transition duration-500 ease-[cubic-bezier(0.3,1.4,0.5,1)] group-hover:translate-x-1.5 group-hover:rotate-[1.5deg] group-hover:bg-[#ffd84d] sm:w-[220px] sm:flex-col sm:items-stretch sm:justify-between sm:rounded-b-none sm:rounded-r-[20px]">
          <div className="hidden sm:block">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-black/45">Boarding pass</p>
            <div className="relative mt-2 h-12 w-full overflow-hidden"><div className="elpino-barcode h-full w-full" /><span className="absolute inset-x-0 top-0 h-[2px] animate-[elpino-scan_2.6s_ease-in-out_infinite] bg-[#3784ff] shadow-[0_0_8px_#3784ff]" /></div>
          </div>
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-5 text-[14px] font-semibold">
            View &amp; apply <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
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
      {/* Hero, with a sloth swinging from a rope */}
      <section className="relative isolate overflow-hidden pb-24 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto grid max-w-[1300px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Careers</p>
            <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-7xl">
              Defining the <span className="hl-load">AI era</span> of customer experience
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
              AI agents that resolve support end-to-end, with craft, trust, and calm precision built into every conversation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={scrollToRoles} className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
                Open roles <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
              </button>
              <a href="#who-we-are" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Learn about our culture</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              <span className="rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1.5 font-semibold"><CountUp to={roles.length} /> open roles</span>
              <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">{locations}</span>
              <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">{types}</span>
            </div>
          </div>

          <div aria-hidden="true" className="relative hidden h-[360px] lg:block">
            <div className="absolute left-1/2 top-[-130px] flex origin-top -translate-x-1/2 animate-[elpino-swing_5s_ease-in-out_infinite_alternate] flex-col items-center">
              <span className="h-[300px] w-[3px] rounded-full bg-[repeating-linear-gradient(to_bottom,#11120f_0_7px,transparent_7px_12px)]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="-mt-1 h-36 w-36 rounded-full border-2 border-[#11120f] bg-white object-contain p-3" />
              <span className="mt-3 -rotate-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[12px] font-bold uppercase tracking-[0.1em]">Now hiring</span>
            </div>
            {/* stickers that pop in beside the sloth */}
            <span className="absolute left-0 top-[210px] -rotate-6 animate-[elpino-pop_0.6s_ease-out_1s_both] rounded-2xl border-2 border-[#11120f] bg-white px-3.5 py-1.5 text-[14px] font-semibold">Remote-friendly</span>
            <span className="absolute right-0 top-[270px] rotate-3 animate-[elpino-pop_0.6s_ease-out_1.2s_both] rounded-2xl border-2 border-[#11120f] bg-[#3784ff] px-3.5 py-1.5 text-[14px] font-semibold text-white">Paid trial project</span>
            <span className="absolute left-6 top-[335px] rotate-2 animate-[elpino-pop_0.6s_ease-out_1.4s_both] rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1.5 text-[14px] font-semibold">Async first</span>
          </div>
        </div>
      </section>

      {/* Ticker of open roles */}
      <div aria-hidden="true" className="group/ticker overflow-hidden border-y-2 border-[#11120f] bg-[#ffd84d] py-3">
        <div className="flex w-max animate-[elpino-marquee_45s_linear_infinite] group-hover/ticker:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {roles.map((role) => (
                <span key={`${copy}-${role.slug}`} className="flex items-center whitespace-nowrap font-mono text-[13px] font-medium uppercase tracking-[0.1em]">
                  <span className="px-7">{role.title}</span>
                  <span className="text-[#3784ff]">✺</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Who we are: a pinned board */}
      <section id="who-we-are" className="relative scroll-mt-16 overflow-hidden bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(#11120f 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div className="relative mx-auto max-w-[1300px]">
          <Rv><Eyebrow color="#7060bd">Who we are</Eyebrow></Rv>
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <Rv variant="drop" className="self-start lg:sticky lg:top-28"><div className="relative -rotate-2 rounded-md border-2 border-[#11120f] bg-[#ffd84d] p-8 transition duration-300 hover:rotate-0 sm:p-10">
              <Tape className="-top-3 left-8 rotate-[-4deg] bg-white/70" />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#11120f]/55">A note from the team</p>
              <p className="mt-4 text-[26px] font-medium leading-[1.25] tracking-[-0.025em] sm:text-[32px]">
                Honestly? We&apos;re a little lazy. That&apos;s why we built AI agents that answer instantly at 3am, so we don&apos;t have to. Call it laziness. Haha.
              </p>
            </div></Rv>
            <div className="space-y-6">
              {[
                { rot: "rotate-1", body: <><b className="text-[#11120f]">Support sucks when it&apos;s slow, robotic, or both.</b> So we built agents that actually resolve things: instantly, calmly, correctly, instead of shuffling tickets around. No chatbot theater, no &ldquo;let me transfer you.&rdquo; Just answers.</> },
                { rot: "-rotate-1", body: <>Every company with customers has this problem, and it&apos;s worth trillions to fix. We&apos;re not chasing another AI trend. We want to build something people genuinely love using, the way you talk about the handful of tools you actually enjoy opening.</> },
                { rot: "rotate-[0.6deg]", body: <>That takes an unusually high bar. Not &ldquo;we work hard&rdquo; high, but &ldquo;we sweat the details nobody else would bother with&rdquo; high. Do that for long enough, alongside people who push you, and you end up building a career (and a company) worth talking about for years after.</> },
              ].map((note, i) => (
                <Rv key={i} variant="drop" delay={(i + 1) * 160}><div className={`relative rounded-md border-2 border-[#11120f] bg-white p-6 text-[17px] leading-8 text-black/70 transition duration-300 hover:rotate-0 sm:p-7 ${note.rot}`}>
                  <Tape className={`-top-3 ${i % 2 ? "right-10 rotate-3" : "left-10 -rotate-3"}`} />
                  {note.body}
                </div></Rv>
              ))}
              <p className="px-2 text-base leading-7 text-black/55">If you want to help write the story of this era instead of just reading about it, we&apos;d love to talk.</p>
              <button type="button" onClick={scrollToRoles} className="group inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-6 py-2.5 text-[15px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">
                Explore all open roles <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv><div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#7060bd] p-8 text-white sm:p-14">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
            <span aria-hidden="true" className="absolute right-8 top-2 select-none text-[180px] font-semibold leading-none text-white/15 sm:text-[260px]">&rdquo;</span>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-white/75">From our CEO &amp; co-founder</p>
            <Words className="relative mt-6 max-w-3xl text-3xl font-normal leading-[1.15] tracking-[-0.03em] sm:text-5xl" text="“I don’t believe in job titles. I just love to build things people love, and help the people building them with me.”" />
            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {PILLARS.map((pillar, index) => (
                <Rv key={pillar.n} variant="deal" delay={index * 140}><div className="h-full rounded-2xl border-2 border-[#11120f] bg-white p-5 text-[#11120f] transition duration-300 hover:-translate-y-1.5">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#7060bd]">Pillar {pillar.n}</span>
                  <h3 className="mt-2 text-xl font-medium tracking-[-0.02em]">{pillar.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-black/60">{pillar.text}</p>
                </div></Rv>
              ))}
            </div>
          </div></Rv>
        </div>
      </section>

      {/* Values: a stack of cards that pile up as you scroll */}
      <section id="values" className="bg-[#fff8ec] px-5 pb-8 pt-20 sm:px-8 lg:pt-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="max-w-2xl">
            <Eyebrow color="#1aa37a">The values behind the work</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">Seven values. <span className="hl">Stack them up.</span></h2>
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
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="max-w-2xl">
            <Eyebrow color="#fc7b33">Total rewards</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">Benefits to support <span className="hl">your best work.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">We want the work to be challenging, but not punishing. The benefits are designed to make space for both monumental ambition and a peaceful life.</p>
          </Rv>

          <div role="tablist" aria-label="Benefit categories" className="mt-10 inline-flex flex-wrap gap-2">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon;
              const on = tab === index;
              return (
                <button key={item.key} type="button" role="tab" aria-selected={on} onClick={() => setTab(index)} className={`inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] px-5 text-[15px] font-semibold transition hover:-translate-y-0.5 ${on ? "text-white" : "bg-white"}`} style={on ? { background: item.color } : undefined}>
                  <Icon size={17} /> {item.title}
                </button>
              );
            })}
          </div>

          <div key={benefit.key} role="tabpanel" className="mt-6 grid animate-[elpino-focus_0.5s_ease-out_both] overflow-hidden rounded-[28px] border-2 border-[#11120f] lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative isolate flex flex-col justify-between p-8 text-white sm:p-10" style={{ background: benefit.color }}>
              <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "20px 20px" }} />
              <benefit.icon size={44} strokeWidth={1.6} />
              <div className="mt-16">
                <h3 className="text-4xl font-medium tracking-[-0.035em]">{benefit.title}</h3>
                <p className="mt-3 max-w-sm text-[17px] leading-7 text-white/85">{benefit.description}</p>
              </div>
            </div>
            <ul className="divide-y-2 divide-dashed divide-black/15 bg-white">
              {benefit.perks.map((perk, index) => (
                <li key={perk} className="flex animate-[elpino-focus_0.55s_ease-out_both] items-start gap-4 px-6 py-4 text-[15.5px] leading-7 text-black/75 transition-colors hover:bg-[#fffdf5] sm:px-8" style={{ animationDelay: `${index * 80}ms` }}>
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] font-mono text-[11px] font-bold text-white" style={{ background: benefit.color }}>{index + 1}</span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How we hire */}
      <section className="bg-[#11120f] px-5 py-20 text-[#fff8ec] sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv>
            <Eyebrow color="#ffd84d">Interviewing with respect</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-4xl font-normal tracking-[-0.045em] sm:text-5xl">No 7-round <span className="text-[#fc7b33]">hazing rituals.</span></h2>
          </Rv>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PROCESS.map((step, index) => (
              <Rv key={step.title} variant="deal" delay={index * 160} className="relative"><div className="relative h-full rounded-[22px] border-2 border-[#fff8ec]/70 p-6 pt-9 sm:p-8 sm:pt-11">
                <span className="elpino-stamp absolute -top-4 left-6 flex h-10 items-center rounded-full border-2 border-[#11120f] px-4 font-mono text-[13px] font-bold uppercase tracking-[0.12em]" style={{ background: step.color, color: step.ink ? INK : "#fff" }}>Step {index + 1}</span>
                <h3 className="text-2xl font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-[#fff8ec]/65">{step.text}</p>
                {index < PROCESS.length - 1 && (
                  <span aria-hidden="true" className="absolute -right-[26px] top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 animate-[elpino-nudge_1.6s_ease-in-out_infinite] items-center justify-center rounded-full border-2 border-[#fff8ec] bg-[#11120f] text-lg md:flex">→</span>
                )}
              </div></Rv>
            ))}
          </div>
          <Rv variant="up" className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#fff8ec]/40 p-6">
              <h3 className="text-lg font-medium">Why the sloth ethos?</h3>
              <p className="mt-2 text-[15px] leading-6 text-[#fff8ec]/65">Sloths never rush bad code. We don&apos;t believe in frenzy or hustle-theater. We believe in calm minds building resilient, automated systems that run smoothly 24/7.</p>
            </div>
            <div className="rounded-2xl border-2 border-[#fff8ec]/40 p-6">
              <h3 className="text-lg font-medium">100% async &amp; remote friendly</h3>
              <p className="mt-2 text-[15px] leading-6 text-[#fff8ec]/65">Our team spans 6 global hubs and countless remote home-offices. We rely on clear writing, small PRs, and protected focus blocks over back-to-back meetings.</p>
            </div>
          </Rv>
        </div>
      </section>

      {/* Open roles: boarding passes */}
      <section id="open-roles" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Rv className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Eyebrow color="#3784ff">Open opportunities</Eyebrow>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Find your <span className="hl">next role.</span></h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-black/60">We are looking for exceptional craftspeople, systems thinkers, and AI pioneers. All roles offer tier-1 equity, top health care, and remote flexibility.</p>
          </Rv>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <label className="flex h-12 min-w-[260px] flex-1 items-center gap-3 rounded-full border-2 border-[#11120f] bg-white px-5 focus-within:border-[#3784ff]">
              <Search size={17} className="text-black/45" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by role title, skill, or keyword..." aria-label="Search open roles" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/35" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by team">
            {categories.map((item) => (
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border-2 border-[#11120f] px-4 py-1.5 text-[13.5px] transition hover:-translate-y-0.5 ${category === item ? "bg-[#ffd84d] font-semibold" : "bg-white"}`}>{item}</button>
            ))}
          </div>

          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.1em] text-black/45" role="status">{filtered.length} {filtered.length === 1 ? "flight" : "flights"} boarding</p>
          <div className="mt-4 space-y-6">
            {filtered.length ? (
              filtered.map((role, position) => <Rv key={role.slug} variant="deal" delay={(position % 3) * 90}><BoardingPass role={role} index={roles.indexOf(role)} /></Rv>)
            ) : (
              <div className="rounded-[22px] border-2 border-dashed border-[#11120f]/40 py-16 text-center text-black/55">
                <p className="text-lg">No open roles found matching your search.</p>
                <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-4 inline-flex rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 py-2 text-sm font-semibold text-[#11120f]">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-white px-5 pb-24 sm:px-8">
        <Rv variant="pop" className="mx-auto max-w-[1300px]"><div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#3784ff] px-7 py-14 text-white sm:px-14 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
          <span aria-hidden="true" className="elpino-stamp absolute right-6 top-6 hidden rotate-[-8deg] rounded-lg border-[3px] border-[#ffd84d] px-3 py-1 font-mono text-[14px] font-bold uppercase tracking-[0.16em] text-[#ffd84d] sm:block">Now boarding</span>
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-white/80">The next chapter starts now</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-6xl">Now is the time. Take your career to the next level.</h2>
          <p className="mt-5 max-w-xl text-lg text-white/80">Join an elite team building autonomous AI customer agents that will define this era of computing.</p>
          <button type="button" onClick={scrollToRoles} className="group mt-8 inline-flex h-13 items-center gap-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-9 py-3.5 text-base font-semibold text-[#11120f] transition hover:-translate-y-0.5">
            Find your next role <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div></Rv>
      </section>
    </div>
  );
}
