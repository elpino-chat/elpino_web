import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import Sidebar from "@/app/components/dashboard/Sidebar";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import HomePanel from "@/app/components/dashboard/HomePanel";
import UpgradeBanner from "@/app/components/dashboard/UpgradeBanner";
import DashboardThemeProvider from "@/app/components/dashboard/DashboardThemeProvider";
import SetupChecklist from "@/app/components/dashboard/SetupChecklist";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect("/login");

  return <DashboardThemeProvider>
    <div className="dashboard-shell flex h-dvh w-full flex-col overflow-hidden">
      <UpgradeBanner />
      <DashboardHeader user={{ email: session.email, name: session.name }} />
      <div className="flex min-h-0 flex-1">
        <Sidebar user={{ email: session.email, name: session.name }} />
        <HomePanel user={{ email: session.email, name: session.name }} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <SetupChecklist />
    </div>
  </DashboardThemeProvider>;
}
