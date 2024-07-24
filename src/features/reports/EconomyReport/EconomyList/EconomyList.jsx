import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import Big from "big.js";

import InterventionOutcome from "features/intervention/InterventionOutcome/InterventionOutcome";
import { setSelectedIntervention as setSelectedInterventionOutcome } from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";
import { formatCurrency } from "utils/number";
import { formatDate } from "utils/date";
import Button from "components/Button";
import { CardTable } from "components/Table";
import Tooltip from "components/Tooltip";

export default function EconomyList() {
  const dispatch = useDispatch();
  const datasource = useSelector(
    (state) => state.reportsArea.economy.filtered.result.list
  );
  const reportUpdatedAt = useSelector(
    (state) => state.reportsArea.economy.updatedAt
  );

  const columns = [
    {
      title: "ID",
      width: 2,
      fixed: "left",
      align: "center",
      sorter: (a, b) => a.idIntervention - b.idIntervention,
      render: (_, record) => record.idIntervention,
    },
    {
      title: "Economia",
      width: 4,
      fixed: "left",
      align: "right",
      sorter: (a, b) =>
        a.processed.economyValue.minus(b.processed.economyValue),
      render: (_, record) =>
        `R$ ${formatCurrency(record.processed.economyValue, 2)}`,
    },
    {
      title: "#Atendimento",
      width: 4,
      align: "center",
      render: (_, record) => record.admissionNumber,
    },
    {
      title: "Dias Economia",
      width: 4,
      align: "right",
      sorter: (a, b) => a.processed.economyDays - b.processed.economyDays,
      render: (_, record) => record.processed.economyDays,
    },
    {
      title: "Vl. Economia/Dia",
      width: 4,
      align: "right",
      sorter: (a, b) =>
        parseFloat(a.economyDayValue) - parseFloat(b.economyDayValue),
      render: (_, record) => `R$ ${formatCurrency(record.economyDayValue, 2)}`,
    },
    {
      title: "Data Inicial",
      width: 5,
      sorter: (a, b) =>
        a.processed.iniEconomyDate < b.processed.iniEconomyDate
          ? -1
          : a.processed.iniEconomyDate > b.processed.iniEconomyDate
          ? 1
          : 0,
      render: (_, record) => formatDate(record.processed.iniEconomyDate),
    },
    {
      title: "Data Final",
      width: 5,
      sorter: (a, b) =>
        a.processed.endEconomyDate < b.processed.endEconomyDate
          ? -1
          : a.processed.endEconomyDate > b.processed.endEconomyDate
          ? 1
          : 0,
      render: (_, record) => formatDate(record.processed.endEconomyDate),
    },
    {
      title: "Tipo Economia",
      width: 5,
      render: (_, record) => record.economyTypeDescription,
    },
    {
      title: "Situação",
      width: 5,
      render: (_, record) => record.statusDescription,
    },
    {
      title: "Economia Manual",
      width: 5,
      render: (_, record) => (record.economyDayValueManual ? "Sim" : "Não"),
    },
    {
      title: "Motivo",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.interventionReason,
    },
    {
      title: "Medicamento Origem",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.originDrug,
    },
    {
      title: "Medicamento Substituto",
      width: 10,
      ellipsis: true,
      render: (_, record) => {
        if (record.economyType === 2) {
          return record.destinyDrug;
        }

        return "--";
      },
    },
    {
      title: "Responsável",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.responsible,
    },
    {
      title: "Segmento",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.segment,
    },
    {
      title: "Setor",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.department,
    },
    {
      title: "Convênio",
      width: 10,
      ellipsis: true,
      render: (_, record) => record.insurance,
    },
    {
      title: "",
      width: 2,
      fixed: "right",
      render: (_, record) => {
        return (
          <Tooltip title="Ver detalhes">
            <Button
              icon={<SearchOutlined />}
              onClick={() =>
                dispatch(
                  setSelectedInterventionOutcome({
                    open: true,
                    idIntervention: record.idIntervention,
                    outcome: "s",
                    view: true,
                    editAlert: true,
                    reportUpdatedAt,
                  })
                )
              }
            ></Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <CardTable
        bordered
        virtual
        columns={columns}
        scroll={{
          x: 5000,
          y: 800,
        }}
        rowKey="idIntervention"
        dataSource={datasource.length === 0 ? [] : datasource}
        pagination={false}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        summary={(pageData) => {
          let totalEconomy = Big(0);
          let daysEconomy = Big(0);

          pageData.forEach((record) => {
            totalEconomy = totalEconomy.plus(
              Big(record.processed.economyValue || 0)
            );
            daysEconomy = daysEconomy.plus(record.processed.economyDays || 0);
          });
          return (
            <CardTable.Summary fixed>
              <CardTable.Summary.Row>
                <CardTable.Summary.Cell index={0}>Total</CardTable.Summary.Cell>
                <CardTable.Summary.Cell index={1} align="right">
                  {`R$ ${formatCurrency(totalEconomy, 2)}`}
                </CardTable.Summary.Cell>
                <CardTable.Summary.Cell
                  index={2}
                  align="right"
                ></CardTable.Summary.Cell>
                <CardTable.Summary.Cell index={3} align="right">
                  {daysEconomy.toString()}
                </CardTable.Summary.Cell>
              </CardTable.Summary.Row>
            </CardTable.Summary>
          );
        }}
      />
      <InterventionOutcome />
    </>
  );
}
