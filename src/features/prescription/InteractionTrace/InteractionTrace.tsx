import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Select, Spin } from "antd";

import { formatDate, formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import RichTextView from "components/RichTextView";
import { traceInteraction } from "features/serverActions/ServerActionsSlice";
import { useAppDispatch } from "store/index";

import {
  Chip,
  DirectionBlock,
  KindBlock,
  LevelChip,
  Muted,
  Note,
  PickerRow,
  RelationCard,
  RelationList,
  RuleList,
  Section,
  ComparisonTable,
  Summary,
  TraceMeta,
  TraceRoot,
} from "./InteractionTrace.style";
import type {
  IInteractionTraceDirection,
  IInteractionTracePair,
  IInteractionTraceRelation,
  IInteractionTraceResponse,
  IInteractionTraceRule,
  IInteractionTraceSide,
} from "./types";

interface IInteractionTraceProps {
  idPrescription: number | string;
  idPrescriptionDrugFrom: string;
  /** without it, the item is compared with an allergy picked in the modal */
  idPrescriptionDrugTo?: string | null;
}

export function InteractionTrace({
  idPrescription,
  idPrescriptionDrugFrom,
  idPrescriptionDrugTo,
}: IInteractionTraceProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<IInteractionTraceResponse | null>(null);
  const [sctidAllergy, setSctidAllergy] = useState<string | null>(null);
  // key of the last answered request: loading while it differs from the
  // current one
  const [answeredKey, setAnsweredKey] = useState<string | null>(null);

  const comparesAllergy = !idPrescriptionDrugTo;
  const requestKey = [
    idPrescription,
    idPrescriptionDrugFrom,
    idPrescriptionDrugTo,
    sctidAllergy,
  ].join("|");
  const loading = answeredKey !== requestKey;

  useEffect(() => {
    const params: {
      idPrescription: number | string;
      idPrescriptionDrugFrom?: string;
      idPrescriptionDrugTo?: string;
      sctidAllergy?: string;
    } = { idPrescription };

    // a single item waits for the allergy: until then only the allergy list
    // is requested
    if (idPrescriptionDrugTo) {
      params.idPrescriptionDrugFrom = idPrescriptionDrugFrom;
      params.idPrescriptionDrugTo = idPrescriptionDrugTo;
    } else if (sctidAllergy) {
      params.idPrescriptionDrugFrom = idPrescriptionDrugFrom;
      params.sctidAllergy = sctidAllergy;
    }

    let stale = false;
    dispatch(traceInteraction(params)).then((response: any) => {
      if (stale) {
        return;
      }
      setAnsweredKey(requestKey);

      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        setData(response.payload.data);
      }
    });

    return () => {
      stale = true;
    };
  }, [
    dispatch,
    t,
    requestKey,
    idPrescription,
    idPrescriptionDrugFrom,
    idPrescriptionDrugTo,
    sctidAllergy,
  ]);

  const fromItem = data?.items.find(
    (i) => i.idPrescriptionDrug === `${idPrescriptionDrugFrom}`,
  );

  return (
    <Spin spinning={loading}>
      <TraceRoot>
        {data && (
          <TraceMeta>
            <span>Prescrição #{data.idPrescription}</span>
            <span className="divider">·</span>
            <span>Avaliada em {formatDateTime(data.evaluatedAt)}</span>
            <span className="divider">·</span>
            <span>
              {data.isCpoe
                ? "CPOE: comparados itens com vigências sobrepostas"
                : "Comparados itens com a mesma data de vigência"}
            </span>
          </TraceMeta>
        )}

        {comparesAllergy && data && (
          <>
            <PickerRow>
              <div>
                <label>Item</label>
                <strong>{fromItem?.drug ?? "--"}</strong>
              </div>
              <span className="arrow">×</span>
              <div>
                <label>Comparar com a alergia</label>
                <Select
                  showSearch={{ optionFilterProp: "label" }}
                  style={{ width: "100%" }}
                  placeholder="Selecione uma alergia do paciente"
                  value={sctidAllergy}
                  onChange={(value) => setSctidAllergy(value ?? null)}
                  options={data.allergies.map((a) => ({
                    value: a.sctid,
                    label: a.name,
                  }))}
                  notFoundContent="Paciente sem alergias com substância definida"
                />
              </div>
            </PickerRow>

            {data.allergiesWithoutSubstance.length > 0 && (
              <Note>
                Alergias sem substância definida (nunca geram reatividade
                cruzada): {data.allergiesWithoutSubstance.join(", ")}
              </Note>
            )}
          </>
        )}

        {data?.trace ? (
          <PairTrace trace={data.trace} />
        ) : (
          comparesAllergy &&
          data && (
            <Muted>
              Selecione uma alergia para ver por que um alerta de reatividade
              cruzada foi ou não gerado.
            </Muted>
          )
        )}
      </TraceRoot>
    </Spin>
  );
}

function PairTrace({ trace }: { trace: IInteractionTracePair }) {
  const withRelation = trace.kinds.filter((k) =>
    k.directions.some((d) => d.relation),
  );
  const withoutRelation = trace.kinds.filter(
    (k) => !k.directions.some((d) => d.relation),
  );

  return (
    <>
      <Summary $alerted={trace.alerted}>{trace.summary}</Summary>

      {trace.notes.map((note) => (
        <Note key={note}>{note}</Note>
      ))}

      <ItemsComparison from={trace.from} to={trace.to} />

      <Section>
        <h4>Pré-condições</h4>
        <Rules rules={trace.checks} />
      </Section>

      <Section>
        <h4>Relações cadastradas entre as substâncias</h4>
        {trace.relations.length === 0 ? (
          <Muted>Nenhuma relação cadastrada.</Muted>
        ) : (
          <RelationList>
            {trace.relations.map((r) => (
              <Relation
                key={`${r.sctida}-${r.sctidb}-${r.kind}`}
                relation={r}
              />
            ))}
          </RelationList>
        )}
      </Section>

      {trace.compared && (
        <Section>
          <h4>Avaliação por tipo de relação</h4>
          {withRelation.map((kind) => (
            <KindBlock key={kind.kind}>
              <div className="kind-title">{kind.label}</div>
              {kind.directions.map((direction, index) => (
                <Direction key={index} direction={direction} />
              ))}
            </KindBlock>
          ))}
          {withoutRelation.length > 0 && (
            <Muted style={{ marginTop: "0.5rem" }}>
              Sem relação cadastrada:{" "}
              {withoutRelation.map((k) => k.label).join(", ")}
            </Muted>
          )}
        </Section>
      )}
    </>
  );
}

