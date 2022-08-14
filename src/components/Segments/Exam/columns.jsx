import React from "react";
//import { sortableHandle } from "react-sortable-hoc";
import { EditOutlined } from "@ant-design/icons";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

const sortDirections = ["descend", "ascend"];

// const DragHandle = sortableHandle(() => (
//   <Icon
//     type="menu"
//     style={{
//       fontSize: 18,
//       color: "#696766",
//       cursor: "pointer",
//     }}
//   />
// ));

const columns = (sortedInfo, enableSortExams) => {
  const columns = [];
  // if (enableSortExams) {
  //   columns.push({
  //     title: "Ordenar",
  //     dataIndex: "order",
  //     align: "center",
  //     render: (text, record) => null,
  //   });
  // }
  return [
    ...columns,
    {
      title: "Tipo",
      dataIndex: "type",
      sortDirections,
      sorter: enableSortExams ? null : (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" && sortedInfo.order,
    },

    {
      title: "Nome",
      dataIndex: "name",
      width: 350,
      sortDirections,
      sorter: enableSortExams ? null : (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
    },
    {
      title: "Rótulo",
      dataIndex: "initials",
      sortDirections,
      sorter: enableSortExams
        ? null
        : (a, b) => a.initials.localeCompare(b.initials),
      sortOrder: sortedInfo.columnKey === "initials" && sortedInfo.order,
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
