import React from "react";
import { useSelector } from "react-redux";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";

export function ExamsRawList() {
  const datasource = useSelector(
    (state) => state.examsModal.raw.filtered.result.list,
  );

  const columns = [
    {
      title: "Data do Exame",
      width: 160,
      sorter: (a, b) =>
        a.dateExam < b.dateExam ? -1 : a.dateExam > b.dateExam ? 1 : 0,
      render: (_, record) => formatDateTime(record.dateExam),
    },
    {
      title: "Resultado",
      width: 160,
      sorter: (a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0),
      render: (_, record) => (record.value ? record.value : "-"),
    },

    {
      title: "Tipo",
      sorter: (a, b) =>
        a.typeExam < b.typeExam ? -1 : a.typeExam > b.typeExam ? 1 : 0,
      render: (_, record) => record.typeExam,
    },
    {
      title: "Nome configurado",
      render: (_, record) => record.segExamName || "-",
    },
    {
      title: "Ativo",
      render: (_, record) => (record.segExamActive ? "Sim" : "Não"),
    },
  ];

  return (
    <CardTable
      bordered
      columns={columns}
      rowKey={(row) => `${row.idExam}-${row.idPatient}-${row.typeExam}`}
      dataSource={datasource}
      footer={() => (
        <div style={{ textAlign: "center" }}>
          {datasource.length} registro(s)
        </div>
      )}
      size="small"
      pagination={{ showSizeChanger: true }}
    />
  );
}
