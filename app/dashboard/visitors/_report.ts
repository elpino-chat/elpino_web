// Types and pure helpers for the Web analytics dashboard. No React, no fetch —
// everything here is unit-tested in _report.test.ts.

export type Interval = "hour" | "day" | "week" | "month";
export type CompareMode = "previous_period" | "previous_year" | "none";
export type DeviceFilter = "" | "Desktop" | "Mobile" | "Tablet";
export type MetricKey = "visitors" | "pageviews" | "sessions";

export type Summary = { visitors: number; pageviews: number; sessions: number; bounceRate: number; avgDurationSeconds: number };
export type TrendPoint = { date: string; visitors: number; pageviews: number; sessions: number };
export type PathRow = { path: string; visitors: number; views: number; bounceRate: number | null };
export type ChannelRow = { channel: string; visitors: number; views: number };
export type DeviceRow = { device: string; visitors: number; views: number };
export type CountryRow = { country: string; visitors: number };
export type ReportData = {
  summary: Summary;
  trend: TrendPoint[];
  pages: PathRow[];
  channels: ChannelRow[];
  devices: DeviceRow[];
  countries: CountryRow[];
  truncated: boolean;
};

export type Filters = { path: string; country: string; device: DeviceFilter };
export const NO_FILTERS: Filters = { path: "", country: "", device: "" };
export const hasFilters = (filters: Filters) => Boolean(filters.path.trim() || filters.country.trim() || filters.device);

const DAY_MS = 24 * 60 * 60 * 1000;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const parse = (value: string) => new Date(`${value}T00:00:00Z`);

/** Number of days in an inclusive YYYY-MM-DD range. */
export function rangeDays(from: string, to: string): number {
  return Math.max(1, Math.round((parse(to).getTime() - parse(from).getTime()) / DAY_MS) + 1);
}

/** The window the current one is compared against, or null for "no comparison". */
export function comparisonRange(from: string, to: string, mode: CompareMode): { from: string; to: string } | null {
  if (mode === "none") return null;
  if (mode === "previous_year") {
    const shift = (value: string) => {
      const d = parse(value);
      d.setUTCFullYear(d.getUTCFullYear() - 1);
      return iso(d);
    };
    return { from: shift(from), to: shift(to) };
  }
  const days = rangeDays(from, to);
  const priorTo = new Date(parse(from).getTime() - DAY_MS);
  const priorFrom = new Date(priorTo.getTime() - (days - 1) * DAY_MS);
  return { from: iso(priorFrom), to: iso(priorTo) };
}

/** Sensible default bucket size for a range: hourly for a day, daily up to two months, weekly beyond. */
export function defaultInterval(days: number): Interval {
  if (days <= 1) return "hour";
  return days <= 62 ? "day" : "week";
}

/** % change from prior to current; null when there is no meaningful base (prior is 0 but current isn't). */
export function deltaPercent(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

export function formatDelta(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
}

export type Direction = "up" | "down" | "flat";
export function direction(current: number, prior: number): Direction {
  return current > prior ? "up" : current < prior ? "down" : "flat";
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });
export function formatCompact(value: number): string {
  return Math.abs(value) < 1000 ? String(Math.round(value)) : compact.format(value);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

/**
 * Round the top of a chart axis up to a tidy number and return evenly spaced
 * ticks from 0. Tries 4 and 5 intervals with 1/2/5 steps and keeps whichever
 * wastes the least headroom (21 -> 0..25 by 5, not 0..40).
 */
export function niceScale(max: number): { top: number; ticks: number[] } {
  const safe = Math.max(1, max);
  let best: { top: number; step: number; count: number } | null = null;
  for (const count of [4, 5]) {
    const rough = safe / count;
    const magnitude = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ?? 10 * magnitude;
    const top = step * count;
    if (!best || top < best.top) best = { top, step, count };
  }
  const { top, step, count } = best!;
  return { top, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

/**
 * SVG path through the points as a smooth monotone cubic (Fritsch–Carlson), so
 * the curve never overshoots below zero or above a real peak the way a plain
 * spline would.
 */
export function smoothPath(points: readonly (readonly [number, number])[]): string {
  const n = points.length;
  if (n === 0) return "";
  const fmt = (v: number) => v.toFixed(2);
  if (n === 1) return `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  if (n === 2) return `M${fmt(points[0][0])} ${fmt(points[0][1])} L${fmt(points[1][0])} ${fmt(points[1][1])}`;

  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0]);
    slope.push(dx[i] === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx[i]);
  }
  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }

  let path = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    path += ` C${fmt(points[i][0] + h)} ${fmt(points[i][1] + tangent[i] * h)} ${fmt(points[i + 1][0] - h)} ${fmt(points[i + 1][1] - tangent[i + 1] * h)} ${fmt(points[i + 1][0])} ${fmt(points[i + 1][1])}`;
  }
  return path;
}

export function bucketStartMs(date: string, interval: Interval): number {
  return new Date(interval === "hour" ? `${date}:00Z` : `${date}T00:00:00Z`).getTime();
}

export function bucketEndMs(date: string, interval: Interval): number {
  const start = bucketStartMs(date, interval);
  if (interval === "hour") return start + 60 * 60 * 1000;
  if (interval === "day") return start + DAY_MS;
  if (interval === "week") return start + 7 * DAY_MS;
  const d = new Date(start);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.getTime();
}

/** True while `now` falls inside the bucket — its number is still growing. */
export function isBucketIncomplete(date: string, interval: Interval, now = Date.now()): boolean {
  return now >= bucketStartMs(date, interval) && now < bucketEndMs(date, interval);
}

/** Drops buckets that haven't started yet, so "Today" doesn't draw the rest of the day as zero. */
export function dropFuture<T extends { date: string }>(points: T[], interval: Interval, now = Date.now()): T[] {
  return points.filter((point) => bucketStartMs(point.date, interval) <= now);
}

export const METRICS: { key: MetricKey; label: string }[] = [
  { key: "visitors", label: "Unique visitors" },
  { key: "pageviews", label: "Page views" },
  { key: "sessions", label: "Sessions" },
];

/** "Sep 28" for day/week/month buckets, "2 PM" for hourly ones. */
export function formatBucket(date: string, interval: Interval): string {
  const d = new Date(interval === "hour" ? `${date}:00Z` : `${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  if (interval === "hour") return d.toLocaleTimeString("en", { hour: "numeric", timeZone: "UTC" });
  if (interval === "month") return d.toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

export type Preset = { id: string; name: string; range: string; startDate: string; endDate: string; compare: CompareMode; siteId: string; filters: Filters };
