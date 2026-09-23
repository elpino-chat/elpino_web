"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Flag, Lock, MessageCircle } from "lucide-react";

type Entry = { id: string; kind: "unread" | "escalated" | "secure_request"; conversationId: string; title: string; detail: string; createdAt: string };
const icons = { unread: MessageCircle, escalated: Flag, secure_request: Lock };

export default function NotificationsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => { fetch("/api/notifications", { cache: "no-store" }).then((r) => r.ok ? r.json() : { entries: [] }).then((d: { entries?: Entry[] }) => setEntries(d.entries ?? [])).catch(() => undefined); }, []);
  return <section id="dashboard-notifications" className="min-h-full bg-[#262626] px-6 py-8 text-white lg:px-10"><div className="mx-auto max-w-4xl"><h1 className="text-3xl font-normal">Notifications</h1><p className="mt-2 text-sm text-white/45">Updates that need your attention.</p><div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-[#292a2b]">{entries.map((entry) => { const Icon = icons[entry.kind]; return <Link key={entry.id} href={`/dashboard/inbox?conversation=${encodeURIComponent(entry.conversationId)}`} className="flex items-start gap-3 border-b border-white/[0.07] p-4 last:border-0 hover:bg-white/[0.04]"><Icon size={18} className="mt-0.5 text-white/45" /><span><span className="block text-sm text-white/85">{entry.title}</span><span className="mt-1 block text-xs text-white/40">{entry.detail}</span></span></Link>; })}{entries.length === 0 && <div className="py-16 text-center"><Bell className="mx-auto text-white/20" /><p className="mt-3 text-sm text-white/40">Nothing needs you right now.</p></div>}</div></div></section>;
}
