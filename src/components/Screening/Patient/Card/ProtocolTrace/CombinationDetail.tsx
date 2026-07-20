import { useState } from "react";

import {
  CombinationTable,
  DetailChipsRow,
  TableScrollWrap,
  ToggleLink,
} from "./ProtocolTrace.style";
import { formatValue } from "./formatters";
import type { IVariableTrace } from "./types";

export function CombinationDetail({ variable }: { variable: IVariableTrace }) {
  const [expanded, setExpanded] = useState(false);
  const drugs = variable.drugs || [];
  const matchedCount = drugs.filter((d) => d.matched).length;
  const criteriaLabels = Array.from(
    new Set(drugs.flatMap((d) => d.criteria.map((c) => c.criterionLabel)))
  ).join(", ");

  return (
    <>
      <DetailChipsRow>
        <span>
          {criteriaLabels ? `Critérios: ${criteriaLabels} · ` : ""}
          {drugs.length} itens avaliados · {matchedCount} correspondem
        </span>
      </DetailChipsRow>
      <ToggleLink onClick={() => setExpanded(!expanded)}>
        {expanded ? "Ocultar" : "Ver"} os {drugs.length} itens avaliados
      </ToggleLink>
      {expanded && (
        <TableScrollWrap>
          <CombinationTable>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Encontrado</th>
                <th>Esperado</th>
                <th>Período</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug, index) => {
                const primary =
                  drug.criteria.find(
                    (c) => c.criterion === drug.failedCriterion
                  ) ||
                  drug.criteria.find((c) => c.result !== null) ||
                  drug.criteria[0];
                const period = drug.criteria.find(
                  (c) => c.criterion === "period"
                );
                const notEvaluated =
                  !drug.matched && drug.criteria.every((c) => c.result === null);

                return (
                  <tr
                    key={drug.idPrescriptionDrug}
                    className={drug.matched ? "matched" : ""}
                  >
                    <td>{index + 1}</td>
                    <td>{drug.name || `Item ${drug.idPrescriptionDrug}`}</td>
                    <td>{primary ? formatValue(primary.actual) : "—"}</td>
                    <td>{primary ? formatValue(primary.expected) : "—"}</td>
                    <td>
                      {period
                        ? `${formatValue(period.actual)} / ${formatValue(
                            period.expected
                          )}`
                        : "—"}
                    </td>
                    <td>
                      {notEvaluated ? (
                        <span className="status-na">—</span>
                      ) : drug.matched ? (
                        <span className="status-ok">✓</span>
                      ) : (
                        <span className="status-fail">✗</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </CombinationTable>
        </TableScrollWrap>
      )}
    </>
  );
}
