// The site navigation, defined once. The header menus and the footer columns
// both read from here, so a page added or removed shows up in both.

export type NavItem = {
  label: string;
  href: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type DropdownGroup = {
  label: string;
  sections: NavSection[];
};

type T = (key: string, defaultValue?: string) => string;

// Group labels and section titles repeat across the header mega-menu,
// mobile nav and footer, so they're translated once here rather than in
// each place that renders them. Nav item labels are translated by href
// (stable across languages, and unique across the whole site), falling
// back to the English label whenever a locale hasn't got that key yet.
const GROUP_LABEL_KEYS: Record<string, string> = {
  Product: 'product',
  Solutions: 'solutions',
  Resources: 'resources',
};

const SECTION_TITLE_KEYS: Record<string, string> = {
  'Get started': 'getStarted',
  Capabilities: 'capabilities',
  Platform: 'platform',
  'Who it is for': 'whoItIsFor',
  'Learning & Guides': 'learningGuides',
  'Trust & Legal': 'trustLegal',
  Community: 'community',
  Company: 'company',
};

export function tGroupLabel(t: T, label: string): string {
  const key = GROUP_LABEL_KEYS[label];
  return key ? t(`nav.groups.${key}`, label) : label;
}

export function tSectionTitle(t: T, title: string): string {
  const key = SECTION_TITLE_KEYS[title];
  return key ? t(`nav.sections.${key}`, title) : title;
}

export function tNavItem(t: T, item: NavItem): string {
  // Keyed by the English label, not href: /contact is reused with two
  // different labels ("Talk to Us" vs. "Contact Sales"), so href alone
  // would collide. Labels are unique across the nav and none contain a
  // dot, so this is safe with t()'s dot-path traversal.
  return t(`nav.items.${item.label}`, item.label);
}

export const navGroups: DropdownGroup[] = [
  {
    label: 'Product',
    sections: [
      {
        title: 'Get started',
        items: [
          { label: 'Elpino helpdesk', href: '/product/helpdesk' },
          { label: 'Elpino AI Agent', href: '/product/ai-agent' },
        ],
      },
      {
        title: 'Capabilities',
        items: [
          { label: 'Inbox', href: '/product/inbox' },
          { label: 'Tickets', href: '/product/tickets' },
          { label: 'Knowledge Hub', href: '/product/knowledge-hub' },
        ],
      },
      {
        title: 'Platform',
        items: [
          { label: 'Integrations', href: '/integrations' },
          { label: 'Safety & security', href: '/security-guide' },
          { label: 'All features', href: '/features' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    sections: [
      {
        title: 'Who it is for',
        items: [
          { label: 'For Founders', href: '/solutions/founders' },
          { label: 'For Busy Teams', href: '/solutions/busy-operators' },
          { label: 'For Developers', href: '/solutions/developers' },
        ],
      },
      {
        title: 'Get started',
        items: [
          { label: 'See Pricing', href: '/pricing' },
          { label: 'Talk to Us', href: '/contact' },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    sections: [
      {
        title: 'Learning & Guides',
        items: [
          { label: 'Documentation', href: '/docs' },
          { label: 'Help & FAQ', href: '/faq' },
          // { label: 'API & Webhooks', href: '/docs/api-webhooks' },
        ],
      },
      {
        title: 'Trust & Legal',
        items: [
          { label: 'Trust Center', href: '/trust' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Safety & security', href: '/security-guide' },
        ],
      },
      {
        title: 'Community',
        items: [
          { label: 'Blog', href: '/blog' },
          { label: 'Changelog', href: '/changelog' },
        ],
      },
      {
        title: 'Company',
        items: [
          { label: 'Brand Kit', href: '/brand-kit' },
          { label: 'About Us', href: '/about' },
          { label: 'Careers', href: '/careers' },
          { label: 'Contact Sales', href: '/contact' },
        ],
      },
    ],
  },
];
