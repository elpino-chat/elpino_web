"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Download, Lock, LoaderCircle, Mail, MessageSquare, Phone, Plus, RefreshCw, Search, User, Users, X } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  sourceCount: number;
  customerIds: string[];
  customFields: Record<string, string>;
  status?: string;
  tags?: string[];
};

const STATUSES = [
  { value: "new", label: "New" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
] as const;
const MAX_TAGS = 10;

const statusLabel = (status?: string) => STATUSES.find((item) => item.value === status)?.label ?? "New";

type ContactSession = {
  id: string;
  topic: string | null;
  status: "open" | "waiting" | "resolved";
  handledBy: "ai" | "human";
  preview: string;
  time: string;
};

type SessionMessage = {
  id: string;
  senderType: string;
  senderId: string | null;
  body: string;
  createdAt: string;
};

export function ContactsClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openContact, setOpenContact] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contacts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { contacts: [] }))
      .then((data: { contacts?: Contact[]; upgradeRequired?: true; error?: string }) => {
        setContacts(data.contacts ?? []);
        setUpgradeRequired(data.upgradeRequired ? (data.error ?? "Customer profiles are not included on your current plan.") : null);
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((contact) =>
      (statusFilter === "all" || (contact.status ?? "new") === statusFilter) &&
      (!q ||
        contact.name.toLowerCase().includes(q) ||
        (contact.email ?? "").toLowerCase().includes(q) ||
        (contact.phone ?? "").toLowerCase().includes(q) ||
        (contact.tags ?? []).some((tag) => tag.toLowerCase().includes(q))),
    );
  }, [contacts, query, statusFilter]);

  function updateContact(next: Contact) {
    setContacts((current) => current.map((contact) => (contact.id === next.id ? next : contact)));
    setOpenContact(next);
  }

  async function refreshContacts() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/contacts", { cache: "no-store" });
      const data = response.ok ? await response.json() as { contacts?: Contact[]; upgradeRequired?: true; error?: string } : { contacts: [] };
      setContacts(data.contacts ?? []);
      setUpgradeRequired(data.upgradeRequired ? (data.error ?? "Customer profiles are not included on your current plan.") : null);
    } finally {
      setRefreshing(false);
    }
  }

  async function downloadXlsx() {
    const XLSX = await import("xlsx");
    const rows = filtered.map((contact) => ({
      Name: contact.name,
      Email: contact.email ?? "",
      Phone: contact.phone ?? "",
      "First seen": new Date(contact.createdAt),
      "Last updated": new Date(contact.updatedAt),
      Status: statusLabel(contact.status),
      Tags: (contact.tags ?? []).join(", "),
      Sessions: contact.sourceCount,
      "Custom fields": Object.entries(contact.customFields).map(([key, value]) => `${key}: ${value}`).join("; "),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows, { cellDates: true });
    sheet["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 24 }, { wch: 10 }, { wch: 38 }];
    if (sheet["!ref"]) sheet["!autofilter"] = { ref: sheet["!ref"] };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
    XLSX.writeFile(workbook, `contacts-${new Date().toISOString().slice(0, 10)}.xlsx`, { compression: true });
  }

  return (
    <div id="dashboard-contacts-page" className="ct-page relative flex h-full min-h-0 flex-col overflow-hidden">
      <main className="dashboard-page-surface ct-main flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-[1000px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="ct-h text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">Contacts</h1>
              <p className="ct-t mt-1.5 text-[15px] leading-6">People who left their details through your website widget.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => void downloadXlsx()} disabled={filtered.length === 0} className="ct-btn flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40">
                <Download size={15} /> <span className="hidden sm:inline">Download</span> XLSX
              </button>
              <button type="button" onClick={() => void refreshContacts()} disabled={refreshing} aria-label="Refresh" className="ct-btn flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition disabled:opacity-50">
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <label className="ct-search ct-field flex h-11 w-full max-w-md items-center gap-2.5 rounded-full border px-4">
              <Search size={15} className="ct-t shrink-0" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email or phone"
                aria-label="Search contacts"
                className="ct-input min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
              />
            </label>
            <p className="ct-t text-[14px]">{loading ? "Loading…" : `${filtered.length} contact${filtered.length === 1 ? "" : "s"}`}</p>
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ value: "all", label: "All" }, ...STATUSES].map((item) => (
              <button key={item.value} type="button" onClick={() => setStatusFilter(item.value)} aria-pressed={statusFilter === item.value} className={`ct-pill h-8 shrink-0 cursor-pointer rounded-full border px-3.5 text-[13.5px] font-medium transition ${statusFilter === item.value ? "ct-pill-on" : ""}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {loading ? (
              <p className="ct-t flex items-center justify-center gap-2 py-16 text-[14.5px]"><LoaderCircle size={15} className="animate-spin" /> Loading contacts</p>
            ) : upgradeRequired ? (
              <UpgradeRequired message={upgradeRequired} />
            ) : filtered.length === 0 ? (
              <EmptyState searching={query.trim().length > 0} />
            ) : (
              <>
                {/* A table has no honest way to fit a phone — below md it becomes stacked rows, same tap-to-open either way. */}
                <ul className="ct-list overflow-hidden rounded-2xl border md:hidden">
                  {filtered.map((contact) => (
                    <li key={contact.id} className="ct-divide border-t first:border-t-0">
                      <button type="button" onClick={() => setOpenContact(contact)} className="ct-row flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left">
                        <span className="ct-avatar flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">{initials(contact.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="ct-h block truncate text-[15px] font-medium">{contact.name}</span>
                          <span className="ct-t block truncate text-[13.5px]">{contact.email ?? contact.phone ?? "No contact details"}</span>
                        </span>
                        <span className="ct-chip shrink-0 rounded-full border px-2.5 py-0.5 text-[12.5px] font-medium">{statusLabel(contact.status)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="ct-list hidden overflow-hidden rounded-2xl border md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="ct-divide border-b text-[13px]">
                        <th className="ct-t px-5 py-3 font-medium">Name</th>
                        <th className="ct-t px-4 py-3 font-medium">Email</th>
                        <th className="ct-t px-4 py-3 font-medium">Phone</th>
                        <th className="ct-t px-4 py-3 font-medium">Status</th>
                        <th className="ct-t px-4 py-3 font-medium">Tags</th>
                        <th className="ct-t px-4 py-3 font-medium">First seen</th>
                        <th className="ct-t px-5 py-3 text-right font-medium">Chats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((contact) => (
                        <tr key={contact.id} onClick={() => setOpenContact(contact)} className="ct-row ct-divide cursor-pointer border-t first:border-t-0">
                          <td className="px-5 py-3">
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="ct-avatar flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">{initials(contact.name)}</span>
                              <span className="ct-h truncate text-[15px] font-medium">{contact.name}</span>
                            </span>
                          </td>
                          <td className="ct-t px-4 py-3 text-[14.5px]">{contact.email ?? <span className="ct-faint">—</span>}</td>
                          <td className="ct-t px-4 py-3 text-[14.5px]">{contact.phone ?? <span className="ct-faint">—</span>}</td>
                          <td className="px-4 py-3"><span className="ct-chip rounded-full border px-2.5 py-0.5 text-[13px] font-medium">{statusLabel(contact.status)}</span></td>
                          <td className="px-4 py-3">
                            <span className="flex flex-wrap gap-1">
                              {(contact.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="ct-chip max-w-[110px] truncate rounded-full border px-2.5 py-0.5 text-[13px]">{tag}</span>)}
                              {(contact.tags ?? []).length > 2 && <span className="ct-t text-[13px]">+{(contact.tags ?? []).length - 2}</span>}
                              {!(contact.tags ?? []).length && <span className="ct-faint">—</span>}
                            </span>
                          </td>
                          <td className="ct-t px-4 py-3 text-[14.5px]">{new Date(contact.createdAt).toLocaleDateString()}</td>
                          <td className="ct-t px-5 py-3 text-right text-[14.5px]">{contact.sourceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {openContact && <ContactDialog contact={openContact} onChange={updateContact} onClose={() => setOpenContact(null)} />}
    </div>
  );
}

function ContactDialog({ contact, onChange, onClose }: { contact: Contact; onChange: (contact: Contact) => void; onClose: () => void }) {
  const [sessions, setSessions] = useState<ContactSession[] | null>(null);
  const [activeSession, setActiveSession] = useState<ContactSession | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function saveLabels(changes: { status?: string; tags?: string[] }) {
    const previous = contact;
    onChange({ ...contact, ...changes });
    setSaveError(null);
    const response = await fetch(`/api/contacts/${encodeURIComponent(contact.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes) }).catch(() => null);
    if (!response?.ok) {
      onChange(previous);
      setSaveError("Could not save that change. Try again.");
    }
  }

  function addTag() {
    const tag = tagDraft.trim().replace(/;/g, " ").slice(0, 30);
    setTagDraft("");
    const tags = contact.tags ?? [];
    if (!tag || tags.length >= MAX_TAGS || tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
    void saveLabels({ tags: [...tags, tag] });
  }

  useEffect(() => {
    setSessions(null);
    setActiveSession(null);
    const params = new URLSearchParams({ contactId: contact.id, customerIds: contact.customerIds.join(",") });
    fetch(`/api/contacts/sessions?${params.toString()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { sessions: [] }))
      .then((data: { sessions?: ContactSession[] }) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]));
  }, [contact.id, contact.customerIds]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const latestTopic = sessions?.find((session) => session.topic)?.topic ?? null;
  const customFields = Object.entries(contact.customFields);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Contact details" className="ct-dialog flex max-h-[min(720px,calc(100dvh-32px))] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        {activeSession ? (
          <SessionThread session={activeSession} onBack={() => setActiveSession(null)} onClose={onClose} />
        ) : (
          <>
            <div className="ct-divide flex shrink-0 items-start justify-between gap-3 border-b px-6 py-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="ct-avatar flex size-12 shrink-0 items-center justify-center rounded-full text-[16px] font-semibold">{initials(contact.name)}</span>
                <div className="min-w-0">
                  <h2 className="ct-h truncate text-[19px] font-semibold tracking-[-0.02em]">{contact.name}</h2>
                  <p className="ct-t mt-0.5 text-[14px]">
                    First seen {new Date(contact.createdAt).toLocaleDateString()}
                    {contact.sourceCount > 1 && ` · ${contact.sourceCount} chats merged`}
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="ct-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-2.5">
                <div className="ct-box flex items-center gap-3 rounded-xl border px-4 py-3">
                  <Mail size={15} className="ct-t shrink-0" />
                  <span className="ct-h truncate text-[14.5px]">{contact.email ?? <span className="ct-faint">No email on file</span>}</span>
                </div>
                <div className="ct-box flex items-center gap-3 rounded-xl border px-4 py-3">
                  <Phone size={15} className="ct-t shrink-0" />
                  <span className="ct-h truncate text-[14.5px]">{contact.phone ?? <span className="ct-faint">No phone on file</span>}</span>
                </div>
              </div>

              <h3 className="ct-h mt-6 text-[15px] font-semibold">Status</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button key={item.value} type="button" onClick={() => void saveLabels({ status: item.value })} aria-pressed={(contact.status ?? "new") === item.value} className={`ct-pill h-9 cursor-pointer rounded-full border px-4 text-[14px] font-medium transition ${(contact.status ?? "new") === item.value ? "ct-pill-on" : ""}`}>
                    {item.label}
                  </button>
                ))}
              </div>

              <h3 className="ct-h mt-6 text-[15px] font-semibold">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(contact.tags ?? []).map((tag) => (
                  <span key={tag} className="ct-chip flex items-center gap-1 rounded-full border py-1 pl-3 pr-1.5 text-[14px]">
                    {tag}
                    <button type="button" onClick={() => void saveLabels({ tags: (contact.tags ?? []).filter((item) => item !== tag) })} aria-label={`Remove ${tag}`} className="ct-close flex size-5 cursor-pointer items-center justify-center rounded-full"><X size={12} /></button>
                  </span>
                ))}
                {(contact.tags ?? []).length < MAX_TAGS && (
                  <form onSubmit={(event) => { event.preventDefault(); addTag(); }} className="ct-field flex h-8 items-center gap-1.5 rounded-full border pl-3 pr-1">
                    <input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} placeholder="Add a tag" aria-label="Add a tag" maxLength={30} className="ct-input w-24 bg-transparent text-[14px] outline-none" />
                    <button type="submit" aria-label="Add tag" disabled={!tagDraft.trim()} className="ct-close flex size-6 cursor-pointer items-center justify-center rounded-full disabled:opacity-40"><Plus size={14} /></button>
                  </form>
                )}
              </div>
              {saveError && <p role="alert" className="mt-2 text-[13.5px] font-medium text-[#e5636f]">{saveError}</p>}

              <h3 className="ct-h mt-6 text-[15px] font-semibold">What they asked about</h3>
              {latestTopic ? (
                <span className="ct-chip mt-2 inline-flex max-w-full items-center truncate rounded-full border px-3 py-1 text-[13.5px] font-medium">{latestTopic}</span>
              ) : (
                <p className="ct-t mt-1.5 text-[14px]">No topic recorded.</p>
              )}

              {customFields.length > 0 && (
                <>
                  <h3 className="ct-h mt-6 text-[15px] font-semibold">Other details</h3>
                  <div className="mt-2 space-y-2.5">
                    {customFields.map(([key, value]) => (
                      <div key={key} className="ct-box rounded-xl border px-4 py-2.5">
                        <p className="ct-t text-[13px]">{key}</p>
                        <p className="ct-h truncate text-[14.5px]">{value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h3 className="ct-h mt-6 text-[15px] font-semibold">Recent chats</h3>
              {sessions === null ? (
                <p className="ct-t flex items-center gap-2 py-5 text-[14px]"><LoaderCircle size={14} className="animate-spin" /> Loading chats</p>
              ) : sessions.length === 0 ? (
                <p className="ct-t mt-1.5 text-[14px]">No chats yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {sessions.map((session) => (
                    <button key={session.id} type="button" onClick={() => setActiveSession(session)} className="ct-box ct-row flex w-full cursor-pointer flex-col gap-1.5 rounded-xl border px-4 py-3 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <HandledByBadge handledBy={session.handledBy} />
                          {session.topic && <span className="ct-h truncate text-[14px] font-medium">{session.topic}</span>}
                        </span>
                        <span className="ct-t shrink-0 text-[13px]">{new Date(session.time).toLocaleDateString()}</span>
                      </div>
                      <p className="ct-t truncate text-[14px]">{session.preview || "No messages yet"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HandledByBadge({ handledBy }: { handledBy: "ai" | "human" }) {
  return (
    <span className="ct-chip flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium">
      {handledBy === "ai" ? <Bot size={12} /> : <User size={12} />} {handledBy === "ai" ? "AI" : "Team"}
    </span>
  );
}

function SessionThread({ session, onBack, onClose }: { session: ContactSession; onBack: () => void; onClose: () => void }) {
  const [messages, setMessages] = useState<SessionMessage[] | null>(null);

  useEffect(() => {
    setMessages(null);
    fetch(`/api/contacts/sessions/${encodeURIComponent(session.id)}/messages`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { messages: [] }))
      .then((data: { messages?: SessionMessage[] }) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  }, [session.id]);

  return (
    <>
      <div className="ct-divide flex shrink-0 items-center gap-3 border-b px-4 py-4">
        <button type="button" onClick={onBack} aria-label="Back" className="ct-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><ArrowLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <HandledByBadge handledBy={session.handledBy} />
            <h2 className="ct-h truncate text-[16px] font-semibold">{session.topic ?? "Chat"}</h2>
          </div>
          <p className="ct-t mt-0.5 text-[13px]">{new Date(session.time).toLocaleString()}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="ct-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
      </div>

      <div className="min-h-[220px] flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages === null ? (
          <p className="ct-t flex items-center justify-center gap-2 py-10 text-[14px]"><LoaderCircle size={14} className="animate-spin" /> Loading messages</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <MessageSquare size={20} className="ct-t" />
            <p className="ct-t mt-2 text-[14px]">No messages in this chat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const fromCustomer = message.senderType === "customer";
              return (
                <div key={message.id} className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-6 ${fromCustomer ? "ct-bubble-in" : "ct-bubble-out"}`}>
                    {!fromCustomer && <p className="mb-0.5 text-[12px] font-semibold opacity-70">{message.senderType === "ai" ? "AI" : "Team"}</p>}
                    <p>{message.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      <span className="ct-icon flex size-12 items-center justify-center rounded-xl"><Users size={22} /></span>
      <p className="ct-h mt-4 text-[17px] font-semibold">{searching ? "No contacts match that search" : "No contacts yet"}</p>
      <p className="ct-t mt-1.5 max-w-sm text-[14.5px] leading-6">
        {searching ? "Try a different name, email or phone number." : "Contacts appear here once a visitor shares their name and email or phone in your chat widget."}
      </p>
    </div>
  );
}

function UpgradeRequired({ message }: { message: string }) {
  return (
    <div className="ct-list flex min-h-[320px] flex-col items-center justify-center rounded-2xl border px-6 text-center">
      <span className="ct-icon flex size-12 items-center justify-center rounded-xl"><Lock size={22} /></span>
      <p className="ct-h mt-4 text-[17px] font-semibold">Upgrade to unlock customer profiles</p>
      <p className="ct-t mt-1.5 max-w-sm text-[14.5px] leading-6">{message}</p>
      <Link href="/dashboard/settings/billing?plans=open" className="ct-btn mt-5 flex h-11 items-center gap-2 rounded-full border px-6 text-[15px] font-medium transition">View plans</Link>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
