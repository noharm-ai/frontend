import React from "react";
import { useSelector } from "react-redux";

import { CardTable } from "components/Table";

export default function ListConnections() {
  const status = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const datasource = Object.values(status)
    .map((v) => {
      return v;
    })
    .filter((v) => v.sourceName)
    .sort((a, b) => b.bytesQueued - a.bytesQueued);

  const columns = [
    {
      title: "Origem",
      align: "left",
      render: (_, record) => record.sourceName,
    },
    {
      title: "Destino",
      align: "left",
      render: (_, record) => record.destinationName,
    },
    {
      title: "Contagem",
      align: "right",
      sorter: (a, b) => a.queuedCount - b.queuedCount,
      render: (_, record) => record.queuedCount,
    },
    {
      title: "Size (KB)",
      align: "right",
      sorter: (a, b) => a.bytesQueued - b.bytesQueued,
      render: (_, record) => (record.bytesQueued / 1024).toFixed(2),
    },
  ];

  const rowClassName = (record) => {
    if (record.bytesQueued > 512000 || record.queuedCount > 30) {
      return "danger";
    }

    return "";
  };

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
      rowClassName={(record) => rowClassName(record)}
    />
  );
}
