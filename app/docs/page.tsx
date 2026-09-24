import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Code2,
  FileText,
  Globe,
  Inbox,
  KeyRound,
  LifeBuoy,
  MessageSquareText,
  Plug,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { DocsSearch } from "@/app/components/docs/DocsSearch";
import { AskAiMenu } from "@/app/components/docs/AskAiMenu";
import { GlossyDocsSearch } from "@/app/components/docs/GlossyDocsSearch";
import { HeaderDocsSearch } from "@/app/components/docs/HeaderDocsSearch";
import { InteractiveSloth } from "@/app/components/docs/InteractiveSloth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Elpino developer documentation. Learn how to set up your AI support agent, install the chat widget, use the REST API, manage webhooks, and integrate with your stack.",
  alternates: { canonical: `${SITE_URL}/docs` },
};

/* ─────────────── Navigation ─────────────── */
const navigation = [
  {
    title: "Get started",
    links: [
      ["Introduction", "#introduction"],
      ["Quickstart", "#quickstart"],
      ["How Elpino works", "#how-it-works"],
      ["Core concepts", "#core-concepts"],
    ],
  },
  {
    title: "AI support",
    links: [
      ["Knowledge base", "/docs/knowledge"],
      ["AI answers", "/docs/ai-answers"],
      ["Human handoff", "/docs/inbox"],
      ["Confidence & fallbacks", "#confidence"],
    ],
  },
  {
    title: "Chat widget",
    links: [
      ["Install the widget", "/docs/chat-widget"],
      ["Pre-chat form", "/dashboard/connect/prechat-form"],
      ["Widget customization", "#widget-customization"],
      ["Identity verification", "/docs/identity-verification"],
    ],
  },
  {
    title: "Team workspace",
    links: [
      ["Shared inbox", "/docs/inbox"],
      ["Invite teammates", "/dashboard/settings/people"],
      ["Availability", "/dashboard/settings/availability"],
      ["Conversation routing", "#routing"],
    ],
  },
  {
    title: "API reference",
    links: [
      ["Overview", "/docs/api-webhooks"],
      ["Authentication", "#api-auth"],
      ["Conversations", "#api-conversations"],
      ["Contacts", "#api-contacts"],
      ["Knowledge", "#api-knowledge"],
    ],
  },
  {
    title: "SDKs & libraries",
    links: [
      ["JavaScript SDK", "#sdk-js"],
      ["REST API libraries", "#sdk-rest"],
      ["Widget SDK", "#sdk-widget"],
    ],
  },
  {
    title: "Webhooks",
    links: [
      ["Overview", "/docs/api-webhooks#webhooks"],
      ["Event reference", "#webhook-events"],
      ["Retry policy", "#webhook-retry"],
    ],
  },
  {
    title: "Connect",
    links: [
      ["Integrations", "/docs/integrations"],
      ["Site tags", "#install-widget"],
      ["Security", "/docs/security"],
    ],
  },
  {
    title: "Platform",
    links: [
      ["Billing and usage", "/docs/billing"],
      ["Troubleshooting", "/docs/troubleshooting"],
    ],
  },
] as const;

/* ─────────────── Hero cards ─────────────── */
const cards = [
  {
    icon: Sparkles,
    title: "Quickstart",
    text: "Go from an empty workspace to your first AI-assisted customer conversation.",
    href: "#quickstart",
    tone: "bg-[#efe9ff] text-[#6f4bb2]",
    bg: "bg-[#f3edfb]",
  },
  {
    icon: BookOpen,
    title: "Build your knowledge base",
    text: "Add website pages, files, and help articles that Elpino can answer from.",
    href: "/docs/knowledge",
    tone: "bg-[#e8f4ee] text-[#28745a]",
    bg: "bg-[#edf5ec]",
  },
  {
    icon: MessageSquareText,
    title: "Install the chat widget",
    text: "Create a site tag, add one script to your website, and verify the connection.",
    href: "/docs/chat-widget",
    tone: "bg-[#e9f1ff] text-[#3569ad]",
    bg: "bg-[#eaf2fb]",
  },
  {
    icon: KeyRound,
    title: "Verify customer identity",
    text: "Safely identify signed-in users before looking up private account information.",
    href: "/docs/identity-verification",
    tone: "bg-[#fff0df] text-[#98622a]",
    bg: "bg-[#fff1e3]",
  },
  {
    icon: Code2,
    title: "REST API reference",
    text: "Full API reference for conversations, contacts, knowledge, and workspace management.",
    href: "/docs/api-webhooks",
    tone: "bg-[#ffe8e8] text-[#a83232]",
    bg: "bg-[#fff5f5]",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    text: "Receive real-time event notifications when conversations, contacts, or messages change.",
    href: "/docs/api-webhooks#webhooks",
    tone: "bg-[#e8f8ff] text-[#2174a3]",
    bg: "bg-[#edf8ff]",
  },
] as const;

