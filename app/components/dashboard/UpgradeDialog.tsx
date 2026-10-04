"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { UpgradeSettingsPage } from "@/app/dashboard/settings/settings-client";
import { plansOpenIn, withPlansParam } from "./upgrade-url";

/**
 * Open/closed state for the plan picker, kept in step with the address bar (?plans=open).
 * - Opening pushes that address, so Back closes the picker.
 * - Closing from the picker's own button or Esc steps back if it was the picker that added the entry.
 * - Opening a link that already has ?plans=open, or refreshing, starts with the picker open.
 */
export function useUpgradeDialog(): [boolean, (open: boolean) => void] {
  const [open, setOpenState] = useState(false);
  // True while the current history entry is one this hook added, so closing can step back instead of leaving a dead entry.
  const pushedRef = useRef(false);

  useEffect(() => {
    // The address is only readable in the browser, so a deep link is picked up after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (plansOpenIn(window.location.search)) setOpenState(true);
    function onPopState() {
      const wanted = plansOpenIn(window.location.search);
      if (!wanted) pushedRef.current = false;
      setOpenState(wanted);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setOpen = useCallback((next: boolean) => {
    if (next) {
      if (!plansOpenIn(window.location.search)) {
        window.history.pushState(null, "", withPlansParam(window.location.href, true));
        pushedRef.current = true;
      }
      setOpenState(true);
      return;
    }
    if (plansOpenIn(window.location.search)) {
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back(); // the popstate handler above closes it
        return;
      }
      // A deep link or a refresh: there is no earlier entry of ours to step back to, so just tidy the address.
      window.history.replaceState(null, "", withPlansParam(window.location.href, false));
    }
    setOpenState(false);
  }, []);

  return [open, setOpen];
}

export function UpgradeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dashboard-settings-surface fixed inset-0 z-[110] flex flex-col overflow-y-auto" role="dialog" aria-modal="true" aria-label="Upgrade your plan">
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-end px-5 pt-5 sm:px-8">
        <button type="button" onClick={onClose} aria-label="Close" className="dashboard-upgrade-dialog-close flex h-9 w-9 items-center justify-center rounded-lg transition">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 pb-10">
        <UpgradeSettingsPage />
      </div>
    </div>
  );
}
