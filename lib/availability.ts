// Working-hours math for the team's availability picture.
//
// Every teammate sets their hours in their own timezone ("9–6, Mon–Fri, IST").
// The question a workspace actually cares about is the union of all of those:
// with someone in India on 09:00–18:00 IST and someone in the US on
// 20:00–05:00 PT, is the desk ever unattended? Comparing wall-clock strings
// can't answer that, so everything here is normalised to one shared axis —
// "minute of the week, in UTC", Monday 00:00 = 0 — where windows from
// different timezones become directly comparable and can simply be merged.
//
// Scheduled hours are deliberately separate from presence (presenceStatus,
// set by the socket connection) and from busy (computed from open assigned
// conversations). Those say what is true this second; this says what the
// team has committed to. The Availability settings page shows all three.

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_SHORT: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const MINUTES_PER_DAY = 24 * 60;
export const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;

export type DayWindow = { enabled: boolean; start: string; end: string };
export type Availability = { timezone: string; days: Record<DayKey, DayWindow> };

/** A half-open [start, end) range of minute-of-week. Never wraps: callers split at the boundary. */
export type Interval = { start: number; end: number };

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTime(value: string): number | null {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatTime(minutes: number): string {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Browser's own zone, falling back to UTC where Intl can't say. */
export function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function defaultAvailability(timezone?: string): Availability {
  const weekday: DayWindow = { enabled: true, start: "09:00", end: "18:00" };
  const weekend: DayWindow = { enabled: false, start: "09:00", end: "18:00" };
  return {
    timezone: timezone || guessTimezone(),
    days: {
      mon: { ...weekday },
      tue: { ...weekday },
      wed: { ...weekday },
      thu: { ...weekday },
      fri: { ...weekday },
      sat: { ...weekend },
      sun: { ...weekend },
    },
  };
}

/**
 * Coerces whatever came back from storage into a usable schedule. Returns
 * null only for "nothing saved yet" — anything malformed on a single day
 * falls back to that day's default rather than discarding the whole record,
 * so one bad field can never lock someone out of their own settings.
 */
export function normalizeAvailability(raw: unknown): Availability | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as { timezone?: unknown; days?: unknown };
  const fallback = defaultAvailability(typeof source.timezone === "string" ? source.timezone : "UTC");
  const days = (source.days ?? {}) as Record<string, unknown>;

  for (const key of DAY_KEYS) {
    const day = days[key];
    if (!day || typeof day !== "object") continue;
    const { enabled, start, end } = day as { enabled?: unknown; start?: unknown; end?: unknown };
    const startValue = typeof start === "string" && parseTime(start) !== null ? start : fallback.days[key].start;
    const endValue = typeof end === "string" && parseTime(end) !== null ? end : fallback.days[key].end;
    fallback.days[key] = { enabled: Boolean(enabled), start: startValue, end: endValue };
  }
  return fallback;
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * How many minutes ahead of UTC `timeZone` is at `at`.
 *
 * Read off Intl rather than a table so DST is handled by the platform. The
 * offset is sampled once per calculation, which means a week that straddles
 * a DST switch is scored using the offset in force at the sample instant —
 * off by an hour for part of that one week, and self-correcting afterwards.
 * Carrying a full tz database to close that gap isn't worth it here.
 */
export function timezoneOffsetMinutes(timeZone: string, at: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts: Record<string, string> = {};
    for (const part of formatter.formatToParts(at)) parts[part.type] = part.value;
    const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);
    const localAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      hour,
      Number(parts.minute),
      Number(parts.second),
    );
    // Sub-minute rounding keeps historical zones with odd offsets from
    // producing fractional minutes that break integer interval math.
    return Math.round((localAsUtc - at.getTime()) / 60000);
  } catch {
    return 0;
  }
}

/** Adds a window that may run past the end of the week, splitting it at the boundary. */
function pushWrapped(into: Interval[], start: number, length: number) {
  if (length <= 0) return;
  if (length >= MINUTES_PER_WEEK) {
    into.push({ start: 0, end: MINUTES_PER_WEEK });
    return;
  }
  const from = ((start % MINUTES_PER_WEEK) + MINUTES_PER_WEEK) % MINUTES_PER_WEEK;
  const to = from + length;
  if (to <= MINUTES_PER_WEEK) {
    into.push({ start: from, end: to });
  } else {
    into.push({ start: from, end: MINUTES_PER_WEEK });
    into.push({ start: 0, end: to - MINUTES_PER_WEEK });
  }
}

/**
 * One person's schedule as UTC minute-of-week ranges.
 *
 * An end at or before the start means the window runs overnight — "20:00 to
 * 05:00" is a real shift, and the one that most often supplies a team's
 * night coverage, so it has to survive the conversion rather than be
 * rejected as backwards. Equal start and end reads as a full 24 hours.
 */
export function toUtcIntervals(availability: Availability, at: Date = new Date()): Interval[] {
  const offset = timezoneOffsetMinutes(availability.timezone, at);
  const intervals: Interval[] = [];

  DAY_KEYS.forEach((key, dayIndex) => {
    const day = availability.days[key];
    if (!day?.enabled) return;
    const start = parseTime(day.start);
    const end = parseTime(day.end);
    if (start === null || end === null) return;

    const length = end > start ? end - start : end === start ? MINUTES_PER_DAY : end + MINUTES_PER_DAY - start;
    pushWrapped(intervals, dayIndex * MINUTES_PER_DAY + start - offset, length);
  });

  return mergeIntervals(intervals);
}

