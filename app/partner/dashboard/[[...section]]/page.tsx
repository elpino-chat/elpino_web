import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { currentPartnerId } from "../../_lib/session";
import { PartnerDashboard, type Overview } from "../PartnerDashboard";
import { TABS, type Tab } from "../routes";
import { DashboardUnavailable } from "../DashboardUnavailable";

export const metadata: Metadata = {
  title: "Partner dashboard",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// Read once per request on the server and handed to the page, so its greeting and "3h ago" times match on both sides.
const requestTime = () => Date.now();

// /partner/dashboard and /partner/dashboard/<section>: every section has its own address, so it can be bookmarked,
// shared and refreshed.
export default async function PartnerDashboardPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  const [first = "overview", ...rest] = section;
  const tab = first as Tab;
  if (!TABS.includes(tab) || (first === "overview" && section.length > 0) || rest.length > 0) notFound();

  const partnerId = await currentPartnerId();
  if (!partnerId) redirect("/partner/login");
  const overview = await callGateway<Partial<Overview> & { error?: string }>(`/api/workspace/referrals/overview?partnerId=${encodeURIComponent(partnerId)}`).catch(() => null);
  // Never a redirect back to login here: login sends a signed-in partner straight to this page, so a failed load
  // would bounce between the two forever. An account that no longer exists gets a way to sign out instead.
  if (!overview?.partner) return <DashboardUnavailable accountGone={overview?.error === "Not found"} />;
  return <PartnerDashboard overview={overview as Overview} now={requestTime()} tab={tab} />;
}
