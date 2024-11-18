import React from "react";
import { SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "utils/date";
import RegulationRiskTag from "components/RegulationRiskTag";
import RegulationStageTag from "components/RegulationStageTag";

const columns = (t) => {
  return [
    {
      title: "#",
      align: "right",
      width: 80,
      render: (entry, record) => {
        return record.id;
      },
    },
    {
      title: "Solicitado em",
      align: "center",
      render: (entry, record) => {
        return formatDateTime(record.date);
      },
    },
    {
      title: "Tipo",
      align: "left",
      render: (entry, record) => {
        return record.type;
      },
    },
    {
      title: "Nome",
      align: "left",
      render: (entry, record) => {
        return record.name;
      },
    },
    {
      title: "Idade",
      align: "right",
      render: (entry, record) => {
        return record.age;
      },
    },
    {
      title: "Risco",
      align: "center",
      render: (entry, record) => {
        return <RegulationRiskTag risk={record.risk} />;
      },
    },
    {
      title: "Etapa",
      align: "center",
      render: (entry, record) => {
        return <RegulationStageTag stage={record.stage} />;
      },
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Abrir solicitação">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => window.open(`/regulacao/${record.id}`, "_blank")}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
