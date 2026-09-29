"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Check, FileText, Gauge, Globe2, LoaderCircle, Lock, LockOpen, Radio } from "lucide-react";
import { ANNUAL_MONTHS_CHARGED, ANNUAL_SAVING_PERCENT, getAnnualTotal, getPlanPrice, plans } from "@/app/components/PricingCards";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { ChannelsTable, DevicesTable, KpiCard, PathsTable, Card, CardTitle, TrendChart } from "./_components";
import { formatCompact, formatDuration, formatPercent, type ReportData } from "./_report";

// Shown to workspaces whose plan doesn't include analytics. The server sends no
// analytics data to them at all — what is blurred here is invented sample data,
// not theirs, so removing the blur in dev tools reveals nothing.

const DAY_MS = 24 * 60 * 60 * 1000;
const VISITORS = [62, 71, 66, 80, 94, 88, 76, 102, 118, 109, 97, 125, 140, 131];

function buildSample(): { report: ReportData; prior: ReportData } {
  const today = Date.now();
  const day = (offset: number) => new Date(today - offset * DAY_MS).toISOString().slice(0, 10);
  const trend = (values: number[], offsetStart: number) =>
    values.map((visitors, i) => ({ date: day(offsetStart - i), visitors, pageviews: Math.round(visitors * 3.9), sessions: Math.round(visitors * 1.38) }));
  const priorValues = VISITORS.map((v, i) => Math.round(v * 0.8 + (i % 3) * 4));
  const summaryOf = (visitors: number, factor: number, bounce: number, seconds: number) => ({
    visitors, pageviews: Math.round(visitors * 3.9), sessions: Math.round(visitors * 1.38), bounceRate: bounce, avgDurationSeconds: seconds * factor,
  });
  const report: ReportData = {
    summary: summaryOf(1240, 1, 42.3, 214),
    trend: trend(VISITORS, VISITORS.length - 1),
    pages: [
      { path: "/", visitors: 612, views: 1480, bounceRate: 38.2 },
      { path: "/pricing", visitors: 344, views: 812, bounceRate: 29.7 },
      { path: "/signup", visitors: 218, views: 301, bounceRate: 33.3 },
      { path: "/docs/getting-started", visitors: 187, views: 655, bounceRate: 21.4 },
      { path: "/blog/ai-support", visitors: 142, views: 233, bounceRate: 54.8 },
      { path: "/contact", visitors: 96, views: 130, bounceRate: 41.0 },
    ],
    channels: [
      { channel: "Direct", visitors: 520, views: 1900 },
      { channel: "Organic Search", visitors: 388, views: 1310 },
      { channel: "Referral", visitors: 214, views: 760 },
      { channel: "Organic Social", visitors: 118, views: 340 },
    ],
    devices: [
      { device: "Desktop", visitors: 802, views: 3100 },
      { device: "Mobile", visitors: 438, views: 1510 },
    ],
    countries: [],
    truncated: false,
  };
  const prior: ReportData = {
    ...report,
    summary: summaryOf(1010, 0.92, 45.1, 214),
    trend: trend(priorValues, VISITORS.length * 2 - 1),
    pages: report.pages.map((row) => ({ ...row, visitors: Math.round(row.visitors * 0.82), views: Math.round(row.views * 0.8) })),
    channels: report.channels.map((row) => ({ ...row, visitors: Math.round(row.visitors * 0.85), views: Math.round(row.views * 0.83) })),
    devices: report.devices.map((row) => ({ ...row, visitors: Math.round(row.visitors * 0.9), views: Math.round(row.views * 0.9) })),
  };
  return { report, prior };
}

/** The blurred stand-in for the dashboard. The page blurs the whole canvas around it. */
export function LockedSample() {
  const { report, prior } = useMemo(buildSample, []);
  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Visitors" current={report.summary.visitors} prior={prior.summary.visitors} format={formatCompact} />
        <KpiCard label="Page views" current={report.summary.pageviews} prior={prior.summary.pageviews} format={formatCompact} />
        <KpiCard label="Sessions" current={report.summary.sessions} prior={prior.summary.sessions} format={formatCompact} />
        <KpiCard label="Session duration" current={report.summary.avgDurationSeconds} prior={prior.summary.avgDurationSeconds} format={formatDuration} />
        <KpiCard label="Bounce rate" current={report.summary.bounceRate} prior={prior.summary.bounceRate} format={formatPercent} higherIsBetter={false} />
      </div>
      <Card className="pt-5">
        <div className="px-5"><CardTitle subject="Unique visitors" /></div>
        <TrendChart
          series={report.trend.map((p) => ({ date: p.date, value: p.visitors }))}
          prior={prior.trend.map((p) => ({ date: p.date, value: p.visitors }))}
          interval="day"
          label="Unique visitors"
        />
      </Card>
      <PathsTable rows={report.pages} priorRows={prior.pages} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChannelsTable rows={report.channels} priorRows={prior.channels} />
        <DevicesTable rows={report.devices} priorRows={prior.devices} />
      </div>
    </div>
  );
}

