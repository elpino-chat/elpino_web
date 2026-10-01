import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  LifeBuoy,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { DocsSearch } from "@/app/components/docs/DocsSearch";
import { AskAiMenu } from "@/app/components/docs/AskAiMenu";
import { GlossyDocsSearch } from "@/app/components/docs/GlossyDocsSearch";
import { HeaderDocsSearch } from "@/app/components/docs/HeaderDocsSearch";
import { InteractiveSloth } from "@/app/components/docs/InteractiveSloth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Step-by-step setup guide",
  description:
    "Install the Elpino chat widget on your website, step by step: create your organization, add the widget, turn on identity verification, create your first site tag, paste the snippet, wire up your backend, verify everything works, and teach the AI with knowledge.",
  alternates: { canonical: `${SITE_URL}/docs` },
};

/* ─────────────── Navigation ─────────────── */
const steps = [
  { id: "step-1", label: "1. Create your organization" },
  { id: "step-2", label: "2. Add the widget" },
  { id: "step-3", label: "3. Complete the setup" },
  { id: "step-4", label: "4. Identity verification & secret key" },
  { id: "step-5", label: "5. Create your first tag" },
  { id: "step-6", label: "6. Install the snippet" },
  { id: "step-7", label: "7. Wire up your backend" },
  { id: "step-8", label: "8. Publish and verify" },
  { id: "step-9", label: "9. Teach the AI (add knowledge)" },
] as const;

const navigation = [
  {
    title: "Step-by-step setup",
    links: steps.map(({ id, label }) => [label, `#${id}`] as const),
  },
  {
    title: "Go deeper",
    links: [
      ["Knowledge base", "/docs/knowledge"],
      ["AI answers", "/docs/ai-answers"],
      ["Chat widget", "/docs/chat-widget"],
      ["Identity verification", "/docs/identity-verification"],
      ["Team inbox", "/docs/inbox"],
      ["Integrations", "/docs/integrations"],
      ["Billing and usage", "/docs/billing"],
      ["Security", "/docs/security"],
      ["Troubleshooting", "/docs/troubleshooting"],
      ["API reference", "/docs/api-webhooks"],
    ],
  },
] as const;

/* ─────────────── Shared building blocks ─────────────── */
function StepHeader({ id, icon: Icon, title, intro }: { id: string; icon: React.ComponentType<{ size?: number | string; className?: string }>; title: string; intro: string }) {
  const number = id.replace("step-", "");
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#192016] text-sm font-bold text-white">{number}</span>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#efe9ff] text-[#6f4bb2]">
          <Icon size={20} />
        </span>
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">{title}</h2>
      </div>
      <p className="mt-5 text-lg leading-8 text-black/70">{intro}</p>
    </div>
  );
}

function StepList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mt-8 max-w-3xl space-y-3">
      {Array.isArray(children)
        ? children.map((child, index) => (
            <li key={index} className="flex gap-4 rounded-2xl border border-black/10 bg-[#faf9f6] px-5 py-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#dceee8] text-xs font-bold text-[#1e6e4e]">{index + 1}</span>
              <div className="min-w-0 flex-1 text-base leading-7 text-[#3b423c]">{child}</div>
            </li>
          ))
        : children}
    </ol>
  );
}

