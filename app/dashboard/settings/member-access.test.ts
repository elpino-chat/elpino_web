import { describe, expect, it } from "vitest";
import { canOpenPage, pageNeedsOwner } from "./member-access";

describe("canOpenPage", () => {
  it("lets a member open the pages they work in", () => {
    for (const page of ["General", "Availability", "Members", "Danger Zone"]) expect(canOpenPage(page, "member")).toBe(true);
  });

  it("keeps workspace configuration away from members", () => {
    for (const page of ["Billing", "Chatbot Interface", "Tag Manager", "Identity Verification", "Restrictions", "Information", "Usage", "Setup & Integration", "Security & Permissions"]) {
      expect(canOpenPage(page, "member")).toBe(false);
    }
  });

  it("lets the owner open everything", () => {
    for (const page of ["Billing", "Chatbot Interface", "Setup & Integration", "General"]) expect(canOpenPage(page, "owner")).toBe(true);
  });

  it("does not hide anything while the role is still loading", () => {
    expect(canOpenPage("Billing", null)).toBe(true);
  });
});

describe("pageNeedsOwner", () => {
  it("flags configuration pages only", () => {
    expect(pageNeedsOwner("Tag Manager")).toBe(true);
    expect(pageNeedsOwner("Members")).toBe(false);
  });
});
