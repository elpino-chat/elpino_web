"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageCircleMore, X } from "lucide-react";

export type AssignmentNotification = {
  conversationId: string;
  title: string;
  detail: string;
  // Sent to every teammate at once (an AI escalation), not offered to one.
  teamAlert?: boolean;
};

/**
 * The real-time "a conversation was just assigned to you" popup — pushed
 * over the presence WebSocket the instant the AI (or the stalled-thread
 * sweep) hands someone a conversation, not discovered later by polling. See
 * DashboardHeader's socket listener for where this gets triggered, and
 * ConversationsService.assignNext / .decline on the backend for what Join
 * and Cancel actually do.
 *
 * Styled directly (not via the shared toast library's theme prop) because
 * sonner's own dark/light switch tracks next-themes, which this dashboard
 * doesn't use — the dashboard has its own theme system, so this component
 * hooks into the same body:has([data-dashboard-theme]) pattern as the
 * notifications popover instead.
 */
export function AssignmentToast({
  notification,
  onDismiss,
}: {
  notification: AssignmentNotification;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"join" | "cancel" | null>(null);
  const [error, setError] = useState("");

  async function join() {
    setBusy("join");
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(notification.conversationId)}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ onlyIfUnclaimed: Boolean(notification.teamAlert) }),
      });
      if (!response.ok && notification.teamAlert) {
        // Someone else got there first — say so instead of silently opening it.
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Someone else already joined this chat");
        setBusy(null);
        window.setTimeout(onDismiss, 4000);
        return;
      }
      router.push(`/dashboard/inbox?conversation=${encodeURIComponent(notification.conversationId)}`);
      onDismiss();
    } catch {
      onDismiss();
    }
  }

  async function cancel() {
    // A team-wide alert was never assigned to this person, so there's
    // nothing to hand back — just close it.
    if (notification.teamAlert) {
      onDismiss();
      return;
    }
    setBusy("cancel");
    try {
      // Hands it back and looks for someone else immediately — see
      // ConversationsService.decline. The conversation doesn't just sit
      // there unassigned; another available teammate gets the same toast.
      await fetch(`/api/workspace/conversations/${encodeURIComponent(notification.conversationId)}/decline`, { method: "POST" });
    } finally {
      onDismiss();
    }
  }

  return (
    <div className="dashboard-assignment-toast flex w-[360px] items-start gap-3 rounded-2xl border border-[#e1e5e9] bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.22)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3F5] text-[#3578C8]">
        <MessageCircleMore size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="dashboard-assignment-toast-title text-[13px] font-semibold leading-5 text-black">{notification.title}</p>
        <p className="dashboard-assignment-toast-detail mt-0.5 line-clamp-2 text-[12px] leading-5 text-[#687178]">{notification.detail}</p>
        {error ? <p className="mt-1.5 text-[12px] leading-5 text-[#d0454c]">{error}</p> : null}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void join()}
            className="dashboard-assignment-toast-join flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#202225] text-[12.5px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "join" ? <LoaderCircle size={13} className="animate-spin" /> : null}
            Join
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void cancel()}
            title={notification.teamAlert ? "Leave it for someone else" : "Hand it to someone else on the team"}
            className="dashboard-assignment-toast-cancel flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#d8dde1] text-[12.5px] font-semibold text-black transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "cancel" ? <LoaderCircle size={13} className="animate-spin" /> : null}
            {notification.teamAlert ? "Not now" : "Cancel"}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="dashboard-assignment-toast-close shrink-0 rounded-md p-1 text-[#a2a7ac] transition hover:bg-[#f1f2f3] hover:text-black"
      >
        <X size={14} />
      </button>
    </div>
  );
}
