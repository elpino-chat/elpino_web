"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Download, LifeBuoy, Lightbulb, Lock, LoaderCircle, Mail, MessageSquare, Phone, RefreshCw, Search, User, Users, X } from "lucide-react";
import { useMobileDrawer } from "@/app/components/dashboard/mobile-drawer-context";

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
};

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
  const { open: toolsOpen, setOpen: setToolsOpen } = useMobileDrawer();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
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
    if (!q) return contacts;
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(q) ||
      (contact.email ?? "").toLowerCase().includes(q) ||
      (contact.phone ?? "").toLowerCase().includes(q),
    );
  }, [contacts, query]);

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
      Sessions: contact.sourceCount,
      "Custom fields": Object.entries(contact.customFields).map(([key, value]) => `${key}: ${value}`).join("; "),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows, { cellDates: true });
    sheet["!cols"] = [{ wch: 24 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 38 }];
    if (sheet["!ref"]) sheet["!autofilter"] = { ref: sheet["!ref"] };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
    XLSX.writeFile(workbook, `contacts-${new Date().toISOString().slice(0, 10)}.xlsx`, { compression: true });
  }

  return (
    <div id="dashboard-contacts-page" className="dashboard-contacts-shell relative flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
      <main className="dashboard-page-surface dashboard-contacts-main-surface flex min-h-0 flex-1 flex-col overflow-hidden bg-[#262626] shadow-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="shrink-0 border-b border-white/10 px-6 py-7 lg:px-10">
          <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/40">People</p>
          <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white/95">Contacts</h1>
          <p className="mt-2 text-sm text-white/45">People who left their details through your website widget</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="dashboard-contacts-search flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3">
              <Search size={14} className="text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search contacts"
                className="w-full bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/35"
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void downloadXlsx()} disabled={filtered.length === 0} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-normal text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
                <Download size={15} /> Download XLSX
              </button>
              <button type="button" onClick={() => void refreshContacts()} disabled={refreshing} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-normal text-white/70 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50">
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74787c]">
            {loading ? "Loading…" : `${filtered.length} contact${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[12px] text-[#687178]">
              <LoaderCircle size={15} className="mr-2 animate-spin" /> Loading contacts
            </div>
          ) : upgradeRequired ? (
            <UpgradeRequired message={upgradeRequired} />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* A 5-column table has no honest way to fit a phone screen —
                  below md this becomes a stacked card list instead, same
                  tap-to-open-details behavior either way. */}
              <div className="divide-y divide-white/[0.07] md:hidden">
                {filtered.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setOpenContact(contact)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.04]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF0F5] text-[11px] font-semibold text-[#2b5b82]">
                      {initials(contact.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-white/90">{contact.name}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-white/45">
                        {contact.email ?? contact.phone ?? "No contact details"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-white/35">{contact.sourceCount} session{contact.sourceCount === 1 ? "" : "s"}</span>
                  </button>
                ))}
              </div>
              <table className="dashboard-contacts-table hidden w-full border-collapse text-left text-[14px] md:table">
                <thead className="sticky top-0 z-[1] bg-[#292a2b]">
                  <tr className="border-b border-[#eceeef] text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#8a9298]">
                    <th className="px-6 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">Phone</th>
                    <th className="px-4 py-3 font-bold">First seen</th>
                    <th className="px-4 py-3 font-bold">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setOpenContact(contact)}
                      className="cursor-pointer border-b border-white/[0.07] transition hover:bg-white/[0.04]"
                    >
                      <td className="px-6 py-3">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF0F5] text-[11px] font-semibold text-[#2b5b82]">
                            {initials(contact.name)}
                          </span>
                          <span className="truncate font-medium text-black">{contact.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-black">{contact.email ?? <span className="text-[#a5acb0]">—</span>}</td>
                      <td className="px-4 py-3 text-black">{contact.phone ?? <span className="text-[#a5acb0]">—</span>}</td>
                      <td className="px-4 py-3 text-black">{new Date(contact.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-black">{contact.sourceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>

      {/* Kept mounted (not `hidden`) below lg so the slide has something to
          animate — see SpacePanel.tsx for the same trick and why. This one
          slides from the right, matching where it docks at lg+. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${toolsOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setToolsOpen(false)}
      />
      <aside
        id="dashboard-contacts-tools"
        className={`dashboard-secondary-sidebar dashboard-contacts-tools fixed inset-y-0 right-0 z-50 flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-l border-white/10 bg-[#262626] shadow-[-8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-[320px] lg:translate-x-0 lg:shadow-none ${
          toolsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden">
          <p className="text-[13px] font-medium text-white/80">Resources</p>
          <button
            type="button"
            onClick={() => setToolsOpen(false)}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.07]"
          >
            <X size={17} />
          </button>
        </div>
        <div className="space-y-3 p-3">
          <div className="dashboard-contact-tool-card min-h-44 rounded-xl border border-white/10 bg-[#262626] p-[2.5px]">
            <div className="flex h-full flex-col justify-between rounded-[9px] bg-[#262626] p-4">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F5]"><LifeBuoy size={18} color="#2b5b82" /></span>
                <h3 className="mt-2.5 text-[15px] font-semibold text-white/90">Need help?</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/60">Questions about contacts or widget data? We're happy to help.</p>
              </div>
              <Link href="/contact" className="mt-4 flex h-8 w-fit items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-3.5 text-[12.5px] font-normal text-white/90 transition hover:bg-white/[0.06]">
                Contact support
              </Link>
            </div>
          </div>

          <div className="dashboard-contact-tool-card min-h-44 rounded-xl border border-white/10 bg-[#262626] p-4">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FDF0E4]"><Lightbulb size={18} color="#B8621B" /></span>
                <h3 className="mt-2.5 text-[15px] font-semibold text-white/90">Request a feature</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/60">Missing something in Contacts? Tell us what you'd like to see next.</p>
              </div>
              <Link href="/contact" className="mt-4 flex h-8 w-fit items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-3.5 text-[12.5px] font-normal text-white/90 transition hover:bg-white/[0.06]">
                Send feedback
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {openContact && <ContactPanel contact={openContact} onClose={() => setOpenContact(null)} />}
    </div>
  );
}

function ContactPanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [sessions, setSessions] = useState<ContactSession[] | null>(null);
  const [activeSession, setActiveSession] = useState<ContactSession | null>(null);

  useEffect(() => {
    setSessions(null);
    setActiveSession(null);
    const params = new URLSearchParams({ contactId: contact.id, customerIds: contact.customerIds.join(",") });
    fetch(`/api/contacts/sessions?${params.toString()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { sessions: [] }))
      .then((data: { sessions?: ContactSession[] }) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]));
  }, [contact.id, contact.customerIds]);

  const latestTopic = sessions?.find((session) => session.topic)?.topic ?? null;

  return (
    <div className="absolute inset-0 z-20 flex justify-end">
      <button type="button" aria-label="Close panel" onClick={onClose} className="absolute inset-0 bg-black/20" />
      <aside className="dashboard-contact-drawer relative flex h-full w-full max-w-[440px] flex-col overflow-hidden border-l border-white/10 bg-[#292a2b] shadow-[-12px_0_36px_rgba(0,0,0,0.32)]">
        {activeSession ? (
          <SessionThread session={activeSession} onBack={() => setActiveSession(null)} />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-[#eceeef] px-6 py-4">
              <h2 className="text-[15px] font-semibold text-black">Contact details</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-[#8a9298] hover:bg-[#f0f0f0] hover:text-black">
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF0F5] text-[16px] font-semibold text-[#2b5b82]">
                  {initials(contact.name)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-black">{contact.name}</h3>
                  <p className="mt-0.5 text-[12px] text-[#667069]">
                    First seen {new Date(contact.createdAt).toLocaleDateString()}
                    {contact.sourceCount > 1 && ` · ${contact.sourceCount} sessions merged`}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-lg border border-[#E3E4DF] px-3 py-2.5">
                  <Mail size={14} className="shrink-0 text-[#8a9298]" />
                  <span className="truncate text-[13px] text-[#2b2923]">{contact.email ?? <span className="text-[#8A929C]">No email on file</span>}</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-[#E3E4DF] px-3 py-2.5">
                  <Phone size={14} className="shrink-0 text-[#8a9298]" />
                  <span className="truncate text-[13px] text-[#2b2923]">{contact.phone ?? <span className="text-[#8A929C]">No phone on file</span>}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#74787c]">What they asked about</h4>
                {latestTopic ? (
                  <span className="mt-2 inline-flex max-w-full items-center truncate rounded-full bg-[#EAF0F5] px-3 py-1 text-[12.5px] font-semibold text-[#2b5b82]">
                    {latestTopic}
                  </span>
                ) : (
                  <p className="mt-2 text-[13px] leading-5 text-[#8A929C]">No topic recorded</p>
                )}
              </div>

              {Object.keys(contact.customFields).length > 0 && (
                <div className="mt-6 space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#74787c]">Other details</h4>
                  {Object.entries(contact.customFields).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-[#E3E4DF] px-3 py-2.5">
                      <p className="text-[10.5px] font-medium text-[#8a9298]">{key}</p>
                      <p className="mt-0.5 truncate text-[13px] text-[#2b2923]">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-7">
                <h4 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#74787c]">Last sessions</h4>
                {sessions === null ? (
                  <div className="flex items-center justify-center py-8 text-[12px] text-[#687178]">
                    <LoaderCircle size={14} className="mr-2 animate-spin" /> Loading sessions
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-[12.5px] text-[#8A929C]">No chat sessions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setActiveSession(session)}
                        className="flex w-full flex-col gap-1.5 rounded-xl border border-[#E3E4DF] px-3.5 py-3 text-left transition hover:border-[#c7cdd1] hover:bg-[#fafbfb]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <HandledByBadge handledBy={session.handledBy} />
                            {session.topic && (
                              <span className="truncate rounded-full bg-[#EAF0F5] px-2 py-0.5 text-[11px] font-semibold text-[#2b5b82]">
                                {session.topic}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-[10.5px] text-[#9aa1a6]">{new Date(session.time).toLocaleDateString()}</span>
                        </div>
                        <p className="truncate text-[12px] text-[#667069]">{session.preview || "No messages yet"}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function HandledByBadge({ handledBy }: { handledBy: "ai" | "human" }) {
  return handledBy === "ai" ? (
    <span className="flex items-center gap-1 rounded-full bg-[#EFEAFB] px-2 py-0.5 text-[10px] font-semibold text-[#6B4FCF]">
      <Bot size={11} /> AI
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full bg-[#EAF5EE] px-2 py-0.5 text-[10px] font-semibold text-[#257A4D]">
      <User size={11} /> Human
    </span>
  );
}

function SessionThread({ session, onBack }: { session: ContactSession; onBack: () => void }) {
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
      <div className="flex items-center gap-2.5 border-b border-[#eceeef] px-4 py-4">
        <button type="button" onClick={onBack} aria-label="Back" className="rounded-md p-1.5 text-[#8a9298] hover:bg-[#f0f0f0] hover:text-black">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <HandledByBadge handledBy={session.handledBy} />
            <h2 className="truncate text-[14px] font-semibold text-black">{session.topic ?? "Chat session"}</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-[#8a9298]">{new Date(session.time).toLocaleString()}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages === null ? (
          <div className="flex items-center justify-center py-10 text-[12px] text-[#687178]">
            <LoaderCircle size={14} className="mr-2 animate-spin" /> Loading messages
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={20} className="text-[#a0a8ae]" />
            <p className="mt-2 text-[12.5px] text-[#8A929C]">No messages in this session.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const fromCustomer = message.senderType === "customer";
              return (
                <div key={message.id} className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 ${
                      fromCustomer ? "bg-[#F0F2F4] text-[#17181a]" : "bg-[#17181a] text-white"
                    }`}
                  >
                    {!fromCustomer && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] opacity-70">
                        {message.senderType === "ai" ? "AI" : "Team"}
                      </p>
                    )}
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

function EmptyState() {
  return (
    <div className="mt-7 flex min-h-[420px] flex-col items-center justify-center bg-transparent text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] text-[#667078]"><Users size={20} /></span>
      <p className="mt-3 text-[14px] font-semibold">No contacts yet</p>
      <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#687178]">Contacts appear here automatically once a visitor fills in their name and email or phone in the chat widget.</p>
    </div>
  );
}

function UpgradeRequired({ message }: { message: string }) {
  return (
    <div className="mt-7 flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-white/10 bg-[#292a2b] text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] text-[#667078]"><Lock size={20} /></span>
      <p className="mt-3 text-[14px] font-semibold">Upgrade to unlock customer profiles</p>
      <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#687178]">{message}</p>
      <Link href="/pricing#plans" className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-white/10 px-4 text-[12px] font-semibold text-white transition hover:bg-white/20">
        <Lock size={14} /> View plans
      </Link>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
