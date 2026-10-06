import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { Dayjs } from "dayjs";

import { formatDate } from "utils/date";

import { IAntimicrobialEvaluation } from "../InfectionControlSlice";
import { isEvaluationExpired } from "../followUp";

interface EvaluationTagProps {
  evaluation: IAntimicrobialEvaluation | null;
  now: Dayjs;
}

/**
 * The infectologist's verdict on a course: conforming or not and until when,
 * or that nobody evaluated it yet
 */
export function EvaluationTag({ evaluation, now }: EvaluationTagProps) {
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
