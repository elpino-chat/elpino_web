'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useStoredLanguage, setStoredLanguage } from '@/app/hooks/useStoredLanguage';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import UpgradeBanner from './dashboard/UpgradeBanner';
import { MegaMenuPanel } from './MegaMenuPanel';
import { navGroups, type DropdownGroup } from './nav-data';

type Session = { email: string; name?: string; userId: string };


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

// Clean 4-column dropdown
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
    <div>
      {/* Top Nav Trigger Buttons */}
      <div className="flex items-center gap-1">
        {groups.map((group, index) => {
          const isOpen = openIndex === index;
          return (
            <button
              key={group.label}
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 px-3 text-sm font-normal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${isOpen
                  ? light
                    ? 'text-black'
                    : 'text-white'
                  : light
                    ? 'text-black hover:text-black focus-visible:outline-black/30'
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

      {/* Floating 4-Column Dropdown Card. Anchored to the header bar (the
          nearest positioned ancestor) and centred on it, so the wide panel is
          centred on the page rather than hanging off the nav group. */}
      <div
        className={`absolute left-1/2 top-[calc(100%+8px)] z-50 -translate-x-1/2 transition-all duration-200 ease-out ${activeGroup
            ? 'visible translate-y-0 opacity-100'
            : 'pointer-events-none invisible -translate-y-2 opacity-0'
          }`}
        role="menu"
        onMouseEnter={() => openIndex !== null && open(openIndex)}
        onMouseLeave={scheduleClose}
      >
        {activeGroup && <MegaMenuPanel group={activeGroup} onNavigate={() => setOpenIndex(null)} />}
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
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
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

  // The strip is transparent; the nav inside it is the visible bar, hanging
  // from the top edge with only its bottom corners rounded.
  const headerClassName = 'w-full px-4 sm:px-6';

  const navLinkClassName = `hidden h-9 items-center px-3 text-sm font-normal transition lg:inline-flex ${light ? 'text-black hover:text-black/70' : 'text-white/80 hover:text-white'
    }`;

  const loginClassName = `hidden h-[36px] items-center justify-center rounded-lg border-2 px-4 text-sm font-normal transition-all duration-150 lg:inline-flex ${light 
      ? 'border-black/30 bg-transparent text-black hover:bg-black/5' 
      : 'border-white bg-transparent text-white hover:bg-white/10'
    }`;

  const signUpPillClassName = `inline-flex h-[36px] items-center justify-center rounded-lg px-4 text-sm font-normal transition-all duration-150 bg-[#3784ff] text-white shadow-xs hover:bg-[#3784ff]/90`;

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
      <header className={headerClassName}>
        <nav
          className={`relative mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-b-2xl border-x border-b px-5 sm:px-6 ${light ? 'border-white/70 bg-white/45 shadow-[0_8px_30px_rgba(15,23,42,0.06)]' : 'border-white/15 bg-black/40'} backdrop-blur-xl backdrop-saturate-150`}
          aria-label="Main navigation"
        >
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              className="group/logo flex w-fit shrink-0 items-center transition-opacity hover:opacity-90"
              href="/"
            >
              <Image
                alt="Elpino"
                src="/elpino.png"
                width={906}
                height={275}
                priority
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation with floating mega-nav popovers */}
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
          <div className="flex items-center gap-1">
            <div className="hidden shrink-0 items-center gap-1 lg:flex">
              {session ? (
                <Link
                  className={signUpPillClassName}
                  href="/dashboard"
                >
                  {t('nav.goToDashboard', 'Dashboard')}
                </Link>
              ) : (
                <>
                  <Link className={`hidden h-9 items-center px-3 text-sm font-normal transition lg:inline-flex ${light ? 'text-black hover:text-black/70' : 'text-white hover:text-white/70'}`} href="/contact">
                    Contact sales
                  </Link>
                  <Link className={loginClassName} href="/login">
                    Log in
                  </Link>
                  <div className="ml-2">
                    <Link
                      className={signUpPillClassName}
                      href="/signup"
                    >
                      Start free trial
                    </Link>
                  </div>
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
          <div className="absolute inset-x-3 top-full z-40 mt-2 max-h-[80dvh] overflow-y-auto rounded-3xl border-2 border-[#11120f] bg-[#fff8ec] p-4 text-[#11120f] shadow-xl lg:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navGroups.map((group) => {
                const open = openMobileGroup === group.label;
                return (
                  <div key={group.label} className="rounded-2xl border-2 border-[#11120f] bg-white">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenMobileGroup(open ? null : group.label)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[17px] font-semibold"
                    >
                      {group.label}
                      <span className="grid size-7 place-items-center rounded-full border-2 border-[#11120f] transition-transform duration-300" style={{ backgroundColor: open ? '#ffd84d' : '#fff', transform: open ? 'rotate(45deg)' : 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="#11120f" strokeWidth="2" strokeLinecap="round" /></svg>
                      </span>
                    </button>
                    {open && (
                      <div className="space-y-4 border-t-2 border-dashed border-[#11120f]/25 px-4 pb-4 pt-3">
                        {group.sections.map((sec) => (
                          <div key={sec.title}>
                            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#11120f]/45">{sec.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sec.items.map((item) => (
                                <Link
                                  key={item.label}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  href={item.href}
                                  className="rounded-full border-2 border-[#11120f] bg-[#fffdf5] px-3.5 py-2 text-[14.5px] font-medium transition active:bg-[#ffd84d]"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/pricing"
                className="rounded-2xl border-2 border-[#11120f] bg-white px-4 py-3.5 text-[17px] font-semibold"
              >
                {t('nav.pricing', 'Pricing')}
              </Link>

              {session ? (
                <Link
                  onClick={() => setIsMobileMenuOpen(false)}
                  href="/dashboard"
                  className="mt-2 flex h-12 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[15px] font-semibold text-white"
                >
                  {t('nav.goToDashboard', 'Go to dashboard')}
                </Link>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  <Link
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/login"
                    className="flex h-12 items-center justify-center rounded-full border-2 border-[#11120f] bg-white text-[15px] font-semibold"
                  >
                    {t('nav.login', 'Log in')}
                  </Link>
                  <Link
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/signup"
                    className="flex h-12 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[15px] font-semibold text-white"
                  >
                    {t('nav.getStarted', 'Sign up')}
                  </Link>
                </div>
              )}

              <div className="mt-2 border-t-2 border-dashed border-[#11120f]/25 pt-3">
                <LanguageSwitcher
                  language={language}
                  onChange={setStoredLanguage}
                  light
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
