import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDateTime } from "utils/date";
import RichTextView from "components/RichTextView";
import RegulationStageTag from "src/components/RegulationStageTag";
import RegulationRiskTag from "src/components/RegulationRiskTag";

export default function RegulationData({ print = false }) {
  const solicitation = useSelector((state) => state.regulation.regulation.data);
  const items = [
    {
      key: "1",
      label: "Protocolo",
      children: solicitation.id,
      span: print ? 4 : 2,
    },
    {
      key: "2",
      label: "Data da Solicitação",
      children: formatDateTime(solicitation.date),
      span: print ? 4 : 2,
    },
  ];

  if (print) {
    items.push({
      key: "stage",
      label: "Etapa",
      children: <RegulationStageTag stage={solicitation.stage} />,
      span: 4,
    });

    items.push({
      key: "risk",
      label: "Risco",
      children: <RegulationRiskTag risk={solicitation.risk} tag={true} />,
      span: 4,
    });
  }

  items.push({
    key: "3",
    label: "Procedimento solicitado",
    children: `${solicitation.idRegSolicitationType} - ${solicitation.type}`,
    span: print ? 4 : 4,
  });
  items.push({
    key: "4",
    label: "Profissional solicitante",
    children: solicitation.attendant,
    span: print ? 4 : 2,
  });

  items.push({
    key: "5",
    label: "Registro do profissional solicitante",
    children: solicitation.attendantRecord,
    span: print ? 4 : 2,
  });

  items.push({
    key: "7",
    label: "CID",
    children: solicitation.cid,
    span: print ? 4 : 4,
  });

  items.push({
    key: "8",
    label: "Justificativa",
    children: <RichTextView text={solicitation.justification} />,
    span: print ? 4 : 4,
  });

  return (
    <Card title="Solicitação" bordered={false}>
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
