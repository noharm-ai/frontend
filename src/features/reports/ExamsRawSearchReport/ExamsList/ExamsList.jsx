import React from "react";
import { useSelector } from "react-redux";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";

export default function ExamsList() {
  const datasource = useSelector(
    (state) => state.reportsArea.examsRawSearch.filtered.result.list
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
      title: "Unidade",
      width: 160,
      render: (_, record) => (record.unit ? record.unit : "-"),
    },
    {
      title: "Tipo",
      sorter: (a, b) =>
        a.typeExam < b.typeExam ? -1 : a.typeExam > b.typeExam ? 1 : 0,
      render: (_, record) => record.typeExam,
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey={(row) => `${row.idExam}-${row.idPatient}-${row.typeExam}`}
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
