import { describe, expect, it } from "vitest";
import { chooseOffer } from "./plan-offer";

const base = { resolutionsUsed: 0, resolutionsIncluded: 0 };

describe("chooseOffer", () => {
  it("offers Starter to a Free workspace, and says so when the free allowance is nearly gone", () => {
    expect(chooseOffer({ ...base, planId: "free", resolutionsIncluded: 100, resolutionsUsed: 10 })?.id).toBe("free-starter");
    expect(chooseOffer({ ...base, planId: "free", resolutionsIncluded: 100, resolutionsUsed: 80 })?.id).toBe("free-near-limit");
  });

  it("offers Growth to a Starter workspace", () => {
    expect(chooseOffer({ ...base, planId: "starter" })?.id).toBe("starter-growth");
  });

  it("picks what fits a Growth workspace", () => {
    const growth = { ...base, planId: "growth", estimatedConversations: 800 };
    expect(chooseOffer({ ...growth, cadence: "monthly", resolutionsUsed: 700 })?.id).toBe("growth-heavy");
    expect(chooseOffer({ ...growth, cadence: "monthly", resolutionsUsed: 100 })?.id).toBe("growth-annual");
    expect(chooseOffer({ ...growth, cadence: "annual", resolutionsUsed: 100 })?.id).toBe("growth-credit");
  });

  it("shows nothing on the top plan or while a plan change or cancellation is in progress", () => {
    expect(chooseOffer({ ...base, planId: "scale" })).toBeNull();
    expect(chooseOffer({ ...base, planId: "growth", cancelling: true })).toBeNull();
    expect(chooseOffer({ ...base, planId: "starter", pendingPlanId: "growth" })).toBeNull();
  });
});
