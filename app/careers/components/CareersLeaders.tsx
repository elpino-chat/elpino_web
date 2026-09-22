"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type Leader = {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  quote?: string;
  links: { label: string; href: string; icon: string }[];
};

const leaders: Leader[] = [
  {
    id: "unknown",
    name: "Unknown",
    role: "CEO & Co-founder",
    image: "/images/founders-sloth.png",
    bio: "Oversees Elpino's research, product direction, and commercial strategy. Previously led product at enterprise software companies, and founded Elpino to eliminate chaotic support queues and replace them with high-conviction, autonomous customer intelligence.",
    quote: "We believe in the work, not the position.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "X (Twitter)", href: "https://x.com", icon: "twitter" },
      { label: "Substack", href: "https://substack.com", icon: "substack" },
    ],
  },
  {
    id: "elena-rostova",
    name: "Dr. Elena Rostova",
    role: "Chief AI Officer",
    image: "/images/blog/learning-sloth.png",
    bio: "Elena leads the Elpino AI Research Group. Holding a PhD in Machine Learning, her research focuses on multi-step task reasoning, automated reflection algorithms, and fine-tuned domain grounding to eliminate hallucinations in mission-critical customer workflows.",
    quote: "Reasoning over complex company policy requires verifiable mathematical precision.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "X (Twitter)", href: "https://x.com", icon: "twitter" },
      { label: "GitHub", href: "https://github.com", icon: "github" },
    ],
  },
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    role: "Chief Product Officer",
    image: "/about-remote-team.png",
    bio: "Marcus drives the product experience and operator tooling at Elpino. With over a decade crafting developer platforms and enterprise SaaS, Marcus champions products that require zero training and feel effortlessly fast from day one.",
    quote: "Simplicity is the final result of immense architectural discipline.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "X (Twitter)", href: "https://x.com", icon: "twitter" },
    ],
  },
  {
    id: "aria-chen",
    name: "Aria Chen",
    role: "SVP Design",
    image: "/images/about-sloth-crew.png",
    bio: "Aria leads design systems, visual craft, and brand direction across all Elpino touchpoints. She believes enterprise tools should possess the tactile delight, typographical elegance, and emotional calmness of luxury physical instruments.",
    quote: "Design is not decorative styling; it is how trust is earned in seconds.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "X (Twitter)", href: "https://x.com", icon: "twitter" },
    ],
  },
  {
    id: "david-kalu",
    name: "David Kalu",
    role: "VP Engineering",
    image: "/images/busy-teams-sloth.png",
    bio: "David architects Elpino's distributed infrastructure, low-latency streaming pipelines, and multi-tenant security perimeter. He previously scaled real-time communication systems handling millions of concurrent WebSockets.",
    quote: "Resilient systems stay calm when production traffic surges 100x.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "GitHub", href: "https://github.com", icon: "github" },
    ],
  },
  {
    id: "pino-the-sloth",
    name: "Pino",
    role: "Chief Calmness Officer & Brand Mascot",
    image: "/desk_avatar1.png",
    bio: "Pino protects our team from burnout, unnecessary 45-minute meetings, and frantic rushing. His core operating thesis: Write high-leverage code, automate the repetitive toil, and enjoy life beyond the screen.",
    quote: "Sloths don't rush bad code. We build things that run quietly forever.",
    links: [
      { label: "Elpino Mascot Desk", href: "#", icon: "book" },
      { label: "Community Discord", href: "/community", icon: "github" },
    ],
  },
];

export function CareersLeaders() {
  const [activeLeader, setActiveLeader] = useState<Leader>(leaders[0]);

  return (
    <section className="relative w-full bg-[#070b14] py-20 text-white sm:py-28 lg:py-36">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 -z-0 h-[40rem] w-[40rem] rounded-full bg-[#ff5600]/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
            Leadership
          </span>
          <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-white">
            Work with industry leaders rewriting the rules.
          </h2>
          <p className="mt-4 text-base text-white/65 sm:text-lg">
            Experienced founders, researchers, and craftspeople who have built and scaled
            some of the most celebrated software products in the world.
          </p>
        </div>

        {/* Leaders Tab Navigation Bar matching fin.ai */}
        <div className="mt-12 overflow-x-auto pb-4 scrollbar-none sm:mt-16">
          <div className="flex min-w-max gap-3 border-b border-white/10 pb-4">
            {leaders.map((leader) => {
              const isActive = activeLeader.id === leader.id;
              return (
                <button
                  key={leader.id}
                  type="button"
                  onClick={() => setActiveLeader(leader)}
                  className={`group relative cursor-pointer px-4 py-2 text-left transition-all ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  <p className="text-base font-medium tracking-tight sm:text-lg">
                    {leader.name}
                  </p>
                  <p className="text-xs text-white/50">{leader.role.split("&")[0]}</p>

                  {/* Active bottom line indicator */}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-4 h-0.5 bg-[#ff5600] animate-in fade-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Leader Spotlight Card */}
        <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md lg:grid-cols-12 lg:gap-12 lg:p-12">
          {/* Portrait Photo */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 lg:col-span-5 lg:aspect-[4/4]">
            <Image
              src={activeLeader.image}
              alt={activeLeader.name}
              fill
              className="object-cover p-2 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {activeLeader.name}
              </span>
            </div>
          </div>

          {/* Details & Bio */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
            <div>
              <div className="inline-block rounded-full bg-[#ff5600]/20 px-3 py-1 text-xs font-semibold text-[#ff8e4d]">
                {activeLeader.role}
              </div>
              <h3 className="mt-4 font-serif text-3xl font-normal text-white sm:text-4xl md:text-5xl">
                {activeLeader.name}
              </h3>

              {activeLeader.quote && (
                <blockquote className="mt-4 border-l-2 border-[#ff5600] pl-4 text-base italic text-white/80 sm:text-lg">
                  &ldquo;{activeLeader.quote}&rdquo;
                </blockquote>
              )}

              <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
                {activeLeader.bio}
              </p>
            </div>

            {/* Social & Feeds matching fin.ai */}
            <div className="border-t border-white/10 pt-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Connected Feeds & Writing:
              </span>
              <div className="mt-3 flex flex-wrap gap-3">
                {activeLeader.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white transition hover:border-white hover:bg-white/15"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={13} className="text-white/60" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
