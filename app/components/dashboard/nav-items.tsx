// Shared between the desktop rail (Sidebar.tsx) and the mobile bottom tab
// bar (MobileBottomNav.tsx) so the two never drift — same items, same
// glyphs, same order, on both.
export const primaryNavItems = [
  { icon: "dashboard", label: "Space", href: "/dashboard" },
  { icon: "inbox", label: "Inbox", href: "/dashboard/inbox" },
  { icon: "visitors", label: "Analytics", href: "/dashboard/visitors" },
  { icon: "contacts", label: "Contacts", href: "/dashboard/contacts" },
  { icon: "knowledge", label: "Knowledge", href: "/dashboard/knowledge" },
  { icon: "settings", label: "Settings", href: "/dashboard/settings" },
] as const;

export type NavIcon = (typeof primaryNavItems)[number]["icon"];

export function NavGlyph({ name, size = 22 }: { name: NavIcon; size?: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...common}>
      {name === "inbox" && (
        <>
          <path d="M5.5 4h13l2 10.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-4.5Z" />
          <path d="M3.5 14.5h5l1.4 2h4.2l1.4-2h5M8 8h8" />
        </>
      )}
      {name === "dashboard" && (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      )}
      {name === "visitors" && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" />
        </>
      )}
      {name === "contacts" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.2" />
          <path d="M3.5 19c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5M14 15c3.6-.7 5.8.7 6.5 3.5" />
        </>
      )}
      {name === "knowledge" && (
        <>
          <path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1-1.5Z" />
          <path d="M14 3.5V8h4M8.5 12h6M8.5 16h4" />
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" />
          <circle cx="12" cy="12" r="7.2" />
        </>
      )}
    </svg>
  );
}
