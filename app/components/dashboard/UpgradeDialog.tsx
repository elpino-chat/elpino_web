"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { UpgradeSettingsPage } from "@/app/dashboard/settings/settings-client";

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
