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
  saveReview,
  setReviewOpen,
} from "../InfectionControlSlice";
import { CourseGantt } from "../CourseGantt/CourseGantt";
import { EvaluationTag } from "../EvaluationTag/EvaluationTag";
import { courseKey } from "../followUp";
import { formatRegimen } from "../timeline";
import { DrugEvaluation, ReviewBody } from "./ReviewModal.style";

// quick picks for how long an evaluation holds
const VALIDITY_PRESETS = [3, 7, 14];
// reasons of a drug that its new evaluation settles
const DRUG_REASONS = [
  InfectionControlPendingTypeEnum.NO_EVALUATION,
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
];

interface IDrugEvaluationFields {
  idDrug: number;
  // the running course the evaluation is for
  courseStart: string;
  drug: string;
  current: IAntimicrobialEvaluation | null;
  evaluate: boolean;
  conforming: boolean | null;
  validUntil: Dayjs | null;
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

// whether the current evaluation watches a trigger; a new one watches all
const watches = (
  evaluation: IAntimicrobialEvaluation | null,
  trigger: number,
) => !evaluation || (evaluation.triggers ?? []).includes(trigger);

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
    evaluations: ongoing.map((course) => ({
      idDrug: course.idDrug,
      courseStart: course.start,
      drug: drugNames[course.idDrug] ?? `${course.idDrug}`,
      current: course.evaluation,
      evaluate: !course.evaluation || drugsWithReason.has(course.idDrug),
      conforming: null,
      validUntil: null,
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
    })),
  };

  const evaluationSchema = Yup.object().shape({
    evaluate: Yup.boolean(),
    conforming: Yup.boolean()
      .nullable()
      .when("evaluate", {
        is: true,
        then: (schema) => schema.required(t("validation.requiredField")),
      }),
    validUntil: Yup.mixed<Dayjs>()
      .nullable()
      .when("evaluate", {
        is: true,
        then: (schema) =>
          schema
            .required(t("validation.requiredField"))
            .test(
              "future",
              t("infectionControl.review.futureDate"),
              futureDate,
            ),
      }),
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
          // the evaluation holds through the whole chosen day
          validUntil: e.validUntil!.endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
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

  const dayPresets = VALIDITY_PRESETS.map((days) => ({
    label: t("infectionControl.review.presetDays", { count: days }),
    value: dayjs().add(days, "day"),
  }));

  // the day presets plus the dates the course itself is due to stop: the
  // expire date of its prescription and, when the hospital sends one later,
  // its planned end
  const coursePresets = (course: ICourse | undefined) => {
    const presets = [...dayPresets];
    if (!course) return presets;

    const end = dayjs(course.end);
    if (!end.isBefore(dayjs(), "day")) {
      presets.push({
        label: t("infectionControl.review.presetExpire", {
          date: formatDate(course.end, "DD/MM"),
        }),
        value: end,
      });
    }

    const plannedEnd = course.plannedEnd ? dayjs(course.plannedEnd) : null;
    if (plannedEnd && plannedEnd.isAfter(end, "day")) {
      presets.push({
        label: t("infectionControl.review.presetPlannedEnd", {
          date: formatDate(course.plannedEnd, "DD/MM"),
        }),
        value: plannedEnd,
      });
    }

    return presets;
  };
  const beforeToday = (current: Dayjs) =>
    !!current && current.isBefore(dayjs(), "day");
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
      return t(
        evaluation.current
          ? "infectionControl.review.keepEvaluation"
          : "infectionControl.review.notEvaluated",
      );
    }
    if (evaluation.conforming == null) {
      return t("infectionControl.review.toEvaluate");
    }

    return [
      verdictLabel(evaluation.conforming),
      evaluation.validUntil &&
        t("infectionControl.evaluation.until", {
          date: formatDate(evaluation.validUntil),
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
              ? evaluation.conforming != null && !!evaluation.validUntil
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
                <EvaluationTag evaluation={evaluation.current} now={now} />
              </div>

              {timeline && (
                <div className="drug-timeline" data-testid="review-timeline">
                  <CourseGantt
                    courses={timeline.courses}
                    now={now}
                    dischargeDate={dischargeDate}
                    followUps={timeline.followUps}
                    compact
                    // what is being filled shows up as it is chosen
                    draftEvaluation={
                      evaluation.evaluate
                        ? {
                            idDrug: evaluation.idDrug,
                            courseStart: evaluation.courseStart,
                            conforming: evaluation.conforming,
                            validUntil: evaluation.validUntil
                              ? evaluation.validUntil
                                  .endOf("day")
                                  .format("YYYY-MM-DDTHH:mm:ss")
                              : null,
                          }
                        : null
                    }
                  />
                </div>
              )}

              {evaluation.current && (
                <div className="drug-current">
                  <span className="drug-field-label">
                    {t("infectionControl.review.currentEvaluation")}
                  </span>
                  <div>
                    <strong>
                      {verdictLabel(evaluation.current.conforming)}
                    </strong>{" "}
                    {t("infectionControl.review.evaluatedBy", {
                      date: formatDateTime(evaluation.current.createdAt),
                      user: evaluation.current.createdBy ?? "-",
                    })}
                  </div>
                  {evaluation.current.notes && (
                    <em>{evaluation.current.notes}</em>
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
                  <div>
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

                  <div>
                    <span className="drug-field-label">
                      {t("infectionControl.review.validUntil")}
                    </span>
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={evaluation.validUntil}
                      onChange={(value: Dayjs | null) => {
                        setFieldValue(field("validUntil"), value);
                        setFieldError(field("validUntil"), undefined);
                      }}
                      presets={coursePresets(activeCourse)}
                      disabledDate={beforeToday}
                      aria-label={t("infectionControl.review.validUntil")}
                    />
                    {fieldErrors.validUntil && (
                      <div className="drug-field-error">
                        {fieldErrors.validUntil as string}
                      </div>
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
                <label>{t("infectionControl.review.nextReviewDate")}</label>
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
                  aria-label={t("infectionControl.review.nextReviewDate")}
                />
              </div>
              {errors.nextReviewDate && (
                <div className="form-error">
                  {errors.nextReviewDate as string}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>{t("infectionControl.review.notes")}</label>
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
