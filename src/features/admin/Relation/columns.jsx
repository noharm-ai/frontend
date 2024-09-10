import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import Tag from "components/Tag";

const columns = (setRelation, dispatch, t) => {
  return [
    {
      title: "Origem",
      dataIndex: "originName",
      align: "left",
    },
    {
      title: "Destino",
      dataIndex: "destinationName",
      align: "left",
    },
    {
      title: "Tipo",
      dataIndex: "kind",
      align: "center",
      render: (entry, record) => {
        return t(`drugAlertType.${record.kind}`);
      },
    },
    {
      title: "Nível",
      align: "center",
      render: (entry, record) => {
        return (
          <DrugAlertLevelTag
            levels={[record.level]}
            showDescription
            showTooltip={false}
          />
        );
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (entry, record) => {
        return (
          <Tag color={record.active ? "green" : null}>
            {record.active ? "Ativo" : "Inativo"}
          </Tag>
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
          <Tooltip title="Editar relação">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(setRelation(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};
export default columns;
