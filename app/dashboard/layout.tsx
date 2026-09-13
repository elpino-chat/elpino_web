import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import Sidebar from "@/app/components/dashboard/Sidebar";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import HomePanel from "@/app/components/dashboard/HomePanel";
import SpacePanel from "@/app/components/dashboard/SpacePanel";
import DashboardThemeProvider from "@/app/components/dashboard/DashboardThemeProvider";
import SetupChecklist from "@/app/components/dashboard/SetupChecklist";
import MobileBottomNav from "@/app/components/dashboard/MobileBottomNav";
import DashboardMain from "@/app/components/dashboard/DashboardMain";
import { MobileDrawerProvider } from "@/app/components/dashboard/mobile-drawer-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect("/login");

  return <DashboardThemeProvider>
    <MobileDrawerProvider>
      <div className="dashboard-shell relative flex h-dvh w-full flex-row overflow-hidden">
        <Sidebar user={{ email: session.email, name: session.name }} />
        {/* Top safe-area padding — without it, on a phone with a notch or
            Dynamic Island, the header renders underneath that cutout instead
            of below it, reading as if the header and the OS status bar have
            merged into one strip. */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
          <DashboardHeader user={{ email: session.email, name: session.name }} />
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-row">
            <SpacePanel />
            <HomePanel user={{ email: session.email, name: session.name }} />
            <DashboardMain>{children}</DashboardMain>
          </div>
        </div>
        <SetupChecklist />
        <MobileBottomNav />
      </div>
    </MobileDrawerProvider>
  </DashboardThemeProvider>;
}
