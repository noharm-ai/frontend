import type { ComponentType } from "react";
import type { TableProps } from "antd";

import { useAppSelector } from "src/store";
import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import type { RawExam } from "../transformers";

// CardTable is styled(antd Table), which drops the Table's record type
const ExamsTable = CardTable as unknown as ComponentType<TableProps<RawExam>>;

export function ExamsList() {
  const datasource = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.filtered.result.list,
  );

  const columns: TableProps<RawExam>["columns"] = [
    {
      title: "Data do Exame",
      width: 160,
      sorter: (a: RawExam, b: RawExam) =>
        a.dateExam < b.dateExam ? -1 : a.dateExam > b.dateExam ? 1 : 0,
      render: (_: unknown, record: RawExam) => formatDateTime(record.dateExam),
    },
    {
      title: "Resultado",
      width: 160,
      sorter: (a: RawExam, b: RawExam) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0,
      render: (_: unknown, record: RawExam) =>
        record.value ? record.value : "-",
    },
    {
      title: "Unidade",
      width: 160,
      render: (_: unknown, record: RawExam) =>
        record.unit ? record.unit : "-",
    },
    {
      title: "Tipo",
      sorter: (a: RawExam, b: RawExam) =>
        a.typeExam < b.typeExam ? -1 : a.typeExam > b.typeExam ? 1 : 0,
      render: (_: unknown, record: RawExam) => record.typeExam,
    },
  ];

  return (
    <>
      <ExamsTable
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
