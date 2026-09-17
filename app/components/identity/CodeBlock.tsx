"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SERVER_SNIPPETS } from "@/lib/identity-snippets";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg bg-[#17181a]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[11px] font-medium text-white/60">{title}</span>
        <button
          type="button"
          onClick={async () => { if (await copyText(code)) { setCopied(true); window.setTimeout(() => setCopied(false), 1500); } }}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[11.5px] leading-5 text-[#e7e8ea]">{code}</pre>
    </div>
  );
}

// Server signing examples, one tab per language.
export function ServerSnippetTabs() {
  const [active, setActive] = useState(SERVER_SNIPPETS[0].id);
  const snippet = SERVER_SNIPPETS.find((item) => item.id === active) ?? SERVER_SNIPPETS[0];
  return (
    <div>
      <div role="tablist" aria-label="Server language" className="mb-2 flex flex-wrap gap-1">
        {SERVER_SNIPPETS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            onClick={() => setActive(item.id)}
            className={`h-7 rounded-md px-2.5 text-[12px] font-medium transition ${item.id === active ? "bg-[#17181a] text-white" : "text-[#687178] hover:bg-black/5"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <CodeBlock title={snippet.install} code={snippet.code} />
    </div>
  );
}
