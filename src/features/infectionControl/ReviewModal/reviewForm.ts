import { FormikErrors } from "formik";
import * as Yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import type { TFunction } from "i18next";

import { formatDate } from "utils/date";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUp,
  IFollowUpPending,
  IReviewPayload,
} from "../InfectionControlSlice";
import { endsBeforeInForce } from "../followUp";
import { IDraftEvaluation } from "../CourseGantt/ganttLayout";

// how many days from its start an evaluation can be quickly held for
export const VALIDITY_DAYS = [7, 10];
// reasons of a drug that its new evaluation settles
const DRUG_REASONS = [
  InfectionControlPendingTypeEnum.NO_EVALUATION,
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
];

// where an evaluation starts: now, at the course start or on a chosen day
export type EvaluationStart = "now" | "courseStart" | "date";
// until when it holds: the end of the treatment, some days from its start
// ("days7") or a chosen day
export type EvaluationEnd = "treatmentEnd" | `days${number}` | "date";

export interface IDrugEvaluationFields {
  idDrug: number;
  // the running course the evaluation is for
  courseStart: string;
  drug: string;
  current: IAntimicrobialEvaluation | null;
  evaluate: boolean;
  conforming: boolean | null;
  start: EvaluationStart;
  // the day chosen when it starts on a date
  startDate: Dayjs | null;
  // when the treatment is due to stop, null when that day has passed
  treatmentEnd: string | null;
  end: EvaluationEnd;
  // the day chosen when it holds until a date
  endDate: Dayjs | null;
  notes: string;
  // back to pending when the evaluation expires
  watchExpiry: boolean;
  // back to pending when the posology changes
  watchPosology: boolean;
}

export interface IReviewFields {
  notes: string;
  nextReviewDate: Dayjs | null;
  evaluations: IDrugEvaluationFields[];
}

const futureDate = (value: Dayjs | null | undefined) =>
  !value || value.isAfter(dayjs());

/**
 * When an evaluation starts, as saved: null from now, the course start, or
 * the beginning of the chosen day (not before the course started)
 */
export const getValidFrom = (
  evaluation: IDrugEvaluationFields,
): string | null => {
  const courseStart = dayjs(evaluation.courseStart);

  if (evaluation.start === "courseStart") {
    return courseStart.format("YYYY-MM-DDTHH:mm:ss");
  }
  if (evaluation.start === "date" && evaluation.startDate) {
    const day = evaluation.startDate.startOf("day");
    return (day.isBefore(courseStart) ? courseStart : day).format(
      "YYYY-MM-DDTHH:mm:ss",
    );
  }

  return null;
};

/**
 * When a course is due to stop: its planned end when the hospital sends one
 * past the prescription expiry, else that expiry (which may have passed)
 */
const getTreatmentEnd = (course: ICourse | undefined): string | null => {
  if (!course) return null;

  const end =
    course.plannedEnd && dayjs(course.plannedEnd).isAfter(course.end)
      ? course.plannedEnd
      : course.end;

  return end;
};

/**
 * The day an evaluation holds until, as chosen: some days are counted from
 * its start. It holds through that day.
 */
export const getValidUntil = (
  evaluation: IDrugEvaluationFields,
  end: EvaluationEnd = evaluation.end,
): Dayjs | null => {
  if (end === "treatmentEnd") {
    return evaluation.treatmentEnd ? dayjs(evaluation.treatmentEnd) : null;
  }
  if (end === "date") {
    return evaluation.endDate;
  }

  return getStartMoment(evaluation).add(Number(end.replace("days", "")), "day");
};

// the moment an evaluation starts: its chosen start, or now
export const getStartMoment = (evaluation: IDrugEvaluationFields) =>
  dayjs(getValidFrom(evaluation) ?? undefined);

// a validity (held through its day) that ends before the evaluation starts
export const endsBeforeStart = (
  evaluation: IDrugEvaluationFields,
  until: Dayjs,
) => until.endOf("day").isBefore(getStartMoment(evaluation));

