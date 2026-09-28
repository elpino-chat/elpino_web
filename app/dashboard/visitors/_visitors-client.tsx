"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bone } from "@/app/components/dashboard/DashboardSkeleton";
import { Activity, Bookmark, Check, ChevronDown, Clock3, Filter, Globe2, Link2, Lock, PieChart, Plus, RefreshCw, X } from "lucide-react";
import { ChannelsTable, DevicesTable, KpiCard, PathsTable, Card, CardTitle, TrendChart, WorldMap } from "./_components";
import {
  NO_FILTERS, METRICS, comparisonRange, defaultInterval, dropFuture, formatCompact, formatDuration, formatPercent, hasFilters, rangeDays,
  type CompareMode, type Filters, type Interval, type MetricKey, type Preset, type ReportData,
} from "./_report";

export type VisitorView = "overview" | "realtime" | "analytics" | "pages" | "installation";
type SiteTag = { id: string; name: string; domain: string; status: "verified" | "unverified"; lastUsedAt: string | null };
type Realtime = { activeUsers: number; perMinute: { minute: string; visitors: number }[] };
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

const intervalOptions: { value: Interval; label: string }[] = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const PRESETS_KEY = "elpino.analytics.presets";

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


type ReportResponse = { report: ReportData | null; upgradeRequired?: boolean; error?: string };

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
  const [intervalOverride, setIntervalOverride] = useState<Interval | null>(null);
  const [metric, setMetric] = useState<MetricKey>("visitors");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");

  const [report, setReport] = useState<ReportData | null>(null);
  const [priorReport, setPriorReport] = useState<ReportData | null>(null);
  const [realtime, setRealtime] = useState<Realtime | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [upgradeRequired, setUpgradeRequired] = useState<string | null>(null);
  const requestId = useRef(0);

  function loadSites() {
    return fetch("/api/workspace/sites", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { sites?: SiteTag[] }) => setSites(data.sites ?? []))
      .catch(() => setSites([]));
  }

  useEffect(() => {
    loadSites().finally(() => setLoading(false));
    try {
      const saved = JSON.parse(window.localStorage.getItem(PRESETS_KEY) ?? "[]") as Preset[];
      if (Array.isArray(saved)) setPresets(saved);
    } catch { /* unreadable presets — start empty */ }
  }, []);

  function rangeToDates() {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    if (range === "custom") return { from: startDate, to: endDate };
    const days = Number(range);
    const fromDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return { from: fromDate.toISOString().slice(0, 10), to: toStr };
  }

  const { from, to } = rangeToDates();
  const days = from && to ? rangeDays(from, to) : 7;
  const interval: Interval = intervalOverride ?? defaultInterval(days);

  function fetchReport(fromDate: string, toDate: string): Promise<ReportResponse> {
    const params = new URLSearchParams({ from: fromDate, to: toDate, interval });
    if (selectedId !== "__all__") params.set("siteId", selectedId);
    if (filters.path.trim()) params.set("path", filters.path.trim());
    if (filters.country.trim()) params.set("country", filters.country.trim());
    if (filters.device) params.set("device", filters.device);
    return fetch(`/api/workspace/analytics/report?${params.toString()}`).then((r) => (r.ok ? r.json() : { report: null }));
  }

  function loadAnalytics() {
    if (!from || !to) return;
    const ticket = ++requestId.current;
    const prior = comparisonRange(from, to, compareMode);
    setAnalyticsLoading(true);
    setUpgradeRequired(null);
    Promise.all([fetchReport(from, to), prior ? fetchReport(prior.from, prior.to) : Promise.resolve(null)])
      .then(([current, before]) => {
        if (ticket !== requestId.current) return; // a newer request superseded this one
        if (current.upgradeRequired) {
          setUpgradeRequired(current.error ?? "Visitor analytics is not included on your current plan.");
          setReport(null);
          setPriorReport(null);
          return;
        }
        setReport(current.report);
        setPriorReport(before?.report ?? null);
      })
      .catch(() => undefined)
      .finally(() => { if (ticket === requestId.current) setAnalyticsLoading(false); });
  }

  useEffect(() => {
    if (sites.length === 0) return;
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites.length, selectedId, range, startDate, endDate, compareMode, interval, filters]);

  // Realtime polls on its own, independent of the date range.
  useEffect(() => {
    if (sites.length === 0) return;
    const query = selectedId !== "__all__" ? `?siteId=${encodeURIComponent(selectedId)}` : "";
    const poll = () => {
      fetch(`/api/workspace/analytics/realtime${query}`)
        .then((r) => (r.ok ? r.json() : { realtime: null }))
        .then((data: { realtime: Realtime | null }) => setRealtime(data.realtime))
        .catch(() => undefined);
    };
    poll();
    const timer = window.setInterval(poll, 20000);
    return () => window.clearInterval(timer);
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
    } catch { /* clipboard unavailable — ignore */ }
  }

  function savePresets(next: Preset[]) {
    setPresets(next);
    try { window.localStorage.setItem(PRESETS_KEY, JSON.stringify(next)); } catch { /* storage unavailable — keep in memory */ }
  }

  function saveCurrentPreset() {
    const name = presetName.trim();
    if (!name) return;
    savePresets([...presets, { id: `${Date.now()}`, name, range, startDate, endDate, compare: compareMode, siteId: selectedId, filters }]);
    setPresetName("");
  }

  function applyPreset(preset: Preset) {
    setRange(preset.range as typeof range);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setShowCustomRange(false);
    setCompareMode(preset.compare);
    setSelectedId(sites.some((site) => site.id === preset.siteId) ? preset.siteId : "__all__");
    setFilters(preset.filters);
    setDraft(preset.filters);
    setPresetsOpen(false);
  }

  const selectedSite = useMemo(() => (selectedId === "__all__" ? null : sites.find((site) => site.id === selectedId) ?? null), [selectedId, sites]);
  const rangeLabel =
    range === "custom" && startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
      : rangeOptions.find((option) => option.value === range)?.label ?? "Custom range";
  const domainLabel = selectedSite ? selectedSite.domain : "All domains";
  const compareLabel = compareOptions.find((option) => option.value === compareMode)?.label ?? "Previous period";
  const showFullToolbar = view === "overview" || view === "analytics" || view === "pages";
  const showDomainOnly = view === "realtime";

  const controlClass = "flex h-9 items-center gap-2 rounded-lg border border-[var(--av-line)] bg-[var(--av-card)] px-3 text-[13.5px] text-[var(--av-text)] shadow-[0_1px_0_var(--av-line)] transition hover:bg-[var(--av-hover)]";
  const fieldClass = "mt-1 block h-9 w-full rounded-lg border border-[#DDE4E8] bg-white px-3 text-[13px] text-[#17181a] outline-none focus:border-[#8f989e]";
  const menuItem = (active: boolean) => `flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] font-medium ${active ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`;

  const domainPicker = sites.length > 0 ? (
    <Popover open={domainOpen} onOpenChange={setDomainOpen}>
      <PopoverTrigger data-tour="analytics-site" className={controlClass}>
        <Globe2 size={15} className="text-[var(--av-muted)]" /> {domainLabel} <ChevronDown size={13} className="text-[var(--av-muted)]" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px]">
        <button type="button" onClick={() => { setSelectedId("__all__"); setDomainOpen(false); }} className={menuItem(selectedId === "__all__")}>
          All domains {selectedId === "__all__" && <Check size={14} className="text-[#11120f]" />}
        </button>
        <div className="my-1 border-t border-[#eceeef]" />
        <SiteList sites={sites} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setDomainOpen(false); }} />
      </PopoverContent>
    </Popover>
  ) : (
    <Link href="/dashboard/connect" className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[var(--av-solid)] px-4 text-[13px] font-medium text-[var(--av-solid-text)] transition hover:opacity-90">Connect website</Link>
  );

  const refreshButton = (
    <button type="button" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh" className={`${controlClass} w-9 justify-center px-0 disabled:opacity-60`}>
      <RefreshCw size={15} className={`text-[var(--av-text)] ${refreshing ? "animate-spin" : ""}`} />
    </button>
  );

  return (
    <div className="dashboard-analytics-shell flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
      <main className="dashboard-page-surface dashboard-visitors-main-surface flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="dashboard-analytics-canvas mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8">
          <div className="flex items-center gap-3">
            <PieChart size={22} className="text-[var(--av-good)]" />
            <h1 className="text-[24px] font-medium tracking-[-0.02em] text-[var(--av-text)]">Web analytics</h1>
          </div>
          <p className="mt-3 text-[15px] text-[var(--av-text)]">Analyze your web analytics data to understand website performance and user behavior.</p>


          {(showFullToolbar || showDomainOnly) && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--av-line)] py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {refreshButton}
                {showFullToolbar && (
                  <>
                    <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
                      <PopoverTrigger data-tour="analytics-range" className={controlClass}>
                        <Clock3 size={15} className="text-[var(--av-muted)]" /> {rangeLabel} <ChevronDown size={13} className="text-[var(--av-muted)]" />
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[220px]">
                        {rangeOptions.map((option) => (
                          <button key={option.value} type="button" onClick={() => { setRange(option.value); setShowCustomRange(false); setRangeOpen(false); }} className={menuItem(range === option.value)}>
                            {option.label} {range === option.value && <Check size={14} className="text-[#11120f]" />}
                          </button>
                        ))}
                        <div className="my-1 border-t border-[#eceeef]" />
                        <button type="button" onClick={() => { setRange("custom"); setShowCustomRange(true); setRangeOpen(false); }} className={menuItem(range === "custom")}>
                          Custom range… {range === "custom" && <Check size={14} className="text-[#11120f]" />}
                        </button>
                      </PopoverContent>
                    </Popover>

                    <Popover open={compareOpen} onOpenChange={setCompareOpen}>
                      <PopoverTrigger data-tour="analytics-compare" className={controlClass}>
                        <Activity size={15} className="text-[var(--av-muted)]" /> {compareLabel} <ChevronDown size={13} className="text-[var(--av-muted)]" />
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[200px]">
                        {compareOptions.map((option) => (
                          <button key={option.value} type="button" onClick={() => { setCompareMode(option.value); setCompareOpen(false); }} className={menuItem(compareMode === option.value)}>
                            {option.label} {compareMode === option.value && <Check size={14} className="text-[#11120f]" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {domainPicker}
                {showFullToolbar && (
                  <>
                    <Popover open={filtersOpen} onOpenChange={(open) => { setFiltersOpen(open); if (open) setDraft(filters); }}>
                      <PopoverTrigger className={controlClass}>
                        <Filter size={15} className="text-[var(--av-muted)]" /> Filters
                        {hasFilters(filters) && <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--av-tab)] px-1 text-[11px] font-bold text-white">{[filters.path.trim(), filters.country.trim(), filters.device].filter(Boolean).length}</span>}
                        <ChevronDown size={13} className="text-[var(--av-muted)]" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[290px]">
                        <div className="space-y-3 p-1.5">
                          <label className="block text-[12px] font-medium text-[#68727a]">
                            Path contains
                            <input value={draft.path} onChange={(event) => setDraft({ ...draft, path: event.target.value })} placeholder="/pricing" className={fieldClass} />
                          </label>
                          <label className="block text-[12px] font-medium text-[#68727a]">
                            Country code
                            <input value={draft.country} maxLength={2} onChange={(event) => setDraft({ ...draft, country: event.target.value.toUpperCase() })} placeholder="IN" className={fieldClass} />
                          </label>
                          <label className="block text-[12px] font-medium text-[#68727a]">
                            Device
                            <select value={draft.device} onChange={(event) => setDraft({ ...draft, device: event.target.value as Filters["device"] })} className={fieldClass}>
                              <option value="">All devices</option>
                              <option value="Desktop">Desktop</option>
                              <option value="Mobile">Mobile</option>
                              <option value="Tablet">Tablet</option>
                            </select>
                          </label>
                          <div className="flex items-center justify-between pt-1">
                            <button type="button" onClick={() => { setFilters(NO_FILTERS); setDraft(NO_FILTERS); setFiltersOpen(false); }} className="h-8 rounded-lg px-2.5 text-[12.5px] font-medium text-[#68727a] hover:bg-[#f7f8f8]">Clear</button>
                            <button type="button" onClick={() => { setFilters(draft); setFiltersOpen(false); }} className="h-8 rounded-lg bg-[#17191b] px-3.5 text-[12.5px] font-medium text-white hover:bg-black">Apply</button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={presetsOpen} onOpenChange={setPresetsOpen}>
                      <PopoverTrigger className={controlClass}>
                        <Bookmark size={15} className="text-[var(--av-muted)]" /> Presets <ChevronDown size={13} className="text-[var(--av-muted)]" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[280px]">
                        <div className="p-1.5">
                          {presets.length === 0 ? (
                            <p className="px-1 py-2 text-[12px] leading-5 text-[#8a9298]">Save the current date range, comparison, website and filters to come back to them in one click.</p>
                          ) : (
                            <ul className="mb-2 max-h-52 overflow-y-auto">
                              {presets.map((preset) => (
                                <li key={preset.id} className="flex items-center gap-1">
                                  <button type="button" onClick={() => applyPreset(preset)} className="min-w-0 flex-1 truncate rounded-lg px-2.5 py-2 text-left text-[13px] font-medium hover:bg-[#f7f8f8]">{preset.name}</button>
                                  <button type="button" aria-label={`Delete preset ${preset.name}`} onClick={() => savePresets(presets.filter((item) => item.id !== preset.id))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8a9298] hover:bg-[#f0f2f3] hover:text-[#a64a53]"><X size={13} /></button>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="flex gap-2 border-t border-[#eceeef] pt-2.5">
                            <input value={presetName} onChange={(event) => setPresetName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveCurrentPreset(); }} placeholder="Preset name" maxLength={40} className="h-9 min-w-0 flex-1 rounded-lg border border-[#DDE4E8] bg-white px-3 text-[13px] text-[#17181a] outline-none focus:border-[#8f989e]" />
                            <button type="button" disabled={!presetName.trim()} onClick={saveCurrentPreset} aria-label="Save preset" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#17191b] text-white hover:bg-black disabled:opacity-40"><Plus size={15} /></button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <button type="button" onClick={() => void copyLink()} aria-label="Copy link" className={`${controlClass} relative w-9 justify-center px-0`}>
                      <Link2 size={15} className="text-[var(--av-text)]" />
                      {copied && <span className="absolute -bottom-8 right-0 z-10 whitespace-nowrap rounded-md bg-[#11120f] px-2 py-1 text-[11px] font-medium text-white">Copied!</span>}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {showFullToolbar && showCustomRange && (
            <div className="mt-4 flex flex-wrap items-end justify-end gap-3 rounded-xl border border-[var(--av-line)] bg-[var(--av-card)] p-4">
              <label className="text-[12px] font-medium text-[var(--av-muted)]">
                Start date
                <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-[var(--av-line)] bg-transparent px-3 text-[13px] text-[var(--av-text)] outline-none focus:border-[var(--av-muted)]" />
              </label>
              <span className="pb-2 text-[var(--av-muted)]">→</span>
              <label className="text-[12px] font-medium text-[var(--av-muted)]">
                End date
                <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block h-9 rounded-lg border border-[var(--av-line)] bg-transparent px-3 text-[13px] text-[var(--av-text)] outline-none focus:border-[var(--av-muted)]" />
              </label>
              <button type="button" disabled={!startDate || !endDate} onClick={() => setShowCustomRange(false)} className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--av-solid)] px-4 text-[13px] font-medium text-[var(--av-solid-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                <Check size={13} /> Apply
              </button>
            </div>
          )}

          {loading ? (
            <AnalyticsSkeleton view={view} />
          ) : sites.length === 0 ? (
            <EmptyBlock icon={Globe2} title="Connect a website to view analytics" body="Add a site tag and install the snippet — visitor data will start appearing here automatically." href="/dashboard/connect" cta="Open Connect" />
          ) : view === "installation" ? (
            <InstallationHealth sites={sites} />
          ) : view === "realtime" ? (
            <LiveView realtime={realtime} liveVisitors={liveVisitors} scope={selectedSite ? selectedSite.domain : "All connected websites"} />
          ) : upgradeRequired ? (
            <EmptyBlock icon={Lock} title="Upgrade to unlock analytics" body={upgradeRequired} href="/pricing#plans" cta="View plans" />
          ) : analyticsLoading && !report ? (
            <AnalyticsSkeleton view={view} />
          ) : !report ? (
            <EmptyBlock icon={Activity} title="Analytics could not be loaded" body="Something went wrong fetching this report. Try refreshing." />
          ) : view === "pages" ? (
            <div className="mt-5">
              <PathsTable title="Page reports" rows={report.pages} priorRows={priorReport?.pages ?? null} limit={50} />
            </div>
          ) : (
            <div className={`mt-5 space-y-4 transition-opacity ${analyticsLoading ? "opacity-60" : ""}`}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <KpiCard label="Visitors" current={report.summary.visitors} prior={priorReport?.summary.visitors ?? null} format={formatCompact} />
                <KpiCard label="Page views" current={report.summary.pageviews} prior={priorReport?.summary.pageviews ?? null} format={formatCompact} />
                <KpiCard label="Sessions" current={report.summary.sessions} prior={priorReport?.summary.sessions ?? null} format={formatCompact} />
                <KpiCard label="Session duration" current={report.summary.avgDurationSeconds} prior={priorReport?.summary.avgDurationSeconds ?? null} format={formatDuration} />
                <KpiCard label="Bounce rate" current={report.summary.bounceRate} prior={priorReport?.summary.bounceRate ?? null} format={formatPercent} higherIsBetter={false} />
              </div>

              <Card className="pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5">
                  <Popover>
                    <PopoverTrigger className="flex items-center gap-1.5 text-[17px] font-medium text-[var(--av-text)]">
                      <span className="underline decoration-dotted decoration-[var(--av-muted)] underline-offset-[5px]">{METRICS.find((m) => m.key === metric)?.label}</span>
                      <ChevronDown size={15} className="text-[var(--av-muted)]" />
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[200px]">
                      {METRICS.map((option) => (
                        <button key={option.key} type="button" onClick={() => setMetric(option.key)} className={menuItem(metric === option.key)}>
                          {option.label} {metric === option.key && <Check size={14} className="text-[#11120f]" />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--av-muted)]">
                    Interval
                    <Popover>
                      <PopoverTrigger className={`${controlClass} h-8`}>
                        {intervalOptions.find((option) => option.value === interval)?.label} <ChevronDown size={13} className="text-[var(--av-muted)]" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[150px]">
                        {intervalOptions.map((option) => (
                          <button key={option.value} type="button" onClick={() => setIntervalOverride(option.value)} className={menuItem(interval === option.value)}>
                            {option.label} {interval === option.value && <Check size={14} className="text-[#11120f]" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <TrendChart
                  series={dropFuture(report.trend, interval).map((point) => ({ date: point.date, value: point[metric] }))}
                  prior={priorReport ? priorReport.trend.map((point) => ({ date: point.date, value: point[metric] })) : null}
                  interval={interval}
                  label={METRICS.find((m) => m.key === metric)?.label ?? ""}
                />
              </Card>

              <PathsTable rows={report.pages} priorRows={priorReport?.pages ?? null} />

              <div className="grid gap-4 lg:grid-cols-2">
                <ChannelsTable rows={report.channels} priorRows={priorReport?.channels ?? null} />
                <DevicesTable rows={report.devices} priorRows={priorReport?.devices ?? null} />
              </div>

              <WorldMap countries={report.countries} />

              <p className="text-[12px] text-[var(--av-muted)]">
                Showing <span className="text-[var(--av-text)]">{selectedSite ? selectedSite.domain : "all connected websites"}</span>
                {hasFilters(filters) ? " with filters applied" : ""}. Data begins after the installed tag sends page events.
                {report.truncated && " This range has more page views than can be summarised at once, so figures are a lower bound."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
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


function formatSeconds(seconds: number) {
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

function RealtimeSparkline({ realtime }: { realtime: Realtime | null }) {
  const buckets = Array.from({ length: 30 }, (_, index) => {
    const minute = new Date(Date.now() - (29 - index) * 60 * 1000);
    minute.setSeconds(0, 0);
    const match = realtime?.perMinute.find((row) => new Date(row.minute).getTime() === minute.getTime());
    return match?.visitors ?? 0;
  });
  const max = Math.max(1, ...buckets);
  return (
    <div className="flex h-16 items-end gap-[3px]" aria-hidden="true">
      {buckets.map((value, index) => (
        <span key={index} className="flex-1 rounded-t-sm bg-[var(--av-chart)]" style={{ height: `${Math.max(6, (value / max) * 100)}%`, opacity: value > 0 ? 0.8 : 0.18 }} />
      ))}
    </div>
  );
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
    return <p className="px-5 py-10 text-center text-[13px] text-[var(--av-muted)]">No one is on the site right now.</p>;
  }

  return (
    <ul className="divide-y divide-[var(--av-line)]">
      {visitors.map((visitor) => {
        const location = [visitor.city, visitor.region, visitor.country].filter(Boolean).join(", ") || "Unknown location";
        const durationSeconds = Math.round((Date.now() - visitor.startedAt) / 1000);
        return (
          <li key={visitor.connId} className="px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px]">
              <span className="flex items-center gap-2 font-medium text-[var(--av-text)]"><span className="h-2 w-2 shrink-0 rounded-full bg-[var(--av-good)]" /> {location}</span>
              <span className="min-w-0 flex-1 truncate text-[var(--av-muted)]">{visitor.path}</span>
              <span className="flex items-center gap-1.5 tabular-nums text-[var(--av-muted)]"><Clock3 size={13} /> {formatSeconds(durationSeconds)}</span>
              <span className="text-[var(--av-muted)]">via {sourceFromReferrer(visitor.referrer)}</span>
            </div>
            {visitor.pathHistory.length > 1 && (
              <p className="mt-1 truncate pl-4 text-[12px] text-[var(--av-muted)]">{visitor.pathHistory.map((entry) => entry.path).join(" → ")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LiveView({ realtime, liveVisitors, scope }: { realtime: Realtime | null; liveVisitors: LiveVisitor[]; scope: string }) {
  const active = realtime?.activeUsers ?? 0;
  return (
    <div className="mt-5 space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle subject="Active now" />
            <p className="mt-1 text-[13px] text-[var(--av-muted)]">{scope} · last 30 minutes</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[var(--av-good-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--av-good)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--av-good)]" /> Live
          </span>
        </div>
        <p className="mt-5 text-[40px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[var(--av-text)]">{active.toLocaleString()}</p>
        <p className="mt-1.5 text-[13px] text-[var(--av-muted)]">{active === 1 ? "person" : "people"} on your site right now</p>
        <div className="mt-6"><RealtimeSparkline realtime={realtime} /></div>
      </Card>
      <Card className="pt-5">
        <div className="px-5 pb-4"><CardTitle subject="Live visitors" /><p className="mt-1 text-[13px] text-[var(--av-muted)]">{liveVisitors.length.toLocaleString()} connected</p></div>
        <div className="border-t border-[var(--av-line)]"><LiveVisitorList visitors={liveVisitors} /></div>
      </Card>
    </div>
  );
}

function InstallationHealth({ sites }: { sites: SiteTag[] }) {
  return (
    <div className="mt-5 space-y-4">
      <Card className="pt-5">
        <div className="px-5 pb-4"><CardTitle subject="Installation health" /><p className="mt-1 text-[13px] text-[var(--av-muted)]">Whether each website&apos;s tag has been seen sending data.</p></div>
        <ul className="border-t border-[var(--av-line)]">
          {sites.map((site) => {
            const ok = site.status === "verified";
            return (
              <li key={site.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-[var(--av-line)] px-5 py-4 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[var(--av-text)]">{site.name}</p>
                  <p className="truncate text-[13px] text-[var(--av-muted)]">{site.domain}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${ok ? "bg-[var(--av-good-soft)] text-[var(--av-good)]" : "bg-[var(--av-bad-soft)] text-[var(--av-bad)]"}`}>{ok ? "Verified" : "Not verified"}</span>
                <span className="w-44 text-right text-[13px] text-[var(--av-muted)]">{site.lastUsedAt ? `Last seen ${new Date(site.lastUsedAt).toLocaleString()}` : "No data received yet"}</span>
                {!ok && <Link href="/dashboard/connect" className="text-[13px] font-medium text-[var(--av-tab)] hover:underline">Finish setup →</Link>}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function EmptyBlock({ icon: Icon, title, body, href, cta }: { icon: typeof Activity; title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="mt-5 flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--av-line)] bg-[var(--av-card)] px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--av-hover)] text-[var(--av-muted)]"><Icon size={19} /></span>
      <p className="mt-3 text-[15px] font-medium text-[var(--av-text)]">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-[var(--av-muted)]">{body}</p>
      {href && cta && (
        <Link href={href} className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-[var(--av-solid)] px-4 text-[13px] font-medium text-[var(--av-solid-text)] transition hover:opacity-90">{cta}</Link>
      )}
    </div>
  );
}

// Grey placeholder in the shape of the report being loaded.
function AnalyticsSkeleton({ view }: { view: VisitorView }) {
  const card = "rounded-xl border border-[var(--av-line)] bg-[var(--av-card)] p-5";
  const rows = (count: number) => <div className="mt-5 space-y-3">{Array.from({ length: count }, (_, row) => <Bone key={row} className="h-8 w-full" />)}</div>;
  if (view === "pages" || view === "installation") {
    return <div role="status" aria-busy="true" aria-label="Loading" className={`mt-5 ${card}`}><Bone className="h-5 w-32" />{rows(8)}</div>;
  }
  if (view === "realtime") {
    return (
      <div role="status" aria-busy="true" aria-label="Loading" className="mt-5 space-y-4">
        <div className={card}><Bone className="h-5 w-32" /><Bone className="mt-5 h-10 w-20" /><Bone className="mt-6 h-16 w-full" /></div>
        <div className={card}><Bone className="h-5 w-36" />{rows(4)}</div>
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true" aria-label="Loading analytics" className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((tile) => <div key={tile} className={card}><Bone className="h-4 w-24" /><Bone className="mt-4 h-9 w-24" /><Bone className="mt-4 h-3 w-20" /></div>)}
      </div>
      <div className={card}><Bone className="h-5 w-40" /><Bone className="mt-5 h-[300px] w-full" /></div>
      <div className={card}><Bone className="h-5 w-24" />{rows(6)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}><Bone className="h-5 w-40" />{rows(3)}</div>
        <div className={card}><Bone className="h-5 w-40" />{rows(3)}</div>
      </div>
    </div>
  );
}
