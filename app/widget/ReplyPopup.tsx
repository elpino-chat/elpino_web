"use client";

import { X } from "lucide-react";
import { plainPreview } from "../../lib/plain-preview";

// How many unread reply popups stack up behind the newest, and how far each shows below the one in front.
export const STACK_SIZE = 3;
export const STACK_PEEK_PX = 8;

// The popup's age label counts the first minute in seconds: "Just now", "10s ago", "1 min ago", "2 hr ago".
// Same wording as the greeting popup in app/tag.js/route.ts.
export function popupAgo(then: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export type PopupReply = { id: string; body: string; createdAt: string };

/**
 * The unread-reply popup shown above the launcher while the chat is closed. The same look as the greeting
 * popup the tag script shows (app/tag.js/route.ts): one dark bubble, the message in white with the
 * assistant's name and its age underneath, and the close button absolute so the frame is only the bubble.
 * Earlier unread replies sit behind it, each a little narrower and lower, so the newest is in front.
 */
export function ReplyPopup({ replies, botName, now, onOpen, onDismiss }: { replies: PopupReply[]; botName: string; now: number; onOpen: () => void; onDismiss: () => void }) {
  const latest = replies[replies.length - 1];
  const behind = replies.length - 1;
  // The measured element: the widget reports its height so the tag script can size the frame to fit.
  const card = (
    <div
      {...(behind === 0 ? { id: "elpino-reply-preview" } : {})}
      className="relative w-full cursor-pointer rounded-xl py-3 pl-4 pr-9 text-left"
      style={{ backgroundColor: "#111214", color: "#fff" }}
      role="button"
      tabIndex={0}
      aria-label={behind ? `Open ${replies.length} new support replies` : "Open new support reply"}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen();
      }}
    >
      <p className="line-clamp-2 text-[15px] leading-[1.5]">{plainPreview(latest.body) || "Sent you a new reply"}</p>
      <p className="mt-2 flex items-baseline gap-1.5 text-[12.5px] leading-[1.3]" style={{ color: "rgba(255,255,255,0.6)" }}>
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{botName}</span>
        <span aria-hidden="true">·</span>
        <span>{popupAgo(Date.parse(latest.createdAt) || now, now)}</span>
        {behind > 0 && <span className="ml-auto">+{behind} more</span>}
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute right-2 top-2 flex cursor-pointer items-center justify-center rounded-full p-1 leading-none transition hover:bg-white/20"
        style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
  // One reply: just the card. The wrapper only exists to hold the layers behind it.
  if (behind === 0) return card;
  return (
    <div id="elpino-reply-preview" className="relative w-full" style={{ paddingBottom: behind * STACK_PEEK_PX }}>
      {Array.from({ length: behind }, (_, index) => index + 1).map((depth) => (
        <div
          key={replies[replies.length - 1 - depth].id}
          data-stack-layer={depth}
          aria-hidden="true"
          className="absolute top-2 rounded-xl"
          style={{ left: depth * STACK_PEEK_PX * 1.5, right: depth * STACK_PEEK_PX * 1.5, bottom: (behind - depth) * STACK_PEEK_PX, backgroundColor: depth === 1 ? "#2a2c30" : "#3a3d42" }}
        />
      ))}
      {card}
    </div>
  );
}
