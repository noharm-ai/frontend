import React from "react";
import {
  SearchOutlined,
  LoadingOutlined,
  CheckSquareOutlined,
  BorderOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { formatDateTime } from "utils/date";
import RegulationRiskTag from "components/RegulationRiskTag";
import RegulationStageTag from "components/RegulationStageTag";
import { RegulationScoreTag } from "src/components/RegulationScoreTag";

const columns = (t, bag) => {
  return [
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
        if (record.type && record.idRegSolicitationType) {
          return `${record.type}`;
        }

        return record.idRegSolicitationType;
      },
    },
    {
      title: "Nome",
      align: "left",
      render: (entry, record) => {
        if (record.patientNameLoading) {
          return (
            <>
              <LoadingOutlined /> {`Paciente ${record.idPatient}`}
            </>
          );
        }
        return record.patientName;
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
      title: "Escore Global",
      align: "center",
      render: (entry, record) => {
        return <RegulationScoreTag score={record.globalScore} />;
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
      title: () => {
        if (bag.selectedRowsActive) {
          return (
            <Button
              type={"default"}
              onClick={() => {
                bag.selectAllRows();
              }}
              icon={
                bag.isAllSelected ? (
                  <CheckSquareOutlined style={{ fontSize: 16 }} />
                ) : (
                  <BorderOutlined style={{ fontSize: 16 }} />
                )
              }
            ></Button>
          );
        }

        return t("tableHeader.action");
      },
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        if (bag.selectedRowsActive) {
          const selected = bag.selectedRows.indexOf(record.id) !== -1;
          return (
            <Tooltip title={selected ? null : "Selecionar"}>
              <Button
                type={selected ? "primary" : "default"}
                onClick={() => {
                  bag.dispatch(bag.toggleSelectedRows(record.id));
                }}
                icon={
                  selected ? (
                    <CheckSquareOutlined style={{ fontSize: 16 }} />
                  ) : (
                    <BorderOutlined style={{ fontSize: 16 }} />
                  )
                }
              ></Button>
            </Tooltip>
          );
        }

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
