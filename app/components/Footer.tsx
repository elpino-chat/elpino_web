import Image from "next/image";
import Link from "next/link";

const columns = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Log in", href: "/login" }, { label: "Get started", href: "/signup" }] },
  { title: "Platform", links: [{ label: "AI chatbot", href: "/features" }, { label: "Chat widget", href: "/features" }, { label: "Human handoff", href: "/features" }, { label: "Shared inbox", href: "/features" }, { label: "Integrations", href: "/integrations" }] },
  { title: "Company", links: [{ label: "About us", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
  { title: "Resources", links: [{ label: "Community", href: "/community" }, { label: "Security guide", href: "/security-guide" }, { label: "Identity verification", href: "/docs/identity-verification" }, { label: "Changelog", href: "/changelog" }, { label: "Brand kit", href: "/brand-kit" }] },
];

export function Footer({ editorial = false }: { editorial?: boolean }) {
  return (
    <footer className={`w-full border-t border-black/10 bg-[#fbfaf8] text-[#111] ${editorial ? "font-[family-name:var(--font-rethink-sans)]" : ""}`}>
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-7 border-b border-black/10 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-normal tracking-[-0.04em] sm:text-4xl">Give every customer a helpful answer.</h2>
            <p className="mt-3 text-sm leading-6 text-black/55">Start free with AI support, a shared inbox, and human handoff.</p>
          </div>
          <Link href="/signup" className="inline-flex h-12 w-fit shrink-0 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition hover:bg-[#d9bef4] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4">Get started free</Link>
        </div>

        <div className="grid gap-x-10 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.35fr] lg:py-16">
          <nav aria-label="Footer navigation" className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-5 text-sm font-semibold">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => <li key={link.label}><Link href={link.href} className="text-sm leading-6 text-black/65 transition hover:text-black hover:underline hover:underline-offset-4">{link.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>

          <div className="sm:col-span-2 lg:col-span-1 lg:pl-6">
            <Link href="/" aria-label="Elpino home" className="inline-flex"><Image src="/elpino.png" alt="Elpino" width={906} height={275} className="h-8 w-auto brightness-0" /></Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-black/60">Elpino helps teams answer customers with AI grounded in their own knowledge, then hands conversations to a person when needed.</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/community" className="hover:underline">Community ↗</Link>
              <Link href="/blog" className="hover:underline">Blog ↗</Link>
              <Link href="/contact" className="hover:underline">Contact ↗</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-5 px-5 py-7 text-xs text-black/55 sm:px-8 md:flex-row md:items-center lg:px-16">
          <span>© {new Date().getFullYear()} Elpino Inc. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <Link href="/privacy" className="transition hover:text-black hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-black hover:underline">Terms of Service</Link>
            <Link href="/security-policy" className="transition hover:text-black hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
