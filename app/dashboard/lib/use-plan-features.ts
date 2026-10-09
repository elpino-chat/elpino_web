"use client";

import { useEffect, useState } from "react";
import type { FeatureKey } from "@/app/components/PricingCards";

// The workspace plan's features as the server reports them (/api/billing/status → entitlement.features), shared by
// every lock in the dashboard. Read once and kept for a minute; the server still enforces every one of them.
export type FeatureState = { allowed: boolean; label: string; monthlyLimit: number | null; usedThisMonth: number; requiredPlan: string; message?: string };
export type PlanFeatures = { planName: string | null; features: Partial<Record<FeatureKey, FeatureState>> | null };

const TTL_MS = 60_000;
let cache: { at: number; value: Promise<PlanFeatures> } | null = null;
const listeners = new Set<(value: PlanFeatures) => void>();

function load(): Promise<PlanFeatures> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const value = fetch("/api/billing/status", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { entitlement?: { planName?: string; features?: PlanFeatures["features"] } } | null) => ({ planName: data?.entitlement?.planName ?? null, features: data?.entitlement?.features ?? null }))
    .catch(() => ({ planName: null, features: null }));
  cache = { at: Date.now(), value };
  void value.then((resolved) => listeners.forEach((listener) => listener(resolved)));
  return value;
}

/** Read again, for example after the server refused an action because a monthly cap was reached. */
export function refreshPlanFeatures() {
  cache = null;
  void load();
}

export function usePlanFeatures(): PlanFeatures {
  const [state, setState] = useState<PlanFeatures>({ planName: null, features: null });
  useEffect(() => {
    let alive = true;
    const listener = (value: PlanFeatures) => { if (alive) setState(value); };
    listeners.add(listener);
    void load().then(listener);
    return () => { alive = false; listeners.delete(listener); };
  }, []);
  return state;
}
