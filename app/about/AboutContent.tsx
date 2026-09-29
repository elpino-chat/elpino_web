"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Check, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// About, told as a conversation: Elpino tells its own story in a chat, the
// crew "join the chat" one by one, and the FAQ is a chat you can ask into.
// Same words as before, just spoken instead of laid out.

const INK = "#11120f";

const slothRoles = [
  { title: "The Listener", task: "Understands every customer question", description: "Turns the knowledge your team already has into a clear, useful first answer.", image: "/images/contact-support-sloth.png", color: "#fc7b33" },
  { title: "The Sorter", task: "Keeps the inbox moving", description: "Finds the signal in the queue, so the right conversations get the right attention.", image: "/images/help-center-sloth.png", color: "#3784ff" },
  { title: "The Protector", task: "Knows when to bring in a person", description: "Handles routine work with care and hands over the moments that need human judgment.", image: "/images/trust-sloth.png", color: "#7060bd" },
  { title: "The Grower", task: "Learns what helps customers most", description: "Surfaces the gaps, patterns, and questions that make your support better over time.", image: "/images/revenue-sloth.png", color: "#1aa37a" },
];

const faqs: [string, string][] = [
  ["What is Elpino?", "Elpino is an AI customer support platform with a website chat widget, answers from your knowledge base, a shared team inbox, and human handoff when the AI cannot help."],
  ["Does Elpino replace my support team?", "Elpino handles everyday questions from your knowledge and brings your team in when a conversation needs a person. Your team stays part of the support experience."],
  ["How can I get started?", "Start with the free plan, which includes 100 AI messages each month with no card required. Add your knowledge, connect your website, and bring in your teammates."],
  ["How is pricing structured?", "Free includes 100 AI messages a month, and paid plans include a monthly AI credit. Extra teammates come in seat packs from $0.60 a seat, and handing a conversation to a human never costs extra. The pricing page explains included seats and the free-plan minimum charge."],
];

// ------------------------------------------------------------ chat parts

