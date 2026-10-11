import { useTranslation } from "react-i18next";

import { formatDate, formatDateTime } from "utils/date";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { formatRegimen } from "../timeline";

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
export function InvalidationReason({
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
