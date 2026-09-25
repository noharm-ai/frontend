import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, Spin } from "antd";

import { formatDate, formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import { traceInteraction } from "features/serverActions/ServerActionsSlice";
import { useAppDispatch } from "store/index";

import {
  Chip,
  DirectionBlock,
  KindBlock,
  Muted,
  Note,
  OptionMeta,
  PickerRow,
  RuleList,
  Section,
  SideCard,
  SidesGrid,
  Summary,
  TraceMeta,
  TraceRoot,
} from "./InteractionTrace.style";
import type {
  IInteractionTraceDirection,
  IInteractionTraceItem,
  IInteractionTracePair,
  IInteractionTraceResponse,
  IInteractionTraceRule,
  IInteractionTraceSide,
} from "./types";

const ALLERGY_PREFIX = "allergy:";

interface IInteractionTraceProps {
  idPrescription: number | string;
}

export function InteractionTrace({ idPrescription }: IInteractionTraceProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IInteractionTraceResponse | null>(null);
  const [fromId, setFromId] = useState<string | null>(null);
  const [toValue, setToValue] = useState<string | null>(null);

  const pair = fromId && toValue ? { fromId, toValue } : null;
  const pairKey = pair ? `${pair.fromId}|${pair.toValue}` : null;
  const hasData = data != null;

  useEffect(() => {
    // the item list only needs loading once; afterwards an incomplete pair
    // just clears the previous trace
    if (!pairKey && hasData) {
      setData((prev) => prev && { ...prev, trace: null });
      return;
    }

    const params: {
      idPrescription: number | string;
      idPrescriptionDrugFrom?: string;
      idPrescriptionDrugTo?: string;
      sctidAllergy?: string;
    } = { idPrescription };
    if (pairKey) {
      const [from, to] = pairKey.split("|");
      params.idPrescriptionDrugFrom = from;
      if (to.startsWith(ALLERGY_PREFIX)) {
        params.sctidAllergy = to.slice(ALLERGY_PREFIX.length);
      } else {
        params.idPrescriptionDrugTo = to;
      }
    }

    let stale = false;
    setLoading(true);
    dispatch(traceInteraction(params)).then((response: any) => {
      if (stale) {
        return;
      }
      setLoading(false);

      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        setData(response.payload.data);
      }
    });

    return () => {
      stale = true;
    };
    // hasData is left out on purpose: loading the list must not refetch it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, t, idPrescription, pairKey]);

  const itemLabel = (item: IInteractionTraceItem) => (
    <>
      {item.drug ?? "--"}
      {data?.agg && (
        <OptionMeta style={{ color: "#8c94a6" }}>
          #{item.idPrescription}
        </OptionMeta>
      )}
      {!item.eligible && <OptionMeta>não analisado</OptionMeta>}
    </>
  );

  const itemOptions = (exclude: string | null) =>
    (data?.items ?? [])
      .filter((i) => i.idPrescriptionDrug !== exclude)
      .map((i) => ({
        value: i.idPrescriptionDrug,
        label: itemLabel(i),
        search: i.drug ?? "",
      }));

  const toOptions = [
    { label: "Itens da prescrição", options: itemOptions(fromId) },
    {
      label: "Alergias do paciente",
      options: (data?.allergies ?? []).map((a) => ({
        value: `${ALLERGY_PREFIX}${a.sctid}`,
        label: <>{a.name}</>,
        search: a.name,
      })),
    },
  ];

  const filterOption = (input: string, option?: unknown) =>
    String((option as { search?: string } | undefined)?.search ?? "")
      .toLowerCase()
      .includes(input.toLowerCase());

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

        <PickerRow>
          <div>
            <label>Item</label>
            <Select
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Selecione um item da prescrição"
              value={fromId}
              onChange={(value) => {
                setFromId(value ?? null);
                if (value && value === toValue) {
                  setToValue(null);
                }
              }}
              options={itemOptions(null)}
              filterOption={filterOption}
            />
          </div>
          <span className="arrow">×</span>
          <div>
            <label>Comparar com</label>
            <Select
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Selecione outro item ou uma alergia"
              value={toValue}
              onChange={(value) => setToValue(value ?? null)}
              options={toOptions}
              filterOption={filterOption}
              disabled={!fromId}
            />
          </div>
        </PickerRow>

        {data && data.allergiesWithoutSubstance.length > 0 && (
          <Note>
            Alergias sem substância definida (nunca geram reatividade cruzada):{" "}
            {data.allergiesWithoutSubstance.join(", ")}
          </Note>
        )}

        {data?.trace ? (
          <PairTrace trace={data.trace} />
        ) : (
          <Muted>
            Selecione dois itens para ver por que um alerta de interação foi ou
            não gerado entre eles.
          </Muted>
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

      <SidesGrid>
        <Side side={trace.from} />
        <Side side={trace.to} />
      </SidesGrid>

      <Section>
        <h4>Pré-condições</h4>
        <Rules rules={trace.checks} />
      </Section>

      <Section>
        <h4>Relações cadastradas entre as substâncias</h4>
        {trace.relations.length === 0 ? (
          <Muted>Nenhuma relação cadastrada.</Muted>
        ) : (
          <RuleList>
            {trace.relations.map((r) => (
              <li key={`${r.sctida}-${r.sctidb}-${r.kind}`}>
                <Chip $variant={r.active ? "success" : "muted"}>
                  {r.active ? "ativa" : "inativa"}
                </Chip>
                <span>
                  <strong>{r.label}</strong>: {r.substanceA ?? r.sctida} →{" "}
                  {r.substanceB ?? r.sctidb} (nível: {r.level ?? "--"})
                  {r.text ? ` — ${r.text}` : ""}
                </span>
              </li>
            ))}
          </RuleList>
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

function Side({ side }: { side: IInteractionTraceSide }) {
  const yesNo = (value?: boolean | null) =>
    value == null ? "--" : value ? "sim" : "não";

  return (
    <SideCard>
      <div className="name">{side.drug ?? "--"}</div>
      <dl>
        <dt>Substância</dt>
        <dd>
          {side.substance ?? "--"} {side.sctid && `(${side.sctid})`}
        </dd>
        <dt>Origem</dt>
        <dd>{side.source}</dd>
        {side.idPrescriptionDrug && (
          <>
            <dt>fkpresmed</dt>
            <dd>{side.idPrescriptionDrug}</dd>
            <dt>Intravenoso</dt>
            <dd>{yesNo(side.intravenous)}</dd>
            <dt>Grupo de solução</dt>
            <dd>{side.group ?? "--"}</dd>
            <dt>Frequência</dt>
            <dd>{side.frequency ?? "--"}</dd>
            <dt>Horários</dt>
            <dd>{side.interval ?? "--"}</dd>
            <dt>Vigência</dt>
            <dd>
              {side.prescriptionDate
                ? formatDate(side.prescriptionDate, "DD/MM/YYYY HH:mm")
                : "--"}{" "}
              a{" "}
              {side.expireDate
                ? formatDate(side.expireDate, "DD/MM/YYYY HH:mm")
                : "--"}
            </dd>
          </>
        )}
      </dl>
    </SideCard>
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
            Nível: <strong>{direction.alert.level}</strong>
            {" · "}Exibido em: {direction.alert.shownOn.join(", ")}
          </div>
          {direction.alert.levelNotes.map((note) => (
            <Muted key={note}>{note}</Muted>
          ))}
          <div className="alert-text">{direction.alert.text}</div>
        </>
      )}
    </DirectionBlock>
  );
}
