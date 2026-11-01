import { FormikErrors } from "formik";
import * as Yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import type { TFunction } from "i18next";

import { formatDate } from "utils/date";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";
import InterventionReasonRelationType from "models/InterventionReasonRelationType";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUp,
  IFollowUpPending,
  IInterventionReason,
  IReviewPayload,
  ISubstituteDrug,
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

// how many days from today the next review can be quickly scheduled for
export const NEXT_REVIEW_DAYS = [1, 3];

// the verdict on a drug: conforming, not conforming or left out of the review
export type EvaluationDecision = "conforming" | "nonConforming" | "skip";

// when the patient is reviewed again: not scheduled, some days from today
// ("days3"), when the treatments end or on a chosen day
export type NextReview = "none" | `days${number}` | "treatmentEnd" | "date";

// what leaving a drug out of the review keeps: the evaluation in force, one
// that no longer holds (still pending) or no evaluation at all
export type SkipOutcome = "keep" | "keepInvalid" | "none";

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
  // the intervention reasons of a non-conformity
  interventionReasons: number[];
  // record an intervention on the drug with those reasons
  createIntervention: boolean;
  // the drug recommended instead, for reasons related to another drug
  substituteDrug: ISubstituteDrug | null;
  // back to pending when the evaluation expires
  watchExpiry: boolean;
  // back to pending when the posology changes
  watchPosology: boolean;
}

// the clinical note the review writes in the patient's record
export interface IClinicalNoteFields {
  // write it, or save the review without a note
  create: boolean;
  idClinicalNoteType: string | null;
  text: string;
  // the template the text came from (the default one, or one the user
  // saved), null before the step fills it
  template: string | null;
  // the text last filled from it: while the text is still this one, it is
  // filled again as the review changes; once edited, it is the user's
  generated: string | null;
}

