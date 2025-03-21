import { TableProps } from "antd";

import RichTextView from "components/RichTextView";
import { CardTable } from "components/Table";
import { INodeData } from "./NodeModal";

export function BulletinTab({ data }: { data: INodeData }) {
  const bulletinColumns: TableProps<any>["columns"] = [
    {
      title: "Hora",
      align: "center",
      render: (_, record) => record.timestamp,
    },
    {
      title: "Categoria",
      render: (_, record) => record.category,
    },
    {
      title: "Origem",
      render: (_, record) => record.sourceName,
    },
    {
      title: "Level",
      render: (_, record) => record.level,
    },
    {
      title: "Mensagem",
      render: (_, record) => (
        <RichTextView text={record.message} maxWidth={null} />
      ),
    },
  ];

  return (
    <CardTable
      bordered
      columns={bulletinColumns}
      rowKey="id"
      dataSource={
        data?.status?.bulletinErrors && data.status?.bulletinErrors?.length > 0
          ? data.status?.bulletinErrors
          : []
      }
      size="small"
      pagination={{ showSizeChanger: true }}
    />
  );
}
