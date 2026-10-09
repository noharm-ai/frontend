import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import type { FormikErrors } from "formik";
import { Radio } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { Checkbox, DatePicker, Textarea } from "components/Inputs";
import { formatDate, formatDateTime } from "utils/date";

import {
  ICourse,
  IFollowUpCourse,
  IFollowUpPending,
} from "../../InfectionControlSlice";
import { CourseGantt } from "../../CourseGantt/CourseGantt";
import { EvaluationTag } from "../../EvaluationTag/EvaluationTag";
import { InvalidationReason } from "../../InvalidationReason/InvalidationReason";
import { formatRegimen } from "../../timeline";
import {
  endsBeforeStart,
  getStartMoment,
  getValidUntil,
  IDrugEvaluationFields,
  invalidatedBy,
  IReviewFields,
  isHistoryOnly,
  isOver,
  toDraftEvaluation,
  VALIDITY_DAYS,
  verdictLabel,
} from "../reviewForm";
import { DrugEvaluation } from "../ReviewModal.style";

interface DrugEvaluationStepProps {
  // the drug of the review form
  index: number;
  // the timeline of the drug and the follow-up of its courses
  timeline?: {
    courses: ICourse[];
    followUps: Record<string, IFollowUpCourse>;
  };
  // open reasons that make an evaluation on record no longer hold, by id
  invalidatedEvaluations: Record<string, IFollowUpPending[]>;
  dischargeDate: string | null;
  now: Dayjs;
}

/**
 * One running antimicrobial of the review: its timeline, the evaluation on
 * record and the new verdict - conforming or not, from when, until when and
 * what sends the patient back to pending
 */
export function DrugEvaluationStep({
  index,
  timeline,
  invalidatedEvaluations,
  dischargeDate,
  now,
}: DrugEvaluationStepProps) {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, setFieldError } =
    useFormikContext<IReviewFields>();

  const evaluation = values.evaluations[index];
  const fieldErrors = (errors.evaluations?.[index] ??
    {}) as FormikErrors<IDrugEvaluationFields>;
  const field = (name: string) => `evaluations.${index}.${name}`;
  // the running course being evaluated
  const activeCourse =
    timeline?.courses.find(
      (course) => course.start === evaluation.courseStart,
    ) ?? timeline?.courses.find((course) => course.status === "active");
  const regimen = activeCourse?.regimens.at(-1);
  const invalidations = invalidatedBy(
    evaluation.current,
    invalidatedEvaluations,
  );
  const validUntil = getValidUntil(evaluation);

  return (
    <DrugEvaluation $selected={evaluation.evaluate} data-testid="review-drug">
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
            draftEvaluation={toDraftEvaluation(evaluation)}
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
                <s>{verdictLabel(evaluation.current.conforming, t)}</s>
              ) : (
                verdictLabel(evaluation.current.conforming, t)
              )}
            </strong>{" "}
            {t("infectionControl.review.evaluatedBy", {
              date: formatDateTime(evaluation.current.createdAt),
              user: evaluation.current.createdBy ?? "-",
            })}
          </div>
          {evaluation.current.notes && <em>{evaluation.current.notes}</em>}
          {invalidations.length > 0 && (
            <div className="drug-current-invalidated">
              <strong>{t("infectionControl.review.invalidated")}</strong>
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
                { value: true, label: verdictLabel(true, t) },
                { value: false, label: verdictLabel(false, t) },
              ]}
            />
            {fieldErrors.conforming && (
              <div className="drug-field-error">{fieldErrors.conforming}</div>
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
                          label: t("infectionControl.review.endTreatment", {
                            date: formatDate(evaluation.treatmentEnd, "DD/MM"),
                          }),
                        },
                      ]
                    : []),
                  ...VALIDITY_DAYS.map((days) => {
                    const until = getValidUntil(evaluation, `days${days}`)!;

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
            ) : isHistoryOnly(evaluation) ? (
              // over before the evaluation in force: it neither
              // replaces it nor settles its reasons
              <div className="drug-field-info" data-testid="review-end-history">
                {t("infectionControl.review.endHistory", {
                  date: formatDate(evaluation.current!.validFrom),
                })}
              </div>
            ) : (
              validUntil &&
              isOver(validUntil) && (
                <div className="drug-field-info" data-testid="review-end-past">
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
}
