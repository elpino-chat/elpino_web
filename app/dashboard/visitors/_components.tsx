"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Monitor, Smartphone, Tablet, TrendingDown, TrendingUp } from "lucide-react";
import {
  deltaPercent, direction, formatBucket, formatCompact, formatDelta, formatPercent, isBucketIncomplete, niceScale, smoothPath,
  type ChannelRow, type CountryRow, type DeviceRow, type Direction, type Interval, type PathRow,
} from "./_report";

// ── shared bits ────────────────────────────────────────────────────────────

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[var(--av-line)] bg-[var(--av-card)] ${className}`}>{children}</section>;
}

/** "Sources by Channel": the last word is underlined, as if it were the picker it is in tools that have one. */
export function CardTitle({ prefix, subject }: { prefix?: string; subject: string }) {
  return (
    <h3 className="text-[17px] font-medium text-[var(--av-text)]">
      {prefix && <>{prefix} </>}
      <span className={prefix ? "underline decoration-dotted decoration-[var(--av-muted)] underline-offset-[5px]" : ""}>{subject}</span>
    </h3>
  );
}

const toneClass = { good: "text-[var(--av-good)]", bad: "text-[var(--av-bad)]", flat: "text-[var(--av-muted)]" } as const;
type Tone = keyof typeof toneClass;

/** up/down are good or bad depending on the metric (a falling bounce rate is good). */
function toneFor(dir: Direction, higherIsBetter: boolean): Tone {
  if (dir === "flat") return "flat";
  return (dir === "up") === higherIsBetter ? "good" : "bad";
}

function TrendArrow({ current, prior, higherIsBetter = true }: { current: number; prior: number; higherIsBetter?: boolean }) {
  const dir = direction(current, prior);
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : ArrowRight;
  return <Icon size={13} className={`shrink-0 ${toneClass[toneFor(dir, higherIsBetter)]}`} aria-label={dir === "flat" ? "unchanged" : dir === "up" ? "up" : "down"} />;
}

// ── KPI card ───────────────────────────────────────────────────────────────

export function KpiCard({
  label, current, prior, format, higherIsBetter = true,
}: {
  label: string; current: number; prior: number | null; format: (value: number) => string; higherIsBetter?: boolean;
}) {
  const pct = prior === null ? null : deltaPercent(current, prior);
  const tone = prior === null ? "flat" : toneFor(direction(current, prior), higherIsBetter);
  const pillBg = tone === "good" ? "bg-[var(--av-good-soft)]" : tone === "bad" ? "bg-[var(--av-bad-soft)]" : "bg-[var(--av-hover)]";
  return (
    <article className="rounded-xl border border-[var(--av-line)] bg-[var(--av-card)] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-medium text-[var(--av-text)]">{label}</p>
        {pct !== null && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium ${pillBg} ${toneClass[tone]}`}>
            {pct !== 0 && <ChevronDown size={11} className={pct > 0 ? "rotate-180" : ""} />}
            {formatDelta(pct)}
          </span>
        )}
      </div>
      <p className="mt-3 text-[34px] font-medium leading-none tracking-[-0.03em] tabular-nums text-[var(--av-text)]">{format(current)}</p>
      <p className="mt-3 text-[13px] text-[var(--av-muted)]">{prior === null ? " " : `vs. ${format(prior)} prior`}</p>
    </article>
  );
}

// ── trend chart ────────────────────────────────────────────────────────────

const W = 1000;
const H = 300;

export type ChartPoint = { date: string; value: number };

/**
 * Line chart: this period in the strong colour, the comparison period lighter
 * and aligned bucket-for-bucket. The bucket that is still running draws its
 * last segment dashed, since that number is still growing. Hover shows both.
 */
