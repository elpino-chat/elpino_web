"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronDown, FileText, Globe, Inbox, MessageCircle, Pause, Play, Search, Send, ShieldCheck, Sparkles, Users } from "lucide-react";
import { productSectionStyles as s } from "./product-section-styles";

const helpdesk = [
  { title: "One inbox. Everyone in sync.", description: "Bring customer conversations into a shared workspace. See what needs a reply and keep your team working together.", label: "Shared inbox", icon: Inbox },
  { title: "A human, right when it matters.", description: "When AI can't help, your team takes over with the conversation and the reason for handoff already in view.", label: "Human handoff", icon: Users },
  { title: "Know who you're helping.", description: "Keep visitor location, device details, and conversation history close at hand for a more personal reply.", label: "Customer context", icon: Globe },
];
const ai = [
  { title: "Your knowledge. Its starting point.", description: "Bring your help articles, website pages, and documents. Elpino searches your own knowledge before it answers.", label: "Knowledge base", icon: BookOpen },
  { title: "Good answers, on your website.", description: "Meet customers in your chat widget and answer everyday questions from the information you've provided.", label: "Website chat", icon: MessageCircle },
  { title: "An answer you can follow.", description: "See what the AI checked in the conversation's audit trail. When it can't help, it hands over to your team.", label: "Answer audit trail", icon: ShieldCheck },
];

function Illustration({ kind }: { kind: "helpdesk" | "ai" }) {
  const reduced = useReducedMotion();
  return <div className={s.illustration} aria-hidden="true">
    <div className={s.orbit} /><div className={s.orbitInner} />
    <motion.div className={s.symbol} initial={false} whileInView={reduced ? undefined : { y: [12, -8, 0], rotate: [-12, -4, -12] }} viewport={{ once: true }} transition={{ duration: 3.5, ease: 'easeInOut' }}>{kind === "helpdesk" ? <Inbox size={55} strokeWidth={1.3} /> : <Sparkles size={55} strokeWidth={1.3} />}</motion.div>
    <motion.span className={s.satellite} initial={false} whileInView={reduced ? undefined : { y: [20, -10, 0] }} viewport={{ once: true }} transition={{ duration: 3, delay: 0.15 }}><MessageCircle size={23} /></motion.span>
    <motion.span className={s.satelliteTwo} initial={false} whileInView={reduced ? undefined : { y: [-15, 10, 0] }} viewport={{ once: true }} transition={{ duration: 3, delay: 0.3 }}>{kind === "helpdesk" ? <Users size={23} /> : <BookOpen size={23} />}</motion.span>
    <span className={s.miniCheck}><Check size={18} /></span>
  </div>;
}

