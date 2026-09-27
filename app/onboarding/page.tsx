import { Suspense } from "react";
import { OnboardingClient } from "./onboarding-client";
import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export const metadata = {
  title: "Get started",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const session = await requireSession();
  if (!session) redirect("/login");
  return (
    <Suspense fallback={null}>
      <OnboardingClient session={session} />
    </Suspense>
  );
}
