"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setAccepting(true);
    setError(null);
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Could not accept invitation");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={accepting}
        onClick={() => void accept()}
        className="flex h-11 w-full items-center justify-center rounded-full bg-[#11120f] text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {accepting ? "Joining…" : "Accept invitation"}
      </button>
      {error && <p className="mt-3 text-[12px] text-[#c63f4d]">{error}</p>}
    </div>
  );
}
