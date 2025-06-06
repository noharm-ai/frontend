import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "utils/date";

const columns = (setSubstance, dispatch, t) => {
  return [
    {
      title: "Substância",
      dataIndex: "name",
      align: "left",
    },
    {
      title: "ID Classe",
      dataIndex: "idClass",
      align: "left",
    },
    {
      title: "Classe",
      dataIndex: "className",
      align: "left",
    },
    {
      title: "Ativo",
      align: "center",
      render: (entry, record) => {
        return record.active ? "Sim" : "Não";
      },
    },
    {
      title: "Atualizado em",
      align: "center",
      render: (entry, record) => {
        return record.updatedAt ? formatDateTime(record.updatedAt) : "-";
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar substância">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setSubstance(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
