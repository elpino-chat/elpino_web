"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PreChatFormEditor } from "@/app/dashboard/components/prechat-form-editor";

export function PreChatFormClient() {
  return (
    <div className="dashboard-page-surface min-h-full bg-[#f7f8fa] px-7 py-8 text-[#17233a] sm:px-9 lg:px-10">
      <div className="mx-auto max-w-[760px]">
        <Link href="/dashboard/connect" className="flex items-center gap-1.5 text-[12px] font-medium text-[#5d6872] hover:text-black">
          <ArrowLeft size={14} /> Connect
        </Link>

        <header className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7d8791]">Website chat</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em]">Pre-chat form</h1>
          <p className="mt-1.5 max-w-xl text-[12px] leading-5 text-[#74808c]">
            Choose what visitors are asked before they can start a conversation. Add your own questions, mark any field optional or required, and reorder them — visitors on your site see this exact form.
          </p>
        </header>

        <div className="mt-7">
          <PreChatFormEditor />
        </div>
      </div>
    </div>
  );
}
