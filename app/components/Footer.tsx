"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { navGroups, tGroupLabel, tSectionTitle, tNavItem } from "./nav-data";
import { useStoredLanguage } from "../hooks/useStoredLanguage";
import { useTranslation } from "../hooks/useTranslation";

// Built from the same data as the header menus (nav-data.ts), so the footer
// can't drift from them.
const dedupe = (links: { label: string; href: string }[]) => links.filter((l, i) => links.findIndex((x) => x.href === l.href) === i);
const groupLinks = (label: string, skip: string[] = []) =>
  dedupe(navGroups.find((g) => g.label === label)?.sections.filter((s) => !skip.includes(s.title)).flatMap((s) => s.items) ?? []);
const columns = [
  { title: "Product", links: groupLinks("Product") },
  { title: "Solutions", links: groupLinks("Solutions") },
  { title: "Resources", links: groupLinks("Resources", ["Company"]) },
  { title: "Company", links: navGroups.find((g) => g.label === "Resources")?.sections.find((s) => s.title === "Company")?.items ?? [] },
];

// Where the footer's social icons go. An entry with an empty href is left out until its profile URL is filled in,
// so the footer never shows a dead link.
const socials = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/elpinochat", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { name: "X", href: "https://x.com/elpinochat", path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" },
  { name: "GitHub", href: "https://github.com/elpino-chat", path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
].filter((social) => social.href);

// Underline that draws itself from the left on hover.
const linkClass =
  "inline-block bg-[linear-gradient(#fff,#fff)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-[17px] leading-6 text-white/90 transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-white";

type T = (key: string, defaultValue?: string) => string;

// The footer's fourth column is titled "Company" — that's a section title
// (see nav-data.ts), not one of the three top-level group labels, so try
// the group map first and fall back to the section map.
function tColumnTitle(t: T, title: string): string {
  const viaGroup = tGroupLabel(t, title);
  return viaGroup !== title ? viaGroup : tSectionTitle(t, title);
}

export function Footer({ editorial = false }: { editorial?: boolean }) {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);

  return (
    <footer className={`w-full bg-black px-5 text-white sm:px-8 lg:px-20 ${editorial ? "font-[family-name:var(--font-rethink-sans)]" : ""}`}>
      <div className="mx-auto max-w-[1500px]">
        {/* The mark at the left, then the site map in columns */}
        <div className="grid gap-12 py-16 lg:grid-cols-[110px_repeat(4,minmax(0,1fr))] lg:gap-8 lg:py-24">
          <Link href="/" aria-label="Elpino home" className="inline-flex h-10 w-10 items-start"><Image src="/icon0.svg" alt="Elpino" width={367} height={379} className="h-10 w-auto" /></Link>

          <nav aria-label="Footer navigation" className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-10 text-[16px] font-medium text-white">{tColumnTitle(t, column.title)}</h3>
                <ul className="space-y-5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={linkClass}>{tNavItem(t, link)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div className="flex flex-col justify-between gap-5 border-t border-white/20 py-6 text-[13px] text-white/60 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {socials.length > 0 && (
              <ul className="flex items-center gap-4" aria-label="Elpino on social media">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="grid size-9 place-items-center rounded-full border border-white/25 text-white/80 transition hover:border-white/70 hover:text-white">
                      <svg viewBox="0 0 24 24" className="size-[17px]" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <span>{t("footer.copyright", "© {year} Elpino Inc. All rights reserved.").replace("{year}", String(new Date().getFullYear()))}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href="/privacy" className="transition hover:text-white hover:underline">{t("footer.privacy", "Privacy Policy")}</Link>
            <Link href="/terms" className="transition hover:text-white hover:underline">{t("footer.terms", "Terms of Service")}</Link>
            <Link href="/security-policy" className="transition hover:text-white hover:underline">{t("footer.security", "Security")}</Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-white/80 transition hover:border-white/70 hover:text-white">
              {t("footer.top", "Back to top")} <ArrowUp size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
