import type { FeatureState } from "../../dashboard/lib/use-plan-features";

/** What a locked feature's tip says: the plan does not include it, or this month's cap is used up. */
export function lockMessage(state: FeatureState, planName: string | null): string {
  const plan = planName ? `${planName} plan` : "plan";
  // "Voice calls" reads as "voice calls" mid-sentence; an acronym ("AI ...", "CRM ...") keeps its capitals.
  const label = /^[A-Z][a-z]/.test(state.label) ? state.label.charAt(0).toLowerCase() + state.label.slice(1) : state.label;
  if (state.monthlyLimit !== null && state.usedThisMonth >= state.monthlyLimit) {
    return `You've reached this month's limit of ${state.monthlyLimit} for ${label} on your ${plan}. Upgrade to ${state.requiredPlan} for more.`;
  }
  return `Your ${plan} doesn't include ${label}. Upgrade to ${state.requiredPlan} to use it.`;
}
