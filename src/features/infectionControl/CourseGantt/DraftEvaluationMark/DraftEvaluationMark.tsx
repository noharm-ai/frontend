import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import { Dayjs } from "dayjs";

import { formatDate } from "utils/date";

import { ITimelineRange } from "../../timeline";
import { evaluationLaneStyle, IDraftEvaluation, span } from "../ganttLayout";
import { Evaluation } from "../CourseGantt.style";

interface DraftEvaluationMarkProps {
  draft: IDraftEvaluation;
  // its line under the course bar (evaluationLaneStyle)
  lane: number;
  range: ITimelineRange;
  now: Dayjs;
}

/**
 * The evaluation being filled, drawn as it is chosen: a dot today once there
 * is a verdict, a band up to the valid-until date once there is one, grey
 * until the verdict comes
 */
export function DraftEvaluationMark({
  draft,
  lane,
  range,
  now,
}: DraftEvaluationMarkProps) {
  const { t } = useTranslation();

  if (draft.conforming == null && !draft.validUntil) return null;

  const verdict =
    draft.conforming == null
      ? null
      : t(
          draft.conforming
            ? "infectionControl.evaluation.conforming"
            : "infectionControl.evaluation.nonConforming",
        );
  const colorClass =
    draft.conforming == null
      ? "undecided"
      : draft.conforming
        ? "conforming"
        : "non-conforming";

  return (
    <Tooltip
      title={
        <>
          <strong>{t("infectionControl.timeline.evaluation.draft")}</strong>
          {verdict && <div>{verdict}</div>}
          {draft.validFrom && (
            <div>
              {t("infectionControl.timeline.evaluation.from", {
                date: formatDate(draft.validFrom, "DD/MM HH:mm"),
              })}
            </div>
          )}
          {draft.validUntil && (
            <div>
              {t("infectionControl.timeline.evaluation.valid", {
                date: formatDate(draft.validUntil),
              })}
            </div>
          )}
        </>
      }
    >
      <Evaluation
        className={`draft ${colorClass}`}
        data-testid="draft-evaluation"
        tabIndex={0}
        aria-label={t("infectionControl.timeline.evaluation.draft")}
        style={{
          ...span(draft.validFrom ?? now, draft.validUntil ?? now, range),
          ...evaluationLaneStyle(lane),
        }}
      />
    </Tooltip>
  );
}