/* ─────────────── Quickstart steps ─────────────── */
const steps = [
  {
    number: "01",
    title: "Create your workspace",
    text: "Sign up, name your workspace, choose your timezone, and tell Elpino what kind of business you support.",
    href: "/signup",
    action: "Create a workspace",
  },
  {
    number: "02",
    title: "Add trusted knowledge",
    text: "Crawl your website, upload a document, add a URL, or write a help page. This is the information the AI uses for its answers.",
    href: "/dashboard/knowledge",
    action: "Open Knowledge",
  },
  {
    number: "03",
    title: "Install your site tag",
    text: "Create a tag for your domain and paste the generated script before the closing head tag on every page where chat should appear.",
    href: "#install-widget",
    action: "View installation",
  },
  {
    number: "04",
    title: "Bring in your team",
    text: "Invite teammates, set availability, and use the shared inbox for conversations that need a person.",
    href: "/dashboard/settings/people",
    action: "Invite teammates",
  },
] as const;

/* ─────────────── API endpoint rows ─────────────── */
const apiEndpoints = [
  { method: "GET", path: "/v1/conversations", description: "List all conversations in your workspace" },
  { method: "GET", path: "/v1/conversations/:id", description: "Retrieve a single conversation with messages" },
  { method: "POST", path: "/v1/conversations/:id/messages", description: "Send a message to a conversation" },
  { method: "PATCH", path: "/v1/conversations/:id", description: "Update conversation status, assignee, or tags" },
  { method: "GET", path: "/v1/contacts", description: "List all contacts" },
  { method: "POST", path: "/v1/contacts", description: "Create or upsert a contact by email" },
  { method: "GET", path: "/v1/knowledge", description: "List all knowledge sources in the workspace" },
  { method: "POST", path: "/v1/knowledge", description: "Add a new knowledge source (URL, file, or text)" },
] as const;

/* ─────────────── Webhook events ─────────────── */
const webhookEvents = [
  { event: "conversation.created", description: "A new conversation was started by a visitor or teammate." },
  { event: "conversation.resolved", description: "A conversation was marked resolved." },
  { event: "message.created", description: "A new message was sent in a conversation." },
  { event: "contact.created", description: "A new contact was identified." },
  { event: "contact.updated", description: "A contact's attributes were updated." },
  { event: "knowledge.indexed", description: "A knowledge source finished indexing and is available to the AI." },
] as const;

/* ─────────────── SDK languages ─────────────── */
const sdks = [
  { lang: "JavaScript / Node.js", badge: "Official", color: "bg-yellow-400", href: "#sdk-js" },
  { lang: "Python", badge: "Official", color: "bg-blue-500", href: "#sdk-rest" },
  { lang: "PHP", badge: "Official", color: "bg-indigo-500", href: "#sdk-rest" },
  { lang: "Ruby", badge: "Community", color: "bg-red-500", href: "#sdk-rest" },
  { lang: "Go", badge: "Community", color: "bg-cyan-500", href: "#sdk-rest" },
] as const;

/* ─────────────── Code samples ─────────────── */
function WidgetCodeSample() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white shadow-[0_18px_45px_rgba(27,31,43,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium text-white/65">HTML</span>
        <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] text-white/50">Before &lt;/head&gt;</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`<script
  async
  src="https://elpino.chat/tag.js"
  data-site-key="YOUR_SITE_KEY">
</script>`}</code></pre>
    </div>
  );
}

function ApiAuthCodeSample() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white shadow-[0_18px_45px_rgba(27,31,43,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium text-white/65">cURL</span>
        <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] text-white/50">Authentication</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`curl -X GET https://api.elpino.chat/v1/conversations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code></pre>
    </div>
  );
}

