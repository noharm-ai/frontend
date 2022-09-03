import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

const enableSortUsers = (bool, t) => {
  const columns = [];

  return [
    ...columns,
    {
      title: "Id Externo",
      dataIndex: "external",
    },
    {
      title: "Nome",
      dataIndex: "name",
      width: 350,
    },
    {
      title: "Email",
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
      title: "Ações",
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title={t("userAdminForm.userEdit")}>
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
export default enableSortUsers;
