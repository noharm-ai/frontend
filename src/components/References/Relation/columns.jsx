import React from "react";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";

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
    render: (entry, record) => (
      <Tag color={record.active ? "green" : null}>
        {record.active ? "Ativo" : "Inativo"}
      </Tag>
    ),
  },
];

export default columns;
