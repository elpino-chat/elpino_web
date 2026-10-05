"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useIsMember } from "./use-is-member";
import { chooseOffer, type Offer, type OfferEntitlement, type OfferPart } from "./plan-offer";

const BILLING_HREF = "/dashboard/settings/billing";

const dismissKey = (offerId: string) => `elpino:offer-dismissed:${offerId}`;

function wasDismissed(offerId: string): boolean {
  try {
    return window.localStorage.getItem(dismissKey(offerId)) === "1";
  } catch {
    return false;
  }
}

function renderPart(part: OfferPart, index: number) {
  return typeof part === "string" ? part : <span key={index} className="font-bold">{part.bold}</span>;
}

/** A gradient strip at the top of the dashboard showing the offer that fits this workspace's plan. */
export default function PlanOfferBanner() {
  const [offer, setOffer] = useState<Offer | null>(null);
  // The offer links to billing, which only the owner can change.
  const isMember = useIsMember();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((status: { entitlement?: OfferEntitlement } | null) => {
        if (cancelled || !status?.entitlement) return;
        const next = chooseOffer(status.entitlement);
        setOffer(next && !wasDismissed(next.id) ? next : null);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  if (!offer || isMember) return null;

  function dismiss() {
    if (!offer) return;
    try {
      window.localStorage.setItem(dismissKey(offer.id), "1");
    } catch {
      // Private mode: the strip just comes back next visit.
    }
    setOffer(null);
  }

  // Phones: the badge and the offer text read left-aligned across the strip, with a full-width button under them and the close icon in
  // the top-right corner. From sm up it is the single centred row.
  return (
    <div className="plan-offer-banner relative flex shrink-0 flex-col items-stretch gap-2.5 bg-[linear-gradient(90deg,#a84316_0%,#bd397d_48%,#2868c7_100%)] py-3 pl-4 pr-11 text-white sm:min-h-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-1.5 sm:py-2 sm:pr-12">
      <div className="flex items-start gap-2.5 sm:contents">
        <span className="mt-0.5 shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-bold tracking-wide sm:mt-0 sm:text-[10px]">{offer.badge}</span>
        <p className="min-w-0 text-left text-[13px] font-medium leading-5 sm:text-center">{offer.parts.map(renderPart)}</p>
      </div>
      <Link href={BILLING_HREF} className="plan-offer-banner-button flex h-10 shrink-0 items-center justify-center rounded-lg bg-white px-4 text-[13px] font-bold text-[#111111] transition-colors hover:bg-[#f0f0f0] sm:h-auto sm:rounded-md sm:py-1 sm:text-xs">
        {offer.cta}
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss offer"
        className="absolute right-2.5 top-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:right-3 sm:top-1/2 sm:h-6 sm:w-6 sm:-translate-y-1/2"
      >
        <X size={15} />
      </button>
    </div>
  );
}
