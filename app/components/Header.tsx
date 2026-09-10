'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, Tag, Rocket, Users, TrendingUp, ShieldCheck, HelpCircle, Plug, Newspaper, History, Users2, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useStoredLanguage, setStoredLanguage } from '@/app/hooks/useStoredLanguage';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import UpgradeBanner from './dashboard/UpgradeBanner';

type Session = { email: string; name?: string; userId: string };

type DropdownItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

type DropdownGroup = {
  label: string;
  /** The left panel's single highlight card — distinct content from `items`
      (not a repeat of the first couple of list entries), so the two halves
      of the mega menu never show the same thing twice. */
  featured: { image: string; title: string; description: string; href: string };
  items: DropdownItem[];
};

const navGroups: DropdownGroup[] = [
  {
    // "AI operator", "Email triage", and "Approvals" used to live here as
    // sub-items — they described a different product and now redirect (see
    // next.config.ts). Not replaced with equivalents: there is no per-feature
    // page yet for the AI agent, the widget, or human handoff individually —
    // /features covers all of it in one place until those exist.
    label: 'Product',
    featured: {
      image: '/images/heros/elpino-dawn-hero.webp',
      title: 'See Elpino in action',
      description: 'Watch the AI answer, escalate, and hand off — live in the chat widget.',
      href: '/features',
    },
    items: [
      {
        label: 'Features',
        description: 'Explore all the ways Elpino can help your team.',
        href: '/features',
        icon: LayoutGrid,
      },
      {
        label: 'Integrations',
        description: 'Connect Stripe, Razorpay, and Trello to your workspace.',
        href: '/integrations',
        icon: Plug,
      },
      {
        label: 'Pricing',
        description: 'Plans, seats, and resolutions explained.',
        href: '/pricing',
        icon: Tag,
      },
    ],
  },
  {
    label: 'Solutions',
    featured: {
      image: '/images/heros/elpino-dawn-hero.webp',
      title: 'Built for how you work',
      description: 'From solo founders to full support teams — pick the shape that fits.',
      href: '/solutions/founders',
    },
    items: [
      { label: 'For founders', description: 'Support your customers as your business grows.', href: '/solutions/founders', icon: Rocket },
      { label: 'For busy teams', description: 'Keep everyday customer conversations moving.', href: '/solutions/busy-operators', icon: Users },
      { label: 'For revenue teams', description: 'Bring customer conversations into one workspace.', href: '/solutions/revenue-teams', icon: TrendingUp },
    ],
  },
  {
    label: 'Learn',
    featured: {
      image: '/images/heros/elpino-dawn-hero.webp',
      title: 'Fresh from the blog',
      description: 'Guides on AI support, human handoff, and getting set up.',
      href: '/blog',
    },
    items: [
      {
        label: 'Trust',
        description: 'See how Elpino keeps your data — and your customers\' — safe.',
        href: '/trust',
        icon: ShieldCheck,
      },
      {
        label: 'FAQ',
        description: 'Answers on setup, billing, and controls.',
        href: '/faq',
        icon: HelpCircle,
      },
      {
        label: 'Blog',
        description: 'Notes on support, AI, and building Elpino.',
        href: '/blog',
        icon: Newspaper,
      },
      {
        label: 'Changelog',
        description: 'What shipped, and when.',
        href: '/changelog',
        icon: History,
      },
      {
        label: 'Community',
        description: 'Connect with other Elpino teams.',
        href: '/community',
        icon: Users2,
      },
    ],
  },
];

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="10"
      height="10"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10.98c-.15 0-.35-.05-.45-.15l-5.5-4.5a.75.75 0 1 1 .95-1.15l5 4.1 5-4.1a.75.75 0 0 1 .95 1.15l-5.5 4.5c-.1.1-.3.15-.45.15Z"
        fill="currentColor"
      />
    </svg>
  );
}

