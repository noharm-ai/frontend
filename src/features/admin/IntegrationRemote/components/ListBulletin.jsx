import React from "react";
import { useSelector } from "react-redux";

import { CardTable } from "components/Table";
import RichTextView from "components/RichTextView";

export default function ListBulletin() {
  const data = useSelector(
    (state) => state.admin.integrationRemote.template.bulletin
  );

  const datasource = data?.bulletinBoard?.bulletins ?? [];

  const columns = [
    {
      title: "Hora",
      align: "center",
      render: (_, record) => record.timestamp,
    },
    {
      title: "Categoria",
      render: (_, record) => record.bulletin.category,
    },
    {
      title: "Origem",
      render: (_, record) => record.bulletin.sourceName,
    },
    {
      title: "Level",
      render: (_, record) => record.bulletin.level,
    },
    {
      title: "Mensagem",
      render: (_, record) => (
        <RichTextView text={record.bulletin.message.replace(/\]/, "]<br/>")} />
      ),
    },
  ];

  return (
    <CardTable
      bordered
      columns={columns}
      rowKey="id"
      dataSource={datasource ?? []}
      footer={() => (
        <div style={{ textAlign: "center" }}>
          {datasource?.length} registro(s)
        </div>
      )}
      size="small"
      pagination={{ showSizeChanger: true }}
    />
  );
}
