import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { Dayjs } from "dayjs";

import { formatDate } from "utils/date";

import {
  IAntimicrobialEvaluation,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { describeInvalidation, isEvaluationExpired } from "../followUp";

interface EvaluationTagProps {
  evaluation: IAntimicrobialEvaluation | null;
  now: Dayjs;
  // open reasons that make the evaluation no longer hold
  invalidatedBy?: IFollowUpPending[];
}

/**
 * The infectologist's verdict on a course: conforming or not and until when,
 * struck through with the reason when it no longer holds, or that nobody
 * evaluated it yet
 */
export function EvaluationTag({
  evaluation,
  now,
  invalidatedBy = [],
}: EvaluationTagProps) {
  const { t } = useTranslation();

  if (!evaluation) {
    return (
      <Tag color="orange" data-testid="evaluation-tag">
        {t("infectionControl.evaluation.none")}
      </Tag>
    );
  }

  const expired = isEvaluationExpired(evaluation, now);
  const verdict = t(
    evaluation.conforming
      ? "infectionControl.evaluation.conforming"
      : "infectionControl.evaluation.nonConforming",
  );

  if (invalidatedBy.length) {
    return (
      <Tag
        color="orange"
        data-testid="evaluation-tag"
        title={t("infectionControl.evaluation.noLongerValid")}
      >
        <s>{verdict}</s> · {describeInvalidation(invalidatedBy, evaluation, t)}
      </Tag>
    );
  }

  const validity = t(
    expired
      ? "infectionControl.evaluation.expired"
      : "infectionControl.evaluation.until",
    { date: formatDate(evaluation.validUntil) },
  );

  return (
    <Tag
      color={expired ? "default" : evaluation.conforming ? "green" : "red"}
      data-testid="evaluation-tag"
      title={evaluation.notes ?? undefined}
    >
      {verdict} · {validity}
    </Tag>
  );
}
