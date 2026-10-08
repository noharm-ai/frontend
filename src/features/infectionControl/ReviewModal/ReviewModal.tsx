import { useEffect, useMemo, useState } from "react";
import { Formik, FormikErrors } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Button, Radio, Steps } from "antd";
import dayjs, { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";
import notification from "components/notification";
import { Checkbox, DatePicker, Textarea } from "components/Inputs";
import { useAppDispatch, useAppSelector } from "src/store";
import { formatDate, formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUp,
  IFollowUpCourse,
  IFollowUpPending,
  saveReview,
  setReviewOpen,
} from "../InfectionControlSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { EvaluationTag } from "../EvaluationTag/EvaluationTag";
import { courseKey, getInvalidatedEvaluations } from "../followUp";
import { formatRegimen } from "../timeline";
import { DrugEvaluation, ReviewBody } from "./ReviewModal.style";

// how many days from its start an evaluation can be quickly held for
const VALIDITY_DAYS = [7, 10];
// reasons of a drug that its new evaluation settles
const DRUG_REASONS = [
  InfectionControlPendingTypeEnum.NO_EVALUATION,
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
];

// where an evaluation starts: now, at the course start or on a chosen day
type EvaluationStart = "now" | "courseStart" | "date";
// until when it holds: the end of the treatment, some days from its start
// ("days7") or a chosen day
type EvaluationEnd = "treatmentEnd" | `days${number}` | "date";

interface IDrugEvaluationFields {
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

interface IReviewFields {
  notes: string;
  nextReviewDate: Dayjs | null;
  evaluations: IDrugEvaluationFields[];
}

interface ReviewModalProps {
  followUp: IFollowUp;
  // the antimicrobial timeline of the admission, plotted for each drug
  courses: ICourse[];
  dischargeDate: string | null;
  drugNames: Record<number, string>;
  now: Dayjs;
}

const futureDate = (value: Dayjs | null | undefined) =>
  !value || value.isAfter(dayjs());

/**
 * When an evaluation starts, as saved: null from now, the course start, or
 * the beginning of the chosen day (not before the course started)
 */
const getValidFrom = (evaluation: IDrugEvaluationFields): string | null => {
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
const getValidUntil = (
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
const getStartMoment = (evaluation: IDrugEvaluationFields) =>
  dayjs(getValidFrom(evaluation) ?? undefined);

// a validity (held through its day) that ends before the evaluation starts
const endsBeforeStart = (evaluation: IDrugEvaluationFields, until: Dayjs) =>
  until.endOf("day").isBefore(getStartMoment(evaluation));

// a validity already over: the evaluation is recorded expired
const isOver = (day: Dayjs) => day.endOf("day").isBefore(dayjs());

// whether the current evaluation watches a trigger; a new one watches all
const watches = (
  evaluation: IAntimicrobialEvaluation | null,
  trigger: number,
) => !evaluation || (evaluation.triggers ?? []).includes(trigger);

interface InvalidationReasonProps {
  pending: IFollowUpPending;
  evaluation: IAntimicrobialEvaluation;
  // the course being evaluated
  course?: ICourse;
}

/**
 * Why the evaluation on record no longer holds: when its validity ended, or
 * that the posology changed, from what to what
 */
function InvalidationReason({
  pending,
  evaluation,
  course,
}: InvalidationReasonProps) {
  const { t } = useTranslation();

  if (pending.type === InfectionControlPendingTypeEnum.EXPIRED) {
    return (
      <li>
        {t("infectionControl.review.invalidatedExpired", {
          date: formatDate(
            pending.details?.validUntil ?? evaluation.validUntil,
          ),
        })}
      </li>
    );
  }

  const evaluated = formatRegimen(
    pending.details?.evaluated ?? evaluation.posology,
  );
  // the reason keeps the posology of when it opened, which a later change
  // makes stale: what is prescribed now comes from the course
  const regimen = course?.regimens.at(-1);
  const current = regimen
    ? formatRegimen(regimen)
    : pending.details?.current
      ? formatRegimen(pending.details.current)
      : "";

  return (
    <li>
      {t("infectionControl.review.invalidatedPosology")}
      {evaluated && (
        <div>
          {t("infectionControl.review.posologyEvaluated", {
            posology: evaluated,
          })}
        </div>
      )}
      {current && (
        <div>
          {regimen
            ? t("infectionControl.review.posologyCurrentSince", {
                posology: current,
                date: formatDateTime(regimen.start),
              })
            : t("infectionControl.review.posologyCurrent", {
                posology: current,
              })}
        </div>
      )}
    </li>
  );
}

/**
 * The infectologist's review of the patient, one step per running
 * antimicrobial - its timeline, its current evaluation and a new verdict,
 * conforming or not and valid until a date - and a last step to schedule the
 * next review. Drugs without an evaluation in force (none, expired or with a
 * changed posology) come selected; the others can be evaluated again.
 */
export function ReviewModal({
  followUp,
  courses,
  dischargeDate,
  drugNames,
  now,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { open, status } = useAppSelector(
    (state) => state.infectionControl.review,
  );
  const isSaving = status === "loading";
  const [step, setStep] = useState(0);

  // every review starts at the first drug
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const ongoing = (followUp.courses ?? []).filter((course) => course.ongoing);
  const drugsWithReason = new Set(
    (followUp.pendings ?? [])
      .filter((pending) => DRUG_REASONS.includes(pending.type))
      .map((pending) => pending.idDrug),
  );

  // open reasons that make the evaluation on record of a drug no longer hold
  const invalidatedEvaluations = useMemo(
    () => getInvalidatedEvaluations(followUp),
    [followUp],
  );
  const invalidatedBy = (
    evaluation: IAntimicrobialEvaluation | null,
  ): IFollowUpPending[] =>
    (evaluation && invalidatedEvaluations[evaluation.id]) || [];

  // the timeline of each drug and the follow-up of its courses
  const drugTimelines = useMemo(() => {
    const byDrug: Record<
      number,
      { courses: ICourse[]; followUps: Record<string, IFollowUpCourse> }
    > = {};
    courses.forEach((course) => {
      byDrug[course.idDrug] ??= { courses: [], followUps: {} };
      byDrug[course.idDrug].courses.push(course);
    });
    (followUp.courses ?? []).forEach((course) => {
      if (byDrug[course.idDrug]) {
        byDrug[course.idDrug].followUps[
          courseKey(course.idDrug, course.start)
        ] = course;
      }
    });

    return byDrug;
  }, [courses, followUp]);

  const initialValues: IReviewFields = {
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

  const evaluationSchema = Yup.object()
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

  const validationSchema = Yup.object().shape({
    nextReviewDate: Yup.mixed<Dayjs>()
      .nullable()
      .test("future", t("infectionControl.review.futureDate"), futureDate),
    evaluations: Yup.array().of(evaluationSchema),
  });

  // errors of one drug, so a step is checked without flagging the ones ahead
  const validateDrug = (
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

  const onClose = () => {
    dispatch(setReviewOpen(false));
  };

  const onSave = (values: IReviewFields) => {
    const payload = {
      admissionNumber: followUp.admissionNumber,
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
          validUntil: getValidUntil(e)!
            .endOf("day")
            .format("YYYY-MM-DDTHH:mm:ss"),
          triggers: [
            e.watchExpiry && InfectionControlPendingTypeEnum.EXPIRED,
            e.watchPosology && InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
          ].filter((trigger): trigger is number => !!trigger),
        })),
    };

    dispatch(saveReview(payload)).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("infectionControl.review.success"),
        });
      }
    });
  };

  const notAfterToday = (current: Dayjs) =>
    !!current && !current.isAfter(dayjs(), "day");

  const verdictLabel = (conforming: boolean) =>
    t(
      conforming
        ? "infectionControl.evaluation.conforming"
        : "infectionControl.evaluation.nonConforming",
    );

  // what the review will record for a drug, in words
  const drugSummary = (evaluation: IDrugEvaluationFields) => {
    if (!evaluation.evaluate) {
      // what is on record no longer holds: its reasons stay open
      if (invalidatedBy(evaluation.current).length) {
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
      verdictLabel(evaluation.conforming),
      validFrom &&
        t("infectionControl.review.since", { date: formatDate(validFrom) }),
      validUntil &&
        t("infectionControl.evaluation.until", {
          date: formatDate(validUntil),
        }),
    ]
      .filter(Boolean)
      .join(" · ");
  };

  return (
    <Formik
      // a fresh form each time the modal opens
      key={open ? "open" : "closed"}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSave}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({
        values,
        errors,
        setErrors,
        setFieldValue,
        setFieldError,
        submitForm,
        validateForm,
      }) => {
        const drugCount = values.evaluations.length;
        const lastStep = drugCount;
        const isReviewStep = step === lastStep;

        const evaluationErrors = (index: number) =>
          (errors.evaluations?.[index] ??
            {}) as FormikErrors<IDrugEvaluationFields>;

        // flags (or clears) the errors of one drug, keeping the others
        const setDrugErrors = (
          index: number,
          drugErrors: FormikErrors<IDrugEvaluationFields> | null,
        ) => {
          const list = [
            ...((errors.evaluations as FormikErrors<IDrugEvaluationFields>[]) ??
              []),
          ];
          list[index] = drugErrors ?? (undefined as any);
          setErrors({
            ...errors,
            evaluations: list.some(Boolean) ? (list as any) : undefined,
          });
        };

        // moving forward checks the drug being left
        const goTo = (target: number) => {
          if (target > step && step < lastStep) {
            const drugErrors = validateDrug(values.evaluations[step]);
            setDrugErrors(step, drugErrors);
            if (drugErrors) return;
          }
          setStep(target);
        };

        const save = () => {
          validateForm().then((formErrors) => {
            const evaluationsWithError = (formErrors.evaluations ??
              []) as unknown[];
            const firstDrugWithError = values.evaluations.findIndex(
              (_, index) => !!evaluationsWithError[index],
            );
            if (firstDrugWithError >= 0) {
              setStep(firstDrugWithError);
            } else if (!formErrors.nextReviewDate) {
              submitForm();
            }
          });
        };

        const stepItems = [
          ...values.evaluations.map((evaluation, index) => {
            const done = evaluation.evaluate
              ? evaluation.conforming != null && !!getValidUntil(evaluation)
              : index < step;
            let stepStatus: "wait" | "process" | "finish" | "error" = "wait";
            if (index === step) stepStatus = "process";
            else if (errors.evaluations?.[index]) stepStatus = "error";
            else if (done) stepStatus = "finish";

            return {
              key: evaluation.idDrug,
              title: (
                <span className="step-title" title={evaluation.drug}>
                  {evaluation.drug}
                </span>
              ),
              content: drugSummary(evaluation),
              status: stepStatus,
            };
          }),
          {
            key: "review",
            title: t("infectionControl.review.patientStep"),
            content: t("infectionControl.review.patientStepLegend"),
            status: (isReviewStep ? "process" : "wait") as "process" | "wait",
          },
        ];

        const renderDrugStep = (index: number) => {
          const evaluation = values.evaluations[index];
          const fieldErrors = evaluationErrors(index);
          const field = (name: string) => `evaluations.${index}.${name}`;
          const timeline = drugTimelines[evaluation.idDrug];
          // the running course being evaluated
          const activeCourse =
            timeline?.courses.find(
              (course) => course.start === evaluation.courseStart,
            ) ?? timeline?.courses.find((course) => course.status === "active");
          const regimen = activeCourse?.regimens.at(-1);
          const invalidations = invalidatedBy(evaluation.current);
          const validUntil = getValidUntil(evaluation);

          return (
            <DrugEvaluation
              key={evaluation.idDrug}
              $selected={evaluation.evaluate}
              data-testid="review-drug"
            >
              <div className="drug-header">
                <div>
                  <h3 className="drug-name">{evaluation.drug}</h3>
                  {regimen && formatRegimen(regimen) && (
                    <div className="drug-regimen">{formatRegimen(regimen)}</div>
                  )}
                </div>
                <EvaluationTag
                  evaluation={evaluation.current}
                  now={now}
                  invalidatedBy={invalidations}
                />
              </div>

              {timeline && (
                <div className="drug-timeline" data-testid="review-timeline">
                  <CourseGantt
                    courses={timeline.courses}
                    now={now}
                    dischargeDate={dischargeDate}
                    followUps={timeline.followUps}
                    invalidatedEvaluations={invalidatedEvaluations}
                    compact
                    // what is being filled shows up as it is chosen
                    draftEvaluation={
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
                        : null
                    }
                  />
                </div>
              )}

              {evaluation.current && (
                <div
                  className={`drug-current ${invalidations.length ? "invalidated" : ""}`}
                  data-testid="review-current-evaluation"
                >
                  <span className="drug-field-label">
                    {t("infectionControl.review.currentEvaluation")}
                  </span>
                  <div>
                    <strong>
                      {invalidations.length ? (
                        <s>{verdictLabel(evaluation.current.conforming)}</s>
                      ) : (
                        verdictLabel(evaluation.current.conforming)
                      )}
                    </strong>{" "}
                    {t("infectionControl.review.evaluatedBy", {
                      date: formatDateTime(evaluation.current.createdAt),
                      user: evaluation.current.createdBy ?? "-",
                    })}
                  </div>
                  {evaluation.current.notes && (
                    <em>{evaluation.current.notes}</em>
                  )}
                  {invalidations.length > 0 && (
                    <div className="drug-current-invalidated">
                      <strong>
                        {t("infectionControl.review.invalidated")}
                      </strong>
                      <ul>
                        {invalidations.map((pending) => (
                          <InvalidationReason
                            key={pending.id}
                            pending={pending}
                            evaluation={evaluation.current!}
                            course={activeCourse}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <Checkbox
                checked={evaluation.evaluate}
                onChange={(e: any) =>
                  setFieldValue(field("evaluate"), e.target.checked)
                }
              >
                {t("infectionControl.review.evaluateNow")}
              </Checkbox>

              {evaluation.evaluate && (
                <div className="drug-fields">
                  <div className="drug-field-conformity">
                    <span className="drug-field-label">
                      {t("infectionControl.review.conformity")}
                    </span>
                    <Radio.Group
                      optionType="button"
                      buttonStyle="solid"
                      value={evaluation.conforming}
                      onChange={(e) => {
                        setFieldValue(field("conforming"), e.target.value);
                        setFieldError(field("conforming"), undefined);
                      }}
                      options={[
                        { value: true, label: verdictLabel(true) },
                        { value: false, label: verdictLabel(false) },
                      ]}
                    />
                    {fieldErrors.conforming && (
                      <div className="drug-field-error">
                        {fieldErrors.conforming}
                      </div>
                    )}
                  </div>

                  <div className="drug-field-start">
                    <span className="drug-field-label">
                      {t("infectionControl.review.start")}
                    </span>
                    <div className="drug-field-choice">
                      <Radio.Group
                        optionType="button"
                        buttonStyle="solid"
                        value={evaluation.start}
                        aria-label={t("infectionControl.review.start")}
                        onChange={(e) => {
                          setFieldValue(field("start"), e.target.value);
                          setFieldError(field("startDate"), undefined);
                          setFieldError(field("end"), undefined);
                        }}
                        options={[
                          {
                            value: "now",
                            label: t("infectionControl.review.startNow"),
                          },
                          {
                            value: "courseStart",
                            label: t("infectionControl.review.startCourse", {
                              date: formatDate(evaluation.courseStart, "DD/MM"),
                            }),
                          },
                          {
                            value: "date",
                            label: t("infectionControl.review.startDate"),
                          },
                        ]}
                      />
                      {evaluation.start === "date" && (
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={evaluation.startDate}
                          onChange={(value: Dayjs | null) => {
                            setFieldValue(field("startDate"), value);
                            setFieldError(field("startDate"), undefined);
                            setFieldError(field("end"), undefined);
                          }}
                          // from the day the course started up to today
                          disabledDate={(current: Dayjs) =>
                            !!current &&
                            (current.isBefore(evaluation.courseStart, "day") ||
                              current.isAfter(dayjs(), "day"))
                          }
                          aria-label={t("infectionControl.review.start")}
                        />
                      )}
                    </div>
                    {fieldErrors.startDate && (
                      <div className="drug-field-error">
                        {fieldErrors.startDate as string}
                      </div>
                    )}
                  </div>

                  <div className="drug-field-end">
                    <span className="drug-field-label">
                      {t("infectionControl.review.validUntil")}
                    </span>
                    <div className="drug-field-choice">
                      <Radio.Group
                        optionType="button"
                        buttonStyle="solid"
                        value={evaluation.end}
                        aria-label={t("infectionControl.review.validUntil")}
                        onChange={(e) => {
                          setFieldValue(field("end"), e.target.value);
                          setFieldError(field("endDate"), undefined);
                          setFieldError(field("end"), undefined);
                        }}
                        options={[
                          ...(evaluation.treatmentEnd
                            ? [
                                {
                                  value: "treatmentEnd",
                                  // over before an evaluation starting later
                                  disabled: endsBeforeStart(
                                    evaluation,
                                    dayjs(evaluation.treatmentEnd),
                                  ),
                                  label: t(
                                    "infectionControl.review.endTreatment",
                                    {
                                      date: formatDate(
                                        evaluation.treatmentEnd,
                                        "DD/MM",
                                      ),
                                    },
                                  ),
                                },
                              ]
                            : []),
                          ...VALIDITY_DAYS.map((days) => {
                            const until = getValidUntil(
                              evaluation,
                              `days${days}`,
                            )!;

                            return {
                              value: `days${days}`,
                              label: t("infectionControl.review.endDays", {
                                count: days,
                                date: until.format("DD/MM"),
                              }),
                            };
                          }),
                          {
                            value: "date",
                            label: t("infectionControl.review.endDate"),
                          },
                        ]}
                      />
                      {evaluation.end === "date" && (
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={evaluation.endDate}
                          onChange={(value: Dayjs | null) => {
                            setFieldValue(field("endDate"), value);
                            setFieldError(field("endDate"), undefined);
                          }}
                          // from the day it starts, even if already over
                          disabledDate={(current: Dayjs) =>
                            !!current &&
                            current.isBefore(getStartMoment(evaluation), "day")
                          }
                          aria-label={t("infectionControl.review.validUntil")}
                        />
                      )}
                    </div>
                    {fieldErrors.endDate || fieldErrors.end ? (
                      <div className="drug-field-error">
                        {(fieldErrors.endDate || fieldErrors.end) as string}
                      </div>
                    ) : (
                      validUntil &&
                      isOver(validUntil) && (
                        <div
                          className="drug-field-info"
                          data-testid="review-end-past"
                        >
                          {t(
                            evaluation.watchExpiry
                              ? "infectionControl.review.endPastPending"
                              : "infectionControl.review.endPast",
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="drug-field-triggers">
                    <span className="drug-field-label">
                      {t("infectionControl.review.triggers")}
                    </span>
                    <Checkbox
                      checked={evaluation.watchExpiry}
                      onChange={(e: any) =>
                        setFieldValue(field("watchExpiry"), e.target.checked)
                      }
                    >
                      {t("infectionControl.review.triggerExpired")}
                    </Checkbox>
                    <Checkbox
                      checked={evaluation.watchPosology}
                      onChange={(e: any) =>
                        setFieldValue(field("watchPosology"), e.target.checked)
                      }
                    >
                      {t("infectionControl.review.triggerPosology")}
                    </Checkbox>
                  </div>

                  <div className="drug-field-notes">
                    <span className="drug-field-label">
                      {t("infectionControl.review.evaluationNotes")}
                    </span>
                    <Textarea
                      aria-label={t("infectionControl.review.evaluationNotes")}
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      value={evaluation.notes}
                      onChange={(e: any) =>
                        setFieldValue(field("notes"), e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </DrugEvaluation>
          );
        };

        const renderReviewStep = () => (
          <>
            {drugCount === 0 ? (
              <div className="review-empty">
                {t("infectionControl.review.noOngoing")}
              </div>
            ) : (
              <div className="review-summary" data-testid="review-summary">
                <h3 className="review-section-title">
                  {t("infectionControl.review.antimicrobials")}
                </h3>
                <ul>
                  {values.evaluations.map((evaluation, index) => (
                    <li key={evaluation.idDrug}>
                      <button
                        type="button"
                        className="review-summary-drug"
                        onClick={() => setStep(index)}
                      >
                        {evaluation.drug}
                      </button>
                      <span>{drugSummary(evaluation)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`form-row ${errors.nextReviewDate ? "error" : ""}`}>
              <div className="form-label">
                <label>
                  {t("infectionControl.review.nextReviewDate")}{" "}
                  <span className="form-label-optional">
                    ({t("infectionControl.review.optional")})
                  </span>
                </label>
              </div>
              <div className="form-input">
                <DatePicker
                  format="DD/MM/YYYY"
                  value={values.nextReviewDate}
                  onChange={(value: Dayjs | null) => {
                    setFieldValue("nextReviewDate", value);
                    setFieldError("nextReviewDate", undefined);
                  }}
                  disabledDate={notAfterToday}
                  placeholder={t("infectionControl.review.noSchedule")}
                  aria-label={t("infectionControl.review.nextReviewDate")}
                />
              </div>
              {errors.nextReviewDate ? (
                <div className="form-error">
                  {errors.nextReviewDate as string}
                </div>
              ) : (
                <div className="form-info">
                  {t("infectionControl.review.nextReviewDateHelp")}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>
                  {t("infectionControl.review.notes")}{" "}
                  <span className="form-label-optional">
                    ({t("infectionControl.review.optional")})
                  </span>
                </label>
              </div>
              <div className="form-input">
                <Textarea
                  aria-label={t("infectionControl.review.notes")}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  value={values.notes}
                  onChange={(e: any) => setFieldValue("notes", e.target.value)}
                />
              </div>
            </div>
          </>
        );

        const footer = [
          <Button key="cancel" onClick={onClose} disabled={isSaving}>
            {t("actions.cancel")}
          </Button>,
          <Button
            key="back"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || isSaving}
          >
            {t("actions.back")}
          </Button>,
          isReviewStep ? (
            <Button key="save" type="primary" onClick={save} loading={isSaving}>
              {t("actions.save")}
            </Button>
          ) : (
            <Button key="next" type="primary" onClick={() => goTo(step + 1)}>
              {t("infectionControl.review.next")}
            </Button>
          ),
        ];

        return (
          <DefaultModal
            open={open}
            width={1040}
            centered
            destroyOnHidden
            onCancel={onClose}
            footer={footer}
            maskClosable={false}
          >
            <ReviewBody data-kb="infectionControl.review">
              <h2 className="modal-title">
                {t("infectionControl.review.title")}
              </h2>
              <p className="review-legend">
                {t("infectionControl.review.legend")}
              </p>

              <div className="review-layout">
                <Steps
                  className="review-steps"
                  orientation="vertical"
                  size="small"
                  current={step}
                  onChange={goTo}
                  items={stepItems}
                />

                <Form
                  className="review-step"
                  onSubmit={(event: React.FormEvent) => {
                    // Enter moves on, the save is only on the last step
                    event.preventDefault();
                    if (isReviewStep) save();
                    else goTo(step + 1);
                  }}
                >
                  {isReviewStep ? renderReviewStep() : renderDrugStep(step)}
                </Form>
              </div>
            </ReviewBody>
          </DefaultModal>
        );
      }}
    </Formik>
  );
}
