"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, LoaderCircle, Plus, Trash2 } from "lucide-react";

export type FieldType = "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio";
export type PreChatField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  // Checkbox only: false/undefined is the classic single yes/no toggle;
  // true turns it into a checklist (its own `options`, like Dropdown/Radio)
  // where a visitor can check any number of them.
  multiple?: boolean;
};

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Input",
  email: "Email",
  phone: "Phone",
  textarea: "Long text",
  select: "Dropdown",
  radio: "Radio",
  checkbox: "Checkbox",
};

// Both option-based types need at least one option to pick from — a
// multi-select Checkbox does too, but that's opt-in per field (see
// PreChatField.multiple) rather than tied to the type itself.
const OPTION_TYPES: FieldType[] = ["select", "radio"];

function needsOptions(field: PreChatField) {
  return OPTION_TYPES.includes(field.type) || (field.type === "checkbox" && Boolean(field.multiple));
}

// The type picker only offers these for new/changed fields — email, phone,
// and radio still render correctly (email/phone back the built-in name,
// email, phone, topic fields; radio predates this simplification) but are
// no longer offered going forward, so an existing field of one of those
// types still shows its real label below rather than silently breaking.
const SELECTABLE_TYPES: FieldType[] = ["text", "textarea", "select", "checkbox"];

function slugify(label: string, existingIds: string[]) {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  if (!existingIds.includes(base)) return base;
  let index = 2;
  while (existingIds.includes(`${base}_${index}`)) index += 1;
  return `${base}_${index}`;
}

