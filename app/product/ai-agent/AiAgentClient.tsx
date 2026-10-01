"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";
import { HeroDemo, PreviewHandoff, PreviewKnowledge, PreviewLookup, PreviewMemory, PreviewPermissions, PreviewReview, PreviewRouting, PreviewVerify } from "./AgentPreviews";

// The AI agent page, told as the problems it solves. Each one says what goes wrong without it and the specific
// thing the agent does about it. Everything here is something the agent really does: it reads the conversation
// and past ones, verifies identity with an email code or signed token, looks up payments (Stripe, Razorpay),
// calls tools on MCP servers an admin has approved (up to 5 servers, tools switched on one by one), routes to a
// sales/support/technical specialist, has its facts reviewed, and asks before handing off. Names and emails are
// replaced with reference codes before the model reads the conversation.

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — t()'s traversal really does hand back the raw JSON value (array or not) even
 * though its declared return type is `string`. Falls back to the English array wholesale when the locale hasn't
 * got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

// ----------------------------------------------------------------- problems

type Problem = { title: string; without: string; does: string[] };

const PROBLEMS_EN: Problem[] = [
  {
    title: "The same questions, over and over",
    without: "Your team answers the same pricing, setup and policy questions every day, and customers wait in a queue for answers that already exist.",
    does: [
      "Searches what you taught it (your website, files and pages you write) and answers from that.",
      "Reads a current page on your site when it needs fresh details.",
      "Answers only from what you've approved. If it isn't in your knowledge, it says so and offers a person.",
    ],
  },
  {
    title: "Customers have to repeat themselves",
    without: "Every new chat starts from zero, so customers explain the same thing again and your team asks the same questions again.",
    does: [
      "Remembers what was said earlier in the conversation, and looks back for details it needs, even in a long chat.",
      "Knows earlier chats with the same person, so they never have to repeat themselves.",
    ],
  },
  {
    title: "You can't tell who you're talking to",
    without: "Anyone can type any name or email into a chat. A bot that takes their word for it can hand account details to a stranger.",
    does: [
      "Asks for a one-time email code, or a signed token from your app, before it discusses anything personal.",
      "Replaces names and emails in a conversation with reference codes before the model reads it, and strips out secrets like keys and tokens.",
    ],
  },
  {
    title: "Looking up a payment or an order by hand",
    without: "“Where's my order?” and “my payment failed” need a person to open another tool, find the record and copy the answer back.",
    does: [
      "Looks up real payments and subscriptions in Stripe or Razorpay, and can send receipts and payment links.",
      "Calls the tools you approve on your own MCP servers to read orders, accounts or bookings.",
      "Can cancel a subscription when a customer asks.",
    ],
  },
  {
    title: "Bots that make things up",
    without: "A chatbot that guesses sounds confident and is wrong, and the customer acts on what it said.",
    does: [
      "Runs a review pass that checks the draft against what the tools returned before anything is sent.",
      "Stays inside what you taught it, and says when it doesn't know instead of guessing.",
    ],
  },
  {
    title: "An AI that can do more than you meant",
    without: "Giving an AI access to your systems is risky when it can reach all of them, or change things without anyone checking who asked.",
    does: [
      "Only sees the tools you've switched on, and every call is re-checked against your list on the server.",
      "Tools that change data always need a verified customer.",
      "Refunds are off until the workspace owner turns them on.",
      "Server credentials are stored encrypted.",
    ],
  },
  {
    title: "Conversations that get dropped",
    without: "When a bot gets stuck it says “please contact support”, and the customer starts again or gives up.",
    does: [
      "Says so when it has no tool for the job, and asks the customer before bringing your team in.",
      "Sends every teammate a Join alert, and they have 90 seconds to jump in.",
      "If nobody joins, files a ticket and emails the customer.",
      "Your team sees what the AI already checked, so nobody asks the customer to repeat themselves.",
    ],
  },
  {
    title: "The wrong kind of help for the question",
    without: "A pricing question, an account problem and a setup error need different knowledge and different tools.",
    does: [
      "Routes each message to a sales, support or technical specialist.",
      "Escalates hard turns to a stronger reasoning model, and uses a fallback model if a provider has an outage.",
    ],
  },
];

// ------------------------------------------------------------- walkthrough

type Step = { name: string; tool?: string; body: string };

