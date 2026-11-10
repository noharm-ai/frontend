import { useTranslation } from "react-i18next";

import { IExamTriggerMatch } from "../InfectionControlSlice";
import { describeExamResult, formatVariation } from "../examTriggers";

interface ExamResultMatchesProps {
  matches: IExamTriggerMatch[] | undefined;
}

/**
 * The exam trigger rules a result met (EXAM_RESULT): the result with its
 * date, the one at review time and how far it moved from it
 */
export function ExamResultMatches({ matches }: ExamResultMatchesProps) {
  const { t } = useTranslation();

  if (!matches?.length) return null;

  return (
    <>
      {matches.map((match) => (
        <div key={match.id} data-testid="exam-result-match">
          <strong>{match.name}</strong>
          <div>
            {t("infectionControl.examTriggers.result", {
              result: describeExamResult(match.result, t),
            })}
          </div>
          <div>
            {match.baseline
              ? t("infectionControl.examTriggers.baseline", {
                  result: describeExamResult(match.baseline, t),
                })
              : t("infectionControl.examTriggers.noBaseline")}
            {match.variation != null &&
              ` · ${t("infectionControl.examTriggers.variation", {
                value: formatVariation(match.variation),
              })}`}
          </div>
        </div>
      ))}
    </>
  );
}
