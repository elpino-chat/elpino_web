"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DocsSearch } from "./DocsSearch";

export function HeaderDocsSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group/search flex h-9 w-full items-center justify-between gap-2 truncate rounded-xl bg-transparent pl-3.5 pr-3 text-sm leading-6 text-gray-500 ring-1 ring-gray-400/30 transition hover:ring-gray-600/30" id="search-bar-entry" aria-label="Open search">
        <span className="flex min-w-0 items-center gap-2"><Search size={16} strokeWidth={1.5} className="min-w-4 flex-none text-gray-700 group-hover/search:text-gray-800" /><span className="min-w-0 truncate">Search or ask...</span></span>
        <span className="flex-none text-xs font-normal">Ctrl K</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Search documentation" className="fixed inset-0 z-[70] flex items-start justify-center bg-black/20 px-4 pt-24 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-3 shadow-[0_24px_70px_rgba(25,32,22,0.2)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-2 flex justify-end"><button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="inline-flex size-8 items-center justify-center rounded-lg text-black/55 transition hover:bg-black/5 hover:text-black"><X size={16} /></button></div>
            <DocsSearch autoFocus />
          </div>
        </div>
      )}
    </>
  );
}
