import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { formatDate } from "utils/date";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpPending,
} from "../../InfectionControlSlice";
import { describeInvalidation } from "../../followUp";
import { InvalidationReason } from "../../InvalidationReason/InvalidationReason";
import { formatRegimen, ITimelineRange, toPercent } from "../../timeline";
import {
  evaluationLaneStyle,
  getMarkSpan,
  span,
  verdictSplit,
} from "../ganttLayout";
import { Evaluation, EvaluationPending } from "../CourseGantt.style";

interface EvaluationMarkProps {
  evaluation: IAntimicrobialEvaluation;
  // its line under the course bar (evaluationLaneStyle)
  lane: number;
  course: ICourse;
  // open reasons that make it no longer hold
  invalidatedBy?: IFollowUpPending[];
  range: ITimelineRange;
  now: Dayjs;
}

/**
 * A conformity record on its course: a dot on the day of the review and a band
 * under the bar for as long as the evaluation was (or is) in force, green when
 * conforming and red when not. One that no longer holds (expired, posology
 * changed) keeps that color up to the first open reason and takes the pending
 * color from then on, with a marker there telling what made it pending.
 */
export function EvaluationMark({
  evaluation,
  lane,
  course,
  invalidatedBy,
  range,
  now,
}: EvaluationMarkProps) {
  const { t } = useTranslation();
  const { period, since } = getMarkSpan(evaluation, invalidatedBy, course, now);
  // dated back to before the review that recorded it
  const backdated = dayjs(evaluation.validFrom).isBefore(
    dayjs(evaluation.createdAt).subtract(1, "minute"),
  );
  const verdict = t(
    evaluation.conforming
      ? "infectionControl.evaluation.conforming"
      : "infectionControl.evaluation.nonConforming",
  );
  const posology = formatRegimen(evaluation.posology);

  return (
    <>
      <Tooltip
        title={
          <>
            <strong>{verdict}</strong>
            <div>
              {t("infectionControl.timeline.evaluation.by", {
                date: formatDate(evaluation.createdAt, "DD/MM HH:mm"),
                user: evaluation.createdBy ?? "-",
              })}
            </div>
            {backdated && (
              <div>
                {t("infectionControl.timeline.evaluation.from", {
                  date: formatDate(evaluation.validFrom, "DD/MM HH:mm"),
                })}
              </div>
            )}
            <div>
              {since
                ? t("infectionControl.timeline.evaluation.invalidated", {
                    date: formatDate(since, "DD/MM HH:mm"),
                    reasons: describeInvalidation(
                      invalidatedBy!,
                      evaluation,
                      t,
                    ),
                  })
                : t(`infectionControl.timeline.evaluation.${period.outcome}`, {
                    date: formatDate(
                      period.outcome === "valid" ||
                        period.outcome === "expired" ||
                        period.outcome === "retroactive"
                        ? evaluation.validUntil
                        : (evaluation.closedAt ?? period.end),
                    ),
                  })}
            </div>
            {posology && (
              <div>
                {t("infectionControl.timeline.evaluation.posology", {
                  posology,
                })}
              </div>
            )}
            {evaluation.notes && <em>{evaluation.notes}</em>}
          </>
        }
      >
        <Evaluation
          className={[
            evaluation.conforming ? "conforming" : "non-conforming",
            // one that no longer holds turns to the pending color from then on
            period.outcome === "valid" || since ? "" : "past",
            since ? "invalidated" : "",
          ].join(" ")}
          data-testid="course-evaluation"
          tabIndex={0}
          aria-label={t("infectionControl.timeline.evaluation.label", {
            verdict,
            date: formatDate(evaluation.createdAt),
          })}
          style={{
            ...span(period.start, period.end, range),
            ...evaluationLaneStyle(lane),
            ...(since
              ? ({
                  "--split": verdictSplit(period.start, since, period.end),
                } as React.CSSProperties)
              : {}),
          }}
        />
      </Tooltip>
      {since && (
        <Tooltip
          title={
            <>
              <strong>
                {t("infectionControl.timeline.evaluation.pendingSince", {
                  date: formatDate(since, "DD/MM HH:mm"),
                })}
              </strong>
              <div>{t("infectionControl.review.invalidated")}</div>
              {/* the tooltip renders outside the timeline, out of its styles */}
              <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>
                {invalidatedBy!.map((pending) => (
                  <InvalidationReason
                    key={pending.id}
                    pending={pending}
                    evaluation={evaluation}
                    course={course}
                  />
                ))}
              </ul>
            </>
          }
        >
          <EvaluationPending
            data-testid="evaluation-pending"
            tabIndex={0}
            aria-label={t("infectionControl.timeline.evaluation.pendingSince", {
              date: formatDate(since, "DD/MM HH:mm"),
            })}
            style={{
              left: `${toPercent(since, range)}%`,
              ...evaluationLaneStyle(lane),
            }}
          />
        </Tooltip>
      )}
    </>
  );
}
