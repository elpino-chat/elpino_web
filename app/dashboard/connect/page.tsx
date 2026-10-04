import { redirect } from "next/navigation";

// The real implementation moved to ConnectPageContent.tsx, now rendered on
// Settings > Setup & Integration (Connect was removed from the primary sidebar). This route stays as a redirect so existing
// links/bookmarks to /dashboard/connect keep working, carrying through any
// query string (e.g. ?connected=stripe from an OAuth callback).
export default async function ConnectPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  const suffix = query.toString();
  redirect(`/dashboard/settings/setup-integration${suffix ? `?${suffix}` : ""}`);
}
