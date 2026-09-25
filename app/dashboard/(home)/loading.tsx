import { HomeContentSkeleton } from "@/app/components/dashboard/DashboardSkeleton";

// Shown at once while the home page's server data (workspace, conversations,
// people, issues) loads: the greeting and cards as grey shapes.
export default function Loading() {
  return <HomeContentSkeleton />;
}