const STEPS_EN: Step[] = [
  { name: "It goes to the right specialist", body: "A customer writes “Hi, where is my order #4821?”. The router sends it to the support specialist." },
  { name: "It checks what was already said", tool: "recall_conversation", body: "It looks back at the two earlier messages about order 4821, so it doesn't ask for them again." },
  { name: "It checks earlier chats", tool: "get_past_conversations", body: "It finds the chat with the same person last month, which was resolved." },
  { name: "It confirms who it is", tool: "send_email_code → check_email_code", body: "Before it touches an order, it sends a one-time code to the customer's email and checks it." },
  { name: "It looks up the order", tool: "mcp_shop__get_order", body: "It reads the order from your shop's MCP server: shipped, arriving Thursday." },
  { name: "It checks its own answer", tool: "review", body: "The draft is checked against what the tool returned, and the facts match." },
  { name: "It replies, and closes it", tool: "mark_resolved", body: "The customer gets the answer, and the conversation is marked resolved. A person was never needed." },
];

// ------------------------------------------------------------ connections

type Connection = { title: string; body: string; href?: string; cta?: string };

const CONNECTIONS_EN: Connection[] = [
  { title: "Your knowledge", body: "Crawl your website, upload documents and write pages. Public and private switches decide who sees what.", href: "/product/knowledge-hub", cta: "See the Knowledge Hub" },
  { title: "Your payments", body: "Connect Stripe or Razorpay and the agent can look up payments and subscriptions, send receipts and payment links, and cancel a subscription." },
  { title: "Your own systems, through MCP", body: "Connect up to five MCP servers, with up to 15 tools enabled on each. Elpino discovers their tools and you switch on exactly the ones the agent may use." },
  { title: "Your team", body: "When a person is needed, the conversation lands in the shared inbox with everything the AI checked, and a ticket is filed if nobody is free.", href: "/product/inbox", cta: "See the shared inbox" },
];

// ------------------------------------------------------------------ compare

const COMPARE_EN: [string, string][] = [
  ["Searches articles and stops", "Searches, looks up records and takes action"],
  ["Treats everyone as a stranger", "Verifies identity, remembers past chats"],
  ["“Please contact support” when stuck", "Asks first, alerts the team, files a ticket if nobody's free"],
  ["Can't see your systems", "Calls the MCP tools you approve"],
  ["Answers can't be trusted", "Facts reviewed against tool results"],
];

// ---------------------------------------------------------------------- faq

const FAQS_EN: [string, string][] = [
  ["What is MCP?", "The Model Context Protocol, a standard way for an AI to call tools on another system. Connect an MCP server and Elpino discovers its tools. You then choose which ones the agent may use."],
  ["How many MCP servers can I connect?", "Up to five, with up to 15 tools enabled per server."],
  ["Can the agent change things in my systems?", "Only through tools you've switched on, and tools that change data always require a customer whose email has been verified."],
  ["How does it know who the customer is?", "From the conversation, earlier chats with them, and a verification step: a one-time email code or a signed token from your app."],
  ["Can it issue refunds?", "Only if the workspace owner turns refunds on. They're off by default."],
  ["What happens when it can't solve something?", "It says so and asks the customer whether to connect them with your team. Everyone on the team gets a Join alert for 90 seconds, and if nobody joins a ticket is created automatically."],
];

