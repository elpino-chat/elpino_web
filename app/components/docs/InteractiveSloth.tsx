"use client";

import Image from "next/image";
import { useState } from "react";

export function InteractiveSloth() {
  const [isWaving, setIsWaving] = useState(false);

  function wave() {
    setIsWaving(true);
    window.setTimeout(() => setIsWaving(false), 2400);
  }

  return (
    <div className="relative mx-auto w-full max-w-[220px] lg:mx-0">
      <button
        type="button"
        onClick={wave}
        aria-label="Wave hello to the Elpino guide"
        className="group relative block w-full rounded-[24px] border border-black/10 bg-black/[0.03] px-3 pt-3 text-left transition hover:bg-[#f3edfb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7651b0]"
      >
        <Image
          src="/desk_avatar1.png"
          alt="Elpino's friendly sloth guide working at a desk"
          width={600}
          height={377}
          priority
          sizes="(min-width: 1024px) 220px, 190px"
          className="relative h-auto w-full transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]"
        />
        <span aria-hidden="true" className={`absolute right-3 top-2 text-2xl ${isWaving ? "animate-[sloth-wave_0.65s_ease-in-out_3]" : "opacity-0"}`}>👋</span>
      </button>
      <p className="mt-3 text-center text-[11px] font-medium text-black/50">Your setup guide</p>
      {isWaving && <p role="status" className="absolute -right-5 -top-10 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-black shadow-sm">Hi! I&apos;m here to help.</p>}
    </div>
  );
}