function Bubble({ children, answer = false, delay = 0 }: { children: React.ReactNode; answer?: boolean; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={`${s.bubble} ${answer ? s.answer : ""}`} initial={false} animate={reduced ? undefined : { opacity: [0, 1], y: [10, 0] }} transition={{ duration: 0.45, delay: delay / 1000 }}>{children}</motion.div>;
}

function HelpdeskPreview({ active }: { active: number }) {
  return <div className={s.deskScene}>
    <div className={s.deskWindow}>
      <aside className={s.rail} aria-hidden="true"><span className={s.railLogo}>e</span><Inbox /><Users /><BookOpen /><Globe /></aside>
      <aside className={s.chatList}>
        <div className={s.windowHeading}>Inbox <span>03</span></div>
        <div className={s.search}><Search size={13} /> Search conversations</div>
        {[['MJ', 'Maya Johnson', 'Can someone help with my order?'], ['AL', 'Alex Lee', 'Thanks, that worked!'], ['SK', 'Sam Kim', 'Where can I find the setup guide?']].map(([initials, name, message], i) => <div key={name} className={`${s.chatRow} ${i === 0 ? s.selectedRow : ''}`}><span className={s.avatar}>{initials}</span><div><strong>{name}</strong><p>{message}</p></div></div>)}
        <div className={s.teamOnline}><span /> Your team, together</div>
      </aside>
      <div className={s.conversation}>
        <div className={s.conversationHeading}><span className={s.avatar}>MJ</span><div><strong>Maya Johnson</strong><small>Website conversation</small></div><span className={s.status}>{active === 1 ? 'Handed over' : 'Open'}</span></div>
        <div className={s.messages} key={active}>
          <span className={s.timestamp}>Today, 10:24 AM</span>
          <Bubble>Hi! Can someone help me change the delivery address on my order?</Bubble>
          <Bubble answer delay={180}>I'll bring in a teammate who can help with your order.</Bubble>
          <div className={s.handoffNote}><Users size={15} /><span>{active === 2 ? 'Customer details available alongside the conversation' : 'Handed to your team · Order change needs a human'}</span></div>
          <Bubble answer delay={400}>Hi Maya, happy to help! Which order would you like to update?</Bubble>
        </div>
        <div className={s.composer}><span>Reply to Maya…</span><Send size={16} /></div>
      </div>
      {active === 2 && <aside className={s.contactPanel}><span className={s.avatar}>MJ</span><strong>Maya Johnson</strong><small>Customer details</small><hr /><span>Location<strong>London, UK</strong></span><span>Device<strong>Desktop · Chrome</strong></span><span>Current page<strong>/orders</strong></span></aside>}
    </div>
    <div className={s.floatingNote} key={`note-${active}`}><span className={s.noteIcon}>{active === 0 ? <Inbox size={20} /> : active === 1 ? <Users size={20} /> : <Globe size={20} />}</span><div><strong>{['Less switching. More helping.', 'The context comes with it.', 'A conversation, with context.'][active]}</strong><small>{['Your conversations in one place', 'AI and your team, working together', 'Customer details right where you need them'][active]}</small></div><Check size={16} /></div>
  </div>;
}

function AiPreview({ active }: { active: number }) {
  return <div className={s.aiScene} key={active}>
    <div className={s.sceneLabel}><Sparkles size={15} /> ELPINO AI <span>Example conversation</span></div>
    {active === 0 ? <>
      <div className={s.sourceStack}>{['Help center articles', 'Website pages', 'Uploaded documents'].map((text, i) => <div className={s.source} key={text} style={{ '--delay': `${i * 120}ms` } as CSSProperties}><FileText size={21} /><span>{text}</span><Check size={16} /></div>)}</div>
      <div className={s.connection}><span /><span /><span /></div>
      <div className={s.knowledgeResult}><span className={s.aiBadge}><Sparkles size={25} /></span><h4>Built on what you know.</h4><p>Your content gives every answer a starting point.</p><span className={s.sourceTag}><BookOpen size={13} /> Your knowledge base</span></div>
    </> : active === 1 ? <div className={s.widget}><div className={s.widgetHeader}><span className={s.aiBadge}><Sparkles size={22} /></span><div><strong>Chat with Elpino</strong><small>Here to help</small></div></div><div className={s.widgetMessages}><Bubble>How do I invite a teammate?</Bubble><Bubble answer delay={200}>Open Settings, go to Team, and select Invite teammate. Enter their email to send an invitation.</Bubble><span className={s.sourceTag}><BookOpen size={13} /> Team setup guide</span><Bubble delay={450}>Found it. Thank you!</Bubble></div><div className={s.composer}>Write a message…<Send size={16} /></div></div> : <div className={s.audit}><span className={s.auditEyebrow}>BEHIND THE ANSWER</span><h4>A clear trail.<br />At every step.</h4>{[['Question received', 'How do I invite a teammate?'], ['Knowledge searched', 'Team setup guide'], ['Answer grounded', 'Invitation steps found in your content'], ['Reply sent', 'The conversation keeps the record']].map(([title, detail], i) => <div className={s.auditStep} key={title} style={{ '--delay': `${i * 160}ms` } as CSSProperties}><span><Check size={15} /></span><div><strong>{title}</strong><p>{detail}</p></div></div>)}</div>}
  </div>;
}

function Showcase({ kind }: { kind: "helpdesk" | "ai" }) {
  const items = kind === "helpdesk" ? helpdesk : ai;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduced = useReducedMotion();
  const playing = desktop && !paused && !hovered && !focused && !reduced && inView && visible;
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive(i => (i + 1) % items.length), 8000);
    return () => window.clearTimeout(timer);
  }, [active, playing, items.length]);
  const preview = (index: number) => <motion.div key={`${kind}-${index}`} initial={false} animate={reduced ? undefined : { opacity: [0.35, 1], y: [12, 0] }} transition={{ duration: 0.5 }}>{kind === "helpdesk" ? <HelpdeskPreview active={index} /> : <AiPreview active={index} />}</motion.div>;
  return <div ref={ref} className={s.showcase} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <div className={s.showcaseToolbar}><span>SEE IT IN ACTION <span className={s.toolbarDivider}>/</span> {items[active].label}</span><button type="button" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play feature previews' : 'Pause feature previews'} disabled={!!reduced}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}<span>{paused || reduced ? 'Paused' : 'Autoplay'}</span></button></div>
    <div className={`${s.desktopShowcase} ${kind === 'ai' ? s.vertical : ''}`}>
      <div id={`${kind}-preview`} className={s.preview} role="region" aria-label={`${items[active].label} preview`}>{preview(active)}</div>
      <div className={s.featureButtons} aria-label={`${kind} features`}>
        {items.map((item, index) => <button type="button" className={`${s.featureButton} ${active === index ? s.active : ''}`} key={item.title} aria-pressed={active === index} aria-controls={`${kind}-preview`} onClick={() => { setActive(index); setPaused(true); }}>
          {active === index && <motion.span key={`${index}-${playing}`} className={s.progress} initial={false} animate={{ scaleX: playing ? [0, 1] : 1 }} transition={{ duration: playing ? 8 : 0, ease: 'linear' }} />}
          <span className={s.featureNumber}>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p><span className={s.featureAction}>{active === index ? 'Now showing' : 'Explore feature'} <ArrowRight size={14} /></span></div>
        </button>)}
      </div>
    </div>
    <div className={s.mobileShowcase}>{items.map((item, index) => <div className={s.accordion} key={item.title}><h3><button type="button" aria-expanded={active === index} aria-controls={`${kind}-mobile-${index}`} onClick={() => { setActive(index); setPaused(true); }}><span>0{index + 1}</span>{item.title}<ChevronDown size={18} style={{ transform: active === index ? 'rotate(180deg)' : undefined }} /></button></h3><div id={`${kind}-mobile-${index}`} hidden={active !== index}><p>{item.description}</p>{active === index && preview(index)}</div></div>)}</div>
  </div>;
}

