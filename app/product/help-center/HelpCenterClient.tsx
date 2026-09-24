"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  Globe2,
  Image as ImageIcon,
  Inbox,
  Layers,
  Lightbulb,
  Link2,
  MessageSquare,
  Palette,
  Search,
  Send,
  Sparkles,
  Target,
  ThumbsUp,
  Type,
} from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/app/components/Reveal";

const quickWins = [
  {
    title: "Easy to set up and customize",
    description: "Import articles or write them fresh, apply your brand in the no-code styler, and go live on your own domain — no code required.",
    icon: Palette,
  },
  {
    title: "Serve content across channels",
    description: "The same articles power your AI agent, chat widget, shared inbox, and Telegram — so customers self-serve wherever they already are.",
    icon: Layers,
  },
  {
    title: "Multilingual by default",
    description: "Reach a global audience with content served accurately in 95+ languages, product terminology included.",
    icon: Globe2,
  },
];

const customizationHighlights = [
  {
    tag: "Customizable",
    title: "No-code customization, simple implementation",
    description:
      "Every part of your help center — layout, colors, typography, logo, and domain — matches your brand without touching a line of code.",
    highlights: [
      { title: "End-to-end customization", body: "Consistent branding across your help center, widget, and product surfaces.", icon: Palette },
      { title: "No-code styler", body: "Adjust layout, colors, and fonts visually and preview changes instantly.", icon: Type },
      { title: "Flexible article formatting", body: "Rich media, callouts, tables, code blocks, and CTAs make articles genuinely useful.", icon: ImageIcon },
    ],
  },
];

const channelCards = [
  {
    icon: Bot,
    title: "AI Agent",
    description:
      "Your articles become the AI agent's source of truth — grounded answers with citations, resolving the repetitive 80% so your team handles the exceptions.",
    stat: "Up to 80% of repetitive questions resolved",
  },
  {
    icon: MessageSquare,
    title: "Chat Widget",
    description:
      "Before a visitor reaches out, the widget suggests the exact article that answers them — deflecting the conversation without hiding the human option.",
    stat: "Self-serve before contact",
  },
  {
    icon: Inbox,
    title: "Shared Inbox",
    description:
      "When your team does step in, the right article is one click away — insert a suggested answer into the reply without leaving the conversation.",
    stat: "Faster, consistent replies",
  },
  {
    icon: Send,
    title: "Proactive Outreach",
    description:
      "Surface the right article at the right moment — onboarding guides after signup, troubleshooting steps when errors spike in your product.",
    stat: "Prevent tickets before they exist",
  },
];

const tools = [
  {
    icon: Target,
    title: "Article targeting",
    description: "Show specific content based on who's reading — plan, location, or product — so the answer always fits.",
  },
  {
    icon: Lightbulb,
    title: "Article suggestions",
    description: "Surface suggested reads before customers even start searching, based on the page they're on.",
  },
  {
    icon: Link2,
    title: "Related articles",
    description: "Keep customers in flow with related reads at the bottom of every article.",
  },
  {
    icon: ThumbsUp,
    title: "Article reactions",
    description: "Know exactly how helpful each article is, and let customers start a conversation when it isn't.",
  },
  {
    icon: BarChart3,
    title: "Content-gap reporting",
    description: "See what customers searched for but couldn't find — your ready-made list of what to write next.",
  },
  {
    icon: Sparkles,
    title: "Instant AI sync",
    description: "Publish or edit an article and it's immediately vectorized and live for the AI agent to cite.",
  },
];

const faqs = [
  {
    q: "What is the Elpino Help Center?",
    a: "A fully integrated, on-brand knowledge base where customers find answers on their own — on your site, inside the chat widget, and everywhere your support content is surfaced. Every article you publish grounds your AI agent automatically.",
  },
  {
    q: "How does the Help Center work with the AI agent?",
    a: "Your articles are the agent's source of truth. When a customer asks something, the agent searches your knowledge base first, answers with citations, and escalates to your team honestly when it doesn't know — never guessing.",
  },
  {
    q: "Can I customize it without code?",
    a: "Yes. The no-code styler covers layout, colors, fonts, and your logo, and you can host it on your own domain like support.yourbrand.com. Articles support rich media, callouts, tables, and CTAs.",
  },
  {
    q: "Does it support multiple brands and languages?",
    a: "You can run separately branded help centers per brand entity in one workspace, and your content serves accurately in 95+ languages with product terminology intact.",
  },
  {
    q: "How do I know which articles to write next?",
    a: "Content-gap reporting shows what customers searched for without finding an answer. Article reactions and view analytics show which pages genuinely resolve questions — together they're your editorial roadmap.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams publish their first branded help center in under an hour: connect your workspace, apply your brand in the styler, add your first articles, and embed the widget. No code required.",
  },
];

