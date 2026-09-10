"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function UpgradeBanner({ marketing = false, pricingPage = false }: { marketing?: boolean; pricingPage?: boolean }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="dashboard-upgrade-banner relative flex min-h-10 shrink-0 flex-wrap items-center justify-center gap-2 bg-[linear-gradient(90deg,#050505_0%,#252525_50%,#050505_100%)] px-10 py-2.5 text-white">
      <span className="shrink-0 rounded bg-[#ff761b] px-1.5 py-0.5 text-[10px] font-bold tracking-wide">20% OFF</span>
      <p className="text-center text-xs font-medium sm:text-sm">
        {marketing ? 'Starter for ' : 'Upgrade your plan for '}<span className="font-bold">$10/month</span>
        {marketing && <span className="text-white/75"> · $120 billed annually</span>}
      </p>
      <Link
        href={pricingPage ? '#plans' : '/pricing#plans'}
        className="dashboard-upgrade-banner-button ml-1 shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#111111] transition-colors hover:bg-[#e8e8e8]"
      >
        {marketing ? 'View plans' : 'Upgrade now'}
      </Link>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss upgrade offer"
        className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}
