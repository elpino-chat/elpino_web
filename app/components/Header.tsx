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
                    {group.sections.map((sec) => (
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
