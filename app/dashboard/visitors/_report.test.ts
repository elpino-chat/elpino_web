import { describe, expect, it } from "vitest";
import {
  bucketEndMs, comparisonRange, defaultInterval, dropFuture, isBucketIncomplete, deltaPercent, direction, formatBucket, formatCompact, formatDelta, formatDuration,
  formatPercent, hasFilters, niceScale, rangeDays, smoothPath,
} from "./_report";

describe("ranges", () => {
  it("counts days inclusively", () => {
    expect(rangeDays("2026-09-22", "2026-09-28")).toBe(7);
    expect(rangeDays("2026-09-28", "2026-09-28")).toBe(1);
  });

  it("compares against the window of equal length just before", () => {
    expect(comparisonRange("2026-09-22", "2026-09-28", "previous_period")).toEqual({ from: "2026-09-15", to: "2026-09-21" });
    expect(comparisonRange("2026-09-28", "2026-09-28", "previous_period")).toEqual({ from: "2026-09-27", to: "2026-09-27" });
  });

  it("crosses month boundaries", () => {
    expect(comparisonRange("2026-10-01", "2026-10-07", "previous_period")).toEqual({ from: "2026-09-24", to: "2026-09-30" });
  });

  it("can compare against the same dates a year earlier, or not at all", () => {
    expect(comparisonRange("2026-09-22", "2026-09-28", "previous_year")).toEqual({ from: "2025-09-22", to: "2025-09-28" });
    expect(comparisonRange("2026-09-22", "2026-09-28", "none")).toBeNull();
  });

  it("picks a bucket size that suits the range", () => {
    expect(defaultInterval(1)).toBe("hour");
    expect(defaultInterval(7)).toBe("day");
    expect(defaultInterval(62)).toBe("day");
    expect(defaultInterval(180)).toBe("week");
  });
});

describe("deltas", () => {
  it("computes % change", () => {
    expect(deltaPercent(48, 34)).toBeCloseTo(41.18, 1);
    expect(deltaPercent(20, 40)).toBe(-50);
    expect(deltaPercent(0, 0)).toBe(0);
  });

  it("has no % when there is no base to compare to", () => {
    expect(deltaPercent(5, 0)).toBeNull();
  });

  it("formats with sign and one decimal", () => {
    expect(formatDelta(41.18)).toBe("+41.2%");
    expect(formatDelta(-29)).toBe("-29.0%");
    expect(formatDelta(0)).toBe("0.0%");
  });

  it("gives a direction", () => {
    expect(direction(3, 2)).toBe("up");
    expect(direction(2, 3)).toBe("down");
    expect(direction(2, 2)).toBe("flat");
  });
});

describe("formatting", () => {
  it("compacts thousands", () => {
    expect(formatCompact(48)).toBe("48");
    expect(formatCompact(999)).toBe("999");
    expect(formatCompact(1040)).toBe("1.04K");
    expect(formatCompact(2_500_000)).toBe("2.5M");
  });

  it("formats durations", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(46)).toBe("46s");
    expect(formatDuration(1066)).toBe("17m 46s");
    expect(formatDuration(3900)).toBe("1h 5m");
  });

  it("formats percentages without trailing zeros on whole numbers", () => {
    expect(formatPercent(28)).toBe("28%");
    expect(formatPercent(38.2)).toBe("38.2%");
  });

  it("labels chart buckets", () => {
    expect(formatBucket("2026-09-28", "day")).toBe("Sep 28");
    expect(formatBucket("2026-09-28T14:00", "hour")).toMatch(/2\s?PM/);
    expect(formatBucket("2026-09-01", "month")).toBe("Sep 2026");
  });
});

describe("niceScale", () => {
  it("rounds the axis up to a tidy top with evenly spaced ticks", () => {
    expect(niceScale(21)).toEqual({ top: 25, ticks: [0, 5, 10, 15, 20, 25] });
    expect(niceScale(20)).toEqual({ top: 20, ticks: [0, 5, 10, 15, 20] });
    expect(niceScale(100)).toEqual({ top: 100, ticks: [0, 20, 40, 60, 80, 100] });
    expect(niceScale(1000).top).toBe(1000);
  });

  it("never cuts off the data", () => {
    for (const max of [1, 3, 7, 13, 48, 99, 101, 1040, 250_000]) {
      expect(niceScale(max).top).toBeGreaterThanOrEqual(max);
    }
  });

  it("copes with zero", () => {
    const { top, ticks } = niceScale(0);
    expect(top).toBeGreaterThan(0);
    expect(ticks[0]).toBe(0);
  });
});

describe("smoothPath", () => {
  it("handles empty, single and two-point series", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([[0, 5]])).toBe("M0.00 5.00");
    expect(smoothPath([[0, 5], [10, 7]])).toBe("M0.00 5.00 L10.00 7.00");
  });

  it("passes through every point with one curve segment between them", () => {
    const path = smoothPath([[0, 10], [10, 0], [20, 10]]);
    expect(path.startsWith("M0.00 10.00")).toBe(true);
    expect(path.match(/C/g)).toHaveLength(2);
    expect(path.endsWith("20.00 10.00")).toBe(true);
  });

  it("does not overshoot a peak (stays within the data's y-range)", () => {
    const path = smoothPath([[0, 10], [10, 0], [20, 10], [30, 10], [40, 0]]);
    const ys = [...path.matchAll(/-?\d+\.\d+/g)].map((m) => Number(m[0]));
    // every number in the path is either an x (0..40) or a y — none may be outside [-0.01, 40.01]
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-0.01);
    expect(Math.max(...ys)).toBeLessThanOrEqual(40.01);
  });
});

describe("filters", () => {
  it("knows when any filter is set", () => {
    expect(hasFilters({ path: "", country: "", device: "" })).toBe(false);
    expect(hasFilters({ path: " ", country: "", device: "" })).toBe(false);
    expect(hasFilters({ path: "/x", country: "", device: "" })).toBe(true);
    expect(hasFilters({ path: "", country: "", device: "Mobile" })).toBe(true);
  });
});

describe("buckets in time", () => {
  const noon = Date.parse("2026-09-28T12:30:00Z");

  it("knows which bucket is still running", () => {
    expect(isBucketIncomplete("2026-09-28", "day", noon)).toBe(true);
    expect(isBucketIncomplete("2026-09-27", "day", noon)).toBe(false);
    expect(isBucketIncomplete("2026-09-28T12:00", "hour", noon)).toBe(true);
    expect(isBucketIncomplete("2026-09-28T11:00", "hour", noon)).toBe(false);
    expect(isBucketIncomplete("2026-09-28", "week", noon)).toBe(true); // Monday 28th starts this week
  });

  it("ends a month bucket at the start of the next month", () => {
    expect(new Date(bucketEndMs("2026-09-01", "month")).toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(new Date(bucketEndMs("2026-12-01", "month")).toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("drops buckets that have not started yet", () => {
    const points = [{ date: "2026-09-28T11:00" }, { date: "2026-09-28T12:00" }, { date: "2026-09-28T13:00" }, { date: "2026-09-28T23:00" }];
    expect(dropFuture(points, "hour", noon).map((p) => p.date)).toEqual(["2026-09-28T11:00", "2026-09-28T12:00"]);
  });
});
