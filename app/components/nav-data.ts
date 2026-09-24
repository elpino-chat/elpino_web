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
