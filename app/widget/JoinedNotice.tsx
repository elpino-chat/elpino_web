"use client";

import { useState } from "react";

const INK = "#18181b";
const MUTED = "rgba(24,24,27,.55)";
const BORDER = "#e4e6ea";

/**
 * "Emily James joined the chat": a teammate taking over from the AI, shown as a small card with their photo sitting
 * on its top edge, so the visitor sees there is now a person on the other side. Falls back to their initial.
 */
export function JoinedNotice({ name, avatarUrl, ago }: { name: string; avatarUrl: string | null; ago: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex justify-center pt-5" role="status">
      <div className="relative w-full max-w-[300px] rounded-2xl border bg-white px-4 pb-3 pt-6 text-center" style={{ borderColor: BORDER }}>
        <span className="absolute left-1/2 top-0 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full text-[14px] font-semibold text-white ring-4 ring-white" style={{ backgroundColor: "#6b7280" }}>
          {avatarUrl && !failed
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
            : (name.trim().charAt(0).toUpperCase() || "?")}
        </span>
        <p className="text-[13.5px] leading-5" style={{ color: INK }}><span className="font-semibold">{name}</span> joined the chat</p>
        <p className="mt-0.5 text-[11.5px]" style={{ color: MUTED }}>{ago}</p>
      </div>
    </div>
  );
}
