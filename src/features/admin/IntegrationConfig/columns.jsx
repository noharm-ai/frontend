import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import IntegrationStatus from "models/IntegrationStatus";

const columns = (t, dispatch, setIntegration) => {
  const openForm = (record) => {
    dispatch(setIntegration(record));
  };

  return [
    {
      title: "Schema",
      dataIndex: "schema",
      render: (entry, record) => {
        return record.schema;
      },
    },
    {
      title: t("labels.status"),
      align: "center",
      render: (entry, record) => {
        if (record.status === IntegrationStatus.INTEGRATION) {
          return <Tag color="processing">INTEGRAÇÃO</Tag>;
        }

        if (record.status === IntegrationStatus.PRODUCTION) {
          return <Tag color="success">PRODUÇÃO</Tag>;
        }

        return <Tag color="error">CANCELADO</Tag>;
      },
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