// The walkthrough: its steps check off one after another once the list scrolls into view, with a line that fills down.
function StepList({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [done, setDone] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") { setDone(steps.length); return; }
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let count = 0;
      const next = () => { count += 1; setDone(count); if (count < steps.length) timer = window.setTimeout(next, 750); };
      timer = window.setTimeout(next, 300);
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [steps.length]);
  return (
    <ol ref={ref} className="relative">
      <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-px bg-black/15" />
      <span aria-hidden="true" className="absolute left-5 top-6 w-px bg-[#1aa37a] transition-[height] duration-700 ease-out" style={{ height: `calc((100% - 3rem) * ${Math.min(1, Math.max(0, (done - 1) / Math.max(1, steps.length - 1)))})` }} />
      {steps.map((step, index) => {
        const on = index < done;
        return (
          <li key={step.name} className="relative grid grid-cols-[2.5rem_1fr] gap-5 py-5 sm:grid-cols-[2.5rem_1fr]">
            <span className={`relative z-10 grid size-10 place-items-center rounded-full border text-[14px] font-medium transition-all duration-500 ${on ? "scale-100 border-[#1aa37a] bg-[#1aa37a] text-white" : "border-black/30 bg-white text-black/60"}`}>
              {on ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : index + 1}
            </span>
            <div className="transition-opacity duration-500" style={{ opacity: on ? 1 : 0.45 }}>
              <h3 className="text-xl font-medium tracking-[-0.02em]">{step.name}</h3>
              {step.tool && <code className="mt-2 inline-block rounded-md bg-[#f4f4f2] px-2 py-1 font-mono text-[12.5px] text-black/70">{step.tool}</code>}
              <p className="mt-2 max-w-2xl text-[16px] leading-7 text-black/65">{step.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const PREVIEWS = [PreviewKnowledge, PreviewMemory, PreviewVerify, PreviewLookup, PreviewReview, PreviewPermissions, PreviewHandoff, PreviewRouting];

// ---------------------------------------------------------------- the page

export function AiAgentClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const problems = tList<Problem>(t, "aiAgent.problems.items", PROBLEMS_EN);
  const steps = tList<Step>(t, "aiAgent.walkthrough.steps", STEPS_EN);
  const connections = tList<Connection>(t, "aiAgent.connections.items", CONNECTIONS_EN);
  const rows = tList<[string, string]>(t, "aiAgent.compare.rows", COMPARE_EN);
  const faqs = tList<[string, string]>(t, "aiAgent.faq.items", FAQS_EN);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      {/* Hero */}
      <section className="bg-white px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-[14px] text-black/50">{t("aiAgent.hero.badge", "AI agent")}</p>
            <h1 className="mt-4 max-w-[18ch] animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]">
              {t("aiAgent.hero.problemTitle", "Stop answering the same questions, and looking things up by hand.")}
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/65">
              {t("aiAgent.hero.problemSubtitle", "Most support conversations are a customer asking for something your business already knows: a policy, an order, a payment. The Elpino AI agent finds it, checks who is asking, and answers. When it can't, it hands the conversation to your team with the full story.")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#11120f] px-9 text-[18px] font-medium text-white transition hover:opacity-85">{t("aiAgent.hero.ctaStart", "Start free")} <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/features" className="inline-flex h-14 items-center rounded-full border border-black/25 bg-white px-9 text-[18px] font-medium transition hover:border-black/60">{t("aiAgent.hero.ctaFeatures", "See all features")}</Link>
            </div>
          </div>
          <div className="animate-[elpino-focus_0.9s_ease-out_0.25s_both]"><HeroDemo /></div>
        </div>
      </section>

      {/* The problems, each with what the agent does about it */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("aiAgent.problems.title", "The problems it solves.")}</h2>
            <p className="max-w-xl text-lg leading-8 text-black/65">{t("aiAgent.problems.subtitle", "Each one is a real support problem. On the left, what goes wrong without it. On the right, the specific thing the agent does about it.")}</p>
          </Rv>

          <div className="mt-16 space-y-20 lg:space-y-28">
            {problems.map((problem, index) => {
              const Preview = PREVIEWS[index % PREVIEWS.length];
              return (
                <div key={problem.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                  <Rv variant="deal" className={index % 2 === 1 ? "lg:order-2" : ""}><Preview /></Rv>
                  <Rv delay={120} className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="max-w-lg">
                      <span className="text-[14px] font-medium text-[#0078f4]">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="mt-2 text-[clamp(1.7rem,2.6vw,2.4rem)] font-normal leading-[1.1] tracking-[-0.03em]">{problem.title}</h3>
                      <p className="mt-4 flex gap-3 text-[16px] leading-7 text-black/60"><X size={18} strokeWidth={2.5} className="mt-1.5 shrink-0 text-[#d9508a]" aria-hidden="true" /><span><span className="sr-only">{t("aiAgent.problems.withoutLabel", "Without it:")} </span>{problem.without}</span></p>
                      <p className="mt-7 text-[13px] font-medium text-black/50">{t("aiAgent.problems.doesLabel", "What the agent does")}</p>
                      <ul className="mt-3 space-y-3.5">
                        {problem.does.map((line) => (
                          <li key={line} className="flex items-start gap-3 text-[16px] leading-7 text-black/80">
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1aa37a] text-white"><Check size={12} strokeWidth={3.5} aria-hidden="true" /></span>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Rv>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* One request, step by step */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("aiAgent.walkthrough.title", "What happens to one request.")}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">{t("aiAgent.walkthrough.subtitle", "A customer asks where their order is. Watch everything the agent does before it answers, in order.")}</p>
            <p className="mt-4 text-[14px] text-black/45">{t("aiAgent.walkthrough.note", "Sample conversation. The tool names shown are the ones the agent really calls.")}</p>
          </Rv>
          <StepList steps={steps} />
        </div>
      </section>

      {/* What it connects to */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="max-w-2xl">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("aiAgent.connections.title", "What it works from.")}</h2>
            <p className="mt-5 text-base leading-7 text-black/60">{t("aiAgent.connections.subtitle", "The agent only knows and can do what you give it. These are the four things you connect.")}</p>
          </Rv>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {connections.map((item, index) => (
              <Rv key={item.title} variant="up" delay={(index % 2) * 90}>
                <div className="flex h-full flex-col rounded-[10px] border border-black/40 bg-white p-7">
                  <h3 className="text-2xl font-medium tracking-[-0.025em]">{item.title}</h3>
                  <p className="mt-3 flex-1 text-[16px] leading-7 text-black/65">{item.body}</p>
                  {item.href && item.cta && <Link href={item.href} className="mt-5 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-[#0078f4] underline underline-offset-4 hover:opacity-80">{item.cta} <ArrowRight size={16} /></Link>}
                </div>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* A chatbot, and this */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv><h2 className="max-w-2xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("aiAgent.compare.titlePrefix", "Chatbot vs. ")}{t("aiAgent.compare.titleHl", "Elpino agent.")}</h2></Rv>
          <div className="mt-12 overflow-hidden rounded-[10px] border border-black/40">
            <div className="hidden grid-cols-2 border-b border-black/15 bg-[#f4f4f2] text-[13px] font-medium text-black/55 md:grid">
              <p className="px-6 py-3">{t("aiAgent.compare.headerA", "A typical chatbot")}</p>
              <p className="border-l border-black/15 px-6 py-3">{t("aiAgent.compare.headerB", "Elpino AI agent")}</p>
            </div>
            {rows.map(([a, b], index) => (
              <div key={a} className={`grid md:grid-cols-2 ${index > 0 ? "border-t border-black/10" : ""}`}>
                <p className="flex items-center gap-3 px-6 py-4 text-black/55"><X size={16} strokeWidth={2.5} className="shrink-0 text-[#d9508a]" aria-hidden="true" /><span>{a}</span></p>
                <p className="flex items-center gap-3 border-t border-black/10 px-6 py-4 font-medium md:border-l md:border-t-0"><Check size={16} strokeWidth={3} className="shrink-0 text-[#1aa37a]" aria-hidden="true" />{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Rv><h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("aiAgent.faq.titlePrefix", "Good to ")}{t("aiAgent.faq.titleHl", "know.")}</h2></Rv>
          <Rv delay={80}>
            <div className="border-b border-black/20">
              {faqs.map(([q, a], index) => {
                const isOpen = open === index;
                return (
                  <div key={q} className="border-t border-black/20">
                    <h3>
                      <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                        <span className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-snug tracking-[-0.015em]">{q}</span>
                        <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#11120f] bg-[#11120f] text-white" : "border-black/25 text-[#11120f]"}`}><Plus size={18} /></span>
                      </button>
                    </h3>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden"><p className="max-w-2xl pb-7 text-[17px] leading-7 text-black/65">{a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Rv>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-white px-5 pb-24 pt-4 sm:px-8 lg:px-20">
        <Rv className="mx-auto max-w-[1500px]">
          <div className="rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
            <h2 className="max-w-3xl text-4xl font-normal leading-[1.04] tracking-[-0.035em] sm:text-5xl">{t("aiAgent.closing.problemTitle", "Take the repeat questions off your team.")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-black/65">{t("aiAgent.closing.subtitle", "Teach it your business, plug in your tools, and set the limits.")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("aiAgent.closing.ctaStart", "Start free")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/product/knowledge-hub" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("aiAgent.closing.ctaKnowledgeHub", "See the Knowledge Hub")}</Link>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
