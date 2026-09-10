"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, X } from "lucide-react";

type Step = { id: string; label: string; detail: string; href: string; done: boolean };

type PersonaResult = { persona?: { aiName?: string; aiPersona?: string | null } | null };
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
        // The stock name alone isn't a setup: it's what every workspace
        // starts with. Either renaming it or writing a persona counts.
        done: Boolean(persona?.persona && (persona.persona.aiPersona?.trim() || (persona.persona.aiName && persona.persona.aiName !== "Elpino AI"))),
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
  useEffect(() => {
    void load();
  }, [load, pathname]);

  const doneCount = steps.filter((step) => step.done).length;
  const complete = loaded && steps.length > 0 && doneCount === steps.length;

  // Nothing to nag about once every step is ticked; the badge retires itself.
  if (!loaded || complete) return null;

  return (
    // Bottom-left, not bottom-right: several dashboard pages (Chatbot
    // Interface settings, the live widget preview panel) dock their own
    // content flush against the bottom-right corner, and this fixed badge
    // sat on top of it. Nothing else currently claims bottom-left.
    <div className="dashboard-setup-badge fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      {/* A 6px black frame via padding on the outer box below, rather than a
          multi-layer background-clip trick — that technique (fill on
          padding-box, border color on border-box, both from one
          background-image) doesn't paint reliably across browsers: the
          border layer was winning over the fill and blacking out the whole
          card instead of just its edge. Plain nested boxes have no such
          ambiguity. */}
      {open && (
        <div className="dashboard-setup-panel w-[290px] rounded-lg bg-black p-[6px] shadow-[0_18px_44px_-18px_rgba(15,18,22,0.5)]">
          <div className="dashboard-setup-panel-inner overflow-hidden rounded-[10px] bg-white">
            <div className="dashboard-setup-panel-header flex items-center gap-2 bg-black px-3.5 py-3">
              <p className="text-[12.5px] font-semibold text-white">Finish setting up</p>
              <span className="dashboard-setup-count ml-auto text-[11px] text-white/70">{doneCount} of {steps.length}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Collapse setup checklist" className="dashboard-setup-close -mr-1 rounded p-1 text-white/70 transition hover:text-white">
                <X size={13} />
              </button>
            </div>

            <ol className="overflow-hidden rounded-2xl">
              {steps.map((step, index) => (
                <li key={step.id} className="dashboard-setup-step-row border-y border-black/[0.07] first:border-t-0 last:border-b-0 [&+li]:border-t-0">
                  <Link
                    href={step.href}
                    onClick={() => setOpen(false)}
                    className="dashboard-setup-step flex items-start gap-2.5 px-3.5 py-2.5 transition hover:bg-[#f5f7f8]"
                  >
                    <span
                      className={`mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        step.done ? "bg-[#32a880] text-white" : "dashboard-setup-index bg-[#EDF0F1] text-[#6B757B]"
                      }`}
                    >
                      {step.done ? <Check size={11} strokeWidth={3} /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[12.5px] font-medium ${step.done ? "dashboard-setup-done line-through opacity-55" : ""}`}>{step.label}</span>
                      <span className="dashboard-setup-detail mt-0.5 block text-[10.5px] leading-4 text-[#8A9397]">{step.detail}</span>
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
        className="dashboard-setup-trigger flex h-9 items-center gap-2 rounded-full border border-black/15 bg-white pl-2 pr-3 text-[12px] font-semibold shadow-[0_10px_26px_-14px_rgba(15,18,22,0.6)] transition hover:shadow-[0_14px_30px_-14px_rgba(15,18,22,0.7)]"
      >
        Setup {doneCount}/{steps.length}
        <ChevronDown size={13} className={`transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
    </div>
  );
}
