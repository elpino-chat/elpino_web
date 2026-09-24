"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BookOpen, Check, FileText, Inbox, MessageCircle, Plus, ShieldCheck, Sparkles, Users, X } from "lucide-react";

const wrap = 'mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-16';
const heading = 'text-[clamp(2.25rem,4.6vw,4.5rem)] font-medium uppercase leading-[0.98] tracking-[-0.055em]';
const pill = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 sm:min-h-14 sm:px-7 sm:text-base';

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? undefined : { opacity: [0.35, 1], y: [24, 0] }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function Stripes({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute overflow-hidden ${className}`}><div className="absolute inset-0 bg-[repeating-linear-gradient(130deg,transparent_0px,transparent_7px,#bd91ff_7px,#bd91ff_9px)] [mask-image:linear-gradient(135deg,transparent_15%,black_100%)]" /></div>;
}

function Eyebrow({ children }: { children: ReactNode }) { return <p className="mb-6 text-xs font-medium uppercase tracking-[0.08em] sm:text-sm">{children}</p>; }

const features = [
  { label: 'AI AGENT', title: 'Your best answers,\nready on repeat.', detail: 'Elpino searches your help articles, pages, and documents to answer customer questions from the knowledge you provide.', icon: Sparkles, color: 'bg-[#dceee8]' },
  { label: 'SHARED INBOX', title: 'One workspace.\nYour whole team.', detail: 'Keep conversations, replies, and customer context together. Your teammates can pick up where the conversation left off.', icon: Inbox, color: 'bg-[#e5e3f1]' },
  { label: 'HUMAN HANDOFF', title: 'Knows when\nto bring you in.', detail: 'When AI cannot help, it passes the conversation to your team with a reason for the handoff and the full conversation.', icon: Users, color: 'bg-[#e6eddb]' },
  { label: 'KNOWLEDGE BASE', title: 'Your knowledge.\nPut to work.', detail: 'Bring website pages, uploaded documents, and help articles into the knowledge base your AI uses to answer.', icon: BookOpen, color: 'bg-[#eee4d8]' },
];

function MiniProduct({ index }: { index: number }) {
  return <div className="relative mx-auto mt-12 w-full max-w-[340px] rounded-xl border border-white bg-white/35 p-3 shadow-lg">
    <div className="min-h-[205px] rounded-lg bg-white p-5 text-[#192016]">
      <div className="mb-5 flex items-center justify-between text-xs font-medium">{['Answer sources', 'Team inbox', 'Conversation handoff', 'Knowledge library'][index]}<span className="size-2 rounded-full bg-[#0bcea3]" /></div>
      {index === 0 || index === 3 ? <div className="space-y-3">{['Getting started', 'Billing & plans', 'Your team workspace'].map((label, i) => <div key={label} className="flex items-center gap-3 rounded-md bg-[#f5f6f4] p-3 text-[10px]"><FileText size={15} className="text-[#8661b6]" /><span>{label}</span><Check size={12} className="ml-auto text-[#328a72]" /><span className="text-[9px] text-[#82887f]">{index === 0 ? ['Matched', 'Ready', 'Ready'][i] : 'Synced'}</span></div>)}</div> : index === 1 ? <div className="space-y-2">{['Maya Johnson', 'Alex Lee', 'Sam Kim'].map((name, i) => <div key={name} className={`flex items-center gap-3 rounded-md p-2 ${i === 0 ? 'bg-[#eee7fa]' : 'bg-[#f6f7f4]'}`}><span className="flex size-7 items-center justify-center rounded-full bg-[#ddd9e5] text-[9px]">{name.split(' ').map(n => n[0]).join('')}</span><div><span className="text-[10px]">{name}</span><div className="mt-1 h-1 w-24 rounded bg-black/10" /></div><span className="ml-auto text-[8px] text-[#6d7665]">{i === 0 ? 'Needs reply' : 'Resolved'}</span></div>)}</div> : <div className="pt-3 text-center"><div className="flex items-center justify-center gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[#c5a1f7]"><Sparkles size={23} /></span><ArrowRight size={22} /><span className="flex size-12 items-center justify-center rounded-full bg-[#cfea81]"><Users size={23} /></span></div><p className="mt-5 text-sm">Your team has it from here.</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] text-[#658057]"><Check size={12} /> Full conversation included</span></div>}
    </div>
  </div>;
}

function Products() {
  const track = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const scroll = (direction: number) => { const el = track.current; if (el) el.scrollBy({ left: direction * (el.firstElementChild?.getBoundingClientRect().width ?? 350), behavior: reduced ? 'instant' : 'smooth' }); };
  return <section id="product" className={`${wrap} scroll-mt-28 py-20 sm:py-28`}>
    <Reveal className="mb-10 flex items-end justify-between gap-5 sm:mb-14"><div><Eyebrow>THE ELPINO WORKSPACE</Eyebrow><h2 className={heading}>Answer faster.<br />Work together.<br />Make their day.</h2></div><div className="flex shrink-0 gap-2"><button type="button" aria-label="Previous product" onClick={() => scroll(-1)} className="flex size-11 items-center justify-center rounded-full border border-black/40 transition hover:bg-[#e3f0eb] sm:size-14"><ArrowLeft size={19} /></button><button type="button" aria-label="Next product" onClick={() => scroll(1)} className="flex size-11 items-center justify-center rounded-full border border-black/40 transition hover:bg-[#e3f0eb] sm:size-14"><ArrowRight size={19} /></button></div></Reveal>
    <div ref={track} tabIndex={0} aria-label="Explore Elpino products" className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:thin]">
      {features.map((feature, index) => <article key={feature.label} className={`relative flex min-h-[465px] w-[88%] shrink-0 snap-start flex-col overflow-hidden rounded-md p-6 sm:w-[47%] sm:p-7 lg:w-[32%] ${feature.color}`}>
        <Stripes className="bottom-0 right-0 h-72 w-64" /><div className="relative pr-12"><p className="text-[11px] font-medium">{feature.label}</p><h3 className="mt-4 whitespace-pre-line text-[29px] font-medium leading-[1.05] tracking-[-0.04em]">{feature.title}</h3></div>
        <button type="button" aria-expanded={expanded === index} aria-controls={`product-detail-${index}`} aria-label={`${expanded === index ? 'Close' : 'Learn about'} ${feature.label.toLowerCase()}`} onClick={() => setExpanded(expanded === index ? null : index)} className="absolute right-5 top-6 z-10 flex size-10 items-center justify-center rounded-full border border-black/50 transition hover:bg-white/60">{expanded === index ? <X size={18} /> : <Plus size={18} />}</button>
        <div id={`product-detail-${index}`} hidden={expanded !== index} className="relative mt-7"><p className="text-sm leading-7">{feature.detail}</p><Link href="/features" className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4">Explore features <ArrowUpRight size={15} /></Link></div>
        {expanded !== index && <div className="relative mt-auto"><MiniProduct index={index} /></div>}
      </article>)}
    </div>
  </section>;
}

const facts = [
  { value: '50', label: 'AI conversations, free every month', text: 'Start with real customer conversations. See what Elpino can take off your plate.' },
  { value: '$0', label: 'Extra charge for human handoffs', text: 'Some questions need your team. Handing a conversation over never costs extra.' },
  { value: '1', label: 'Shared workspace for your team', text: 'All the context. All the conversation. One place to give a helpful answer.' },
];

function Facts() {
  return <section className={`${wrap} pb-24 sm:pb-32`}><Reveal className="mb-12 flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-end"><div><Eyebrow>SIMPLE BY DESIGN</Eyebrow><h2 className={heading}>More help.<br />Less overhead.</h2></div><Link href="/pricing" className={`${pill} border border-black/40 hover:bg-[#e3f0eb]`}>See pricing <ArrowUpRight size={17} /></Link></Reveal>
    {facts.map((fact, index) => <Reveal key={fact.value} className="group grid gap-5 border-t border-black/10 py-5 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-20"><div className="flex min-w-0"><div className={`relative flex w-[26%] shrink-0 items-center justify-center overflow-hidden ${index === 1 ? 'bg-[#bc91fa]' : 'bg-[#11dcb0]'}`}><Stripes className="inset-0" /><ArrowUp className="relative size-12 sm:size-20" strokeWidth={1.5} /></div><div className="flex-1 bg-[#192016] px-6 py-5 text-white sm:px-9"><span className="block text-[clamp(4.5rem,10vw,9rem)] leading-none tracking-[-0.07em]">{fact.value}</span><p className="mt-3 max-w-[25ch] text-xs sm:text-base">{fact.label}</p></div></div><p className="max-w-[27ch] pb-1 text-xl leading-tight tracking-[-0.03em] sm:text-2xl lg:text-3xl">{fact.text}</p></Reveal>)}
  </section>;
}

const demoContent = [
  { label: 'Find the answer', question: 'How do I invite a teammate?', steps: ['Customer asks in the widget', 'Elpino searches your content', 'Team setup guide is found', 'A helpful answer is sent'], answer: 'Go to Settings → Team → Invite teammate. Add their email and send the invitation.', source: 'Team setup guide' },
  { label: 'Bring in a human', question: 'Can you make a custom change to my order?', steps: ['Customer asks in the widget', 'Request needs a team member', 'Handoff reason is recorded', 'Your team takes the conversation'], answer: "This needs a teammate. I'll pass your conversation along so they can help with the change.", source: 'Handed to your team' },
  { label: 'See the context', question: 'What did Elpino use to answer?', steps: ['Open the conversation', 'Review the answer audit trail', 'See the content it checked', 'Keep the next reply informed'], answer: 'The conversation keeps a record of what the AI checked, so your team can follow how it reached an answer.', source: 'Conversation audit trail' },
];

function AgentDemo() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const demo = demoContent[selected];
  return <section id="ai-agent" className="relative scroll-mt-20 overflow-hidden bg-[#192016] px-5 py-20 text-white sm:px-8 sm:py-28">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_15px,#ba91f8_15px,#ba91f8_17px,#0cdbb0_17px,#0cdbb0_19px)] [mask-image:linear-gradient(transparent,black)]" />
    <Reveal className="relative mx-auto max-w-[1100px]"><div className="text-center"><span className="mx-auto mb-7 flex size-20 items-center justify-center rounded-full border border-white/30 bg-white/5"><Sparkles size={38} strokeWidth={1.3} /></span><Eyebrow>MEET YOUR AI TEAMMATE</Eyebrow><h2 className="text-[clamp(3rem,6.5vw,6.5rem)] font-medium uppercase leading-[0.92] tracking-[-0.06em]">A little AI.<br />A lot of help.</h2><p className="mx-auto mt-7 max-w-[43ch] text-base leading-7 text-white/75 sm:text-lg">Your knowledge becomes their next step.<br />Your team stays close when it matters.</p><Link href="/signup" className={`${pill} mt-7 bg-[#bd91ff] text-[#192016] hover:bg-[#cdaaFF]`}>Meet your AI agent <ArrowUpRight size={18} /></Link></div>
      <div className="mt-14 overflow-hidden rounded-xl bg-white text-[#192016] sm:mt-20"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-5 sm:px-8"><span className="text-xs font-medium uppercase">From question to next step</span><span className="text-[10px] text-[#73806a]">Interactive example</span></div><div className="flex flex-wrap gap-2 px-5 pt-5 sm:px-8" aria-label="Example scenarios">{demoContent.map((item, index) => <button key={item.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`rounded-full border px-4 py-2 text-xs transition ${selected === index ? 'border-[#192016] bg-[#192016] text-white' : 'border-black/15 hover:bg-[#e4f0ea]'}`}>{item.label}</button>)}</div>
        <motion.div key={selected} initial={false} animate={reduced ? undefined : { opacity: [0.3, 1], y: [8, 0] }} transition={{ duration: 0.4 }} className="grid gap-8 p-5 sm:p-8 md:grid-cols-2 md:gap-14"><div className="space-y-5 py-3">{demo.steps.map((step, i) => <motion.div key={step} initial={false} animate={reduced ? undefined : { opacity: [0.2, 1], x: [-10, 0] }} transition={{ delay: i * 0.12, duration: 0.4 }} className="flex items-center gap-4"><span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] ${i % 2 ? 'bg-[#e9ddfb]' : 'bg-[#dcf5eb]'}`}>0{i + 1}</span><span className="text-sm">{step}</span><Check className="ml-auto text-[#418a6d]" size={14} /></motion.div>)}</div><div className="rounded-lg bg-[#f2f5f0] p-5"><span className="text-[10px] uppercase tracking-wider text-[#65715d]">Example conversation</span><p className="mt-5 text-lg font-medium leading-snug tracking-tight">{demo.question}</p><div className="mt-5 flex gap-3"><Sparkles size={19} className="mt-1 shrink-0 text-[#8960ba]" /><p className="text-sm leading-6">{demo.answer}</p></div><span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px]"><BookOpen size={12} />{demo.source}</span></div></motion.div>
      </div>
    </Reveal>
  </section>;
}

function HumanSection() {
  return <section className={`${wrap} py-24 sm:py-32`}><Reveal className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-24"><div><Eyebrow>AI + YOUR PEOPLE</Eyebrow><h2 className={heading}>Built for AI.<br />Made for humans.</h2><p className="mt-7 max-w-[46ch] text-lg leading-8 text-[#586150]">The best support knows when to listen. Elpino handles the everyday questions and brings your people in for the conversations that need them.</p><Link href="/features" className={`${pill} mt-8 bg-[#cdef77] hover:bg-[#dbf5a2]`}>Explore human handoff <ArrowUpRight size={17} /></Link></div><div className="relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-[28px] bg-[#192016] p-8 text-white sm:min-h-[390px]"><Stripes className="bottom-0 right-0 size-60 opacity-50" /><div className="relative flex items-center justify-center gap-8 sm:gap-12"><div className="text-center"><Sparkles className="mx-auto size-16 text-[#bf94ff] sm:size-20" strokeWidth={1.1} /><span className="mt-5 block text-lg">Elpino AI</span></div><Plus className="text-white/35" size={28} /><div className="text-center"><Users className="mx-auto size-16 text-[#cced79] sm:size-20" strokeWidth={1.1} /><span className="mt-5 block text-lg">Your team</span></div></div><div className="relative mx-auto mt-12 flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70"><Check size={13} /> Same conversation. Full context.</div></div></Reveal></section>;
}

const resources = [
  { tag: 'THE PRODUCT', title: 'A closer look at your new workspace.', text: 'Explore the inbox, knowledge base, and AI agent that work together.', href: '/features', icon: Inbox, color: 'bg-[#dceee8]' },
  { tag: 'TRUST & SECURITY', title: 'Good support starts with trust.', text: 'Learn how Elpino handles your data and keeps your team in control.', href: '/trust', icon: ShieldCheck, color: 'bg-[#e7dcf8]' },
  { tag: 'YOUR QUESTIONS', title: 'A little clarity before you start.', text: 'Find answers about setup, AI credit, billing, and human handoffs.', href: '/faq', icon: MessageCircle, color: 'bg-[#e9eddf]' },
];

function Resources() {
  return <section id="resources" className={`${wrap} scroll-mt-28 pb-24 sm:pb-32`}><Reveal className="mb-12"><Eyebrow>GOOD TO KNOW</Eyebrow><h2 className={heading}>Your next step.<br />Made simpler.</h2></Reveal><div className="grid gap-8 md:grid-cols-3">{resources.map((item, index) => <Reveal key={item.title} delay={index * 0.08}><Link href={item.href} className="group block"><div className={`relative flex aspect-[1.5] items-center justify-center overflow-hidden rounded-md ${item.color}`}><Stripes className="bottom-0 right-0 size-52" /><div className="relative flex size-24 -rotate-6 items-center justify-center rounded-2xl border border-white bg-white/60 shadow-[8px_10px_0_0_#1920160a] transition duration-300 group-hover:rotate-0 group-hover:scale-105 sm:size-32"><item.icon size={48} strokeWidth={1.2} /></div><ArrowUpRight className="absolute right-5 top-5 transition group-hover:-translate-y-1 group-hover:translate-x-1" size={22} /></div><p className="mt-6 text-[10px] font-medium tracking-wider">{item.tag}</p><h3 className="mt-3 max-w-[24ch] text-2xl font-medium leading-tight tracking-[-0.035em]">{item.title}</h3><p className="mt-3 max-w-[38ch] text-sm leading-6 text-[#626a5c]">{item.text}</p></Link></Reveal>)}</div></section>;
}

function Questions() {
  const questions = [
    ['What can I start with for free?', 'The free plan includes 50 AI conversations each month. You can get started without adding a credit card.'],
    ['Where does the AI get its answers?', 'Elpino searches the knowledge you provide, including help articles, website pages, and uploaded documents.'],
    ["What happens when AI can't help?", 'It passes the conversation to your team with the context and a reason for the handoff. Handing a conversation to your team never costs extra.'],
    ['Can I invite my team?', 'Yes. Your team works together in a shared inbox. Additional teammates cost $1 per month each; see the pricing page for included seats and the free-plan minimum charge.'],
  ];
  return <section className="bg-[#f4f5f0] py-20 sm:py-24"><div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20`}><div><Eyebrow>A FEW MORE ANSWERS</Eyebrow><h2 className={heading}>Glad<br />you asked.</h2><Link href="/faq" className="mt-7 inline-flex items-center gap-2 text-sm underline underline-offset-4">All your questions, answered <ArrowUpRight size={15} /></Link></div><div>{questions.map(([question, answer]) => <details key={question} className="group border-b border-black/15 first:border-t"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-base font-medium [&::-webkit-details-marker]:hidden sm:text-lg">{question}<Plus size={19} className="shrink-0 transition group-open:rotate-45" /></summary><p className="max-w-[60ch] pb-6 pr-8 text-sm leading-7 text-[#5e6857]">{answer}</p></details>)}</div></div></section>;
}

export function EditorialHome() {
  return <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#192016] selection:bg-[#d2b3fa]"><Products /><Facts /><AgentDemo /><HumanSection /><Resources /><Questions /></div>;
}
