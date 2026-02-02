import React from "react";
import { EditOutlined, CloudServerOutlined } from "@ant-design/icons";
import { Space } from "antd";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import IntegrationStatus from "models/IntegrationStatus";
import { formatDate } from "src/utils/date";

const columns = (t, dispatch, setIntegration, setCloudConfigSchema) => {
  const openForm = (record) => {
    dispatch(setIntegration(record));
  };

  const openCloudForm = (record) => {
    dispatch(setCloudConfigSchema(record.schema));
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
      title: "PEP",
      align: "center",
      render: (entry, record) => {
        return record.tp_pep;
      },
    },

    {
      title: "PRESCALC",
      align: "center",
      render: (entry, record) => {
        if (record.tpPrescalc === 0) {
          return (
            <Tag variant="outlined" color="error" style={{ margin: 0 }}>
              DESLIGADO
            </Tag>
          );
        }

        return (
          <Tag variant="outlined" color="success" style={{ margin: 0 }}>
            {record.tpPrescalc === 1 ? "LIGADO (PRD)" : "LIGADO (HML)"}
          </Tag>
        );
      },
    },
    {
      title: "Integração de Retorno",
      align: "center",
      render: (entry, record) => {
        if (record.returnIntegration) {
          return (
            <Tag variant="outlined" color="success" style={{ margin: 0 }}>
              Sim
            </Tag>
          );
        }

        return (
          <Tag variant="outlined" style={{ margin: 0 }}>
            Não
          </Tag>
        );
      },
    },

    {
      title: t("labels.status"),
      align: "center",
      render: (entry, record) => {
        if (record.status === IntegrationStatus.INTEGRATION) {
          return (
            <Tag variant="outlined" color="processing">
              INTEGRAÇÃO
            </Tag>
          );
        }

        if (record.status === IntegrationStatus.PRODUCTION) {
          return (
            <Tag variant="outlined" color="success">
              PRODUÇÃO
            </Tag>
          );
        }

        return (
          <Tag variant="outlined" color="error">
            CANCELADO
          </Tag>
        );
      },
    },
    {
      title: "Criado em",
      align: "center",
      render: (entry, record) => {
        if (record.createdAt) {
          return formatDate(record.createdAt);
        }

        return "--";
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 150,
      align: "center",
      render: (text, record) => {
        return (
          <Space>
            <Tooltip title="Editar">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => openForm(record)}
              ></Button>
            </Tooltip>
            <Tooltip title="Infraestrutura">
              <Button
                type="primary"
                icon={<CloudServerOutlined />}
                onClick={() => openCloudForm(record)}
              ></Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};

export default columns;
