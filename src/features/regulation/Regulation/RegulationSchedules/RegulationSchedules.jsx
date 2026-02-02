import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

import { formatDateTime } from "utils/date";

export default function RegulationSchedules() {
  const solicitation = useSelector(
    (state) => state.regulation.regulation.data.extra
  );
  const items = [
    {
      key: "1",
      label: "Data de Agendamento",
      children: solicitation.scheduleDate
        ? formatDateTime(solicitation.scheduleDate)
        : "Não agendado",
      span: 4,
    },
    {
      key: "2",
      label: "Data de Transporte",
      children: solicitation.transportationDate
        ? formatDateTime(solicitation.transportationDate)
        : "Não agendado",
      span: 4,
    },
  ];

  return (
    <Card title="Agendamentos" variant="borderless">
      <Descriptions bordered items={items} column={4} size="middle" />
    </Card>
  );
}
