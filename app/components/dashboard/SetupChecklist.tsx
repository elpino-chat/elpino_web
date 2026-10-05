"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, X } from "lucide-react";
import { useIsMember } from "./use-is-member";

type Step = { id: string; label: string; detail: string; href: string; done: boolean };

type PersonaResult = {
  persona?: {
    aiName?: string;
    aiPersona?: string | null;
    aiAvatarUrl?: string | null;
    chatbotAccent?: string;
    chatbotTheme?: string;
    greetingLines?: string[];
  } | null;
};

// Mirrors the server-side defaults (companies.controller.ts / ai-persona
// route) so "still the stock look" can be told apart from an actual change,
// the same way the name check already tells "Elpino AI" apart from a rename.
const DEFAULT_AI_NAME = "Elpino AI";
const DEFAULT_CHATBOT_ACCENT = "#202225";
const DEFAULT_CHATBOT_THEME = "light";
// Compared as one message: the settings page saves the greeting as a single line, so the untouched
// default is the same text whether it is stored as two lines or one.
const DEFAULT_GREETING = "Hi there 👋 How can I help you today?";
const DEFAULT_AVATAR_FILENAME = "widget_5.png";
type KnowledgeResult = { items?: unknown[] };
type IntegrationsResult = { integrations?: { status?: string }[] };
type AvailabilityResult = { availability?: unknown };

// Whatever a fetch can't answer counts as "not done yet" rather than
// blocking the badge — a half-loaded checklist is still useful, and a step
// wrongly shown as incomplete costs a click, while one wrongly ticked off
// hides real setup work.
function get<T>(url: string): Promise<T | null> {
  return fetch(url)
    .then((response) => (response.ok ? (response.json() as Promise<T>) : null))
    .catch(() => null);
}

