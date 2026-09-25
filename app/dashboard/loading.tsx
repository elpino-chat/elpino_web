import { GenericContentSkeleton } from "@/app/components/dashboard/DashboardSkeleton";

// Fallback for every dashboard page that has no loading screen of its own.
export default function Loading() {
  return <GenericContentSkeleton />;
}
