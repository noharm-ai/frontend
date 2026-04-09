import { SettingOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { fetchExam } from "features/admin/Exam/ExamForm/ExamFormSlice";
import { IExamRawItem } from "../transformers";

interface IExamsRawListProps {
  idSegment: number;
}

export function ExamsRawList({ idSegment }: IExamsRawListProps) {
  const dispatch = useAppDispatch();
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
    {
      title: "Ações",
      width: 80,
      render: (_: unknown, record: IExamRawItem) => (
        <Tooltip title="Configurar exame">
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() =>
              dispatch(fetchExam({ idSegment, examType: record.typeExam }))
            }
          />
        </Tooltip>
      ),
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
