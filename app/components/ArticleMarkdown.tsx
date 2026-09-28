import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// A help-centre article: headings you can jump to, tables that scroll instead of overflowing the widget,
// and blockquotes ("> **Note:** …") drawn as callouts. Uses the widget's own palette through `currentColor`
// and transparent tints, so it reads on the light and the dark widget alike.

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };

const slug = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

function plain(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plain).join("");
  if (node && typeof node === "object" && "props" in node) return plain((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

const stripMarkdown = (text: string) =>
  text.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`>#]/g, "").replace(/\s+/g, " ").trim();

/**
 * Splits an article into what the page shows separately: the headings for the table of contents, a short
 * summary (the opening paragraph, when it is short enough to be one), and the body without the parts already
 * shown above it (the leading "# Title" line, which the page prints as its own heading, and that paragraph).
 */
export function prepareArticle(content: string): { summary: string; body: string; headings: ArticleHeading[] } {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let fenced = false;
  const headings: ArticleHeading[] = [];
  const seen = new Map<string, number>();
  for (const line of lines) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = stripMarkdown(match[2]);
    const base = slug(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count}` : base, text, level: match[1].length as 2 | 3 });
  }

  let body = content.replace(/\r\n/g, "\n").trim();
  body = body.replace(/^#\s+.+\n+/, "");
  const [first, ...rest] = body.split(/\n{2,}/);
  const isPlainParagraph = Boolean(first) && !/^\s*([#>|*+-]|\d+\.|```)/.test(first);
  const summary = isPlainParagraph && stripMarkdown(first).length <= 220 && rest.length > 0 ? stripMarkdown(first) : "";
  return { summary, body: summary ? rest.join("\n\n") : body, headings };
}

export default function ArticleMarkdown({ text }: { text: string }) {
  const ids = new Map<string, number>();
  const idFor = (children: ReactNode) => {
    const base = slug(stripMarkdown(plain(children))) || "section";
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
  return (
    <div className="break-words text-[14px] leading-6 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-current/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_hr]:my-4 [&_hr]:opacity-20 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-current/10 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
          h1: ({ children }) => <h3 id={idFor(children)} className="mb-2 mt-6 scroll-mt-4 text-[18px] font-semibold leading-6">{children}</h3>,
          h2: ({ children }) => <h3 id={idFor(children)} className="mb-2 mt-6 scroll-mt-4 text-[18px] font-semibold leading-6">{children}</h3>,
          h3: ({ children }) => <h4 id={idFor(children)} className="mb-1.5 mt-5 scroll-mt-4 text-[15.5px] font-semibold leading-6">{children}</h4>,
          h4: ({ children }) => <h5 className="mb-1 mt-4 text-[14px] font-semibold">{children}</h5>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-current/15">
              <table className="w-full border-collapse text-left text-[13px]">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-current/15 bg-current/5 px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-t border-current/10 px-3 py-2 align-top">{children}</td>,
          blockquote: ({ children }) => (
            <div role="note" className="my-4 rounded-lg border-l-4 px-4 py-3 text-[13.5px] [&_p]:my-0" style={{ borderColor: "#d99a1c", backgroundColor: "rgba(217,154,28,.12)" }}>
              {children}
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
