import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

const columns = (t, dispatch, setUser) => {
  const openForm = (record) => {
    dispatch(setUser(record));
  };

  return [
    {
      title: "Id Externo",
      dataIndex: "external",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Nome",
      dataIndex: "name",
      align: "left",
      width: 350,
    },
    {
      title: "Email",
      align: "left",
      dataIndex: "email",
    },
    {
      title: "Situação",
      render: (entry, record) => (
        <Tag color={record.active ? "green" : null}>
          {record.active
            ? t("userAdminForm.active")
            : t("userAdminForm.inactive")}
        </Tag>
      ),
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Editar">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openForm(record)}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
