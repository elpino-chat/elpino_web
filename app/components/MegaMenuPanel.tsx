'use client';

import Link from 'next/link';
import { Check, Rocket, ShoppingBag, Users } from 'lucide-react';
import { tSectionTitle, tNavItem } from './nav-data';

type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };
export type MegaGroup = { label: string; sections: NavSection[] };
type T = (key: string, defaultValue?: string) => string;

// The menu in the site's quiet style: white panels with thin outlines and 10px corners, the product blue for
// accents, and calm artwork drawn in code (no image files).
const INK = '#11120f';

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


// --------------------------------------------------------------- artwork

// An AI and a teammate joined by a dashed path with a dot travelling along it: the product's story in one picture.
function HandoffArt() {
  return (
    <svg viewBox="0 0 420 300" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="An AI hands a conversation to a teammate">
      <defs>
        <clipPath id="mm-ai-clip"><circle cx="68" cy="78" r="30" /></clipPath>
      </defs>
      <path id="mm-path" d="M100 96 C 190 150, 210 110, 290 205" fill="none" stroke="#11120f" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
      <circle r="6" fill="#0078f4">
        <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto"><mpath href="#mm-path" /></animateMotion>
      </circle>

      {/* AI */}
      <circle cx="68" cy="78" r="34" fill="#fff" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      <image href="/icon.png" x="38" y="48" width="60" height="60" clipPath="url(#mm-ai-clip)" />
      <rect x="34" y="118" width="68" height="22" rx="11" fill={INK} />
      <text x="68" y="133" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Elpino AI</text>

      {/* Teammate */}
      <circle cx="326" cy="222" r="34" fill="#0078f4" />
      <text x="326" y="234" textAnchor="middle" fontSize="32" fontWeight="700" fill="#fff">P</text>
      <rect x="292" y="262" width="68" height="22" rx="11" fill="#fff" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      <text x="326" y="277" textAnchor="middle" fontSize="11" fontWeight="600" fill={INK}>Priya</text>

      {/* What was said */}
      <rect x="150" y="24" width="190" height="40" rx="12" fill="#fff" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      <text x="245" y="49" textAnchor="middle" fontSize="14" fontWeight="500" fill={INK}>&quot;My payment failed!&quot;</text>
      <rect x="60" y="150" width="190" height="40" rx="12" fill="#fff" stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      <text x="155" y="175" textAnchor="middle" fontSize="14" fontWeight="500" fill={INK}>Checked. Link sent ✓</text>
      <rect x="240" y="98" width="150" height="34" rx="11" fill={INK} />
      <text x="315" y="120" textAnchor="middle" fontSize="13" fontWeight="500" fill="#fff">Priya joined the chat</text>
    </svg>
  );
}

