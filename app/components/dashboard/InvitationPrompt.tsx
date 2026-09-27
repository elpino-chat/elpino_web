"use client";

import { useCallback, useEffect, useState } from "react";

type PendingInvitation = {
  id: string;
  token: string;
  organizationId: string;
  organizationName: string;
  invitedByEmail: string | null;
};

const POLL_MS = 45_000;
// "Later" hides an invitation until the tab is closed, not forever.
const SNOOZE_KEY = "elpino:snoozed-invitations";

function readSnoozed(): string[] {
  try {
    return JSON.parse(window.sessionStorage.getItem(SNOOZE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function snooze(id: string) {
  try {
    window.sessionStorage.setItem(SNOOZE_KEY, JSON.stringify([...new Set([...readSnoozed(), id])]));
  } catch {
    // Storage blocked: the prompt just comes back on the next check.
  }
}

/**
 * Asks, on any dashboard page, whether to join a workspace someone invited
 * this person to. The email invitation still goes out; this is the same
 * invitation surfaced where the person already is.
 */
export default function InvitationPrompt() {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/invitations/mine", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { invitations?: PendingInvitation[] } | null) => {
        if (!data) return;
        const snoozed = new Set(readSnoozed());
        setInvitations((data.invitations ?? []).filter((item) => !snoozed.has(item.id)));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  const current = invitations[0];

  function next() {
    setError(null);
    setInvitations((items) => items.slice(1));
  }

  async function accept() {
    if (!current || busy) return;
    setBusy("accept");
    setError(null);
    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: current.token }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Could not join this workspace.");
        return;
      }
      // Accepting makes it the selected workspace on the server; a full load
      // brings every panel up in it rather than leaving the old one's data around.
      window.location.assign("/dashboard");
    } finally {
      setBusy(null);
    }
  }

  async function decline() {
    if (!current || busy) return;
    setBusy("decline");
    setError(null);
    try {
      const response = await fetch("/api/invitations/decline", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: current.id }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "Could not decline this invitation.");
        return;
      }
      next();
    } finally {
      setBusy(null);
    }
  }

  function later() {
    if (!current) return;
    snooze(current.id);
    next();
  }

  useEffect(() => {
    if (!current) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) later(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, busy]);

  if (!current) return null;

  const inviter = current.invitedByEmail ?? "Someone";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="invitation-prompt-title" className="dashboard-invitation-prompt w-full max-w-[400px] rounded-2xl border border-black/10 bg-white p-7 text-center text-[#17191b] shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#11120f] text-[22px] font-semibold text-white">
          {current.organizationName.charAt(0).toUpperCase()}
        </span>
        <p className="mt-5 text-[13px] text-[#667069]">{inviter} invited you to join</p>
        <h2 id="invitation-prompt-title" className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">{current.organizationName}</h2>
        <p className="mt-2 text-[13px] leading-5 text-[#667069]">Join to see its inbox and conversations. You can switch between workspaces any time.</p>

        {error && <p role="alert" className="mt-4 rounded-lg bg-[#fdf0f1] px-3 py-2 text-[12.5px] text-[#a5414b]">{error}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button type="button" disabled={busy !== null} onClick={() => void accept()} className="h-11 rounded-xl bg-[#11120f] text-[14px] font-semibold text-white transition hover:bg-[#2a2c30] disabled:opacity-60">
            {busy === "accept" ? "Joining…" : "Accept and open workspace"}
          </button>
          <div className="flex gap-2">
            <button type="button" disabled={busy !== null} onClick={() => void decline()} className="h-10 flex-1 rounded-xl border border-black/10 text-[13px] font-medium transition hover:bg-black/[0.04] disabled:opacity-60">
              {busy === "decline" ? "Declining…" : "Decline"}
            </button>
            <button type="button" disabled={busy !== null} onClick={later} className="h-10 flex-1 rounded-xl text-[13px] font-medium text-[#667069] transition hover:bg-black/[0.04] disabled:opacity-60">
              Later
            </button>
          </div>
        </div>

        {invitations.length > 1 && <p className="mt-4 text-[11.5px] text-[#8b9398]">{invitations.length - 1} more invitation{invitations.length === 2 ? "" : "s"} waiting</p>}
      </div>
    </div>
  );
}
