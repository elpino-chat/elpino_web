// Which Settings pages a workspace member (anyone who is not the owner) may open. Members work the
// inbox, contacts and knowledge; changing the workspace itself (its AI, website tags, integrations,
// billing and security) stays with the owner. The server routes enforce the same rule, so this only
// decides what to show.

const OWNER_ONLY_PAGES = new Set([
  "Billing",
  "Security & Permissions",
  "Audit Logs",
  "Chatbot Interface",
  "Behavior",
  "Tag Manager",
  "Identity Verification",
  "Restrictions",
  "Translations",
  "Information",
  "Presence Log",
  "Usage",
  "Setup & Integration",
]);

export function pageNeedsOwner(page: string): boolean {
  return OWNER_ONLY_PAGES.has(page);
}

/** Members are the only role held back; an unknown role (still loading) is not, so owners never see a flash. */
export function canOpenPage(page: string, role: string | null): boolean {
  return role !== "member" || !pageNeedsOwner(page);
}
