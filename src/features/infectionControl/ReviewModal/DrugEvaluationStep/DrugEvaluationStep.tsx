import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormikContext } from "formik";
import type { FormikErrors } from "formik";
import { InfoCircleOutlined, SyncOutlined } from "@ant-design/icons";
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
import { ChoiceChips } from "../ChoiceChips/ChoiceChips";
import { DecisionCards } from "../DecisionCards/DecisionCards";
import {
  decisionFields,
  EvaluationEnd,
  EvaluationStart,
  endsBeforeStart,
  findEvaluatedCourse,
  getDecision,
  getSkipOutcome,
  getStartMoment,
  getValidityPeriod,
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
  // what keeps the drug from being done, checked as it is filled
  drugErrors: FormikErrors<IDrugEvaluationFields> | null;
  dischargeDate: string | null;
  now: Dayjs;
}

const shortDate = (date: string | Dayjs | null | undefined) =>
  formatDate(date, "DD/MM");

/**
 * One running antimicrobial of the review: its timeline, the evaluation on
 * record and the new verdict - conforming, not conforming or left out - from
 * when, until when and what sends the patient back to pending
 */
export function DrugEvaluationStep({
  index,
  timeline,
  invalidatedEvaluations,
  drugErrors,
  dischargeDate,
  now,
}: DrugEvaluationStepProps) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IReviewFields>();
  // what sends the patient back to pending is told in a line, open to change
  const [triggersOpen, setTriggersOpen] = useState(false);

  const evaluation = values.evaluations[index];
  const field = (name: string) => `evaluations.${index}.${name}`;
  const decision = getDecision(evaluation);
  const nonConforming = decision === "nonConforming";
  const skipOutcome = getSkipOutcome(evaluation, invalidatedEvaluations);
  // the running course being evaluated
  const activeCourse = findEvaluatedCourse(timeline?.courses, evaluation);
  const regimen = activeCourse?.regimens.at(-1);
  const doseWeight = [regimen?.doseWeight, regimen?.doseWeightDay]
    .filter(Boolean)
    .join(" · ");
  const invalidations = invalidatedBy(
    evaluation.current,
    invalidatedEvaluations,
  );
  const validUntil = getValidUntil(evaluation);
  const period = getValidityPeriod(evaluation);
  const periodError = drugErrors?.end ?? null;

  const triggers = [
    evaluation.watchExpiry &&
      t("infectionControl.review.reopenExpiry", {
        date: shortDate(validUntil) ?? "-",
      }),
    evaluation.watchPosology && t("infectionControl.review.reopenPosology"),
  ].filter(Boolean);

  return (
    <DrugEvaluation data-testid="review-drug">
      <div className="drug-header">
        <div className="drug-header-title">
          <h3 className="drug-name">{evaluation.drug}</h3>
          <EvaluationTag
            evaluation={evaluation.current}
            now={now}
            invalidatedBy={invalidations}
          />
        </div>
        {regimen && formatRegimen(regimen) && (
          <div className="drug-regimen">{formatRegimen(regimen)}</div>
        )}
        {doseWeight && (
          <div className="drug-dose-weight" data-testid="review-dose-weight">
            {doseWeight}
          </div>
        )}
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
          <span className="drug-current-label">
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

      <section
        className="drug-section"
        data-kb="infectionControl.review.decision"
      >
        <h4 className="drug-section-title">
          {t("infectionControl.review.decision")}
        </h4>
        <DecisionCards
          aria-label={t("infectionControl.review.decision")}
          value={decision}
          onChange={(value) => {
            const fields = decisionFields(value);
            setFieldValue(field("evaluate"), fields.evaluate);
            setFieldValue(field("conforming"), fields.conforming);
          }}
          options={[
            {
              value: "conforming",
              label: verdictLabel(true, t),
              description: t("infectionControl.review.conformingDescription"),
            },
            {
              value: "nonConforming",
              label: verdictLabel(false, t),
              description: t(
                "infectionControl.review.nonConformingDescription",
              ),
            },
            {
              value: "skip",
              label: t("infectionControl.review.skipLabel"),
              description: t(
                `infectionControl.review.skip.${skipOutcome}.description`,
              ),
            },
          ]}
        />
      </section>

      {decision === "skip" && (
        <div className="drug-notice" data-testid="review-skip-notice">
          <InfoCircleOutlined />
          <span>{t(`infectionControl.review.skip.${skipOutcome}.notice`)}</span>
        </div>
      )}

      {evaluation.evaluate && decision !== null && (
        <>
          <section
            className="drug-section"
            data-kb="infectionControl.review.validity"
          >
            <div className="drug-section-header">
              <h4 className="drug-section-title">
                {t("infectionControl.review.validityTitle")}
              </h4>
              <span
                className={`drug-period ${periodError ? "error" : ""} ${period.days == null ? "empty" : ""}`}
                data-testid="review-period"
              >
                {periodError ??
                  (period.days != null
                    ? t("infectionControl.review.period", {
                        from: shortDate(period.from),
                        until: shortDate(period.until),
                        count: period.days,
                      })
                    : t("infectionControl.review.periodEmpty"))}
              </span>
            </div>

            <div className="drug-validity">
              <span className="drug-validity-label">
                {t("infectionControl.review.start")}
              </span>
              <div className="drug-validity-choice">
                <ChoiceChips<EvaluationStart>
                  aria-label={t("infectionControl.review.start")}
                  value={evaluation.start}
                  onChange={(value) => setFieldValue(field("start"), value)}
                  options={[
                    {
                      value: "now",
                      label: t("infectionControl.review.startNow"),
                      date: shortDate(dayjs()),
                    },
                    {
                      value: "courseStart",
                      label: t("infectionControl.review.startCourse"),
                      date: shortDate(evaluation.courseStart),
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
                    onChange={(value: Dayjs | null) =>
                      setFieldValue(field("startDate"), value)
                    }
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

              <span className="drug-validity-label">
                {t("infectionControl.review.validUntil")}
              </span>
              <div className="drug-validity-choice">
                <ChoiceChips<EvaluationEnd>
                  aria-label={t("infectionControl.review.validUntil")}
                  value={evaluation.end}
                  onChange={(value) => setFieldValue(field("end"), value)}
                  options={[
                    ...(evaluation.treatmentEnd
                      ? [
                          {
                            value: "treatmentEnd" as EvaluationEnd,
                            label: t("infectionControl.review.endTreatment"),
                            date: shortDate(evaluation.treatmentEnd),
                            // over before an evaluation starting later
                            disabled: endsBeforeStart(
                              evaluation,
                              dayjs(evaluation.treatmentEnd),
                            ),
                          },
                        ]
                      : []),
                    ...VALIDITY_DAYS.map((days) => ({
                      value: `days${days}` as EvaluationEnd,
                      label: t("infectionControl.review.endDays", {
                        count: days,
                      }),
                      date: shortDate(getValidUntil(evaluation, `days${days}`)),
                    })),
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
                    onChange={(value: Dayjs | null) =>
                      setFieldValue(field("endDate"), value)
                    }
                    // from the day it starts, even if already over
                    disabledDate={(current: Dayjs) =>
                      !!current &&
                      current.isBefore(getStartMoment(evaluation), "day")
                    }
                    aria-label={t("infectionControl.review.validUntil")}
                  />
                )}
              </div>
            </div>

            {isHistoryOnly(evaluation) ? (
              // over before the evaluation in force: it neither
              // replaces it nor settles its reasons
              <div className="drug-field-info" data-testid="review-end-history">
                {t("infectionControl.review.endHistory", {
                  date: formatDate(evaluation.current!.validFrom),
                })}
              </div>
            ) : (
              !periodError &&
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
          </section>

          <div
            className="drug-triggers"
            data-kb="infectionControl.review.triggers"
            data-testid="review-triggers"
          >
            <div className="drug-triggers-summary">
              <SyncOutlined className="drug-triggers-icon" />
              <span>
                {triggers.length
                  ? t("infectionControl.review.reopenWhen", {
                      when: triggers.join(
                        ` ${t("infectionControl.review.reopenOr")} `,
                      ),
                    })
                  : t("infectionControl.review.reopenNever")}
              </span>
              <button
                type="button"
                className="link-button"
                aria-expanded={triggersOpen}
                onClick={() => setTriggersOpen(!triggersOpen)}
              >
                {t(
                  triggersOpen
                    ? "infectionControl.review.reopenHide"
                    : "infectionControl.review.reopenChange",
                )}
              </button>
            </div>
            {triggersOpen && (
              <div className="drug-triggers-options">
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
            )}
          </div>

          <div className="drug-notes">
            <div className="drug-notes-header">
              <label className="drug-section-title" htmlFor={field("notes")}>
                {t(
                  nonConforming
                    ? "infectionControl.review.justification"
                    : "infectionControl.review.evaluationNotes",
                )}
              </label>
              <span
                className={`drug-notes-hint ${nonConforming ? "required" : ""}`}
              >
                {t(
                  nonConforming
                    ? "infectionControl.review.required"
                    : "infectionControl.review.optional",
                )}
              </span>
            </div>
            <Textarea
              id={field("notes")}
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder={t(
                nonConforming
                  ? "infectionControl.review.justificationPlaceholder"
                  : "infectionControl.review.evaluationNotesPlaceholder",
              )}
              value={evaluation.notes}
              onChange={(e: any) =>
                setFieldValue(field("notes"), e.target.value)
              }
            />
          </div>
        </>
      )}
    </DrugEvaluation>
  );
}
