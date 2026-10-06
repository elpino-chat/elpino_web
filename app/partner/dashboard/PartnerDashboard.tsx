"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronDown, CircleHelp, Copy, LoaderCircle, LogOut, Mail, Megaphone, Sparkles, UserRound, Users, Wallet } from "lucide-react";
import { NavGlyph } from "@/app/components/dashboard/nav-items";
import { tabHref, type Tab } from "./routes";

type Amount = { currency: string; amount: number };
export type Overview = {
  partner: { name: string; email: string; code: string; commissionPercent: number; commissionMonths: number; active: boolean; payoutDetails: string | null; joinedAt: string };
  funnel: { clicks: number; clicks30: number; signups: number; signups30: number; paying: number };
  daily: { date: string; clicks: number; signups: number }[];
  sources: { name: string; visits: number }[];
  campaigns: { name: string; visits: number }[];
  pages: { name: string; visits: number }[];
  totals: { currency: string; earned: number; earned30: number; revenue: number; paidOut: number; balance: number }[];
  months: { month: string; earned: Amount[] }[];
  payouts: { amount: number; currency: string; note: string | null; paidAt: string }[];
  customers: { name: string; referredAt: string | null; earnsUntil: string | null; plan: string; status: string; paid: (Amount & { commission: number })[] }[];
  activity: { kind: "visit" | "signup" | "payment" | "payout"; at: string; text: string; amount?: Amount }[];
};