export interface IReviewFields {
  notes: string;
  nextReview: NextReview;
  // the day chosen when the next review is on a date
  nextReviewDate: Dayjs | null;
  evaluations: IDrugEvaluationFields[];
  clinicalNote: IClinicalNoteFields;
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
    nextReview: "none",
    nextReviewDate: null,
    clinicalNote: {
      // skipped unless the user chooses to write it
      create: false,
      idClinicalNoteType: null,
      text: "",
      template: null,
      generated: null,
    },
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
        interventionReasons: [],
        // a non-conformity records an intervention unless unchecked
        createIntervention: true,
        substituteDrug: null,
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

/**
 * Whether the reasons of a non-conformity ask for a substitute drug, by their
 * relation type as the intervention form takes it: "required", "optional" or
 * null
 */
export const getSubstituteRelation = (
  evaluation: Pick<IDrugEvaluationFields, "conforming" | "interventionReasons">,
  reasons: IInterventionReason[],
): "required" | "optional" | null => {
  if (evaluation.conforming !== false) return null;

  const chosen = reasons.filter((reason) =>
    evaluation.interventionReasons.includes(reason.id),
  );
  const relationTypes = chosen.map((reason) => reason.relationType);

  if (relationTypes.some(InterventionReasonRelationType.isRequired)) {
    return "required";
  }
  if (
    relationTypes.some((type) =>
      InterventionReasonRelationType.getTypesWithRelation().includes(type),
    )
  ) {
    return "optional";
  }

  return null;
};

/** The checks of one drug, with the reasons a non-conformity can be given */
export const getEvaluationSchema = (
  t: TFunction,
  reasons: IInterventionReason[],
) =>
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
      // a non-conformity is given its reasons and justified
      interventionReasons: Yup.array()
        .of(Yup.number())
        .when(["evaluate", "conforming"], {
          is: (evaluate: boolean, conforming: boolean | null) =>
            evaluate && conforming === false,
          then: (schema) =>
            schema.min(1, t("infectionControl.review.reasonsRequired")),
        }),
      // one substitute, for a reason that requires it
      substituteDrug: Yup.mixed<ISubstituteDrug>()
        .nullable()
        .when(["evaluate", "conforming", "interventionReasons"], {
          is: (
            evaluate: boolean,
            conforming: boolean | null,
            interventionReasons: number[],
          ) =>
            evaluate &&
            getSubstituteRelation(
              { conforming, interventionReasons },
              reasons,
            ) === "required",
          then: (schema) =>
            schema.required(t("infectionControl.review.substituteRequired")),
        }),
      notes: Yup.string().when(["evaluate", "conforming"], {
        is: (evaluate: boolean, conforming: boolean | null) =>
          evaluate && conforming === false,
        then: (schema) =>
          schema.test(
            "justified",
            t("infectionControl.review.justificationRequired"),
            (value) => !!value?.trim(),
          ),
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
      .when("nextReview", {
        is: "date",
        then: (schema) => schema.required(t("validation.requiredField")),
      })
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

/**
 * What keeps the clinical note from being saved: its type, its text, or
 * null when it is ready or not written
 */
export const validateClinicalNote = (
  clinicalNote: IClinicalNoteFields,
): "idClinicalNoteType" | "text" | null => {
  if (!clinicalNote.create) return null;
  if (!clinicalNote.idClinicalNoteType) return "idClinicalNoteType";
  if (!clinicalNote.text.trim()) return "text";

  return null;
};

/**
 * Whether the drug can be given an intervention: a record of the past would
 * land on the drug prescribed now
 */
export const canRecordIntervention = (evaluation: IDrugEvaluationFields) =>
  !isHistoryOnly(evaluation);

/**
 * The review as the backend takes it: only the drugs evaluated now, and the
 * clinical note when one can be written and was not skipped
 */
export const toReviewPayload = (
  values: IReviewFields,
  admissionNumber: number,
  reasons: IInterventionReason[],
  canWriteNote: boolean,
): IReviewPayload => ({
  admissionNumber,
  notes: values.notes.trim() || null,
  clinicalNote:
    canWriteNote && values.clinicalNote.create
      ? {
          idClinicalNoteType: values.clinicalNote.idClinicalNoteType!,
          text: values.clinicalNote.text,
        }
      : null,
  // the patient is due from the start of the scheduled day
  nextReviewDate:
    getNextReviewDate(values)?.startOf("day").format("YYYY-MM-DDTHH:mm:ss") ??
    null,
  evaluations: values.evaluations
    .filter((e) => e.evaluate)
    .map((e) => ({
      idDrug: e.idDrug,
      conforming: !!e.conforming,
      // the reasons stay in the form when the verdict changes back, but only
      // a non-conformity carries them
      interventionReasons: e.conforming ? [] : e.interventionReasons,
      createIntervention:
        !e.conforming && e.createIntervention && canRecordIntervention(e),
      // kept in the form like the reasons, sent while a reason asks for it
      substituteDrug: getSubstituteRelation(e, reasons)
        ? (e.substituteDrug?.id ?? null)
        : null,
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

/** The verdict chosen for a drug, null while it is still to be evaluated */
export const getDecision = (
  evaluation: IDrugEvaluationFields,
): EvaluationDecision | null => {
  if (!evaluation.evaluate) return "skip";
  if (evaluation.conforming == null) return null;

  return evaluation.conforming ? "conforming" : "nonConforming";
};

/** The fields a verdict sets: leaving a drug out keeps what is on record */
export const decisionFields = (decision: EvaluationDecision) => ({
  evaluate: decision !== "skip",
  conforming: decision === "skip" ? null : decision === "conforming",
});

/** What leaving a drug out of the review keeps */
export const getSkipOutcome = (
  evaluation: IDrugEvaluationFields,
  invalidatedEvaluations: Record<string, IFollowUpPending[]>,
): SkipOutcome => {
  if (!evaluation.current) return "none";

  return invalidatedBy(evaluation.current, invalidatedEvaluations).length
    ? "keepInvalid"
    : "keep";
};

/**
 * The days an evaluation covers, as chosen: from its start (today when it
 * starts now) through its last day. Null ends while a chosen day is missing.
 */
export const getValidityPeriod = (evaluation: IDrugEvaluationFields) => {
  const from =
    evaluation.start === "date" && !evaluation.startDate
      ? null
      : getStartMoment(evaluation).startOf("day");
  const until = getValidUntil(evaluation)?.startOf("day") ?? null;

  return {
    from,
    until,
    days: from && until ? until.diff(from, "day") + 1 : null,
  };
};

/** The running course of a drug being evaluated, from its timeline */
export const findEvaluatedCourse = (
  courses: ICourse[] | undefined,
  evaluation: IDrugEvaluationFields,
) =>
  courses?.find((course) => course.start === evaluation.courseStart) ??
  courses?.find((course) => course.status === "active");

/**
 * When the running treatments are due to end, if still ahead: a day the next
 * review can be scheduled for
 */
export const getTreatmentsEnd = (values: IReviewFields): Dayjs | null => {
  const ends = values.evaluations
    .map((evaluation) => evaluation.treatmentEnd)
    .filter((end): end is string => !!end)
    .map((end) => dayjs(end));
  const last = ends.reduce<Dayjs | null>(
    (latest, end) => (!latest || end.isAfter(latest) ? end : latest),
    null,
  );

  return last && last.isAfter(dayjs(), "day") ? last : null;
};

/** The day the patient is reviewed again, as chosen */
export const getNextReviewDate = (
  values: IReviewFields,
  nextReview: NextReview = values.nextReview,
): Dayjs | null => {
  if (nextReview === "none") return null;
  if (nextReview === "date") return values.nextReviewDate;
  if (nextReview === "treatmentEnd") return getTreatmentsEnd(values);

  return dayjs().add(Number(nextReview.replace("days", "")), "day");
};

/** What the review will record for a drug, in words */
export const describeDrugEvaluation = (
  evaluation: IDrugEvaluationFields,
  invalidatedEvaluations: Record<string, IFollowUpPending[]>,
  t: TFunction,
) => {
  const decision = getDecision(evaluation);
  if (decision === "skip") {
    return t(
      `infectionControl.review.skip.${getSkipOutcome(evaluation, invalidatedEvaluations)}.description`,
    );
  }
  if (decision == null) {
    return t("infectionControl.review.notFilled");
  }

  const { from, until, days } = getValidityPeriod(evaluation);

  return [
    t("infectionControl.review.validity", {
      from: from ? formatDate(from) : "-",
      until: until ? formatDate(until) : "-",
      count: days ?? 0,
    }),
    isHistoryOnly(evaluation) && t("infectionControl.review.historyOnly"),
  ]
    .filter(Boolean)
    .join(" · ");
};
