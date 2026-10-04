"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";

type Step = { target: string; title: string; body: string };
const step = (target: string, title: string, body: string): Step => ({ target, title, body });
const search = step('#dashboard-global-search', 'Find it without the detour', 'Search for people, conversations and workspaces from anywhere in your dashboard.');
const navigation = step('[data-tour="navigation"]', 'Your workspace, one click away', 'Move between your inbox, knowledge, contacts and settings. Each page has its own tour in the header.');

function pageSteps(path: string): Step[] {
  if (path === '/dashboard') return [navigation,
    step('#activity', 'Your support at a glance', 'See assigned conversations, AI-handled chats and contacts. Open the inbox when you are ready to join a conversation.'),
    step('[data-tour="issues"]', 'Keep track of follow-ups', 'Issues that need more work appear here, so you can follow up beyond the chat.'),
    step('[data-tour="recent-activity"]', 'Pick up where things left off', 'See the latest conversation activity and open a thread to catch up.'), search];
  if (path.startsWith('/dashboard/inbox') && !path.includes('view=ai')) return [
    step('#dashboard-inbox-list', 'Manage ongoing chats', 'Browse your team conversations and select a chat to read its history or take over.'),
    step('#dashboard-inbox-page', 'Keep the conversation moving', 'Read and reply to your customer from this workspace. Select a chat to see its available actions.'),
    step('.dashboard-reply-composer', 'Reply with the full context', 'Write a reply here. Press space for AI assistance or / for commands, as shown in the composer.'),
    step('#dashboard-customer-details', 'Get to know your customer', 'Review the customer details alongside the conversation so you can help without losing your place.'), search];
  if (path.startsWith('/dashboard/visitors')) return [
    step('[data-tour="analytics-range"]', 'Choose the time period', 'Select a date range or set your own start and end dates to focus the report.'),
    step('[data-tour="analytics-compare"]', 'See what changed', 'Choose the comparison period to put the current results in context.'),
    step('[data-tour="analytics-site"]', 'Focus on one website', 'View all connected websites together or select a single website.'),
    step('.dashboard-analytics-canvas', 'Explore the results', 'Review the report below these controls. Data appears as your installed widget records visitor activity.'), search];
  if (path.startsWith('/dashboard/knowledge')) return [
    step('.dashboard-knowledge-main-surface', 'Give your AI the answers', 'Keep the information your support team relies on in one place. Browse your pages and connected website sources here.'),
    step('[data-tour="knowledge-add"]', 'Build your knowledge', 'Create a page or add a website source. Clear, current content helps your AI answer customer questions.'),
    step('#knowledge-source-url', 'Connect a source', 'Add the URL of the website you want to use as a knowledge source.'), search];
  if (path.startsWith('/dashboard/contacts')) return [
    step('#dashboard-contacts-page', 'Get to know your customers', 'Browse people who shared their details through your widget. Open a contact to see their details and available conversation history.'),
    step('.ct-search', 'Find the right person', 'Narrow the contact list using this search field.'), search];
  if (path.startsWith('/dashboard/settings/identity')) return [
    step('[data-tour="identity-secret"]', 'Verify your logged-in customers', 'Turn on verification and keep the generated secret on your server. Elpino can then distinguish signed-in customers from guests.'),
    step('[data-tour="identity-setup"]', 'Connect your existing login', 'Generate a signed token on your server, then pass it to $elpino. No separate identity endpoint is required. Call logout when your customer signs out.'), search];
  if (path.startsWith('/dashboard/settings/chatbot')) return [
    step('.dashboard-chatbot-settings-page', 'Meet your customer-facing widget', 'Customize the chat experience customers see on your website. Valid changes save automatically.'),
    step('[data-tour="widget-identity"]', 'Give your assistant an identity', 'Choose the name and avatar customers see in chat.'),
    step('[data-tour="widget-greeting"]', 'Start with a warm welcome', 'Edit the greeting lines that introduce the chat to your visitors.'),
    step('[data-tour="widget-preview"]', 'See it from their side', 'Try the preview as you customize the widget. This is a preview, not a live customer conversation.')];
  if (path.startsWith('/dashboard/settings/tags')) return [
    step('.dashboard-settings-surface', 'Connect your website', 'Create a website tag, install its script on your website, then check its connection status here.'),
    step('.dashboard-settings-surface button', 'Add a website', 'Use New tag to create a tag for the website where you want Elpino chat to appear.'), search];
  if (path.startsWith('/dashboard/connect')) return [
    step('.dashboard-connect-page', 'Bring your tools together', 'Browse the connector library and review the tools already connected to this workspace.'),
    step('[placeholder="Search connectors"]', 'Find your integration', 'Search by tool name, then open its card to see the connection setup.'), search];
  if (path.startsWith('/dashboard/settings')) return [
    step('.dashboard-settings-surface', 'Make Elpino your own', 'Use the settings menu to manage your widget, teammates, website connection and workspace preferences. This panel shows the section you selected.'), search, navigation];
  if (path.startsWith('/dashboard/ai-assist') || path.includes('view=ai')) return [
    step('#dashboard-ai-assist', 'See what your AI is handling', 'Browse AI conversations and inspect a thread to understand the customer’s question and the response.'),
    step('.dashboard-ai-details', 'Context alongside the chat', 'Review the details available for the selected conversation.'), search];
  const sections: Record<string, [string, string]> = {
    visitors: ['Understand your visitors', 'Explore visitor activity and use the report navigation to switch views.'],
    connect: ['Connect your tools', 'Manage the integrations that bring your support workflow together. Choose a connection to see its setup.'],
    issues: ['Follow through on issues', 'Review support issues that need attention and track work beyond the conversation.'],
    notifications: ['Stay on top of updates', 'Review workspace notifications and open the items that need your attention.'],
  };
  const copy = sections[path.split('/')[2]] ?? ['Explore this page', 'This is your main workspace for this section. Use the navigation to explore other areas of Elpino.'];
  return [step('[data-tour="page"]', ...copy), search, navigation];
}

