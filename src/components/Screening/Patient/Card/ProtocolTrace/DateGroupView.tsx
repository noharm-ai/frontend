import { useState } from "react";

import { formatDate } from "utils/date";

import { renderExpression } from "./expression";
import { buildRelatedItemNames, variableDomId } from "./formatters";
import {
  DateGroupBlock,
  DateGroupHeading,
  ErrorBox,
  Eyebrow,
  ExpressionBox,
  ExpressionCode,
  RelatedBanner,
  ResultChip,
  SubstitutedLine,
} from "./ProtocolTrace.style";
import type { IDateGroupTrace } from "./types";
import { VariableNodeView } from "./VariableNodeView";

export function DateGroupView({ group }: { group: IDateGroupTrace }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const selectVariable = (name: string) => {
    const el = document.getElementById(variableDomId(group, name));
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlighted(name);
    // a stale timer from a previous click becomes a no-op here since it only
    // clears the highlight it itself set, not whatever is highlighted later
    window.setTimeout(() => {
      setHighlighted((current) => (current === name ? null : current));
    }, 1500);
  };

  if (group.error) {
    return (
      <DateGroupBlock>
        <DateGroupHeading>
          <strong>Vigência: {formatDate(group.date)}</strong>
          <ResultChip $result="muted">erro</ResultChip>
        </DateGroupHeading>
        <ErrorBox>{group.error}</ErrorBox>
      </DateGroupBlock>
    );
  }

  const relatedNames = buildRelatedItemNames(group);

  return (
    <DateGroupBlock>
      <DateGroupHeading>
        <strong>Vigência: {formatDate(group.date)}</strong>
        <ResultChip $result={group.activated ? "true" : "false"}>
          {group.activated ? "ativado" : "não ativado"}
        </ResultChip>
      </DateGroupHeading>

      {group.trigger && (
        <ExpressionBox>
          <Eyebrow>Expressão do gatilho</Eyebrow>
          <ExpressionCode>
            {renderExpression(
              group.trigger.expression,
              group.variables || [],
              selectVariable
            )}
          </ExpressionCode>
          <SubstitutedLine>
            substituída: {group.trigger.substituted} →{" "}
            <span className="result-chip">
              <ResultChip $result={group.trigger.result ? "true" : "false"}>
                {group.trigger.result ? "verdadeiro" : "falso"}
              </ResultChip>
            </span>
          </SubstitutedLine>
        </ExpressionBox>
      )}

      {(group.variables || []).map((variable, index) => (
        <VariableNodeView
          key={index}
          variable={variable}
          id={variableDomId(group, variable.name)}
          highlighted={highlighted === variable.name}
        />
      ))}

      {group.activated && relatedNames.length > 0 && (
        <RelatedBanner>
          Itens que ativaram o protocolo: {relatedNames.join(", ")}
        </RelatedBanner>
      )}
    </DateGroupBlock>
  );
}