function Screenshot({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption: string }) {
  return (
    <figure className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-[#faf9f6]">
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      <figcaption className="border-t border-black/10 px-5 py-3 text-sm text-[#626c78]">{caption}</figcaption>
    </figure>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex max-w-3xl gap-3 rounded-2xl border border-[#cfe7dc] bg-[#eef7f1] p-5 text-sm leading-6 text-[#1e6e4e]">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="mt-6 max-w-3xl overflow-hidden rounded-2xl border border-[#2d3038] bg-[#17191f] shadow-[0_18px_45px_rgba(27,31,43,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium text-white/65">{title}</span>
        <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] text-white/50">Copy-paste ready</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-7 text-[#d8e3ef]"><code>{code}</code></pre>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex max-w-3xl gap-3 rounded-2xl border border-[#e5d9fb] bg-[#f6f1fe] p-5 text-sm leading-6 text-[#5f4c79]">
      <Lightbulb size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

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
            <Link href="/docs/troubleshooting" className="transition hover:text-black">Troubleshooting</Link>
            <Link href="/changelog" className="transition hover:text-black">Changelog</Link>
          </nav>
          <nav className="flex items-center gap-5" aria-label="Elpino resources">
            <Link href="/contact" className="transition hover:text-black">Partner</Link>
            <Link href="/features" className="transition hover:text-black">Platform</Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile step nav ── */}
      <div className="border-b border-black/10 bg-white px-5 py-3 lg:hidden">
        <nav aria-label="Setup steps" className="mx-auto flex max-w-3xl gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map(({ id, label }, index) => (
            <Link key={id} href={`#${id}`} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${index === 0 ? "bg-[#192016] text-white" : "border border-black/10 bg-white text-[#59615a]"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Main grid ── */}
      <div className="grid w-full grid-cols-1 px-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,3fr)_1fr]">

        {/* Left sidebar */}
        <aside className="hidden border-r border-black/30 bg-white px-5 py-9 lg:block">
          <nav className="sticky top-[132px] space-y-4" aria-label="Documentation navigation">
            {navigation.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 px-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#59615a]">{group.title}</p>
                <ul className="space-y-0.5">
                  {group.links.map(([label, href]) => (
                    <li key={`${group.title}-${label}`}>
                      <Link
                        href={href}
                        className="block rounded-lg px-3 py-1.5 text-sm leading-5 text-[#575d56] transition hover:bg-black/[0.03] hover:text-black"
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

          {/* ── Hero ── */}
          <section id="overview" className="scroll-mt-40 py-0 text-black/90">
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">
                  <Sparkles size={12} />Elpino setup guide
                </span>
                <h1 className="mt-5 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.055em]">Install Elpino on your website, step by step.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">Follow the nine steps below in order. Each one tells you exactly what to click, what to copy and paste, and what you should see when it worked — no guessing.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="#step-1" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#bf91ff] px-5 text-sm font-semibold text-black transition hover:bg-[#cfaeff]">
                    Start with step 1 <ArrowRight size={15} />
                  </Link>
                  <Link href="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-full border border-black/20 px-5 text-sm font-medium text-black transition hover:bg-black/5">
                    Open dashboard
                  </Link>
                </div>
                <p className="mt-6 max-w-2xl text-sm leading-6 text-[#626c78]">
                  <strong className="text-[#313943]">Before you start:</strong> all you need is a live website and about 15 minutes. If your site has user logins, you&apos;ll also need access to its backend code for steps 4 and 7.
                </p>
              </div>
              <InteractiveSloth />
            </div>

            {/* Step overview strip */}
            <ol className="mt-10 grid gap-2 sm:grid-cols-2">
              {steps.map(({ id, label }) => (
                <li key={id}>
                  <Link href={`#${id}`} className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 text-sm transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                    <Check size={14} className="shrink-0 text-[#2d8b66]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* ══════════ STEP 1 — Organization ══════════ */}
          <section id="step-1" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-1"
              icon={Sparkles}
              title="Create your organization"
              intro="Elpino keeps everything for one company in one organization (also called a workspace): your tags, knowledge, inbox, and keys. Start by creating yours."
            />
            <StepList>
              <>Go to <Link href="/signup" className="font-semibold text-[#6b55d8] underline underline-offset-4">elpino.chat</Link> and click <strong className="text-[#313943]">Get started</strong> (top right).</>
              <>Sign up with your name, work email, and a password, then confirm your email with the code or link we send you.</>
              <>Create your organization: enter your <strong className="text-[#313943]">company name</strong>, your <strong className="text-[#313943]">website URL</strong>, and your <strong className="text-[#313943]">timezone</strong>.</>
              <>You land straight in the Elpino <strong className="text-[#313943]">dashboard</strong>.</>
            </StepList>
            <ResultBox>
              <strong>Done when:</strong> you are logged in and looking at your dashboard, with a setup guide in the bottom-right corner.
            </ResultBox>
          </section>

          {/* ══════════ STEP 2 — Add the widget ══════════ */}
          <section id="step-2" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-2"
              icon={Rocket}
              title="Add the widget"
              intro="From your dashboard, start the widget install. Elpino walks you through it."
            />
            <StepList>
              <>On the dashboard home, find the card that says <strong className="text-[#313943]">&ldquo;Install the Elpino chat widget&rdquo;</strong>.</>
              <>Click the <strong className="text-[#313943]">Install widget &rarr;</strong> button on the right of that card.</>
            </StepList>
            <Screenshot
              src="/images/docs/Screenshot_20261001_215332.png"
              alt="Elpino dashboard with the Install widget button highlighted"
              width={1487}
              height={756}
              caption="Dashboard home → the “Install the Elpino chat widget” card → press Install widget."
            />
            <ResultBox>
              <strong>Done when:</strong> the widget setup flow opens and your onboarding progress starts being saved.
            </ResultBox>
          </section>

          {/* ══════════ STEP 3 — Complete the setup ══════════ */}
          <section id="step-3" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-3"
              icon={CheckCircle2}
              title="Complete the setup"
              intro="The setup asks a few quick questions and gets your workspace ready for its first conversation."
            />
            <StepList>
              <>Answer each prompt: confirm your <strong className="text-[#313943]">website</strong>, give your <strong className="text-[#313943]">AI agent</strong> a name, and set the <strong className="text-[#313943]">greeting</strong> visitors will see.</>
              <>Work through the rest of the checklist. Your answers save as you go — if you stop halfway, the <strong className="text-[#313943]">Setup guide</strong> button in the bottom-right corner remembers exactly where you left off (for example 2/5).</>
              <>Come back any time and pick up from that same Setup guide button.</>
            </StepList>
            <TipBox>
              This guide follows the same order as the setup checklist, so you can keep both open side by side.
            </TipBox>
            <ResultBox>
              <strong>Done when:</strong> every checklist item is ticked — or you&apos;ve reached the &ldquo;install the tag&rdquo; item, which is the next step.
            </ResultBox>
          </section>

          {/* ══════════ STEP 4 — Identity verification & secret key ══════════ */}
          <section id="step-4" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-4"
              icon={ShieldCheck}
              title="Turn on identity verification and get the secret key"
              intro="This step lets your own login system prove who is chatting — so nobody can pretend to be one of your customers just by typing their email. It also gives you the secret key your backend will need in step 7."
            />
            <StepList>
              <>In the dashboard, find the <strong className="text-[#313943]">&ldquo;Verify signed-in customers&rdquo;</strong> card and click <strong className="text-[#313943]">Set up</strong>.</>
              <>Switch <strong className="text-[#313943]">Identity verification</strong> <strong className="text-[#313943]">ON</strong>.</>
              <>Click <strong className="text-[#313943]">Copy</strong> next to the <strong className="text-[#313943]">Identity secret</strong> — it starts with <code className="rounded bg-black/5 px-1 font-mono text-sm">elid_</code>.</>
              <>Save it for step 7, where it goes into your backend <code className="rounded bg-black/5 px-1 font-mono text-sm">.env</code> file as <code className="rounded bg-black/5 px-1 font-mono text-sm">ELPINO_IDENTITY_SECRET</code>.</>
            </StepList>
            <Screenshot
              src="/images/docs/Screenshot_20261001_215450.png"
              alt="Verify signed-in customers card with the Set up button highlighted"
              width={1487}
              height={756}
              caption="The “Verify signed-in customers” card → press Set up."
            />
            <Screenshot
              src="/images/docs/Screenshot_20261001_215523.png"
              alt="Identity verification toggle switched on with the identity secret below it"
              width={1487}
              height={697}
              caption="Toggle Identity verification ON, then copy the elid_… secret."
            />
            <div className="mt-8 flex max-w-3xl gap-3 rounded-2xl border border-[#f0dcae] bg-[#fff9e9] p-5 text-sm leading-6 text-[#695b37]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <div>
                <strong>This secret is for your server only.</strong> Anyone who has it can chat as any of your users. Never put it in HTML, frontend JavaScript, or a git commit. If it ever leaks, press <strong>Rotate</strong> next to it, then update your backend with the new value.
              </div>
            </div>
            <ResultBox>
              <strong>Done when:</strong> the toggle is ON and the <code className="rounded bg-black/5 px-1 font-mono text-sm">elid_…</code> secret is copied somewhere safe on your side.
            </ResultBox>
          </section>

          {/* ══════════ STEP 5 — Tag manager ══════════ */}
          <section id="step-5" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-5"
              icon={Tag}
              title="Create your first tag in Tag manager"
              intro="A site tag connects one website to your workspace — and the chat bubble only appears on the domain you register here. So type your URL carefully."
            />
            <StepList>
              <>Open <strong className="text-[#313943]">Website tags</strong> (the tag manager) from your dashboard.</>
              <>Create your <strong className="text-[#313943]">first tag</strong>.</>
              <>When asked for the website, enter your <strong className="text-[#313943]">website URL</strong> exactly as visitors see it — for example <code className="rounded bg-black/5 px-1 font-mono text-sm">https://yourdomain.com</code>. Use your real, live domain — not localhost.</>
              <>Elpino creates the tag with a <strong className="text-[#313943]">public site key</strong> (starts with <code className="rounded bg-black/5 px-1 font-mono text-sm">rz_site_</code>). The status shows <strong className="text-[#313943]">Pending</strong> until the snippet is live on your site and verified.</>
            </StepList>
            <Screenshot
              src="/images/docs/Screenshot_20261001_215450.png"
              alt="Website tags table showing a tag with Pending status and its public rz_site_ key"
              width={1487}
              height={756}
              caption="Tag manager: one tag per website. Status starts as Pending; the public key (rz_site_…) is what goes in the snippet."
            />
            <TipBox>
              A workspace connects one website. To support another domain, create a separate workspace for it.
            </TipBox>
            <ResultBox>
              <strong>Done when:</strong> your tag exists in the table with your correct domain and you can open its installation snippet.
            </ResultBox>
          </section>

          {/* ══════════ STEP 6 — Install the snippet ══════════ */}
          <section id="step-6" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-6"
              icon={Code2}
              title="Install the snippet"
              intro="This is the only code that makes the chat bubble appear. Each tag has its own snippet — open your tag in the Tag manager and copy it. It looks like this:"
            />
            <CodeBlock
              title="HTML — paste before </head>"
              code={`<script async src="https://cdn.elpino.chat/tag.js" data-site-key="rz_site_f37c5236bc635e2dcf24a03c3d4a16"></script>`}
            />
            <h3 className="mt-10 max-w-3xl text-xl font-semibold tracking-[-0.02em]">Installation steps</h3>
            <StepList>
              <>Copy the snippet above — from <strong className="text-[#313943]">your own</strong> Tag manager, so it carries your tag&apos;s key.</>
              <>Paste it into <strong className="text-[#313943]">every page</strong> before <code className="rounded bg-black/5 px-1 font-mono text-sm">&lt;/head&gt;</code>.</>
              <>Publish your website, then <strong className="text-[#313943]">verify the tag</strong> in the Tag manager.</>
            </StepList>
            <TipBox>
              The <code className="rounded bg-black/5 px-1 font-mono text-sm">rz_site_…</code> key is public by design — it is visible in your page source anyway. It identifies your website; it is not a secret.
            </TipBox>

            <h3 className="mt-10 max-w-3xl text-xl font-semibold tracking-[-0.02em]">Have a Content-Security-Policy?</h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#626c78]">
              Add these to your existing policy — a strict CSP is enforced by your site, so this is the one thing we can&apos;t fix from our side. Without it the tag loads but the chat bubble silently never appears.
            </p>
            <CodeBlock
              title="CSP — add to script-src / connect-src / frame-src"
              code={`script-src https://cdn.elpino.chat;
connect-src https://cdn.elpino.chat https://api.elpino.chat wss://api.elpino.chat;
frame-src https://elpino-web-927489744703.europe-west1.run.app;`}
            />
            <div className="mt-4 max-w-3xl space-y-2 text-sm leading-6 text-[#626c78]">
              <p>What each line allows, in plain English:</p>
              <ul className="space-y-1">
                <li className="flex gap-2"><code className="shrink-0 rounded bg-black/5 px-1 font-mono text-xs">script-src</code><span>lets the browser download <code className="rounded bg-black/5 px-1 font-mono text-xs">tag.js</code> (the widget loader).</span></li>
                <li className="flex gap-2"><code className="shrink-0 rounded bg-black/5 px-1 font-mono text-xs">connect-src</code><span>lets the widget check your key, call Elpino&apos;s API, and keep the live chat connection open (that&apos;s the <code className="rounded bg-black/5 px-1 font-mono text-xs">wss://</code> websocket).</span></li>
                <li className="flex gap-2"><code className="shrink-0 rounded bg-black/5 px-1 font-mono text-xs">frame-src</code><span>lets the chat window itself load — it runs inside an iframe.</span></li>
              </ul>
            </div>
            <ResultBox>
              <strong>Done when:</strong> the page source of your <em>live</em> site shows the script tag with your key, and the tag is no longer &ldquo;Pending&rdquo; after you verify it.
            </ResultBox>
          </section>

          {/* ══════════ STEP 7 — Backend ══════════ */}
          <section id="step-7" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-7"
              icon={Code2}
              title="Wire up your backend"
              intro="Two things live on your server: the identity secret from step 4, and a small function that creates a short-lived token for each logged-in user. No login system on your site? Skip this step — the widget works fine for guest visitors without it."
            />

            <h3 className="mt-8 max-w-3xl text-xl font-semibold tracking-[-0.02em]">1. Store the secret in your backend environment</h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#626c78]">Put the <code className="rounded bg-black/5 px-1 font-mono text-sm">elid_…</code> secret from step 4 into your server&apos;s <code className="rounded bg-black/5 px-1 font-mono text-sm">.env</code> file. Keep that file out of git:</p>
            <CodeBlock
              title=".env — server-side only"
              code={`# Elpino identity secret — SERVER-SIDE ONLY. Never expose to the browser.
ELPINO_IDENTITY_SECRET=elid_your_secret_here`}
            />

            <h3 className="mt-10 max-w-3xl text-xl font-semibold tracking-[-0.02em]">2. Sign a short-lived token for logged-in users</h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#626c78]">Think of the token as a wristband your server hands to the browser: Elpino checks the signature before trusting anything it says. Create it in your existing login handler or page render. Node.js example (the full guide has Python, PHP, and Ruby versions):</p>
            <CodeBlock
              title="Node.js — npm install jsonwebtoken"
              code={`import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

// Call this from your existing authenticated page or login handler.
function elpinoIdentityToken(user) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({
    sub: String(user.id),          // stable account ID, required
    aud: "elpino-widget",
    jti: randomUUID(),             // fresh for every token
    iat: now,
    exp: now + 300,                // five minutes at most
    email: user.email,             // omit this line if the user has none
    email_verified: user.emailVerified === true,
    name: user.name,               // omit this line if the user has none
  }, process.env.ELPINO_IDENTITY_SECRET, { algorithm: "HS256" });
}`}
            />

            <h3 className="mt-10 max-w-3xl text-xl font-semibold tracking-[-0.02em]">3. Pass the token to the widget</h3>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#626c78]">On pages where the visitor is logged in, pass the token from your server to the Elpino tag you installed in step 6:</p>
            <CodeBlock
              title="HTML — after the tag snippet"
              code={`<!-- Use the token from your server's page data or login response -->
<script>
  window.$elpino = window.$elpino || [];
  // elpinoToken is the signed string generated by your backend.
  $elpino.push(["identify", { token: elpinoToken }]);
</script>`}
            />
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#626c78]">For single-page apps, tell the widget when login state changes without a reload:</p>
            <CodeBlock
              title="JavaScript — SPA login / logout"
              code={`// After login, pass the fresh token included in your login response:
$elpino.push(["identify", { token: loginResponse.elpinoToken }]);

// On logout or account switch, immediately:
$elpino.push(["logout"]);`}
            />
            <ResultBox>
              <strong>Done when:</strong> your server returns a fresh token for logged-in users and your pages pass it to <code className="rounded bg-black/5 px-1 font-mono text-sm">$elpino</code>. Full details and token claims: <Link href="/docs/identity-verification" className="font-semibold text-[#6b55d8] underline underline-offset-4">Identity verification guide</Link>.
            </ResultBox>
          </section>

          {/* ══════════ STEP 8 — Publish and verify ══════════ */}
          <section id="step-8" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-8"
              icon={CheckCircle2}
              title="Publish and verify"
              intro="Run through this checklist on your live site. Every item should pass before you call the install done."
            />
            <StepList>
              <>Hard-refresh your live site (<strong className="text-[#313943]">Ctrl+Shift+R</strong>) — the Elpino chat bubble appears in the bottom corner.</>
              <>Click the bubble — the widget opens with your greeting.</>
              <>Send a test message — the Elpino AI replies.</>
              <>Open your dashboard <strong className="text-[#313943]">Inbox</strong> — the test conversation is there.</>
              <>Back in the <strong className="text-[#313943]">Tag manager</strong>, the tag&apos;s status is no longer &ldquo;Pending&rdquo;.</>
            </StepList>
            <Screenshot
              src="/images/docs/Screenshot_20261001_234234.png"
              alt="Website with the Elpino chat bubble in the bottom right corner"
              width={1889}
              height={981}
              caption="1–2. The chat bubble on your live site; click it to open the widget."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Screenshot
                src="/images/docs/Screenshot_20261001_234250.png"
                alt="Elpino widget open with the greeting How can we help"
                width={1889}
                height={981}
                caption="3. The widget opens with your greeting."
              />
              <Screenshot
                src="/images/docs/Screenshot_20261001_233839.png"
                alt="Elpino team inbox showing the test conversation"
                width={1838}
                height={885}
                caption="4. The conversation appears in your Team Inbox."
              />
            </div>

            <h3 className="mt-10 max-w-3xl text-xl font-semibold tracking-[-0.02em]">If something doesn&apos;t work</h3>
            <div className="mt-6 max-w-3xl space-y-3">
              {[
                { problem: "The bubble never appears.", fix: "Open your live page's source (right-click → View page source) and check that the script tag is there, before </head>, with your own rz_site_ key. Then make sure the domain in the Tag manager matches the domain you're browsing. Ad blockers can hide it too — test in a clean/incognito window." },
                { problem: "The page source shows YOUR_SITE_KEY or a placeholder.", fix: "You copied the example snippet instead of your own. Open the Tag manager, open your tag, and copy its snippet." },
                { problem: "The browser console shows “Tag is not allowed on this domain”.", fix: "The domain you're browsing isn't registered on the tag. Fix the tag's website URL in the Tag manager — no rebuild needed." },
                { problem: "Your site sends a strict Content-Security-Policy.", fix: "Add the script-src, connect-src, and frame-src entries from step 6. Without them the tag loads but the bubble silently never appears." },
                { problem: "Identity tokens are refused.", fix: "The widget falls back to guest chat and logs “[Elpino] Identity token was not accepted: <reason>” in the console. Check that ELPINO_IDENTITY_SECRET on your server matches the dashboard secret, then see the identity verification guide's troubleshooting table." },
              ].map(({ problem, fix }) => (
                <div key={problem} className="rounded-2xl border border-black/10 bg-[#faf9f6] p-5">
                  <p className="font-semibold text-[#313943]">{problem}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[#626c78]">{fix}</p>
                </div>
              ))}
            </div>
            <Link href="/docs/troubleshooting" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6b55d8]">
              Full troubleshooting guide <ArrowRight size={14} />
            </Link>
            <ResultBox>
              <strong>All items pass?</strong> Installation is complete — Elpino is live on your website.
            </ResultBox>
          </section>

          {/* ══════════ STEP 9 — Knowledge ══════════ */}
          <section id="step-9" className="scroll-mt-40 border-b border-black/10 py-14">
            <StepHeader
              id="step-9"
              icon={BookOpen}
              title="Teach the AI (add knowledge)"
              intro="The AI only answers from the knowledge you add and publish. An empty knowledge base means it has nothing to say — visitors get &ldquo;I couldn&apos;t find any pricing info for this site&rdquo; instead of real answers."
            />
            <StepList>
              <>In the dashboard, open <strong className="text-[#313943]">Knowledge</strong>.</>
              <>Pick a source type: <strong className="text-[#313943]">Pages</strong> to write or paste help articles, <strong className="text-[#313943]">URLs</strong> to let Elpino read pages from your website, or upload files.</>
              <>Create the page or add the URL, and attach it to your site (the &ldquo;Attached to&rdquo; column shows which site uses it).</>
              <>Switch on the <strong className="text-[#313943]">Shown</strong> toggle to publish the source. Anything not shown — or still being read by Elpino — is never used for answers.</>
              <>Test it: open the widget on your live site and ask a question your new knowledge should answer.</>
            </StepList>
            <Screenshot
              src="/images/docs/Screenshot_20261001_233950.png"
              alt="Knowledge pages list with the Create page button and the Shown toggle"
              width={1838}
              height={885}
              caption="Knowledge → Pages: create pages or add URLs, then use the Shown toggle to publish each source for the AI."
            />
            <TipBox>
              Write the knowledge the way customers ask: pricing, refunds, shipping, account issues. Short, factual pages answer better than one long page covering everything.
            </TipBox>
            <ResultBox>
              <strong>Done when:</strong> your sources show as Shown in Knowledge, and the live widget answers questions using them.
            </ResultBox>
          </section>

          {/* ── Next steps ── */}
          <section id="next" className="scroll-mt-40 py-14">
            <h2 className="text-3xl font-semibold tracking-[-0.035em]">After you&apos;re live</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#626c78]">All nine steps done? Your AI answers from your knowledge and lands conversations in your inbox. Go deeper when you&apos;re ready:</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Link href="/docs/inbox" className="group rounded-2xl border border-black/10 p-5 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                <h3 className="font-semibold">Work conversations as a team</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#667069]">Claim, route, reply to, and resolve conversations that need a human in the shared Team Inbox.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#7651b0]">Team inbox guide <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
              </Link>
              <Link href="/docs/ai-answers" className="group rounded-2xl border border-black/10 p-5 transition hover:border-[#bf91ff] hover:bg-[#f8f3ff]">
                <h3 className="font-semibold">Tune AI answers and handoff</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#667069]">Understand how answers are generated, when the AI escalates to a human, and how to prepare better sources.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#7651b0]">AI answers guide <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
              </Link>
            </div>

            <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#e8eaed] pt-8 text-sm sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">Stuck on a step?</p>
                <p className="mt-1 text-xs text-[#757d87]">Tell us where you are in the guide and we&apos;ll help you finish it.</p>
              </div>
              <Link href="/contact" className="inline-flex items-center gap-1 font-medium text-[#6b55d8]">
                Contact support <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </main>

        {/* ── Right "On this page" sidebar ── */}
        <aside className="hidden border-l border-black/30 bg-white px-6 py-16 xl:block">
          <div className="sticky top-[132px]">
            <p className="mb-3 text-xs font-semibold text-[#343b45]">On this page</p>
            <nav className="space-y-0.5 pl-4 text-sm text-[#757d87]">
              <Link className="block hover:text-black" href="#overview">Overview</Link>
              {steps.map(({ id, label }) => (
                <Link key={id} className="block hover:text-black" href={`#${id}`}>{label}</Link>
              ))}
              <Link className="block hover:text-black" href="#next">After you&apos;re live</Link>
            </nav>
          </div>
        </aside>
      </div>

      <GlossyDocsSearch />
    </div>
  );
}