function target(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element?.getClientRects().length || getComputedStyle(element).visibility === 'hidden') return null;
  const rect = element.getBoundingClientRect();
  return rect.right > 0 && rect.left < window.innerWidth ? element : null;
}

export default function DashboardTour({ userKey }: { userKey: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const route = pathname + (pathname === '/dashboard/inbox' && params.get('view') === 'ai' ? '?view=ai' : '');
  return <PageTour key={route} pathname={route} userKey={userKey} />;
}

function PageTour({ pathname, userKey }: { pathname: string; userKey: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number; left: number; top: number } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const id = useId();
  const active = steps.length > 0;
  const storageKey = `elpino:tour:v1:${userKey}:${pathname}`;
  const start = useCallback(() => {
    if (document.querySelector('[aria-modal="true"]')) return;
    const available = pageSteps(pathname).filter(item => target(item.target));
    if (!available.length) return;
    setIndex(0); setBox(null); setSteps(available);
  }, [pathname]);
  const close = useCallback(() => {
    try { localStorage.setItem(storageKey, 'seen'); } catch { /* Storage is optional. */ }
    setSteps([]); setBox(null);
  }, [storageKey]);

  useEffect(() => {
    if (pathname !== '/dashboard') return;
    try { if (localStorage.getItem(storageKey)) return; } catch { return; }
    const timer = window.setTimeout(() => {
      try { if (localStorage.getItem(storageKey)) return; } catch { return; }
      start();
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [pathname, storageKey, start]);

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const shell = document.querySelector<HTMLElement>('.dashboard-shell');
    const wasInert = shell?.inert ?? false;
    if (shell) shell.inert = true;
    const focusTimer = requestAnimationFrame(() => dialog.current?.focus());
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
      const first = buttons[0]; const last = buttons.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keyboard, true);
    return () => { cancelAnimationFrame(focusTimer); if (shell) shell.inert = wasInert; document.removeEventListener('keydown', keyboard, true); if (previous?.isConnected) previous.focus(); };
  }, [active, close]);

  useEffect(() => {
    if (!active) return;
    const element = target(steps[index].target);
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    function measure() {
      const rect = target(steps[index].target)?.getBoundingClientRect();
      const vw = window.innerWidth; const vh = window.innerHeight;
      const x = Math.max(8, Math.min(vw - 8, (rect?.left ?? 16) - 5));
      const y = Math.max(8, Math.min(vh - 8, (rect?.top ?? 64) - 5));
      const right = Math.min(vw - 8, (rect?.right ?? vw - 16) + 5);
      const bottom = Math.min(vh - 8, (rect?.bottom ?? 100) + 5);
      const width = Math.max(0, right - x); const height = Math.max(0, bottom - y);
      const cardWidth = Math.min(380, vw - 24); const cardHeight = dialog.current?.offsetHeight ?? 280;
      let left = Math.max(12, (vw - cardWidth) / 2); let top = vh - cardHeight - 16;
      if (vw >= 768) {
        if (right + 20 + cardWidth <= vw - 12) { left = right + 20; top = y + 12; }
        else if (x - cardWidth - 20 >= 12) { left = x - cardWidth - 20; top = y + 12; }
        else if (bottom + cardHeight + 20 <= vh - 12) top = bottom + 20;
        else if (y - cardHeight - 20 >= 12) top = y - cardHeight - 20;
      }
      top = Math.max(12, Math.min(top, vh - cardHeight - 12));
      const next = { x, y, width, height, left, top };
      setBox(current => current && Object.keys(next).every(key => current[key as keyof typeof next] === next[key as keyof typeof next]) ? current : next);
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (element) observer.observe(element);
    if (dialog.current) observer.observe(dialog.current);
    window.addEventListener('resize', measure); window.addEventListener('scroll', measure, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [active, index, steps]);

  return <>
    <button type="button" onClick={start} title="Take a tour of this page" aria-label="Take a tour of this page" className="ml-2 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/15 px-2.5 text-xs text-white/75 transition hover:border-[#8db8ff]/50 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8db8ff]">
      <Compass size={16} /><span className="hidden xl:inline">Page tour</span>
    </button>
    {active && createPortal(<div className="fixed inset-0 z-[2147483600] isolate">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs><mask id={id}><rect width="100%" height="100%" fill="white" />{box && <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="12" fill="black" />}</mask></defs>
        <rect width="100%" height="100%" fill="rgba(6,10,20,.72)" mask={`url(#${id})`} />
        {box && <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="12" fill="none" stroke="#6ba7ff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 9px #428ce5)' }} />}
      </svg>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-body`} tabIndex={-1} className="fixed w-[380px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[22px] border border-white/80 bg-[#edf3ff] p-6 text-[#17223b] shadow-[0_24px_90px_rgba(0,0,0,0.4)] outline-none" style={{ left: box?.left ?? 12, top: box?.top ?? 80, maxHeight: 'calc(100dvh - 24px)', visibility: box ? 'visible' : 'hidden' }}>
        <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#4c6590]"><Compass size={15} /> A little look around</span><button type="button" onClick={close} aria-label="Close tour" className="rounded-full p-1.5 text-[#61718d] hover:bg-black/5 focus-visible:outline-2"><X size={17} /></button></div>
        <div aria-live="polite" aria-atomic="true"><h2 id={`${id}-title`} className="text-xl font-semibold leading-7 tracking-[-.025em]">{steps[index].title}</h2><p id={`${id}-body`} className="mt-2 text-sm leading-6 text-[#53627c]">{steps[index].body}</p></div>
        <div className="mt-5 flex gap-1.5" aria-hidden="true">{steps.map((item, i) => <span key={item.target} className={`h-1 flex-1 rounded-full ${i <= index ? 'bg-[#428ce5]' : 'bg-[#d4deef]'}`} />)}</div>
        <div className="mt-5 flex items-center gap-2">
          <button type="button" disabled={!index} onClick={() => setIndex(value => value - 1)} aria-label="Previous step" className="rounded-xl border border-[#ced8e9] p-2.5 disabled:opacity-30 hover:bg-white/60 focus-visible:outline-2"><ArrowLeft size={16} /></button>
          <button type="button" onClick={() => index === steps.length - 1 ? close() : setIndex(value => value + 1)} className="flex items-center gap-2 rounded-xl bg-[#17223b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#293e65] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#428ce5]">{index === steps.length - 1 ? 'Got it' : 'Next'}<ArrowRight size={15} /></button>
          <button type="button" onClick={close} className="ml-auto rounded-lg px-2 py-2 text-xs text-[#53627c] hover:bg-black/5 focus-visible:outline-2">Skip all</button><span className="text-xs tabular-nums text-[#53627c]">{index + 1} / {steps.length}</span>
        </div>
      </div>
    </div>, document.body)}
  </>;
}
