// Shared icon set for dashboard-area previews on the marketing site. Three
// other files (DashboardSection, NotifySection, OperatorPreview) each
// reimplement their own file-scoped ChatIcon/UsersIcon rather than importing
// from here — this module exists for anything that wants the shared,
// reusable versions instead of a local copy. Same house style as those:
// 16x16 viewBox, stroke-based, 1.5 stroke width, rounded caps/joins.

type IconProps = { className?: string };

const base = "h-4 w-4";

export function ChatIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 10.667A1.333 1.333 0 0 1 12.667 12H4.667L2 14.667V3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v7.334Z" />
    </svg>
  );
}

export function UsersIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.333 14v-1.333A2.667 2.667 0 0 0 8.667 10H3.333A2.667 2.667 0 0 0 .667 12.667V14M6 7.333A2.667 2.667 0 1 0 6 2a2.667 2.667 0 0 0 0 5.333ZM15.333 14v-1.333a2.667 2.667 0 0 0-2-2.58M10.667 2.087a2.667 2.667 0 0 1 0 5.16" />
    </svg>
  );
}

export function VideoIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.333" y="4" width="9.333" height="8" rx="1.333" />
      <path d="m10.667 7.067 3.428-2.4a.667.667 0 0 1 1.052.545v5.576a.667.667 0 0 1-1.052.545l-3.428-2.4" />
    </svg>
  );
}
