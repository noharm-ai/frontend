import React from "react";
import { EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import IntegrationStatus from "models/IntegrationStatus";

const OnOffTag = ({ value, name }) => {
  return <Tag color={value ? "success" : "error"}>{name}</Tag>;
};

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
      title: "NoHarm Care",
      dataIndex: "fl1",
      align: "center",
      render: (entry, record) => {
        if (record.nhCare === 0) {
          return <Tag color="error">Desativado</Tag>;
        }

        return (
          <Tag color={record.nhCare === 1 ? "warning" : "success"}>
            {record.nhCare === 1 ? "Ativo (Legado)" : "Ativo"}
          </Tag>
        );
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
