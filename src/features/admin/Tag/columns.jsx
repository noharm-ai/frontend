import React from "react";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

const columns = (setTag, dispatch, t) => {
  return [
    {
      title: "Marcador",
      dataIndex: "name",
    },
    {
      title: "Tipo",
      align: "center",
      render: (entry, record) => {
        switch (record.tagType) {
          case 1:
            return "Paciente";
          default:
            return record.tagType;
        }
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (entry, record) => {
        return record.active ? (
          <Tag color="green">Ativo</Tag>
        ) : (
          <Tag>Inativo</Tag>
        );
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar marcador">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setTag(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
