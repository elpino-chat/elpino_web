"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, FileText, Sparkles, Users } from "lucide-react";

const features = [
  { label: 'ELPINO AI', title: 'Answer your customers\nfrom your own knowledge', description: 'Give customers helpful answers from your articles, website pages, and documents. Elpino searches your knowledge before it replies.' },
  { label: 'SHARED INBOX', title: 'Bring your whole team\ninto the conversation', description: 'Keep customer conversations and replies in one shared inbox, so your teammates have the context they need to help.' },
  { label: 'HUMAN HANDOFF', title: 'Let AI help. Let your\npeople take it from here.', description: 'When a question needs a person, Elpino passes the conversation to your team with its context and a reason for the handoff.' },
  { label: 'KNOWLEDGE BASE', title: 'Turn what you know\ninto helpful answers', description: 'Collect your help articles, website pages, and uploaded documents in the knowledge base your AI uses to answer.' },
];

function Preview({ index }: { index: number }) {
  return <div className="relative w-full rounded-t-[16px] border border-b-0 border-[#0281f6] bg-[#edf7ff] p-[14px] pb-0 shadow-[0_6px_18px_#345c5010]">
    <div className="h-[230px] overflow-hidden rounded-[8px] bg-white p-4 text-[#171e16] min-[1700px]:h-[264px]">
      <div className="mb-5 flex items-center justify-between text-[11px] font-medium"><span>{['AI answers', 'Team inbox', 'Human handoff', 'Knowledge library'][index]}</span><span className="text-[8px] font-normal text-[#838b81]">Preview</span></div>
      {index === 0 ? <div className="space-y-3"><div className="ml-auto w-[85%] rounded-lg bg-[#eee5fa] p-3 text-[10px] leading-4">How do I invite my teammates?</div><div className="flex items-center gap-1.5 text-[8px] text-[#7f44c1]"><Sparkles size={11} /> Answer from your knowledge base</div><p className="text-[10px] leading-[1.8]">Open Settings → Team and select Invite teammate. Enter their email to send an invitation.</p><div className="flex items-center gap-1.5 border-t border-black/5 pt-3 text-[8px] text-[#6d756a]"><BookOpen size={10} /> Team setup guide<Check size={10} className="ml-auto text-[#00af87]" /></div></div> : index === 1 ? <div className="space-y-3">{['Maya Johnson', 'Alex Lee', 'Sam Kim'].map((name, i) => <div key={name} className={`flex items-center gap-2 rounded-md px-2 py-3 ${i === 0 ? 'bg-[#f0e9fa]' : 'bg-[#f7f8f6]'}`}><span className="flex size-7 items-center justify-center rounded-full bg-[#e3d9f2] text-[8px]">{name.split(' ').map(n => n[0]).join('')}</span><div><p className="text-[9px] font-medium">{name}</p><p className="mt-1 text-[8px] text-[#7d8577]">{['Can you help with my order?', 'Thanks, that worked!', 'How do I get started?'][i]}</p></div><span className={`ml-auto size-1.5 shrink-0 rounded-full ${i === 1 ? 'bg-[#04d5ac]' : 'bg-[#a47be3]'}`} /></div>)}</div> : index === 2 ? <div className="pt-3"><div className="flex items-center justify-center gap-3"><div className="flex size-16 items-center justify-center rounded-full bg-[#8426e7] text-white"><Sparkles size={29} /></div><ArrowRight size={20} className="text-[#727a6b]" /><div className="flex size-20 items-center justify-center rounded-full bg-[#0edcb0]"><Users size={32} /></div></div><p className="mt-6 text-center text-[11px]">A teammate takes it from here.</p><div className="mt-4 flex items-center justify-center gap-1 text-[8px] text-[#6d756a]"><Check size={10} /> Full context included</div></div> : <div className="space-y-3">{['Help center articles', 'Website pages', 'Uploaded documents'].map(label => <div key={label} className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-[9px]"><FileText size={16} className="text-[#954ae3]" />{label}<Check size={11} className="ml-auto text-[#00af87]" /></div>)}<p className="pt-1 text-[8px] text-[#7d8577]">Your content. Ready to help.</p></div>}
    </div>
  </div>;
}

export function FeatureCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update(); el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update); observer.observe(el);
    return () => { el.removeEventListener('scroll', update); observer.disconnect(); };
  }, []);
  const scroll = (direction: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * ((el.firstElementChild?.getBoundingClientRect().width ?? 350) + 15), behavior: reduced ? 'instant' : 'smooth' });
  };
  return <section aria-labelledby="feature-carousel-title" className="relative overflow-hidden bg-[#f7f5f2] pb-0 pt-16 font-[family-name:var(--font-rethink-sans)] text-[#11120f] sm:pt-24">
    <div className="mb-10 px-5 sm:mb-[76px] sm:px-8 lg:px-[4.2vw]">
      <h2 id="feature-carousel-title" className="max-w-[760px] text-[clamp(2rem,3.3vw,4rem)] font-semibold capitalize leading-[0.97] tracking-[-0.055em]">Be there. Be helpful.<br />Be the answer.</h2>
      <p className="mt-5 max-w-[52ch] text-base leading-7 text-black/60 sm:text-lg">
        Every conversation gets the same knowledge, the same policy, and a teammate the moment it&apos;s needed —
        wherever your customer reached out from.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-5">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black px-6 text-[17px] font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:translate-y-px"
        >
          Sign up
        </Link>
        <Link
          href="/features"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-black/70 transition hover:text-black"
        >
          Learn more
          <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
    <div id="home-feature-track" ref={track} tabIndex={0} aria-label="Elpino feature cards" className="flex snap-x snap-mandatory gap-[15px] overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:px-8 lg:scroll-pl-[4.2vw] lg:px-[4.2vw] [&::-webkit-scrollbar]:hidden">
      {features.map((feature, index) => <article key={feature.label} className="relative flex min-h-[500px] w-[87vw] shrink-0 snap-start flex-col overflow-hidden rounded-[6px] border-3 border-black/10 bg-white text-[#171e16] sm:min-h-[550px] sm:w-[47vw] lg:min-h-[580px] lg:w-[28.4vw] min-[1700px]:min-h-[625px]">
        <div className="relative p-6 sm:p-[30px]"><p className="text-xs font-medium min-[1700px]:text-base">{feature.label}</p><h3 className="mt-4 whitespace-pre-line text-[clamp(1.45rem,1.7vw,2.15rem)] font-semibold leading-[1.1] tracking-[-0.035em]">{feature.title}</h3><p className="mt-5 max-w-[40ch] text-sm leading-6 text-[#596157]">{feature.description}</p></div>
        <div className="relative mt-auto px-6 pt-8 sm:px-[30px]"><Preview index={index} /></div>
      </article>)}
    </div>
    <div className="mt-10 flex items-center justify-between gap-5 px-5 sm:mt-[76px] sm:px-8 lg:px-[4.2vw]">
      <Image
        src="/desk_avatar1.png"
        alt=""
        aria-hidden="true"
        width={640}
        height={640}
        quality={100}
        priority
        className="pointer-events-none h-auto w-48 select-none sm:w-64 lg:w-80"
      />
      <div className="flex shrink-0 gap-3 sm:gap-5">
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous features" aria-controls="home-feature-track" className="flex size-11 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:border-black/10 disabled:text-black/25 disabled:hover:bg-transparent sm:size-[62px] min-[1700px]:size-[76px]"><ArrowLeft size={23} /></button>
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Next features" aria-controls="home-feature-track" className="flex size-11 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:border-black/10 disabled:text-black/25 disabled:hover:bg-transparent sm:size-[62px] min-[1700px]:size-[76px]"><ArrowRight size={23} /></button>
      </div>
    </div>
  </section>;
}