// ── the upgrade card ───────────────────────────────────────────────────────
// Deliberately styled like the public pricing page (square cards, 2px ink
// borders, gradient plan names, the yellow sliding billing pill) and always
// light, so it reads the same over a blurred canvas in either dashboard theme.

const INK = "#11120f";
const upgradePlans = plans.filter((plan) => plan.id !== "free");

const unlocks = [
  { icon: Radio, label: "Live visitors" },
  { icon: Gauge, label: "Bounce rate" },
  { icon: Globe2, label: "World map" },
  { icon: Activity, label: "vs. last period" },
  { icon: FileText, label: "Page reports" },
];

/** The three lines that matter per plan: analytics first, then what the money buys. */
function planBullets(features: string[]): string[] {
  return ["Web analytics + live visitors", ...features.slice(0, 2)];
}

export function LockedUpgradeCard() {
  const [selectedId, setSelectedId] = useState(upgradePlans[0]?.id ?? "starter");
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = upgradePlans.find((plan) => plan.id === selectedId) ?? upgradePlans[0];

  // Straight to payment for the plan and billing period chosen on the card — the same two calls the
  // Plans dialog makes (create the subscription, then open Razorpay), without asking again.
  async function startCheckout() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    const cadence = billing === "yearly" ? "annual" : "monthly";
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId: selected.id, cadence }),
      });
      const data = (await response.json().catch(() => ({}))) as { subscriptionId?: string; keyId?: string; message?: string; error?: string };
      if (!response.ok) throw new Error(data.message ?? data.error ?? "Checkout could not be started.");
      if (!data.subscriptionId || !data.keyId) throw new Error("The billing service did not return a checkout session.");

      await openRazorpayCheckout({ keyId: data.keyId, subscriptionId: data.subscriptionId, description: `${selected.name} plan — ${cadence}` });
      // Razorpay has the payment, but the plan only changes when its signed webhook reaches us, so land
      // on Billing (which reads the real entitlement) rather than pretending analytics is already on.
      window.location.assign("/dashboard/settings/billing");
    } catch (issue) {
      setNotice(issue instanceof Error ? issue.message : "Checkout could not be started.");
      setBusy(false);
    }
  }

  return (
    <>
      <div
        role="region"
        aria-label="Upgrade to unlock analytics"
        className="relative w-full overflow-hidden border-2 bg-[#FAF9F6] p-5 text-[#11120f] shadow-[8px_8px_0_#11120f] sm:p-8"
        style={{ borderColor: INK }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[560px]">
            <span className="inline-flex -rotate-2 items-center gap-1.5 rounded-full border-2 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ borderColor: INK }}>
              <Lock size={12} strokeWidth={2.5} /> You&apos;re on Free
            </span>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.045em]">
              Your whole site&apos;s story,{" "}
              <span className="bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] bg-clip-text text-transparent">one upgrade away.</span>
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[#46505a]">
              Watch real visitors arrive, find the pages that convert and see where the world finds you. The dashboard behind this is sample data.
            </p>
          </div>

          <div role="group" aria-label="Billing period" className="relative grid w-[300px] max-w-full shrink-0 grid-cols-2 rounded-full border-2 bg-white p-1" style={{ borderColor: INK }}>
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full border-2 bg-[#ffd84d] transition-transform duration-500 ease-[cubic-bezier(0.5,1.5,0.4,1)]"
              style={{ borderColor: INK, transform: billing === "yearly" ? "translateX(100%)" : "translateX(0)" }}
            />
            {(["monthly", "yearly"] as const).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billing === period}
                onClick={() => setBilling(period)}
                className={`relative z-10 flex h-9 items-center justify-center gap-2 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3784ff] ${billing === period ? "text-[#11120f]" : "text-black/50 hover:text-black"}`}
              >
                {period === "monthly" ? "Monthly" : "Annually"}
                {period === "yearly" && (
                  <span className="-rotate-3 rounded-full border-2 bg-[#3784ff] px-1.5 py-0.5 text-[10.5px] font-bold text-white" style={{ borderColor: INK }}>-{ANNUAL_SAVING_PERCENT}%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="What you unlock">
          {unlocks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[12.5px] font-medium" style={{ borderColor: `${INK}33` }}>
              <Icon size={13} className="text-[#3784ff]" /> {label}
            </li>
          ))}
        </ul>

        <div role="radiogroup" aria-label="Choose a plan" className="mt-6 grid gap-4 md:grid-cols-3">
          {upgradePlans.map((plan) => {
            const active = plan.id === selected.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedId(plan.id)}
                className={`relative isolate flex flex-col overflow-hidden border-2 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 ${active ? "shadow-[5px_5px_0_#11120f]" : "hover:shadow-[3px_3px_0_rgba(17,18,15,0.25)]"}`}
                style={{ borderColor: active ? INK : `${INK}40` }}
              >
                {plan.highlighted && (
                  <>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150px] bg-[radial-gradient(ellipse_85%_38%_at_50%_0%,#80A7FF_0%,transparent_100%),radial-gradient(ellipse_110%_30%_at_50%_70%,#FFCB57_0%,#FFB87A_45%,transparent_100%)] opacity-70" />
                    <span className="absolute right-3 top-3 rotate-3 rounded-full border-2 bg-[#ffd84d] px-2 py-0.5 text-[10.5px] font-bold" style={{ borderColor: INK }}>Most popular</span>
                  </>
                )}
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                    style={{ borderColor: INK }}
                  >
                    {active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INK }} />}
                  </span>
                  <span className={`text-[22px] font-semibold tracking-[-0.04em] ${plan.highlighted ? "" : "bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] bg-clip-text text-transparent"}`}>{plan.name}</span>
                </span>
                <span className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[38px] font-semibold leading-none tracking-[-0.06em]">{getPlanPrice(plan, billing)}</span>
                  <span className="text-[12.5px] text-[#686868]">/ month</span>
                </span>
                <span className="mt-1.5 min-h-4 text-[12.5px] text-[#686868]">
                  {billing === "yearly" ? (
                    <><strong className="font-semibold text-[#11120f]">{getAnnualTotal(plan)}</strong> billed once a year</>
                  ) : (
                    "billed monthly"
                  )}
                </span>
                <ul className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "#EBEBED" }}>
                  {planBullets(plan.features).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] leading-5">
                      <Check size={14} strokeWidth={2.75} className="mt-[3px] shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[14px] leading-6 text-[#46505a]">
          {billing === "yearly" ? (
            <>
              Today you&apos;ll pay <strong className="font-semibold text-[#11120f]">{getAnnualTotal(selected)}</strong> — one payment for the full year, which works out to{" "}
              {getPlanPrice(selected, "yearly")}/month ({12 - ANNUAL_MONTHS_CHARGED} months free).
            </>
          ) : (
            <>
              Today you&apos;ll pay <strong className="font-semibold text-[#11120f]">{getPlanPrice(selected, "monthly")}</strong>, then {getPlanPrice(selected, "monthly")} every month.
            </>
          )}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => void startCheckout()}
            disabled={busy}
            className="group inline-flex h-12 items-center gap-2.5 border-2 bg-[#11120f] px-6 text-[15px] font-medium text-white transition hover:bg-[#ffd84d] hover:text-[#11120f] disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-[#11120f] disabled:hover:text-white"
            style={{ borderColor: INK }}
          >
            {busy ? (
              <><LoaderCircle size={16} className="animate-spin" /> Opening checkout…</>
            ) : (
              <>
                <Lock size={16} className="group-hover:hidden" />
                <LockOpen size={16} className="hidden group-hover:block" />
                Unlock analytics with {selected.name}
              </>
            )}
          </button>
          <Link href="/pricing#plans" className="text-[13px] font-medium text-[#707070] underline-offset-4 hover:text-black hover:underline">Compare all plans</Link>
        </div>
        {notice && (
          <p role="alert" className="mt-3 text-[13px] font-medium" style={{ color: notice === "Payment was cancelled." ? "#686868" : "#a33f49" }}>
            {notice === "Payment was cancelled." ? "No worries — you weren't charged. Pick a plan whenever you're ready." : notice}
          </p>
        )}
      </div>
    </>
  );
}
