import { creditLabel, estimatedConversations, plans, type Plan } from "../PricingCards";

// The slice of /api/billing/status the offer strip reads.
export type OfferEntitlement = {
  planId: string;
  status?: string;
  creditBased?: boolean;
  cadence?: "monthly" | "annual";
  cancelling?: boolean;
  pendingPlanId?: string | null;
  estimatedConversations?: number | null;
  resolutionsUsed: number;
  resolutionsIncluded: number;
};

/** Copy is a list of parts so the strip can bold the figures: a plain string, or { bold }. */
export type OfferPart = string | { bold: string };
export type Offer = { id: string; badge: string; parts: OfferPart[]; cta: string };

// Nudge a plan's owner once most of the allowance is gone, not before.
const HIGH_USAGE = 0.75;

const planById = (id: string): Plan | undefined => plans.find((plan) => plan.id === id);
const dollars = (cents: number) => `$${Math.round(cents / 100)}`;
const monthlyCents = (plan: Plan) => Number(plan.price.replace(/[^0-9.]/g, "")) * 100;
/** What a year costs, matching the backend's rule: ten months of price unless it is set by hand. */
const annualCents = (plan: Plan) => plan.annualUsdCents ?? monthlyCents(plan) * 10;

function describeOffer(plan: Plan): string {
  const conversations = estimatedConversations(plan);
  return `${creditLabel(plan)} of AI credit every month${conversations ? `, about ${conversations.toLocaleString()} conversations` : ""}`;
}

/**
 * The one offer worth showing this workspace right now, or null when there is nothing useful to say.
 *  - Free: the smallest paid plan, with how much of the free allowance is gone when that is high.
 *  - Starter: the next plan up.
 *  - Growth: whatever fits how it is used: a way past the limit when the credit is nearly spent,
 *    annual billing for a monthly payer, otherwise buying extra credit.
 *  - Scale, and a subscription that is cancelling or mid-change: nothing.
 */
export function chooseOffer(entitlement: OfferEntitlement): Offer | null {
  if (entitlement.cancelling || entitlement.pendingPlanId) return null;

  if (entitlement.planId === "free") {
    const starter = planById("starter");
    if (!starter) return null;
    const used = entitlement.resolutionsUsed;
    const total = entitlement.resolutionsIncluded;
    const nearLimit = total > 0 && used / total >= HIGH_USAGE;
    const perMonth = `${dollars(annualCents(starter) / 12)}/month`;
    return nearLimit
      ? {
          id: "free-near-limit",
          badge: "ALMOST OUT",
          parts: ["You've used ", { bold: `${used} of ${total}` }, " free AI messages. Starter is ", { bold: perMonth }, ` billed annually, with ${describeOffer(starter)}.`],
          cta: "See Starter",
        }
      : {
          id: "free-starter",
          badge: "STARTER",
          parts: ["Move up to Starter for ", { bold: perMonth }, ` billed annually: ${describeOffer(starter)}.`],
          cta: "See Starter",
        };
  }

  if (entitlement.planId === "starter") {
    const growth = planById("growth");
    if (!growth) return null;
    return {
      id: "starter-growth",
      badge: "GROWTH",
      parts: [`Outgrowing Starter? Growth gives you ${describeOffer(growth)}, for `, { bold: `${dollars(annualCents(growth) / 12)}/month` }, " billed annually."],
      cta: "Compare plans",
    };
  }

  if (entitlement.planId === "growth") {
    const growth = planById("growth");
    const scale = planById("scale");
    const conversations = entitlement.estimatedConversations ?? (growth ? estimatedConversations(growth) : null);
    const heavy = Boolean(conversations) && entitlement.resolutionsUsed / (conversations as number) >= HIGH_USAGE;

    if (heavy && scale) {
      return {
        id: "growth-heavy",
        badge: "RUNNING HIGH",
        parts: ["You've handled ", { bold: entitlement.resolutionsUsed.toLocaleString() }, ` conversations this month. Scale gives you ${describeOffer(scale)}.`],
        cta: "See Scale",
      };
    }
    if (entitlement.cadence !== "annual" && growth) {
      const saving = monthlyCents(growth) * 12 - annualCents(growth);
      if (saving > 0) {
        return {
          id: "growth-annual",
          badge: "SAVE",
          parts: ["Switch Growth to annual billing and save ", { bold: dollars(saving) }, " a year: twelve months for the price of ten."],
          cta: "Switch to annual",
        };
      }
    }
    return {
      id: "growth-credit",
      badge: "TIP",
      parts: ["Busy period coming? Buy extra AI credit any time. Credit you buy doesn't reset with the month."],
      cta: "Add credit",
    };
  }

  return null;
}
