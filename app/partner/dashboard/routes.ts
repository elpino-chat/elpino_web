// The partner dashboard's sections, shared by the server route and the client page.
export type Tab = "overview" | "referrals" | "earnings" | "settings";
export const TABS: Tab[] = ["overview", "referrals", "earnings", "settings"];

// Every section has its own address, like the workspace dashboard's /dashboard/inbox and /dashboard/settings.
export const tabHref = (tab: Tab) => (tab === "overview" ? "/partner/dashboard" : `/partner/dashboard/${tab}`);
