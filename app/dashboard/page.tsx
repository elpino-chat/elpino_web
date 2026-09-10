import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) redirect("/login");
  return <DashboardClient name={session.name ?? ""} />;
}
