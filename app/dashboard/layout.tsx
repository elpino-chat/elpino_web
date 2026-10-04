import { Suspense } from "react";
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
import { DashboardShellSkeleton } from "@/app/components/dashboard/DashboardSkeleton";
import InvitationPrompt from "@/app/components/dashboard/InvitationPrompt";
import PlanOfferBanner from "@/app/components/dashboard/PlanOfferBanner";

// The session check is the only thing this layout waits for. It sits inside a
// Suspense boundary so the frame of the dashboard (sidebar, header) is on screen
// straight away as grey shapes, instead of a blank page until the check returns.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardThemeProvider>
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthedDashboard>{children}</AuthedDashboard>
    </Suspense>
  </DashboardThemeProvider>;
}

async function AuthedDashboard({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session) redirect("/login");

  return <MobileDrawerProvider>
      {/* Top safe-area padding — without it, on a phone with a notch or
          Dynamic Island, the top of the page renders underneath that cutout
          instead of below it, reading as if the header and the OS status bar
          have merged into one strip. The offer strip spans the full width
          above the rail and every sidebar; the row below holds the rest. */}
      <div className="dashboard-shell relative flex h-dvh w-full flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
        <PlanOfferBanner />
        <div className="flex min-h-0 min-w-0 flex-1 flex-row">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <DashboardHeader user={{ email: session.email, name: session.name }} />
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-row">
              <SpacePanel />
              <HomePanel user={{ email: session.email, name: session.name }} />
              <DashboardMain>{children}</DashboardMain>
            </div>
          </div>
        </div>
        <SetupChecklist />
        <MobileBottomNav />
      </div>
      {/* Outside .dashboard-shell so the dark-theme colour overrides never reach it. */}
      <InvitationPrompt />
    </MobileDrawerProvider>;
}
