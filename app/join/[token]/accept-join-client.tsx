"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptJoinClient({ token }: { token: string }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      const response = await fetch(`/api/join-link/${encodeURIComponent(token)}/accept`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Could not join this workspace");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mt-7 w-full">
      <button
        type="button"
        disabled={joining}
        onClick={() => void join()}
        className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-9 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f77ea] disabled:pointer-events-none disabled:opacity-60"
      >
        {joining ? "Joining…" : "Join workspace"}
      </button>
      {error && <p role="alert" className="mt-3 rounded-xl border-2 border-[#11120f] bg-[#ffe9ea] px-3 py-2 text-[13px] font-medium text-[#8a2b32]">{error}</p>}
    </div>
  );
}
