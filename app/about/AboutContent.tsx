"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Check, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";

// About, told as a conversation: Elpino tells its own story in a chat, the
// crew "join the chat" one by one, and the FAQ is a chat you can ask into.
// Same words as before, just spoken instead of laid out.

type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — same convention as the home/pricing pages:
 * t()'s traversal really does hand back the raw JSON value (array or not)
 * even though its declared return type is `string`. Falls back to the
 * English array wholesale when the locale hasn't got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

// Images stay fixed per role; only the words are translated.
const roleMeta = [
  { image: "/images/contact-support-sloth.png" },
  { image: "/images/help-center-sloth.png" },
  { image: "/images/trust-sloth.png" },
  { image: "/images/revenue-sloth.png" },
];

const slothRolesEn = [
  { title: "The Listener", task: "Understands every customer question", description: "Turns the knowledge your team already has into a clear, useful first answer." },
  { title: "The Sorter", task: "Keeps the inbox moving", description: "Finds the signal in the queue, so the right conversations get the right attention." },
  { title: "The Protector", task: "Knows when to bring in a person", description: "Handles routine work with care and hands over the moments that need human judgment." },
  { title: "The Grower", task: "Learns what helps customers most", description: "Surfaces the gaps, patterns, and questions that make your support better over time." },
];

const faqsEn: [string, string][] = [
  ["What is Elpino?", "Elpino is an AI customer support platform with a website chat widget, answers from your knowledge base, a shared team inbox, and human handoff when the AI cannot help."],
  ["Does Elpino replace my support team?", "Elpino handles everyday questions from your knowledge and brings your team in when a conversation needs a person. Your team stays part of the support experience."],
  ["How can I get started?", "Start with the free plan, which includes 100 AI messages each month with no card required. Add your knowledge, connect your website, and bring in your teammates."],
  ["How is pricing structured?", "Free includes 100 AI messages a month, and paid plans include a monthly AI credit. Seats are unlimited on every plan, and handing a conversation to a human never costs extra. The pricing page explains the details."],
];

// ------------------------------------------------------------ chat parts

function Avatar({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/contact-support-sloth.png" alt="" style={{ height: size, width: size }} className="shrink-0 rounded-full border border-black/15 bg-white object-cover object-top" />
  );
}

function TypingDots({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 px-1 py-1" aria-label={label}>
      {[0, 1, 2].map((dot) => <span key={dot} className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#0078f4]" style={{ animationDelay: `${dot * 0.15}s` }} />)}
    </span>
  );
}

// A message that types itself out when it scrolls into view: three bouncing
// dots first, then the words.
// Several messages in a row from Elpino show one avatar, on the last of them; the others keep the same indent (avatar={false}).
function Msg({ from, children, delay = 0, typing = 900, className = "", typingLabel, avatar = true }: { from: "elpino" | "you"; children: ReactNode; delay?: number; typing?: number; className?: string; typingLabel: string; avatar?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "typing" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setPhase("shown"); return; }
    let t1 = 0;
    let t2 = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      t1 = window.setTimeout(() => {
        setPhase(from === "you" ? "shown" : "typing");
        if (from === "elpino") t2 = window.setTimeout(() => setPhase("shown"), typing);
      }, delay);
    }, { threshold: 0.4, rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [from, delay, typing]);

  const mine = from === "you";
  return (
    <div ref={ref} className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""} ${className}`}>
      {!mine && (avatar ? <Avatar /> : <span aria-hidden="true" className="w-9 shrink-0" />)}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[16px] leading-7 transition-all duration-500 ${mine ? "rounded-br-md bg-[#0078f4] text-white" : "rounded-bl-md bg-[#f4f4f2] text-[#11120f]"} ${phase === "idle" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}
      >
        {phase === "typing" ? <TypingDots label={typingLabel} /> : phase === "shown" ? children : <span className="invisible">…</span>}
      </div>
    </div>
  );
}

function SystemLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1 text-[12.5px] text-black/45">
      <span className="h-px flex-1 bg-black/15" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-black/15" />
    </div>
  );
}

function ChatWindow({ title, sub, children, className = "" }: { title: string; sub: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[10px] border border-black/40 bg-white ${className}`}>
      <header className="flex items-center gap-3 border-b border-black/15 bg-white px-5 py-3.5">
        <Avatar size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-5">{title}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-black/50">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#1aa37a]/70" /><span className="relative h-2 w-2 rounded-full bg-[#1aa37a]" /></span>
            {sub}
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}