const SITE = "https://elpino.chat";
// Amounts arrive in each currency's smallest unit (paise, cents) and are never added across currencies.
function money(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount / 100);
}
const moneyList = (rows: Amount[]) => (rows.filter((r) => r.amount).length ? rows.filter((r) => r.amount).map((r) => money(r.amount, r.currency)).join(" + ") : money(0, "INR"));
const day = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "—");
const monthName = (key: string) => new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${key}-01T00:00:00`));
const planName = (plan: string) => plan.charAt(0).toUpperCase() + plan.slice(1);
const percent = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : "—");

// "3h ago", "2d ago" — short enough for a one-line activity row, as on the workspace dashboard.
function relativeTime(iso: string, now: number) {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const ACTIVITY_DOT = { visit: "bg-[#c8ccd2]", signup: "bg-[#428ce5]", payment: "bg-[#27895d]", payout: "bg-[#121315]" } as const;

// A summary card from the workspace dashboard's home: a titled card, three numbers between two rules, a footnote.
function SummaryCard({ icon, title, action, href, stats, footnote }: { icon: ReactNode; title: string; action: string; href: string; stats: [string, string][]; footnote: string }) {
  return (
    <article className="min-h-[260px] rounded-xl border border-[#e7e7e7] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-xl font-normal">{icon} {title}</h2>
        <Link href={href} className="flex items-center gap-1.5 text-xs text-[#858585] hover:text-[#121315]">{action} <ArrowRight size={14} /></Link>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2 border-y border-[#efefef] py-5 text-center">
        {stats.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <p className="truncate text-2xl font-normal tabular-nums text-[#121315]">{value}</p>
            <p className="mt-1 text-xs text-[#9a9a9a]">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-7 text-sm text-[#858585]">{footnote}</p>
    </article>
  );
}

function buildLink(code: string, path: string, campaign: string) {
  const params = new URLSearchParams({ ref: code });
  if (campaign) params.set("c", campaign);
  return `${SITE}${path}?${params.toString()}`;
}

// ---------------------------------------------------------------- building blocks, in the dashboard's own style

function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { void navigator.clipboard.writeText(text).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }); }}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#202225] px-4 text-[13px] font-medium text-white transition hover:bg-black"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : label}
    </button>
  );
}

function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[#121315]">{title}</h2>
      {sub && <p className="mt-1.5 max-w-2xl text-sm leading-[1.55] text-[#858585]">{sub}</p>}
    </div>
  );
}

function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e7e7e7] bg-white">
      {title && <div className="flex items-center justify-between border-b border-[#e7e7e7] px-5 py-3.5"><h3 className="text-[14px] font-semibold text-[#121315]">{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-[#e7e7e7] bg-white p-5">
      <p className="text-[12px] font-medium text-[#858585]">{label}</p>
      <p className="mt-2 text-[24px] font-semibold tabular-nums tracking-[-0.02em] text-[#121315]">{value}</p>
      <p className="mt-1 text-[12px] text-[#9a9a9a]">{note}</p>
    </div>
  );
}

// A row of the settings page: what it is on the left, the fields on the right, like the dashboard's My Settings.
function SettingsRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
      <div>
        <h3 className="text-base font-semibold text-[#121315]">{title}</h3>
        <p className="mt-1 max-w-[285px] text-sm leading-[1.55] text-[#858585]">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function TopList({ rows, empty }: { rows: { name: string; visits: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.visits));
  if (!rows.length) return <p className="px-5 py-8 text-center text-[13px] text-[#9a9a9a]">{empty}</p>;
  return (
    <ul className="space-y-2.5 px-5 py-4">
      {rows.map((r) => (
        <li key={r.name} className="text-[13px] text-[#333]">
          <div className="flex justify-between gap-3"><span className="truncate">{r.name}</span><span className="tabular-nums text-[#858585]">{r.visits}</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-[#f0f0f0]"><div className="h-full rounded-full bg-[#428ce5]" style={{ width: `${(r.visits / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

// Visits per day for the last 30 days, with the days someone signed up marked in green.
function DailyChart({ daily }: { daily: Overview["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.clicks));
  return (
    <div className="px-5 pb-4 pt-5">
      <div className="flex h-40 items-end gap-[3px]">
        {daily.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${day(d.date)}: ${d.clicks} visits, ${d.signups} signups`}>
            <div className="w-full rounded-t-[3px] bg-[#428ce5]/75 transition group-hover:bg-[#428ce5]" style={{ height: `${Math.max(d.clicks ? 4 : 1, (d.clicks / max) * 100)}%` }} />
            {d.signups > 0 && <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#27895d]" />}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#9a9a9a]"><span>{day(daily[0]?.date ?? null)}</span><span>Today</span></div>
      <div className="mt-3 flex gap-4 text-[12px] text-[#858585]">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#428ce5]/75" />Link visits</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#27895d]" />A signup that day</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- navigation


const WalletGlyph = () => <Wallet size={22} strokeWidth={1.7} aria-hidden="true" />;
const NAV: { key: Tab; label: string; glyph: () => ReactNode }[] = [
  { key: "overview", label: "Overview", glyph: () => <NavGlyph name="dashboard" /> },
  { key: "referrals", label: "Referrals", glyph: () => <NavGlyph name="contacts" /> },
  { key: "earnings", label: "Earnings", glyph: WalletGlyph },
  { key: "settings", label: "Settings", glyph: () => <NavGlyph name="settings" /> },
];

// `now` is when the server rendered the page, so the server and the browser show the same greeting and times.
export function PartnerDashboard({ overview, now, tab }: { overview: Overview; now: number; tab: Tab }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const { partner, funnel, totals } = overview;
  const mainLink = buildLink(partner.code, "/", "");
  const terms = `${partner.commissionPercent}% of every payment a customer you refer makes in their first ${partner.commissionMonths} months`;

  // Settings
  const [name, setName] = useState(partner.name);
  const [payoutDetails, setPayoutDetails] = useState(partner.payoutDetails ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  async function saveSettings() {
    setSaving(true); setSaved(null);
    const res = await fetch("/api/partner/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, payoutDetails }) });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    setSaving(false);
    setSaved(res.ok ? "Saved" : data.message ?? "Could not save");
    if (res.ok) router.refresh();
  }

  async function logout() {
    await fetch("/api/partner/logout", { method: "POST" });
    router.replace("/partner/login");
    router.refresh();
  }

  const earned = totals.map((t) => ({ currency: t.currency, amount: t.earned }));
  const balance = totals.map((t) => ({ currency: t.currency, amount: t.balance }));
  const initial = (partner.name.trim() || partner.email).charAt(0).toUpperCase();
  const input = "h-11 w-full rounded-xl border border-[#d3d3d3] bg-white px-3 text-[13px] text-[#121315] outline-none transition focus:border-[#777] focus:ring-1 focus:ring-[#777]/10";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white font-display text-[#121315] antialiased">
      {/* The rail: same size, glyphs and active state as the workspace dashboard's. */}
      <aside aria-label="Partner navigation" className="hidden h-full w-[80px] shrink-0 flex-col bg-[#f7f7f7] md:flex">
        <div className="flex h-[66px] shrink-0 items-center justify-center">
          <Link href="/partner/dashboard" aria-label="Partner dashboard" className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-105">
            <Image src="/elpino_slack.png" alt="" width={38} height={38} priority className="h-[38px] w-[38px] object-contain" />
          </Link>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-2.5">
          {NAV.map(({ key, label, glyph }) => (
            <Link
              key={key}
              href={tabHref(key)}
              aria-current={tab === key ? "page" : undefined}
              className={`flex w-full flex-col items-center justify-center rounded-xl py-2.5 text-center transition-colors ${tab === key ? "bg-[#ececec] text-[#121315]" : "text-[#121315]/65 hover:bg-[#efefef] hover:text-[#121315]"}`}
            >
              <span className="mb-1">{glyph()}</span>
              <span className="text-[12px] leading-4">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 flex-col items-center pb-5 pt-3 text-[#121315]/75">
          <Link href="/contact" aria-label="Help" className="rounded-lg p-2 hover:bg-[#efefef]"><CircleHelp size={22} strokeWidth={1.7} /></Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header, like the workspace dashboard's. */}
        <header className="flex h-[66px] shrink-0 items-center gap-3 border-b border-[#ececec] px-4 sm:px-8">
          <Image src="/elpino_slack.png" alt="" width={32} height={32} className="h-8 w-8 md:hidden" />
          <span className="flex items-center gap-2 text-[17px] font-medium">
            Partner program
            <span className="rounded-full bg-[#121315] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white">Partner</span>
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block"><CopyButton text={mainLink} label="Copy my link" /></span>
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} className="flex items-center gap-1.5">
                <span className="relative grid size-[38px] place-items-center rounded-full bg-[#1f1f1f] text-[15px] text-white">
                  {initial}
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#27895d]" />
                </span>
                <ChevronDown size={16} className="text-[#121315]/60" />
              </button>
              {menuOpen && (
                <>
                  <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-xl border border-[#e7e7e7] bg-white p-1.5 shadow-[0_16px_40px_-20px_rgba(15,18,22,0.45)]">
                    <div className="px-3 py-2"><p className="truncate text-[13px] font-medium">{partner.name}</p><p className="truncate text-[12px] text-[#858585]">{partner.email}</p></div>
                    <Link href={tabHref("settings")} onClick={() => setMenuOpen(false)} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] hover:bg-[#f4f6fa]"><UserRound size={15} />Settings</Link>
                    <button type="button" onClick={() => void logout()} className="flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[13px] hover:bg-[#f4f6fa]"><LogOut size={15} />Log out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="w-full px-5 pb-10 pt-9 sm:px-10 lg:px-12">
            {!partner.active && (
              <p className="mb-6 rounded-xl border border-[#f1d9b5] bg-[#fff8ec] px-4 py-3 text-[13px] text-[#8a5300]">Your referral link is paused, so new visits and signups aren&apos;t being counted. Contact the Elpino team to turn it back on.</p>
            )}

            {tab === "overview" && (
              <div>
                <p className="text-sm font-normal text-[#858585]">{today}</p>
                <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] sm:text-4xl">{greeting}, {partner.name.trim().split(/\s+/)[0]}</h1>

                {/* Until the first signup, the one thing worth doing is sharing the link. */}
                {funnel.signups === 0 && (
                  <article className="mt-7 flex flex-col gap-5 rounded-xl border border-[#e7e7e7] bg-[#fcfcfc] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef4fd] text-[#428ce5]"><Megaphone size={18} /></span>
                      <div><h2 className="text-sm font-normal text-[#121315]">Share your link to get your first signup</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#858585]">Send it to business owners who answer the same customer questions every day. You earn {terms}.</p></div>
                    </div>
                    <CopyButton text={mainLink} label="Copy my link" />
                  </article>
                )}

                <div className="mt-7 grid gap-4 xl:grid-cols-2">
                  <SummaryCard
                    icon={<Users size={21} className="text-[#428ce5]" />}
                    title="Referrals"
                    action="View referrals"
                    href={tabHref("referrals")}
                    stats={[["Visits", funnel.clicks.toLocaleString("en")], ["Signups", funnel.signups.toLocaleString("en")], ["Paying", funnel.paying.toLocaleString("en")]]}
                    footnote={funnel.clicks === 0 ? "Visits and signups from your link will appear here." : `${funnel.clicks30.toLocaleString("en")} visits and ${funnel.signups30} signups in the last 30 days · ${percent(funnel.signups, funnel.clicks)} of visits sign up.`}
                  />
                  <SummaryCard
                    icon={<Wallet size={21} className="text-[#27895d]" />}
                    title="Earnings"
                    action="View earnings"
                    href={tabHref("earnings")}
                    stats={[["Earned", moneyList(earned)], ["Paid to you", moneyList(totals.map((t) => ({ currency: t.currency, amount: t.paidOut })))], ["Balance", moneyList(balance)]]}
                    footnote={`You earn ${partner.commissionPercent}% of each payment for ${partner.commissionMonths} months per customer.`}
                  />
                </div>

                <article className="mt-4 rounded-xl border border-[#e7e7e7] bg-white p-6">
                  <h2 className="flex items-center gap-2.5 text-xl font-normal"><Sparkles size={20} className="text-[#e2b64a]" /> Recent activity</h2>
                  {overview.activity.length > 0 ? (
                    <div className="mt-5 divide-y divide-[#efefef]">
                      {overview.activity.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-3.5 text-sm">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACTIVITY_DOT[item.kind]}`} />
                          <span className="min-w-0 flex-1 truncate text-[#333]">{item.text}</span>
                          {item.amount && (
                            <span className={`shrink-0 tabular-nums font-medium ${item.kind === "payment" ? "text-[#257A4D]" : "text-[#121315]"}`}>
                              {item.kind === "payment" ? "+" : ""}{money(item.amount.amount, item.amount.currency)}
                            </span>
                          )}
                          <span className="w-16 shrink-0 text-right text-xs text-[#9a9a9a]">{relativeTime(item.at, now)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-[#858585]">Nothing&apos;s happened yet. Visits, signups and earnings from your link will show up here.</p>
                  )}
                </article>

                <div className="mt-4"><Panel title="Last 30 days"><DailyChart daily={overview.daily} /></Panel></div>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <Panel title="Where visits come from"><TopList rows={overview.sources} empty="No visits in the last 30 days yet." /></Panel>
                  <Panel title="Campaigns"><TopList rows={overview.campaigns} empty="Add &c=whatsapp (or any tag) to your link to compare channels." /></Panel>
                  <Panel title="Pages people land on"><TopList rows={overview.pages} empty="No visits in the last 30 days yet." /></Panel>
                </div>
              </div>
            )}

            {tab === "referrals" && (
              <div className="space-y-6">
                <PageTitle title="Referrals" sub={`Every workspace created through your links. Each one earns you commission for ${partner.commissionMonths} months from its signup.`} />
                <Panel>
                  {overview.customers.length === 0 ? (
                    <p className="px-5 py-14 text-center text-[13px] text-[#9a9a9a]">No signups yet. They&apos;ll appear here as soon as someone creates a workspace through your link.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-[13px]">
                        <thead className="border-b border-[#e7e7e7] bg-[#fcfcfc] text-[12px] text-[#858585]"><tr>
                          <th className="px-5 py-3 font-medium">Workspace</th><th className="px-5 py-3 font-medium">Signed up</th><th className="px-5 py-3 font-medium">Earns until</th><th className="px-5 py-3 font-medium">Plan</th><th className="px-5 py-3 font-medium">They paid</th><th className="px-5 py-3 font-medium">You earned</th>
                        </tr></thead>
                        <tbody>
                          {overview.customers.map((c, i) => {
                            const ended = c.earnsUntil ? new Date(c.earnsUntil).getTime() < now : false;
                            return (
                              <tr key={i} className="border-t border-[#efefef] first:border-t-0">
                                <td className="px-5 py-3.5 font-medium">{c.name}</td>
                                <td className="px-5 py-3.5 text-[#555]">{day(c.referredAt)}</td>
                                <td className="px-5 py-3.5 text-[#555]">{day(c.earnsUntil)}{ended && <span className="ml-2 text-[11.5px] text-[#9a9a9a]">ended</span>}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${c.plan === "free" ? "bg-[#f0f0f0] text-[#666]" : "bg-[#EAF5EE] text-[#257A4D]"}`}>{planName(c.plan)}</span>
                                  {c.status !== "active" && <span className="ml-2 text-[11.5px] text-[#b45309]">{c.status.replace("_", " ")}</span>}
                                </td>
                                <td className="px-5 py-3.5 tabular-nums">{moneyList(c.paid)}</td>
                                <td className="px-5 py-3.5 font-medium tabular-nums">{moneyList(c.paid.map((p) => ({ currency: p.currency, amount: p.commission })))}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              </div>
            )}

            {tab === "earnings" && (
              <div className="space-y-6">
                <PageTitle title="Earnings" sub={`${terms[0].toUpperCase()}${terms.slice(1)}. Refunded payments are taken out automatically.`} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Total earned" value={moneyList(earned)} note="Since you joined" />
                  <Stat label="Paid to you" value={moneyList(totals.map((t) => ({ currency: t.currency, amount: t.paidOut })))} note={`${overview.payouts.length} payout${overview.payouts.length === 1 ? "" : "s"}`} />
                  <Stat label="Balance due" value={moneyList(balance)} note={partner.payoutDetails ? "Paid to the details in Settings" : "Add payout details in Settings"} />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel title="By month">
                    {overview.months.length === 0 ? <p className="px-5 py-10 text-center text-[13px] text-[#9a9a9a]">Earnings appear here once a referral pays.</p> : (
                      <ul className="divide-y divide-[#efefef]">
                        {overview.months.map((m) => <li key={m.month} className="flex justify-between px-5 py-3 text-[13px]"><span>{monthName(m.month)}</span><span className="font-medium tabular-nums">{moneyList(m.earned)}</span></li>)}
                      </ul>
                    )}
                  </Panel>
                  <Panel title="Payouts">
                    {overview.payouts.length === 0 ? <p className="px-5 py-10 text-center text-[13px] text-[#9a9a9a]">No payouts yet.</p> : (
                      <ul className="divide-y divide-[#efefef]">
                        {overview.payouts.map((p, i) => <li key={i} className="flex justify-between gap-3 px-5 py-3 text-[13px]"><span>{day(p.paidAt)}{p.note && <span className="ml-2 text-[#9a9a9a]">{p.note}</span>}</span><span className="font-medium tabular-nums">{money(p.amount, p.currency)}</span></li>)}
                      </ul>
                    )}
                  </Panel>
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div>
                <PageTitle title="My Settings" />
                <div className="mt-9">
                  <SettingsRow title="Profile" description="Your name as the Elpino team sees it, and the email you log in with.">
                    <label className="block text-[12px] font-medium" htmlFor="partner-name">Full Name</label>
                    <div className="relative mt-2">
                      <UserRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
                      <input id="partner-name" value={name} onChange={(e) => { setName(e.target.value); setSaved(null); }} maxLength={120} className={`${input} pl-10`} />
                    </div>
                    <label className="mt-5 block text-[12px] font-medium" htmlFor="partner-email">Email</label>
                    <div className="relative mt-2">
                      <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
                      <input id="partner-email" value={partner.email} readOnly className={`${input} bg-[#fcfcfc] pl-10 pr-20 text-[#333]`} />
                      <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-[#EAF5EE] px-2 py-1 text-[10px] font-semibold text-[#257A4D]"><CheckCircle2 size={11} /> Verified</span>
                    </div>
                  </SettingsRow>

                  <div className="my-7 h-px bg-[#e7e7e7]" />

                  <SettingsRow title="Payouts" description="Where we send your commission. A UPI id is quickest; bank details work too.">
                    <label className="block text-[12px] font-medium" htmlFor="partner-payout">UPI id or bank account</label>
                    <div className="relative mt-2">
                      <Wallet size={15} className="pointer-events-none absolute left-3 top-3.5 text-[#6f7073]" />
                      <textarea id="partner-payout" value={payoutDetails} onChange={(e) => { setPayoutDetails(e.target.value); setSaved(null); }} maxLength={300} placeholder="yourname@upi" className={`${input} h-24 resize-none py-3 pl-10`} />
                    </div>
                  </SettingsRow>

                  <div className="my-7 h-px bg-[#e7e7e7]" />

                  <SettingsRow title="Partner program" description="Your referral code and the terms you earn on.">
                    <dl className="divide-y divide-[#e7e7e7] rounded-xl border border-[#e7e7e7] text-[13px]">
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-[#858585]">Referral code</dt><dd className="font-medium">{partner.code}</dd></div>
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-[#858585]">Commission</dt><dd className="text-right">{partner.commissionPercent}% for {partner.commissionMonths} months per customer</dd></div>
                      <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-[#858585]">Partner since</dt><dd>{day(partner.joinedAt)}</dd></div>
                    </dl>
                  </SettingsRow>

                  <div className="my-7 h-px bg-[#e7e7e7]" />

                  <div className="flex items-center justify-end gap-3">
                    {saved && <span className={`text-[12px] ${saved === "Saved" ? "text-[#257A4D]" : "text-[#b8444f]"}`}>{saved}</span>}
                    <button type="button" disabled={saving || !name.trim()} onClick={() => void saveSettings()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#202225] px-5 text-[13px] font-medium text-white transition hover:bg-black disabled:opacity-50">
                      {saving && <LoaderCircle size={15} className="animate-spin" />}Save changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Phones: the same items as a bottom tab bar, like the workspace dashboard. */}
      <nav aria-label="Partner navigation" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#ececec] bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(({ key, label, glyph }) => (
          <Link key={key} href={tabHref(key)} aria-current={tab === key ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px] ${tab === key ? "text-[#121315]" : "text-[#121315]/50"}`}>
            {glyph()}{label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
