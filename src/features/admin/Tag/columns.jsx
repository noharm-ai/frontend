import React from "react";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Tag } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { canWriteTag } from "./tagPermissions";

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
          case 2:
            return "Paciente (Navegação)";
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
        // write access depends on the tag type: WRITE_PATIENT_TAGS covers
        // navigation tags only
        const label = canWriteTag(record.tagType)
          ? "Editar marcador"
          : "Visualizar marcador";

        return (
          <Tooltip title={label}>
            <Button
              type="primary"
              aria-label={label}
              icon={
                canWriteTag(record.tagType) ? <EditOutlined /> : <EyeOutlined />
              }
              onClick={() => dispatch(setTag(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
