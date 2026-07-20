import { formatDate, isDate } from "utils/date";

import { DetailChipsRow, LabeledChip } from "./ProtocolTrace.style";
import { formatValue } from "./formatters";
import type { IVariableTrace } from "./types";

export function ExamDetail({ variable }: { variable: IVariableTrace }) {
  const examDate = variable.details?.examDate;

  return (
    <DetailChipsRow>
      <LabeledChip>
        <span className="k">exame</span>
        <span className="v">{variable.details?.examType ?? "—"}</span>
      </LabeledChip>
      <LabeledChip>
        <span className="k">encontrado</span>
        <span className="v">{formatValue(variable.actualValue)}</span>
      </LabeledChip>
      <LabeledChip>
        <span className="k">esperado</span>
        <span className="v">
          {variable.operatorLabel ? `${variable.operatorLabel} ` : ""}
          {formatValue(variable.expectedValue)}
        </span>
      </LabeledChip>
      <LabeledChip>
        <span className="k">medido</span>
        <span className="v">
          {examDate && isDate(examDate) ? formatDate(examDate) : examDate ?? "—"}
        </span>
      </LabeledChip>
    </DetailChipsRow>
  );
}
