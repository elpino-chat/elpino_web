import type { Metadata } from "next";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6 text-[#11120f]">
      <div className="w-full max-w-[420px] text-center">
        <UnsubscribeForm token={typeof token === "string" ? token : ""} />
      </div>
    </main>
  );
}
