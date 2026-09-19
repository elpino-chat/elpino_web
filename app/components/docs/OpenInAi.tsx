import { ChevronDown, ExternalLink, Sparkles } from "lucide-react";

export function OpenInAi({ pageTitle, pageUrl }: { pageTitle: string; pageUrl: string }) {
  const prompt = `Read the Elpino documentation page "${pageTitle}" at ${pageUrl}. Use it as the source of truth, then help me understand or implement what it describes.`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <details className="group relative z-20">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 text-xs font-semibold text-[#333a34] shadow-sm transition hover:border-[#bf91ff] hover:bg-[#faf7ff] [&::-webkit-details-marker]:hidden">
        <Sparkles size={14} className="text-[#7651b0]" />
        Open with AI
        <ChevronDown size={13} className="text-[#7b817b] transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-11 w-[250px] overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(25,32,22,0.18)]">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[#969b96]">Ask about this page</p>
        <a href={chatGptUrl} target="_blank" rel="noreferrer" className="group/item flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[#f3edfb]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#11120f] text-xs font-bold text-white">G</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Open in ChatGPT</span><span className="mt-0.5 block text-[11px] text-[#747b74]">Ask questions about this guide</span></span>
          <ExternalLink size={13} className="text-[#a0a5a0] transition group-hover/item:text-[#7651b0]" />
        </a>
        <a href={claudeUrl} target="_blank" rel="noreferrer" className="group/item flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[#fff1e3]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#d97757] text-xs font-bold text-white">C</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Open in Claude</span><span className="mt-0.5 block text-[11px] text-[#747b74]">Ask questions about this guide</span></span>
          <ExternalLink size={13} className="text-[#a0a5a0] transition group-hover/item:text-[#b85e42]" />
        </a>
      </div>
    </details>
  );
}
