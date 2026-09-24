import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type CapabilityPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  problemTitle: string;
  problemText: string;
  featureTitle: string;
  features: [string, string][];
  steps: [string, string][];
  accent: "lavender" | "mint" | "coral" | "blue";
  icon: LucideIcon;
};

const tones = {
  lavender: { soft: "bg-[#f1edf7]", accent: "text-[#7651b0]", card: "bg-[#d9bef4]", line: "border-[#7651b0]/25" },
  mint: { soft: "bg-[#edf6f0]", accent: "text-[#28745a]", card: "bg-[#d8f0e5]", line: "border-[#28745a]/25" },
  coral: { soft: "bg-[#fff0e8]", accent: "text-[#b4542c]", card: "bg-[#ffd8c5]", line: "border-[#b4542c]/25" },
  blue: { soft: "bg-[#edf3fa]", accent: "text-[#3569ad]", card: "bg-[#dce7ff]", line: "border-[#3569ad]/25" },
} as const;

export function CapabilityPage({ eyebrow, title, intro, image, imageAlt, problemTitle, problemText, featureTitle, features, steps, accent, icon: Icon }: CapabilityPageProps) {
  const tone = tones[accent];
  return <main className="bg-[#fbfbfa] font-[family-name:var(--font-rethink-sans)] text-[#233d4d]">
    <section className="border-b border-[#233d4d]/20 px-5 py-14 sm:px-8 sm:py-20 lg:py-24"><div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-end"><div><p className={`text-xs font-bold uppercase tracking-[0.15em] ${tone.accent}`}>{eyebrow}</p><h1 className="mt-6 max-w-3xl text-[clamp(3.2rem,6.4vw,6.8rem)] font-medium leading-[0.88] tracking-[-0.07em]">{title}</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#53616b]">{intro}</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/signup" className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[#233d4d] px-7 text-sm font-semibold text-white transition hover:bg-[#7651b0]">Try Elpino <ArrowRight size={16} /></Link><Link href="/contact" className="inline-flex min-h-13 items-center rounded-full border border-[#233d4d]/25 px-7 text-sm font-semibold transition hover:bg-white">Talk to our team</Link></div></div><div className={`border border-[#233d4d]/20 p-6 sm:p-8 ${tone.soft}`}><Image src={image} alt={imageAlt} width={1145} height={1374} priority sizes="(min-width: 1024px) 40vw, 85vw" className="mx-auto h-[360px] w-auto max-w-full object-contain sm:h-[470px]" /></div></div></section>
    <section className="border-b border-[#233d4d]/20 bg-white px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end"><div><p className={`text-xs font-bold uppercase tracking-[0.15em] ${tone.accent}`}>The support moment</p><h2 className="mt-5 text-4xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">{problemTitle}</h2></div><p className="max-w-2xl text-lg leading-8 text-[#53616b]">{problemText}</p></div></section>
    <section className="border-b border-[#233d4d]/20 px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-[1100px]"><div className="flex items-end justify-between gap-6 border-b border-[#233d4d]/20 pb-7"><div><p className={`text-xs font-bold uppercase tracking-[0.15em] ${tone.accent}`}>Built for the work</p><h2 className="mt-4 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">{featureTitle}</h2></div><span className={`hidden size-12 items-center justify-center rounded-2xl sm:flex ${tone.card}`}><Icon size={22} /></span></div><div className="divide-y divide-[#233d4d]/20">{features.map(([heading, body], index) => <article key={heading} className="grid gap-4 py-7 sm:grid-cols-[60px_minmax(180px,0.65fr)_1fr] sm:items-start"><span className={`font-mono text-sm ${tone.accent}`}>0{index + 1}</span><h3 className="text-xl font-semibold tracking-[-0.03em]">{heading}</h3><p className="text-sm leading-6 text-[#53616b]">{body}</p></article>)}</div></div></section>
    <section className={`px-5 py-16 sm:px-8 sm:py-24 ${tone.soft}`}><div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className={`text-xs font-bold uppercase tracking-[0.15em] ${tone.accent}`}>How it works</p><h2 className="mt-5 text-4xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-5xl">A clearer path from question to next step.</h2></div><ol className="space-y-5">{steps.map(([heading, body], index) => <li key={heading} className="grid grid-cols-[42px_1fr] gap-4"><span className="flex size-9 items-center justify-center rounded-full bg-[#233d4d] font-mono text-xs text-white">{index + 1}</span><div><h3 className="text-lg font-semibold">{heading}</h3><p className="mt-1 text-sm leading-6 text-[#53616b]">{body}</p></div></li>)}</ol></div></section>
    <section className="bg-[#233d4d] px-5 py-16 text-white sm:px-8 sm:py-24"><div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d9bef4]">{eyebrow}</p><h2 className="mt-4 max-w-3xl text-4xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">Support that gives your team more room to do great work.</h2></div><Link href="/signup" className="inline-flex min-h-13 shrink-0 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#233d4d] transition hover:bg-[#d9bef4]">Start with Elpino <ArrowRight size={16} /></Link></div></section>
  </main>;
}