function Avatar({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/contact-support-sloth.png" alt="" style={{ height: size, width: size }} className="shrink-0 rounded-full border-2 border-[#11120f] bg-white object-cover object-top" />
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1.5 px-1 py-1" aria-label="Elpino is typing">
      {[0, 1, 2].map((dot) => <span key={dot} className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#3784ff]" style={{ animationDelay: `${dot * 0.15}s` }} />)}
    </span>
  );
}

// A message that types itself out when it scrolls into view: three bouncing
// dots first, then the words.
function Msg({ from, children, delay = 0, typing = 900, className = "" }: { from: "elpino" | "you"; children: ReactNode; delay?: number; typing?: number; className?: string }) {
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
      {!mine && <Avatar />}
      <div
        className={`max-w-[85%] rounded-2xl border-2 border-[#11120f] px-4 py-3 text-[16px] leading-7 transition-all duration-500 ${mine ? "rounded-br-md bg-[#3784ff] text-white" : "rounded-bl-md bg-white text-[#11120f]"} ${phase === "idle" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}
      >
        {phase === "typing" ? <TypingDots /> : phase === "shown" ? children : <span className="invisible">…</span>}
      </div>
    </div>
  );
}

function SystemLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1 text-[12.5px] text-black/45">
      <span className="h-px flex-1 border-t-2 border-dashed border-black/20" />
      <span className="font-mono uppercase tracking-[0.08em]">{children}</span>
      <span className="h-px flex-1 border-t-2 border-dashed border-black/20" />
    </div>
  );
}

function ChatWindow({ title, sub, children, className = "" }: { title: string; sub: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#fffdf5] ${className}`}>
      <header className="flex items-center gap-3 border-b-2 border-[#11120f] bg-white px-5 py-3.5">
        <Avatar size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-5">{title}</p>
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-black/45">
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
function FaqChat() {
  const [asked, setAsked] = useState<number[]>([0]);
  const logRef = useRef<HTMLDivElement>(null);
  const remaining = faqs.map((_, index) => index).filter((index) => !asked.includes(index));

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [asked]);

  return (
    <ChatWindow title="Ask Elpino" sub="Online · replies instantly">
      <div ref={logRef} className="max-h-[520px] space-y-4 overflow-y-auto p-5 sm:p-7" aria-live="polite">
        <SystemLine>Glad you asked</SystemLine>
        {asked.map((index) => (
          <div key={index} className="space-y-4">
            <Msg from="you" className="animate-[elpino-focus_0.4s_ease-out_both]">{faqs[index][0]}</Msg>
            <Msg from="elpino" delay={250} typing={1100}>{faqs[index][1]}</Msg>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-[#11120f] bg-white p-4 sm:p-5">
        {remaining.length ? (
          <>
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-black/45">Tap a question</p>
            <div className="flex flex-wrap gap-2">
              {remaining.map((index) => (
                <button key={index} type="button" onClick={() => setAsked((current) => [...current, index])} className="rounded-full border-2 border-[#11120f] bg-[#eef4ff] px-4 py-2 text-[14px] font-semibold text-[#11120f] transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">
                  {faqs[index][0]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-black/60">That&apos;s everything for now. Want to keep going?</p>
            <Link href="/faq" className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 text-[14px] font-semibold transition hover:-translate-y-0.5">Explore the full FAQ <ArrowRight size={15} /></Link>
          </div>
        )}
      </div>
    </ChatWindow>
  );
}

// ------------------------------------------------------------ page

export function AboutContent() {
  return (
    <main className="overflow-x-clip bg-white text-[#11120f]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto grid max-w-[1300px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">About Elpino</p>
            <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-7xl">
              Customer support, <span className="hl-load">made more human.</span>
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
              Elpino gives customers useful answers from the knowledge you already have, then keeps your team close for the moments that need a person.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
                Meet Elpino <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#our-story" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Read our story ↓</a>
            </div>
          </div>
          <div className="relative animate-[elpino-focus_0.9s_ease-out_0.25s_both]">
            <div aria-hidden="true" className="absolute inset-6 rounded-full bg-[#7060bd]/20 blur-3xl" />
            <Image src="/images/about-sloth-crew.png" alt="Four Elpino sloths working together to support customers" width={1774} height={887} priority sizes="(min-width: 1024px) 54vw, 100vw" className="relative h-auto w-full" />
            {/* a chat bubble, popping up beside the crew */}
            <span aria-hidden="true" className="absolute -top-2 right-2 hidden -rotate-3 animate-[elpino-pop_0.6s_ease-out_1.2s_both] rounded-2xl rounded-br-md border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold sm:block">Hi, how can we help? 👋</span>
          </div>
        </div>
      </section>

      {/* Our story, as a chat */}
      <section id="our-story" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">Where it began</p>
            <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">Our story starts with a <span className="hl">question.</span></h2>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">What if customer support software helped both sides of the conversation—not just the company managing it?</p>
          </Rv>

          <Rv variant="up">
            <ChatWindow title="Elpino" sub="Telling our story">
              <div className="space-y-4 p-5 sm:p-7">
                <SystemLine>Where it began</SystemLine>
                <Msg from="you">What if customer support software helped both sides of the conversation, not just the company managing it?</Msg>
                <Msg from="elpino" delay={300}>Nobody opens a support chat for fun.</Msg>
                <Msg from="elpino" typing={1300}>Someone is trying to get something done. Something got in the way. They want a clear answer and to get back to their day.</Msg>
                <Msg from="elpino" typing={1500}>On the other side is a team handling familiar questions, scattered information, and more conversations than time. Elpino exists to make that moment easier for everyone.</Msg>

                <SystemLine>Here&apos;s what that looks like</SystemLine>
                <Msg from="you">Can I change the email address on my account?</Msg>
                <div className="flex items-end gap-2.5">
                  <Avatar />
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border-2 border-[#11120f] bg-[#11120f] px-4 py-3 text-white">
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#ffd84d]"><Sparkles size={13} /> Elpino AI · from your knowledge</p>
                    <p className="mt-2 text-[16px] leading-7">Yes. Open Settings, choose Profile, then update your contact email.</p>
                    <p className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3 text-[12.5px] text-white/60"><BookOpen size={13} /> Account settings guide <Check size={13} className="ml-auto text-[#ffd84d]" /></p>
                  </div>
                </div>
                <SystemLine>A teammate is always close when needed</SystemLine>
              </div>
            </ChatWindow>
          </Rv>
        </div>
      </section>

      {/* The crew joins the chat */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#1aa37a]">Our roles</p>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">A crew built for <span className="hl">the work.</span></h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-black/60">There are no employee headshots here. Instead, meet the jobs Elpino is designed to do—steadily, thoughtfully, and with a human team always in the loop.</p>
          </Rv>

          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2">
            {slothRoles.map((role, index) => (
              <Rv key={role.title} variant="deal" delay={(index % 2) * 140}>
                <SystemLine>{role.title} joined the chat</SystemLine>
                <article className="group mt-4 overflow-hidden rounded-[26px] border-2 border-[#11120f] bg-white transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.5deg]">
                  <div className="relative h-72 overflow-hidden border-b-2 border-[#11120f]" style={{ background: role.color }}>
                    <div aria-hidden="true" className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "20px 20px" }} />
                    <Image src={role.image} alt={`${role.title} sloth`} width={1145} height={1374} sizes="(min-width: 640px) 45vw, 100vw" className="absolute bottom-[-10%] left-1/2 h-[112%] w-auto max-w-none -translate-x-1/2 object-contain transition duration-500 group-hover:-translate-y-3" />
                    <span className="absolute left-4 top-4 -rotate-3 rounded-full border-2 border-[#11120f] bg-white px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#11120f]">0{index + 1}</span>
                  </div>
                  <div className="p-6">
                    <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-black/45">{role.task}</p>
                    <h3 className="mt-2 text-3xl font-normal tracking-[-0.04em]">{role.title}</h3>
                    <p className="mt-3 text-[16px] leading-7 text-black/60">{role.description}</p>
                  </div>
                </article>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* Built remote */}
      <section className="bg-[#11120f] px-5 py-20 text-[#fff8ec] sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1300px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Rv>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#ffd84d]">Built remote</p>
            <h2 className="mt-4 max-w-xl text-4xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">We’ve been working remotely since <span className="text-[#fc7b33]">day one.</span></h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#fff8ec]/60">We work through clear writing, shared context, and focused time. Where someone works matters less than the care and judgment they bring to the product.</p>
            <Link href="/careers" className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#fff8ec] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">
              See open roles <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Rv>
          <Rv variant="deal" delay={120}>
            <div className="relative">
              <span aria-hidden="true" className="absolute -top-4 left-6 z-10 -rotate-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-4 py-1 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-[#11120f]">Remote since day one</span>
              <div className="overflow-hidden rounded-[28px] border-2 border-[#fff8ec]/70 p-2">
                <Image src="/about-remote-team.png" alt="A distributed team collaborating with shared AI support tools" width={1456} height={1086} sizes="(min-width: 1024px) 55vw, 100vw" className="h-full min-h-[380px] w-full rounded-[20px] object-cover" />
              </div>
            </div>
          </Rv>
        </div>
      </section>

      {/* A small team, for now */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1300px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Rv>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">A small team, for now</p>
            <h2 className="mt-4 text-4xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">Built with focus.<br />Shaped with <span className="hl">you.</span></h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60">Elpino is early. That means the people using it can still influence what it becomes. We listen closely, ship carefully, and keep the customer’s problem at the center.</p>
            <Link href="/contact" className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-8 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
              Talk to us <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Rv>
          <div className="grid grid-cols-2 gap-4">
            <Rv variant="deal">
              <div className="flex h-full min-h-[190px] -rotate-2 flex-col justify-between rounded-[24px] border-2 border-[#11120f] bg-[#fc7b33] p-6 text-white transition duration-300 hover:rotate-0"><MessageCircle size={30} /><p className="text-2xl tracking-[-0.03em]">Listen closely.</p></div>
            </Rv>
            <Rv variant="deal" delay={130}>
              <div className="flex h-full min-h-[190px] rotate-2 flex-col justify-between rounded-[24px] border-2 border-[#11120f] bg-[#3784ff] p-6 text-white transition duration-300 hover:rotate-0"><Sparkles size={30} /><p className="text-2xl tracking-[-0.03em]">Build clearly.</p></div>
            </Rv>
            <Rv variant="deal" delay={260} className="col-span-2">
              <div className="flex min-h-[170px] items-end justify-between gap-4 rounded-[24px] border-2 border-[#11120f] bg-[#ffd84d] p-6 transition duration-300 hover:-translate-y-1"><p className="max-w-[16ch] text-3xl leading-tight tracking-[-0.04em]">Make support easier for everyone.</p><Heart size={34} className="shrink-0 animate-[elpino-float_4s_ease-in-out_infinite]" /></div>
            </Rv>
          </div>
        </div>
      </section>

      {/* FAQ, as a chat */}
      <section className="bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Rv className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#3784ff]">A little more about us</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Glad you <span className="hl">asked.</span></h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-black/60">A few answers before you start a conversation of your own. Tap a question below and Elpino will reply.</p>
            <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold underline decoration-[#3784ff] decoration-2 underline-offset-4">Explore the full FAQ →</Link>
          </Rv>
          <Rv variant="up"><FaqChat /></Rv>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-white px-5 pb-24 pt-20 sm:px-8">
        <Rv variant="pop" className="mx-auto max-w-[1300px]">
          <div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#3784ff] px-7 py-14 text-center text-white sm:px-14 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
            <h2 className="mx-auto max-w-3xl text-4xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">There’s more to build.<br /><span className="text-[#ffd84d]">Come shape what’s next.</span></h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-8 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Try Elpino <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/careers" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-8 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">See open roles <ArrowRight size={16} /></Link>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