export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [{ ...sorted[0] }];
  for (const interval of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    // Touching ranges join: 09:00–12:00 plus 12:00–17:00 is one shift, not two.
    if (interval.start <= last.end) last.end = Math.max(last.end, interval.end);
    else merged.push({ ...interval });
  }
  return merged;
}

/** The uncovered remainder of the week — the hours nobody is on. */
export function invertIntervals(merged: Interval[]): Interval[] {
  const gaps: Interval[] = [];
  let cursor = 0;
  for (const interval of merged) {
    if (interval.start > cursor) gaps.push({ start: cursor, end: interval.start });
    cursor = Math.max(cursor, interval.end);
  }
  if (cursor < MINUTES_PER_WEEK) gaps.push({ start: cursor, end: MINUTES_PER_WEEK });
  return gaps;
}

export function totalMinutes(intervals: Interval[]): number {
  return intervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
}

/**
 * Re-expresses UTC minute-of-week ranges on a given timezone's week, so the
 * coverage timeline can be read in the viewer's own local days rather than
 * in UTC — "Saturday is uncovered" should mean their Saturday.
 */
export function shiftToTimezone(intervals: Interval[], timeZone: string, at: Date = new Date()): Interval[] {
  const offset = timezoneOffsetMinutes(timeZone, at);
  if (offset === 0) return mergeIntervals(intervals);
  const shifted: Interval[] = [];
  for (const interval of intervals) {
    pushWrapped(shifted, interval.start + offset, interval.end - interval.start);
  }
  return mergeIntervals(shifted);
}

export function minuteOfWeek(at: Date = new Date()): number {
  // getUTCDay is Sunday-first; this axis is Monday-first.
  const dayIndex = (at.getUTCDay() + 6) % 7;
  return dayIndex * MINUTES_PER_DAY + at.getUTCHours() * 60 + at.getUTCMinutes();
}

export function isCoveredAt(intervals: Interval[], minute: number): boolean {
  return intervals.some((interval) => minute >= interval.start && minute < interval.end);
}

export function splitByDay(intervals: Interval[]): Record<DayKey, Interval[]> {
  const byDay = {} as Record<DayKey, Interval[]>;
  DAY_KEYS.forEach((key, dayIndex) => {
    const dayStart = dayIndex * MINUTES_PER_DAY;
    const dayEnd = dayStart + MINUTES_PER_DAY;
    byDay[key] = intervals
      .map((interval) => ({ start: Math.max(interval.start, dayStart), end: Math.min(interval.end, dayEnd) }))
      .filter((interval) => interval.end > interval.start)
      // Store day-relative so rendering a single day's bar needs no offset math.
      .map((interval) => ({ start: interval.start - dayStart, end: interval.end - dayStart }));
  });
  return byDay;
}

export type CoverageMember = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
  presenceStatus?: string | null;
  busy?: boolean;
  availability: Availability | null;
};

export type Coverage = {
  /** Union of everyone's hours, on the viewer's week. */
  covered: Interval[];
  gaps: Interval[];
  coveredMinutes: number;
  coveragePercent: number;
  is24x7: boolean;
  coveredByDay: Record<DayKey, Interval[]>;
  gapsByDay: Record<DayKey, Interval[]>;
  hoursByDay: Record<DayKey, number>;
  /** Members whose schedule says they are on right now. */
  onDutyNow: CoverageMember[];
  /** …of those, the ones actually connected and not already in a chat. */
  freeNow: CoverageMember[];
  scheduledCount: number;
};

/**
 * The headline number: fold every member's hours together and report what
 * the team as a whole covers. Members with no schedule saved contribute
 * nothing — an unanswered "when do you work" is not a claim of 24/7.
 */
export function computeCoverage(
  members: CoverageMember[],
  viewerTimezone: string,
  at: Date = new Date(),
): Coverage {
  const scheduled = members.filter((member) => member.availability !== null);
  const utcCovered = mergeIntervals(
    scheduled.flatMap((member) => toUtcIntervals(member.availability as Availability, at)),
  );

  const nowMinute = minuteOfWeek(at);
  const onDutyNow = scheduled.filter((member) =>
    isCoveredAt(toUtcIntervals(member.availability as Availability, at), nowMinute),
  );

  const covered = shiftToTimezone(utcCovered, viewerTimezone, at);
  const gaps = invertIntervals(covered);
  const coveredMinutes = totalMinutes(covered);
  const coveredByDay = splitByDay(covered);

  const hoursByDay = {} as Record<DayKey, number>;
  for (const key of DAY_KEYS) hoursByDay[key] = totalMinutes(coveredByDay[key]) / 60;

  return {
    covered,
    gaps,
    coveredMinutes,
    coveragePercent: (coveredMinutes / MINUTES_PER_WEEK) * 100,
    is24x7: coveredMinutes >= MINUTES_PER_WEEK,
    coveredByDay,
    gapsByDay: splitByDay(gaps),
    hoursByDay,
    onDutyNow,
    freeNow: onDutyNow.filter((member) => member.presenceStatus === "online" && !member.busy),
    scheduledCount: scheduled.length,
  };
}

/** "Mon 09:00 → 18:00", with the overnight case spelled out. */
export function describeWindow(day: DayWindow): string {
  if (!day.enabled) return "Unavailable";
  const start = parseTime(day.start);
  const end = parseTime(day.end);
  if (start === null || end === null) return "Unavailable";
  if (start === end) return "All day";
  return end < start ? `${day.start} → ${day.end} (next day)` : `${day.start} → ${day.end}`;
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

/** Weekly hours one person's own schedule adds up to. */
export function ownWeeklyMinutes(availability: Availability, at: Date = new Date()): number {
  return totalMinutes(toUtcIntervals(availability, at));
}