const LEVEL_LABELS: Record<string, string> = {
  high: "alto",
  medium: "médio",
  low: "baixo",
};

const levelLabel = (level: string | null) =>
  level ? (LEVEL_LABELS[level] ?? level) : "sem nível";

function Relation({ relation }: { relation: IInteractionTraceRelation }) {
  return (
    <RelationCard $inactive={!relation.active}>
      <div className="relation-heading">
        <Chip $variant={relation.active ? "success" : "muted"}>
          {relation.active ? "ativa" : "inativa"}
        </Chip>
        <strong>{relation.label}</strong>
        <LevelChip $level={relation.level}>
          nível {levelLabel(relation.level)}
        </LevelChip>
      </div>
      <div className="relation-substances">
        {relation.substanceA ?? relation.sctida} →{" "}
        {relation.substanceB ?? relation.sctidb}
      </div>
      {relation.text && (
        <div className="relation-text">
          <RichTextView text={relation.text} maxWidth="100%" />
        </div>
      )}
    </RelationCard>
  );
}

const yesNo = (value?: boolean | null) =>
  value == null ? "--" : value ? "sim" : "não";

const dateTime = (value?: string | null) =>
  value ? formatDate(value, "DD/MM/YYYY HH:mm") : "--";

// what the analysis compares, one row per attribute so both items line up;
// prescriptionOnly rows do not exist for an allergy
const COMPARISON_ROWS: {
  label: string;
  prescriptionOnly?: boolean;
  value: (side: IInteractionTraceSide) => ReactNode;
}[] = [
  {
    label: "Substância",
    value: (side) => (
      <>
        {side.substance ?? "--"}
        {side.sctid && <span className="code"> ({side.sctid})</span>}
      </>
    ),
  },
  { label: "Origem", value: (side) => side.source },
  {
    label: "fkpresmed",
    prescriptionOnly: true,
    value: (side) => side.idPrescriptionDrug,
  },
  {
    label: "Intravenoso",
    prescriptionOnly: true,
    value: (side) => yesNo(side.intravenous),
  },
  {
    label: "Grupo de solução",
    prescriptionOnly: true,
    value: (side) => side.group ?? "--",
  },
  {
    label: "Frequência",
    prescriptionOnly: true,
    value: (side) => side.frequency ?? "--",
  },
  {
    label: "Horários",
    prescriptionOnly: true,
    value: (side) => side.interval || "--",
  },
  {
    label: "Início",
    prescriptionOnly: true,
    value: (side) => dateTime(side.prescriptionDate),
  },
  {
    label: "Fim da vigência",
    prescriptionOnly: true,
    value: (side) => dateTime(side.expireDate),
  },
];

function ItemsComparison({
  from,
  to,
}: {
  from: IInteractionTraceSide;
  to: IInteractionTraceSide;
}) {
  const cell = (
    side: IInteractionTraceSide,
    row: (typeof COMPARISON_ROWS)[number],
  ) =>
    row.prescriptionOnly && !side.idPrescriptionDrug ? (
      <td className="not-applicable">não se aplica</td>
    ) : (
      <td>{row.value(side)}</td>
    );

  return (
    <ComparisonTable>
      <table>
        <colgroup>
          <col className="label-col" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th />
            <th>{from.drug ?? "--"}</th>
            <th>{to.drug ?? "--"}</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {cell(from, row)}
              {cell(to, row)}
            </tr>
          ))}
        </tbody>
      </table>
    </ComparisonTable>
  );
}

function Rules({ rules }: { rules: IInteractionTraceRule[] }) {
  return (
    <RuleList>
      {rules.map((rule, index) => (
        <li key={index}>
          <span className={`icon ${rule.passed ? "passed" : "failed"}`}>
            {rule.passed ? "✓" : "✗"}
          </span>
          <span>{rule.message}</span>
        </li>
      ))}
    </RuleList>
  );
}

function Direction({ direction }: { direction: IInteractionTraceDirection }) {
  return (
    <DirectionBlock>
      <div className="direction-heading">
        <span>
          {direction.from} → {direction.to}
        </span>
        <Chip $variant={direction.alerted ? "danger" : "muted"}>
          {direction.alerted ? "alerta gerado" : "sem alerta"}
        </Chip>
      </div>
      <div className="message">{direction.message}</div>

      {direction.rules.length > 0 && <Rules rules={direction.rules} />}

      {direction.alert && (
        <>
          <div>
            Nível:{" "}
            <LevelChip $level={direction.alert.level}>
              {levelLabel(direction.alert.level)}
            </LevelChip>
            {" · "}Exibido em: {direction.alert.shownOn.join(", ")}
          </div>
          {direction.alert.levelNotes.map((note) => (
            <Muted key={note}>{note}</Muted>
          ))}
          <div className="alert-text">
            <RichTextView text={direction.alert.text} maxWidth="100%" />
          </div>
        </>
      )}
    </DirectionBlock>
  );
}
