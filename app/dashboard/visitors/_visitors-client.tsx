"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMobileDrawer } from "@/app/components/dashboard/mobile-drawer-context";
import {
  Activity,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  Link2,
  LoaderCircle,
  RefreshCw,
  Radio,
  Sparkles,
} from "lucide-react";

export type VisitorView = "overview" | "realtime" | "analytics" | "pages";
type SiteTag = { id: string; name: string; domain: string; status: "verified" | "unverified"; lastUsedAt: string | null };
type CompareMode = "previous_period" | "previous_year" | "none";
type Summary = { totalVisitors: number; totalPageviews: number; totalSessions: number };
type TrendPoint = { date: string; pageviews: number; sessions: number };
type Realtime = { activeUsers: number; perMinute: { minute: string; visitors: number }[] };
type CountryRow = { country: string; visitors: number };
type PageRow = { path: string; views: number };
type SourceRow = { source: string; sessions: number };
type LiveVisitor = {
  connId: string;
  siteId: string;
  visitorId: string;
  sessionId: string;
  country: string | null;
  region: string | null;
  city: string | null;
  ip: string | null;
  referrer: string | null;
  path: string;
  pathHistory: { path: string; enteredAt: string }[];
  startedAt: number;
  durationSeconds: number;
};

const views = [
  { id: "overview", label: "Overview" },
  { id: "realtime", label: "Real-time data" },
  { id: "analytics", label: "Analytics" },
  { id: "pages", label: "Visited pages" },
] as const;

const titles = {
  overview: ["Overview", "Traffic and engagement for the selected website."],
  realtime: ["Real-time data", "Visitors active during the last 30 minutes."],
  analytics: ["Analytics", "Traffic, acquisition, and engagement over time."],
  pages: ["Visited pages", "Pages opened during tracked visitor sessions."],
} as const;

const rangeOptions = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "20", label: "Last 20 days" },
  { value: "40", label: "Last 40 days" },
] as const;

const compareOptions: { value: CompareMode; label: string }[] = [
  { value: "previous_period", label: "Previous period" },
  { value: "previous_year", label: "Previous year" },
  { value: "none", label: "No comparison" },
];

