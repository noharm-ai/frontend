import { IExamCardItem } from "./InfectionControlSlice";

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
