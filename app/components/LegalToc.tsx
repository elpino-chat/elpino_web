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
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6a7a61]">Contents</p>
      <ol className="mt-5 border-l border-[#cfd9c8]">
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
                    ? "border-[#849d6d] bg-[#e9eee3] font-medium text-[#20251d]"
                    : "border-transparent text-[#687467] hover:border-[#a1b192] hover:text-[#20251d]"
                }`}
              >
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-[#718964]" : "text-[#98a58f] group-hover:text-[#718964]"}`}>
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