function WebhookPayloadSample() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white shadow-[0_18px_45px_rgba(27,31,43,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium text-white/65">JSON</span>
        <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] text-white/50">Webhook payload</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`{
  "event": "message.created",
  "created_at": "2024-11-14T10:32:00Z",
  "data": {
    "conversation_id": "conv_abc123",
    "message_id": "msg_xyz789",
    "from": "visitor",
    "body": "Hi, how do I reset my password?"
  },
  "workspace_id": "ws_elpino01"
}`}</code></pre>
    </div>
  );
}

/* ─────────────── Method badge helper ─────────────── */
const methodColor: Record<string, string> = {
  GET: "bg-[#dceee8] text-[#1e6e4e]",
  POST: "bg-[#e8f1ff] text-[#2a5cbd]",
  PATCH: "bg-[#fff3dc] text-[#8a5d12]",
  PUT: "bg-[#f0e8ff] text-[#5e3dad]",
  DELETE: "bg-[#ffe8e8] text-[#a83232]",
};

/* ─────────────── Page ─────────────── */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white pt-16 font-[family-name:var(--font-rethink-sans)] text-[#192016] md:pt-[108px]">

      {/* ── Top navbar ── */}
      <div className="fixed inset-x-0 top-0 z-30 bg-white text-[#11120f]">
        <div className="relative flex h-16 w-full items-center justify-between gap-4 px-4">
          <Link href="/" className="relative z-10 flex w-fit shrink-0 items-center gap-2 transition-opacity hover:opacity-90">
            <Image src="/icon.png" alt="" width={96} height={96} priority className="size-8 rounded-lg object-contain" />
            <span className="hidden items-center gap-2 text-[15px] font-normal tracking-[-0.01em] sm:flex">
              <span>elpino</span>
              <span aria-hidden="true" className="h-5 w-px bg-black" />
              <span className="text-black">Docs</span>
            </span>
          </Link>

          <div className="absolute left-1/2 w-[calc(100%_-_6rem)] -translate-x-1/2 lg:w-[min(42rem,calc(100%_-_34rem))]">
            <div className="relative hidden flex-1 items-center gap-2.5 lg:flex">
              <HeaderDocsSearch />
              <AskAiMenu pageUrl={`${SITE_URL}/docs`} />
            </div>
            <div className="lg:hidden"><DocsSearch /></div>
          </div>

          <div className="relative z-10 hidden shrink-0 items-center gap-2 md:flex">
            <Link href="/contact" className="inline-flex h-10 items-center rounded-md px-5 text-sm font-normal text-black transition hover:bg-black/5">Contact us</Link>
            <Link href="/signup" className="inline-flex h-10 items-center rounded-md bg-black px-5 text-sm font-normal text-white transition hover:bg-black/80">Get started</Link>
          </div>
        </div>
      </div>

      {/* ── Secondary nav bar ── */}
      <div className="fixed inset-x-0 top-16 z-20 hidden bg-white text-sm font-normal text-black/70 md:block">
        <div className="flex h-11 items-center justify-between px-4">
          <nav className="flex items-center gap-5" aria-label="Documentation resources">
            <Link href="/docs" aria-current="page" className="border-b border-black px-3 py-1.5 text-black">Help center</Link>
            <Link href="/docs/identity-verification" className="transition hover:text-black">Identity verification</Link>
            <Link href="/docs/api-webhooks" className="transition hover:text-black">API reference</Link>
            <Link href="#sdk-js" className="transition hover:text-black">SDKs</Link>
            <Link href="/docs/api-webhooks#webhooks" className="transition hover:text-black">Webhooks</Link>
            <Link href="/changelog" className="transition hover:text-black">Changelog</Link>
          </nav>
          <nav className="flex items-center gap-5" aria-label="Elpino resources">
            <Link href="/contact" className="transition hover:text-black">Partner</Link>
            <Link href="/features" className="transition hover:text-black">Platform</Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile scroll nav ── */}
      <div className="border-b border-black/10 bg-white px-5 py-3 lg:hidden">
        <nav aria-label="Documentation topics" className="mx-auto flex max-w-3xl gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ["Start here", "#quickstart"],
            ["Knowledge", "/docs/knowledge"],
            ["Install widget", "/docs/chat-widget"],
            ["Inbox", "/docs/inbox"],
            ["API", "/docs/api-webhooks"],
            ["Webhooks", "/docs/api-webhooks#webhooks"],
            ["SDKs", "#sdk-js"],
            ["Security", "/docs/security"],
          ].map(([label, href], index) => (
            <Link key={label} href={href} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${index === 0 ? "bg-[#192016] text-white" : "border border-black/10 bg-white text-[#59615a]"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Main grid ── */}
      <div className="grid w-full grid-cols-1 px-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,3fr)_1fr]">

        {/* Left sidebar */}
        <aside className="hidden border-r border-black/30 bg-white px-5 py-9 lg:block">
          <nav className="sticky top-[132px] space-y-5" aria-label="Documentation navigation">
            {navigation.map((group) => (
              <div key={group.title}>
                <p className="mb-1 px-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#59615a]">{group.title}</p>
                <ul className="space-y-[0.5px]">
                  {group.links.map(([label, href], index) => (
                    <li key={`${group.title}-${label}`}>
                      <Link
                        href={href}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${group.title === "Get started" && index === 0 ? "font-bold text-black" : "text-[#575d56] hover:bg-white hover:text-black"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="rounded-2xl bg-[#dceee8] p-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-white">
                <LifeBuoy size={15} />
              </span>
              <p className="mt-3 text-sm font-semibold">Need a hand?</p>
              <p className="mt-1 text-xs leading-5 text-[#65716b]">Talk to the Elpino team about your setup.</p>
              <Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4">
                Contact support <ArrowRight size={12} />
              </Link>
            </div>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 bg-white px-5 py-6 sm:px-12">

          {/* ── Introduction ── */}
          <section id="introduction" className="scroll-mt-40 py-0 text-black/90">
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                  <Sparkles size={12} />Elpino documentation
                </span>
                <h1 className="mt-5 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.055em]">Build better customer support.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">Set up the AI, teach it from your knowledge, install the chat widget, and bring your team into one shared inbox. Full API, webhooks, and SDKs for every integration.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="#quickstart" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#bf91ff] px-5 text-sm font-semibold text-black transition hover:bg-[#cfaeff]">
                    Start the quickstart <ArrowRight size={15} />
                  </Link>
                  <Link href="#api-overview" className="inline-flex h-11 items-center gap-2 rounded-full border border-black/20 px-5 text-sm font-medium text-black transition hover:bg-black/5">
                    API reference
                  </Link>
                  <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-full border border-black/20 px-5 text-sm font-medium text-black transition hover:bg-black/5">
                    Open dashboard
                  </Link>
                </div>
              </div>
              <InteractiveSloth />
            </div>
          </section>

          {/* ── Hero cards ── */}
          <section className="grid gap-4 border-b border-black/10 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-2xl border border-black/10 p-5 transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(25,32,22,0.10)] ${card.bg}`}
              >
                <span className={`flex size-10 items-center justify-center rounded-xl bg-white/80 ${card.tone.split(" ")[1]}`}>
                  <card.icon size={19} />
                </span>
                <h2 className="mt-5 text-base font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#667069]">{card.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#7651b0]">
                  Read guide <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </section>

          {/* ── Quickstart ── */}
          <section id="quickstart" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7058d5]">Quickstart</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Your first conversation in four steps</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#626c78]">Set up the useful parts first. You can customize the widget, connect tools, and add advanced controls after your first test conversation works.</p>
            <ol className="mt-9 space-y-3">
              {steps.map((step) => (
                <li key={step.number} className="group grid gap-3 rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-5 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff] sm:grid-cols-[52px_1fr_auto] sm:items-start">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#192016] font-mono text-xs font-semibold text-white">{step.number}</span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#667069]">{step.text}</p>
                  </div>
                  <Link href={step.href} className="ml-[52px] inline-flex items-center gap-1 text-xs font-semibold text-[#7651b0] sm:ml-3 sm:mt-1">
                    {step.action}<ChevronRight size={13} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* ── How Elpino works ── */}
          <section id="how-it-works" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">How Elpino works</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#626c78]">Elpino combines a curated knowledge base, an AI reasoning layer, and a human inbox into a single platform. Conversations move fluidly between automated answers and live agents without restarting the context.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: BookOpen, title: "Learn", text: "Elpino indexes only the knowledge you add to the workspace — website pages, uploaded documents, and help articles you write directly in the editor." },
                { icon: Bot, title: "Answer", text: "The AI finds the most relevant sources and responds inside your chat widget. It cites its sources and signals confidence level, so agents can trust or escalate its answers." },
                { icon: Users, title: "Hand off", text: "When the AI is uncertain or the customer requests a human, the full conversation thread transfers to your shared inbox with zero context loss." },
              ].map((item, i) => (
                <div key={item.title} className={`relative rounded-2xl p-5 ${["bg-[#dceee8]", "bg-[#e7ddf3]", "bg-[#fff1e3]"][i]}`}>
                  <span className="text-[10px] font-bold text-black/40">0{i + 1}</span>
                  <item.icon size={21} className="mt-5 text-[#192016]" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f685f]">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Core concepts ── */}
          <section id="core-concepts" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#59615a]">Core concepts</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Key terms and how they connect</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Understanding these six objects covers 90% of what you will work with in the dashboard and API.</p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { term: "Workspace", def: "The top-level container for your team. Each workspace has its own site tags, knowledge base, inbox, and API keys." },
                { term: "Site tag", def: "A unique identifier tied to a domain. The tag script loads the chat widget and routes conversations to the right workspace." },
                { term: "Knowledge source", def: "Any content you add — a crawled URL, uploaded file, or hand-written article. The AI only answers from sources you approve." },
                { term: "Conversation", def: "An exchange between a visitor (or contact) and Elpino (AI or human). Every message is stored with full context." },
                { term: "Contact", def: "A person identified by email or ID. A contact can have multiple conversations and custom attributes." },
                { term: "Teammate", def: "A user you invite to the workspace who can reply in the inbox, manage knowledge, and configure settings." },
              ].map(({ term, def }) => (
                <div key={term} className="rounded-xl border border-black/10 bg-[#faf9f7] p-4">
                  <dt className="text-sm font-semibold">{term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#626c78]">{def}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ── Confidence & fallbacks ── */}
          <section id="confidence" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Confidence &amp; fallbacks</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">You can configure what happens when the AI is not confident enough to answer. Options include forwarding to a teammate, showing a custom fallback message, or collecting the visitor&apos;s email for follow-up.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { title: "Human handoff", text: "Route the conversation to an available teammate automatically.", icon: Users },
                { title: "Custom message", text: "Show a pre-written response when no answer meets your confidence threshold.", icon: MessageSquareText },
                { title: "Email capture", text: "Ask the visitor for their email so a teammate can follow up asynchronously.", icon: FileText },
              ].map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-xl border border-black/10 bg-[#fafafa] p-4">
                  <Icon size={17} className="text-[#7651b0]" />
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#626c78]">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/docs/ai-answers" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b55d8]">
              Full AI answers &amp; handoff guide <ArrowRight size={14} />
            </Link>
          </section>

          {/* ── Widget customization ── */}
          <section id="widget-customization" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Widget customization</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Customize the widget&apos;s appearance, position, launcher text, and pre-chat form from <strong className="font-semibold text-[#313943]">Settings → Widget</strong>. Changes are applied immediately — no redeploy required.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Brand color", detail: "Match the widget launcher and header to your brand palette." },
                { label: "Position", detail: "Place the widget in any corner of the screen. Offset from the edge with pixel values." },
                { label: "Launcher text", detail: "Replace the default icon with a text button or a custom SVG." },
                { label: "Pre-chat form", detail: "Collect name, email, or custom fields before the first message is sent." },
                { label: "Language", detail: "Set a default language or let the widget auto-detect from the browser locale." },
                { label: "Allowed domains", detail: "Restrict which domains can render the widget for a given site tag." },
              ].map(({ label, detail }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg border border-black/10 p-4">
                  <Check size={15} className="mt-0.5 shrink-0 text-[#2d8b66]" />
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-[#626c78]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/docs/chat-widget" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b55d8]">
              Full chat widget guide <ArrowRight size={14} />
            </Link>
          </section>

          {/* ── Conversation routing ── */}
          <section id="routing" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Conversation routing</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Set rules to automatically assign incoming conversations based on availability, topic keywords, or the visitor&apos;s attributes. Routing rules execute in order; the first match wins.</p>
            <div className="mt-7 space-y-3">
              {[
                { title: "Round robin", text: "Distribute new conversations evenly across all available teammates." },
                { title: "Keyword routing", text: "Route conversations containing specific words (e.g. ‘refund’, ‘cancel’) to designated teammates or teams." },
                { title: "Contact attribute routing", text: "Send conversations from contacts with a specific plan or region to the right specialist." },
                { title: "Fallback", text: "If no rule matches, conversations land in a shared unassigned queue." },
              ].map(({ title, text }) => (
                <div key={title} className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#626c78]">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/docs/inbox" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b55d8]">
              Full team inbox guide <ArrowRight size={14} />
            </Link>
          </section>

          {/* ── API overview ── */}
          <section id="api-overview" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#a83232]">REST API</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">REST API reference</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">The Elpino REST API lets you read and write workspace data from your own servers. All endpoints use HTTPS, accept JSON, and return JSON. The base URL is <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">https://api.elpino.chat/v1</code>.</p>

            <div className="mt-3 flex gap-3 rounded-xl border border-[#d6e8fe] bg-[#eef4ff] p-4 text-sm leading-6 text-[#2a4f94]">
              <Sparkles size={16} className="mt-0.5 shrink-0" />
              <p>API keys are workspace-scoped. Generate and rotate them in <strong>Settings → API Keys</strong>. Never expose keys in client-side code.</p>
            </div>
          </section>

          {/* ── API auth ── */}
          <section id="api-auth" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Authentication</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Authenticate every request by passing your API key in the <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">Authorization</code> header as a Bearer token.</p>
            <div className="mt-7"><ApiAuthCodeSample /></div>
            <div className="mt-6 rounded-xl border border-[#f0dcae] bg-[#fff9e9] p-4 text-sm leading-6 text-[#695b37]">
              <p><strong>Rate limits:</strong> The API allows up to <strong>120 requests per minute</strong> per workspace. Exceeding this limit returns a <code className="font-mono">429 Too Many Requests</code> response with a <code className="font-mono">Retry-After</code> header.</p>
            </div>
          </section>

          {/* ── API endpoints ── */}
          <section id="api-conversations" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Endpoint reference</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Core endpoints across conversations, contacts, and knowledge. Full parameter and response schemas are available in the interactive API explorer.</p>
            <div className="mt-7 overflow-hidden rounded-xl border border-black/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f5f5f3] text-left">
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Endpoint</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {apiEndpoints.map(({ method, path, description }) => (
                    <tr key={`${method}-${path}`} className="hover:bg-[#fafafa]">
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${methodColor[method] ?? "bg-gray-100 text-gray-700"}`}>{method}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#3a3f4b]">{path}</td>
                      <td className="hidden px-4 py-3 text-[#626c78] sm:table-cell">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/docs/api-webhooks" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b55d8]">
              View full API reference <ArrowRight size={14} />
            </Link>
          </section>

          {/* ── SDKs ── */}
          <section id="sdk-js" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7058d5]">SDKs &amp; libraries</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Use your favourite language</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Official SDKs wrap the REST API and handle authentication, retries, and pagination for you. Community-maintained libraries are available for additional runtimes.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {sdks.map(({ lang, badge, color, href }) => (
                <Link key={lang} href={href} className="group flex items-center justify-between rounded-xl border border-black/10 bg-[#fafafa] p-4 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                  <div className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium">{lang}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge === "Official" ? "bg-[#dceee8] text-[#1e6e4e]" : "bg-[#f0e8ff] text-[#5e3dad]"}`}>{badge}</span>
                    <ChevronRight size={14} className="text-[#7651b0] transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-7">
              <h3 className="text-lg font-semibold">JavaScript / Node.js</h3>
              <p className="mt-2 text-sm leading-6 text-[#626c78]">Install the official SDK via npm:</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white">
                <div className="border-b border-white/10 px-4 py-3">
                  <span className="text-xs font-medium text-white/65">Terminal</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`npm install @elpino/sdk

# or with yarn
yarn add @elpino/sdk`}</code></pre>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white">
                <div className="border-b border-white/10 px-4 py-3">
                  <span className="text-xs font-medium text-white/65">JavaScript</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`import { ElpinoClient } from "@elpino/sdk";

const elpino = new ElpinoClient({
  apiKey: process.env.ELPINO_API_KEY,
});

const conversations = await elpino.conversations.list();
console.log(conversations.data);`}</code></pre>
              </div>
            </div>
          </section>

          {/* ── Widget SDK ── */}
          <section id="sdk-widget" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Widget JavaScript API</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">After the widget script loads, <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">window.Elpino</code> is available. Use it to identify users, open or close the widget programmatically, and listen for events.</p>
            <div className="mt-7 overflow-hidden rounded-xl border border-[#2d3038] bg-[#17191f] text-white">
              <div className="border-b border-white/10 px-4 py-3">
                <span className="text-xs font-medium text-white/65">JavaScript</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{`// Identify a signed-in user
window.Elpino("identify", {
  user_id: "user_12345",
  email: "jane@example.com",
  name: "Jane Smith",
  plan: "pro",
});

// Open the chat widget
window.Elpino("open");

// Listen for conversation created
window.Elpino("on", "conversation:created", (data) => {
  console.log("New conversation:", data.conversation_id);
});

// Update custom attributes
window.Elpino("update", { mrr: 299 });`}</code></pre>
            </div>
          </section>

          {/* ── Webhooks ── */}
          <section id="webhooks" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2174a3]">Webhooks</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">React to events in real time</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Register a webhook endpoint in <strong className="font-semibold text-[#313943]">Settings → Webhooks</strong>. Elpino will send an HTTP POST to your URL whenever a subscribed event occurs. Payloads are signed with HMAC-SHA256 using your webhook secret.</p>
            <div className="mt-7"><WebhookPayloadSample /></div>

            <div className="mt-6 flex gap-3 rounded-xl border border-[#d6e8fe] bg-[#eef4ff] p-4 text-sm leading-6 text-[#2a4f94]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <p>Verify the <code className="font-mono">X-Elpino-Signature</code> header on every incoming webhook to ensure the payload originated from Elpino and has not been tampered with.</p>
            </div>
          </section>

          {/* ── Webhook events ── */}
          <section id="webhook-events" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Webhook event reference</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Subscribe to one or more events per endpoint. Each event payload includes a <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">workspace_id</code>, <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">event</code>, <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">created_at</code>, and <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">data</code> object.</p>
            <div className="mt-7 overflow-hidden rounded-xl border border-black/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 bg-[#f5f5f3] text-left">
                    <th className="px-4 py-3 font-semibold">Event</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {webhookEvents.map(({ event, description }) => (
                    <tr key={event} className="hover:bg-[#fafafa]">
                      <td className="px-4 py-3 font-mono text-xs text-[#3a3f4b]">{event}</td>
                      <td className="hidden px-4 py-3 text-[#626c78] sm:table-cell">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Webhook retry ── */}
          <section id="webhook-retry" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Retry policy</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Elpino expects a <code className="rounded bg-[#f0f2f4] px-1.5 py-0.5 font-mono text-sm">2xx</code> HTTP response within <strong>10 seconds</strong>. If the endpoint times out or returns a non-2xx status, the delivery is retried with exponential backoff.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { attempt: "1st retry", delay: "5 seconds", tone: "bg-[#f3f8f5]" },
                { attempt: "2nd retry", delay: "30 seconds", tone: "bg-[#f3f8f5]" },
                { attempt: "3rd retry", delay: "5 minutes", tone: "bg-[#f3f8f5]" },
              ].map(({ attempt, delay, tone }) => (
                <div key={attempt} className={`rounded-xl border border-[#dfe5e2] p-4 ${tone}`}>
                  <p className="text-sm font-semibold">{attempt}</p>
                  <p className="mt-1 font-mono text-sm text-[#626c78]">{delay} after failure</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-[#626c78]">After three failed attempts, the event is marked as failed and logged in the webhook delivery history in your dashboard.</p>
          </section>

          {/* ── Integrations ── */}
          <section id="integrations" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#98622a]">Connect</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Bring useful context into support</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Connect supported payment and work tools from the Connect screen. Payment connections are used for read-only lookups, while follow-up tools can carry conversation context into your team&apos;s workflow.</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { name: "Stripe", category: "Payments", desc: "Look up subscription status, recent charges, and invoice history directly from a conversation." },
                { name: "Shopify", category: "Commerce", desc: "Pull order details and fulfilment status into the conversation panel without leaving the inbox." },
                { name: "Slack", category: "Notifications", desc: "Get notified in Slack when a high-priority conversation is opened or escalated." },
                { name: "Zapier", category: "Automation", desc: "Connect Elpino events to thousands of apps via Zapier triggers and actions." },
                { name: "HubSpot", category: "CRM", desc: "Sync contact attributes and conversation history into HubSpot deals and contacts." },
                { name: "Intercom", category: "Migration", desc: "Import historical conversations and contacts from Intercom into Elpino." },
              ].map(({ name, category, desc }) => (
                <div key={name} className="rounded-xl border border-[#e4e7ea] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{name}</p>
                    <span className="rounded-full bg-[#f0f2f4] px-2.5 py-0.5 text-[11px] font-medium text-[#59615a]">{category}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#626c78]">{desc}</p>
                </div>
              ))}
            </div>

            <Link href="/docs/integrations" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#dadddf] px-4 py-2.5 text-sm font-medium hover:bg-[#f7f8f9]">
              <Plug size={16} />Browse integrations
            </Link>
          </section>

          {/* ── Security ── */}
          <section id="security" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">Security and customer identity</h2>
            <p className="mt-4 text-base leading-7 text-[#626c78]">Credentials are encrypted at rest and used server-side only. For signed-in customers, identity verification lets your own server vouch for the user with a short-lived HMAC token before Elpino accesses customer-specific records.</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Data encryption", text: "All data is encrypted at rest with AES-256 and in transit with TLS 1.3. API keys and integration credentials are stored in isolated vaults." },
                { title: "Identity verification", text: "Generate a signed token on your server using your workspace secret. The token verifies the visitor's identity without exposing credentials to the browser." },
                { title: "GDPR & privacy", text: "Elpino supports data deletion requests, conversation export, and consent-based contact creation. See our Privacy Policy for full detail." },
                { title: "SOC 2", text: "Elpino is SOC 2 Type II certified. A copy of the audit report is available to enterprise customers under NDA." },
              ].map(({ title, text }) => (
                <div key={title} className="rounded-xl border border-black/10 bg-[#fafafa] p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck size={14} className="text-[#2d8b66]" />{title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#626c78]">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/docs/identity-verification" className="inline-flex items-center gap-2 rounded-lg bg-[#17191f] px-4 py-2.5 text-sm font-medium text-white">
                <Code2 size={16} />Identity verification guide
              </Link>
              <Link href="/docs/security" className="inline-flex items-center gap-2 rounded-lg border border-[#dadddf] px-4 py-2.5 text-sm font-medium">
                <ShieldCheck size={16} />Full security guide
              </Link>
              <Link href="/privacy" className="inline-flex items-center gap-2 rounded-lg border border-[#dadddf] px-4 py-2.5 text-sm font-medium">
                <FileText size={16} />Privacy policy
              </Link>
            </div>
          </section>

          {/* ── Billing & troubleshooting ── */}
          <section id="platform" className="scroll-mt-40 border-b border-[#e8eaed] py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#59615a]">Platform</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Billing and troubleshooting</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#626c78]">Understand plans, AI credit, and recharge, or diagnose common widget, knowledge, identity, and handoff issues.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/docs/billing" className="group rounded-xl border border-black/10 p-4 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                <h3 className="text-sm font-semibold">Billing and usage</h3>
                <p className="mt-1 text-sm leading-6 text-[#626c78]">Credits, plans, seats, and automatic recharge.</p>
              </Link>
              <Link href="/docs/troubleshooting" className="group rounded-xl border border-black/10 p-4 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                <h3 className="text-sm font-semibold">Troubleshooting</h3>
                <p className="mt-1 text-sm leading-6 text-[#626c78]">Fix widget, knowledge, identity, and realtime issues.</p>
              </Link>
            </div>
          </section>

          {/* ── Footer CTA ── */}
          <div className="flex flex-col justify-between gap-4 border-t border-[#e8eaed] py-8 text-sm sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">Couldn't find what you need?</p>
              <p className="mt-1 text-xs text-[#757d87]">Tell us which guide would help you.</p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-1 font-medium text-[#6b55d8]">
              Contact support <ArrowRight size={14} />
            </Link>
          </div>
        </main>

        {/* ── Right "On this page" sidebar ── */}
        <aside className="hidden border-l border-black/30 bg-white px-6 py-16 xl:block">
          <div className="sticky top-[132px]">
            <p className="mb-3 text-xs font-semibold text-[#343b45]">On this page</p>
            <nav className="space-y-[0.5px] border-l border-black/30 pl-4 text-sm text-[#757d87]">
              <Link className="block font-semibold text-[#7651b0]" href="#introduction">Introduction</Link>
              <Link className="block hover:text-black" href="#quickstart">Quickstart</Link>
              <Link className="block hover:text-black" href="#how-it-works">How Elpino works</Link>
              <Link className="block hover:text-black" href="#core-concepts">Core concepts</Link>
              <Link className="block hover:text-black" href="#confidence">Confidence &amp; fallbacks</Link>
              <Link className="block hover:text-black" href="#widget-customization">Widget customization</Link>
              <Link className="block hover:text-black" href="#routing">Conversation routing</Link>
              <Link className="block hover:text-black" href="#api-overview">REST API</Link>
              <Link className="block hover:text-black" href="#api-auth">Authentication</Link>
              <Link className="block hover:text-black" href="#api-conversations">Endpoints</Link>
              <Link className="block hover:text-black" href="#sdk-js">SDKs</Link>
              <Link className="block hover:text-black" href="#sdk-widget">Widget JS API</Link>
              <Link className="block hover:text-black" href="#webhooks">Webhooks</Link>
              <Link className="block hover:text-black" href="#webhook-events">Event reference</Link>
              <Link className="block hover:text-black" href="#webhook-retry">Retry policy</Link>
              <Link className="block hover:text-black" href="#integrations">Integrations</Link>
              <Link className="block hover:text-black" href="#security">Security</Link>
              <Link className="block hover:text-black" href="#platform">Billing &amp; troubleshooting</Link>
            </nav>
          </div>
        </aside>
      </div>

      <GlossyDocsSearch />
    </div>
  );
}
