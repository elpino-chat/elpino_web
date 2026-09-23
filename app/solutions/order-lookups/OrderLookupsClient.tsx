"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  Package,
  Truck,
  Search,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  QrCode,
  Lock,
  Layers,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  Send,
  Boxes,
} from "lucide-react";

export function OrderLookupsClient() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [orderQuery, setOrderQuery] = useState("ORD-98421");
  const [simulatorState, setSimulatorState] = useState<"lookup" | "address_change" | "returns">("lookup");
  const [addressUpdated, setAddressUpdated] = useState(false);
  const [newStreet, setNewStreet] = useState("742 Evergreen Terrace, Apt 4B");

  const stats = [
    {
      value: "68%",
      label: "WISMO inquiries deflected autonomously",
      detail: "\"Where is my order?\" tickets answered within 1.2s without agent effort",
    },
    {
      value: "1.2s",
      label: "Average courier API lookup latency",
      detail: "Direct webhooks to FedEx, UPS, DHL, USPS, and Shopify Plus",
    },
    {
      value: "4.9/5",
      label: "Customer satisfaction rating",
      detail: "Zero repetitive typing with instant carrier ETA and map visualizer",
    },
    {
      value: "92%",
      label: "Pre-dispatch address changes saved",
      detail: "Automated address sanitation preventing costly courier return-to-sender fees",
    },
  ];

  const pillars = [
    {
      icon: Truck,
      title: "Real-time carrier synchronization across 40+ shipping networks",
      tag: "Live Telemetry",
      badge: "Carrier APIs",
      description:
        "Elpino connects directly to FedEx, UPS, DHL, USPS, Australia Post, and Royal Mail. Instead of giving a generic tracking link, the AI parses exact milestone scans, weather exceptions, customs clearances, and predictive delivery windows directly in the chat.",
      points: [
        "Instant transit milestone decoding (\"Departed sorting hub, Nashville TN\")",
        "Predictive delivery timeframes powered by machine learning carrier telemetry",
        "Automated exception flagging: delivery attempts, signature required, weather delays",
        "Native deep-links to carrier signature cards and parcel hold facilities",
      ],
      metric: "1.2s",
      metricLabel: "Average lookup latency",
    },
    {
      icon: ShieldCheck,
      title: "Zero-trust customer verification before sharing PII",
      tag: "Fraud Prevention",
      badge: "Security & Privacy",
      description:
        "Protecting customer privacy is paramount. Elpino never exposes delivery addresses or billing details to unverified visitors. Built-in SMS OTP, signed server tokens, or magic links authenticate shoppers before displaying protected parcel destinations.",
      points: [
        "Cryptographic HMAC verification with Shopify, WooCommerce & custom WMS",
        "Instant 6-digit SMS / Email OTP verification for unauthenticated guest checkouts",
        "PII redaction engine masks card numbers, full names, and sensitive addresses",
        "Audit log exports tracking every customer data query for SOC 2 compliance",
      ],
      metric: "100%",
      metricLabel: "PII protection audit score",
    },
    {
      icon: RotateCcw,
      title: "Self-service address changes & frictionless returns",
      tag: "Operational Automation",
      badge: "Self-Service",
      description:
        "Empower shoppers to modify delivery addresses prior to warehouse pick-and-pack, or generate instant pre-paid QR code return labels according to your exact warranty and refund policies.",
      points: [
        "Warehouse fulfillment lock check before editing order shipping records",
        "Automated USPS/Google Maps address validation and normalization",
        "Instant return label and drop-off QR code generation (Happy Returns, Narvar, ShipStation)",
        "Automated restocking fee calculations and store credit voucher issuance",
      ],
      metric: "92%",
      metricLabel: "Misdelivery avoidance rate",
    },
    {
      icon: ShoppingBag,
      title: "Deep bi-directional sync with Shopify, CommerceLayer & WMS",
      tag: "Commerce Core",
      badge: "Native Integrations",
      description:
        "Connect your commerce engine in under 3 minutes. Elpino integrates natively with Shopify Plus, BigCommerce, Adobe Commerce (Magento), Stripe Billing, and custom warehouse management systems (ShipHero, Manhattan Associates).",
      points: [
        "Real-time order line-item status: backordered, split shipments, pre-orders",
        "Cross-sell and replacement recommendations for out-of-stock items",
        "Direct webhook triggers notifying customer care when orders encounter customs delays",
        "Custom field support for personalized engraving, gift notes, and batch numbers",
      ],
      metric: "3 min",
      metricLabel: "Zero-code connector setup",
    },
  ];

  const faqs = [
    {
      q: "How does Elpino handle unauthenticated shoppers asking about orders?",
      a: "Elpino uses intelligent verification triggers. If a visitor asks 'Where is order #89201?', Elpino checks if they are logged in via JWT or server-signed session. If not, Elpino immediately asks for the email or phone number tied to the order and sends a single-use 6-digit verification code or magic link before displaying any shipping or billing data.",
    },
    {
      q: "Can Elpino prevent customers from changing addresses if the order has already shipped?",
      a: "Yes. Elpino queries your fulfillment state (e.g. Shopify fulfillment_status, ShipHero wave status) in real time. If the parcel is still 'Unfulfilled' or 'Open', the address change is accepted, sanitized, and updated directly via API. If it is already marked 'Fulfilled' or 'In Transit', Elpino politely explains the package is locked with the courier and provides carrier parcel re-route options.",
    },
    {
      q: "Which e-commerce platforms and carriers are supported out of the box?",
      a: "Elpino provides one-click connectors for Shopify, Shopify Plus, BigCommerce, WooCommerce, Magento 2, CommerceLayer, and Stripe. Carrier telemetry connects to FedEx, UPS, DHL Express, USPS, Royal Mail, Canada Post, Australia Post, Hermes/Evri, and ShipEngine with zero extra middleware.",
    },
    {
      q: "What happens when a customer claims their package was marked delivered but isn't there?",
      a: "Elpino triggers a guided 'Porch Piracy & Delivery Exception' workflow: it retrieves carrier delivery GPS coordinates and delivery photo proof if available, asks the customer to confirm hidden drop-off spots, and if unresolved, immediately initiates a courier claim and hands the case to a tier-2 human specialist with full context pre-filled.",
    },
    {
      q: "Does Elpino support split shipments and partial fulfillments?",
      a: "Yes. When an order contains multiple tracking numbers (e.g. one item shipped from California, another backordered item from Ohio), Elpino breaks down each item individually with respective carrier status, expected arrival dates, and tracking links.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#faf9f6] font-[family-name:var(--font-rethink-sans)] text-[#17181c]">
      {/* Hero Section */}
      <section className="relative border-b border-black/10 bg-white px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(66,140,229,0.07),transparent_35rem),radial-gradient(circle_at_85%_75%,rgba(255,86,0,0.06),transparent_35rem)]"
        />
        <div className="relative mx-auto max-w-[1360px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#428ce5]/20 bg-[#428ce5]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3569ad]">
                <Truck size={14} className="text-[#3569ad]" />
                Automated E-Commerce & WISMO Resolution
              </div>
              <h1 className="mt-6 text-balance text-4xl font-normal leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Every order question answered in{" "}
                <span className="text-[#3569ad]">1.2 seconds</span> flat.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#53616b] sm:text-xl">
                Free your support team from the relentless tidal wave of &ldquo;Where is my order?&rdquo; tickets.
                Elpino securely connects to your store and shipping couriers to deliver live tracking, automated address updates,
                and self-service returns right in chat.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#17181c] px-7 text-sm font-semibold text-white transition hover:bg-[#3569ad]"
                >
                  Start free trial <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#f1edf7]"
                >
                  Book commerce demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#53616b]">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Shopify Plus & WooCommerce native
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> FedEx, UPS, DHL, USPS live sync
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-[#18c983]" /> Zero customer password friction
                </span>
              </div>
            </div>

            {/* Hero Mascot & Live Preview */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#f4effb] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#17181c] text-white">
                      <Package size={14} />
                    </span>
                    <span className="text-xs font-semibold tracking-wide">Elpino Commerce Radar</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18c983]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#168a5b]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#18c983]" />
                    Live Courier Webhook
                  </span>
                </div>

                <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                  <div className="relative h-64 w-52 shrink-0">
                    <Image
                      src="/images/revenue-sloth-v2.png"
                      alt="Elpino commerce specialist sloth monitoring order fulfillments"
                      width={1145}
                      height={1374}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 w-full space-y-3 sm:mt-0">
                    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-[#53616b]">
                        <span className="font-semibold text-[#17181c]">Order #98421</span>
                        <span>Shopify Plus</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#18c983]">Out for Delivery • ETA Today 2:30 PM</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#53616b]">
                        <Truck size={13} className="text-[#3569ad]" />
                        <span>FedEx Ground (#9400111899223)</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#428ce5]/20 bg-[#edf3fa] p-3.5 text-xs text-[#3569ad]">
                      <span className="font-semibold">AI Auto-Resolution:</span> Customer confirmed package delivered to back porch safe box. Ticket closed with 5★ rating.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-black/10 bg-[#17181c] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
            Proven Commerce Impact at Scale
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="border-l-2 border-[#428ce5] pl-6">
                <p className="text-4xl font-normal tracking-tight text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{stat.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Simulator: Order Intelligence Console */}
      <section className="border-b border-black/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f4effb] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7651b0]">
              <Sparkles size={13} />
              Interactive Commerce Console
            </span>
            <h2 className="mt-5 text-balance text-3xl font-normal tracking-[-0.055em] sm:text-5xl">
              Experience the self-service flow your customers will love.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Test how Elpino handles real-time carrier lookup, automated address updates prior to fulfillment,
              and frictionless return label generation.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-black/10 bg-[#fbfbfa] p-5 shadow-xl sm:p-8 lg:p-10">
            {/* Simulator Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-b border-black/10 pb-6">
              <button
                onClick={() => {
                  setSimulatorState("lookup");
                  setAddressUpdated(false);
                }}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simulatorState === "lookup"
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <Truck size={15} /> 1. Live Parcel Tracking (WISMO)
              </button>
              <button
                onClick={() => setSimulatorState("address_change")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simulatorState === "address_change"
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <MapPin size={15} /> 2. Pre-Dispatch Address Modification
              </button>
              <button
                onClick={() => setSimulatorState("returns")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  simulatorState === "returns"
                    ? "bg-[#17181c] text-white shadow-md"
                    : "bg-white text-[#53616b] hover:bg-[#f1edf7]"
                }`}
              >
                <RotateCcw size={15} /> 3. One-Click Returns & QR Code
              </button>
            </div>

            {/* Simulator Interactive Body */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: Chat Interaction view */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 pb-3 text-xs text-[#53616b]">
                  <span className="font-semibold text-[#17181c]">Customer Live Session</span>
                  <span className="flex items-center gap-1.5 text-[#18c983]">
                    <span className="size-2 rounded-full bg-[#18c983]" />
                    Authenticated via Phone OTP (***-**-8201)
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Customer message */}
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#17181c] p-4 text-xs leading-relaxed text-white">
                      {simulatorState === "lookup" && "Hi! Where is my package for order #ORD-98421? Ordered 2 days ago."}
                      {simulatorState === "address_change" && "I accidentally typed the wrong apartment number on order #ORD-98421! Can I change it to Apt 4B?"}
                      {simulatorState === "returns" && "The jacket in #ORD-98421 is too small. How do I exchange it for a Large?"}
                    </div>
                  </div>

                  {/* Elpino AI Response */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#7651b0] text-xs font-bold text-white">
                      E
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#7651b0]/20 bg-[#f4effb] p-4 text-xs leading-relaxed text-[#17181c]">
                      {simulatorState === "lookup" && (
                        <div>
                          <p className="font-semibold text-[#7651b0]">Order #ORD-98421 is currently Out for Delivery!</p>
                          <p className="mt-2 text-[#53616b]">
                            FedEx Ground has scanned your parcel onto local delivery van 48 in Austin, TX.
                            The estimated drop-off window is <strong>today between 1:45 PM and 3:15 PM</strong>.
                          </p>
                          <div className="mt-3 rounded-lg border border-black/10 bg-white p-3">
                            <p className="font-semibold">Items in shipment:</p>
                            <p className="text-[#53616b]">• Alpine Weatherproof Parka (Navy / M) × 1</p>
                            <p className="text-[#53616b]">• Merino Wool Beanie (Slate) × 1</p>
                            <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] font-medium text-[#3569ad]">
                              <span>Tracking: 9400 1118 9922 3481 02</span>
                              <span>Signed for: Not required</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {simulatorState === "address_change" && (
                        <div>
                          <p className="font-semibold text-[#168a5b]">
                            {addressUpdated
                              ? "✓ Shipping address successfully updated in Shopify & Warehouse WMS!"
                              : "Great news! Your order has not been dispatched yet."}
                          </p>
                          <p className="mt-2 text-[#53616b]">
                            {addressUpdated
                              ? `We confirmed with Austin Fulfillment Hub. Your parcel will ship to: ${newStreet}.`
                              : "Our warehouse wave status is 'Awaiting Pack'. I can update your apartment number right now without cancelling your order."}
                          </p>
                          {!addressUpdated ? (
                            <div className="mt-3 rounded-xl border border-black/10 bg-white p-3.5">
                              <p className="text-[11px] font-bold uppercase text-[#53616b]">Confirm Desired Address:</p>
                              <input
                                type="text"
                                value={newStreet}
                                onChange={(e) => setNewStreet(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-xs font-medium focus:border-[#7651b0] focus:outline-none"
                              />
                              <button
                                onClick={() => setAddressUpdated(true)}
                                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#168a5b] py-2 text-xs font-semibold text-white transition hover:bg-[#13744c]"
                              >
                                <Check size={14} /> Update Shipping Address via API
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 rounded-lg bg-[#e8f6ed] p-3 text-[11px] font-medium text-[#168a5b]">
                              Status: Updated on courier manifest. Warehouse pick ticket re-printed.
                            </div>
                          )}
                        </div>
                      )}

                      {simulatorState === "returns" && (
                        <div>
                          <p className="font-semibold text-[#7651b0]">Exchange Approved for Alpine Weatherproof Parka</p>
                          <p className="mt-2 text-[#53616b]">
                            We have reserved size Large in Navy for you. You don&rsquo;t even need a printer—just take the QR code below to any FedEx or Happy Returns bar.
                          </p>
                          <div className="mt-3 flex items-center gap-4 rounded-xl border border-black/10 bg-white p-3.5">
                            <div className="grid size-16 place-items-center rounded-lg bg-[#17181c] text-white">
                              <QrCode size={36} />
                            </div>
                            <div className="text-[11px]">
                              <p className="font-bold text-[#17181c]">Return Auth: #RMA-89201</p>
                              <p className="text-[#53616b]">Pre-paid return valid for 14 days</p>
                              <p className="font-medium text-[#3569ad]">3,200 drop-off locations nearby</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Courier & Store Telemetry Behind the Scenes */}
              <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#17181c] p-6 text-white shadow-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-[#d9bef4]">Under the Hood: Commerce Engine</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70">
                      HTTP 200 OK (84ms)
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 font-mono text-xs">
                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// Shopify Plus Order Payload</span>
                      <p className="mt-1 text-[#18c983]">order_id: &quot;ORD-98421&quot;</p>
                      <p className="text-white/70">fulfillment_status: &quot;partial_in_transit&quot;</p>
                      <p className="text-white/70">customer_tier: &quot;VIP_Repeat_Buyer&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// Carrier Webhook (FedEx Direct)</span>
                      <p className="mt-1 text-[#428ce5]">carrier_code: &quot;FEDEX_GROUND&quot;</p>
                      <p className="text-white/70">last_checkpoint: &quot;AUSTIN_TX_DISTRIBUTION&quot;</p>
                      <p className="text-white/70">delivery_exception: false</p>
                      <p className="text-white/70">est_delivery: &quot;2026-09-24T15:15:00Z&quot;</p>
                    </div>

                    <div className="rounded-lg bg-white/5 p-3">
                      <span className="text-white/40">// AI Safety & Privacy Guardrail</span>
                      <p className="mt-1 text-[#d9bef4]">pii_masking: ACTIVE</p>
                      <p className="text-white/70">fraud_risk_score: 0.02 (Low)</p>
                      <p className="text-white/70">escalation_required: FALSE</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
                  <span className="font-semibold text-white">Impact:</span> Customer resolved question in 18 seconds without tying up a human support rep.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Architectural Pillars */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#3569ad]">
              Enterprise Capabilities
            </span>
            <h2 className="mt-4 text-4xl font-normal tracking-[-0.055em] sm:text-5xl">
              Engineered for high-volume commerce brands.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#53616b] sm:text-lg">
              Whether you ship 500 parcels a month or 250,000 during Black Friday peak,
              Elpino scales dynamically without dropping a single customer conversation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-7 shadow-sm transition hover:shadow-md sm:p-9"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#edf3fa] text-[#3569ad]">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-black/10 bg-[#fbfbfa] px-3 py-1 text-xs font-semibold text-[#53616b]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-normal tracking-[-0.04em] text-[#17181c]">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#53616b]">
                      {pillar.description}
                    </p>

                    <div className="mt-6 space-y-2.5 border-t border-black/5 pt-5">
                      {pillar.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-[#53616b]">
                          <Check size={14} className="mt-0.5 shrink-0 text-[#18c983]" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="text-xs font-medium text-[#53616b]">{pillar.metricLabel}</span>
                    <span className="text-xl font-bold tracking-tight text-[#3569ad]">{pillar.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Logos / Ecosystem Banner */}
      <section className="border-b border-black/10 bg-white py-16">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-16">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#53616b]">
            Plug-and-play integrations with your fulfillment stack
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              "Shopify Plus",
              "FedEx",
              "UPS",
              "DHL Express",
              "USPS",
              "WooCommerce",
              "BigCommerce",
              "ShipStation",
              "Happy Returns",
              "Narvar",
              "Stripe Invoicing",
            ].map((partner) => (
              <span
                key={partner}
                className="rounded-full border border-black/10 bg-[#fbfbfa] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#17181c] shadow-xs"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive FAQs */}
      <section className="border-b border-black/10 bg-[#faf9f6] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7651b0]">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] sm:text-5xl">
              Everything you need to know about automated order lookups.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 transition hover:bg-[#fbfbfa]">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="text-base font-semibold text-[#17181c]">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-[#53616b] transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-[#7651b0]" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm leading-relaxed text-[#53616b]">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-[#17181c] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bef4]">
                Ready to cut support volume by 68%?
              </span>
              <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Start delivering instantaneous order clarity today.
              </h2>
              <p className="mt-5 max-w-xl text-base text-white/65">
                Set up your Shopify or carrier connector in less than 3 minutes.
                No code required, zero risk, 14-day free trial.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-13 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#17181c] transition hover:bg-[#d9bef4]"
              >
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center rounded-full border border-white/20 bg-transparent px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Talk to commerce expert
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
