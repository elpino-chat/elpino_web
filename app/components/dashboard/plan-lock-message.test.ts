import { describe, expect, it } from "vitest";
import { lockMessage } from "./plan-lock-message";

describe("lockMessage", () => {
  const base = { allowed: false, label: "Voice calls", monthlyLimit: null, usedThisMonth: 0, requiredPlan: "Growth" };

  it("says the plan does not include the feature, and which plan does", () => {
    expect(lockMessage(base, "Starter")).toBe("Your Starter plan doesn't include voice calls. Upgrade to Growth to use it.");
  });

  it("says the monthly cap is used up when it is", () => {
    expect(lockMessage({ ...base, label: "AI conversation summary", monthlyLimit: 50, usedThisMonth: 50, requiredPlan: "Growth" }, "Starter"))
      .toBe("You've reached this month's limit of 50 for AI conversation summary on your Starter plan. Upgrade to Growth for more.");
  });

  it("keeps an acronym's capitals mid-sentence", () => {
    expect(lockMessage({ ...base, label: "CRM (HubSpot)" }, "Starter")).toBe("Your Starter plan doesn't include CRM (HubSpot). Upgrade to Growth to use it.");
  });

  it("still reads well before the plan name has loaded", () => {
    expect(lockMessage(base, null)).toBe("Your plan doesn't include voice calls. Upgrade to Growth to use it.");
  });
});
