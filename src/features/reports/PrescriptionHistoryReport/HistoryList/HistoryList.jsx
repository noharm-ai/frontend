import React from "react";
import { useSelector } from "react-redux";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";

export default function HistoryList() {
  const datasource = useSelector(
    (state) => state.reportsArea.prescriptionHistory.filtered.result.list
  );

  const columns = [
    {
      title: "Data",
      width: 160,
      align: "center",
      sorter: (a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      render: (_, record) => formatDateTime(record.createdAt),
    },
    {
      title: "Evento",
      render: (_, record) => {
        switch (record.type) {
          case 1:
            return "Prescrição checada";

          case 2:
            return "Desfazer checagem";

          case 3:
            return "Prescrição revisada";

          case 4:
            return "Desfazer revisão";

          case 5:
            return "Evolução enviada ao PEP";

          case 6:
            return "Checagem enviada ao PEP";

          case 7:
            return "Registro/Atualização de evolução";

          case 8:
            return "Criação do Paciente-Dia (prescrição do paciente)";

          default:
            return `Não definido: ${record.type}`;
        }
      },
    },
    {
      title: "Responsável",
      render: (_, record) => record.responsible || "NoHarm",
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey="id"
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}
