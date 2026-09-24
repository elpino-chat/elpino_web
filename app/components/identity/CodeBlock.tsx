"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Highlight, Prism, themes, type Language } from "prism-react-renderer";
import { SERVER_SNIPPETS } from "@/lib/identity-snippets";

// Ruby isn't in prism-react-renderer's bundled language set (markup, css,
// clike, javascript, php, python, ... but not ruby) — the documented
// escape hatch is registering it on the package's own Prism instance
// before anything renders. See https://github.com/FormidableLabs/prism-react-renderer#custom-language-support
if (typeof window !== "undefined") {
  (window as unknown as { Prism: typeof Prism }).Prism = Prism;
  void import("prismjs/components/prism-ruby");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CodeBlock({ title, code, lang = "javascript" }: { title?: string; code: string; lang?: Language }) {
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
      <Highlight theme={themes.vsDark} code={code.trimEnd()} language={lang}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} overflow-x-auto p-3 font-mono text-[11.5px] leading-5`} style={{ ...style, background: "transparent" }}>
            {tokens.map((line, lineIndex) => (
              // eslint-disable-next-line react/jsx-key
              <div {...getLineProps({ line })} key={lineIndex}>
                {line.map((token, tokenIndex) => (
                  // eslint-disable-next-line react/jsx-key
                  <span {...getTokenProps({ token })} key={tokenIndex} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
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
      <CodeBlock title={snippet.install} code={snippet.code} lang={snippet.lang as Language} />
    </div>
  );
}
