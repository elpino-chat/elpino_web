import { ChatSkeleton } from "@/app/components/dashboard/DashboardSkeleton";

// Shown at once while the inbox page's server side runs: the shape of an open chat.
export default function Loading() {
  return <div id="dashboard-inbox-page" className="flex h-full min-h-0 flex-col"><ChatSkeleton withHeader /></div>;
}
