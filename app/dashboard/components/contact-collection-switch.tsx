"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { PreChatField } from "@/app/dashboard/components/prechat-form-editor";

type ContactCollection = "chat" | "off";

const NAME_FIELD: PreChatField = { id: "name", label: "Name", type: "text", required: true };
const PHONE_FIELD: PreChatField = { id: "phone", label: "Phone number", type: "phone", required: true };

export function ContactCollectionSwitch({ onFieldsChange }: { onFieldsChange?: (fields: PreChatField[]) => void }) {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [namePhoneEnabled, setNamePhoneEnabled] = useState(false);
  const [fields, setFields] = useState<PreChatField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"email" | "name-phone" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/contact-collection", { cache: "no-store" }).then((response) =>
        response.ok ? response.json() : { contactCollection: "chat" },
      ),
      fetch("/api/workspace/prechat-fields", { cache: "no-store" }).then((response) =>
        response.ok ? response.json() : { fields: [] },
      ),
    ])
      .then(([contactData, fieldData]: [{ contactCollection?: ContactCollection }, { fields?: PreChatField[] }]) => {
        const storedFields = fieldData.fields ?? [];
        // Email is managed by its own in-chat switch now, so remove the old
        // pre-chat email field while leaving custom questions untouched.
        const loadedFields = storedFields.filter((field) => field.id !== "email");
        setEmailEnabled(contactData.contactCollection !== "off");
        setNamePhoneEnabled(loadedFields.some((field) => field.id === "name" || field.id === "phone"));
        setFields(loadedFields);
        onFieldsChange?.(loadedFields);
        if (loadedFields.length !== storedFields.length) {
          void fetch("/api/workspace/prechat-fields", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ fields: loadedFields }),
          });
        }
      })
      .catch(() => setError("Could not load contact settings."))
      .finally(() => setLoading(false));
    // Loaded once; onFieldsChange is a setter from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleEmail(enabled: boolean) {
    const previous = emailEnabled;
    setEmailEnabled(enabled);
    setSaving("email");
    setError(null);
    const response = await fetch("/api/workspace/contact-collection", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactCollection: enabled ? "chat" : "off" }),
    }).catch(() => null);
    setSaving(null);
    if (!response?.ok) {
      setEmailEnabled(previous);
      setError("Could not save. Try again.");
    }
  }

  async function toggleNamePhone(enabled: boolean) {
    const previousEnabled = namePhoneEnabled;
    const previousFields = fields;
    const contactIds = new Set(["name", "phone"]);
    const remaining = fields.filter((field) => !contactIds.has(field.id));
    const nextFields = enabled ? [NAME_FIELD, PHONE_FIELD, ...remaining] : remaining;

    setNamePhoneEnabled(enabled);
    setFields(nextFields);
    onFieldsChange?.(nextFields);
    setSaving("name-phone");
    setError(null);
    const response = await fetch("/api/workspace/prechat-fields", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields: nextFields }),
    }).catch(() => null);
    setSaving(null);
    if (!response?.ok) {
      setNamePhoneEnabled(previousEnabled);
      setFields(previousFields);
      onFieldsChange?.(previousFields);
      setError("Could not save. Try again.");
    }
  }

  return (
    <div>
      <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
        <SettingRow
          title="Ask for email"
          description="Ask visitors for an email address after the conversation starts."
          checked={emailEnabled}
          disabled={loading || saving !== null}
          onCheckedChange={toggleEmail}
        />
        <SettingRow
          title="Ask for name and phone"
          description="Show name and phone fields before a visitor starts chatting."
          checked={namePhoneEnabled}
          disabled={loading || saving !== null}
          onCheckedChange={toggleNamePhone}
        />
      </div>
      {error && <p className="mt-2 text-[11.5px] text-[#c0554f]">{error}</p>}
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-5 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white">{title}</p>
        <p className="mt-0.5 text-[11.5px] leading-4 text-white/80">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={title}
        className="data-[checked]:bg-[#27895d]"
      />
    </div>
  );
}
