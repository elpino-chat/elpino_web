// Small presentational pieces shared by the /compare pages. Server components only: these pages are static
// and should stay fast and fully crawlable, so there is no client JavaScript here.
import Link from "next/link";
import type { ReactNode } from "react";
import type { Edge, Glance, CostRow, Row } from "./data";

export const INK = "#11120f";
export const BLUE = "#0078f4";
export const GREEN = "#1aa37a";
export const YELLOW = "#ffd84d";

export const sectionClass = "px-5 py-16 sm:px-8 lg:px-20 lg:py-24";
export const innerClass = "mx-auto max-w-[1100px]";
export const mono = "font-mono text-[11px] font-medium uppercase tracking-[0.08em]";

export function Stamp({ color = BLUE, children }: { color?: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/25 bg-white px-3 py-1 text-[12.5px] font-medium normal-case tracking-normal text-black/70">
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, color, title, sub }: { eyebrow: string; color?: string; title: ReactNode; sub?: string }) {
  return (
    <div className="max-w-3xl">
      <Stamp color={color}>{eyebrow}</Stamp>
      <h2 className="mt-5 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{title}</h2>
      {sub && <p className="mt-5 text-lg leading-8 text-black/65">{sub}</p>}
    </div>
  );
}

export function PillLink({ href, children, variant = "dark" }: { href: string; children: ReactNode; variant?: "dark" | "light" }) {
  const base = "inline-flex h-12 items-center gap-2.5 rounded-full px-8 text-[15px] font-medium transition";
  const look = variant === "dark" ? "bg-[#11120f] text-white hover:opacity-85" : "border border-black/40 bg-white text-[#11120f] hover:bg-black/[0.04]";
  return (
    <Link href={href} className={`${base} ${look}`}>
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------ tables

const edgeLabel: Record<Edge, string> = { elpino: "Elpino is ahead", them: "Ahead", even: "" };

function Ahead({ show, label }: { show: boolean; label: string }) {
  if (!show) return null;
  return (
    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[#1aa37a]/12 px-2 py-0.5 text-[11px] font-medium text-[#0e7a58]">
      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      {label}
    </span>
  );
}

const th = "border-b border-black/20 px-4 py-3 text-left align-bottom text-[13px] font-medium text-black/60";
const td = "border-b border-black/10 px-4 py-4 align-top text-[15px] leading-6 text-black/80";

export function FeatureTable({ rows, themName }: { rows: Row[]; themName: string }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-black/30 bg-white">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className={`${th} w-[22%]`}>
              <span className="sr-only">Feature</span>
            </th>
            <th scope="col" className={`${th} w-[39%] bg-[#0078f4]/[0.06] text-[#0b5fc0]`}>
              Elpino
            </th>
            <th scope="col" className={`${th} w-[39%]`}>
              {themName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <th scope="row" className={`${td} text-left font-medium text-[#11120f]`}>
                {row.feature}
              </th>
              <td className={`${td} bg-[#0078f4]/[0.03]`}>
                <Ahead show={row.edge === "elpino"} label={edgeLabel.elpino} />
                <div>{row.elpino}</div>
              </td>
              <td className={td}>
                <Ahead show={row.edge === "them"} label={`${themName} is ahead`} />
                <div className={row.them === null ? "italic text-black/45" : undefined}>
                  {row.them ?? `Not verified. Check ${themName}'s own site.`}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GlanceTable({ rows, themName }: { rows: Glance[]; themName: string }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-black/30 bg-white">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className={`${th} w-[20%]`}>
              <span className="sr-only">Topic</span>
            </th>
            <th scope="col" className={`${th} w-[40%] bg-[#0078f4]/[0.06] text-[#0b5fc0]`}>
              Elpino
            </th>
            <th scope="col" className={`${th} w-[40%]`}>
              {themName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className={`${td} text-left font-medium text-[#11120f]`}>
                {row.label}
              </th>
              <td className={`${td} bg-[#0078f4]/[0.03]`}>{row.elpino}</td>
              <td className={td}>{row.them}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CostTable({ rows, themName }: { rows: CostRow[]; themName: string }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-black/30 bg-white">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className={`${th} w-[24%]`}>
              Scenario
            </th>
            <th scope="col" className={`${th} w-[38%] bg-[#0078f4]/[0.06] text-[#0b5fc0]`}>
              Elpino
            </th>
            <th scope="col" className={`${th} w-[38%]`}>
              {themName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.scenario}>
              <th scope="row" className={`${td} text-left font-medium text-[#11120f]`}>
                {row.scenario}
              </th>
              <td className={`${td} bg-[#0078f4]/[0.03]`}>{row.elpino}</td>
              <td className={td}>{row.them}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Verdict({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className="rounded-[10px] border border-black/40 bg-white p-7">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-xl font-medium tracking-[-0.02em]">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[16px] leading-7 text-black/75">
            <svg viewBox="0 0 16 16" className="mt-[7px] size-4 shrink-0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Elpino capabilities we could not match against a verified fact about the competitor. They are listed
 * separately and clearly marked as not compared, so a table never fills up with blank competitor cells
 * and we never imply the competitor lacks something we simply did not check.
 */
export function ElpinoOnly({ rows, themName }: { rows: Row[]; themName: string }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-[10px] border border-dashed border-black/35 bg-white p-6">
      <h4 className="text-[13px] font-medium uppercase tracking-[0.08em] text-black/50">Also in Elpino (not compared)</h4>
      <ul className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
        {rows.map((row) => (
          <li key={row.feature}>
            <p className="text-[16px] font-medium text-[#11120f]">{row.feature}</p>
            <p className="mt-1 text-[15px] leading-6 text-black/65">{row.elpino}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[13px] leading-6 text-black/50">
        We could not verify how {themName} handles these from its public pages, so we do not rate them. Check {themName}&apos;s own site before you decide.
      </p>
    </div>
  );
}
