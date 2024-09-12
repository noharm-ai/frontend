import React from "react";
import { EditOutlined, CopyOutlined } from "@ant-design/icons";
import { Flex } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import Tag from "components/Tag";

const columns = (setRelation, dispatch, t) => {
  return [
    {
      title: "Subst. Origem",
      dataIndex: "originName",
      align: "left",
    },
    {
      title: "Subst. Relacionada",
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
          <Flex>
            <Tooltip title="Editar relação">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => dispatch(setRelation(record))}
              ></Button>
            </Tooltip>
            <Tooltip title="Copiar">
              <Button
                type="primary"
                style={{ marginLeft: "5px" }}
                icon={<CopyOutlined />}
                onClick={() =>
                  dispatch(setRelation({ ...record, new: true, sctida: null }))
                }
              ></Button>
            </Tooltip>
          </Flex>
        );
      },
    },
  ];
};
export default columns;
