import { useState } from "react";

import { formatDate } from "utils/date";

import { renderExpression } from "./expression";
import { buildRelatedItemNames, variableDomId } from "./formatters";
import {
  DateGroupBlock,
  DateGroupHeading,
  DiscardedBadge,
  DiscardedNote,
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
  // the trigger fired, but the protocol only counts on the latest expire date,
  // so this group raises no alert — the whole point of showing it is to explain
  // why the pharmacist sees nothing
  const discarded = !!group.discarded;

  return (
    <DateGroupBlock $discarded={discarded}>
      <DateGroupHeading $discarded={discarded}>
        <strong>Vigência: {formatDate(group.date)}</strong>
        <ResultChip
          $result={discarded ? "muted" : group.activated ? "true" : "false"}
        >
          {group.activated ? "ativado" : "não ativado"}
        </ResultChip>
        {discarded && (
          <DiscardedBadge>descartado — fora da última vigência</DiscardedBadge>
        )}
      </DateGroupHeading>

      {discarded && group.summary && (
        <DiscardedNote>{group.summary}</DiscardedNote>
      )}

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
        <RelatedBanner $muted={discarded}>
          {discarded
            ? "Itens que corresponderam ao gatilho"
            : "Itens que ativaram o protocolo"}
          : {relatedNames.join(", ")}
        </RelatedBanner>
      )}
    </DateGroupBlock>
  );
}