// Holds a live WebSocket connection to the gateway's realtime module and
// maintains the current set of active visitors for this workspace — pushed
// updates (join/update/leave), not polled. See apps/gateway/src/realtime.
function useLiveVisitors(enabled: boolean) {
  const [visitors, setVisitors] = useState<Record<string, LiveVisitor>>({});

  useEffect(() => {
    if (!enabled) return;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let cancelled = false;

    async function connect() {
      try {
        const response = await fetch("/api/workspace/analytics/live-token", { cache: "no-store" });
        if (!response.ok) throw new Error("no token");
        const data = (await response.json()) as { token: string; wsUrl: string };
        if (cancelled) return;

        socket = new WebSocket(`${data.wsUrl}?token=${encodeURIComponent(data.token)}`);
        socket.onmessage = (event) => {
          let msg: { type: string; visitors?: LiveVisitor[]; visitor?: LiveVisitor; connId?: string };
          try { msg = JSON.parse(event.data); } catch { return; }

          if (msg.type === "snapshot" && msg.visitors) {
            const next: Record<string, LiveVisitor> = {};
            for (const visitor of msg.visitors) next[visitor.connId] = visitor;
            setVisitors(next);
          } else if ((msg.type === "visitor_join" || msg.type === "visitor_update") && msg.visitor) {
            setVisitors((current) => ({ ...current, [msg.visitor!.connId]: msg.visitor! }));
          } else if (msg.type === "visitor_leave" && msg.connId) {
            setVisitors((current) => {
              const next = { ...current };
              delete next[msg.connId!];
              return next;
            });
          }
        };
        socket.onclose = () => {
          if (cancelled) return;
          reconnectTimer = window.setTimeout(connect, 4000);
        };
      } catch {
        if (!cancelled) reconnectTimer = window.setTimeout(connect, 4000);
      }
    }
    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [enabled]);

  return useMemo(() => Object.values(visitors).sort((a, b) => b.startedAt - a.startedAt), [visitors]);
}

export function VisitorsClient({ view }: { view: VisitorView }) {
  const [sites, setSites] = useState<SiteTag[]>([]);
  const [selectedId, setSelectedId] = useState<string>("__all__");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [domainOpen, setDomainOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [range, setRange] = useState<"1" | "7" | "20" | "40" | "custom">("7");
  const [compareMode, setCompareMode] = useState<CompareMode>("previous_period");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [realtime, setRealtime] = useState<Realtime | null>(null);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  function loadSites() {
    return fetch("/api/workspace/sites", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { sites?: SiteTag[] }) => {
        const next = data.sites ?? [];
        setSites(next);
      })
      .catch(() => setSites([]));
  }

  useEffect(() => {
    loadSites().finally(() => setLoading(false));
  }, []);

  function rangeToDates() {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    if (range === "custom") return { from: startDate, to: endDate };
    const days = Number(range);
    const fromDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return { from: fromDate.toISOString().slice(0, 10), to: toStr };
  }

  function loadAnalytics() {
    const { from, to } = rangeToDates();
    if (range === "custom" && (!from || !to)) return;
    const params = new URLSearchParams({ from, to });
    if (selectedId !== "__all__") params.set("siteId", selectedId);
    const realtimeParams = selectedId !== "__all__" ? `?siteId=${encodeURIComponent(selectedId)}` : "";

    setAnalyticsLoading(true);
    Promise.all([
      fetch(`/api/workspace/analytics/summary?${params.toString()}`).then((r) => (r.ok ? r.json() : { summary: null })),
      fetch(`/api/workspace/analytics/trend?${params.toString()}`).then((r) => (r.ok ? r.json() : { trend: [] })),
      fetch(`/api/workspace/analytics/realtime${realtimeParams}`).then((r) => (r.ok ? r.json() : { realtime: null })),
      fetch(`/api/workspace/analytics/countries?${params.toString()}`).then((r) => (r.ok ? r.json() : { countries: [] })),
      fetch(`/api/workspace/analytics/pages?${params.toString()}`).then((r) => (r.ok ? r.json() : { pages: [] })),
      fetch(`/api/workspace/analytics/sources?${params.toString()}`).then((r) => (r.ok ? r.json() : { sources: [] })),
    ])
      .then(([summaryRes, trendRes, realtimeRes, countriesRes, pagesRes, sourcesRes]) => {
        setSummary((summaryRes as { summary: Summary | null }).summary);
        setTrend((trendRes as { trend?: TrendPoint[] }).trend ?? []);
        setRealtime((realtimeRes as { realtime: Realtime | null }).realtime);
        setCountries((countriesRes as { countries?: CountryRow[] }).countries ?? []);
        setPages((pagesRes as { pages?: PageRow[] }).pages ?? []);
        setSources((sourcesRes as { sources?: SourceRow[] }).sources ?? []);
      })
      .catch(() => undefined)
      .finally(() => setAnalyticsLoading(false));
  }

  useEffect(() => {
    if (sites.length === 0) return;
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites.length, selectedId, range, startDate, endDate]);

  // Realtime keeps polling on its own regardless of the selected report —
  // Overview shows the same "last 30 minutes" panel as the dedicated tab.
  useEffect(() => {
    if (sites.length === 0) return;
    const realtimeParams = selectedId !== "__all__" ? `?siteId=${encodeURIComponent(selectedId)}` : "";
    const poll = () => {
      fetch(`/api/workspace/analytics/realtime${realtimeParams}`)
        .then((r) => (r.ok ? r.json() : { realtime: null }))
        .then((data: { realtime: Realtime | null }) => setRealtime(data.realtime))
        .catch(() => undefined);
    };
    const interval = window.setInterval(poll, 20000);
    return () => window.clearInterval(interval);
  }, [sites.length, selectedId]);

  const liveVisitorsAll = useLiveVisitors(sites.length > 0);
  const liveVisitors = useMemo(
    () => (selectedId === "__all__" ? liveVisitorsAll : liveVisitorsAll.filter((visitor) => visitor.siteId === selectedId)),
    [liveVisitorsAll, selectedId],
  );

  async function refresh() {
    setRefreshing(true);
    try {
      await loadSites();
      loadAnalytics();
    } finally {
      setRefreshing(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  const selectedSite = useMemo(() => (selectedId === "__all__" ? null : sites.find((site) => site.id === selectedId) ?? null), [selectedId, sites]);
  const rangeLabel =
    range === "custom" && startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
      : rangeOptions.find((option) => option.value === range)?.label ?? "Custom range";
  const domainLabel = selectedSite ? selectedSite.domain : "All websites";
  const compareLabel = compareOptions.find((option) => option.value === compareMode)?.label ?? "Previous period";

  return (
    <div className="dashboard-analytics-shell flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
      <VisitorSidebar view={view} />
      <main className="dashboard-page-surface dashboard-visitors-main-surface flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="dashboard-analytics-canvas mx-auto w-full max-w-[1320px] px-6 pb-16 pt-7 sm:px-10 lg:px-12">
          <div className="mb-7">
            <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/40">Reports</p>
            <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white/95">{titles[view][0]}</h1>
            <p className="mt-2 text-sm text-white/45">{titles[view][1]}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
                  <Clock3 size={14} className="text-[#8a9298]" /> {rangeLabel} <ChevronDown size={13} className="text-[#9aa1a6]" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[220px]">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { setRange(option.value); setShowCustomRange(false); setRangeOpen(false); }}
                      className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] font-medium ${range === option.value ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                    >
                      {option.label} {range === option.value && <Check size={14} className="text-[#11120f]" />}
                    </button>
                  ))}
                  <div className="my-1 border-t border-[#eceeef]" />
                  <button
                    type="button"
                    onClick={() => { setRange("custom"); setShowCustomRange(true); setRangeOpen(false); }}
                    className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] font-medium ${range === "custom" ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                  >
                    Custom range… {range === "custom" && <Check size={14} className="text-[#11120f]" />}
                  </button>
                </PopoverContent>
              </Popover>

              <Popover open={compareOpen} onOpenChange={setCompareOpen}>
                <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
                  <Activity size={14} className="text-[#8a9298]" /> {compareLabel} <ChevronDown size={13} className="text-[#9aa1a6]" />
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[200px]">
                  {compareOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { setCompareMode(option.value); setCompareOpen(false); }}
                      className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] font-medium ${compareMode === option.value ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                    >
                      {option.label} {compareMode === option.value && <Check size={14} className="text-[#11120f]" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sites.length > 0 ? (
                <Popover open={domainOpen} onOpenChange={setDomainOpen}>
                  <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
                    <Globe2 size={14} className="text-[#8a9298]" /> {domainLabel} <ChevronDown size={13} className="text-[#9aa1a6]" />
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[260px]">
                    <button
                      type="button"
                      onClick={() => { setSelectedId("__all__"); setDomainOpen(false); }}
                      className={`flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] font-medium ${selectedId === "__all__" ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                    >
                      All websites {selectedId === "__all__" && <Check size={14} className="text-[#11120f]" />}
                    </button>
                    <div className="my-1 border-t border-[#eceeef]" />
                    <SiteList sites={sites} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setDomainOpen(false); }} />
                  </PopoverContent>
                </Popover>
              ) : (
                <Link href="/dashboard/connect" className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#202225] px-4 text-[12px] font-semibold text-white transition hover:bg-black">Connect website</Link>
              )}

              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
                  <Filter size={14} className="text-[#8a9298]" /> Filters <ChevronDown size={13} className="text-[#9aa1a6]" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[260px]">
                  <p className="px-2.5 py-2 text-[12px] leading-5 text-[#8a9298]">No filters available yet — filters will appear once visitor data is collected.</p>
                </PopoverContent>
              </Popover>

              <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
                <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
                  <Bookmark size={14} className="text-[#8a9298]" /> Presets <ChevronDown size={13} className="text-[#9aa1a6]" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[260px]">
                  <p className="px-2.5 py-2 text-[12px] leading-5 text-[#8a9298]">Save common date-range and filter combinations here once you have live data to compare.</p>
                </PopoverContent>
              </Popover>

              <button type="button" onClick={() => void copyLink()} aria-label="Copy link" className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE4E8] text-[#657078] transition hover:bg-[#f7f8f8]">
                <Link2 size={14} />
                {copied && <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-[#11120f] px-2 py-1 text-[10.5px] font-medium text-white">Copied!</span>}
              </button>

              <button
                type="button"
                onClick={() => void refresh()}
                disabled={refreshing}
                aria-label="Refresh"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDE4E8] bg-white text-[#657078] transition hover:bg-[#f7f8f8] disabled:opacity-60"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {showCustomRange && (
            <div className="mt-3 flex flex-wrap items-end justify-end gap-2.5 rounded-xl border border-[#DDE4E8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <label className="text-[10.5px] font-semibold text-[#68727a]">
                Start date
                <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-[#DDE4E8] px-3 text-[11.5px] outline-none focus:border-[#11120f]" />
              </label>
              <span className="pb-2 text-[#9aa1a6]">→</span>
              <label className="text-[10.5px] font-semibold text-[#68727a]">
                End date
                <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-[#DDE4E8] px-3 text-[11.5px] outline-none focus:border-[#11120f]" />
              </label>
              <button type="button" disabled={!startDate || !endDate} onClick={() => setShowCustomRange(false)} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#11120f] px-4 text-[11.5px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">
                <Check size={13} /> Apply
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-7 flex items-center justify-center py-24 text-[12px] text-[#687178]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading analytics</div>
          ) : sites.length === 0 ? (
            <EmptyConnect />
          ) : view === "overview" ? (
            <Overview
              site={selectedSite}
              loading={analyticsLoading}
              summary={summary}
              trend={trend}
              realtime={realtime}
              countries={countries}
              pages={pages}
              sources={sources}
              rangeLabel={rangeLabel}
            />
          ) : (
            <ReportView view={view} site={selectedSite} loading={analyticsLoading} summary={summary} trend={trend} realtime={realtime} liveVisitors={liveVisitors} countries={countries} pages={pages} sources={sources} />
          )}
        </div>
      </main>
    </div>
  );
}

function VisitorSidebar({ view }: { view: VisitorView }) {
  const { open, setOpen } = useMobileDrawer();
  return (
    <>
      {/* Kept mounted (not `hidden`) below md so the slide has something to
          animate — see SpacePanel.tsx for the same trick and why. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div
        id="analytics-report-sidebar"
        className={`dashboard-secondary-sidebar dashboard-analytics-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#262626] shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out md:static md:z-auto md:w-[240px] md:translate-x-0 md:shadow-none lg:w-[240px] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="mb-2 mt-1 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74787c]">Reports</p>
          <nav className="space-y-0.5">
            {views.map(({ id, label }) => (
              <Link
                key={id}
                href={id === "overview" ? "/dashboard/visitors" : `/dashboard/visitors/${id}`}
                aria-current={view === id ? "page" : undefined}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-normal transition ${view === id ? "dashboard-secondary-nav-active bg-white/10 text-white/90" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

function SiteList({ sites, selectedId, onSelect }: { sites: SiteTag[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <>
      <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8a9298]">Websites</p>
      <div className="max-h-[260px] overflow-y-auto">
        {sites.map((site) => {
          const active = site.id === selectedId;
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => onSelect(site.id)}
              className={`flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left ${active ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#257A4D]"><Globe2 size={13} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12.5px] font-semibold text-[#17181a]">{site.name}</span>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${site.status === "verified" ? "bg-[#2FA266]" : "bg-[#D89831]"}`} />
                </span>
                <span className="block truncate text-[10.5px] text-[#7b858c]">{site.domain}</span>
              </span>
              {active && <Check size={14} className="shrink-0 text-[#11120f]" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#DDE4E8] bg-white p-5">
      <p className="text-[13.5px] font-medium text-[#3c4245]">{label}</p>
      <p className="mt-4 text-[30px] font-bold tracking-[-0.02em] text-black">{value}</p>
    </article>
  );
}

// Builds a smooth-ish SVG path from daily counts, scaled into a 700x200
// viewBox. Falls back to null (caller shows the empty state) when there's
// nothing to plot.
function trendPath(trend: TrendPoint[], key: "pageviews" | "sessions") {
  if (trend.length === 0) return null;
  const values = trend.map((point) => point[key]);
  const max = Math.max(1, ...values);
  const stepX = trend.length > 1 ? 700 / (trend.length - 1) : 0;
  const points = values.map((value, index) => {
    const x = trend.length > 1 ? index * stepX : 350;
    const y = 190 - (value / max) * 170;
    return [x, y] as const;
  });
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function RealtimeSparkline({ realtime }: { realtime: Realtime | null }) {
  const buckets = Array.from({ length: 30 }, (_, index) => {
    const minute = new Date(Date.now() - (29 - index) * 60 * 1000);
    minute.setSeconds(0, 0);
    const match = realtime?.perMinute.find((row) => new Date(row.minute).getTime() === minute.getTime());
    return match?.visitors ?? 0;
  });
  const max = Math.max(1, ...buckets);
  return (
    <div className="flex h-16 items-end gap-1">
      {buckets.map((value, index) => (
        <span key={index} className="flex-1 rounded-t-sm bg-[#428ce5]/70" style={{ height: `${Math.max(4, (value / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function Overview({
  site, loading, summary, trend, realtime, countries, pages, sources, rangeLabel,
}: {
  site: SiteTag | null; loading: boolean; summary: Summary | null; trend: TrendPoint[]; realtime: Realtime | null;
  countries: CountryRow[]; pages: PageRow[]; sources: SourceRow[]; rangeLabel: string;
}) {
  const path = trendPath(trend, "sessions");
  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Visitors" value={loading ? "…" : String(summary?.totalVisitors ?? 0)} />
        <StatCard label="Page views" value={loading ? "…" : String(summary?.totalPageviews ?? 0)} />
        <StatCard label="Sessions" value={loading ? "…" : String(summary?.totalSessions ?? 0)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_0.95fr]">
        <section className="overflow-hidden rounded-xl border border-[#DDE4E8] bg-white">
          <div className="border-b border-[#E5E9EB] px-6 py-5">
            <h3 className="text-[16px] font-semibold">Visitor trend</h3>
            <p className="mt-1 text-[12px] text-[#667069]">Sessions over the selected time range.</p>
          </div>
          <div className="px-6 py-6">
            <div className="relative h-[200px]">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => <span key={line} className="block border-t border-[#EEF0F2]" />)}
              </div>
              {path ? (
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 200" preserveAspectRatio="none" aria-label="Visitor trend">
                  <path d={path} fill="none" stroke="#428ce5" strokeWidth="2" />
                </svg>
              ) : (
                <span className="absolute bottom-1 left-1 rounded-md bg-white px-2 py-1 text-[10.5px] text-[#8A929C]">No visits recorded yet</span>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-[#EEF0F2] pt-4 text-[11.5px]">
              <span className="text-[#6f7980]">{rangeLabel}</span>
              <Link href="/dashboard/visitors/analytics" className="font-semibold text-[#2878ce] hover:underline">View analytics →</Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#DDE4E8] bg-white">
          <div className="border-b border-[#E5E9EB] px-6 py-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#6D7D85]">Last 30 minutes</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-[#EAF5EE] px-2.5 py-1 text-[10px] font-semibold text-[#257A4D]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2FA266]" /> Live
              </span>
            </div>
          </div>
          <div className="px-6 py-6">
            <p className="text-[32px] font-semibold tracking-[-0.02em]">{realtime?.activeUsers ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-[#8A929C]">Active users right now</p>

            <p className="mb-3 mt-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A929C]">Active users per minute</p>
            <RealtimeSparkline realtime={realtime} />

            {!realtime?.activeUsers && (
              <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-[#DDE4E8] py-6 text-center">
                <Radio size={17} className="text-[#a0a8ae]" />
                <p className="mt-2 text-[12px] text-[#8A929C]">No active visitors</p>
              </div>
            )}
            <Link href="/dashboard/visitors/realtime" className="mt-4 block text-right text-[11.5px] font-semibold text-[#2878ce] hover:underline">View real-time →</Link>
          </div>
        </section>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <Sparkles size={15} className="text-[#7b66d9]" />
        <h3 className="text-[15px] font-semibold">Suggested for you</h3>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Insight title="Visitors by country" columns={["Country", "Users"]} rows={countries.map((row) => [row.country, String(row.visitors)] as [string, string])} />
        <Insight title="Sessions by source" columns={["Channel", "Sessions"]} rows={sources.map((row) => [row.source, String(row.sessions)] as [string, string])} />
        <Insight title="Views by page" columns={["Page title", "Views"]} rows={pages.map((row) => [row.path, String(row.views)] as [string, string])} />
      </div>

      <p className="mt-6 text-[11px] text-[#8A929C]">
        Showing analytics for <span className="font-semibold text-[#555e64]">{site ? site.domain : "all connected websites"}</span>. Data begins after the installed tag sends page events.
      </p>
    </div>
  );
}

function Insight({ title, columns, rows }: { title: string; columns: [string, string]; rows: [string, string][] }) {
  return (
    <section className="min-h-[220px] rounded-xl border border-[#DDE4E8] bg-white p-6">
      <h4 className="text-[13.5px] font-semibold">{title}</h4>
      <div className="mt-5 flex justify-between border-b border-[#EEF0F2] pb-2 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#8A929C]">
        <span>{columns[0]}</span><span>{columns[1]}</span>
      </div>
      {rows.length === 0 ? (
        <div className="flex h-28 items-center justify-center text-[11.5px] text-[#8A929C]">No data available</div>
      ) : (
        <div className="divide-y divide-[#EEF0F2]">
          {rows.slice(0, 6).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-[12px]">
              <span className="min-w-0 truncate text-[#2b2923]">{label}</span>
              <span className="shrink-0 font-medium text-[#555e64]">{value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function sourceFromReferrer(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function LiveVisitorList({ visitors }: { visitors: LiveVisitor[] }) {
  // Re-renders every second purely to advance each visitor's running
  // duration — server pushes are join/update/leave only, not a per-second
  // tick, so the clock has to keep moving locally between them.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (visitors.length === 0) {
    return <p className="rounded-xl border border-dashed border-[#DDE4E8] px-4 py-6 text-center text-[12px] text-[#8A929C]">No one is on the site right now.</p>;
  }

  return (
    <div className="divide-y divide-[#EEF0F2] overflow-hidden rounded-xl border border-[#DDE4E8]">
      {visitors.map((visitor) => {
        const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(", ") || "Unknown location";
        const durationSeconds = Math.round((Date.now() - visitor.startedAt) / 1000);
        return (
          <div key={visitor.connId} className="flex flex-wrap items-center gap-x-6 gap-y-1.5 px-4 py-3 text-[12.5px]">
            <span className="flex items-center gap-2 font-medium text-[#17181a]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#2FA266]" /> {location}
            </span>
            <span className="min-w-0 flex-1 truncate text-[#555e64]">{visitor.path}</span>
            <span className="flex items-center gap-1.5 text-[#8A929C]"><Clock3 size={12} /> {formatDuration(durationSeconds)}</span>
            <span className="text-[#8A929C]">via {sourceFromReferrer(visitor.referrer)}</span>
            <span className="w-full basis-full truncate text-[10.5px] text-[#9aa1a6]">
              Path: {visitor.pathHistory.map((entry) => entry.path).join(" → ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReportView({
  view, site, loading, summary, trend, realtime, liveVisitors, countries, pages, sources,
}: {
  view: Exclude<VisitorView, "overview">; site: SiteTag | null; loading: boolean; summary: Summary | null; trend: TrendPoint[]; realtime: Realtime | null; liveVisitors: LiveVisitor[];
  countries: CountryRow[]; pages: PageRow[]; sources: SourceRow[];
}) {
  const hasData =
    view === "realtime" ? Boolean(realtime?.activeUsers || liveVisitors.length > 0) :
    view === "pages" ? pages.length > 0 :
    Boolean(summary && (summary.totalPageviews > 0 || summary.totalSessions > 0));

  return (
    <div className="mt-7 overflow-hidden rounded-xl border border-[#DDE4E8] bg-white">
      <div className="border-b border-[#E5E9EB] px-6 py-5">
        <h3 className="text-[16px] font-semibold">{titles[view][0]}</h3>
        <p className="mt-1 text-[12px] text-[#667069]">{site ? site.domain : "All connected websites"}</p>
      </div>

      {loading ? (
        <div className="flex min-h-[340px] items-center justify-center text-[12px] text-[#687178]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading</div>
      ) : !hasData ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] text-[#667078]"><Activity size={19} /></span>
          <p className="mt-3 text-[14px] font-semibold">No analytics received yet</p>
          <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#687178]">This report will populate automatically when visitors open pages on the selected website.</p>
        </div>
      ) : view === "realtime" ? (
        <div className="p-6">
          <p className="text-[32px] font-semibold tracking-[-0.02em]">{realtime?.activeUsers ?? 0}</p>
          <p className="mt-0.5 text-[11px] text-[#8A929C]">Active users right now</p>
          <p className="mb-3 mt-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A929C]">Active users per minute (last 30 minutes)</p>
          <RealtimeSparkline realtime={realtime} />
          <p className="mb-3 mt-8 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A929C]">Live visitors</p>
          <LiveVisitorList visitors={liveVisitors} />
        </div>
      ) : view === "pages" ? (
        <div className="divide-y divide-[#EEF0F2]">
          <div className="grid grid-cols-[1fr_100px] px-6 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#8A929C]"><span>Page</span><span>Views</span></div>
          {pages.map((row) => (
            <div key={row.path} className="grid grid-cols-[1fr_100px] items-center px-6 py-3 text-[13px]">
              <span className="min-w-0 truncate text-[#2b2923]">{row.path}</span>
              <span className="font-medium text-[#555e64]">{row.views}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Visitors" value={String(summary?.totalVisitors ?? 0)} />
            <StatCard label="Page views" value={String(summary?.totalPageviews ?? 0)} />
            <StatCard label="Sessions" value={String(summary?.totalSessions ?? 0)} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Insight title="Visitors by country" columns={["Country", "Users"]} rows={countries.map((row) => [row.country, String(row.visitors)] as [string, string])} />
            <Insight title="Sessions by source" columns={["Channel", "Sessions"]} rows={sources.map((row) => [row.source, String(row.sessions)] as [string, string])} />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyConnect() {
  return (
    <div className="mt-7 flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-[#DDE4E8] bg-white text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F2F4] text-[#667078]"><Globe2 size={20} /></span>
      <p className="mt-3 text-[14px] font-semibold">Connect a website to view analytics</p>
      <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#687178]">Add a site tag and install the snippet — visitor data will start appearing here automatically.</p>
      <Link href="/dashboard/connect" className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-[#202225] px-4 text-[12px] font-semibold text-white transition hover:bg-black">
        <Globe2 size={14} /> Open Connect
      </Link>
    </div>
  );
}
