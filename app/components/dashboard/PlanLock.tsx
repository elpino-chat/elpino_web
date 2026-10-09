"use client";

import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import type { FeatureKey } from "@/app/components/PricingCards";
import { UpgradeDialog } from "@/app/components/dashboard/UpgradeDialog";
import { usePlanFeatures } from "@/app/dashboard/lib/use-plan-features";
import { lockMessage } from "./plan-lock-message";

/**
 * Wraps a control for a plan feature. When the plan has it (or it is not known yet) the control is left exactly as is.
 * When it does not, the control shows faded with a small lock, a tip explains why on hover or focus, and a click
 * opens the upgrade dialog instead of doing the action. The server refuses the action either way.
 */
export function PlanLock({ feature, children, block = false, tipBelow = false, className = "" }: { feature: FeatureKey; children: ReactNode; block?: boolean; tipBelow?: boolean; className?: string }) {
  const { features, planName } = usePlanFeatures();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const state = features?.[feature];
  if (!state || state.allowed) return <>{children}</>;
  const tip = lockMessage(state, planName);
  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={tip}
        aria-disabled="true"
        data-plan-locked={feature}
        onClickCapture={(event) => { event.preventDefault(); event.stopPropagation(); setUpgradeOpen(true); }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setUpgradeOpen(true); } }}
        className={`group/lock relative ${block ? "flex w-full" : "inline-flex"} cursor-not-allowed outline-none ${className}`}
      >
        <span className={`pointer-events-none select-none opacity-45 ${block ? "flex w-full" : "inline-flex"}`} inert>{children}</span>
        <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#11120f] text-white shadow ring-2 ring-white" aria-hidden="true">
          <Lock size={9} strokeWidth={2.6} />
        </span>
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-[120] w-max max-w-[250px] -translate-x-1/2 rounded-lg bg-[#11120f] px-3 py-2 text-left text-[12px] font-medium leading-[17px] text-white opacity-0 shadow-[0_10px_30px_rgba(15,23,42,0.3)] transition-opacity duration-150 group-hover/lock:opacity-100 group-focus-visible/lock:opacity-100 ${tipBelow ? "top-full mt-2" : "bottom-full mb-2"}`}
        >
          {tip}
          <span className="mt-1 block text-[11px] font-normal text-white/60">Click to see plans</span>
        </span>
      </span>
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
