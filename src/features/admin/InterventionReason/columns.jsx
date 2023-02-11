import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

const columns = (t, dispatch) => {
  return [
    {
      title: t("labels.reasons"),
      dataIndex: "name",
      render: (entry, record) => {
        return record.parentName
          ? `${record.parentName} - ${record.name}`
          : record.name;
      },
    },
    {
      title: t("labels.status"),
      align: "center",
      render: (entry, record) => {
        return (
          <Tag color={record.active ? "green" : null}>
            {record.active ? t("labels.active") : t("labels.inactive")}
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
          <Tooltip title="Editar motivo">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => dispatch(record.setInterventionReason(record))}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
