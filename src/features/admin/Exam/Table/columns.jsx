import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { formatDateTime } from "utils/date";

const sortDirections = ["descend", "ascend"];

const columns = () => {
  const columns = [];

  return [
    ...columns,
    {
      title: "Segmento",
      ellipsis: true,
      render: (entry, record) => {
        return record.segment;
      },
    },
    {
      title: "Tipo",
      dataIndex: "type",
      sortDirections,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },

    {
      title: "Nome",
      dataIndex: "name",
      align: "left",
      sortDirections,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Rótulo",
      align: "left",
      dataIndex: "initials",
      sortDirections,
      sorter: (a, b) => a.initials.localeCompare(b.initials),
    },
    {
      title: "Mínimo",
      dataIndex: "min",
    },
    {
      title: "Máximo",
      dataIndex: "max",
    },
    {
      title: "Referência",
      dataIndex: "ref",
      ellipsis: true,
    },
    {
      title: "Atualizado em",
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (entry, record) =>
        record.updatedAt ? formatDateTime(record.updatedAt) : "--",
    },
    {
      title: "Situação",
      render: (entry, record) => (
        <Tag color={record.active ? "green" : null}>
          {record.active ? "Ativo" : "Inativo"}
        </Tag>
      ),
    },
    {
      title: "Ações",
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Alterar exame">
            <Button
              type="primary gtm-bt-view-exam"
              onClick={() => record.showModal(record)}
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
