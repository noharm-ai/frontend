import { useTranslation } from "react-i18next";

import { formatDate, formatDateTime } from "utils/date";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";

import {
  IAntimicrobialEvaluation,
  ICourse,
  IFollowUpPending,
} from "../InfectionControlSlice";
import { formatRegimen } from "../timeline";
import { ExamResultMatches } from "../ExamResultMatches/ExamResultMatches";

interface InvalidationReasonProps {
  pending: IFollowUpPending;
  evaluation: IAntimicrobialEvaluation;
  // the course being evaluated
  course?: ICourse;
}

/**
 * Why the evaluation on record no longer holds: when its validity ended,
 * which exam results met a rule it turned on, which cultures came out, or
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

  if (pending.type === InfectionControlPendingTypeEnum.EXAM_RESULT) {
    return (
      <li>
        {t("infectionControl.review.invalidatedExam")}
        <ExamResultMatches matches={pending.details?.matches} />
      </li>
    );
  }

  if (pending.type === InfectionControlPendingTypeEnum.CULTURE_RESULT) {
    return (
      <li data-testid="invalidated-culture">
        {t("infectionControl.review.invalidatedCulture")}
        <ul>
          {(pending.details?.cultures ?? []).map((culture) => (
            <li
              key={`${culture.material}-${culture.microorganism}-${culture.releaseDate}`}
            >
              {[culture.material, culture.microorganism]
                .filter(Boolean)
                .join(" · ") ||
                t("infectionControl.review.cultureUnnamed")}{" "}
              ({formatDateTime(culture.releaseDate)})
            </li>
          ))}
        </ul>
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