export function PreChatFormEditor({ onFieldsChange }: { onFieldsChange?: (fields: PreChatField[]) => void } = {}) {
  const [fields, setFields] = useState<PreChatField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/workspace/prechat-fields", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { fields: [] }))
      .then((data: { fields?: PreChatField[] }) => setFields(data.fields ?? []))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    onFieldsChange?.(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  function updateField(index: number, patch: Partial<PreChatField>) {
    setSaved(false);
    setFields((current) => current.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  }

  function removeField(index: number) {
    setSaved(false);
    setFields((current) => current.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    setSaved(false);
    setFields((current) => {
      const next = [...current];
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= next.length) return current;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }

  function reorderField(from: number, to: number) {
    if (from === to) return;
    setSaved(false);
    setFields((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex !== null) reorderField(dragIndex, dropIndex);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function addField() {
    setSaved(false);
    const ids = fields.map((field) => field.id);
    const id = slugify("custom field", ids);
    setFields((current) => [...current, { id, label: "New question", type: "text", required: false }]);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      for (const field of fields) {
        if (!field.label.trim()) throw new Error("Every field needs a label.");
        if (needsOptions(field) && (!field.options || field.options.filter((option) => option.trim()).length === 0)) {
          throw new Error(`"${field.label}" needs at least one option.`);
        }
      }
      const response = await fetch("/api/workspace/prechat-fields", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = (await response.json().catch(() => ({}))) as { fields?: PreChatField[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not save the form.");
      setFields(data.fields ?? fields);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the form.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[12px] text-[#687178]">
        <LoaderCircle size={15} className="mr-2 animate-spin" /> Loading form
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <FieldRow
            key={field.id}
            field={field}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            isDragging={dragIndex === index}
            isDragOver={dragOverIndex === index && dragIndex !== index}
            onChange={(patch) => updateField(index, patch)}
            onRemove={() => removeField(index)}
            onMove={(direction) => moveField(index, direction)}
            onDragStart={() => setDragIndex(index)}
            onDragEnter={() => setDragOverIndex(index)}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
            onDrop={() => handleDrop(index)}
          />
        ))}
        {fields.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#DDE4E8] bg-white px-5 py-8 text-center text-[12.5px] text-[#8A929C]">
            No fields yet — visitors will be able to start chatting without filling anything in.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={addField}
        className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-dashed border-[#c7cdd1] px-4 text-[12.5px] font-semibold text-[#3c4245] hover:bg-white"
      >
        <Plus size={14} /> Add question
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1">
          {saved && <span className="text-[12px] font-medium text-[#257A4D]">Saved</span>}
          {error && <span className="text-[12px] font-medium text-[#c63f4d]">{error}</span>}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="dashboard-prechat-save-button flex h-12 items-center gap-2 rounded-full bg-[#11120f] px-7 text-[14px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? "Saving…" : "Save form"}
        </button>
      </div>
    </div>
  );
}

function FieldRow({
  field,
  isFirst,
  isLast,
  isDragging,
  isDragOver,
  onChange,
  onRemove,
  onMove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  field: PreChatField;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onChange: (patch: Partial<PreChatField>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const isOptionType = needsOptions(field);

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={onDragEnter}
      onDrop={(event) => { event.preventDefault(); onDrop(); }}
      className={`rounded-xl border bg-white p-4 transition ${isDragging ? "opacity-40" : ""} ${isDragOver ? "dashboard-prechat-row-dragover border-[#11120f] ring-2 ring-[#11120f]/10" : "border-[#DDE4E8]"}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-2 flex shrink-0 flex-col items-center gap-1 text-[#b7bcc1]">
          <div
            draggable
            onDragStart={(event) => { event.dataTransfer.setData("text/plain", ""); event.dataTransfer.effectAllowed = "move"; onDragStart(); }}
            onDragEnd={onDragEnd}
            aria-label="Drag to reorder"
            className="cursor-grab rounded p-0.5 hover:bg-[#f0f2f3] hover:text-[#3c4245] active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </div>
          <button type="button" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up" className="rounded p-0.5 hover:bg-[#f0f2f3] disabled:opacity-30">
            <ChevronUp size={13} />
          </button>
          <button type="button" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down" className="rounded p-0.5 hover:bg-[#f0f2f3] disabled:opacity-30">
            <ChevronDown size={13} />
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={field.label}
              onChange={(event) => onChange({ label: event.target.value })}
              placeholder="Question label"
              className="h-9 min-w-[160px] flex-1 rounded-lg border border-[#DDE4E8] px-3 text-[13px] outline-none focus:border-[#11120f]"
            />
            <select
              value={field.type}
              onChange={(event) => {
                const type = event.target.value as FieldType;
                onChange({ type, options: OPTION_TYPES.includes(type) ? field.options ?? [""] : undefined });
              }}
              className="h-9 rounded-lg border border-[#DDE4E8] bg-white px-2.5 text-[12.5px] font-medium outline-none focus:border-[#11120f]"
            >
              {!SELECTABLE_TYPES.includes(field.type) && (
                <option value={field.type}>{TYPE_LABELS[field.type]}</option>
              )}
              {SELECTABLE_TYPES.map((type) => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
            <label className="flex h-9 items-center gap-1.5 rounded-lg border border-[#DDE4E8] px-2.5 text-[12px] font-medium text-[#3c4245]">
              <input type="checkbox" checked={field.required} onChange={(event) => onChange({ required: event.target.checked })} className="h-3.5 w-3.5" />
              Required
            </label>
            {field.type === "checkbox" && (
              <label className="flex h-9 items-center gap-1.5 rounded-lg border border-[#DDE4E8] px-2.5 text-[12px] font-medium text-[#3c4245]">
                <input
                  type="checkbox"
                  checked={Boolean(field.multiple)}
                  onChange={(event) => onChange({ multiple: event.target.checked, options: event.target.checked ? field.options ?? [""] : undefined })}
                  className="h-3.5 w-3.5"
                />
                Allow multiple
              </label>
            )}
            <button type="button" onClick={onRemove} aria-label="Remove question" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#a5414b] hover:bg-[#fff2f3]">
              <Trash2 size={14} />
            </button>
          </div>

          {isOptionType && (
            <OptionListEditor
              options={field.options ?? [""]}
              typeLabel={TYPE_LABELS[field.type]}
              onChange={(options) => onChange({ options })}
            />
          )}

          <p className="text-[10.5px] text-[#9aa1a6]">Stored as “{field.id}”{["name", "email", "phone", "topic"].includes(field.id) && " — fills the built-in contact field"}</p>
        </div>
      </div>
    </div>
  );
}

function OptionListEditor({
  options,
  typeLabel,
  onChange,
}: {
  options: string[];
  typeLabel: string;
  onChange: (options: string[]) => void;
}) {
  function updateOption(index: number, value: string) {
    onChange(options.map((option, i) => (i === index ? value : option)));
  }

  function addOption() {
    onChange([...options, ""]);
  }

  function removeOption(index: number) {
    onChange(options.length > 1 ? options.filter((_, i) => i !== index) : options);
  }

  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#8a9298]">{typeLabel} options</p>
      <div className="space-y-1.5">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
              className="h-9 w-full min-w-0 flex-1 rounded-lg border border-[#DDE4E8] px-3 text-[13px] outline-none focus:border-[#11120f]"
            />
            {options.length > 1 && (
              <button type="button" onClick={() => removeOption(index)} aria-label="Remove option" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#a5414b] hover:bg-[#fff2f3]">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addOption} className="mt-1.5 flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-[#c7cdd1] px-3 text-[11.5px] font-semibold text-[#3c4245] hover:bg-[#f7f8f8]">
        <Plus size={12} /> Add option
      </button>
    </div>
  );
}
