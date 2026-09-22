"use client";

import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";

export function CareersPayGapNotice() {
  return (
    <section className="w-full border-t border-black/10 bg-[#faf9f6] py-12 text-black/60">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-3xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/70">
              <ShieldCheck size={14} className="text-[#ff5600]" />
              <span>Equal Opportunity & Pay Parity Transparency</span>
            </div>
            <p className="text-xs leading-relaxed text-black/60 sm:text-sm">
              Per global equal employment standards and the Gender Pay Gap Information reporting acts,
              we report annually on pay parity, inclusion metrics, and demographic equity across all our global entities.
              You can review our transparency summaries below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link
              href="/security-policy"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-black hover:border-black transition"
            >
              <FileText size={12} />
              <span>2024 Report</span>
            </Link>
            <Link
              href="/security-policy"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-black hover:border-black transition"
            >
              <FileText size={12} />
              <span>2025 Report</span>
            </Link>
            <Link
              href="/security-policy"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-black hover:border-black transition"
            >
              <FileText size={12} />
              <span>2026 Disclosure</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
