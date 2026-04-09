import { useAppSelector } from "src/store";
import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import { IExamRawItem } from "../transformers";

export function ExamsRawList() {
  const datasource = useAppSelector(
    (state) => (state as any).examsModal.raw.filtered.result.list as IExamRawItem[]
  );

  const columns = [
    {
      title: "Data do Exame",
      width: 160,
      sorter: (a: IExamRawItem, b: IExamRawItem) =>
        a.dateExam < b.dateExam ? -1 : a.dateExam > b.dateExam ? 1 : 0,
      render: (_: unknown, record: IExamRawItem) => formatDateTime(record.dateExam),
    },
    {
      title: "Resultado",
      width: 160,
      sorter: (a: IExamRawItem, b: IExamRawItem) => {
        const av = a.value ?? "";
        const bv = b.value ?? "";
        return av < bv ? -1 : av > bv ? 1 : 0;
      },
      render: (_: unknown, record: IExamRawItem) => (record.value ? record.value : "-"),
    },
    {
      title: "Tipo",
      sorter: (a: IExamRawItem, b: IExamRawItem) =>
        a.typeExam < b.typeExam ? -1 : a.typeExam > b.typeExam ? 1 : 0,
      render: (_: unknown, record: IExamRawItem) => record.typeExam,
    },
    {
      title: "Nome configurado",
      render: (_: unknown, record: IExamRawItem) => record.segExamName || "-",
    },
    {
      title: "Ativo",
      render: (_: unknown, record: IExamRawItem) => (record.segExamActive ? "Sim" : "Não"),
    },
  ];

  return (
    <CardTable
      bordered
      columns={columns as any}
      rowKey={((row: IExamRawItem) => `${row.idExam}-${row.idPatient}-${row.typeExam}`) as any}
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
