"use client";

import { Highlight, themes, type Language } from "prism-react-renderer";

// Syntax highlighting for the snippets people copy into their own site, using the same library and "VS Dark" colours as the
// Identity Verification docs (components/identity/CodeBlock.tsx). Just the coloured code: the caller draws the box and the Copy button.

/** Highlighted code that wraps instead of scrolling sideways, so a long URL stays readable in a narrow dialog. */
export function HighlightedCode({ code, lang, className = "" }: { code: string; lang: Language; className?: string }) {
  return (
    <Highlight theme={themes.vsDark} code={code.trimEnd()} language={lang}>
      {({ className: prismClass, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${prismClass} ${className} whitespace-pre-wrap break-all font-mono leading-6`} style={{ ...style, background: "transparent", margin: 0 }}>
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
  );
}

// Content-Security-Policy lines are "directive origin origin;", which no bundled Prism language describes, so they are coloured here
// with the same palette: directive names like attribute names, origins like strings, the semicolon like punctuation.
const DIRECTIVE = "#9CDCFE";
const ORIGIN = "#CE9178";
const PUNCTUATION = "#D4D4D4";

export function HighlightedCsp({ code, className = "" }: { code: string; className?: string }) {
  return (
    <pre className={`${className} whitespace-pre-wrap break-all font-mono leading-6`} style={{ margin: 0, color: PUNCTUATION }}>
      {code.split("\n").map((line, index) => {
        const match = line.match(/^(\S+)\s+(.*?)(;?)\s*$/);
        if (!match) return <div key={index}>{line}</div>;
        const [, directive, origins, semicolon] = match;
        return (
          <div key={index}>
            <span style={{ color: DIRECTIVE }}>{directive}</span>{" "}
            {origins.split(/\s+/).map((origin, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span style={{ color: ORIGIN }}>{origin}</span>
              </span>
            ))}
            <span style={{ color: PUNCTUATION }}>{semicolon}</span>
          </div>
        );
      })}
    </pre>
  );
}
