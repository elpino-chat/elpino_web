"use client";

type AskAiMenuProps = { pageUrl: string };

export function AskAiMenu({ pageUrl }: AskAiMenuProps) {
  const prompt = `Help me with the Elpino documentation at ${pageUrl}.`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <details className="group/ai relative flex-none">
      <summary className="flex h-9 cursor-pointer list-none items-center justify-center gap-1.5 rounded-xl bg-transparent pl-3 pr-3.5 text-black/70 ring-1 ring-black/10 transition hover:ring-black/30 [&::-webkit-details-marker]:hidden">
        <span className="flex -space-x-1.5" aria-label="ChatGPT and Claude">
          <span className="flex size-5 items-center justify-center rounded-full border border-white bg-white p-1"><img src="/icons/openai.svg" alt="ChatGPT" className="size-full" /></span>
          <span className="flex size-5 items-center justify-center rounded-full border border-white bg-[#faf9f5] p-1"><img src="/icons/anthropic.svg" alt="Claude" className="size-full" /></span>
        </span>
        <span className="whitespace-nowrap text-sm">Ask Assistant</span>
        <span className="flex-none text-xs font-normal">Ctrl I</span>
      </summary>

      <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 shadow-[0_14px_35px_rgba(25,32,22,0.14)]">
        <p className="px-2.5 pb-1.5 pt-1 text-[10px] uppercase tracking-[0.1em] text-black/45">Ask with</p>
        <a href={chatGptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-black/80 transition hover:bg-black/5"><img src="/icons/openai.svg" alt="" className="size-4" />ChatGPT</a>
        <a href={claudeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-black/80 transition hover:bg-black/5"><img src="/icons/anthropic.svg" alt="" className="size-4" />Claude</a>
      </div>
    </details>
  );
}