export function TrendChart({ series, prior, interval, label }: { series: ChartPoint[]; prior: ChartPoint[] | null; interval: Interval; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const n = series.length;

  const { top, ticks } = useMemo(() => niceScale(Math.max(1, ...series.map((p) => p.value), ...(prior ?? []).slice(0, n).map((p) => p.value))), [series, prior, n]);
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * W : W / 2);
  const y = (value: number) => H - (value / top) * H;
  const points = series.map((p, i) => [x(i), y(p.value)] as const);
  const priorPoints = (prior ?? []).slice(0, n).map((p, i) => [x(i), y(p.value)] as const);

  const lastIncomplete = n > 1 && isBucketIncomplete(series[n - 1].date, interval);
  const solid = lastIncomplete && n > 2 ? points.slice(0, n - 1) : points;
  const dashed = lastIncomplete ? `M${points[n - 2][0].toFixed(2)} ${points[n - 2][1].toFixed(2)} L${points[n - 1][0].toFixed(2)} ${points[n - 1][1].toFixed(2)}` : "";

  const labelEvery = Math.max(1, Math.ceil(n / 8));
  const empty = series.every((p) => p.value === 0) && !(prior ?? []).some((p) => p.value > 0);

  function onMove(event: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || n === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHover(n > 1 ? Math.round(ratio * (n - 1)) : 0);
  }

  return (
    <div className="px-5 pb-5 pt-2">
      <div className="flex gap-3">
        <div className="relative w-10 shrink-0 text-[12px] tabular-nums text-[var(--av-muted)]" style={{ height: H }}>
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / top) * 100}%` }}>{formatCompact(tick)}</span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div ref={ref} className="relative" style={{ height: H }} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
            <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
              {ticks.map((tick) => (
                <line key={tick} x1="0" x2={W} y1={y(tick)} y2={y(tick)} stroke="var(--av-grid)" strokeWidth="1" strokeDasharray={tick === 0 ? undefined : "3 5"} vectorEffect="non-scaling-stroke" />
              ))}
              {priorPoints.length > 1 && <path d={smoothPath(priorPoints)} fill="none" stroke="var(--av-chart-prior)" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
              {points.length > 1 && <path d={smoothPath(solid)} fill="none" stroke="var(--av-chart)" strokeWidth="2.25" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
              {dashed && <path d={dashed} fill="none" stroke="var(--av-chart)" strokeWidth="2.25" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />}
              {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--av-muted)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
            </svg>
            {n === 1 && <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--av-chart)]" style={{ left: "50%", top: `${(points[0][1] / H) * 100}%` }} />}
            {hover !== null && series[hover] && (
              <>
                <span className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--av-card)] bg-[var(--av-chart)]" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(series[hover].value) / H) * 100}%` }} />
                <div
                  className="pointer-events-none absolute z-10 min-w-[150px] rounded-lg border border-[var(--av-line)] bg-[var(--av-card)] px-3 py-2 text-[12px] shadow-lg"
                  style={{ left: `${(x(hover) / W) * 100}%`, top: 8, transform: `translateX(${hover > n / 2 ? "calc(-100% - 12px)" : "12px"})` }}
                >
                  <p className="font-medium text-[var(--av-text)]">{formatBucket(series[hover].date, interval)}</p>
                  <p className="mt-1 flex items-center justify-between gap-4 text-[var(--av-text)]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--av-chart)]" />{label}</span><span className="tabular-nums">{series[hover].value.toLocaleString()}</span></p>
                  {prior?.[hover] && (
                    <p className="mt-0.5 flex items-center justify-between gap-4 text-[var(--av-muted)]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--av-chart-prior)]" />{formatBucket(prior[hover].date, interval)}</span><span className="tabular-nums">{prior[hover].value.toLocaleString()}</span></p>
                  )}
                </div>
              </>
            )}
            {empty && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-[var(--av-muted)]">No visits recorded in this range yet</p>}
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-[var(--av-muted)]">
            {series.map((p, i) => (i % labelEvery === 0 ? <span key={p.date}>{formatBucket(p.date, interval)}</span> : null))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── tables ─────────────────────────────────────────────────────────────────

const headCell = "text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--av-muted)]";

function TableShell({ cols, heads, children }: { cols: string; heads: string[]; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className={`grid items-center gap-3 px-5 pb-3 ${cols}`}>
        {heads.map((head, i) => <span key={head} className={`${headCell} ${i > 0 ? "text-right" : ""}`}>{head}</span>)}
      </div>
      <div className="border-t border-[var(--av-line)]">{children}</div>
    </div>
  );
}

function EmptyRows({ text }: { text: string }) {
  return <p className="px-5 py-10 text-center text-[13px] text-[var(--av-muted)]">{text}</p>;
}

/** A number, with a small trend arrow against the comparison period when there is one. */
function Figure({ value, prior, format = (v: number) => v.toLocaleString(), higherIsBetter = true }: { value: number; prior: number | null; format?: (v: number) => string; higherIsBetter?: boolean }) {
  return (
    <span className="flex items-center justify-end gap-1.5 tabular-nums text-[var(--av-text)]">
      {format(value)}
      {prior !== null && <TrendArrow current={value} prior={prior} higherIsBetter={higherIsBetter} />}
    </span>
  );
}

const barClass = "pointer-events-none absolute inset-y-0 left-0 bg-[var(--av-bar)]";

export function PathsTable({ rows, priorRows, title = "Paths", limit = 10 }: { rows: PathRow[]; priorRows: PathRow[] | null; title?: string; limit?: number }) {
  const shown = rows.slice(0, limit);
  const top = Math.max(1, ...shown.map((row) => row.visitors));
  const prior = useMemo(() => new Map((priorRows ?? []).map((row) => [row.path, row])), [priorRows]);
  const cols = "grid-cols-[minmax(0,1fr)_84px_84px] sm:grid-cols-[minmax(0,1fr)_120px_120px_130px]";
  return (
    <Card className="pt-5">
      <div className="px-5"><CardTitle subject={title} /></div>
      <TableShell cols={cols} heads={["Path", "Visitors", "Views", "Bounce rate"]}>
        {shown.length === 0 ? <EmptyRows text="No pages viewed in this range yet" /> : shown.map((row) => {
          const before = priorRows ? prior.get(row.path) : undefined;
          const compare = priorRows !== null;
          return (
            <div key={row.path} className={`relative grid items-center gap-3 border-b border-[var(--av-line)] px-5 py-2.5 text-[13.5px] last:border-b-0 hover:bg-[var(--av-hover)] ${cols}`}>
              <span className={barClass} style={{ width: `${Math.max(2, (row.visitors / top) * 42)}%` }} />
              <span className="relative min-w-0 truncate text-[var(--av-text)]" title={row.path}>{row.path}</span>
              <Figure value={row.visitors} prior={compare ? before?.visitors ?? 0 : null} />
              <Figure value={row.views} prior={compare ? before?.views ?? 0 : null} />
              <span className="hidden justify-end sm:flex">
                {row.bounceRate === null ? <span className="text-[var(--av-muted)]">—</span> : (
                  <Figure value={row.bounceRate} prior={compare && before?.bounceRate != null ? before.bounceRate : null} format={formatPercent} higherIsBetter={false} />
                )}
              </span>
            </div>
          );
        })}
      </TableShell>
    </Card>
  );
}

function BreakdownTable({
  title, subject, head, rows, priorRows, icon,
}: {
  title: string; subject: string; head: string; rows: { key: string; visitors: number; views: number }[]; priorRows: { key: string; visitors: number; views: number }[] | null; icon?: (key: string) => React.ReactNode;
}) {
  const top = Math.max(1, ...rows.map((row) => row.visitors));
  const prior = new Map((priorRows ?? []).map((row) => [row.key, row]));
  const cols = "grid-cols-[minmax(0,1fr)_96px_96px]";
  return (
    <Card className="pt-5">
      <div className="px-5"><CardTitle prefix={title} subject={subject} /></div>
      <TableShell cols={cols} heads={[head, "Visitors", "Views"]}>
        {rows.length === 0 ? <EmptyRows text="No data yet" /> : rows.map((row) => {
          const before = priorRows ? prior.get(row.key) : undefined;
          const compare = priorRows !== null;
          return (
            <div key={row.key} className={`relative grid items-center gap-3 border-b border-[var(--av-line)] px-5 py-2.5 text-[13.5px] last:border-b-0 hover:bg-[var(--av-hover)] ${cols}`}>
              <span className={barClass} style={{ width: `${Math.max(2, (row.visitors / top) * 100)}%`, opacity: 0.85 }} />
              <span className="relative flex min-w-0 items-center gap-2 truncate text-[var(--av-text)]">{icon?.(row.key)}{row.key}</span>
              <Figure value={row.visitors} prior={compare ? before?.visitors ?? 0 : null} />
              <Figure value={row.views} prior={compare ? before?.views ?? 0 : null} />
            </div>
          );
        })}
      </TableShell>
    </Card>
  );
}

export function ChannelsTable({ rows, priorRows }: { rows: ChannelRow[]; priorRows: ChannelRow[] | null }) {
  return (
    <BreakdownTable
      title="Sources by" subject="Channel" head="Channel type"
      rows={rows.map((row) => ({ key: row.channel, visitors: row.visitors, views: row.views }))}
      priorRows={priorRows && priorRows.map((row) => ({ key: row.channel, visitors: row.visitors, views: row.views }))}
    />
  );
}

const deviceIcon = (device: string) => (device === "Mobile" ? <Smartphone size={14} className="shrink-0 text-[var(--av-muted)]" /> : device === "Tablet" ? <Tablet size={14} className="shrink-0 text-[var(--av-muted)]" /> : <Monitor size={14} className="shrink-0 text-[var(--av-muted)]" />);

export function DevicesTable({ rows, priorRows }: { rows: DeviceRow[]; priorRows: DeviceRow[] | null }) {
  return (
    <BreakdownTable
      title="Devices by" subject="Device type" head="Device type"
      rows={rows.map((row) => ({ key: row.device, visitors: row.visitors, views: row.views }))}
      priorRows={priorRows && priorRows.map((row) => ({ key: row.device, visitors: row.visitors, views: row.views }))}
      icon={deviceIcon}
    />
  );
}

// ── world map ──────────────────────────────────────────────────────────────

type MapShape = { id: string; name: string; d: string };
const MAP_W = 1000;
const MAP_H = 500;

/**
 * Countries shaded by visitors. The geometry (~100 KB) and the ISO code table
 * are loaded on demand so they never weigh on the rest of the dashboard.
 */
export function WorldMap({ countries }: { countries: CountryRow[] }) {
  const [shapes, setShapes] = useState<MapShape[] | null>(null);
  const [toNumeric, setToNumeric] = useState<((code: string) => string | undefined) | null>(null);
  const [failed, setFailed] = useState(false);
  const [tip, setTip] = useState<{ x: number; y: number; name: string; visitors: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ geoNaturalEarth1, geoPath }, { feature }, atlas, iso] = await Promise.all([
          import("d3-geo"), import("topojson-client"), import("world-atlas/countries-110m.json"), import("i18n-iso-countries"),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topology = (atlas as any).default ?? atlas;
        const all = (feature(topology, topology.objects.countries) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, { name: string }>).features;
        const land = all.filter((f) => String(f.id) !== "010"); // Antarctica just squashes the map
        const projection = geoNaturalEarth1().fitSize([MAP_W, MAP_H], { type: "FeatureCollection", features: land });
        const path = geoPath(projection);
        const built = land.flatMap((f) => {
          const d = path(f);
          return d ? [{ id: String(f.id ?? "").padStart(3, "0"), name: f.properties?.name ?? "", d }] : [];
        });
        const lib = (iso as unknown as { default?: { alpha2ToNumeric: (c: string) => string | undefined } }).default ?? (iso as unknown as { alpha2ToNumeric: (c: string) => string | undefined });
        if (cancelled) return;
        setShapes(built);
        setToNumeric(() => (code: string) => lib.alpha2ToNumeric(code.toUpperCase())?.padStart(3, "0"));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, number>();
    if (!toNumeric) return map;
    for (const row of countries) {
      const id = toNumeric(row.country);
      if (id) map.set(id, (map.get(id) ?? 0) + row.visitors);
    }
    return map;
  }, [countries, toNumeric]);
  const max = Math.max(1, ...byId.values());
  const unknown = countries.filter((row) => !toNumeric?.(row.country)).reduce((sum, row) => sum + row.visitors, 0);

  function move(event: React.PointerEvent, shape: MapShape) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, name: shape.name, visitors: byId.get(shape.id) ?? 0 });
  }

  return (
    <Card className="pt-5">
      <div className="px-5"><CardTitle prefix="Geography by" subject="Map" /></div>
      <div ref={box} className="relative mt-2 px-3 pb-4" onPointerLeave={() => setTip(null)}>
        {failed ? (
          <p className="flex h-64 items-center justify-center text-[13px] text-[var(--av-muted)]">The map could not be loaded.</p>
        ) : !shapes ? (
          <div className="elpino-skel aspect-[2/1] w-full" aria-hidden="true" />
        ) : (
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full" role="img" aria-label="Visitors by country">
            {shapes.map((shape) => {
              const visitors = byId.get(shape.id) ?? 0;
              const fill = visitors > 0 ? `color-mix(in srgb, var(--av-chart) ${Math.round(30 + 70 * (visitors / max))}%, var(--av-map-empty))` : "var(--av-map-empty)";
              return <path key={`${shape.id}-${shape.name}`} d={shape.d} fill={fill} stroke="var(--av-card)" strokeWidth="0.6" onPointerMove={(event) => move(event, shape)} />;
            })}
          </svg>
        )}
        {tip && (
          <div className="pointer-events-none absolute z-10 rounded-lg border border-[var(--av-line)] bg-[var(--av-card)] px-3 py-1.5 text-[12px] shadow-lg" style={{ left: tip.x + 14, top: tip.y + 14 }}>
            <p className="font-medium text-[var(--av-text)]">{tip.name}</p>
            <p className="text-[var(--av-muted)]">{tip.visitors ? `${tip.visitors.toLocaleString()} visitor${tip.visitors === 1 ? "" : "s"}` : "No visitors"}</p>
          </div>
        )}
        {unknown > 0 && <p className="mt-1 px-2 text-[12px] text-[var(--av-muted)]">{unknown.toLocaleString()} visitor{unknown === 1 ? "" : "s"} with an unknown location aren&apos;t on the map.</p>}
      </div>
    </Card>
  );
}
