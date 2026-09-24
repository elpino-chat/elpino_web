"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, Clock, Mail } from "lucide-react";

// The Terms of Service as a deal between two parties. Top: the five things
// that matter most, as flip cards. Middle: what you get and what we ask. Then
// the full text, clause by clause, exactly as written. Same visual language as
// the header menu, the pricing page and the privacy page.

const EFFECTIVE = "July 3, 2026";
const CONTACT = "hello@elpino.chat";

type Clause = { id: string; title: string; body: ReactNode };

const CLAUSES: Clause[] = [
        {
          id: "the-service",
          title: "The Service",
          body: (
            <>
              <p>
                Elpino is customer support, made simple. Install a chat widget or connect your
                support inbox, and Elpino&apos;s AI answers your customers instantly using your
                knowledge base and past conversations.
              </p>
              <p>
                <strong>Human when it matters.</strong> When the AI can&apos;t confidently resolve
                a conversation, it hands off to a real member of your team instead of guessing.
                You choose how and when that handoff happens, and you can always jump into any
                conversation yourself.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts & Eligibility",
          body: (
            <>
              <p>
                You must be at least 18 years old and able to form a binding contract to use the
                Service. You agree to provide accurate account information and to keep it current.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activity
                that occurs under your account, including messages sent by teammates you invite to
                your workspace. Notify us immediately at{" "}
                <a href="mailto:hello@elpino.chat">hello@elpino.chat</a> if you suspect
                unauthorized access.
              </p>
            </>
          ),
        },
        {
          id: "subscriptions",
          title: "Subscriptions & Billing",
          body: (
            <>
              <p>
                New accounts start on the Free plan, which has no time limit and needs no payment
                method. Paid plans add a monthly AI credit, seats, and knowledge base capacity;
                you can move to a paid plan, or back to Free, at any time.
              </p>
              <ul>
                <li>
                  <strong>Billing.</strong> Paid plans are billed in advance on a recurring basis
                  through our payment processor, Razorpay. By subscribing you authorize recurring
                  charges until you cancel.
                </li>
                <li>
                  <strong>Cancellation.</strong> You can cancel anytime from the dashboard.
                  Cancellation takes effect at the end of the current billing period; you keep
                  access until then.
                </li>
                <li>
                  <strong>Refunds.</strong> Except where required by law, payments are
                  non-refundable. If you believe you were charged in error, contact us and
                  we&apos;ll make it right.
                </li>
                <li>
                  <strong>Price changes.</strong> We may change plan pricing with at least 30
                  days&apos; notice; changes apply from your next billing cycle.
                </li>
                <li>
                  <strong>Fair use.</strong> Each plan includes a monthly allowance of AI-resolved
                  conversations. If you exceed it, the Service may reduce or pause AI auto-replies
                  until the next cycle, or route conversations to your team instead.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          body: (
            <>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>violate any law, or infringe anyone&apos;s rights;</li>
                <li>send spam, phishing, or otherwise deceptive or harmful communications;</li>
                <li>
                  probe, disrupt, or gain unauthorized access to the Service or anyone else&apos;s
                  data;
                </li>
                <li>
                  resell, sublicense, or provide the Service to third parties without our written
                  consent;
                </li>
                <li>
                  reverse-engineer the Service or use it to build a directly competing product.
                </li>
              </ul>
              <p>
                We may suspend or terminate accounts that violate these rules, with notice where
                practicable.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Third-Party Services & Integrations",
          body: (
            <>
              <p>
                The Service works by connecting to third-party services you authorize (for example
                Google, Slack, Stripe, or Razorpay) and by embedding a chat widget on your own
                website or app. Your use of those services is governed by their own terms and
                privacy policies. You can revoke Elpino&apos;s access at any time from the dashboard
                or from the third party&apos;s own security settings.
              </p>
              <p>
                We are not responsible for the availability or behavior of third-party services,
                and an outage or change on their side may limit what Elpino can do.
              </p>
            </>
          ),
        },
        {
          id: "ai-disclaimer",
          title: "AI Outputs & Human Handoff",
          body: (
            <>
              <p>
                Elpino uses large language models to answer, summarize, and draft replies to your
                customers. <strong>AI outputs can be wrong.</strong> Answers may omit context,
                drafts may contain errors, and the AI may occasionally be confidently incorrect.
                The Service is a support aid — not a substitute for human judgment, and not legal,
                financial, or professional advice.
              </p>
              <p>
                Elpino is designed to hand off to a human teammate when the AI is uncertain or a
                customer asks for one, but no handoff system is perfect. You are responsible for
                reviewing AI-handled conversations and for configuring handoff rules that fit your
                business.
              </p>
            </>
          ),
        },
        {
          id: "your-content",
          title: "Your Content & Our IP",
          body: (
            <>
              <p>
                <strong>Your content stays yours.</strong> You retain all rights to your customer
                conversations, knowledge base articles, and business data the Service processes on
                your behalf. You grant us a limited license to process that content solely to
                operate the Service for you. We do not use your content to train AI models.
              </p>
              <p>
                The Service itself — including its software, design, and branding — is owned by
                Elpino and protected by intellectual-property laws. These Terms don&apos;t grant you
                any rights to it beyond the right to use the Service.
              </p>
            </>
          ),
        },
        {
          id: "privacy",
          title: "Privacy",
          body: (
            <p>
              How we collect, use, and protect your data is described in our{" "}
              <a href="/privacy">Privacy Policy</a>, which forms part of these Terms.
            </p>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          body: (
            <>
              <p>
                You may stop using the Service and delete your account at any time. We may suspend
                or terminate your access if you materially breach these Terms, if required by law,
                or if we discontinue the Service (with reasonable advance notice where possible).
              </p>
              <p>
                On termination, your right to use the Service ends and we will delete or anonymize
                your data as described in the Privacy Policy.
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers & Limitation of Liability",
          body: (
            <>
              <p>
                The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
                <strong>&ldquo;as available&rdquo;</strong>, without warranties of any kind, express
                or implied — including fitness for a particular purpose, non-infringement, and
                uninterrupted or error-free operation.
              </p>
              <p>
                To the maximum extent permitted by law, Elpino will not be liable for indirect,
                incidental, special, consequential, or punitive damages, or for lost profits, data,
                or business opportunities. Our total liability for any claim relating to the
                Service is limited to the amount you paid us in the twelve months before the event
                giving rise to the claim.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to These Terms",
          body: (
            <p>
              We may update these Terms as the Service evolves. If a change is material, we will
              notify you by email or in the product at least 14 days before it takes effect.
              Continuing to use the Service after a change takes effect means you accept the
              updated Terms.
            </p>
          ),
        },
        {
          id: "governing-law",
          title: "Governing Law & Contact",
          body: (
            <>
              <p>
                These Terms are governed by the laws of India, and any dispute will be subject to
                the exclusive jurisdiction of the courts located in India, unless the law of your
                place of residence requires otherwise.
              </p>
              <p>
                Contact: <a href="mailto:hello@elpino.chat">hello@elpino.chat</a>
              </p>
            </>
          ),
        },
      ];

const INTRO = (
  <p>
    These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Elpino — the
    website at elpino.chat, the Elpino dashboard, the Elpino chat widget, and any related
    services (together, the &ldquo;Service&rdquo;). By creating an account or using the
    Service, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the
    Service.
  </p>
);

// The five that matter most. Every line restates the clause it links to.
const KEY_POINTS = [
  { front: "Free stays free", color: "#3784ff", ink: false, back: "New accounts start on the Free plan. It has no time limit and needs no payment method.", clause: "subscriptions", ref: "Subscriptions & Billing" },
  { front: "Cancel any time", color: "#ffd84d", ink: true, back: "Cancellation takes effect at the end of the current billing period, and you keep access until then.", clause: "subscriptions", ref: "Subscriptions & Billing" },
  { front: "AI can be wrong", color: "#fc7b33", ink: false, back: "AI outputs can be wrong. It's a support aid, not a substitute for human judgment. You're responsible for reviewing AI-handled conversations.", clause: "ai-disclaimer", ref: "AI Outputs & Human Handoff" },
  { front: "Your content stays yours", color: "#7060bd", ink: false, back: "You keep all rights to your conversations, articles and business data. We don't use your content to train AI models.", clause: "your-content", ref: "Your Content & Our IP" },
  { front: "Payments aren't refundable", color: "#1aa37a", ink: false, back: "Except where required by law, payments are non-refundable. If you think you were charged in error, contact us and we'll make it right.", clause: "subscriptions", ref: "Subscriptions & Billing" },
];

const YOU_GET = [
  "A Free plan with no time limit and no card",
  "AI that answers instantly from your knowledge base and past conversations",
  "A handoff to a real teammate when the AI can't confidently resolve a conversation",
  "Your content stays yours, and isn't used to train AI models",
  "The freedom to change plans, or cancel, whenever you like",
  "30 days' notice of any price change, 14 days' notice of any material change to these Terms",
];

const WE_ASK = [
  "Be at least 18 and able to form a binding contract",
  "Give accurate account information and keep it current",
  "Look after your credentials. You're responsible for activity under your account",
  "Use Elpino lawfully: no spam, phishing, probing or reselling",
  "Review AI-handled conversations and set handoff rules that fit your business",
  "Respect the terms of the third-party services you connect",
];

const STICKERS = ["#3784ff", "#ffd84d", "#7060bd", "#fc7b33"];

// ------------------------------------------------------------ parts

// A card that turns over: the plain promise on the front, the clause it comes from on the back.
function FlipCard({ point, index }: { point: (typeof KEY_POINTS)[number]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="group [perspective:1200px]" style={{ animationDelay: `${index * 90}ms` }}>
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={`${point.front}. ${flipped ? "Show the headline" : "Show the details"}`}
        className={`relative block h-[250px] w-full text-left transition-transform duration-700 ease-[cubic-bezier(0.3,1.3,0.5,1)] [transform-style:preserve-3d] md:group-hover:[transform:rotateY(180deg)] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* front */}
        <span className="absolute inset-0 flex flex-col justify-between rounded-[22px] border-2 border-[#11120f] p-5 [backface-visibility:hidden]" style={{ background: point.color, color: point.ink ? "#11120f" : "#fff" }}>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">Point {index + 1} of {KEY_POINTS.length}</span>
          <span className="text-[28px] font-medium leading-[1.05] tracking-[-0.03em]">{point.front}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] opacity-75">Tap or hover to read</span>
        </span>
        {/* back */}
        <span className="absolute inset-0 flex flex-col justify-between rounded-[22px] border-2 border-[#11120f] bg-[#fffdf5] p-5 text-[#11120f] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-[15px] leading-6 text-black/75">{point.back}</span>
          <span className="flex items-center justify-between gap-2 border-t-2 border-dashed border-black/15 pt-3 text-[13px]">
            <span className="font-mono uppercase tracking-[0.06em] text-black/45">{point.ref}</span>
            <a href={`#${point.clause}`} onClick={(event) => event.stopPropagation()} className="shrink-0 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3 py-1 font-semibold transition hover:-translate-y-0.5">Read →</a>
          </span>
        </span>
      </button>
    </div>
  );
}

function List({ items, mark }: { items: string[]; mark: string }) {
  return (
    <ul className="mt-6 space-y-3.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15.5px] leading-6">
          <span className="mt-[3px] flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] bg-white text-[12px] font-bold text-[#11120f]">{mark}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------ page

export function TermsView() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      setShowBar(window.scrollY > 520);
      let active = -1;
      CLAUSES.forEach((clause, index) => {
        const el = document.getElementById(clause.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) active = index;
      });
      setCurrent(active);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <div className="bg-white text-[#11120f]">
      {/* Sticky header for this long page */}
      <div className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] ${showBar ? "translate-y-0" : "-translate-y-full"}`} aria-hidden={!showBar}>
        <div className="border-b-2 border-[#11120f] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1300px] items-center gap-4 px-5 sm:px-8">
            <Link href="/" aria-label="Elpino home" className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="h-8 w-8 rounded-full border-2 border-[#11120f] bg-white object-contain p-0.5" />
              <span className="hidden text-[15px] font-semibold sm:inline">Terms</span>
            </Link>
            <span className="hidden h-5 w-px bg-black/15 sm:block" />
            <p className="min-w-0 flex-1 truncate font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/55">
              {current >= 0 ? `Clause ${current + 1} of ${CLAUSES.length} · ${CLAUSES[current].title}` : "Terms of service"}
            </p>
            <Link href="/privacy" className="hidden rounded-full px-3 py-1.5 text-[13px] text-black/60 transition hover:bg-black/5 md:block">Privacy policy</Link>
            <a href={`mailto:${CONTACT}`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5">
              <Mail size={14} /> <span className="hidden sm:inline">Ask us</span>
            </a>
          </div>
          <div className="h-[3px] bg-black/10"><div className="h-full bg-[#3784ff]" style={{ width: `${progress * 100}%` }} /></div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-16 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Terms of service</p>
          <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal tracking-[-0.045em] sm:text-7xl">
            The deal, <span className="bg-[linear-gradient(transparent_62%,#ffd84d_62%)]">plainly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-base leading-7 text-black/60 sm:text-lg">
            What you get, what we ask in return, and what happens if things go wrong. The five points that matter most come first. Every clause follows in full.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#key-points" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
              The five things to know <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#clauses" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Jump to the full terms</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5"><Clock size={14} /> Effective {EFFECTIVE}</span>
            <span className="rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1.5 font-semibold">{CLAUSES.length} clauses</span>
            <a href={`mailto:${CONTACT}`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5 transition hover:-translate-y-0.5"><Mail size={14} /> {CONTACT}</a>
          </div>
        </div>
      </section>

      {/* Five things to know */}
      <section id="key-points" className="scroll-mt-16 bg-white px-5 pb-20 pt-6 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-[1300px]">
          <div className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">The short version</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">Five things to know <span className="bg-[linear-gradient(transparent_62%,#ffd84d_62%)]">before you start.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">Turn each card over to see what it says and where it comes from. These are summaries: the clauses below are what counts.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {KEY_POINTS.map((point, index) => <FlipCard key={point.front} point={point} index={index} />)}
          </div>
        </div>
      </section>

      {/* You get / We ask */}
      <section className="bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <div className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#fc7b33]">Both sides</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">A fair trade, <span className="bg-[linear-gradient(transparent_62%,#ffd84d_62%)]">written down.</span></h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#3784ff] p-7 text-white transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.4deg] sm:p-9">
              <div aria-hidden="true" className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "20px 20px" }} />
              <div className="relative">
                <span className="inline-block -rotate-2 rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-[#11120f]">You get</span>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.03em]">What Elpino promises you</h3>
                <List items={YOU_GET} mark="✓" />
              </div>
            </article>
            <article className="relative overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#ffd84d] p-7 transition duration-300 hover:-translate-y-1.5 hover:rotate-[0.4deg] sm:p-9">
              <div aria-hidden="true" className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#11120f 1.4px, transparent 1.4px)", backgroundSize: "20px 20px" }} />
              <div className="relative">
                <span className="inline-block rotate-2 rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-bold uppercase tracking-[0.12em]">We ask</span>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.03em]">What we ask of you</h3>
                <List items={WE_ASK} mark="→" />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* The full terms */}
      <section id="clauses" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#3784ff]">The full terms</p>
          <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">Clause by clause.</h2>
          <div className="mt-6 max-w-3xl rounded-2xl border-2 border-[#11120f] bg-[#fff8ec] p-5 text-[15px] leading-7 text-black/70">{INTRO}</div>

          {/* Contents chips */}
          <nav aria-label="Clauses" className="mt-8 flex flex-wrap gap-2">
            {CLAUSES.map((clause, index) => (
              <a key={clause.id} href={`#${clause.id}`} className={`rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13px] transition hover:-translate-y-0.5 ${current === index ? "bg-[#ffd84d] font-semibold" : "bg-white"}`}>
                <span className="mr-1.5 font-mono text-[11px] text-black/45">{String(index + 1).padStart(2, "0")}</span>{clause.title}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-6">
            {CLAUSES.map((clause, index) => (
              <article key={clause.id} id={clause.id} className="scroll-mt-24 rounded-[24px] border-2 border-[#11120f] bg-white">
                <header className="flex items-center gap-4 border-b-2 border-[#11120f] px-6 py-5 sm:px-8">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#11120f] font-mono text-[15px] font-bold" style={{ background: STICKERS[index % STICKERS.length], color: STICKERS[index % STICKERS.length] === "#ffd84d" ? "#11120f" : "#fff" }}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="text-2xl font-medium tracking-[-0.03em] sm:text-[30px]">{clause.title}</h3>
                </header>
                <div className="space-y-4 p-6 text-[15.5px] leading-8 text-black/70 sm:p-8 [&_a]:font-semibold [&_a]:text-[#11120f] [&_a]:underline [&_a]:decoration-[#3784ff] [&_a]:decoration-2 [&_a]:underline-offset-4 [&_li]:relative [&_li]:pl-7 [&_strong]:bg-[linear-gradient(transparent_58%,rgba(255,216,77,0.75)_58%)] [&_strong]:font-semibold [&_strong]:text-[#11120f] [&_ul]:list-none [&_ul]:space-y-3 [&_ul]:pl-0 [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.6rem] [&_ul>li]:before:h-3 [&_ul>li]:before:w-3 [&_ul>li]:before:rounded-[4px] [&_ul>li]:before:border-2 [&_ul>li]:before:border-[#11120f] [&_ul>li]:before:bg-[#3784ff]">
                  {clause.body}
                </div>
              </article>
            ))}
          </div>

          {/* Sign-off */}
          <div className="relative isolate mt-14 overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#7060bd] p-7 text-white sm:p-10">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
            <span aria-hidden="true" className="elpino-stamp absolute right-6 top-6 hidden rotate-[-8deg] rounded-lg border-[3px] border-[#ffd84d] px-3 py-1 font-mono text-[14px] font-bold uppercase tracking-[0.16em] text-[#ffd84d] sm:block">Agreed by using</span>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">That&apos;s the deal</p>
            <h3 className="mt-2 max-w-xl text-3xl font-medium tracking-[-0.03em] sm:text-4xl">By creating an account or using Elpino, you agree to these Terms.</h3>
            <p className="mt-3 max-w-xl text-white/80">Questions first? We answer every message. Your data is covered separately in the privacy policy.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${CONTACT}`} className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">
                <Mail size={16} /> {CONTACT} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <Link href="/privacy" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Read the privacy policy</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
