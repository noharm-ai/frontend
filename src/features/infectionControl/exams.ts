import {
  IExamCardItem,
  IExamHistory,
  IExamHistoryItem,
} from "./InfectionControlSlice";

type IExam = IExamCardItem["value"];

// an exam out of range only counts once it has a result, as on the screening
export const isExamAlert = (exam: IExam) => !!exam.value && exam.alert;

// out of range first, then the ones with a result, then the ones without
const rank = (exam: IExam) => (isExamAlert(exam) ? 0 : exam.value ? 1 : 2);

// the exams in that order, the order of the backend within each; a timeline
// response without them gives none
export const sortExams = (exams: IExamCardItem[] | null | undefined) =>
  (exams ?? [])
    .map((exam, index) => ({ exam, index }))
    .sort(
      (a, b) => rank(a.exam.value) - rank(b.exam.value) || a.index - b.index,
    )
    .map(({ exam }) => exam);

// an exam's results as the timeline plots them: oldest first, the ones with
// no number left out, each flagged when out of the reference
export interface IExamPoint {
  date: string;
  value: number;
  alert: boolean;
}

export interface IExamSeries {
  // the NoHarm identifier of the exam (tp_exam_ref)
  key: string;
  name: string;
  unit: string | null;
  points: IExamPoint[];
  // the reference range of the segment, null when the exam has none
  reference: { min: number; max: number } | null;
}

/**
 * The exams the antimicrobial timeline plots, by their NoHarm identifier
 * (tpexame_ref of the segment exams, the same in every schema, unlike the
 * tpexame of each schema). Each slot takes the first of its identifiers the
 * patient has results of: CKD-EPI or, where configured instead, CKD-EPI 2021
 */
export const TIMELINE_EXAMS = [["pcru"], ["ckd", "ckd21"], ["h_conleuc"]];

const toNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : parseFloat(`${value}`);
  return Number.isFinite(parsed) ? parsed : null;
};

// the range the segment configured; an exam it does not configure comes with
// both ends 0 (examutils.formatExam)
const referenceOf = (item: IExamHistoryItem | undefined) => {
  if (!item || item.configured === false) return null;
  const min = toNumber(item.min);
  const max = toNumber(item.max);
  if (min == null || max == null || max <= min) return null;
  return { min, max };
};

const hasResults = (history: IExamHistory) =>
  !history.text && history.history.length > 0;

/**
 * The series of an exam from the histories of the types a segment maps to
 * its identifier (more than one type can map to it): their results merged,
 * the name, unit and reference of the type with the latest result
 */
const toExamSeries = (key: string, histories: IExamHistory[]): IExamSeries => {
  // the history of a type is newest first
  const latest = [...histories].sort((a, b) =>
    b.history[0].date.localeCompare(a.history[0].date),
  )[0];
  const reference = referenceOf(latest.history[0]);

  const points = histories
    .flatMap((item) => item.history)
    .map((item) => ({ date: item.date, value: toNumber(item.value) }))
    .filter(
      (item): item is { date: string; value: number } =>
        !!item.date && item.value != null,
    )
    .map((item) => ({
      ...item,
      alert:
        !!reference &&
        (item.value < reference.min || item.value > reference.max),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    // the same result reported under two of the types counts once
    .filter(
      (point, index, sorted) =>
        index === 0 ||
        point.date !== sorted[index - 1].date ||
        point.value !== sorted[index - 1].value,
    );

  return {
    key,
    name: latest.name ?? latest.initials ?? key,
    unit: latest.unit ?? latest.history[0].unit ?? null,
    points,
    reference,
  };
};

/**
 * The exams of the timeline (TIMELINE_EXAMS) the patient has results of, from
 * the history of every exam ("Ver todos"), in that order; the ones without
 * results are left out
 */
export const getTimelineExams = (historyList: IExamHistory[]) =>
  TIMELINE_EXAMS.flatMap((refs) => {
    for (const ref of refs) {
      const histories = historyList.filter(
        (item) => hasResults(item) && item.tp_exam_ref?.toLowerCase() === ref,
      );
      if (histories.length > 0) {
        const series = toExamSeries(ref, histories);
        if (series.points.length > 0) return [series];
      }
    }
    return [];
  });
