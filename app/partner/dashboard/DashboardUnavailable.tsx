"use client";

import { useRouter } from "next/navigation";

export function DashboardUnavailable({ accountGone }: { accountGone: boolean }) {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/partner/logout", { method: "POST" });
    router.replace("/partner/login");
    router.refresh();
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 font-display text-[#121315]">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">{accountGone ? "This partner account isn't available" : "We couldn't load your dashboard"}</h1>
        <p className="mt-2 text-sm leading-6 text-[#858585]">{accountGone ? "Sign out and log in again with the email you used to join." : "Something went wrong on our side. Please try again in a moment."}</p>
        <div className="mt-6 flex justify-center gap-3">
          {!accountGone && <button type="button" onClick={() => router.refresh()} className="h-10 rounded-lg bg-[#202225] px-5 text-[13px] font-medium text-white hover:bg-black">Try again</button>}
          <button type="button" onClick={() => void signOut()} className="h-10 rounded-lg border border-[#d3d3d3] px-5 text-[13px] font-medium hover:bg-[#f4f4f4]">Sign out</button>
        </div>
      </div>
    </main>
  );
}
