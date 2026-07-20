import { useState } from "react";

import {
  CodeChipsWrap,
  DetailChipsRow,
  MonoChip,
  ResultChip,
  ToggleLink,
} from "./ProtocolTrace.style";
import { formatValue, variableTone } from "./formatters";
import type { IVariableTrace } from "./types";

export function ListFieldDetail({ variable }: { variable: IVariableTrace }) {
  const [expanded, setExpanded] = useState(false);
  const expectedList: any[] = Array.isArray(variable.expectedValue)
    ? variable.expectedValue
    : [variable.expectedValue];
  const actualList: any[] = Array.isArray(variable.actualValue)
    ? variable.actualValue
    : [variable.actualValue];
  const matched: any[] = variable.details?.matched ?? [];
  // absence of matches is only a "not found" outcome for IN — for NOTIN/NOT IN
  // an empty intersection means the check passed (nothing forbidden was present)
  const notFound = variable.operator === "IN" && matched.length === 0;

  return (
    <>
      <DetailChipsRow>
        {expectedList.map((v, index) => (
          <MonoChip key={index}>{formatValue(v)}</MonoChip>
        ))}
        {notFound && (
          <ResultChip $result={variableTone(variable)}>
            não encontrado
          </ResultChip>
        )}
      </DetailChipsRow>
      <ToggleLink onClick={() => setExpanded(!expanded)}>
        {expanded ? "Ocultar" : "Ver"} os {actualList.length}{" "}
        {variable.fieldLabel}(s) verificados
      </ToggleLink>
      {expanded && (
        <CodeChipsWrap>
          {actualList.length ? (
            actualList.map((v, index) => (
              <MonoChip key={index}>{formatValue(v)}</MonoChip>
            ))
          ) : (
            <span>—</span>
          )}
        </CodeChipsWrap>
      )}
    </>
  );
}