// The FAQ is a chat: tap a question, and Elpino answers.
function FaqChat({ t }: { t: T }) {
  const faqs = tList<[string, string]>(t, "about.faqs", faqsEn);
  const [asked, setAsked] = useState<number[]>([0]);
  const logRef = useRef<HTMLDivElement>(null);
  const remaining = faqs.map((_, index) => index).filter((index) => !asked.includes(index));

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [asked]);

  return (
    <ChatWindow title={t("about.faqChat.title", "Ask Elpino")} sub={t("about.faqChat.sub", "Online · replies instantly")}>
      <div ref={logRef} className="max-h-[520px] space-y-4 overflow-y-auto p-5 sm:p-7" aria-live="polite">
        <SystemLine>{t("about.faqChat.gladYouAsked", "Glad you asked")}</SystemLine>
        {asked.map((index) => (
          <div key={index} className="space-y-4">
            <Msg from="you" className="animate-[elpino-focus_0.4s_ease-out_both]" typingLabel={t("about.typingLabel", "Elpino is typing")}>{faqs[index][0]}</Msg>
            <Msg from="elpino" delay={250} typing={1100} typingLabel={t("about.typingLabel", "Elpino is typing")}>{faqs[index][1]}</Msg>
          </div>
        ))}
      </div>
      <div className="border-t border-black/15 bg-white p-4 sm:p-5">
        {remaining.length ? (
          <>
            <p className="mb-3 text-[13px] text-black/50">{t("about.faqChat.tapQuestion", "Tap a question")}</p>
            <div className="flex flex-wrap gap-2">
              {remaining.map((index) => (
                <button key={index} type="button" onClick={() => setAsked((current) => [...current, index])} className="rounded-full border border-black/25 bg-white px-4 py-2 text-[14px] font-medium text-[#11120f] transition hover:border-black/60">
                  {faqs[index][0]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-black/60">{t("about.faqChat.doneText", "That's everything for now. Want to keep going?")}</p>
            <Link href="/faq" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0078f4] underline underline-offset-4">{t("about.faqChat.exploreFull", "Explore the full FAQ")} <ArrowRight size={15} /></Link>
          </div>
        )}
      </div>
    </ChatWindow>
  );
}

// ------------------------------------------------------------ page

export function AboutContent() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const slothRoles = tList<{ title: string; task: string; description: string }>(t, "about.roles.items", slothRolesEn);
  const typingLabel = t("about.typingLabel", "Elpino is typing");

  return (
    <main className="overflow-x-clip bg-white text-[#11120f]">
      {/* Hero */}
      <section className="bg-white px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <h1 className="animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {t("about.hero.titlePrefix", "Customer support, ")}{t("about.hero.titleHl", "made more human.")}
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
              {t("about.hero.subtitle", "Elpino gives customers useful answers from the knowledge you already have, then keeps your team close for the moments that need a person.")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-7 text-[15px] font-medium text-white transition hover:opacity-85">
                {t("about.hero.ctaMeet", "Meet Elpino")} <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#our-story" className="inline-flex h-12 items-center rounded-full border border-black/25 bg-white px-7 text-[15px] font-medium transition hover:border-black/60">{t("about.hero.ctaReadStory", "Read our story ↓")}</a>
            </div>
          </div>
          <div className="animate-[elpino-focus_0.9s_ease-out_0.25s_both]">
            <Image src="/images/about-sloth-crew.png" alt={t("about.hero.imageAlt", "Four Elpino sloths working together to support customers")} width={1774} height={887} priority sizes="(min-width: 1024px) 54vw, 100vw" className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* Our story, as a chat */}
      <section id="our-story" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 border-t border-black/20 pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.story.titlePrefix", "Our story starts with a ")}{t("about.story.titleHl", "question.")}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">{t("about.story.subtitle", "What if customer support software helped both sides of the conversation—not just the company managing it?")}</p>
          </Rv>

          <Rv variant="up">
            <ChatWindow title={t("about.story.chatTitle", "Elpino")} sub={t("about.story.chatSub", "Telling our story")}>
              <div className="space-y-4 p-5 sm:p-7">
                <SystemLine>{t("about.story.sys1", "Where it began")}</SystemLine>
                <Msg from="you" typingLabel={typingLabel}>{t("about.story.you1", "What if customer support software helped both sides of the conversation, not just the company managing it?")}</Msg>
                <Msg from="elpino" avatar={false} delay={300} typingLabel={typingLabel}>{t("about.story.elpino1", "Nobody opens a support chat for fun.")}</Msg>
                <Msg from="elpino" avatar={false} typing={1300} typingLabel={typingLabel}>{t("about.story.elpino2", "Someone is trying to get something done. Something got in the way. They want a clear answer and to get back to their day.")}</Msg>
                <Msg from="elpino" typing={1500} typingLabel={typingLabel}>{t("about.story.elpino3", "On the other side is a team handling familiar questions, scattered information, and more conversations than time. Elpino exists to make that moment easier for everyone.")}</Msg>

                <SystemLine>{t("about.story.sys2", "Here's what that looks like")}</SystemLine>
                <Msg from="you" typingLabel={typingLabel}>{t("about.story.you2", "Can I change the email address on my account?")}</Msg>
                <div className="flex items-end gap-2.5">
                  <Avatar />
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#11120f] px-4 py-3 text-white">
                    <p className="flex items-center gap-2 text-[12px] font-medium text-[#1aa37a]"><Sparkles size={13} /> {t("about.story.aiLabel", "Elpino AI · from your knowledge")}</p>
                    <p className="mt-2 text-[16px] leading-7">{t("about.story.aiAnswer", "Yes. Open Settings, choose Profile, then update your contact email.")}</p>
                    <p className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3 text-[12.5px] text-white/60"><BookOpen size={13} /> {t("about.story.aiGuideLabel", "Account settings guide")} <Check size={13} className="ml-auto text-[#1aa37a]" /></p>
                  </div>
                </div>
                <SystemLine>{t("about.story.sys3", "A teammate is always close when needed")}</SystemLine>
              </div>
            </ChatWindow>
          </Rv>
        </div>
      </section>

      {/* The crew joins the chat */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px] border-t border-black/20 pt-16">
          <Rv className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.roles.titlePrefix", "A crew built for ")}{t("about.roles.titleHl", "the work.")}</h2>
            <p className="max-w-xl text-lg leading-8 text-black/60">{t("about.roles.subtitle", "There are no employee headshots here. Instead, meet the jobs Elpino is designed to do—steadily, thoughtfully, and with a human team always in the loop.")}</p>
          </Rv>

          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
            {slothRoles.map((role, index) => {
              const meta = roleMeta[index] ?? roleMeta[0];
              return (
                <Rv key={role.title} variant="deal" delay={(index % 4) * 120}>
                  <SystemLine>{t("about.roles.joinedChat", "{name} joined the chat").replace("{name}", role.title)}</SystemLine>
                  <article className="group mt-4 overflow-hidden rounded-[10px] border border-black/40 bg-white">
                    <div className="relative h-64 overflow-hidden border-b border-black/15 bg-[#f4f4f2]">
                      <Image src={meta.image} alt={`${role.title} sloth`} width={1145} height={1374} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" className="absolute bottom-[-10%] left-1/2 h-[112%] w-auto max-w-none -translate-x-1/2 object-contain transition duration-500 group-hover:-translate-y-2" />
                      <span className="absolute left-4 top-4 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium text-black/60 shadow-[0_0_0_1px_rgba(17,18,15,0.12)]">0{index + 1}</span>
                    </div>
                    <div className="p-6">
                      <p className="text-[13px] text-black/50">{role.task}</p>
                      <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">{role.title}</h3>
                      <p className="mt-3 text-[15.5px] leading-7 text-black/60">{role.description}</p>
                    </div>
                  </article>
                </Rv>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built remote */}
      <section className="bg-[#11120f] px-5 py-20 text-white sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Rv>
            <h2 className="max-w-xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.remote.titlePrefix", "We've been working remotely since ")}{t("about.remote.titleHl", "day one.")}</h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-white/60">{t("about.remote.subtitle", "We work through clear writing, shared context, and focused time. Where someone works matters less than the care and judgment they bring to the product.")}</p>
            <Link href="/careers" className="group mt-8 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-medium text-[#11120f] transition hover:opacity-90">
              {t("about.remote.cta", "See open roles")} <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Rv>
          <Rv variant="deal" delay={120}>
            <Image src="/about-remote-team.png" alt={t("about.remote.imageAlt", "A distributed team collaborating with shared AI support tools")} width={1456} height={1086} sizes="(min-width: 1024px) 55vw, 100vw" className="h-full min-h-[380px] w-full rounded-[10px] object-cover" />
          </Rv>
        </div>
      </section>

      {/* A small team, for now */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Rv>
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.team.titleLine1", "Built with focus.")}<br />{t("about.team.titleLine2Prefix", "Shaped with ")}{t("about.team.titleHl", "you.")}</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60">{t("about.team.subtitle", "Elpino is early. That means the people using it can still influence what it becomes. We listen closely, ship carefully, and keep the customer's problem at the center.")}</p>
            <Link href="/contact" className="group mt-9 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">
              {t("about.team.cta", "Talk to us")} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Rv>
          <div className="grid grid-cols-2 gap-4">
            <Rv variant="deal">
              <div className="flex h-full min-h-[190px] flex-col justify-between rounded-[10px] border border-black/40 bg-white p-6 transition-transform duration-300 hover:-translate-y-1"><MessageCircle size={28} className="text-[#0078f4]" /><p className="text-2xl tracking-[-0.03em]">{t("about.team.card1", "Listen closely.")}</p></div>
            </Rv>
            <Rv variant="deal" delay={130}>
              <div className="flex h-full min-h-[190px] flex-col justify-between rounded-[10px] border border-black/40 bg-white p-6 transition-transform duration-300 hover:-translate-y-1"><Sparkles size={28} className="text-[#0078f4]" /><p className="text-2xl tracking-[-0.03em]">{t("about.team.card2", "Build clearly.")}</p></div>
            </Rv>
            <Rv variant="deal" delay={260} className="col-span-2">
              <div className="flex min-h-[170px] items-end justify-between gap-4 rounded-[10px] bg-[#f4f4f2] p-6 transition-transform duration-300 hover:-translate-y-1"><p className="max-w-[16ch] text-3xl leading-tight tracking-[-0.035em]">{t("about.team.card3", "Make support easier for everyone.")}</p><Heart size={32} className="shrink-0 animate-[elpino-float_4s_ease-in-out_infinite] text-[#0078f4]" /></div>
            </Rv>
          </div>
        </div>
      </section>

      {/* FAQ, as a chat */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 border-t border-black/20 pt-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.faqSection.titlePrefix", "Glad you ")}{t("about.faqSection.titleHl", "asked.")}</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-black/60">{t("about.faqSection.subtitle", "A few answers before you start a conversation of your own. Tap a question below and Elpino will reply.")}</p>
            <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-[#0078f4] underline decoration-1 underline-offset-4">{t("about.faqSection.exploreLink", "Explore the full FAQ →")}</Link>
          </Rv>
          <Rv variant="up"><FaqChat t={t} /></Rv>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-white px-5 pb-24 pt-4 sm:px-8 lg:px-20">
        <Rv className="mx-auto max-w-[1500px]">
          <div className="rounded-tl-[2rem] border border-black/20 bg-[#f4f4f2] px-7 py-14 sm:px-14 sm:py-20">
            <h2 className="max-w-3xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("about.closing.titleLine1", "There's more to build.")}<br />{t("about.closing.titleLine2", "Come shape what's next.")}</h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[#11120f] px-8 text-[15px] font-medium text-white transition hover:opacity-85">{t("about.closing.ctaTry", "Try Elpino")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/careers" className="inline-flex h-12 items-center gap-2 rounded-full border border-black/25 bg-white px-8 text-[15px] font-medium transition hover:border-black/60">{t("about.closing.ctaCareers", "See open roles")} <ArrowRight size={16} /></Link>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
