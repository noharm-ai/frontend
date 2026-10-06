import dayjs, { Dayjs } from "dayjs";

import { ICourse, ICourseRegimen } from "./AntimicrobialTimelineSlice";

const DAY_MS = 24 * 60 * 60 * 1000;

// a timeline starts a day before the first course and ends this many days after
// the last date it has to show, so bars never touch the edges
const PADDING_BEFORE_DAYS = 1;
const PADDING_AFTER_DAYS = 2;
// a short course still gets a readable timeline
const MIN_RANGE_DAYS = 10;

export interface ITimelineRange {
  start: Dayjs;
  end: Dayjs;
  days: Dayjs[];
}

/**
 * The days the timeline spans: from the day before the first course up to
 * whatever comes last among today (or the discharge), the end of the courses
 * and their planned ends.
 */
export const getTimelineRange = (
  courses: ICourse[],
  reference: Dayjs,
): ITimelineRange => {
  const starts = courses.map((c) => dayjs(c.start).valueOf());
  const ends = courses.flatMap((c) =>
    [c.end, c.plannedEnd].filter(Boolean).map((d) => dayjs(d).valueOf()),
  );

  const first = starts.length ? dayjs(Math.min(...starts)) : reference;
  const last = dayjs(Math.max(reference.valueOf(), ...ends));

  const start = first.startOf("day").subtract(PADDING_BEFORE_DAYS, "day");
  let end = last.startOf("day").add(PADDING_AFTER_DAYS, "day");
  if (end.diff(start, "day") < MIN_RANGE_DAYS) {
    end = start.add(MIN_RANGE_DAYS, "day");
  }

  const days: Dayjs[] = [];
  for (let d = start; d.isBefore(end); d = d.add(1, "day")) {
    days.push(d);
  }

  return { start, end, days };
};

/** Where a date falls on the timeline, in percent of its width (0-100) */
export const toPercent = (
  date: string | Dayjs,
  range: ITimelineRange,
): number => {
  const total = range.end.valueOf() - range.start.valueOf();
  const value = (dayjs(date).valueOf() - range.start.valueOf()) / total;

  return Math.min(100, Math.max(0, value * 100));
};

/** Days left until a date, counted in started days (0 once it has passed) */
export const daysUntil = (date: string, reference: Dayjs): number =>
  Math.max(
    0,
    Math.ceil((dayjs(date).valueOf() - reference.valueOf()) / DAY_MS),
  );

/** Whole days since a date */
export const daysSince = (date: string, reference: Dayjs): number =>
  Math.max(
    0,
    Math.floor((reference.valueOf() - dayjs(date).valueOf()) / DAY_MS),
  );

/** Active courses first, then the most recent ones */
export const sortCourses = (courses: ICourse[]): ICourse[] =>
  [...courses].sort((a, b) => {
    const activeA = a.status === "active" ? 0 : 1;
    const activeB = b.status === "active" ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;

    return dayjs(b.start).valueOf() - dayjs(a.start).valueOf();
  });

export interface ICourseRow {
  idDrug: number;
  // the course the row is labelled after: the one in use, or else the latest
  course: ICourse;
  // every course of the drug, oldest first
  courses: ICourse[];
}

/**
 * One timeline row per drug: a drug prescribed again after a break shows its
 * past courses on the same line as the current one. Rows follow sortCourses.
 */
export const groupCourseRows = (courses: ICourse[]): ICourseRow[] => {
  const byDrug = new Map<number, ICourse[]>();
  courses.forEach((course) => {
    byDrug.set(course.idDrug, [...(byDrug.get(course.idDrug) ?? []), course]);
  });

  const rows = [...byDrug.entries()].map(([idDrug, drugCourses]) => ({
    idDrug,
    course: sortCourses(drugCourses)[0],
    courses: [...drugCourses].sort(
      (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf(),
    ),
  }));
  const order = sortCourses(rows.map((row) => row.course));

  return rows.sort((a, b) => order.indexOf(a.course) - order.indexOf(b.course));
};

/** "2 g · 8/8h · IV" */
/** The dose with its unit, e.g. "2,5 FRASCO AMPOLA" */
export const formatDose = (regimen: ICourseRegimen): string | null =>
  regimen.dose != null
    ? `${regimen.dose.toLocaleString("pt-BR")}${regimen.measureUnit ? ` ${regimen.measureUnit}` : ""}`
    : null;

export const formatRegimen = (regimen: ICourseRegimen): string =>
  [formatDose(regimen), regimen.frequency, regimen.route]
    .filter(Boolean)
    .join(" · ");

/** The age in whole years, or in months for babies */
export const getAge = (
  birthdate: string | null,
  reference: Dayjs,
): { value: number; unit: "years" | "months" } | null => {
  if (!birthdate) return null;

  const years = reference.diff(dayjs(birthdate), "year");
  if (years >= 1) return { value: years, unit: "years" };

  return { value: reference.diff(dayjs(birthdate), "month"), unit: "months" };
};
