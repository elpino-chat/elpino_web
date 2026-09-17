"use client";

import { useEffect, useState } from "react";

type ContactCollection = "chat" | "off";

const OPTIONS: { value: ContactCollection; label: string; description: string }[] = [
  { value: "chat", label: "During chat", description: "After the AI's first reply, a small popup asks for an email, then a phone number if the form below has a phone field." },
  { value: "off", label: "Off", description: "Never ask. Visitors can still share details in the chat themselves." },
];

/**
 * "Collect contact details" for the widget. Saves on change and reverts if
 * the save fails. `onChange` lets the settings page hide the fields that
 * only matter while collection is on.
 */
export function ContactCollectionSwitch({ onChange }: { onChange?: (value: ContactCollection) => void }) {
  const [value, setValue] = useState<ContactCollection | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace/contact-collection", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { contactCollection: "chat" }))
      .then((data: { contactCollection?: ContactCollection }) => {
        const loaded = data.contactCollection === "off" ? "off" : "chat";
        setValue(loaded);
        onChange?.(loaded);
      })
      .catch(() => { setValue("chat"); onChange?.("chat"); });
    // Loaded once; onChange is a setter from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose(next: ContactCollection) {
    if (value === null || next === value || saving) return;
    const previous = value;
    setValue(next);
    onChange?.(next);
    setSaving(true);
    setError(null);
    const response = await fetch("/api/workspace/contact-collection", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactCollection: next }),
    }).catch(() => null);
    setSaving(false);
    if (!response?.ok) {
      setValue(previous);
      onChange?.(previous);
      setError("Could not save. Try again.");
    }
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Collect contact details" className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={value === null || saving}
              onClick={() => void choose(option.value)}
              className={`rounded-xl border p-3.5 text-left transition disabled:cursor-wait ${selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 hover:border-white/20"}`}
            >
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${selected ? "border-white" : "border-white/40"}`}>
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                {option.label}
              </span>
              <span className="mt-1.5 block text-[11.5px] leading-4 text-[#8a9298]">{option.description}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-[11.5px] text-[#c0554f]">{error}</p>}
    </div>
  );
}
