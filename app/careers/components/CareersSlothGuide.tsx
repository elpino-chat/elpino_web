"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, X, Sparkles, Coffee, Laptop, Heart } from "lucide-react";

const slothWisdom = [
  {
    title: "Why the sloth ethos?",
    text: "Sloths never rush bad code. We don't believe in frenzy or hustle-theater. We believe in calm minds building resilient, automated systems that run smoothly 24/7.",
    icon: Coffee,
  },
  {
    title: "100% Async & Remote Friendly",
    text: "Our team spans 6 global hubs and countless remote home-offices. We rely on clear writing, small PRs, and protected focus blocks over back-to-back meetings.",
    icon: Laptop,
  },
  {
    title: "Interview Process with Respect",
    text: "No 7-round hazing rituals. We review your portfolio, have a high-signal architectural dialogue, and complete a paid practical project with the team.",
    icon: Heart,
  },
];

export function CareersSlothGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  function scrollToRoles() {
    setIsOpen(false);
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <aside aria-label="Sloth career advisor" className="fixed bottom-6 right-6 z-40">
      {/* Expanded speech card */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-3xl border border-black/15 bg-white/95 p-6 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between border-b border-black/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative size-12 overflow-hidden rounded-2xl border border-black/10 bg-[#faf9f6]">
                <Image
                  src="/desk_avatar1.png"
                  alt="Pino the mascot"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">Pino · Head of Sloth Ops</h4>
                <p className="text-xs text-black/50">Your culture & interview guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded-full p-1 text-black/40 hover:bg-black/5 hover:text-black"
              aria-label="Close guide"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current Tip */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
              <Sparkles size={13} />
              <span>Culture Tip #{currentTip + 1}</span>
            </div>
            <h5 className="mt-2 text-base font-medium text-black">
              {slothWisdom[currentTip].title}
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-black/70 sm:text-sm">
              {slothWisdom[currentTip].text}
            </p>
          </div>

          {/* Navigation & Action */}
          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-xs">
            <button
              type="button"
              onClick={() => setCurrentTip((currentTip + 1) % slothWisdom.length)}
              className="cursor-pointer font-semibold text-black/60 hover:text-black"
            >
              Next culture tip →
            </button>

            <button
              type="button"
              onClick={scrollToRoles}
              className="cursor-pointer rounded-full bg-black px-4 py-1.5 font-semibold text-white transition hover:bg-[#ff5600]"
            >
              See open roles
            </button>
          </div>
        </div>
      )}

      {/* Floating Mascot Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sloth guide"
        className="group relative flex size-14 cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white shadow-xl transition-all duration-300 hover:scale-110 hover:border-black active:scale-95"
      >
        <div className="relative size-10 overflow-hidden rounded-full">
          <Image
            src="/desk_avatar1.png"
            alt="Sloth avatar"
            fill
            className="object-contain transition-transform group-hover:rotate-6"
          />
        </div>

        {/* Pulse badge */}
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#ff5600] text-[9px] font-bold text-white shadow-xs">
          👋
        </span>
      </button>
    </aside>
  );
}