// a validity already over: the evaluation is recorded expired
export const isOver = (day: Dayjs) => day.endOf("day").isBefore(dayjs());

/**
 * Whether the evaluation is over before the one in force starts: it is
 * recorded as history and leaves that one in force
 */
export const isHistoryOnly = (evaluation: IDrugEvaluationFields) => {
  const validUntil = getValidUntil(evaluation);

  return (
    !!evaluation.current &&
    !!validUntil &&
    endsBeforeInForce(
      validUntil.endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      evaluation.current,
    )
  );
};

// whether the current evaluation watches a trigger; a new one watches all
const watches = (
  evaluation: IAntimicrobialEvaluation | null,
  trigger: number,
) => !evaluation || (evaluation.triggers ?? []).includes(trigger);

/**
 * A fresh review: one entry per running course. Drugs without an evaluation
 * in force (none, expired or with a changed posology) come selected.
 */
export const getInitialValues = (
  followUp: IFollowUp,
  courses: ICourse[],
  drugNames: Record<number, string>,
): IReviewFields => {
  const ongoing = (followUp.courses ?? []).filter((course) => course.ongoing);
  const drugsWithReason = new Set(
    (followUp.pendings ?? [])
      .filter((pending) => DRUG_REASONS.includes(pending.type))
      .map((pending) => pending.idDrug),
  );

  return {
    notes: "",
    nextReviewDate: null,
    evaluations: ongoing.map((course) => {
      const treatmentEnd = getTreatmentEnd(
        courses.find(
          (c) => c.idDrug === course.idDrug && c.start === course.start,
        ),
      );

      const fields: IDrugEvaluationFields = {
        idDrug: course.idDrug,
        courseStart: course.start,
        drug: drugNames[course.idDrug] ?? `${course.idDrug}`,
        current: course.evaluation,
        evaluate: !course.evaluation || drugsWithReason.has(course.idDrug),
        conforming: null,
        start: "courseStart" as EvaluationStart,
        startDate: null,
        treatmentEnd,
        end: "treatmentEnd",
        endDate: null,
        notes: "",
        // the choices made last time, on by default
        watchExpiry: watches(
          course.evaluation,
          InfectionControlPendingTypeEnum.EXPIRED,
        ),
        watchPosology: watches(
          course.evaluation,
          InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
        ),
      };

      return { ...fields, end: treatmentEnd ? "treatmentEnd" : "days7" };
    }),
  };
};

/** The checks of one drug */
export const getEvaluationSchema = (t: TFunction) =>
  Yup.object()
    .shape({
      evaluate: Yup.boolean(),
      conforming: Yup.boolean()
        .nullable()
        .when("evaluate", {
          is: true,
          then: (schema) => schema.required(t("validation.requiredField")),
        }),
      startDate: Yup.mixed<Dayjs>()
        .nullable()
        .when(["evaluate", "start"], {
          is: (evaluate: boolean, start: EvaluationStart) =>
            evaluate && start === "date",
          then: (schema) => schema.required(t("validation.requiredField")),
        }),
      endDate: Yup.mixed<Dayjs>()
        .nullable()
        .when(["evaluate", "end"], {
          is: (evaluate: boolean, end: EvaluationEnd) =>
            evaluate && end === "date",
          then: (schema) => schema.required(t("validation.requiredField")),
        }),
    })
    // the validity may be over already (a retroactive record), but it ends
    // after the evaluation starts
    .test("validUntil", function (value) {
      const evaluation = value as unknown as IDrugEvaluationFields;
      const validUntil = evaluation.evaluate && getValidUntil(evaluation);
      if (!validUntil || !endsBeforeStart(evaluation, validUntil)) {
        return true;
      }

      return this.createError({
        path: this.path ? `${this.path}.end` : "end",
        message: t("infectionControl.review.endBeforeStart"),
      });
    });

export const getValidationSchema = (
  t: TFunction,
  evaluationSchema: ReturnType<typeof getEvaluationSchema>,
) =>
  Yup.object().shape({
    nextReviewDate: Yup.mixed<Dayjs>()
      .nullable()
      .test("future", t("infectionControl.review.futureDate"), futureDate),
    evaluations: Yup.array().of(evaluationSchema),
  });

