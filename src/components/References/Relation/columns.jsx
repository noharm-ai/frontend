import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

export const getTypeName = (currentType, types) => {
  if (currentType == null || types == null) return "";

  var type = "";
  types.map(({ key, value }) => (type = currentType === key ? value : type));

  return type;
};

const truncateText = (text) => {
  if (!text) return text;
  const max = 40;
  const ellipsis = text.length > max ? "..." : "";

  return text.substring(0, Math.min(max, text.length)) + ellipsis;
};

const columns = (security) => [
  {
    title: "Substância relacionada",
    sorter: (a, b) => a.nameB.localeCompare(b.nameB),
    sortDirections: ["descend", "ascend"],
    dataIndex: "nameB",
    width: 350,
  },
  {
    title: "Tipo",
    sorter: (a, b) =>
      getTypeName(a.type, a.relationTypes).localeCompare(
        getTypeName(b.type, b.relationTypes)
      ),
    render: (entry, record) => {
      return getTypeName(record.type, record.relationTypes);
    },
  },
  {
    title: "Efeito",
    render: (entry, { text }) => {
      const regex = /(<([^>]+)>)/gi;
      const cleanText = text ? text.replace(regex, "") : "";
      return <Tooltip title={cleanText}>{truncateText(cleanText)}</Tooltip>;
    },
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
    title: "Nível",
    render: (entry, record) => {
      switch (record.level) {
        case "low":
          return (
            <Tag
              style={{
                background: "#ffc107",
                borderColor: "#ffc107",
                color: "#fff",
              }}
            >
              Baixo
            </Tag>
          );
        case "medium":
          return (
            <Tag
              style={{
                background: "#f57f17",
                borderColor: "#f57f17",
                color: "#fff",
              }}
            >
              Médio
            </Tag>
          );
        case "high":
          return (
            <Tag
              style={{
                background: "#f44336",
                borderColor: "#f44336",
                color: "#fff",
              }}
            >
              Alto
            </Tag>
          );
        default:
          return record.level;
      }
    },
  },
  {
    title: "Ações",
    key: "operations",
    width: 70,
    align: "center",
    render: (text, record) => {
      if (security.isSupport() || record.editable) {
        return (
          <Tooltip title={"Alterar relação"}>
            <Button
              type="primary gtm-bt-view-relation"
              onClick={() => record.showModal(record)}
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>
        );
      }

      return (
        <Tooltip title="Alterações devem ser solicitadas para a equipe de suporte NoHarm">
          <Button
            type="primary gtm-bt-view-relation"
            disabled
            ghost
            icon={<EditOutlined />}
          ></Button>
        </Tooltip>
      );
    },
  },
];

export default columns;
