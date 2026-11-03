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
  // the id of the exam (IExamOption)
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
 * patient has results of: CKD-EPI or, where configured instead, CKD-EPI 2021.
 * Others are added from the timeline
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

// an exam the timeline can plot: the types of the schema a segment maps to
// the same NoHarm identifier are one exam (id "ref:<identifier>"); a type
// mapped to none is one on its own (id "key:<tpexame>")
export interface IExamOption {
  id: string;
  name: string;
  histories: IExamHistory[];
}

// the type with the latest result; the history of a type is newest first
const latestOf = (histories: IExamHistory[]) =>
  [...histories].sort((a, b) =>
    b.history[0].date.localeCompare(a.history[0].date),
  )[0];

const toPoints = (
  histories: IExamHistory[],
  reference: IExamSeries["reference"],
) =>
  histories
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

/**
 * Every exam of the history ("Ver todos") with a numeric result, by name
 */
export const getExamOptions = (historyList: IExamHistory[]): IExamOption[] => {
  const groups = new Map<string, IExamHistory[]>();
  historyList.filter(hasResults).forEach((item) => {
    const ref = item.tp_exam_ref?.toLowerCase().trim();
    const id = ref ? `ref:${ref}` : `key:${item.key.toLowerCase()}`;
    groups.set(id, [...(groups.get(id) ?? []), item]);
  });

  return [...groups.entries()]
    .filter(([, histories]) => toPoints(histories, null).length > 0)
    .map(([id, histories]) => {
      const latest = latestOf(histories);
      return {
        id,
        name: latest.name ?? latest.initials ?? latest.key,
        histories,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
};

/**
 * The exams the timeline opens with (TIMELINE_EXAMS), among the options, in
 * that order; the ones the patient has no results of are left out
 */
export const getDefaultExamIds = (options: IExamOption[]) =>
  TIMELINE_EXAMS.flatMap((refs) => {
    const id = refs
      .map((ref) => `ref:${ref}`)
      .find((candidate) => options.some((option) => option.id === candidate));
    return id ? [id] : [];
  });

/**
 * The series of an exam: the results of its types merged, the name, unit and
 * reference of the type with the latest result
 */
export const toExamSeries = (option: IExamOption): IExamSeries => {
  const latest = latestOf(option.histories);
  const reference = referenceOf(latest.history[0]);

  return {
    key: option.id,
    name: option.name,
    unit: latest.unit ?? latest.history[0].unit ?? null,
    points: toPoints(option.histories, reference),
    reference,
  };
};
