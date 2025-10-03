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

  const OnOffTag = ({ value, name }) => {
    return <Tag color={value ? "success" : "error"}>{name}</Tag>;
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
      title: "Fluxos de Atualização",
      dataIndex: "fl1",
      align: "center",
      render: (entry, record) => {
        return (
          <div>
            <Tooltip title="Atualiza indicadores prescrição por atendimento (CPOE)">
              <span>
                <OnOffTag value={record.fl1} name="FL1" />
              </span>
            </Tooltip>
            <Tooltip title="Atualiza indicadores prescrição por prescrição">
              <span>
                <OnOffTag value={record.fl2} name="FL2" />
              </span>
            </Tooltip>
            <Tooltip title="Atualiza a tabela prescricaoagg">
              <span>
                <OnOffTag value={record.fl3} name="FL3" />
              </span>
            </Tooltip>
            <Tooltip title="Cria prescrições de conciliação para os novos atendimentos">
              <span>
                <OnOffTag value={record.fl4} name="FL4" />
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "PRESCALC",
      align: "center",
      render: (entry, record) => {
        if (record.tpPrescalc === 0) {
          return (
            <Tag color="error" style={{ margin: 0 }}>
              DESLIGADO
            </Tag>
          );
        }

        return (
          <Tag color="success" style={{ margin: 0 }}>
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
            <Tag color="success" style={{ margin: 0 }}>
              Sim
            </Tag>
          );
        }

        return <Tag style={{ margin: 0 }}>Não</Tag>;
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
