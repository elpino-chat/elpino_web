'use client';

import Link from 'next/link';
import { Rocket, ShoppingBag, Users } from 'lucide-react';

type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };
export type MegaGroup = { label: string; sections: NavSection[] };

// Elpino's own look for the menu: ink outlines and flat
// sticker colours (the mascot's black-and-white, plus the product blue), with
// a little motion. Everything is drawn in code, no image files.
const INK = '#11120f';
const card = 'rounded-[26px] border-2 border-[#11120f]';

type Art = 'handoff' | 'stickers' | 'notebook';
const featured: Record<string, { art: Art; title: string; text: string; href: string; cta: string }> = {
  Product: {
    art: 'handoff',
    title: 'AI first. A human the moment it matters.',
    text: 'Elpino answers from your own knowledge, then hands the chat to a teammate with the full story.',
    href: '/product/ai-agent',
    cta: 'Meet the AI agent',
  },
  Solutions: {
    art: 'stickers',
    title: 'Made for how you work',
    text: 'Founders, shops and busy teams each get a setup that fits, live in an afternoon.',
    href: '/solutions/founders',
    cta: 'Find your fit',
  },
  Resources: {
    art: 'notebook',
    title: 'Live in three steps',
    text: 'Paste one line, teach it your docs, switch it on. The guides walk you through each.',
    href: '/docs',
    cta: 'Open the docs',
  },
};

// A short list rather than the blog's data file, so the header doesn't ship
// every post body to every page.
const recentPosts = [
  { title: 'Overage protection: safeguarding your AI budgets', tag: 'Guides', date: '15 May 2026', href: '/blog/budget-caps-overage-prevention', color: '#3784ff' },
  { title: 'The Consent Loop: why proactive AI needs human approval', tag: 'Product', date: '25 Jun 2026', href: '/blog/the-consent-loop', color: '#7060bd' },
  { title: 'Security and OAuth token isolation in LLM agents', tag: 'Security', date: '12 Jun 2026', href: '/blog/oauth-token-isolation-security', color: '#fc7b33' },
];

const glassBackdrop = { backgroundImage: "url('/piliar-1-grandient.png')" } as const;
const monoLabel = 'font-mono text-[11.5px] font-medium uppercase tracking-[0.1em]';

// --------------------------------------------------------------- artwork

// AI avatar and a teammate joined by a dashed path with a dot travelling
// along it: the product's whole story in one picture.
function HandoffArt() {
  return (
    <svg viewBox="0 0 420 300" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="An AI hands a conversation to a teammate">
      <defs>
        <clipPath id="mm-ai-clip"><circle cx="68" cy="78" r="30" /></clipPath>
      </defs>
      <path id="mm-path" d="M100 96 C 190 150, 210 110, 290 205" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <circle r="6.5" fill="#ffd84d" stroke={INK} strokeWidth="2">
        <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto"><mpath href="#mm-path" /></animateMotion>
      </circle>

      {/* AI */}
      <circle cx="68" cy="78" r="34" fill="#fff" stroke={INK} strokeWidth="3" />
      <image href="/icon.png" x="38" y="48" width="60" height="60" clipPath="url(#mm-ai-clip)" />
      <rect x="34" y="118" width="68" height="22" rx="11" fill={INK} />
      <text x="68" y="133" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Elpino AI</text>

      {/* Teammate */}
      <circle cx="326" cy="222" r="34" fill="#fc7b33" stroke={INK} strokeWidth="3" />
      <text x="326" y="234" textAnchor="middle" fontSize="32" fontWeight="700" fill="#fff">P</text>
      <rect x="292" y="262" width="68" height="22" rx="11" fill="#fff" stroke={INK} strokeWidth="2" />
      <text x="326" y="277" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK}>Priya</text>

      {/* Stickers */}
      <g transform="rotate(-4 250 44)">
        <rect x="150" y="24" width="190" height="40" rx="13" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <text x="245" y="49" textAnchor="middle" fontSize="14" fontWeight="600" fill={INK}>&quot;My payment failed!&quot;</text>
      </g>
      <g transform="rotate(3 168 168)">
        <rect x="60" y="150" width="190" height="40" rx="13" fill="#ffd84d" stroke={INK} strokeWidth="2.5" />
        <text x="155" y="175" textAnchor="middle" fontSize="14" fontWeight="600" fill={INK}>Checked. Link sent ✓</text>
      </g>
      <g transform="rotate(-3 330 118)">
        <rect x="240" y="98" width="150" height="34" rx="12" fill="#7060bd" stroke={INK} strokeWidth="2.5" />
        <text x="315" y="120" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">Priya joined the chat</text>
      </g>
    </svg>
  );
}

