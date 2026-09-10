import type { Metadata } from "next";
import Link from "next/link";

// Next.js already sends a real 404 status for this route automatically —
// this metadata is belt-and-braces for any proxy or crawler that only reads
// the rendered <head> rather than the response code.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-24 text-center text-[#11120f]">
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#6D7D85]">404</span>
      <h1 className="mt-4 max-w-lg font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
        That page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[#56646b]">
        The link might be old, or the page moved. Here are a couple of places that are still there.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#D8D5CE] bg-[#FAF9F6] px-7 text-sm font-semibold text-[#11120f] transition hover:-translate-y-0.5 hover:bg-[#11120f] hover:text-white"
        >
          Go home
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#CBD7DC] bg-white px-7 text-sm font-semibold text-[#11120f] transition hover:border-[#11120f]"
        >
          See pricing
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[#CBD7DC] bg-white px-7 text-sm font-semibold text-[#11120f] transition hover:border-[#11120f]"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
