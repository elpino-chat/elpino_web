import { describe, expect, it } from "vitest";
import { plansOpenIn, withPlansParam } from "./upgrade-url";

describe("plansOpenIn", () => {
  it("is true only for ?plans=open", () => {
    expect(plansOpenIn("?plans=open")).toBe(true);
    expect(plansOpenIn("?a=1&plans=open")).toBe(true);
    expect(plansOpenIn("?plans=closed")).toBe(false);
    expect(plansOpenIn("")).toBe(false);
  });
});

describe("withPlansParam", () => {
  const page = "https://app.example.com/dashboard/settings/billing";
  it("adds the parameter and keeps the rest of the address", () => {
    expect(withPlansParam(`${page}?tab=history#top`, true)).toBe("/dashboard/settings/billing?tab=history&plans=open#top");
  });
  it("removes only its own parameter", () => {
    expect(withPlansParam(`${page}?tab=history&plans=open`, false)).toBe("/dashboard/settings/billing?tab=history");
    expect(withPlansParam(`${page}?plans=open`, false)).toBe("/dashboard/settings/billing");
  });
  it("does not duplicate the parameter when it is already there", () => {
    expect(withPlansParam(`${page}?plans=open`, true)).toBe("/dashboard/settings/billing?plans=open");
  });
});
