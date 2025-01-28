import React from "react";
import { useSelector } from "react-redux";

import { CardTable } from "components/Table";
import NodeStatusTag from "./NodeStatusTag";

export default function ListProcessors() {
  const status = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const datasource = Object.values(status ?? {})
    .map((v) => {
      return v;
    })
    .filter((v) => v.type);

  const columns = [
    {
      title: "Nome",
      align: "left",
      render: (_, record) => record.name,
    },
    {
      title: "Tipo",
      align: "left",
      render: (_, record) => record.type,
    },
    {
      title: "Grupo",
      align: "left",
      render: (_, record) => record.groupName,
    },
    {
      title: "Status",
      align: "center",
      render: (_, record) => (
        <NodeStatusTag status={record.runStatus} showIcon={false} />
      ),
    },
  ];

  const rowClassName = (record) => {
    if (record.runStatus === "Stopped") {
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
