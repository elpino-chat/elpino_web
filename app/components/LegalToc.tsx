"use client";

import { useEffect, useState } from "react";
import type { LegalSection } from "./LegalPage";

export function LegalToc({ sections }: { sections: Pick<LegalSection, "id" | "title">[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const updateActiveSection = () => {
      const marker = Math.min(220, window.innerHeight * 0.3);
      let current = sections[0]?.id ?? "";

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= marker) current = section.id;
      }

      setActiveId(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sections]);

  return (
    <nav aria-label="Table of contents" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3">
      <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-[#68766e]">Contents</p>
      <ol className="mt-6 border-l border-[#0d0d0d]/15">
        {sections.map((section, index) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveId(section.id)}
                className={`group -ml-px grid grid-cols-[2rem_1fr] border-l py-2.5 pl-4 text-[13px] leading-5 transition-all duration-200 ${
                  isActive
                    ? "border-[#ff584a] bg-[#ff584a]/[0.06] font-medium text-[#0d0d0d]"
                    : "border-transparent text-[#666] hover:border-[#ff584a]/55 hover:text-[#0d0d0d]"
                }`}
              >
                <span className={`font-geist-mono text-[10px] transition-colors ${isActive ? "text-[#ff584a]" : "text-[#999] group-hover:text-[#ff584a]"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
