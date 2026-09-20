'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useStoredLanguage, setStoredLanguage } from '@/app/hooks/useStoredLanguage';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import UpgradeBanner from './dashboard/UpgradeBanner';

type Session = { email: string; name?: string; userId: string };

type NavItem = {
  label: string;
  href: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

type DropdownGroup = {
  label: string;
  leftSections: NavSection[];
  rightSection: NavSection;
};

const navGroups: DropdownGroup[] = [
  {
    label: 'Platform',
    leftSections: [
      {
        title: 'Explore all products',
        items: [
          { label: 'Elpino helpdesk', href: '/product/helpdesk' },
          { label: 'Fin AI Agent', href: '/product/ai-agent' },
        ],
      },
      {
        title: 'Platform',
        items: [
          { label: 'Channels', href: '/product/channels' },
          { label: 'Integrations', href: '/integrations' },
          { label: 'Safety & security', href: '/security-guide' },
        ],
      },
    ],
    rightSection: {
      title: 'Intercom capabilities',
      items: [
        { label: 'Inbox', href: '/product/inbox' },
        { label: 'Tickets', href: '/product/tickets' },
        { label: 'Help Center', href: '/product/help-center' },
        { label: 'Reporting', href: '/product/reporting' },
        { label: 'Outbound', href: '/product/outbound' },
        { label: 'Knowledge Hub', href: '/product/knowledge-hub' },
        { label: 'Copilot', href: '/product/copilot' },
      ],
    },
  },
  {
    label: 'Solutions',
    leftSections: [
      {
        title: 'By team size',
        items: [
          { label: 'For Founders', href: '/solutions/founders' },
          { label: 'For Busy Teams', href: '/solutions/busy-operators' },
          { label: 'For Revenue Teams', href: '/solutions/revenue-teams' },
        ],
      },
      {
        title: 'By industry',
        items: [
          { label: 'SaaS & Software', href: '/solutions/revenue-teams' },
          { label: 'E-Commerce', href: '/solutions/busy-operators' },
          { label: 'Agencies & Services', href: '/solutions/founders' },
        ],
      },
    ],
    rightSection: {
      title: 'Solution capabilities',
      items: [
        { label: 'Self-Service', href: '/features' },
        { label: 'Omnichannel Triage', href: '/solutions/busy-operators' },
        { label: 'Order Lookups', href: '/integrations' },
        { label: 'Human Escalations', href: '/features' },
        { label: 'Workflows', href: '/features' },
        { label: 'Visitor Intelligence', href: '/features' },
        { label: 'Teammate Handoff', href: '/solutions/founders' },
      ],
    },
  },
  {
    label: 'Resources',
    leftSections: [
      {
        title: 'Learning & Guides',
        items: [
          { label: 'Documentation', href: '/docs' },
          { label: 'Help & FAQ', href: '/faq' },
          { label: 'API & Webhooks', href: '/docs' },
        ],
      },
      {
        title: 'Trust & Legal',
        items: [
          { label: 'Trust Center', href: '/trust' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Safety & security', href: '/security-guide' },
        ],
      },
    ],
    rightSection: {
      title: 'Community & Company',
      items: [
        { label: 'Blog', href: '/blog' },
        { label: 'Changelog', href: '/changelog' },
        { label: 'Community Hub', href: '/community' },
        { label: 'Brand Kit', href: '/brand-kit' },
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact Sales', href: '/contact' },
      ],
    },
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

// Clean 2-column Intercom-style popover dropdown
function MegaNav({ groups, light = false }: { groups: DropdownGroup[]; light?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function open(index: number) {
    clearTimeout(closeTimer.current);
    setOpenIndex(index);
  }

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIndex(null), 180);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const activeGroup = openIndex !== null ? groups[openIndex] : null;

  return (
    <div className="relative">
      {/* Top Nav Trigger Buttons */}
      <div className="flex items-center gap-1">
        {groups.map((group, index) => {
          const isOpen = openIndex === index;
          return (
            <button
              key={group.label}
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 px-3 text-[14px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${isOpen
                  ? light
                    ? 'text-black'
                    : 'text-white'
                  : light
                    ? 'text-[#181e15]/80 hover:text-black focus-visible:outline-black/30'
                    : 'text-white/80 hover:text-white focus-visible:outline-white/35'
                }`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onMouseEnter={() => open(index)}
              onFocus={() => open(index)}
              onMouseLeave={scheduleClose}
            >
              {group.label}
              <Chevron className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* Floating 2-Column Intercom Style Dropdown Card */}
      <div
        className={`absolute left-0 top-[calc(100%+8px)] z-50 transition-all duration-200 ease-out ${activeGroup
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-2 opacity-0'
          }`}
        role="menu"
        onMouseEnter={() => openIndex !== null && open(openIndex)}
        onMouseLeave={scheduleClose}
      >
        {activeGroup && (
          <div
            className={`w-[600px] max-w-[90vw] overflow-hidden rounded-xl border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-colors ${light
                ? 'border-[#e5e7eb] bg-white text-[#11120f]'
                : 'border-white/10 bg-white text-[#11120f] shadow-2xl'
              }`}
          >
            {/* 2-Column Grid divided by subtle vertical line */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[1.1fr_1fr]">
              {/* Left Column: 2 Stacked Sections */}
              <div className="space-y-7 border-r border-[#e5e7eb] pr-8">
                {activeGroup.leftSections.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-[17px] font-semibold tracking-tight text-[#11120f]">
                      {section.title}
                    </h4>
                    <div className="mt-3.5 space-y-3 border-l border-black/25 pl-3.5">
                      {section.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setOpenIndex(null)}
                          className="block text-[15px] font-normal text-[#11120f] underline underline-offset-4 decoration-black/30 transition-colors hover:decoration-black"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Intercom capabilities list */}
              <div className="pl-1">
                <div>
                  <h4 className="text-[17px] font-semibold tracking-tight text-[#11120f]">
                    {activeGroup.rightSection.title}
                  </h4>
                  <div className="mt-3.5 space-y-3 border-l border-black/25 pl-3.5">
                    {activeGroup.rightSection.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpenIndex(null)}
                        className="block text-[15px] font-normal text-[#11120f] underline underline-offset-4 decoration-black/30 transition-colors hover:decoration-black"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Header({
  session,
  variant = 'full',
  showOffer = false,
  pricingPage = false,
}: {
  session: Session | null;
  /** "minimal" strips the announcement bar, nav links, and right-side actions down to just the logo, and drops sticky positioning. "home" is the same dark colors as "full" but tinted #262626 instead of black, and skips the "full"-only bottom announcement bar. */
  variant?: 'full' | 'minimal' | 'light' | 'home';
  showOffer?: boolean;
  pricingPage?: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const language = useStoredLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const { t } = useTranslation(language as any);
  const light = variant === 'light';

  const headerRef = useRef<HTMLDivElement>(null);
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
    const setVar = () =>
      document.documentElement.style.setProperty('--elpino-header-h', `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showOffer, scrolled]);

  const headerClassName = `w-full transition-shadow duration-200 ${light ? 'bg-white' : 'bg-black'
    } ${scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)]' : ''}`;

  const navLinkClassName = `hidden h-9 items-center px-3 text-[14px] font-medium transition lg:inline-flex ${light ? 'text-[#181e15]/80 hover:text-black' : 'text-white/80 hover:text-white'
    }`;

  const loginClassName = `hidden h-9 items-center text-[14px] font-medium transition lg:inline-flex ${light ? 'text-[#181e15]/80 hover:text-black' : 'text-white/80 hover:text-white'
    }`;

  const signUpPillClassName = `inline-flex h-9 items-center justify-center rounded-full px-4 text-[14px] font-medium transition-all duration-150 ${light
      ? 'bg-black text-white hover:bg-black/85 shadow-xs'
      : 'bg-white text-black hover:bg-white/90 shadow-xs'
    }`;

  const mobileLineClassName = light ? 'bg-[#11120f]' : 'bg-[var(--elpino-text)]';

  if (variant === 'minimal') {
    return (
      <div className="relative w-full bg-white text-[#11120f]">
        <header className="w-full bg-white font-display">
          <nav
            className="flex h-[72px] w-full items-center px-5 sm:px-8 lg:px-22"
            aria-label="Main navigation"
          >
            <Link
              className="group/logo flex w-fit shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
              href="/"
            >
              <Image
                alt=""
                src="/icon.png"
                width={96}
                height={96}
                priority
                className="h-9 w-9 rounded-lg object-contain"
              />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#11120f]">
                elpino
              </span>
            </Link>
          </nav>
        </header>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 w-full ${light ? 'text-[#11120f]' : 'text-[var(--elpino-text)]'
        }`}
    >
      {showOffer && !scrolled && <UpgradeBanner marketing pricingPage={pricingPage} />}
      {variant === 'full' && !scrolled && (
        <div className="w-full border-b border-white/10 bg-black">
          <div className="mx-auto flex min-h-11 w-full max-w-[88rem] items-center justify-center overflow-hidden px-4 py-2 sm:px-8">
            <a
              className={`elpino-announcement group grid min-w-0 flex-1 grid-cols-[auto_minmax(0,auto)_minmax(24px,1fr)_auto] items-center gap-3 text-[13px] font-normal sm:gap-5 sm:text-sm ${light ? 'text-[#26332d]' : 'text-white/90'
                }`}
              href="/pricing"
            >
              <span className="elpino-announcement-badge relative inline-flex shrink-0 items-center gap-2 overflow-hidden bg-[var(--elpino-ai)] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_-14px_rgba(35,61,77,0.7)]">
                <span className="relative h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-[var(--elpino-accent)]/40 motion-safe:animate-ping" />
                  <span className="absolute inset-0 rounded-full bg-[var(--elpino-accent)]" />
                </span>
                New
              </span>
              <span
                className={`truncate transition-colors duration-200 ${light ? 'group-hover:text-black' : 'group-hover:text-white'
                  }`}
              >
                Pay for resolutions, not seats — see the new pricing
              </span>
              <span aria-hidden="true" className="elpino-pixel-rail h-[3px] min-w-0" />
              <span
                aria-hidden="true"
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 group-active:scale-[0.96] ${light
                    ? 'border-black/20 text-black group-hover:border-black/50 group-hover:bg-black/5'
                    : 'border-white/20 text-white group-hover:border-white/55 group-hover:bg-white/10'
                  }`}
              >
                ↗
              </span>
            </a>
          </div>
        </div>
      )}

      <header className={headerClassName}>
        <nav
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 transition-[height] duration-200 sm:px-8 lg:px-10"
          aria-label="Main navigation"
        >
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              className="group/logo flex w-fit shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
              href="/"
            >
              <Image
                alt=""
                src="/icon.png"
                width={96}
                height={96}
                priority
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span
                className={`text-[16px] font-semibold tracking-[-0.02em] ${light ? 'text-[#11120f]' : 'text-white'
                  }`}
              >
                elpino
              </span>
            </Link>

            {/* Desktop Navigation with Floating Intercom-style Popovers */}
            <div
              className="hidden items-center gap-1 lg:flex"
              aria-label="Navigation groups"
            >
              <MegaNav groups={navGroups} light={light} />
              <Link className={navLinkClassName} href="/pricing">
                {t('nav.pricing', 'Pricing')}
              </Link>
            </div>
          </div>

          {/* Right-Side Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden shrink-0 items-center gap-4 lg:flex">
              <LanguageSwitcher
                language={language}
                onChange={setStoredLanguage}
                light={light}
                open={languageOpen}
                onOpenChange={setLanguageOpen}
              />
              {session ? (
                <Link
                  className={signUpPillClassName}
                  href="/dashboard"
                >
                  {t('nav.goToDashboard', 'Dashboard')}
                </Link>
              ) : (
                <>
                  <Link className={loginClassName} href="/login">
                    {t('nav.login', 'Log in')}
                  </Link>
                  <Link
                    className={signUpPillClassName}
                    href="/signup"
                  >
                    {t('nav.getStarted', 'Sign up')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition lg:hidden ${light ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="flex h-5 w-5 flex-col justify-center">
                <span
                  className={`mb-1 block h-0.5 w-5 transition-transform duration-300 ${mobileLineClassName}`}
                  style={{
                    transform: isMobileMenuOpen
                      ? 'rotate(45deg) translate(4px, 4px)'
                      : 'none',
                  }}
                />
                <span
                  className={`mb-1 block h-0.5 w-5 transition-opacity duration-300 ${mobileLineClassName}`}
                  style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                />
                <span
                  className={`block h-0.5 w-5 transition-transform duration-300 ${mobileLineClassName}`}
                  style={{
                    transform: isMobileMenuOpen
                      ? 'rotate(-45deg) translate(5px, -5px)'
                      : 'none',
                  }}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            className={`absolute inset-x-0 top-full z-40 max-h-[75dvh] overflow-y-auto border-t px-6 py-6 shadow-2xl lg:hidden ${light ? 'border-[#d8ddd6] bg-white' : 'border-white/10 bg-black'
              }`}
          >
            <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
              {navGroups.map((group) => (
                <div
                  key={group.label}
                  className={`border-b pb-5 ${light ? 'border-black/10' : 'border-white/10'
                    }`}
                >
                  <div
                    className={`mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] ${light ? 'text-black/45' : 'text-white/40'
                      }`}
                  >
                    {group.label}
                  </div>
                  <div className="space-y-4">
                    {group.leftSections.map((sec) => (
                      <div key={sec.title}>
                        <p className="text-xs font-semibold text-white/50">{sec.title}</p>
                        <div className="mt-1.5 space-y-2 border-l border-white/20 pl-3">
                          {sec.items.map((item) => (
                            <Link
                              key={item.label}
                              onClick={() => setIsMobileMenuOpen(false)}
                              href={item.href}
                              className="block text-[14px] text-white/90 underline underline-offset-4 decoration-white/30 hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs font-semibold text-white/50">{group.rightSection.title}</p>
                      <div className="mt-1.5 space-y-2 border-l border-white/20 pl-3">
                        {group.rightSection.items.map((item) => (
                          <Link
                            key={item.label}
                            onClick={() => setIsMobileMenuOpen(false)}
                            href={item.href}
                            className="block text-[14px] text-white/90 underline underline-offset-4 decoration-white/30 hover:text-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/pricing"
                  className={`text-[15px] font-medium ${light ? 'text-[#181e15]' : 'text-white/90'
                    }`}
                >
                  {t('nav.pricing', 'Pricing')}
                </Link>
              </div>

              {session ? (
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/dashboard"
                  className={`mt-3 flex h-11 items-center justify-center rounded-full text-sm font-medium transition ${light
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                    }`}
                >
                  {t('nav.goToDashboard', 'Go to dashboard')}
                </Link>
              ) : (
                <div className="mt-3 flex flex-col gap-2.5">
                  <Link
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/login"
                    className={`flex h-11 items-center justify-center rounded-full border text-sm font-medium transition ${light
                        ? 'border-black/20 text-black'
                        : 'border-white/20 text-white'
                      }`}
                  >
                    {t('nav.login', 'Log in')}
                  </Link>
                  <Link
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/signup"
                    className={`flex h-11 items-center justify-center rounded-full text-sm font-medium transition ${light
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                      }`}
                  >
                    {t('nav.getStarted', 'Sign up')}
                  </Link>
                </div>
              )}

              <div
                className={`mt-4 border-t pt-4 ${light ? 'border-black/10' : 'border-white/10'
                  }`}
              >
                <LanguageSwitcher
                  language={language}
                  onChange={setStoredLanguage}
                  light={light}
                  open={languageOpen}
                  onOpenChange={setLanguageOpen}
                />
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
