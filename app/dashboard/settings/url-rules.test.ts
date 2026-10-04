import { describe, expect, it } from "vitest";
import { matchesPattern, normalizePath, widgetVerdict } from "./url-rules";

describe("matchesPattern", () => {
  it("matches an exact path only", () => {
    expect(matchesPattern("/pricing", "/pricing")).toBe(true);
    expect(matchesPattern("/pricing", "/pricing/faq")).toBe(false);
  });
  it("treats /x/* as the page and everything under it, not look-alike prefixes", () => {
    expect(matchesPattern("/docs/*", "/docs")).toBe(true);
    expect(matchesPattern("/docs/*", "/docs/api/auth")).toBe(true);
    expect(matchesPattern("/docs/*", "/documents")).toBe(false);
  });
  it("treats a bare trailing * as any path starting with the prefix", () => {
    expect(matchesPattern("/blog*", "/blog")).toBe(true);
    expect(matchesPattern("/blog*", "/blogroll")).toBe(true);
    expect(matchesPattern("/blog*", "/about")).toBe(false);
  });
});

describe("widgetVerdict", () => {
  it("shows everywhere when there are no rules", () => {
    expect(widgetVerdict({ show: [], hide: [] }, "/anything")).toEqual({ visible: true, reason: "everywhere" });
  });
  it("treats a non-empty show list as an allowlist", () => {
    const rules = { show: ["/pricing", "/docs/*"], hide: [] };
    expect(widgetVerdict(rules, "/docs/start")).toEqual({ visible: true, reason: "allowed", rule: "/docs/*" });
    expect(widgetVerdict(rules, "/about")).toEqual({ visible: false, reason: "not-allowed" });
  });
  it("lets a hide rule win over a show rule", () => {
    const rules = { show: ["/docs/*"], hide: ["/docs/internal/*"] };
    expect(widgetVerdict(rules, "/docs/internal/keys")).toEqual({ visible: false, reason: "hidden", rule: "/docs/internal/*" });
    expect(widgetVerdict(rules, "/docs/public")).toEqual({ visible: true, reason: "allowed", rule: "/docs/*" });
  });
});

describe("normalizePath", () => {
  it("cuts a pasted URL down to its path and drops the query and fragment", () => {
    expect(normalizePath("https://shop.example.com/pricing?plan=pro#top")).toBe("/pricing");
    expect(normalizePath("https://shop.example.com")).toBe("/");
  });
  it("adds a missing leading slash and ignores blanks", () => {
    expect(normalizePath("pricing")).toBe("/pricing");
    expect(normalizePath("/docs/*")).toBe("/docs/*");
    expect(normalizePath("   ")).toBe("");
  });
});