function StickersArt() {
  const stickers = [
    { icon: Rocket, label: 'Founders', bg: '#ffd84d', pos: 'left-4 top-6', tilt: '-rotate-6' },
    { icon: ShoppingBag, label: 'Online shops', bg: '#ffffff', pos: 'right-3 top-[86px]', tilt: 'rotate-3' },
    { icon: Users, label: 'Busy teams', bg: '#ffb4a0', pos: 'left-10 bottom-8', tilt: '-rotate-2' },
  ];
  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="" className="absolute right-6 top-3 h-20 w-20 animate-[elpino-float_5s_ease-in-out_infinite] rounded-full border-2 border-[#11120f] bg-white object-contain p-1.5" />
      {stickers.map(({ icon: Icon, label, bg, pos, tilt }, i) => (
        <div key={label} className={`absolute ${pos} ${tilt}`}>
          <div
            className="flex animate-[elpino-float_6s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl border-2 border-[#11120f] px-4 py-3"
            style={{ background: bg, animationDelay: `${i * 0.8}s` }}
          >
            <Icon size={18} color={INK} />
            <span className="text-[15px] font-semibold text-[#11120f]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotebookArt() {
  const steps = ['Paste one line of code', 'Teach it your docs', 'Switch it on'];
  return (
    <div className="flex h-full w-full items-center justify-center p-5">
      <div
        className="relative w-full max-w-[300px] -rotate-2 rounded-2xl border-2 border-[#11120f] bg-[#fffdf5] p-5"
        style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 33px, rgba(55,132,255,0.16) 33px 34px)' }}
      >
        <span className="absolute -top-3 left-6 h-6 w-16 rotate-[-3deg] bg-[#ffd84d]/90" aria-hidden="true" />
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-black/45">Quick start</p>
        <ol className="mt-3 flex flex-col gap-[13px]">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-[15px] leading-5 text-[#11120f]">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] text-[12px] font-bold ${i === 2 ? 'bg-[#3784ff] text-white' : 'bg-white'}`}>
                {i === 2 ? '✓' : i + 1}
              </span>
              <span className={i === 2 ? 'bg-[linear-gradient(transparent_55%,#ffd84d_55%)] font-semibold' : ''}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// --------------------------------------------------------------- panel

export function MegaMenuPanel({ group, onNavigate }: { group: MegaGroup; onNavigate: () => void }) {
  const feature = featured[group.label] ?? featured.Product;

  return (
    <div
      className="h-[calc(100dvh-80px)] max-h-[880px] w-[calc(100vw-2rem)] max-w-8xl overflow-y-auto rounded-[32px] border-2 border-white/80 bg-cover bg-center p-5 shadow-[0_30px_80px_rgba(15,23,42,0.2)]"
      style={glassBackdrop}
    >
      <div className="grid min-h-full grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1.1fr_0.95fr]">
        {/* Featured: a scene, a promise, a button */}
        <Link href={feature.href} onClick={onNavigate} className={`group flex min-h-[440px] flex-col overflow-hidden bg-[#3784ff] ${card}`}>
          <div className="relative min-h-[270px] flex-1 overflow-hidden" aria-hidden="true">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(#fff 1.4px, transparent 1.4px)', backgroundSize: '20px 20px' }}
            />
            {feature.art === 'handoff' && <HandoffArt />}
            {feature.art === 'stickers' && <StickersArt />}
            {feature.art === 'notebook' && <NotebookArt />}
          </div>
          <div className="border-t-2 border-[#11120f] bg-[#fffdf5] p-5">
            <h3 className="text-[23px] font-medium leading-[1.15] tracking-tight text-[#11120f]">{feature.title}</h3>
            <p className="mt-2 text-[14.5px] leading-6 text-black/60">{feature.text}</p>
            <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 text-[14px] font-semibold text-[#11120f] transition group-hover:-translate-y-0.5 group-hover:">
              {feature.cta} <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>

        {/* Links, numbered like a table of contents */}
        <div className={`flex flex-col bg-[#fff8ec] p-7 text-[#11120f] ${card}`}>
          <div className="flex items-center gap-3">
            <span className="rounded-full border-2 border-[#11120f] bg-[#11120f] px-3 py-1 text-[13px] font-semibold text-white">{group.label}</span>
            <span className="h-[2px] flex-1 bg-[repeating-linear-gradient(90deg,#11120f_0_6px,transparent_6px_12px)]" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            {group.sections.map((section, index) => (
              <div key={section.title} className="flex flex-col">
                <h4 className="mb-2 flex items-baseline gap-2.5 text-[19px] font-medium tracking-tight">
                  <span className="font-mono text-[12px] font-medium text-[#3784ff]">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h4>
                <div className="flex flex-col">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onNavigate}
                      className="group/link -mx-2.5 flex items-center justify-between rounded-lg px-2.5 py-[7px] text-[15.5px] transition hover:bg-[#ffd84d]"
                    >
                      {item.label}
                      <span className="-translate-x-1 opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100" aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing sticker + blog stubs */}
        <div className="flex min-h-0 flex-col gap-5">
          <Link href="/pricing" onClick={onNavigate} className={`group relative overflow-hidden bg-[#7060bd] p-6 text-white ${card}`}>
            <p className={`${monoLabel} text-white/75`}>Explore</p>
            {/* a chat bubble that is always "typing" */}
            <div className="mt-4 flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border-2 border-[#11120f] bg-white px-4 py-3" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7060bd]" style={{ animationDelay: `${dot * 0.15}s` }} />
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-[26px] font-medium leading-none tracking-tight">See pricing</h3>
                <p className="mt-2 text-[14.5px] text-white/80">Start free. Pay as your team grows.</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] text-[18px] font-bold text-[#11120f] transition group-hover:rotate-[-45deg]" aria-hidden="true">→</span>
            </div>
            <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" aria-hidden="true" />
          </Link>

          <div className={`flex-1 bg-white p-5 text-[#11120f] ${card}`}>
            <p className={`${monoLabel} text-black/50`}>Fresh from the blog</p>
            <div className="mt-3 flex flex-col">
              {recentPosts.map((post, index) => (
                <Link
                  key={post.href}
                  href={post.href}
                  onClick={onNavigate}
                  className={`group/post flex items-center gap-4 py-3.5 ${index ? 'border-t-2 border-dashed border-black/15' : ''}`}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#11120f] font-mono text-[15px] font-bold text-white transition group-hover/post:-rotate-6"
                    style={{ background: post.color }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-[15px] leading-[1.3] decoration-[#3784ff] decoration-2 underline-offset-4 group-hover/post:underline">{post.title}</span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-black/45">
                      {post.tag} · {post.date}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