export default function SetupChecklist() {
  const pathname = usePathname();
  // Every step points at a page only the owner can change.
  const isMember = useIsMember();
  // Expanded on arrival: a collapsed pill is easy to walk past, and the
  // whole point is that a new workspace sees what's still unfinished.
  // Collapsing sticks for the session; the next visit opens it again.
  const [open, setOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  const load = useCallback(async () => {
    const [persona, knowledge, integrations, availability] = await Promise.all([
      get<PersonaResult>("/api/workspace/ai-persona"),
      get<KnowledgeResult>("/api/workspace/knowledge"),
      get<IntegrationsResult>("/api/workspace/integrations"),
      get<AvailabilityResult>("/api/account/availability"),
    ]);

    setSteps([
      {
        id: "account",
        label: "Create your account",
        detail: "Done when you signed in",
        href: "/dashboard/settings",
        // Reaching this component at all means an authenticated session.
        done: true,
      },
      {
        id: "bot",
        label: "Set up the bot interface",
        detail: "Name, look and tone of your AI teammate",
        href: "/dashboard/settings/chatbot",
        // The stock name/avatar/color/greeting alone isn't a setup: it's
        // what every workspace starts with. Changing any one of name, look
        // (avatar or accent color or theme), greeting, or persona counts —
        // matching the step's own "Name, look and tone" description instead
        // of only checking the name and persona text.
        done: Boolean(
          persona?.persona &&
            (persona.persona.aiPersona?.trim() ||
              (persona.persona.aiName && persona.persona.aiName !== DEFAULT_AI_NAME) ||
              (persona.persona.aiAvatarUrl && !persona.persona.aiAvatarUrl.endsWith(DEFAULT_AVATAR_FILENAME)) ||
              (persona.persona.chatbotAccent && persona.persona.chatbotAccent !== DEFAULT_CHATBOT_ACCENT) ||
              (persona.persona.chatbotTheme && persona.persona.chatbotTheme !== DEFAULT_CHATBOT_THEME) ||
              (Array.isArray(persona.persona.greetingLines) &&
                persona.persona.greetingLines.length > 0 &&
                persona.persona.greetingLines.join(" ").trim() !== DEFAULT_GREETING)),
        ),
      },
      {
        id: "knowledge",
        label: "Add knowledge",
        detail: "Docs and pages the AI answers from",
        href: "/dashboard/knowledge",
        done: Boolean(knowledge?.items?.length),
      },
      {
        id: "connector",
        label: "Add a connector",
        detail: "Connect your site and the tools you use",
        href: "/dashboard/connect",
        done: Boolean(integrations?.integrations?.some((integration) => integration.status === "connected")),
      },
      {
        id: "availability",
        label: "Add your available time",
        detail: "Hours you're reachable, for team coverage",
        href: "/dashboard/settings/availability",
        done: availability?.availability != null,
      },
    ]);
    setLoaded(true);
  }, []);

  // Re-check on every dashboard navigation: the usual way a step gets
  // completed is the user walking off to that page and coming back, and a
  // stale "0 of 5" after doing the work reads as the feature being broken.
  // The badge only lives on the main dashboard page, so there is nothing to check anywhere else.
  const onDashboardHome = pathname === "/dashboard";
  useEffect(() => {
    if (onDashboardHome) void load();
  }, [load, pathname, onDashboardHome]);

  const doneCount = steps.filter((step) => step.done).length;
  const complete = loaded && steps.length > 0 && doneCount === steps.length;

  // Nothing to nag about once every step is ticked; the badge retires itself.
  if (!onDashboardHome || !loaded || complete || isMember) return null;

  return (
    // Bottom-left, not bottom-right: several dashboard pages (Chatbot
    // Interface settings, the live widget preview panel) dock their own
    // content flush against the bottom-right corner, and this fixed badge
    // sat on top of it. Nothing else currently claims bottom-left.
    <div id="dashboard-setup-badge" className="dashboard-setup-badge fixed bottom-[calc(88px+env(safe-area-inset-bottom)+12px)] right-5 z-40 flex flex-col items-end gap-2 md:bottom-5">
      {/* A 6px black frame via padding on the outer box below, rather than a
          multi-layer background-clip trick — that technique (fill on
          padding-box, border color on border-box, both from one
          background-image) doesn't paint reliably across browsers: the
          border layer was winning over the fill and blacking out the whole
          card instead of just its edge. Plain nested boxes have no such
          ambiguity. */}
      {open && (
        <div className="dashboard-setup-panel w-[310px] overflow-hidden rounded-xl border border-white/10 bg-[#262626] shadow-[0_22px_60px_rgba(0,0,0,0.38)]">
          <div className="dashboard-setup-panel-inner overflow-hidden bg-[#262626]">
            <div className="dashboard-setup-panel-header flex items-center gap-2 border-b border-white/10 bg-[#262626] px-4 py-3.5">
              <p className="text-[13px] font-medium text-white/90">Workspace setup</p>
              <span className="dashboard-setup-count ml-auto text-[11px] text-white/70">{doneCount} of {steps.length}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Collapse setup checklist" className="dashboard-setup-close -mr-1 rounded p-1 text-white/70 transition hover:text-white">
                <X size={13} />
              </button>
            </div>

            <ol className="overflow-hidden">
              {steps.map((step, index) => (
                <li key={step.id} className="dashboard-setup-step-row border-b border-white/[0.07] last:border-b-0">
                  <Link
                    href={step.href}
                    onClick={() => setOpen(false)}
                    className="dashboard-setup-step flex items-start gap-3 px-4 py-3 transition hover:bg-white/[0.04]"
                  >
                    <span
                      className={`mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        step.done ? "bg-emerald-400/15 text-emerald-300" : "dashboard-setup-index border border-white/15 bg-transparent text-white/50"
                      }`}
                    >
                      {step.done ? <Check size={11} strokeWidth={3} /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[12.5px] font-normal text-white/85 ${step.done ? "dashboard-setup-done line-through opacity-50" : ""}`}>{step.label}</span>
                      <span className="dashboard-setup-detail mt-0.5 block text-[10.5px] leading-4 text-white/45">{step.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="dashboard-setup-trigger flex h-11 items-center gap-3 rounded-lg border border-white/10 bg-[#262626] px-3 text-[12.5px] font-normal text-white/90 shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition hover:border-white/20 hover:bg-[#2b2b2b]"
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium text-white/80" style={{ background: `conic-gradient(#86efac ${(doneCount / steps.length) * 360}deg, rgba(255,255,255,.12) 0)` }}>
          <span className="absolute inset-[3px] rounded-full bg-[#262626]" />
          <span className="relative">{doneCount}</span>
        </span>
        <span>Setup guide</span>
        <span className="text-[11px] text-white/45">{doneCount}/{steps.length}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
    </div>
  );
}
