import Image from "next/image";
import Link from "next/link";

interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Log in", href: "/login" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    title: "Platform",
    links: [
      // These used to point at dedicated per-feature pages
      // (/product/ai-operator, /product/approvals, /product/email-triage)
      // that described a different product and now redirect elsewhere (see
      // next.config.ts). /features covers all four in one place until each
      // gets its own page.
      { label: "AI chatbot", href: "/features" },
      { label: "Chat widget", href: "/features" },
      { label: "Human handoff", href: "/features" },
      { label: "Shared inbox", href: "/features" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Community", href: "/community" },
      { label: "Security guide", href: "/security-guide" },
      { label: "Changelog", href: "/changelog" },
      { label: "Brand kit", href: "/brand-kit" },
    ],
  },
];


export function Footer({ editorial = false }: { editorial?: boolean }) {
  return (
    <footer className={`w-full bg-white pb-8 pt-16 text-[#191E19] ${editorial ? 'font-[family-name:var(--font-rethink-sans)]' : ''}`}>
      <div className={editorial ? 'mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-16' : 'mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'}>
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1.75fr] lg:gap-16">
          <div>
            <h2 className="max-w-lg text-[clamp(2.3rem,3.6vw,3.8rem)] font-semibold uppercase leading-[1.02] tracking-[-0.06em]">Get started with Elpino today</h2>
            <p className="mt-5 text-base leading-7">Give every customer a helpful answer.<br />Start with 50 AI resolutions a month, free.</p>
            <Link href="/signup" className="mt-7 inline-flex h-14 items-center justify-center rounded-full bg-[#BF91FF] px-8 text-base font-medium transition hover:bg-[#CFAEFF] focus-visible:outline-2 focus-visible:outline-offset-4">Get started</Link>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-6 text-base font-semibold">{column.title}</h3>
                <ul className="space-y-3.5">
                  {column.links.map((link) => <li key={link.label}><Link href={link.href} className="text-sm leading-6 transition hover:text-[#7651B0] hover:underline hover:underline-offset-4">{link.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        {editorial && <div aria-hidden="true" className="mt-16 overflow-hidden border-b border-black/10 text-[clamp(6rem,24vw,24rem)] font-semibold leading-[0.85] tracking-[-0.08em] text-[#192016]">elpino<span className="text-[#bc91f8]">.</span></div>}
        <div className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm lg:mt-28">
          <Link href="/community" className="font-medium hover:underline">Join the community ↗</Link>
          <Link href="/blog" className="hover:underline">Read our blog ↗</Link>
          <Link href="/contact" className="hover:underline">Talk to us ↗</Link>
        </div>
        <div className="mt-7 flex flex-col justify-between gap-6 border-t border-black/10 pt-7 text-xs md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" aria-label="Elpino home"><Image src="/elpino.png" alt="Elpino" width={906} height={275} className="h-5 w-auto brightness-0" /></Link>
            <span>© {new Date().getFullYear()} Elpino Inc. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/security-policy" className="hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