export function ProductSections() {
  const reduced = useReducedMotion();
  return <div className={s.sections}>{(["helpdesk", "ai"] as const).map(kind => <section key={kind} id={kind === "ai" ? "ai-agent" : "helpdesk"} aria-labelledby={`${kind}-title`} className={`${s.section} ${kind === 'ai' ? s.aiSection : ''}`}>
    <div className={s.cornerDots} aria-hidden="true"><i /><i /><i /><i /></div>
    <div className={s.inner}>
      <motion.div className={s.intro} initial={false} whileInView={reduced ? undefined : { y: [28, 0], opacity: [0.4, 1] }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <div><p className={s.eyebrow}><span /> {kind === 'helpdesk' ? 'ELPINO HELPDESK' : 'ELPINO AI AGENT'}</p>
          <h2 id={`${kind}-title`}>{kind === 'helpdesk' ? <>Everything your team needs.<br /><span>All in the conversation.</span></> : <>Your knowledge.<br /><span>A helping hand, always.</span></>}</h2>
          <p className={s.description}>{kind === 'helpdesk' ? 'Give your team a shared inbox, useful customer context, and a smooth handoff from AI. Less catching up. More time to give customers the help they came for.' : "Turn the information you already have into answers your customers can use. Elpino handles everyday questions and brings in your team when a conversation needs a human."}</p>
          <div className={s.actions}><Link href="/signup" className={s.primary}>Start free <ArrowRight size={16} /></Link><Link href="/features" className={s.secondary}>Explore features <ArrowRight size={16} /></Link></div>
        </div><Illustration kind={kind} />
      </motion.div>
      <Showcase kind={kind} />
      <div className={s.sectionFoot}><span>{kind === 'helpdesk' ? 'A little less busywork. A lot more human.' : 'Helpful by design. Human when it counts.'}</span><Link href={kind === 'helpdesk' ? '/features' : '/pricing'}>{kind === 'helpdesk' ? 'Meet your new workspace' : '50 AI conversations a month, free'} <ArrowRight size={15} /></Link></div>
    </div>
  </section>)}</div>;
}
