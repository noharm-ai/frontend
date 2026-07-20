import { CombinationDetail } from "./CombinationDetail";
import { LIST_FIELDS, REASON_LABELS } from "./constants";
import { ExamDetail } from "./ExamDetail";
import { ListFieldDetail } from "./ListFieldDetail";
import {
  Headline,
  MonoChip,
  ResultChip,
  VariableFooter,
  VariableNode,
  VariableRow,
} from "./ProtocolTrace.style";
import { stripMessage, variableTone } from "./formatters";
import type { IVariableTrace } from "./types";

export function VariableNodeView({
  variable,
  id,
  highlighted,
}: {
  variable: IVariableTrace;
  id: string;
  highlighted: boolean;
}) {
  const tone = variableTone(variable);
  const headline = stripMessage(
    variable.message,
    variable.name,
    variable.fieldLabel
  );

  return (
    <VariableNode id={id} $stripe={tone} $highlighted={highlighted}>
      <VariableRow>
        <MonoChip>{variable.name}</MonoChip>
        <span className="field-label">{variable.fieldLabel}</span>
        <span className="spacer" />
        <ResultChip $result={tone}>
          {variable.result ? "verdadeiro" : "falso"}
        </ResultChip>
      </VariableRow>

      <Headline>{headline}</Headline>

      {variable.field === "exam" || variable.field === "exam_ref" ? (
        <ExamDetail variable={variable} />
      ) : variable.field === "combination" ? (
        <CombinationDetail variable={variable} />
      ) : LIST_FIELDS.has(variable.field) ? (
        <ListFieldDetail variable={variable} />
      ) : null}

      <VariableFooter>
        <span className="reason">
          {REASON_LABELS[variable.reason] || variable.reason}
        </span>
        <span className="raw-message">{variable.message}</span>
      </VariableFooter>
    </VariableNode>
  );
}