function MockHelpCenter() {
  const categories = [
    { name: "Getting started", count: 12, tint: "bg-[#e7ddf3] text-[#5c416f]" },
    { name: "Orders & billing", count: 18, tint: "bg-[#dcefdd] text-[#3f5c40]" },
    { name: "Troubleshooting", count: 9, tint: "bg-[#dbe7f3] text-[#356887]" },
  ];
  const popular = [
    "How to change your plan or billing cycle",
    "Connecting your store and importing products",
    "Understanding AI resolutions vs. human handoffs",
    "Inviting teammates and setting permissions",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_70px_-35px_rgba(23,24,28,0.35)]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-amber-400" />
          <span className="size-3 rounded-full bg-emerald-400" />
        </div>
        <span className="hidden rounded-full bg-black/5 px-3 py-1 font-mono text-[11px] text-black/55 sm:block">
          support.yourbrand.com
        </span>
        <span className="rounded-full bg-[#e7ddf3] px-2.5 py-0.5 text-[10px] font-semibold text-[#5c416f]">Live</span>
      </div>

      <div className="p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#233d4d]">How can we help?</p>
          <div className="mx-auto mt-3 flex max-w-sm items-center gap-2 rounded-full border border-black/10 bg-[#fafaf7] px-4 py-2.5">
            <Search size={15} className="shrink-0 text-black/40" />
            <span className="text-xs text-black/40">Search articles…</span>
            <span className="ml-auto hidden rounded-md bg-white px-2 py-0.5 text-[10px] text-black/45 shadow-sm sm:block">
              Ask AI instead
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <div key={category.name} className="rounded-xl border border-black/10 bg-[#fbfaf7] p-3 text-left">
              <span className={`inline-flex size-7 items-center justify-center rounded-lg ${category.tint}`}>
                <BookOpen size={13} />
              </span>
              <p className="mt-2 text-[11px] font-semibold leading-tight text-[#233d4d]">{category.name}</p>
              <p className="mt-0.5 text-[10px] text-black/45">{category.count} articles</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-black/10 p-4 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8c64b4]">Popular this week</p>
          <ul className="mt-2.5 space-y-2.5">
            {popular.map((article) => (
              <li key={article} className="flex items-center justify-between gap-3 text-xs text-[#3c4a52]">
                <span className="truncate">{article}</span>
                <span className="flex shrink-0 items-center gap-2 text-[10px] text-black/40">
                  <ThumbsUp size={11} /> 96%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function HelpCenterClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#7651b0]/20 selection:text-[#7651b0]">
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div aria-hidden="true" className="absolute -right-40 top-0 size-[34rem] rounded-full bg-[#e4d8f3]/50 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7651b0]/20 bg-[#7651b0]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
                <BookOpen size={13} />
                Help Center
              </span>
              <h1 className="mt-6 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em]">
                Customer support,{" "}
                <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#7651b0]">when and where they need it.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/65 sm:text-xl">
                Deliver the right answer to your customers at any time, on any channel — with an
                on-brand help center that grounds your AI agent automatically.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#7651b0]"
                >
                  Start free trial
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                >
                  View a live demo
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto mt-16 max-w-3xl">
              <div className="pointer-events-none absolute -top-20 right-2 z-20 w-36 drop-shadow-2xl sm:w-44">
                <Image
                  src="/images/help-center-sloth.png"
                  alt="Elpino's help center sloth holding a handbook"
                  width={1024}
                  height={1536}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
              <MockHelpCenter />
              <div className="absolute -bottom-5 -left-5 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#7651b0]/15 text-[#7651b0]">
                  <Bot size={15} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-black">Grounded in your articles</div>
                  <div className="text-[10px] text-black/50">Every answer cited, never invented</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-black/50 sm:text-sm">
              <span className="flex items-center gap-1.5 font-medium text-black/80">
                <Check size={16} className="text-[#18c983]" /> Live in under an hour
              </span>
              <span className="flex items-center gap-1.5 font-medium text-black/80">
                <Check size={16} className="text-[#18c983]" /> Custom domain & branding
              </span>
              <span className="flex items-center gap-1.5 font-medium text-black/80">
                <Check size={16} className="text-[#18c983]" /> SEO-optimized articles
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Help your customers help themselves */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Help your customers help themselves
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {quickWins.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <div className="flex h-full flex-col items-center text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f1eefa] text-[#7651b0]">
                    <item.icon size={21} strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-black/60 sm:text-base">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. No-code customization */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          {customizationHighlights.map((section) => (
            <div key={section.tag} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <div>
                  <span className="inline-block rounded-full bg-[#7651b0]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
                    {section.tag}
                  </span>
                  <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-tight tracking-[-0.035em]">
                    {section.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">{section.description}</p>
                  <div className="mt-8 space-y-6">
                    {section.highlights.map((highlight) => (
                      <div key={highlight.title} className="flex items-start gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-[#7651b0] shadow-sm">
                          <highlight.icon size={18} strokeWidth={1.8} />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold tracking-[-0.02em]">{highlight.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-black/60">{highlight.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="relative mx-auto w-full max-w-md space-y-4">
                  <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <span className="text-xs font-semibold text-black/70">Theme styler</span>
                      <span className="rounded-full bg-[#e7ddf3] px-2.5 py-0.5 text-[10px] font-semibold text-[#5c416f]">Previewing</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-black/55">Brand color</span>
                      <div className="flex gap-1.5">
                        {["#7651b0", "#233d4d", "#18c983", "#ff6547", "#17181c"].map((color) => (
                          <span key={color} className="size-5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-black/55">Heading font</span>
                      <span className="rounded-md border border-black/10 bg-[#fafaf7] px-2 py-0.5 font-mono text-[10px] text-black/60">Rethink Sans</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-black/55">Layout</span>
                      <div className="flex gap-1">
                        <span className="rounded-md bg-[#7651b0] px-2 py-0.5 text-[10px] font-medium text-white">Grid</span>
                        <span className="rounded-md border border-black/10 px-2 py-0.5 text-[10px] text-black/55">List</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-lg">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                      <span className="rounded border border-black/10 bg-[#fafaf7] px-1.5 py-0.5 text-[10px] font-bold text-black/70">B</span>
                      <span className="rounded border border-black/10 bg-[#fafaf7] px-1.5 py-0.5 text-[10px] italic text-black/70">I</span>
                      <span className="rounded border border-black/10 bg-[#fafaf7] px-1.5 py-0.5 text-[10px] underline text-black/70">U</span>
                      <span className="ml-1 flex items-center gap-1 rounded border border-black/10 bg-[#fafaf7] px-1.5 py-0.5 text-[10px] text-black/70">
                        <ImageIcon size={10} /> Media
                      </span>
                      <span className="flex items-center gap-1 rounded border border-black/10 bg-[#fafaf7] px-1.5 py-0.5 text-[10px] text-black/70">
                        <Link2 size={10} /> CTA
                      </span>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <div className="h-2.5 w-3/4 rounded-full bg-[#233d4d]/70" />
                      <div className="h-2 w-full rounded-full bg-black/10" />
                      <div className="h-2 w-11/12 rounded-full bg-black/10" />
                      <div className="h-2 w-4/5 rounded-full bg-black/10" />
                      <div className="mt-3 rounded-lg bg-[#f1eefa] p-2.5">
                        <div className="h-1.5 w-2/3 rounded-full bg-[#7651b0]/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Omnichannel */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">Omnichannel</span>
              <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-tight tracking-[-0.035em]">
                Maximum visibility for your support content
              </h2>
              <p className="mt-4 text-base text-black/65 sm:text-lg">
                Write it once. Your articles then resolve questions in the AI agent, get suggested
                in the widget, back up your team in the inbox, and go out proactively.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {channelCards.map((channel, index) => (
              <Reveal key={channel.title} delay={Math.min(index * 0.06, 0.2)}>
                <div className="group h-full rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#7651b0]/40 hover:bg-white hover:shadow-xl sm:p-9">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#f1eefa] text-[#7651b0]">
                      <channel.icon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="rounded-full bg-[#e7ddf3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5c416f]">
                      {channel.stat}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-medium tracking-[-0.03em]">{channel.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-black/65 sm:text-base">{channel.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Multi-brand & multilingual */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div>
                <span className="inline-block rounded-full bg-[#7651b0]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
                  Brandable
                </span>
                <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-tight tracking-[-0.035em]">
                  Multi-brand and multilingual
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
                  Run a separately branded help center for each brand entity — different domains,
                  logos, and color systems — all managed from one workspace. And serve every
                  shopper in their own language, with product terminology that stays accurate.
                </p>
                <ul className="mt-8 space-y-3.5">
                  {[
                    "A different help center for every brand, one workspace",
                    "Instant multilingual delivery across 95+ languages",
                    "Shared article base with per-brand presentation",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e7ddf3] text-[#7651b0]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="text-sm font-medium text-black/80 sm:text-base">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8c64b4]">Your brands</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: "Arden & Oak", domain: "help.ardenoak.com", color: "#7651b0", articles: "42 articles" },
                      { name: "Oak Studio", domain: "support.oakstudio.io", color: "#18c983", articles: "27 articles" },
                      { name: "Arden EU", domain: "hilfe.ardenoak.de", color: "#428ce5", articles: "38 Artikel" },
                    ].map((brand) => (
                      <div key={brand.name} className="flex items-center justify-between rounded-xl border border-black/10 bg-[#fbfaf7] p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-lg" style={{ backgroundColor: brand.color }} />
                          <div>
                            <p className="text-xs font-semibold text-black">{brand.name}</p>
                            <p className="font-mono text-[10px] text-black/45">{brand.domain}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-medium text-black/60">{brand.articles}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-[#7651b0]/40 bg-[#f7f4fd] p-3.5">
                    <span className="text-xs font-medium text-[#5c416f]">+ New brand help center</span>
                    <span className="text-[#7651b0]">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-4 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#428ce5]/15 text-[#428ce5]">
                    <Globe2 size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-black">95+ languages</div>
                    <div className="text-[10px] text-black/50">Accurate product terminology</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. Tools grid */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">
                Additional features
              </span>
              <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-tight tracking-[-0.035em]">
                Tools to create, target, and optimize your articles
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <Reveal key={tool.title} delay={Math.min(index * 0.05, 0.25)}>
                <div className="group h-full rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#7651b0]/40 hover:bg-white hover:shadow-lg">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[#f1eefa] text-[#7651b0]">
                    <tool.icon size={19} strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">{tool.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonial */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7651b0]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
              Support Leader Spotlight
            </div>

            <blockquote className="mt-8 text-2xl font-normal leading-relaxed tracking-tight text-[#17181c] sm:text-3xl lg:text-4xl">
              &quot;We host every help article in Elpino and the AI agent answers straight from
              them. Over{" "}
              <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#7651b0]">60% of conversations</span>{" "}
              now resolve before a human ever needs to read them.&quot;
            </blockquote>

            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              <div className="font-semibold text-black">Brett Rush</div>
              <div className="text-sm text-black/50">Director of Customer Experience at Framecrest</div>
              <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
                ✓ 20,000+ monthly help center visits · 36,000 article views
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="border-t border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">FAQs</span>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                Everything about the Elpino Help Center
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 divide-y divide-black/10 border-y border-black/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-6 text-left text-lg font-medium text-black transition hover:text-[#7651b0]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-black/40 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#7651b0]" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="animate-in fade-in duration-200 pt-4 pr-12 text-base leading-relaxed text-black/70">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Closing CTA */}
      <section className="relative overflow-hidden bg-black py-24 text-white sm:py-32">
        <div aria-hidden="true" className="absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[#7651b0]/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 top-0 size-[26rem] rounded-full bg-[#18c983]/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Upgrade your Help Center today
          </span>

          <h2 className="mt-8 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-white">
            Give every customer a helpful answer,{" "}
            <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#d9bef4]">on their own.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Publish your branded help center, ground your AI agent, and deflect tickets from day
            one. No credit card required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#d9bef4] px-8 py-3.5 text-base font-semibold text-[#231c29] shadow-xl transition-all hover:bg-white hover:text-black"
            >
              Start free trial
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-base font-medium text-white transition hover:bg-white/20"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
