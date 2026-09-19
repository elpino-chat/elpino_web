"use client";

import { ArrowUp } from "lucide-react";
import { FormEvent, useState } from "react";

export function GlossyDocsSearch() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExpanded(true);
  }

  return (
    <form onSubmit={search} className={`fixed bottom-2 left-1/2 z-40 flex max-w-[calc(100%_-_2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/80 bg-white/35 p-2 shadow-[0_16px_45px_rgba(25,32,22,0.18)] ring-1 ring-black/5 transition-[width] duration-300 [backdrop-filter:blur(24px)_saturate(160%)] ${expanded ? "w-[620px]" : "w-[380px]"}`}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} name="q" type="search" aria-label="Search the documentation" placeholder="Search the documentation..." className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-black outline-none placeholder:text-black/45" />
      <button type="submit" aria-label="Search documentation" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80"><ArrowUp size={17} /></button>
    </form>
  );
}
