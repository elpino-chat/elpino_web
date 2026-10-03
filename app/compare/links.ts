// The competitors we compare against. Kept in its own tiny file so the footer (a client component) can list
// them without pulling in all of the comparison copy from data.ts.
export const competitorLinks = [
  { slug: "zendesk", name: "Zendesk" },
  { slug: "crisp", name: "Crisp" },
  { slug: "intercom", name: "Intercom" },
  { slug: "tidio", name: "Tidio" },
] as const;

export const compareFooterLinks = [
  ...competitorLinks.map((c) => ({ label: `Elpino vs ${c.name}`, href: `/compare/${c.slug}` })),
  { label: "All comparisons", href: "/compare" },
];