// errors of one drug, so a step is checked without flagging the ones ahead
export const validateDrug = (
  evaluationSchema: ReturnType<typeof getEvaluationSchema>,
  evaluation: IDrugEvaluationFields,
): FormikErrors<IDrugEvaluationFields> | null => {
  try {
    evaluationSchema.validateSync(evaluation, { abortEarly: false });
    return null;
  } catch (err) {
    const errors: Record<string, string> = {};
    (err as Yup.ValidationError).inner.forEach((error) => {
      if (error.path && !errors[error.path]) {
        errors[error.path] = error.message;
      }
    });
    return errors;
  }
};

/** The review as the backend takes it: only the drugs evaluated now */
export const toReviewPayload = (
  values: IReviewFields,
  admissionNumber: number,
): IReviewPayload => ({
  admissionNumber,
  notes: values.notes.trim() || null,
  // the patient is due from the start of the scheduled day
  nextReviewDate: values.nextReviewDate
    ? values.nextReviewDate.startOf("day").format("YYYY-MM-DDTHH:mm:ss")
    : null,
  evaluations: values.evaluations
    .filter((e) => e.evaluate)
    .map((e) => ({
      idDrug: e.idDrug,
      conforming: !!e.conforming,
      notes: e.notes.trim() || null,
      validFrom: getValidFrom(e),
      // the evaluation holds through the whole chosen day
      validUntil: getValidUntil(e)!.endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      triggers: [
        e.watchExpiry && InfectionControlPendingTypeEnum.EXPIRED,
        e.watchPosology && InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
      ].filter((trigger): trigger is number => !!trigger),
    })),
});

/** What is being filled for a drug, to plot on its timeline */
export const toDraftEvaluation = (
  evaluation: IDrugEvaluationFields,
): IDraftEvaluation | null =>
  evaluation.evaluate
    ? {
        idDrug: evaluation.idDrug,
        courseStart: evaluation.courseStart,
        conforming: evaluation.conforming,
        validFrom: getValidFrom(evaluation),
        validUntil:
          getValidUntil(evaluation)
            ?.endOf("day")
            .format("YYYY-MM-DDTHH:mm:ss") ?? null,
      }
    : null;

export const verdictLabel = (conforming: boolean, t: TFunction) =>
  t(
    conforming
      ? "infectionControl.evaluation.conforming"
      : "infectionControl.evaluation.nonConforming",
  );

// the open reasons that make the evaluation on record no longer hold
export const invalidatedBy = (
  evaluation: IAntimicrobialEvaluation | null,
  invalidatedEvaluations: Record<string, IFollowUpPending[]>,
): IFollowUpPending[] =>
  (evaluation && invalidatedEvaluations[evaluation.id]) || [];

/** What the review will record for a drug, in words */
export const describeDrugEvaluation = (
  evaluation: IDrugEvaluationFields,
  invalidatedEvaluations: Record<string, IFollowUpPending[]>,
  t: TFunction,
) => {
  if (!evaluation.evaluate) {
    // what is on record no longer holds: its reasons stay open
    if (invalidatedBy(evaluation.current, invalidatedEvaluations).length) {
      return t("infectionControl.review.keepInvalidEvaluation");
    }

    return t(
      evaluation.current
        ? "infectionControl.review.keepEvaluation"
        : "infectionControl.review.notEvaluated",
    );
  }
  if (evaluation.conforming == null) {
    return t("infectionControl.review.toEvaluate");
  }

  const validFrom = getValidFrom(evaluation);
  const validUntil = getValidUntil(evaluation);

  return [
    verdictLabel(evaluation.conforming, t),
    validFrom &&
      t("infectionControl.review.since", { date: formatDate(validFrom) }),
    validUntil &&
      t("infectionControl.evaluation.until", {
        date: formatDate(validUntil),
      }),
    isHistoryOnly(evaluation) && t("infectionControl.review.historyOnly"),
  ]
    .filter(Boolean)
    .join(" · ");
};