// A ClickUp-style mega menu: one full-width panel shared by every top-level
// item, rather than each item owning its own small popover. State is lifted
// here (not per-button) so moving the pointer straight across from "Product"
// to "Solutions" swaps the panel's content in place instead of closing and
// reopening it. The close is debounced with a short timer — not CSS
// group-hover — because the panel is visually detached below a gap (it sits
// under the whole header, not directly under its trigger), so a plain
// mouseleave on the trigger would fire before the pointer reaches the panel.
function MegaNav({ groups, light = false }: { groups: DropdownGroup[]; light?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function open(index: number) {
    clearTimeout(closeTimer.current);
    setOpenIndex(index);
  }

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIndex(null), 150);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const activeGroup = openIndex !== null ? groups[openIndex] : null;

  return (
    <>
      {groups.map((group, index) => (
        <button
          key={group.label}
          type="button"
          className={`${index === 0 ? '' : 'elpino-nav-item'} inline-flex h-11 items-center gap-1.5 px-3 text-[15px] font-normal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${light ? 'text-[#181e15] hover:text-black focus-visible:outline-black/30' : 'text-white/90 hover:text-white focus-visible:outline-white/35'}`}
          aria-haspopup="menu"
          aria-expanded={openIndex === index}
          onMouseEnter={() => open(index)}
          onFocus={() => open(index)}
          onMouseLeave={scheduleClose}
        >
          {group.label}
          <Chevron className={`transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} />
        </button>
      ))}

      <div
        className={`fixed inset-x-0 z-40 border-b transition-opacity duration-150 ${light ? 'border-black/10 bg-white' : 'border-white/10 bg-black'} ${
          activeGroup ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
        style={{ top: 'var(--elpino-header-h, 76px)' }}
        role="menu"
        onMouseEnter={() => openIndex !== null && open(openIndex)}
        onMouseLeave={scheduleClose}
      >
        {activeGroup && (
          <div className="mx-auto flex w-full flex-col gap-12 px-5 py-10 sm:px-8 lg:flex-row lg:px-22">
            {/* Left: one featured highlight, distinct from the list on the right */}
            <div className="lg:w-[380px] lg:shrink-0">
              <Link
                href={activeGroup.featured.href}
                className="group/featured block"
                role="menuitem"
                onClick={() => setOpenIndex(null)}
              >
                <span className={`block overflow-hidden rounded-xl border ${light ? 'border-black/10' : 'border-white/10'}`}>
                  <Image
                    src={activeGroup.featured.image}
                    alt=""
                    width={760}
                    height={570}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover/featured:scale-[1.03]"
                  />
                </span>
                <span className={`mt-4 block text-base font-medium ${light ? 'text-[#11120f]' : 'text-white/90'}`}>
                  {activeGroup.featured.title}
                </span>
                <span className={`mt-1 block text-sm leading-5 ${light ? 'text-[#667069]' : 'text-[var(--elpino-text-muted)]'}`}>
                  {activeGroup.featured.description}
                </span>
              </Link>
            </div>

            {/* Right: the full list, icon + title + description */}
            <div className="flex-1">
              <p className={`font-mono text-xs uppercase tracking-[0.18em] ${light ? 'text-black/40' : 'text-white/40'}`}>
                Explore all {activeGroup.label.toLowerCase()}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                {activeGroup.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group/item flex items-start gap-4 rounded-xl"
                      role="menuitem"
                      onClick={() => setOpenIndex(null)}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors ${light ? 'border-black/10 bg-[#FAFAFA] group-hover/item:border-black/20' : 'border-white/10 bg-white/[0.04] group-hover/item:border-white/20'}`}>
                        <Icon size={19} aria-hidden="true" />
                      </span>
                      <span>
                        <span className={`block text-base font-normal ${light ? 'text-[#11120f]' : 'text-white/90'}`}>{item.label}</span>
                        <span className={`mt-1 block text-sm leading-5 ${light ? 'text-[#667069]' : 'text-[var(--elpino-text-muted)]'}`}>{item.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function Header({
  session,
  variant = 'full',
  showOffer = false,
  pricingPage = false,
}: {
  session: Session | null;
  /** "minimal" strips the announcement bar, nav links, and right-side actions down to just the logo, and drops sticky positioning. */
  variant?: 'full' | 'minimal' | 'light';
  showOffer?: boolean;
  pricingPage?: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const language = useStoredLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const { t } = useTranslation(language as any);
  const light = variant === 'light';

  // The header stays fixed (out of page flow) purely so its height can
  // change live — e.g. when the offer bar is dismissed — without a layout
  // jump; it's solid, not an overlay. `headerRef` reports the bar's real
  // rendered height (nav + the optional offer bar) into --elpino-header-h,
  // which AppShell's <main> uses as top padding so content never sits
  // underneath it.
  const headerRef = useRef<HTMLDivElement>(null);
  // Past a small scroll threshold the offer bar collapses away and the nav
  // itself tightens up, so the header reads as a slim, compact bar instead
  // of the taller two-row layout it starts as at the top of the page.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const setVar = () => document.documentElement.style.setProperty('--elpino-header-h', `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showOffer, scrolled]);

  const headerClassName = `w-full transition-shadow duration-200 ${light ? 'bg-white' : 'bg-black'} ${scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)]' : ''}`;
  const pricingClassName = `hidden h-11 items-center rounded-full px-3 text-[15px] font-normal transition lg:inline-flex ${light ? 'text-[#181e15] hover:text-black' : 'text-white/90 hover:text-white'}`;
  const loginClassName = `hidden h-12 items-center rounded-md border px-7 text-[15px] font-normal transition lg:inline-flex ${light ? 'border-[#181e15]/25 text-[#181e15] hover:bg-black/[0.04]' : 'border-white/30 text-white hover:bg-white/10'}`;
  const mobileLineClassName = light ? 'bg-[#11120f]' : 'bg-[var(--elpino-text)]';

  if (variant === 'minimal') {
    return (
      <div className="relative w-full bg-white text-[#11120f]">
        <header className="w-full bg-white font-display">
          <nav
            className="flex h-[72px] w-full items-center px-5 sm:px-8 lg:px-22"
            aria-label="Main navigation"
          >
            <Link className="group/logo flex w-fit shrink-0 items-center transition-opacity hover:opacity-90" href="/">
              <Image alt="Elpino" src="/elpino.png" width={906} height={275} priority className="h-9 w-auto object-contain" />
            </Link>
          </nav>
        </header>
      </div>
    );
  }

  return (
    <div ref={headerRef} className={`fixed inset-x-0 top-0 z-50 w-full ${light ? 'text-[#11120f]' : 'text-[var(--elpino-text)]'}`}>
      {showOffer && !scrolled && <UpgradeBanner marketing pricingPage={pricingPage} />}
      {!light && !scrolled && <div className='w-full border-b border-white/10 bg-black'>
        <div className="mx-auto flex min-h-11 w-full max-w-[88rem] items-center justify-center overflow-hidden px-4 py-2 sm:px-8">
          <a
            className={`elpino-announcement group grid min-w-0 flex-1 grid-cols-[auto_minmax(0,auto)_minmax(24px,1fr)_auto] items-center gap-3 text-[13px] font-normal sm:gap-5 sm:text-sm ${light ? 'text-[#26332d]' : 'text-white/90'}`}
            href="/pricing"
          >
            <span className="elpino-announcement-badge relative inline-flex shrink-0 items-center gap-2 overflow-hidden bg-[var(--elpino-ai)] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_-14px_rgba(35,61,77,0.7)]">
              <span className="relative h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[var(--elpino-accent)]/40 motion-safe:animate-ping" />
                <span className="absolute inset-0 rounded-full bg-[var(--elpino-accent)]" />
              </span>
              New
            </span>
            <span className={`truncate transition-colors duration-200 ${light ? 'group-hover:text-black' : 'group-hover:text-white'}`}>
              Pay for resolutions, not seats — see the new pricing
            </span>
            <span aria-hidden="true" className="elpino-pixel-rail h-[3px] min-w-0" />
            <span
              aria-hidden="true"
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 group-active:scale-[0.96] ${light ? 'border-black/20 text-black group-hover:border-black/50 group-hover:bg-black/5' : 'border-white/20 text-white group-hover:border-white/55 group-hover:bg-white/10'}`}
            >
              ↗
            </span>
          </a>
        </div>
      </div>}

      <header className={headerClassName}>
      <nav
        className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-6 px-5 transition-[height] duration-200 sm:px-8 lg:px-22 ${scrolled ? 'h-16' : 'h-[76px]'} ${light ? '' : 'border-b border-white/10'}`}
        aria-label="Main navigation"
      >
        <Link className="group/logo flex w-fit shrink-0 items-center transition-opacity hover:opacity-90" href="/">
          <Image alt="Elpino" src="/elpino.png" width={906} height={275} priority className="h-8 w-auto object-contain sm:h-9" />
        </Link>

        <div className="hidden items-center justify-start gap-2 pl-4 lg:flex" aria-label="Navigation groups">
          <MegaNav groups={navGroups} light={light} />
          <Link className={`${pricingClassName} elpino-nav-item`} href="/pricing">
            {t('nav.pricing', 'Pricing')}
          </Link>
        </div>

        {/* Actions and the mobile toggle share one grid cell — as separate
            children they would each claim a column and break the centring. */}
        <div className="flex items-center justify-end">
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {session ? (
            <Link
              className={`inline-flex h-12 items-center justify-center rounded-md px-7 text-[15px] font-normal transition-colors ${light ? 'bg-[#181e15] text-white hover:bg-black' : 'bg-white text-black hover:bg-white/90'}`}
              href="/dashboard"
            >
              {t('nav.goToDashboard', 'Go to dashboard')}
            </Link>
          ) : (
            <>
              <Link className={loginClassName} href="/login">
                {t('nav.login', 'Log In')}
              </Link>
              <Link
                className={`inline-flex h-12 items-center justify-center rounded-md px-7 text-[15px] font-normal transition-colors ${light ? 'bg-[#181e15] text-white hover:bg-black' : 'bg-white text-black hover:bg-white/90'}`}
                href="/signup"
              >
                {t('nav.getStarted', 'Start for free')}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition lg:hidden ${light ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <div className="flex h-5 w-5 flex-col justify-center">
            <span
              className={`mb-1 block h-0.5 w-5 transition-transform duration-300 ${mobileLineClassName}`}
              style={{
                transform: isMobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              className={`mb-1 block h-0.5 w-5 transition-opacity duration-300 ${mobileLineClassName}`}
              style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
            />
            <span
              className={`block h-0.5 w-5 transition-transform duration-300 ${mobileLineClassName}`}
              style={{
                transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              }}
            />
          </div>
        </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className={`absolute inset-x-0 top-full z-40 max-h-[70dvh] overflow-y-auto border-t px-5 py-5 shadow-[0_28px_90px_-35px_rgba(0,0,0,0.55)] lg:hidden ${light ? 'border-[#d8ddd6] bg-white' : 'border-white/10 bg-black'}`}>
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navGroups.map((group) => (
              <div key={group.label} className={`border-b pb-3 ${light ? 'border-black/10' : 'border-white/10'}`}>
                <div className={`mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] ${light ? 'text-black/40' : 'text-white/35'}`}>
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    onClick={() => setIsMobileMenuOpen(false)}
                    href={item.href}
                    className={`block rounded-xl px-2 py-2.5 transition ${light ? 'hover:bg-black/[0.04]' : 'hover:bg-white/[0.06]'}`}
                  >
                    <span className={`block text-base font-normal ${light ? 'text-[#11120f]' : 'text-white/90'}`}>{item.label}</span>
                    <span className={`mt-0.5 block text-[13px] leading-5 ${light ? 'text-[#667069]' : 'text-[var(--elpino-text-muted)]'}`}>
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/pricing"
              className={`rounded-xl px-2 py-3 text-base font-normal ${light ? 'text-[#11120f]' : 'text-white/90'}`}
            >
              {t('nav.pricing', 'Pricing')}
            </Link>
            {session ? (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/dashboard"
                className={`mt-2 flex h-12 items-center justify-center rounded-full border text-base font-normal transition active:scale-[0.98] ${light ? 'border-black bg-black text-white hover:bg-[#2a2c27]' : 'border-white/20 bg-transparent text-white/90 hover:border-white/40 hover:bg-white/[0.07] hover:text-white'}`}
              >
                {t('nav.goToDashboard', 'Go to dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/login"
                className={`rounded-xl px-2 py-3 text-base font-normal ${light ? 'text-[#11120f]' : 'text-white/90'}`}
                >
                  {t('nav.login', 'Log in')}
                </Link>
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mt-2 flex h-12 items-center justify-center rounded-full border text-base font-normal transition active:scale-[0.98] ${light ? 'border-black bg-black text-white hover:bg-[#2a2c27]' : 'border-white/20 bg-transparent text-white/90 hover:border-white/40 hover:bg-white/[0.07] hover:text-white'}`}
                  href="/signup"
                >
                  {t('nav.getStarted', 'Get started')}
                </Link>
              </>
            )}
            <div className={`mt-4 border-t pt-4 ${light ? 'border-black/10' : 'border-white/10'}`}>
              <LanguageSwitcher language={language} onChange={setStoredLanguage} light={light} open={languageOpen} onOpenChange={setLanguageOpen} />
            </div>
          </nav>
        </div>
      )}
    </header>
    </div>
  );
}
