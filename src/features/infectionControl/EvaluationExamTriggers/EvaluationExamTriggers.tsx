import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { IAntimicrobialEvaluation } from "../InfectionControlSlice";
import {
  describeExamResult,
  describeExamTriggerRule,
  hasVariation,
} from "../examTriggers";

interface EvaluationExamTriggersProps {
  evaluation: IAntimicrobialEvaluation;
  // off where a label already names the list
  showTitle?: boolean;
  className?: string;
}

const List = styled.div`
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .exam-trigger-name {
    font-weight: 500;
  }

  .exam-trigger-baseline {
    color: #8c8c8c;
  }

  .exam-trigger-no-baseline {
    color: #d46b08;
  }
`;

/**
 * The exam trigger rules an evaluation turned on, each with the result it is
 * compared with (the one at review time). Without one, the variation
 * conditions of the rule never fire. Nothing for an evaluation without rules.
 */
export function EvaluationExamTriggers({
  evaluation,
  showTitle = true,
  className,
}: EvaluationExamTriggersProps) {
  const { t } = useTranslation();
  const rules = evaluation.examTriggers ?? [];

  if (!rules.length) return null;

  return (
    <List className={className} data-testid="evaluation-exam-triggers">
      {showTitle && <div>{t("infectionControl.examTriggers.title")}:</div>}
      <ul>
        {rules.map((rule) => (
          <li key={rule.id} data-testid="evaluation-exam-trigger">
            <span className="exam-trigger-name">{rule.name}</span>{" "}
            {describeExamTriggerRule(rule, t)}
            {" · "}
            {rule.baseline ? (
              <span className="exam-trigger-baseline">
                {t("infectionControl.examTriggers.baseline", {
                  result: describeExamResult(rule.baseline, t),
                })}
              </span>
            ) : (
              <span className="exam-trigger-no-baseline">
                {t(
                  hasVariation(rule)
                    ? "infectionControl.examTriggers.noBaselineVariation"
                    : "infectionControl.examTriggers.noBaseline",
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </List>
  );
}
