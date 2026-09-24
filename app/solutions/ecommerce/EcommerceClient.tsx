"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Bell,
  PackageCheck,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  Ruler,
  ScanSearch,
  AlarmClock,
  ShieldAlert,
} from "lucide-react";
import { Reveal } from "@/app/components/Reveal";

const ACCENT = "#7651b0";

export function EcommerceClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats = [
    {
      value: "85%",
      label: "of “Where is my order?” inquiries resolved autonomously, without an agent touching the thread",
    },
    {
      value: "< 1.2s",
      label: "average time to verify an order in Shopify, WooCommerce, or your custom store API",
    },
    {
      value: "+24%",
      label: "conversion lift when sizing, shipping, and discount questions get instant answers",
    },
    {
      value: "0",
      label: "queue backlog during Black Friday surges — no seasonal support contractors needed",
    },
  ];

  const pillars = [
    {
      tag: "WISMO, on autopilot",
      title: "“Where is my order?” answered before your team wakes up.",
      description:
        "WISMO is the loudest ticket in e-commerce — and the easiest to automate safely. Elpino verifies the shopper, queries your store and courier in real time, and replies with tracking, delivery estimates, and proactive delay notices. Verified data only, never guesses.",
      bulletPoints: [
        "Live courier tracking, delivery windows, and fulfillment status in seconds",
        "Proactive delay alerts before the shopper has to ask twice",
        "Order amendments (address, size, variant) captured as approval-first drafts",
      ],
      image: "/images/busy-teams-sloth.png",
      badge: "Real-Time Order Intelligence",
      statHighlight: { number: "85%", text: "of WISMO tickets never reach a human" },
    },
    {
      tag: "Returns & exchanges",
      title: "Returns that follow your policy — and save the sale.",
      description:
        "Elpino enforces your exact return window and rules, generates labels, and — when the policy allows — turns a refund request into an exchange or store credit with a nudge toward the right replacement product. Cash refunds above your limits always wait for a human approval.",
      bulletPoints: [
        "Policy-exact returns: windows, condition rules, and non-returnable items respected",
        "One-click return labels and exchange flows generated inside the chat",
        "Refund proposals above your threshold route to your team with full context",
      ],
      image: "/images/trust-sloth.png",
      badge: "Approval-First Refunds",
      statHighlight: { number: "31%", text: "of refund requests converted to exchanges" },
    },
    {
      tag: "Conversion & recovery",
      title: "A helpful associate on every product page.",
      description:
        "From “does this run small?” to “will it arrive before Friday?” — Elpino answers pre-purchase questions with your real catalog data, and re-engages hesitant shoppers on the checkout page before the cart goes cold.",
      bulletPoints: [
        "Sizing guidance from your actual size charts and return history",
        "Stock checks across variants with back-in-stock notifications",
        "Abandoned-cart rescue: shipping costs, discount codes, and delivery promises answered in chat",
      ],
      image: "/images/revenue-sloth-v2.png",
      badge: "Cart Recovery Engine",
      statHighlight: { number: "+24%", text: "shopper conversion lift" },
    },
  ];

  const workflowSteps = [
    {
      title: "Instant order lookup",
      subtitle: "Verified answers, straight from your store",
      content: {
        userQuery: "Hi! I ordered the linen shirt last Tuesday — order #48291. Where is it?",
        aiResponse:
          "Found it, Maya! Order #48291 shipped Monday via DHL and is out for delivery today, arriving before 6 PM. Here's your live tracking link. Want me to email you the tracking details too?",
        source: "Shopify Order #48291 · DHL Tracking 0034…221 · Verified: maya@…",
        status: "Auto-Answered in 980ms · Order Verified",
      },
    },
    {
      title: "Policy-exact returns",
      subtitle: "Exchanges proposed, refunds approval-gated",
      content: {
        userQuery: "The sneakers run half a size small. Can I return them for a refund?",
        aiResponse:
          "Absolutely — they're within the 30-day window. I can generate a prepaid label now, or swap them for the same pair in a half size up, which ships out today. Which would you prefer?",
        source: "Return Policy: 30-day window · Size-exchange rule #2 · Label API ready",
        status: "Return Opened · Exchange Proposed · Label Queued",
      },
    },
    {
      title: "Pre-purchase advice",
      subtitle: "Real catalog data, real conversion",
      content: {
        userQuery: "I'm 5'9\" and 170 lbs — medium or large in the oversized hoodie?",
        aiResponse:
          "At 5'9\" / 170 lbs, Medium gives you the intended oversized drape; Large is a relaxed fit. 68% of shoppers your size kept the Medium. Want the restock alert for the sage colorway while you decide?",
        source: "Size Chart: Hoodie-Oversized · Return history: fit-keep rate 68%",
        status: "Advice Grounded · Sizing Confidence High",
      },
    },
    {
      title: "Abandoned cart rescue",
      subtitle: "Answers at the exact moment of doubt",
      content: {
        userQuery: "(checkout page, cart idle 4 minutes) Does this ship to Sweden before Dec 20?",
        aiResponse:
          "It does! Express shipping to Sweden is 3–5 business days — order today and it arrives by Dec 19. Orders over €150 ship free, and your cart is €142 — want me to show what's closest to add?",
        source: "Shipping Rules: EU-Express · Free-ship threshold €150 · Cart context attached",
        status: "Cart Recovered · Shopper Returned to Checkout",
      },
    },
  ];

  const agents = [
    {
      name: "Order Lookup Agent",
      role: "WISMO & fulfillment status",
      description: "Verifies the shopper, queries your store and couriers, and replies with live tracking in seconds.",
      icon: ScanSearch,
      accent: "bg-[#7651b0]/10 text-[#7651b0]",
    },
    {
      name: "Returns Policy Agent",
      role: "Windows, labels & exchanges",
      description: "Enforces your exact return rules, generates labels, and proposes exchanges before refunds.",
      icon: RotateCcw,
      accent: "bg-[#18c983]/10 text-[#18c983]",
    },
    {
      name: "Sizing & Product Advisor",
      role: "Pre-purchase guidance",
      description: "Answers fit, fabric, and compatibility questions from your real size charts and catalog.",
      icon: Ruler,
      accent: "bg-[#428ce5]/10 text-[#428ce5]",
    },
    {
      name: "Inventory Watchdog",
      role: "Stock & restock alerts",
      description: "Checks variant availability and captures back-in-stock notifications automatically.",
      icon: PackageCheck,
      accent: "bg-[#d9862b]/10 text-[#d9862b]",
    },
    {
      name: "Cart Recovery Nudge",
      role: "Checkout-page rescue",
      description: "Engages hesitant shoppers on shipping costs, delivery dates, and discount codes before they leave.",
      icon: AlarmClock,
      accent: "bg-[#7651b0]/10 text-[#7651b0]",
    },
    {
      name: "Fraud & Chargeback Guard",
      role: "Risk flagging",
      description: "Flags suspicious address changes and high-risk refund disputes, routing them to store managers.",
      icon: ShieldAlert,
      accent: "bg-[#233d4d]/10 text-[#233d4d]",
    },
  ];

  const faqs = [
    {
      q: "How does Elpino check order status?",
      a: "Elpino securely queries your e-commerce platform (Shopify, WooCommerce, BigCommerce, or a custom API) using the customer's verified email and order number. Only the shopper whose account matches sees their order details — nothing is exposed to anonymous visitors.",
    },
    {
      q: "Can Elpino issue refunds automatically?",
      a: "You set the rules. Store credit, exchanges, and return labels can be fully automated, while cash refunds above an amount you choose always require human approval. Every proposed action is logged, and your team approves or rejects it with one tap.",
    },
    {
      q: "Which platforms and couriers does it connect to?",
      a: "Shopify, WooCommerce, BigCommerce, and custom storefronts via API — plus courier tracking from DHL, UPS, FedEx, Royal Mail, and regional carriers. If you run a custom stack, the read-only connector is a straightforward webhook integration.",
    },
    {
      q: "Will the widget slow my store down?",
      a: "No. The Elpino widget is under 20KB, loads asynchronously, and is mobile-optimized — it won't hurt your Core Web Vitals or Lighthouse scores, which matters for ad-driven traffic where every millisecond of load time costs conversions.",
    },
    {
      q: "Can it handle Black Friday level traffic?",
      a: "Yes. Elpino answers in parallel, not in queues — thousands of conversations can be verified and resolved simultaneously. That's the point: peak-season surges stop being a hiring problem and become a non-event.",
    },
    {
      q: "Does it work across languages for international shoppers?",
      a: "Yes — Elpino supports 95+ languages with accurate product and shipping terminology, so your returns policy reads the same in Berlin as it does in Brooklyn.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c] antialiased selection:bg-[#7651b0]/20 selection:text-[#7651b0]">
      {/* 1. Hero */}
      <section className="relative overflow-hidden border-b border-black/5 bg-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div aria-hidden="true" className="absolute -right-40 top-0 size-[36rem] rounded-full bg-[#e4d8f3]/50 blur-3xl" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7651b0]/20 bg-[#7651b0]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
                <Sparkles size={13} />
                Elpino for E-Commerce · WISMO, returns & pre-purchase care
              </span>
            </div>
          </Reveal>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <div>
                <h1 className="text-[clamp(2.75rem,5.5vw,5.2rem)] font-medium leading-[0.96] tracking-[-0.04em] text-[#17181c]">
                  Turn shopper questions into orders{" "}
                  <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#7651b0]">before they browse away.</span>
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-relaxed text-black/65 sm:text-xl">
                  Resolve order tracking, returns, sizing, and checkout doubts instantly across
                  Shopify, WooCommerce, and custom stores — with verified order data and your
                  exact policies, 24/7 in 95+ languages.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-[#17181c] px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#7651b0] hover:text-white"
                  >
                    Start free for e-commerce
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-base font-medium text-[#17181c] transition hover:bg-black/5"
                  >
                    Book a live demo
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-black/10 pt-6 text-xs text-black/50 sm:text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-black/80">
                    <Check size={16} className="text-[#18c983]" /> Shopify & WooCommerce ready
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-black/80">
                    <Check size={16} className="text-[#18c983]" /> &lt;20KB widget, zero LCP impact
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-black/80">
                    <Check size={16} className="text-[#18c983]" /> Approval-first refunds
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Hero mock conversation with perched sloth */}
            <Reveal delay={0.1}>
              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="pointer-events-none absolute -top-24 -right-6 z-20 w-44 drop-shadow-2xl sm:w-52">
                  <Image
                    src="/images/busy-teams-sloth-v2.png"
                    alt="Elpino's e-commerce sloth managing a stack of shopper orders"
                    width={1145}
                    height={1374}
                    priority
                    className="h-auto w-full object-contain"
                  />
                </div>

                <div className="absolute -top-4 -left-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#7651b0]/15 text-[#7651b0]">
                    <TrendingUp size={15} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-black">WISMO down 85%</div>
                    <div className="text-[10px] text-black/50">Sub-second order lookups</div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-red-400" />
                      <span className="size-3 rounded-full bg-amber-400" />
                      <span className="size-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 font-mono text-xs font-semibold text-black/60">
                        elpino-commerce // shopper-session
                      </span>
                    </div>
                    <span className="rounded-full bg-[#7651b0]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#7651b0]">
                      ● Order #48291 Verified
                    </span>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f1f2ef] p-3.5 text-xs leading-relaxed text-black/80">
                      &quot;Hi! Where&apos;s my linen shirt? Order #48291 — I need it before Friday.&quot;
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-medium text-[#7651b0]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#7651b0]/15">✦</span>
                      <span>Elpino verified: Maya K. · Order #48291 · DHL in transit</span>
                    </div>

                    <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#17181c] p-3.5 text-xs leading-relaxed text-white">
                      Good news — it&apos;s out for delivery and arrives <strong>Thursday before 6 PM</strong>,
                      a day early. I&apos;ve sent the live tracking link to your email. Anything else on this order?
                    </div>

                    <div className="ml-auto w-[88%] rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <PackageCheck size={13} /> DHL · Out for delivery
                        </span>
                        <span className="rounded bg-emerald-200/60 px-1.5 py-0.5 text-[9px]">
                          Arrives Thu, Dec 18
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className="cursor-pointer rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] font-medium text-black hover:border-black">
                          Email tracking link
                        </span>
                        <span className="cursor-pointer rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] font-medium text-black hover:border-black">
                          Change delivery day
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/50">
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <Check size={12} /> Shopper verified · Shopify order matched
                    </span>
                    <span className="font-semibold text-black">Resolved in 0.98s · No agent needed</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 z-20 hidden rounded-xl border border-black/10 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-3">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-black">Policy-exact answers</div>
                    <div className="text-[10px] text-black/50">Your return rules, enforced</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. Stats */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">
                The post-purchase plateau
              </span>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                Shoppers don&apos;t wait. They just don&apos;t come back.
              </h2>
              <p className="mt-4 text-base text-black/65 sm:text-lg">
                Most support tickets in e-commerce are the same handful of questions — and every
                hour a shopper waits for tracking info, the odds of a chargeback or a lost
                repeat purchase climb.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <Reveal key={idx} delay={idx * 0.06}>
                <div className="group relative h-full rounded-2xl border border-black/10 bg-[#faf9f6] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#7651b0]/40 hover:bg-white hover:shadow-lg">
                  <div className="text-4xl font-semibold tracking-tight text-[#7651b0] sm:text-5xl">
                    {stat.value}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-black/70 sm:text-base">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pillars */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="text-center">
              <span className="inline-block rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black/70">
                The modern storefront experience
              </span>
              <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-tight tracking-[-0.035em] text-[#17181c]">
                Instant answers. Fewer refunds. More orders.
              </h2>
            </div>
          </Reveal>

          <div className="mt-20 space-y-24 sm:space-y-32">
            {pillars.map((pillar, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={pillar.title}
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${isEven ? "lg:grid-flow-dense" : ""}`}
                >
                  <Reveal className={isEven ? "lg:col-start-2" : ""}>
                    <div>
                      <span className="inline-block rounded-full bg-[#7651b0]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
                        {pillar.tag}
                      </span>

                      <h3 className="mt-4 text-3xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.65rem]">
                        {pillar.title}
                      </h3>

                      <p className="mt-6 text-base leading-relaxed text-black/70 sm:text-lg">
                        {pillar.description}
                      </p>

                      <div className="mt-8 space-y-3.5">
                        {pillar.bulletPoints.map((point) => (
                          <div key={point} className="flex items-start gap-3">
                            <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e7ddf3] text-[#7651b0]">
                              <Check size={13} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-black/80 sm:text-base">{point}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                        <div className="text-2xl font-bold text-[#7651b0]">{pillar.statHighlight.number}</div>
                        <div className="text-xs text-black/60 sm:text-sm">{pillar.statHighlight.text}</div>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.08} className={isEven ? "lg:col-start-1" : ""}>
                    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
                      <div className="flex items-center justify-between border-b border-black/10 pb-4">
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">
                          {pillar.badge}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">● Live Storefront</span>
                      </div>

                      <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
                        <div className="relative w-48 drop-shadow-md sm:w-56">
                          <Image
                            src={pillar.image}
                            alt={pillar.tag}
                            width={500}
                            height={500}
                            className="h-auto w-full object-contain"
                          />
                        </div>
                        <div className="mt-6 w-full rounded-2xl border border-black/10 bg-[#faf9f6] p-4 text-left">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#7651b0]">
                            <Sparkles size={14} /> Storefront Intelligence
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-black/70">
                            Every answer is grounded in live order data and your published policies —
                            so shoppers trust it, and your team doesn&apos;t have to double-check it.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive workflow demo */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">
                Interactive walkthrough
              </span>
              <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
                See a shopper session, end to end
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-black/65 sm:text-lg">
                Click through the moments that decide e-commerce outcomes — lookup, returns,
                advice, and recovery.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveTab(idx)}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-all ${
                    isActive
                      ? "border-[#7651b0] bg-[#7651b0]/5 shadow-md"
                      : "border-black/10 bg-[#faf9f6] hover:border-black/25 hover:bg-white"
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-[#7651b0]" : "text-black/40"}`}>
                    Step 0{idx + 1}
                  </span>
                  <span className="mt-2 text-base font-medium text-black">{step.title}</span>
                  <span className="mt-1 text-xs text-black/55">{step.subtitle}</span>
                </button>
              );
            })}
          </div>

          <Reveal>
            <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-[#17181c] p-6 text-white shadow-2xl sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#7651b0] text-xs font-bold text-white">
                    0{activeTab + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-white">{workflowSteps[activeTab].title}</h4>
                    <p className="text-xs text-white/50">{workflowSteps[activeTab].subtitle}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                  {workflowSteps[activeTab].content.status}
                </span>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/40">Shopper message</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/90">
                    &quot;{workflowSteps[activeTab].content.userQuery}&quot;
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#d9bef4]">
                    <ScanSearch size={14} />
                    <span>{workflowSteps[activeTab].content.source}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Elpino real-time response
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-200">
                    {workflowSteps[activeTab].content.aiResponse}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Response latency: under 1.2s</span>
                    <span className="text-emerald-400">Order data verified · Policy enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Specialized agents grid */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">
                Modular commerce intelligence
              </span>
              <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-medium tracking-[-0.035em] text-[#17181c]">
                Specialized agents for every step of the shopper journey.
              </h2>
              <p className="mt-4 text-base text-black/65 sm:text-lg">
                Track orders, enforce returns, advise on sizing, watch inventory, rescue carts,
                and guard against fraud — each agent does one job precisely.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <Reveal key={agent.name} delay={Math.min(index * 0.05, 0.25)}>
                  <div className="group relative h-full rounded-2xl border border-black/10 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[#7651b0]/40 hover:shadow-xl">
                    <div className={`inline-flex size-12 items-center justify-center rounded-xl ${agent.accent}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-black">{agent.name}</h3>
                    <div className="mt-1 text-xs font-medium text-black/50">{agent.role}</div>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">{agent.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Testimonial */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#7651b0]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7651b0]">
              DTC Brand Spotlight
            </div>

            <blockquote className="mt-8 text-2xl font-normal leading-relaxed tracking-tight text-[#17181c] sm:text-3xl lg:text-4xl">
              &quot;We used to hire five seasonal agents every December. Last Black Friday we ran
              the entire weekend with zero queue — and our CSAT went{" "}
              <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#7651b0]">up</span>.
              WISMO tickets simply stopped existing.&quot;
            </blockquote>

            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              <div className="font-semibold text-black">Sofia Marchetti</div>
              <div className="text-sm text-black/50">Head of Customer Experience at Arden & Oak ($12M DTC brand)</div>
              <div className="mt-2 rounded-full border border-black/10 bg-[#faf9f6] px-4 py-1 text-xs font-medium text-emerald-700">
                ✓ 85% of tickets automated · 4.9★ CSAT through peak season
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7651b0]">
                Frequently asked questions
              </span>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                Everything merchants ask before going live.
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

      {/* 8. Closing banner */}
      <section className="relative mx-auto w-full max-w-[1568px] overflow-hidden bg-black py-28 text-white sm:py-36 2xl:rounded-t-3xl">
        <div aria-hidden="true" className="absolute -left-32 bottom-0 size-[30rem] rounded-full bg-[#7651b0]/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 top-0 size-[26rem] rounded-full bg-[#18c983]/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Peak season is coming
          </span>

          <h2 className="mt-8 text-[clamp(2.75rem,5.5vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em] text-white">
            This holiday, let the sloth <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#d9bef4]">handle the queue.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-xl">
            Start free and connect your store in minutes — order lookups, returns, and
            pre-purchase answers from day one. No credit card required.
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