function StickersArt() {
  const chips = [
    { icon: Rocket, label: 'Founders', pos: 'left-5 top-7' },
    { icon: ShoppingBag, label: 'Online shops', pos: 'right-4 top-[96px]' },
    { icon: Users, label: 'Busy teams', pos: 'left-12 bottom-9' },
  ];
  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/community-sloths.png" alt="" className="absolute right-6 top-4 h-20 w-20 animate-[elpino-float_5s_ease-in-out_infinite] rounded-full border border-black/25 bg-white object-cover object-center" />
      {chips.map(({ icon: Icon, label, pos }, i) => (
        <div key={label} className={`absolute ${pos}`}>
          <div className="flex animate-[elpino-float_6s_ease-in-out_infinite] items-center gap-2.5 rounded-full border border-black/30 bg-white px-4 py-2.5 shadow-[0_8px_20px_rgba(17,18,15,0.08)]" style={{ animationDelay: `${i * 0.8}s` }}>
            <Icon size={17} color={INK} />
            <span className="text-[15px] font-medium text-[#11120f]">{label}</span>
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
      <div className="w-full max-w-[300px] rounded-[10px] border border-black/30 bg-white p-5 shadow-[0_12px_30px_rgba(17,18,15,0.08)]">
        <p className="text-[13px] font-medium text-black/45">Quick start</p>
        <ol className="mt-3 flex flex-col gap-3.5">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-[15px] leading-5 text-[#11120f]">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${i === 2 ? 'bg-[#1aa37a] text-white' : 'border border-black/30 bg-white'}`}>
                {i === 2 ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={i === 2 ? 'font-medium' : ''}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// --------------------------------------------------------------- panel

const FEATURED_KEYS: Record<string, string> = { Product: 'product', Solutions: 'solutions', Resources: 'resources' };
const GROUP_LABEL_KEYS: Record<string, string> = { Product: 'product', Solutions: 'solutions', Resources: 'resources' };

export function MegaMenuPanel({ group, onNavigate, t }: { group: MegaGroup; onNavigate: () => void; t: T }) {
  const feature = featured[group.label] ?? featured.Product;
  const featuredKey = FEATURED_KEYS[group.label] ?? 'product';
  const featureTitle = t(`nav.featured.${featuredKey}.title`, feature.title);
  const featureText = t(`nav.featured.${featuredKey}.text`, feature.text);
  const featureCta = t(`nav.featured.${featuredKey}.cta`, feature.cta);
  const groupLabelKey = GROUP_LABEL_KEYS[group.label];
  const groupLabel = groupLabelKey ? t(`nav.groups.${groupLabelKey}`, group.label) : group.label;

  return (
    <div className="max-h-[calc(100dvh-100px)] w-[calc(100vw-2rem)] max-w-8xl overflow-y-auto rounded-xl border border-black/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16),0_2px_6px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_0.9fr] lg:divide-x lg:divide-black/10">
        {/* Featured: a scene, a promise, a button */}
        <Link href={feature.href} onClick={onNavigate} className="group flex min-h-[400px] flex-col p-5">
          <div className="relative min-h-[250px] flex-1 overflow-hidden rounded-lg bg-[#f4f4f2]" aria-hidden="true">
            {feature.art === 'handoff' && <HandoffArt />}
            {feature.art === 'stickers' && <StickersArt />}
            {feature.art === 'notebook' && <NotebookArt />}
          </div>
          <div className="px-1 pb-1 pt-5">
            <h3 className="text-[21px] font-medium leading-[1.2] tracking-[-0.02em] text-[#11120f]">{featureTitle}</h3>
            <p className="mt-2 text-[14.5px] leading-6 text-black/55">{featureText}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-medium text-[#0078f4]">
              {featureCta} <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </Link>

        {/* Links, in numbered groups */}
        <div className="p-8 text-[#11120f]">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-black/40">{groupLabel}</p>
          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
            {group.sections.map((section, index) => (
              <div key={section.title} className="flex flex-col">
                <h4 className="mb-2.5 flex items-center gap-2.5 text-[13px] font-medium text-black/50">
                  <span className="grid size-5 place-items-center rounded-full bg-[#0078f4]/10 text-[10.5px] font-semibold text-[#0078f4]">{index + 1}</span>
                  {tSectionTitle(t, section.title)}
                </h4>
                <div className="flex flex-col">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onNavigate}
                      className="group/link -mx-3 flex items-center justify-between rounded-md px-3 py-[9px] text-[16px] leading-6 transition-colors hover:bg-[#f4f4f2]"
                    >
                      {tNavItem(t, item)}
                      <span className="-translate-x-1 text-[#0078f4] opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100" aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing card + blog stubs */}
        <div className="flex min-h-0 flex-col gap-6 bg-[#fafaf9] p-5">
          <Link href="/pricing" onClick={onNavigate} className="group relative overflow-hidden rounded-lg bg-[#11120f] p-6 text-white">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-white/50">{t('nav.megaMenu.explore', 'Explore')}</p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-[24px] font-medium leading-none tracking-[-0.02em]">{t('nav.megaMenu.seePricing', 'See pricing')}</h3>
                <p className="mt-2 text-[14px] leading-5 text-white/60">{t('nav.megaMenu.seePricingNote', 'Start free. Pay as your team grows.')}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[17px] font-bold text-[#11120f] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </div>
          </Link>

          <div className="flex-1 px-1">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-black/40">{t('nav.megaMenu.freshFromBlog', 'Fresh from the blog')}</p>
            <div className="mt-2 flex flex-col">
              {recentPosts.map((post, index) => (
                <Link
                  key={post.href}
                  href={post.href}
                  onClick={onNavigate}
                  className={`group/post block py-3.5 ${index ? 'border-t border-black/10' : ''}`}
                >
                  <span className="line-clamp-2 block text-[15px] font-medium leading-[1.35] tracking-[-0.01em] text-[#11120f] transition-colors group-hover/post:text-[#0078f4]">{post.title}</span>
                  <span className="mt-1.5 block text-[12.5px] text-black/45">
                    {post.tag} · {post.date}
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
