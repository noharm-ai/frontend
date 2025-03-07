import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDateTime } from "utils/date";
import RichTextView from "components/RichTextView";

export default function RegulationData() {
  const solicitation = useSelector((state) => state.regulation.regulation.data);
  const items = [
    {
      key: "1",
      label: "Protocolo",
      children: solicitation.id,
      span: 2,
    },
    {
      key: "2",
      label: "Data da Solicitação",
      children: formatDateTime(solicitation.date),
      span: 2,
    },
    {
      key: "3",
      label: "Procedimento solicitado",
      children: `${solicitation.idRegSolicitationType} - ${solicitation.type}`,
      span: 4,
    },
    {
      key: "4",
      label: "Profissional solicitante",
      children: solicitation.attendant,
      span: 2,
    },
    {
      key: "5",
      label: "Registro do profissional solicitante",
      children: solicitation.attendantRecord,
      span: 2,
    },
    {
      key: "7",
      label: "CID",
      children: solicitation.cid,
      span: 4,
    },
    {
      key: "8",
      label: "Justificativa",
      children: <RichTextView text={solicitation.justification} />,
      span: 4,
    },
  ];

  return (
    <Card title="Solicitação" bordered={false}>
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
