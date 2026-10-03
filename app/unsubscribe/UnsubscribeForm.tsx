"use client";

import { useState } from "react";

// Unsubscribing needs a click (a POST), not just opening the link, so mail
// scanners that prefetch links in an inbox can't unsubscribe anyone by accident.
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!token) {
    return <p className="text-[15px] text-[#11120f]/60">This unsubscribe link is invalid.</p>;
  }

  if (state === "done") {
    return (
      <>
        <h1 className="text-[22px] font-semibold">You're unsubscribed</h1>
        <p className="mt-2 text-[15px] text-[#11120f]/60">You won't get the weekly summary any more. Billing and security emails will still reach you.</p>
      </>
    );
  }

  async function unsubscribe() {
    setState("working");
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <>
      <h1 className="text-[22px] font-semibold">Stop the weekly summary?</h1>
      <p className="mt-2 text-[15px] text-[#11120f]/60">Billing and security emails will keep coming, since you need those.</p>
      <button type="button" onClick={unsubscribe} disabled={state === "working"} className="mt-6 h-12 w-full rounded-full bg-[#11120f] text-[15px] font-semibold text-white disabled:opacity-50">
        {state === "working" ? "Working…" : "Unsubscribe"}
      </button>
      {state === "error" && <p className="mt-3 text-[14px] text-red-600">{message}</p>}
    </>
  );
}
