"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, LifeBuoy, Lightbulb, LoaderCircle, Mail, MessageSquare, Phone, Search, User, Users, X } from "lucide-react";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openContact, setOpenContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetch("/api/contacts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { contacts: [] }))
      .then((data: { contacts?: Contact[] }) => setContacts(data.contacts ?? []))
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

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden bg-white text-[#17181a]">
      <main className="dashboard-page-surface dashboard-contacts-main-surface m-0.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-black/20 bg-white shadow-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="shrink-0 border-b border-[#eceeef] px-6 py-5">
          <h1 className="text-[19px] font-normal tracking-[-0.02em] text-black">Contacts</h1>
          <p className="mt-0.5 text-[12.5px] text-[#74787c]">People who left their details through your website widget</p>

          <div className="mt-4 flex max-w-xs items-center gap-2 rounded-lg border border-[#DDE4E8] px-2.5 py-2">
            <Search size={14} className="text-[#8a9298]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#9aa1a6]"
            />
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
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="dashboard-contacts-table w-full border-collapse text-left text-[14px]">
              <thead className="sticky top-0 z-[1] bg-white">
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
                    className="cursor-pointer border-b border-[#f0f1f2] transition hover:bg-[#f7f8f8]"
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
          )}
        </div>
      </main>

      <aside className="dashboard-secondary-sidebar my-0.5 mr-0.5 hidden h-[calc(100%_-_4px)] w-[340px] shrink-0 flex-col overflow-hidden rounded-xl border border-black/20 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex">
        <div className="space-y-3 p-3">
          <div className="min-h-44 rounded-xl bg-gradient-to-br from-[#7467E8] via-[#428ce5] to-[#39B487] p-[2.5px]">
            <div className="flex h-full flex-col justify-between rounded-[9px] bg-white p-4">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF0F5]"><LifeBuoy size={18} color="#2b5b82" /></span>
                <h3 className="mt-2.5 text-[15px] font-semibold text-black">Need help?</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#667069]">Questions about contacts or widget data? We're happy to help.</p>
              </div>
              <Link href="/contact" className="mt-4 flex h-8 w-fit items-center gap-1.5 rounded-md border border-[#DDE4E8] bg-white px-3.5 text-[12.5px] font-semibold text-black transition hover:bg-[#f7f8f8]">
                Contact support
              </Link>
            </div>
          </div>

          <div className="min-h-44 rounded-xl bg-white p-4">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FDF0E4]"><Lightbulb size={18} color="#B8621B" /></span>
                <h3 className="mt-2.5 text-[15px] font-semibold text-black">Request a feature</h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#667069]">Missing something in Contacts? Tell us what you'd like to see next.</p>
              </div>
              <Link href="/contact" className="mt-4 flex h-8 w-fit items-center gap-1.5 rounded-md border border-[#DDE4E8] bg-white px-3.5 text-[12.5px] font-semibold text-black transition hover:bg-[#f7f8f8]">
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
      <aside className="relative flex h-full w-full max-w-[440px] flex-col overflow-hidden border-l border-[#E3E4DF] bg-white shadow-[-8px_0_30px_rgba(15,23,42,0.12)]">
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
                <p className="mt-2 text-[13px] leading-5 text-[#2b2923]">{latestTopic ?? <span className="text-[#8A929C]">No topic recorded</span>}</p>
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
                          <span className="flex items-center gap-1.5">
                            <HandledByBadge handledBy={session.handledBy} />
                            {session.topic && <span className="text-[12px] font-medium text-black">{session.topic}</span>}
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
    <div className="mt-7 flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-[#DDE4E8] bg-white text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] text-[#667078]"><Users size={20} /></span>
      <p className="mt-3 text-[14px] font-semibold">No contacts yet</p>
      <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#687178]">Contacts appear here automatically once a visitor fills in their name and email or phone in the chat widget.</p>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
